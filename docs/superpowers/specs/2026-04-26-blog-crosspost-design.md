# Blog cross-post: RSS + dev.to

**Date:** 2026-04-26
**Status:** Approved (brainstorm)
**Owner:** hoa@oneqode.com

## Goal

When a non-draft post is added to `packages/content/markdown/blog/*.md` and shipped to production via `master`:

1. `https://hoatrinh.dev/rss.xml` updates as part of the prerender. daily.dev (registered once as a Source pointed at this feed) ingests it on its next crawl.
2. A GitHub Actions step republishes new or changed posts to dev.to via the Articles API, with `canonical_url` pointing back to hoatrinh.dev. No manual approval, no per-post action.

## Non-goals

- Hashnode, Bluesky, Mastodon, Telegram fanout. Not generalized into a plugin system either; one publisher = one file.
- Webmentions / IndieWeb.
- Auto-deletion on dev.to when a post is later marked `crosspost: false`. Manual removal on dev.to is fine; the script will not re-create it because the source-side filter excludes opt-out posts.
- Adapting the terminal UI to display `tags[]`. Existing `tag` field still drives the in-site category.

## Architecture

```
packages/content/src/blog.ts        existing; emits BlogPost[]
   |
   |--> apps/web/scripts/build-rss.ts        (new)
   |       writes apps/web/dist/rss.xml as part of prerender
   |
   `--> scripts/crosspost-devto.ts           (new)
           reads getBlogPosts(), filters draft + crosspost:false,
           reconciles against GET /articles/me/all,
           POST or PUT per post.
```

Four small units, each with one purpose:

- `build-rss.ts` — pure function from `BlogPost[]` to RSS XML. Knows nothing about dev.to.
- `prerender.ts` — wires `build-rss.ts` into the existing static build. Knows nothing about workflows.
- `crosspost-devto.ts` — pure planning core (`computePlan`) plus a thin IO shell. Knows nothing about RSS.
- `.github/workflows/ci.yml` — knows how to invoke the publisher with the right secrets and gating, nothing more.

## Frontmatter additions

`packages/content/src/schema.ts` — three new optional fields, all backwards-compatible:

```ts
BlogPostFrontmatter {
  // existing
  slug, title, date, excerpt, tag, draft?, readingTime?

  // new
  cover?: string         // absolute URL or site-relative path; main_image / RSS enclosure
  tags?: string[]        // max 4; defaults to [tag] when absent (dev.to-specific)
  crosspost?: boolean    // default true; set false to skip cross-posting this post
}
```

Schema validation:

- `tags` array: max length 4, each entry lowercase and <= 30 chars (dev.to constraints). Throws at load time on violation, matching existing schema discipline.
- `cover`: if site-relative (begins with `/`), absolutized to `${SITE_URL}${cover}` at consumption time, not at validation time.
- `crosspost`: defaults to `true` for non-drafts; drafts are always excluded regardless.

## RSS feed

`apps/web/scripts/build-rss.ts`:

- Pure function `renderRss(posts: BlogPost[], siteUrl: string): string`.
- Emits valid RSS 2.0 with `xmlns:content` for full-text.
- Includes only non-draft posts (drafts are already filtered out of `getBlogPosts()`).
- Per item:
  - `<title>` = `title`
  - `<link>` and `<guid isPermaLink="true">` = `${siteUrl}/blog/${slug}`
  - `<pubDate>` = RFC 822 derived from `date` at `00:00 UTC`
  - `<description>` = `excerpt`
  - `<content:encoded>` = full rendered `bodyHtml` (CDATA-wrapped)
  - `<enclosure>` = absolutized `cover` if present, with `type="image/*"` inferred from extension
- Channel-level: `<title>`, `<link>`, `<description>`, `<lastBuildDate>`, `<atom:link rel="self" href="${siteUrl}/rss.xml" />`.

Wired into the existing prerender:

- `apps/web/scripts/prerender.ts` calls `renderRss(posts, siteUrl)` once and writes `apps/web/dist/rss.xml`. `shell.ts` is unchanged.
- `apps/web/index.html` (or the SSR shell) gains `<link rel="alternate" type="application/rss+xml" title="hoatrinh.dev blog" href="/rss.xml">`.

Why full content in `<content:encoded>` while `<description>` stays the excerpt: daily.dev (and Feedly-class readers) render the long form when present; aggregators that only read `<description>` still get a clean teaser.

## dev.to publisher

`scripts/crosspost-devto.ts`:

```
1. posts = getBlogPosts().filter(p => p.crosspost !== false)
   // drafts are already excluded by the loader in packages/content/src/blog.ts.

2. existing = GET https://dev.to/api/articles/me/all?per_page=1000
   existingByCanonical = Map<string, DevtoArticle> keyed by article.canonical_url

3. plan: Action[] = computePlan(posts, existingByCanonical, siteUrl)

4. if --dry-run: print the plan and exit 0.
   else for each action in plan, sequentially:
     - create:    POST   /api/articles    { article: payload }
     - update:    PUT    /api/articles/{id} { article: payload }
     - skip:      no-op
     ~1s pacing between requests.

5. print summary table; exit 1 if any create/update failed.
```

A `--dry-run` flag is a first-class part of the publisher so the first run on an existing repo (which would otherwise create every old post on dev.to) can be inspected first. CI does not pass it; it exists for local invocation.

`computePlan` (pure, unit-tested):

```
For each post:
  canonical = `${siteUrl}/blog/${slug}`
  payload = {
    title,
    body_markdown: <raw markdown body, frontmatter stripped>,
    canonical_url: canonical,
    published: true,
    main_image: cover ? absolutize(cover, siteUrl) : null,
    tags: (tags ?? [tag]).slice(0, 4),
    description: excerpt,
  }
  hash = sha256(stableStringify(payload))

  existing = existingByCanonical.get(canonical)
  if !existing                        -> { kind: 'create', payload }
  else if hash(existing.normalized) !== hash -> { kind: 'update', id: existing.id, payload }
  else                                 -> { kind: 'skip' }
```

`existing.normalized` is built from the dev.to article fields that round-trip our payload: `title`, `body_markdown`, `canonical_url`, `main_image`, sorted `tag_list`, `description`. The hash comparison avoids a PUT on every run when nothing changed.

Body source is the **raw markdown body** (everything after the YAML frontmatter), not our shiki-rendered HTML. dev.to has its own renderer and prefers markdown.

Concurrency / rate limits: sequential, ~1s between writes. dev.to permits ~30 article writes per 30s; weekly cadence is comfortably under.

## Workflow

`.github/workflows/ci.yml`, new job appended after `deploy_production`:

```yaml
crosspost:
  if: github.event_name == 'push' && github.ref == 'refs/heads/master'
  needs: [deploy_production]
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: oven-sh/setup-bun@v2
      with: { bun-version: latest }
    - run: bun install --frozen-lockfile
    - run: bun run crosspost:devto
      env:
        DEV_TO_API_KEY: ${{ secrets.DEV_TO_API_KEY }}
        SITE_URL: ${{ vars.SITE_URL || 'https://hoatrinh.dev' }}
```

Root `package.json` gets a new script: `"crosspost:devto": "bun scripts/crosspost-devto.ts"`.

`needs: [deploy_production]` ensures the canonical URL is live before dev.to sees it.

## Secrets and configuration

- `DEV_TO_API_KEY` — GitHub Actions secret. Generated once at https://dev.to/settings/extensions.
- `SITE_URL` — existing repo variable. Used to build canonical URLs and absolutize cover paths.
- daily.dev needs no secret. **One-time manual step:** register `https://hoatrinh.dev/rss.xml` as a Source via daily.dev's "Suggest new source" form. Tracked as a checklist item in the implementation plan.

## Error handling

System-boundary only:

- HTTP non-2xx from dev.to on a write: log status + body, mark that post as failed, continue to the next, exit 1 at end. No in-run retry; the next workflow run is the retry, and the canonical-URL match makes it idempotent.
- `GET /articles/me/all` failure: fail fast with the raw error. We do not "fall back to creating duplicates."
- Schema violations in markdown frontmatter throw at load time. Existing contract, no new handling.

## Testing

- `packages/content`: extend schema tests for the three new fields - defaults, tag count cap, lowercase enforcement.
- `apps/web`: vitest unit test for `renderRss(posts, siteUrl)` against a fixture of 2-3 posts. Parse with `fast-xml-parser` and assert structural invariants (channel metadata, item count, content:encoded presence, enclosure when `cover` set).
- `scripts/crosspost-devto.ts`:
  - Unit-test `computePlan` against fixtures: new post, unchanged post, body-changed post, opt-out post, draft post (excluded), multi-tag post, post with cover.
  - The IO shell is exercised manually once against dev.to with a throwaway draft, then left to CI.
- E2E: existing Playwright suite gains one assertion that `/rss.xml` returns 200 with `application/xml` (or `application/rss+xml`) and contains the latest post's slug.

## Implementation order (high level, plan will refine)

1. Schema additions + content tests.
2. `build-rss.ts` + prerender wiring + e2e assertion.
3. `crosspost-devto.ts` (`computePlan` first with full unit tests, then IO shell).
4. CI job + secret setup.
5. Manual: register RSS feed on daily.dev, smoke-test dev.to publish on next post.

## Risks

- **dev.to API drift:** the Articles API is stable but undocumented edge cases exist (e.g. tag normalization, image URL requirements). Mitigation: the planner is pure and unit-testable; only the IO shell talks to dev.to, so failures are isolated and easy to inspect.
- **First-run blast:** the first time the workflow runs after merge, every existing non-draft post will be created on dev.to. Mitigations: set `crosspost: false` on older posts before merging, and/or run `bun run crosspost:devto -- --dry-run` locally first to inspect the plan.
- **RSS character encoding:** post bodies contain code blocks and shell snippets. CDATA-wrap `content:encoded` and ensure `&`, `<`, `>` are properly escaped in non-CDATA fields.
