# AI fetch support - design

Status: approved via `/superpowers:brainstorming` on 2026-05-01.
Scope: improve AI-facing crawl and extraction support across hoatrinh.dev, with blog posts treated as the highest-priority content and the whole change kept inside one implementation plan.

## Goal

Improve how AI crawlers, answer engines, and fetch-based readers discover and understand hoatrinh.dev by shipping a small, shared discovery layer for every prerendered route and a richer article treatment for blog posts. The result should make the site easier to crawl site-wide while making `/blog` and `/post/<slug>` the clearest, most reliable surfaces for extraction, citation, and summary generation.

## Non-Goals

- Building a separate AI-only API, feed, or alternate rendering stack.
- Reworking the terminal routing model or changing how commands map to URLs.
- Adding search, recommendations, related posts, or pagination.
- Generating custom OG images or introducing a social-sharing feature set.
- Adding a generalized SEO plugin system for future unknown metadata needs.
- Retrofitting structured data onto every route type; blog posts are the only structured-data target in this scope.

## Context

The current prerender flow already produces static HTML for every route from `apps/web/src/entry-server.tsx` and writes `sitemap.xml`, `rss.xml`, and HTML files from `apps/web/scripts/prerender.ts`. Route metadata is thin today: `RouteDef` only carries `path`, `title`, and `description`, and `apps/web/scripts/shell.ts` injects a minimal head set (`title`, `description`, `og:title`, `og:description`, `og:url`, `og:type=website`, canonical). That is enough for basic sharing, but not enough to consistently describe article pages or drive a single source of truth for crawl-facing metadata.

Blog posts already have the strongest content model in the repo. `packages/content/src/blog.ts` loads markdown posts, filters drafts, computes reading time, and exposes prerenderable `/post/<slug>` routes. `apps/web/src/components/blocks/PostBlock/PostBlock.tsx` already uses an outer `<article>`, but the inner structure is still presentation-first: the title, date, and body are not exposed with stronger article semantics such as `<header>`, `<time datetime>`, or article-specific head metadata. The repo also does not currently publish a root `robots.txt` or `llms.txt` file.

## Proposed Architecture

### 1. Centralize route metadata into one shared pipeline

Replace the current low-detail `RouteDef` contract with a richer route metadata shape used by both prerendering and head generation. Each route record should continue to identify the path, but also carry the canonical URL inputs and page classification needed for AI-facing output.

Recommended shape:

```ts
type RouteMeta = {
  path: string;
  title: string;
  description: string;
  kind: 'page' | 'article';
  canonicalUrl: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
};
```

`apps/web/src/entry-server.tsx` becomes the source of truth for this data because it already knows every route that will be prerendered. `apps/web/scripts/prerender.ts` should consume `RouteMeta[]` once, then use it for three outputs: page HTML, sitemap rows, and discovery artifacts. `apps/web/scripts/shell.ts` should stop inferring a generic website-only head and instead render tags from `RouteMeta`, including article tags when `kind === 'article'`.

This keeps one metadata source instead of scattering logic across the page shell, sitemap writer, and blog block components.

### 2. Keep discovery artifacts static, explicit, and rooted at `/`

Add three crawl-facing root files, all generated or copied during the existing web build/prerender flow:

- `robots.txt` — allow public crawling, point crawlers to the canonical sitemap, and avoid introducing bot-specific carve-outs. The content should be deliberately simple:

  ```txt
  User-agent: *
  Allow: /

  Sitemap: https://hoatrinh.dev/sitemap.xml
  ```

- `sitemap.xml` — continue generating this during prerender, but upgrade each URL entry to come from shared route metadata and include `<lastmod>` for blog post URLs using the post date. Non-blog routes can omit `lastmod` rather than inventing unstable values.
- `llms.txt` — publish a short, hand-authored root file that explains what the site is, where the best extractable content lives, and which URLs are most useful to fetch first. It should explicitly prioritize `/blog` and `/post/<slug>` pages over the terminal shell itself.

`llms.txt` should stay intentionally small and stable rather than trying to mirror the entire site. It is guidance, not a second sitemap.

### 3. Make blog pages first-class articles in both HTML and head metadata

Blog-first priority means post pages should be the only route type that gets the full article treatment.

For `/post/<slug>` pages:

- Keep the existing terminal visual treatment, but strengthen the semantic structure inside `PostBlock` to use article-oriented elements: `<article>`, `<header>`, `<h1>`, `<time datetime>`, content container, and `<footer>`.
- Emit article-specific head tags from the shared metadata pipeline:
  - `og:type=article`
  - canonical URL
  - standard description/title tags
  - `article:published_time`
  - `article:section` from the existing blog `tag`
- Optionally emit JSON-LD `BlogPosting` for post pages only. In this scope, "optional" means implemented behind a narrow condition: if the page is a blog post and has canonical URL, title, description, and publish date, emit one `application/ld+json` block. No schema expansion beyond that.

For `/blog` pages:

- Treat the listing page as an index page, not an article.
- Improve metadata so it clearly describes the page as the canonical entry point for writing on the site.
- Keep the visible UI unchanged except where semantic list/link structure already helps extraction.

The rationale is simple: AI fetchers do better when the machine-readable head agrees with the visible page structure. Post pages should therefore say "article" everywhere that matters, while the rest of the site remains lightweight.

### 4. Reuse existing content fields; do not widen the blog schema for this work

No new frontmatter is needed. Existing blog fields already cover the metadata this project needs:

- `title` -> document and article title
- `excerpt` -> meta description
- `date` -> publish date / `lastmod`
- `tag` -> article section
- `slug` -> canonical URL path

That keeps the project inside one implementation plan and avoids mixing AI discoverability work with content-model expansion.

### 5. Add verification as a product requirement, not an afterthought

This work should ship with explicit verification checks that fail when crawl-facing output regresses. The most reliable approach in this repo is a combination of targeted unit tests and a post-prerender verification script.

Recommended verification coverage:

- unit tests for route metadata generation and shell/head tag rendering
- unit tests for sitemap, `robots.txt`, and `llms.txt` writers
- one verification script that inspects built files under `apps/web/dist/` and asserts:
  - `robots.txt` exists and references `sitemap.xml`
  - `sitemap.xml` contains `/blog` and at least one `/post/` URL
  - `llms.txt` exists at the dist root and mentions blog-first guidance
  - a prerendered post HTML file contains canonical, description, Open Graph article tags, and article markup
  - if JSON-LD is enabled for posts, the built HTML contains exactly one `BlogPosting` block

The verification script should run after `bun run prerender`, locally and in CI, so this behavior remains observable.

## Files To Change

Modified:

- `apps/web/src/entry-server.tsx` — replace `RouteDef` with richer route metadata and classify post routes as articles.
- `apps/web/scripts/prerender.ts` — generate HTML, sitemap, `robots.txt`, and `llms.txt` from shared metadata.
- `apps/web/scripts/shell.ts` — render shared head tags plus article-specific tags when applicable.
- `apps/web/src/components/blocks/PostBlock/PostBlock.tsx` — strengthen blog post semantics without changing the visual design.
- `apps/web/tests/e2e/blog.spec.ts` — extend coverage for built blog extraction surfaces.
- `apps/web/index.html` — only if needed to keep static root-level discovery links aligned with the new metadata output.

New:

- `apps/web/scripts/build-robots.ts` — pure `robots.txt` renderer.
- `apps/web/scripts/build-llms.ts` — pure `llms.txt` renderer.
- `apps/web/scripts/verify-ai-fetch.ts` — post-prerender verification checks.
- `apps/web/scripts/build-robots.test.ts` — unit coverage for `robots.txt` output.
- `apps/web/scripts/build-llms.test.ts` — unit coverage for `llms.txt` output.
- `apps/web/scripts/verify-ai-fetch.test.ts` or equivalent focused tests for the verification helper behavior.

No content-package schema files need to change.

## Testing Strategy

- Extend unit coverage around the shared metadata pipeline so route records for `/`, `/blog`, and `/post/<slug>` produce the expected `kind`, canonical URL, and description values.
- Add unit tests for `shell.ts` to assert generic routes render `og:type=website`, while blog post routes render `og:type=article`, canonical, and `article:published_time`.
- Add unit tests for `build-robots.ts` and `build-llms.ts` to lock exact output.
- Update sitemap tests so blog post routes include `<lastmod>` and non-article pages do not fabricate it.
- Extend Playwright coverage to fetch a prerendered post page and assert the returned HTML includes canonical and article-oriented tags, not just visible content.
- Run the verification script after prerender in the normal validation flow so a missing root artifact or weak blog metadata fails fast before merge.

## Risks And Mitigations

- **Risk: metadata drift between visible pages and head tags.** If route metadata and page rendering evolve separately, blog pages can claim to be articles in the head while the DOM stays generic. **Mitigation:** make `RouteMeta` the only source of crawl-facing metadata and test both shell output and prerendered HTML.
- **Risk: over-scoping into a general SEO framework.** A broad metadata system could turn this into a long platform project. **Mitigation:** keep the contract narrow, only support the fields required by current routes, and reserve structured data for blog posts only.
- **Risk: `llms.txt` becomes noisy or redundant.** Overloading it with every route and policy note would make it less useful to fetchers. **Mitigation:** keep it short, descriptive, and explicitly blog-first.
- **Risk: false confidence from unit tests alone.** Head-generation tests can pass while generated dist files are missing or malformed. **Mitigation:** add one post-prerender verification pass over real build output and run it in CI.

## Decision Summary

- Use one shared route metadata pipeline for prerender, sitemap generation, and head tags.
- Add root-level `robots.txt` and `llms.txt` alongside the existing `sitemap.xml`.
- Keep `robots.txt` permissive and simple; let `sitemap.xml` and `llms.txt` do the guidance work.
- Keep blog-first priority by making `/post/<slug>` pages the only article-class routes.
- Strengthen post pages with semantic article markup and article-specific head metadata.
- Support JSON-LD only for blog posts, and only with the minimal `BlogPosting` shape already supported by existing content fields.
- Avoid any schema or routing expansion so the work fits inside a single implementation plan.
- Treat verification checks as part of the feature, not follow-up cleanup.
