# Blog cross-post Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Auto-publish each new non-draft blog post to (1) `/rss.xml` for daily.dev ingestion and (2) dev.to via the Articles API with a canonical URL back to hoatrinh.dev, triggered by `master` deploys.

**Architecture:** Three pieces. (1) Three new optional frontmatter fields (`cover`, `tags`, `crosspost`). (2) A pure `renderRss(posts, siteUrl)` wired into the existing prerender. (3) A `apps/web/scripts/crosspost-devto/` directory with a pure `computePlan` core and a thin IO shell, run as a new CI job after `deploy_production` on push to `master`. Idempotency is stateless: the planner reconciles posts against `GET /articles/me/all` keyed by `canonical_url`.

**Tech Stack:** Bun, TypeScript (strict), Zod, Vite SSR prerender, vitest, Playwright, GitHub Actions, dev.to REST API.

**Spec:** `docs/superpowers/specs/2026-04-26-blog-crosspost-design.md`

---

## Task 1: Add `cover`, `tags`, `crosspost` to BlogPost frontmatter

**Files:**
- Modify: `packages/content/src/schema.ts:52-65`
- Create: `packages/content/markdown/__fixtures__/blog/with-cover-and-tags.md`
- Create: `packages/content/markdown/__fixtures__/blog/tags-overflow.md`
- Create: `packages/content/markdown/__fixtures__/blog/tags-uppercase.md`
- Create: `packages/content/markdown/__fixtures__/blog/crosspost-false.md`
- Modify: `packages/content/src/blog.test.ts`

- [ ] **Step 1: Write failing fixtures + tests for the three new fields**

Create `packages/content/markdown/__fixtures__/blog/with-cover-and-tags.md`:

```markdown
---
slug: with-cover-and-tags
title: Post with cover and multi-tag
date: 2026-04-10
excerpt: Shows the new optional frontmatter.
tag: test
tags: [test, devops, automation, web]
cover: /images/blog/with-cover-and-tags.png
---

Body that has plenty of words to compute reading time of at least one minute.
```

Create `packages/content/markdown/__fixtures__/blog/tags-overflow.md`:

```markdown
---
slug: tags-overflow
title: Too many tags
date: 2026-04-11
excerpt: This post has five tags which exceeds the dev.to cap.
tag: test
tags: [a, b, c, d, e]
---

Body.
```

Create `packages/content/markdown/__fixtures__/blog/tags-uppercase.md`:

```markdown
---
slug: tags-uppercase
title: Uppercase tag
date: 2026-04-12
excerpt: Uppercase tags should fail validation.
tag: test
tags: [Test]
---

Body.
```

Create `packages/content/markdown/__fixtures__/blog/crosspost-false.md`:

```markdown
---
slug: crosspost-false
title: Opt-out post
date: 2026-04-13
excerpt: This post opts out of cross-posting.
tag: test
crosspost: false
---

Body.
```

Append to `packages/content/src/blog.test.ts` inside the existing `__loadBlogFromRawFiles` describe block:

```ts
  it('parses optional cover, tags, and crosspost fields', async () => {
    const raw = await loadBlogFixture('with-cover-and-tags.md');
    const posts = await __loadBlogFromRawFiles({ 'with-cover-and-tags.md': raw });
    expect(posts).toHaveLength(1);
    const post = posts[0]!;
    expect(post.cover).toBe('/images/blog/with-cover-and-tags.png');
    expect(post.tags).toEqual(['test', 'devops', 'automation', 'web']);
    expect(post.crosspost).toBeUndefined();
  });

  it('rejects more than 4 tags', async () => {
    const raw = await loadBlogFixture('tags-overflow.md');
    await expect(__loadBlogFromRawFiles({ 'tags-overflow.md': raw })).rejects.toThrow(
      /frontmatter validation failed/,
    );
  });

  it('rejects uppercase tags', async () => {
    const raw = await loadBlogFixture('tags-uppercase.md');
    await expect(__loadBlogFromRawFiles({ 'tags-uppercase.md': raw })).rejects.toThrow(
      /frontmatter validation failed/,
    );
  });

  it('parses crosspost: false', async () => {
    const raw = await loadBlogFixture('crosspost-false.md');
    const posts = await __loadBlogFromRawFiles({ 'crosspost-false.md': raw });
    expect(posts[0]?.crosspost).toBe(false);
  });
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
bun run --filter @hoatrinh/content test
```

Expected: 4 new failures (schema does not yet know about the new fields).

- [ ] **Step 3: Extend the schema**

Replace lines 52-65 of `packages/content/src/schema.ts` with:

```ts
export const BlogPostFrontmatter = z.object({
  slug: z.string().regex(/^[a-z0-9][a-z0-9-]*$/),
  title: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  excerpt: z.string().min(1).max(160),
  tag: z.string().regex(/^[a-z0-9][a-z0-9-]*$/),
  readingTime: z.number().int().positive().optional(),
  draft: z.boolean().optional(),
  cover: z.string().min(1).optional(),
  tags: z
    .array(z.string().regex(/^[a-z0-9][a-z0-9-]{0,29}$/))
    .max(4)
    .optional(),
  crosspost: z.boolean().optional(),
});
export type BlogPostMeta = z.infer<typeof BlogPostFrontmatter>;
export type BlogPost = BlogPostMeta & {
  bodyHtml: string;
  readingTime: number;
};
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
bun run --filter @hoatrinh/content test
bun run typecheck
```

Expected: all blog tests pass; typecheck clean.

- [ ] **Step 5: Commit**

```bash
git add packages/content/src/schema.ts packages/content/src/blog.test.ts packages/content/markdown/__fixtures__/blog/
git commit -m "feat(content): add cover, tags, crosspost frontmatter fields"
```

---

## Task 2: Pure RSS renderer

**Files:**
- Create: `apps/web/scripts/build-rss.ts`
- Create: `apps/web/scripts/build-rss.test.ts`

- [ ] **Step 1: Write the failing test**

Create `apps/web/scripts/build-rss.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import type { BlogPost } from '@hoatrinh/content';
import { renderRss } from './build-rss';

const SITE = 'https://hoatrinh.dev';

function fixturePost(over: Partial<BlogPost> = {}): BlogPost {
  return {
    slug: 'sample',
    title: 'A sample post',
    date: '2026-04-20',
    excerpt: 'Excerpt.',
    tag: 'test',
    bodyHtml: '<p>Hello & welcome.</p>',
    readingTime: 1,
    ...over,
  } as BlogPost;
}

describe('renderRss', () => {
  it('renders an RSS 2.0 feed with channel metadata', () => {
    const xml = renderRss([fixturePost()], SITE);
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('<rss version="2.0"');
    expect(xml).toContain('xmlns:content="http://purl.org/rss/1.0/modules/content/"');
    expect(xml).toContain('xmlns:atom="http://www.w3.org/2005/Atom"');
    expect(xml).toContain(`<atom:link href="${SITE}/rss.xml" rel="self" type="application/rss+xml" />`);
    expect(xml).toContain('<title>hoatrinh.dev blog</title>');
  });

  it('emits one <item> per post with link, guid, pubDate, description, content:encoded', () => {
    const xml = renderRss([fixturePost()], SITE);
    expect(xml).toContain(`<link>${SITE}/blog/sample</link>`);
    expect(xml).toContain(`<guid isPermaLink="true">${SITE}/blog/sample</guid>`);
    expect(xml).toMatch(/<pubDate>Mon, 20 Apr 2026 00:00:00 GMT<\/pubDate>/);
    expect(xml).toContain('<description>Excerpt.</description>');
    expect(xml).toContain('<content:encoded><![CDATA[<p>Hello & welcome.</p>]]></content:encoded>');
  });

  it('emits <enclosure> when cover is set, absolutizing site-relative paths', () => {
    const xml = renderRss(
      [fixturePost({ cover: '/images/blog/cover.png' })],
      SITE,
    );
    expect(xml).toContain(
      `<enclosure url="${SITE}/images/blog/cover.png" type="image/png" length="0" />`,
    );
  });

  it('passes absolute cover URLs through unchanged', () => {
    const xml = renderRss(
      [fixturePost({ cover: 'https://cdn.example.com/x.jpg' })],
      SITE,
    );
    expect(xml).toContain(
      '<enclosure url="https://cdn.example.com/x.jpg" type="image/jpeg" length="0" />',
    );
  });

  it('escapes special chars in title, excerpt, and link', () => {
    const xml = renderRss(
      [fixturePost({ title: 'A & B < C', excerpt: 'x > y "z"' })],
      SITE,
    );
    expect(xml).toContain('<title>A &amp; B &lt; C</title>');
    expect(xml).toContain('<description>x &gt; y &quot;z&quot;</description>');
  });

  it('orders items by date descending', () => {
    const xml = renderRss(
      [
        fixturePost({ slug: 'older', date: '2026-04-01' }),
        fixturePost({ slug: 'newer', date: '2026-04-25' }),
      ],
      SITE,
    );
    const olderIdx = xml.indexOf('/blog/older');
    const newerIdx = xml.indexOf('/blog/newer');
    expect(newerIdx).toBeLessThan(olderIdx);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
bun run --filter @hoatrinh/web test
```

Expected: the new test file fails with "Cannot find module './build-rss'".

- [ ] **Step 3: Implement renderRss**

Create `apps/web/scripts/build-rss.ts`:

```ts
import type { BlogPost } from '@hoatrinh/content';

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
};

function escapeXml(s: string): string {
  return s.replace(/[&<>"]/g, (c) => HTML_ESCAPES[c] ?? c);
}

function rfc822(dateYmd: string): string {
  return new Date(`${dateYmd}T00:00:00Z`).toUTCString();
}

function imageMime(url: string): string {
  const ext = url.split('?')[0]!.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  if (ext === 'png') return 'image/png';
  if (ext === 'gif') return 'image/gif';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'svg') return 'image/svg+xml';
  return 'application/octet-stream';
}

function absolutize(url: string, siteUrl: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${siteUrl}${url.startsWith('/') ? '' : '/'}${url}`;
}

function renderItem(post: BlogPost, siteUrl: string): string {
  const link = `${siteUrl}/blog/${post.slug}`;
  const enclosure = post.cover
    ? `      <enclosure url="${escapeXml(absolutize(post.cover, siteUrl))}" type="${imageMime(post.cover)}" length="0" />\n`
    : '';
  return [
    '    <item>',
    `      <title>${escapeXml(post.title)}</title>`,
    `      <link>${link}</link>`,
    `      <guid isPermaLink="true">${link}</guid>`,
    `      <pubDate>${rfc822(post.date)}</pubDate>`,
    `      <description>${escapeXml(post.excerpt)}</description>`,
    enclosure.trimEnd(),
    `      <content:encoded><![CDATA[${post.bodyHtml}]]></content:encoded>`,
    '    </item>',
  ]
    .filter((line) => line.length > 0)
    .join('\n');
}

export function renderRss(posts: BlogPost[], siteUrl: string): string {
  const sorted = [...posts].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  const items = sorted.map((p) => renderItem(p, siteUrl)).join('\n');
  const lastBuild = sorted[0] ? rfc822(sorted[0].date) : new Date().toUTCString();
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>hoatrinh.dev blog</title>
    <link>${siteUrl}</link>
    <description>Notes from Hoa Trinh on building, habits, and the work behind the work.</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
bun run --filter @hoatrinh/web test
bun run typecheck
bun run lint
```

Expected: all assertions pass; typecheck and lint clean.

- [ ] **Step 5: Commit**

```bash
git add apps/web/scripts/build-rss.ts apps/web/scripts/build-rss.test.ts
git commit -m "feat(web): add pure renderRss function for blog feed"
```

---

## Task 3: Wire RSS into prerender + add `<link rel=alternate>`

**Files:**
- Modify: `apps/web/scripts/prerender.ts`
- Modify: `apps/web/index.html:7`

- [ ] **Step 1: Add RSS write to the prerender pipeline**

At the top of `apps/web/scripts/prerender.ts`, add an import after line 6 (`import { shellHtml } from './shell';`):

```ts
import { getBlogPosts } from '@hoatrinh/content';
import { renderRss } from './build-rss';
```

After the existing `writeSitemap` function, add:

```ts
async function writeRss() {
  const posts = getBlogPosts();
  const xml = renderRss(posts, SITE_URL);
  await writeFile(join(DIST, 'rss.xml'), xml);
}
```

Replace the final `await Promise.all(...)` line so `writeRss()` joins the parallel writes:

```ts
await Promise.all([...routes.map(renderRoute), renderNotFound(), writeSitemap(), writeRss()]);
console.log('  wrote sitemap.xml, rss.xml, and 404.html');
```

- [ ] **Step 2: Add the alternate link tag to the HTML shell**

In `apps/web/index.html`, after the existing `<link rel="icon" ...>` line (line 6), insert before the `<title>` line:

```html
    <link rel="alternate" type="application/rss+xml" title="hoatrinh.dev blog" href="/rss.xml" />
```

- [ ] **Step 3: Build and prerender, then verify the file**

```bash
bun run build && bun run prerender
ls -la apps/web/dist/rss.xml
head -20 apps/web/dist/rss.xml
```

Expected: `apps/web/dist/rss.xml` exists, starts with `<?xml`, contains `<rss version="2.0"`, contains a `<link>` to the latest blog post.

- [ ] **Step 4: Verify the alternate link is in the prerendered HTML**

```bash
grep 'rel="alternate"' apps/web/dist/index.html
```

Expected: one match with `type="application/rss+xml"`.

- [ ] **Step 5: Commit**

```bash
git add apps/web/scripts/prerender.ts apps/web/index.html
git commit -m "feat(web): emit /rss.xml during prerender and link from <head>"
```

---

## Task 4: E2E assertion for `/rss.xml`

**Files:**
- Modify: `apps/web/tests/e2e/blog.spec.ts`

- [ ] **Step 1: Inspect the existing blog e2e**

```bash
sed -n '1,80p' apps/web/tests/e2e/blog.spec.ts
```

Note the import style (Playwright `test`/`expect` from `@playwright/test`) and how requests are made.

- [ ] **Step 2: Append an rss.xml smoke test**

Add at the bottom of `apps/web/tests/e2e/blog.spec.ts`:

```ts
test('serves /rss.xml with the latest post slug', async ({ request }) => {
  const res = await request.get('/rss.xml');
  expect(res.status()).toBe(200);
  const ct = res.headers()['content-type'] ?? '';
  expect(ct).toMatch(/xml/);
  const body = await res.text();
  expect(body.startsWith('<?xml')).toBe(true);
  expect(body).toContain('<rss version="2.0"');
  expect(body).toContain('the-small-habits-i-keep-on-rails');
});
```

- [ ] **Step 3: Build, prerender, and run the e2e**

```bash
bun run build && bun run prerender && bun run e2e -- --grep rss.xml
```

Expected: the rss.xml test passes.

- [ ] **Step 4: Commit**

```bash
git add apps/web/tests/e2e/blog.spec.ts
git commit -m "test(e2e): assert /rss.xml is served with latest post"
```

---

## Task 5: Pure `computePlan` for dev.to publisher

**Files:**
- Create: `apps/web/scripts/crosspost-devto/types.ts`
- Create: `apps/web/scripts/crosspost-devto/plan.ts`
- Create: `apps/web/scripts/crosspost-devto/plan.test.ts`

- [ ] **Step 1: Define the shared types**

Create `apps/web/scripts/crosspost-devto/types.ts`:

```ts
import type { BlogPost } from '@hoatrinh/content';

export type PlanPost = BlogPost & { bodyMarkdown: string };

export type DevtoPayload = {
  title: string;
  body_markdown: string;
  canonical_url: string;
  published: true;
  main_image: string | null;
  tags: string[];
  description: string;
};

export type DevtoArticle = {
  id: number;
  title: string;
  body_markdown: string;
  canonical_url: string | null;
  cover_image?: string | null;
  main_image?: string | null;
  tag_list: string[] | string;
  description: string;
};

export type Action =
  | { kind: 'create'; slug: string; payload: DevtoPayload }
  | { kind: 'update'; slug: string; id: number; payload: DevtoPayload }
  | { kind: 'skip'; slug: string; reason: 'unchanged' | 'opt-out' };

export type PlanInput = {
  posts: PlanPost[];
  existing: DevtoArticle[];
  siteUrl: string;
};
```

- [ ] **Step 2: Write failing tests for `computePlan` and helpers**

Create `apps/web/scripts/crosspost-devto/plan.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { buildPayload, computePlan, normalizeExisting, payloadHash } from './plan';
import type { DevtoArticle, PlanPost } from './types';

const SITE = 'https://hoatrinh.dev';

function post(over: Partial<PlanPost> = {}): PlanPost {
  return {
    slug: 'sample',
    title: 'A sample post',
    date: '2026-04-20',
    excerpt: 'Excerpt.',
    tag: 'test',
    bodyHtml: '<p>Body.</p>',
    readingTime: 1,
    bodyMarkdown: 'Body.',
    ...over,
  } as PlanPost;
}

describe('buildPayload', () => {
  it('uses tag as default when tags is absent', () => {
    const payload = buildPayload(post(), SITE);
    expect(payload.tags).toEqual(['test']);
    expect(payload.canonical_url).toBe(`${SITE}/blog/sample`);
    expect(payload.main_image).toBeNull();
    expect(payload.published).toBe(true);
    expect(payload.body_markdown).toBe('Body.');
  });

  it('caps tags at 4 and absolutizes site-relative cover', () => {
    const payload = buildPayload(
      post({ tags: ['a', 'b', 'c', 'd'], cover: '/images/x.png' }),
      SITE,
    );
    expect(payload.tags).toEqual(['a', 'b', 'c', 'd']);
    expect(payload.main_image).toBe(`${SITE}/images/x.png`);
  });

  it('passes absolute cover URLs through', () => {
    const payload = buildPayload(
      post({ cover: 'https://cdn.example.com/x.jpg' }),
      SITE,
    );
    expect(payload.main_image).toBe('https://cdn.example.com/x.jpg');
  });
});

describe('payloadHash', () => {
  it('is stable regardless of tag order', () => {
    const a = buildPayload(post({ tags: ['a', 'b', 'c'] }), SITE);
    const b = buildPayload(post({ tags: ['c', 'a', 'b'] }), SITE);
    expect(payloadHash(a)).toBe(payloadHash(b));
  });

  it('differs when body changes', () => {
    const a = buildPayload(post({ bodyMarkdown: 'Body one.' }), SITE);
    const b = buildPayload(post({ bodyMarkdown: 'Body two.' }), SITE);
    expect(payloadHash(a)).not.toBe(payloadHash(b));
  });
});

describe('normalizeExisting', () => {
  it('builds a payload-shaped object from a dev.to article', () => {
    const article: DevtoArticle = {
      id: 1,
      title: 'A sample post',
      body_markdown: 'Body.',
      canonical_url: `${SITE}/blog/sample`,
      main_image: null,
      tag_list: ['test'],
      description: 'Excerpt.',
    };
    const norm = normalizeExisting(article);
    expect(norm.title).toBe('A sample post');
    expect(norm.tags).toEqual(['test']);
    expect(norm.canonical_url).toBe(`${SITE}/blog/sample`);
  });

  it('handles tag_list returned as a comma-separated string', () => {
    const article: DevtoArticle = {
      id: 2,
      title: 't',
      body_markdown: 'b',
      canonical_url: 'x',
      tag_list: 'a, b ,c',
      description: 'd',
    };
    expect(normalizeExisting(article).tags).toEqual(['a', 'b', 'c']);
  });
});

describe('computePlan', () => {
  it('emits create when canonical_url is unknown to dev.to', () => {
    const plan = computePlan({
      posts: [post()],
      existing: [],
      siteUrl: SITE,
    });
    expect(plan).toHaveLength(1);
    expect(plan[0]).toMatchObject({ kind: 'create', slug: 'sample' });
  });

  it('emits skip:unchanged when payloads round-trip identically', () => {
    const p = post();
    const payload = buildPayload(p, SITE);
    const article: DevtoArticle = {
      id: 7,
      title: payload.title,
      body_markdown: payload.body_markdown,
      canonical_url: payload.canonical_url,
      main_image: payload.main_image,
      tag_list: payload.tags,
      description: payload.description,
    };
    const plan = computePlan({ posts: [p], existing: [article], siteUrl: SITE });
    expect(plan[0]).toMatchObject({ kind: 'skip', slug: 'sample', reason: 'unchanged' });
  });

  it('emits update when the body markdown differs', () => {
    const p = post();
    const article: DevtoArticle = {
      id: 7,
      title: 'A sample post',
      body_markdown: 'OLD body.',
      canonical_url: `${SITE}/blog/sample`,
      main_image: null,
      tag_list: ['test'],
      description: 'Excerpt.',
    };
    const plan = computePlan({ posts: [p], existing: [article], siteUrl: SITE });
    expect(plan[0]).toMatchObject({ kind: 'update', slug: 'sample', id: 7 });
  });

  it('emits skip:opt-out when crosspost is false', () => {
    const plan = computePlan({
      posts: [post({ crosspost: false })],
      existing: [],
      siteUrl: SITE,
    });
    expect(plan[0]).toMatchObject({ kind: 'skip', slug: 'sample', reason: 'opt-out' });
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
bun run --filter @hoatrinh/web test
```

Expected: `plan.test.ts` fails with "Cannot find module './plan'".

- [ ] **Step 4: Implement `plan.ts`**

Create `apps/web/scripts/crosspost-devto/plan.ts`:

```ts
import { createHash } from 'node:crypto';
import type { Action, DevtoArticle, DevtoPayload, PlanInput, PlanPost } from './types';

function absolutize(url: string, siteUrl: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${siteUrl}${url.startsWith('/') ? '' : '/'}${url}`;
}

export function buildPayload(post: PlanPost, siteUrl: string): DevtoPayload {
  const tags = (post.tags ?? [post.tag]).slice(0, 4);
  return {
    title: post.title,
    body_markdown: post.bodyMarkdown,
    canonical_url: `${siteUrl}/blog/${post.slug}`,
    published: true,
    main_image: post.cover ? absolutize(post.cover, siteUrl) : null,
    tags,
    description: post.excerpt,
  };
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj).sort();
    return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(',')}}`;
  }
  return JSON.stringify(value ?? null);
}

export function payloadHash(payload: DevtoPayload): string {
  const normalized = { ...payload, tags: [...payload.tags].sort() };
  return createHash('sha256').update(stableStringify(normalized)).digest('hex');
}

export function normalizeExisting(article: DevtoArticle): DevtoPayload {
  const tags = Array.isArray(article.tag_list)
    ? article.tag_list
    : article.tag_list.split(',').map((s) => s.trim()).filter(Boolean);
  return {
    title: article.title,
    body_markdown: article.body_markdown,
    canonical_url: article.canonical_url ?? '',
    published: true,
    main_image: article.main_image ?? null,
    tags,
    description: article.description,
  };
}

export function computePlan(input: PlanInput): Action[] {
  const { posts, existing, siteUrl } = input;
  const byCanonical = new Map<string, DevtoArticle>();
  for (const a of existing) {
    if (a.canonical_url) byCanonical.set(a.canonical_url, a);
  }

  const actions: Action[] = [];
  for (const post of posts) {
    if (post.crosspost === false) {
      actions.push({ kind: 'skip', slug: post.slug, reason: 'opt-out' });
      continue;
    }
    const payload = buildPayload(post, siteUrl);
    const match = byCanonical.get(payload.canonical_url);
    if (!match) {
      actions.push({ kind: 'create', slug: post.slug, payload });
      continue;
    }
    if (payloadHash(payload) === payloadHash(normalizeExisting(match))) {
      actions.push({ kind: 'skip', slug: post.slug, reason: 'unchanged' });
    } else {
      actions.push({ kind: 'update', slug: post.slug, id: match.id, payload });
    }
  }
  return actions;
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
bun run --filter @hoatrinh/web test
bun run typecheck
bun run lint
```

Expected: all assertions pass; clean typecheck and lint.

- [ ] **Step 6: Commit**

```bash
git add apps/web/scripts/crosspost-devto/
git commit -m "feat(crosspost): add pure computePlan for dev.to reconciliation"
```

---

## Task 6: IO shell — fetch existing, POST/PUT, dry-run, exit codes

**Files:**
- Create: `apps/web/scripts/crosspost-devto/raw-body.ts`
- Create: `apps/web/scripts/crosspost-devto/devto-client.ts`
- Create: `apps/web/scripts/crosspost-devto/index.ts`
- Modify: `package.json` (root)

- [ ] **Step 1: Add a helper that returns the raw markdown body of a post**

Create `apps/web/scripts/crosspost-devto/raw-body.ts`:

```ts
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const blogDirUrl = new URL(
  '../../../packages/content/markdown/blog/',
  import.meta.url,
);

export function readBodyMarkdown(slug: string): string {
  const path = fileURLToPath(new URL(`${slug}.md`, blogDirUrl));
  const raw = readFileSync(path, 'utf8');
  return raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
}
```

- [ ] **Step 2: Add a thin dev.to API client**

Create `apps/web/scripts/crosspost-devto/devto-client.ts`:

```ts
import type { DevtoArticle, DevtoPayload } from './types';

const BASE = 'https://dev.to/api';

function headers(apiKey: string): Record<string, string> {
  return {
    'api-key': apiKey,
    'content-type': 'application/json',
    accept: 'application/vnd.forem.api-v1+json',
  };
}

export async function listMyArticles(apiKey: string): Promise<DevtoArticle[]> {
  const res = await fetch(`${BASE}/articles/me/all?per_page=1000`, {
    headers: headers(apiKey),
  });
  if (!res.ok) {
    throw new Error(`dev.to GET /articles/me/all failed: ${res.status} ${await res.text()}`);
  }
  return (await res.json()) as DevtoArticle[];
}

export async function createArticle(
  apiKey: string,
  payload: DevtoPayload,
): Promise<DevtoArticle> {
  const res = await fetch(`${BASE}/articles`, {
    method: 'POST',
    headers: headers(apiKey),
    body: JSON.stringify({ article: payload }),
  });
  if (!res.ok) {
    throw new Error(`dev.to POST /articles failed: ${res.status} ${await res.text()}`);
  }
  return (await res.json()) as DevtoArticle;
}

export async function updateArticle(
  apiKey: string,
  id: number,
  payload: DevtoPayload,
): Promise<DevtoArticle> {
  const res = await fetch(`${BASE}/articles/${id}`, {
    method: 'PUT',
    headers: headers(apiKey),
    body: JSON.stringify({ article: payload }),
  });
  if (!res.ok) {
    throw new Error(`dev.to PUT /articles/${id} failed: ${res.status} ${await res.text()}`);
  }
  return (await res.json()) as DevtoArticle;
}
```

- [ ] **Step 3: Wire up the entry point**

Create `apps/web/scripts/crosspost-devto/index.ts`:

```ts
import { getBlogPosts } from '@hoatrinh/content';
import { computePlan } from './plan';
import { readBodyMarkdown } from './raw-body';
import { createArticle, listMyArticles, updateArticle } from './devto-client';
import type { Action } from './types';

const RATE_LIMIT_MS = 1000;
const DRY_RUN = process.argv.includes('--dry-run');

function getEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env: ${name}`);
  return v;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function summarize(actions: Action[], failed: Set<string>): void {
  const counts = { create: 0, update: 0, 'skip:unchanged': 0, 'skip:opt-out': 0, failed: 0 };
  for (const a of actions) {
    if (a.kind === 'skip') counts[`skip:${a.reason}` as const] += 1;
    else counts[a.kind] += 1;
  }
  counts.failed = failed.size;
  console.log('crosspost-devto summary:');
  for (const [k, v] of Object.entries(counts)) {
    console.log(`  ${k.padEnd(16)} ${v}`);
  }
  for (const a of actions) {
    const tag = a.kind === 'skip' ? `skip:${a.reason}` : a.kind;
    const flag = failed.has(a.slug) ? ' [FAILED]' : '';
    console.log(`  - ${tag.padEnd(16)} ${a.slug}${flag}`);
  }
}

async function main(): Promise<number> {
  const siteUrl = getEnv('SITE_URL').replace(/\/$/, '');
  const apiKey = DRY_RUN ? '' : getEnv('DEV_TO_API_KEY');

  const posts = getBlogPosts().map((p) => ({
    ...p,
    bodyMarkdown: readBodyMarkdown(p.slug),
  }));

  const existing = DRY_RUN ? [] : await listMyArticles(apiKey);
  const actions = computePlan({ posts, existing, siteUrl });

  if (DRY_RUN) {
    console.log('[dry-run] would execute:');
    summarize(actions, new Set());
    return 0;
  }

  const failed = new Set<string>();
  for (const action of actions) {
    try {
      if (action.kind === 'create') {
        await createArticle(apiKey, action.payload);
        console.log(`created   ${action.slug}`);
      } else if (action.kind === 'update') {
        await updateArticle(apiKey, action.id, action.payload);
        console.log(`updated   ${action.slug} (id=${action.id})`);
      } else {
        console.log(`skipped   ${action.slug} (${action.reason})`);
      }
    } catch (err) {
      failed.add(action.slug);
      console.error(`FAILED    ${action.slug}: ${(err as Error).message}`);
    }
    if (action.kind === 'create' || action.kind === 'update') {
      await delay(RATE_LIMIT_MS);
    }
  }

  summarize(actions, failed);
  return failed.size === 0 ? 0 : 1;
}

main().then(
  (code) => process.exit(code),
  (err) => {
    console.error(err);
    process.exit(1);
  },
);
```

- [ ] **Step 4: Add the runner script to root `package.json`**

Edit the root `package.json` and add inside `"scripts"`, after `"format"`:

```json
    "crosspost:devto": "bun apps/web/scripts/crosspost-devto/index.ts"
```

Path is relative to repo root (where `bun run` resolves cwd). The script itself uses `import.meta.url` for all file lookups, so the cwd does not matter.

- [ ] **Step 5: Smoke-test the dry run locally**

```bash
SITE_URL=https://hoatrinh.dev bun run crosspost:devto -- --dry-run
```

Expected: prints a `[dry-run] would execute:` block listing each post under hoatrinh.dev with the chosen action (`create` for everything on first run since `existing` is empty in dry-run mode). Exit code 0. No HTTP calls made.

- [ ] **Step 6: Typecheck and lint**

```bash
bun run typecheck
bun run lint
```

Expected: clean.

- [ ] **Step 7: Commit**

```bash
git add apps/web/scripts/crosspost-devto/ package.json
git commit -m "feat(crosspost): add dev.to IO shell with --dry-run support"
```

---

## Task 7: GitHub Actions job

**Files:**
- Modify: `.github/workflows/ci.yml`

- [ ] **Step 1: Append the `crosspost` job**

Add this block at the end of `.github/workflows/ci.yml`, after the `deploy_production` job. Match the indentation of the existing top-level jobs.

```yaml
  crosspost:
    if: github.event_name == 'push' && github.ref == 'refs/heads/master'
    needs: [deploy_production]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest
      - run: bun install --frozen-lockfile
      - run: bun run crosspost:devto
        env:
          DEV_TO_API_KEY: ${{ secrets.DEV_TO_API_KEY }}
          SITE_URL: ${{ vars.SITE_URL || 'https://hoatrinh.dev' }}
```

- [ ] **Step 2: Validate the workflow file syntax**

```bash
bun x js-yaml .github/workflows/ci.yml > /dev/null
```

Expected: no error. (If `js-yaml` is not available as a CLI, run `bun -e "import('js-yaml').then(y => y.load(require('node:fs').readFileSync('.github/workflows/ci.yml','utf8')))"` instead — same goal: parse without throwing.)

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add crosspost job that publishes to dev.to after deploy"
```

---

## Task 8: Manual prerequisites + first-run handover

**Files:**
- Create: `docs/superpowers/runbooks/blog-crosspost.md`

- [ ] **Step 1: Capture the manual setup steps**

Create `docs/superpowers/runbooks/blog-crosspost.md`:

```markdown
# Blog cross-post runbook

## One-time setup

1. **Generate a dev.to API key.**
   - Go to https://dev.to/settings/extensions
   - Section "DEV Community API Keys" -> create a new key named "hoatrinh-crosspost"
   - Copy the value.

2. **Add the key as a GitHub Actions secret.**
   - Repo Settings -> Secrets and variables -> Actions -> New repository secret
   - Name: `DEV_TO_API_KEY`
   - Value: paste from step 1.

3. **Confirm `SITE_URL` is set.**
   - Repo Settings -> Secrets and variables -> Actions -> Variables
   - Either confirm an existing `SITE_URL` variable, or accept the default
     (`https://hoatrinh.dev`) baked into the workflow.

4. **Register the RSS feed on daily.dev.**
   - Visit https://app.daily.dev/squads/new (Squad with RSS) or
     https://docs.daily.dev/docs/contributing/suggest-a-new-source
   - Provide `https://hoatrinh.dev/rss.xml` as the source.
   - Wait for daily.dev's crawler to ingest (typically <24h).

## First production run

The first push to `master` after the workflow lands will create one dev.to
article per existing non-draft, non-opt-out post. To preview the plan first:

```bash
SITE_URL=https://hoatrinh.dev bun run crosspost:devto -- --dry-run
```

If anything in the plan is wrong (wrong post, wrong title), set
`crosspost: false` in that post's frontmatter before merging.

## Recovery

The workflow is idempotent. Re-running `crosspost:devto` will:

- skip posts that round-trip identically to dev.to,
- update posts whose markdown body / title / cover / tags / description has
  changed,
- create posts that are missing on dev.to.

If a post is removed from dev.to manually, the next workflow run will recreate
it. To stop a post from being recreated, set `crosspost: false` in its
frontmatter; the planner will then emit `skip:opt-out` for it.
```

- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/runbooks/blog-crosspost.md
git commit -m "docs(crosspost): add runbook for one-time setup and recovery"
```

---

## Task 9: Final verification

- [ ] **Step 1: Full local pipeline**

```bash
bun run typecheck
bun run lint
bun run test
bun run build
bun run prerender
bun run e2e
```

Expected: all green.

- [ ] **Step 2: Dry-run the publisher once more from clean state**

```bash
SITE_URL=https://hoatrinh.dev bun run crosspost:devto -- --dry-run
```

Expected: a plan listing each existing post with `kind=create` (because dry-run treats `existing` as empty). Exit code 0.

- [ ] **Step 3: Confirm runbook is reachable**

```bash
ls docs/superpowers/runbooks/blog-crosspost.md
```

- [ ] **Step 4: Push and watch CI**

```bash
git push origin master
```

After CI completes, confirm in GitHub Actions that the new `crosspost` job ran (only on the `push` event to `master`). Confirm dev.to shows the new article(s) with the correct canonical URL.

---

## Spec coverage check

| Spec section                          | Covered by             |
|--------------------------------------|------------------------|
| Frontmatter additions                | Task 1                 |
| RSS feed (`build-rss.ts`)            | Task 2, Task 3         |
| Prerender wiring + `<head>` link     | Task 3                 |
| E2E: `/rss.xml` smoke                | Task 4                 |
| `computePlan` purity + idempotency   | Task 5                 |
| dev.to client + summary + exit codes | Task 6                 |
| `--dry-run`                          | Task 6                 |
| CI workflow                          | Task 7                 |
| Secrets + daily.dev source           | Task 8                 |
| First-run mitigation guidance        | Task 8                 |
| Final verification                   | Task 9                 |
