# AI Fetch Support Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-subagent-driven-development (recommended) or superpowers-executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship blog-first AI discovery support with root-level `robots.txt`, `sitemap.xml`, `llms.txt`, shared route metadata, article-specific head tags, JSON-LD for posts, and stronger blog post HTML semantics.

**Architecture:** `apps/web/src/entry-server.tsx` will produce one `RouteMeta[]` source of truth that includes canonical URLs and route kind. The prerender script will consume that metadata once to render HTML, sitemap rows, robots guidance, and llms guidance. `apps/web/scripts/shell.ts` will render generic page head tags for normal pages and article head tags plus minimal `BlogPosting` JSON-LD for `/post/` routes only.

**Tech Stack:** Bun workspaces, SolidJS SSR, Vite prerender scripts, TypeScript strict mode, Vitest, Playwright, Biome.

---

## File Structure

- Create `apps/web/src/route-meta.ts`: shared route metadata type and canonical URL helpers used by entry-server, shell rendering, sitemap rendering, and tests.
- Modify `apps/web/src/entry-server.tsx`: replace `RouteDef` with `RouteMeta`, classify post routes as `article`, and attach canonical URL, publish date, modified date, and section metadata.
- Create `apps/web/src/entry-server.test.ts`: unit tests for `/`, `/blog`, and `/post/<slug>` route metadata.
- Modify `apps/web/scripts/shell.ts`: split pure shell rendering from dist template loading, render metadata from `RouteMeta`, emit article tags, and emit one minimal `BlogPosting` JSON-LD block for article routes.
- Create `apps/web/scripts/shell.test.ts`: unit tests for generic website metadata, article metadata, JSON-LD, and HTML escaping.
- Create `apps/web/scripts/build-sitemap.ts`: pure sitemap renderer driven by `RouteMeta[]`.
- Create `apps/web/scripts/build-sitemap.test.ts`: unit tests for canonical URLs, article `<lastmod>`, and non-article omission of `<lastmod>`.
- Create `apps/web/scripts/build-robots.ts`: pure root `robots.txt` renderer.
- Create `apps/web/scripts/build-robots.test.ts`: exact-output unit test for `robots.txt`.
- Create `apps/web/scripts/build-llms.ts`: pure short `llms.txt` renderer that prioritizes `/blog` and post article routes.
- Create `apps/web/scripts/build-llms.test.ts`: unit tests for blog-first guidance and short stable output.
- Modify `apps/web/scripts/prerender.ts`: consume `RouteMeta[]`, pass full metadata to shell, and write `sitemap.xml`, `robots.txt`, and `llms.txt` at dist root.
- Modify `apps/web/src/components/blocks/PostBlock/PostBlock.tsx`: keep the terminal visual frame while using `<header>`, `<time datetime>`, a content container, and `<footer>` inside the existing outer `<article>`.
- Create `apps/web/scripts/verify-ai-fetch.ts`: post-prerender verifier for real files under `apps/web/dist/`.
- Create `apps/web/scripts/verify-ai-fetch.test.ts`: focused tests for the verification helper against temporary dist fixtures.
- Modify `apps/web/package.json`: add `verify:ai-fetch` script.
- Modify `package.json`: expose root `verify:ai-fetch` script.
- Modify `.github/workflows/ci.yml`: run the verifier immediately after `bun run prerender`.
- Modify `apps/web/tests/e2e/blog.spec.ts`: assert prerendered AI-facing blog surfaces over HTTP.

## Tasks

### Task 1: Add the shared route metadata contract

**Files:**
- Create: `apps/web/src/route-meta.ts`

- [ ] **Step 1: Create the shared route metadata file**

Create `apps/web/src/route-meta.ts` with this complete content:

```ts
export const DEFAULT_SITE_URL = 'https://hoatrinh.dev';

export type RouteKind = 'page' | 'article';

export type RouteMeta = {
  path: string;
  title: string;
  description: string;
  kind: RouteKind;
  canonicalUrl: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
};

export function normalizeSiteUrl(siteUrl: string = DEFAULT_SITE_URL): string {
  return siteUrl.replace(/\/$/, '');
}

export function canonicalUrlForPath(path: string, siteUrl: string = DEFAULT_SITE_URL): string {
  const normalizedSiteUrl = normalizeSiteUrl(siteUrl);
  return `${normalizedSiteUrl}${path === '/' ? '' : path}`;
}
```

- [ ] **Step 2: Run typecheck for the new standalone file**

From the repo root, run:

```bash
bun run typecheck
```

Expected success indicators:

```txt
@hoatrinh/web typecheck: tsc --noEmit
@hoatrinh/content typecheck: tsc --noEmit
```

- [ ] **Step 3: Commit the metadata contract**

From the repo root, run:

```bash
git add apps/web/src/route-meta.ts
git commit -m "feat: add shared route metadata contract"
```

Expected success indicator:

```txt
[master
```

If the current branch is not `master`, the bracketed branch name in git output will match the current branch instead.

### Task 2: Test route metadata generation before changing entry-server

**Files:**
- Create: `apps/web/src/entry-server.test.ts`

- [ ] **Step 1: Write failing route metadata tests**

Create `apps/web/src/entry-server.test.ts` with this complete content:

```ts
import { describe, expect, it } from 'vitest';
import { getRoutes } from './entry-server';

const SITE = 'https://example.test';

describe('getRoutes', () => {
  it('adds canonical URLs and page kind to the home route', () => {
    const home = getRoutes(SITE).find((route) => route.path === '/');

    expect(home).toMatchObject({
      path: '/',
      kind: 'page',
      canonicalUrl: SITE,
    });
    expect(home?.title).toContain('Hoa Trinh');
    expect(home?.description).toContain('Hoa Trinh');
  });

  it('describes /blog as the canonical writing index, not an article', () => {
    const blog = getRoutes(SITE).find((route) => route.path === '/blog');

    expect(blog).toEqual({
      path: '/blog',
      title: 'Blog - Hoa Trinh',
      description: 'Writing from Hoa Trinh on building, habits, and the work behind the work.',
      kind: 'page',
      canonicalUrl: `${SITE}/blog`,
    });
  });

  it('classifies post routes as articles with publish metadata and section', () => {
    const post = getRoutes(SITE).find(
      (route) => route.path === '/post/ai-made-learning-fun-again',
    );

    expect(post).toMatchObject({
      path: '/post/ai-made-learning-fun-again',
      title: 'AI made learning fun again - Hoa Trinh',
      kind: 'article',
      canonicalUrl: `${SITE}/post/ai-made-learning-fun-again`,
      publishedTime: '2026-04-30',
      modifiedTime: '2026-04-30',
      section: 'learning',
    });
    expect(post?.description).toContain('AI made learning fun again');
  });
});
```

- [ ] **Step 2: Run the new test and verify it fails for the current contract**

From `apps/web`, run:

```bash
bun x vitest run src/entry-server.test.ts
```

Expected failure indicators:

```txt
FAIL  src/entry-server.test.ts
expected undefined to match object
```

- [ ] **Step 3: Commit the failing test**

From the repo root, run:

```bash
git add apps/web/src/entry-server.test.ts
git commit -m "test: cover route metadata generation"
```

Expected success indicator:

```txt
[master
```

### Task 3: Upgrade entry-server to produce RouteMeta records

**Files:**
- Modify: `apps/web/src/entry-server.tsx`
- Test: `apps/web/src/entry-server.test.ts`

- [ ] **Step 1: Replace the route type and build canonical route metadata**

Apply this exact diff to `apps/web/src/entry-server.tsx`:

```diff
@@
 import { getBlogPosts, getProfile, getProjects } from '@hoatrinh/content';
 import { generateHydrationScript, renderToString } from 'solid-js/web';
 import { App } from './App';
+import { canonicalUrlForPath, type RouteMeta } from './route-meta';
 
 export type RenderResult = { body: string; head: string };
-export type RouteDef = { path: string; title: string; description: string };
+export type { RouteMeta } from './route-meta';
@@
-export function getRoutes(): RouteDef[] {
+export function getRoutes(siteUrl?: string): RouteMeta[] {
   const profile = getProfile();
+  const withCanonicalUrl = (route: Omit<RouteMeta, 'canonicalUrl'>): RouteMeta => ({
+    ...route,
+    canonicalUrl: canonicalUrlForPath(route.path, siteUrl),
+  });
   return [
-    {
+    withCanonicalUrl({
       path: '/',
       title: `${profile.name} - ${profile.role}`,
       description: `${profile.name}. ${profile.role}. ${profile.location}.`,
-    },
-    { path: '/about', title: `About - ${profile.name}`, description: profile.role },
-    { path: '/projects', title: `Projects - ${profile.name}`, description: 'Things I have built.' },
-    { path: '/experience', title: `Experience - ${profile.name}`, description: 'Past roles.' },
-    {
+      kind: 'page',
+    }),
+    withCanonicalUrl({ path: '/about', title: `About - ${profile.name}`, description: profile.role, kind: 'page' }),
+    withCanonicalUrl({
+      path: '/projects',
+      title: `Projects - ${profile.name}`,
+      description: 'Things I have built.',
+      kind: 'page',
+    }),
+    withCanonicalUrl({
+      path: '/experience',
+      title: `Experience - ${profile.name}`,
+      description: 'Past roles.',
+      kind: 'page',
+    }),
+    withCanonicalUrl({
       path: '/skills',
       title: `Skills - ${profile.name}`,
       description: 'Tech and tools I work with.',
-    },
-    { path: '/contact', title: `Contact - ${profile.name}`, description: 'Ways to reach me.' },
-    { path: '/help', title: `Help - ${profile.name}`, description: 'Commands available.' },
-    { path: '/blog', title: `Blog - ${profile.name}`, description: 'Things I write.' },
-    ...getProjects().map((p) => ({
+      kind: 'page',
+    }),
+    withCanonicalUrl({
+      path: '/contact',
+      title: `Contact - ${profile.name}`,
+      description: 'Ways to reach me.',
+      kind: 'page',
+    }),
+    withCanonicalUrl({
+      path: '/help',
+      title: `Help - ${profile.name}`,
+      description: 'Commands available.',
+      kind: 'page',
+    }),
+    withCanonicalUrl({
+      path: '/blog',
+      title: `Blog - ${profile.name}`,
+      description: 'Writing from Hoa Trinh on building, habits, and the work behind the work.',
+      kind: 'page',
+    }),
+    ...getProjects().map((p) => withCanonicalUrl({
       path: `/project/${p.slug}`,
       title: `${p.title} - ${profile.name}`,
       description: p.tagline,
-    })),
-    ...getBlogPosts().map((p) => ({
+      kind: 'page',
+    })),
+    ...getBlogPosts().map((p) => withCanonicalUrl({
       path: `/post/${p.slug}`,
       title: `${p.title} - ${profile.name}`,
       description: p.excerpt,
-    })),
+      kind: 'article',
+      publishedTime: p.date,
+      modifiedTime: p.date,
+      section: p.tag,
+    })),
   ];
 }
```

- [ ] **Step 2: Format the changed file**

From the repo root, run:

```bash
bun run format
```

Expected success indicator:

```txt
Formatted
```

- [ ] **Step 3: Run the route metadata test and verify it passes**

From `apps/web`, run:

```bash
bun x vitest run src/entry-server.test.ts
```

Expected success indicator:

```txt
PASS  src/entry-server.test.ts
```

- [ ] **Step 4: Commit the entry-server metadata change**

From the repo root, run:

```bash
git add apps/web/src/entry-server.tsx apps/web/src/entry-server.test.ts apps/web/src/route-meta.ts
git commit -m "feat: generate shared route metadata"
```

Expected success indicator:

```txt
[master
```

### Task 4: Add pure shell metadata tests before refactoring shell rendering

**Files:**
- Create: `apps/web/scripts/shell.test.ts`

- [ ] **Step 1: Write failing shell metadata tests**

Create `apps/web/scripts/shell.test.ts` with this complete content:

```ts
import { describe, expect, it } from 'vitest';
import type { RouteMeta } from '../src/route-meta';
import { renderShellHtml } from './shell';

const template = `<!doctype html>
<html lang="en">
  <head>
    <title>hoatrinh.dev</title>
  </head>
  <body>
    <div id="app"></div>
  </body>
</html>`;

const pageMeta: RouteMeta = {
  path: '/blog',
  title: 'Blog - Hoa Trinh',
  description: 'Writing from Hoa Trinh on building, habits, and the work behind the work.',
  kind: 'page',
  canonicalUrl: 'https://hoatrinh.dev/blog',
};

const articleMeta: RouteMeta = {
  path: '/post/ai-made-learning-fun-again',
  title: 'AI made learning fun again - Hoa Trinh',
  description: 'AI made learning fun again after years of friction.',
  kind: 'article',
  canonicalUrl: 'https://hoatrinh.dev/post/ai-made-learning-fun-again',
  publishedTime: '2026-04-30',
  modifiedTime: '2026-04-30',
  section: 'learning',
};

describe('renderShellHtml', () => {
  it('renders website metadata for non-article routes', () => {
    const html = renderShellHtml(template, '<main>Blog</main>', '<script>hydration()</script>', pageMeta);

    expect(html).toContain('<title>Blog - Hoa Trinh</title>');
    expect(html).toContain(
      '<meta name="description" content="Writing from Hoa Trinh on building, habits, and the work behind the work." />',
    );
    expect(html).toContain('<meta property="og:type" content="website" />');
    expect(html).toContain('<link rel="canonical" href="https://hoatrinh.dev/blog" />');
    expect(html).not.toContain('article:published_time');
    expect(html).not.toContain('BlogPosting');
    expect(html).toContain('<div id="app"><main>Blog</main></div>');
  });

  it('renders article metadata and one minimal BlogPosting JSON-LD block for post routes', () => {
    const html = renderShellHtml(template, '<article>Post</article>', '', articleMeta);

    expect(html).toContain('<meta property="og:type" content="article" />');
    expect(html).toContain('<meta property="article:published_time" content="2026-04-30" />');
    expect(html).toContain('<meta property="article:modified_time" content="2026-04-30" />');
    expect(html).toContain('<meta property="article:section" content="learning" />');
    expect(html.match(/"@type":"BlogPosting"/g)).toHaveLength(1);
    expect(html).toContain('"url":"https://hoatrinh.dev/post/ai-made-learning-fun-again"');
    expect(html).toContain('"datePublished":"2026-04-30"');
  });

  it('escapes HTML in head tags and JSON-LD script contents', () => {
    const html = renderShellHtml(template, '', '', {
      ...articleMeta,
      title: 'A & B < C',
      description: 'Use "quotes" & <tags>',
    });

    expect(html).toContain('<title>A &amp; B &lt; C</title>');
    expect(html).toContain('content="Use &quot;quotes&quot; &amp; &lt;tags&gt;"');
    expect(html).toContain('A & B \\u003c C');
    expect(html).toContain('Use \\"quotes\\" & \\u003ctags>');
  });
});
```

- [ ] **Step 2: Run the shell test and verify it fails because the pure export is missing**

From `apps/web`, run:

```bash
bun x vitest run scripts/shell.test.ts
```

Expected failure indicator:

```txt
FAIL  scripts/shell.test.ts
No export named "renderShellHtml"
```

- [ ] **Step 3: Commit the failing shell tests**

From the repo root, run:

```bash
git add apps/web/scripts/shell.test.ts
git commit -m "test: cover AI-facing shell metadata"
```

Expected success indicator:

```txt
[master
```

### Task 5: Refactor shell rendering to use RouteMeta and emit article tags

**Files:**
- Modify: `apps/web/scripts/shell.ts`
- Test: `apps/web/scripts/shell.test.ts`

- [ ] **Step 1: Replace shell.ts with a pure renderer plus dist wrapper**

Replace the entire contents of `apps/web/scripts/shell.ts` with this complete content:

```ts
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { RouteMeta } from '../src/route-meta';

const indexHtml = readFileSync(
  fileURLToPath(new URL('../dist/index.html', import.meta.url)),
  'utf8',
);

if (indexHtml.includes('og:title')) {
  throw new Error(
    'dist/index.html already contains injected meta tags. Run `bun run build` to restore the pristine template before prerendering.',
  );
}

export function shellHtml(body: string, head: string, meta: RouteMeta) {
  return renderShellHtml(indexHtml, body, head, meta);
}

export function renderShellHtml(template: string, body: string, head: string, meta: RouteMeta) {
  let out = template;
  out = out.replace(/<title>.*<\/title>/, renderHead(meta, head));
  out = out.replace('<div id="app"></div>', `<div id="app">${body}</div>`);
  return out;
}

function renderHead(meta: RouteMeta, hydrationHead: string): string {
  const headTags = [
    `<title>${escapeHtml(meta.title)}</title>`,
    `<meta name="description" content="${escapeHtml(meta.description)}" />`,
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
    `<meta property="og:url" content="${escapeHtml(meta.canonicalUrl)}" />`,
    `<meta property="og:type" content="${meta.kind === 'article' ? 'article' : 'website'}" />`,
    `<link rel="canonical" href="${escapeHtml(meta.canonicalUrl)}" />`,
    ...renderArticleMeta(meta),
    renderBlogPostingJsonLd(meta),
    hydrationHead,
  ].filter((tag) => tag.length > 0);

  return headTags.join('\n    ');
}

function renderArticleMeta(meta: RouteMeta): string[] {
  if (meta.kind !== 'article') return [];

  return [
    meta.publishedTime
      ? `<meta property="article:published_time" content="${escapeHtml(meta.publishedTime)}" />`
      : '',
    meta.modifiedTime
      ? `<meta property="article:modified_time" content="${escapeHtml(meta.modifiedTime)}" />`
      : '',
    meta.section ? `<meta property="article:section" content="${escapeHtml(meta.section)}" />` : '',
  ].filter((tag) => tag.length > 0);
}

function renderBlogPostingJsonLd(meta: RouteMeta): string {
  if (meta.kind !== 'article' || !meta.canonicalUrl || !meta.title || !meta.description || !meta.publishedTime) {
    return '';
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: meta.title,
    description: meta.description,
    url: meta.canonicalUrl,
    datePublished: meta.publishedTime,
    ...(meta.modifiedTime ? { dateModified: meta.modifiedTime } : {}),
    ...(meta.section ? { articleSection: meta.section } : {}),
  };

  return `<script type="application/ld+json">${escapeScriptJson(JSON.stringify(jsonLd))}</script>`;
}

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
};

function escapeHtml(s: string): string {
  return s.replace(/[&<>"]/g, (c) => HTML_ESCAPES[c] ?? c);
}

function escapeScriptJson(s: string): string {
  return s.replace(/</g, '\\u003c');
}
```

- [ ] **Step 2: Run the shell test and verify it passes**

From `apps/web`, run:

```bash
bun x vitest run scripts/shell.test.ts
```

Expected success indicator:

```txt
PASS  scripts/shell.test.ts
```

- [ ] **Step 3: Run typecheck for exact optional property consistency**

From the repo root, run:

```bash
bun run typecheck
```

Expected success indicators:

```txt
@hoatrinh/web typecheck: tsc --noEmit
@hoatrinh/content typecheck: tsc --noEmit
```

- [ ] **Step 4: Commit shell metadata rendering**

From the repo root, run:

```bash
git add apps/web/scripts/shell.ts apps/web/scripts/shell.test.ts
git commit -m "feat: render article metadata in prerendered shell"
```

Expected success indicator:

```txt
[master
```

### Task 6: Add a tested sitemap renderer driven by RouteMeta

**Files:**
- Create: `apps/web/scripts/build-sitemap.ts`
- Create: `apps/web/scripts/build-sitemap.test.ts`

- [ ] **Step 1: Write the failing sitemap tests**

Create `apps/web/scripts/build-sitemap.test.ts` with this complete content:

```ts
import { describe, expect, it } from 'vitest';
import type { RouteMeta } from '../src/route-meta';
import { renderSitemap } from './build-sitemap';

const routes: RouteMeta[] = [
  {
    path: '/',
    title: 'Hoa Trinh - Builder',
    description: 'Hoa Trinh. Builder. Brisbane.',
    kind: 'page',
    canonicalUrl: 'https://hoatrinh.dev',
  },
  {
    path: '/blog',
    title: 'Blog - Hoa Trinh',
    description: 'Writing from Hoa Trinh on building, habits, and the work behind the work.',
    kind: 'page',
    canonicalUrl: 'https://hoatrinh.dev/blog',
  },
  {
    path: '/post/ai-made-learning-fun-again',
    title: 'AI made learning fun again - Hoa Trinh',
    description: 'AI made learning fun again after years of friction.',
    kind: 'article',
    canonicalUrl: 'https://hoatrinh.dev/post/ai-made-learning-fun-again',
    publishedTime: '2026-04-30',
    modifiedTime: '2026-04-30',
    section: 'learning',
  },
];

describe('renderSitemap', () => {
  it('renders a valid sitemap from canonical route metadata', () => {
    const xml = renderSitemap(routes);

    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml).toContain('<loc>https://hoatrinh.dev</loc>');
    expect(xml).toContain('<loc>https://hoatrinh.dev/blog</loc>');
    expect(xml).toContain('<loc>https://hoatrinh.dev/post/ai-made-learning-fun-again</loc>');
  });

  it('adds lastmod only to article routes with publish metadata', () => {
    const xml = renderSitemap(routes);
    const blogEntry = xml.slice(xml.indexOf('<loc>https://hoatrinh.dev/blog</loc>'));
    const postEntry = xml.slice(xml.indexOf('<loc>https://hoatrinh.dev/post/ai-made-learning-fun-again</loc>'));

    expect(postEntry).toContain('<lastmod>2026-04-30</lastmod>');
    expect(blogEntry.split('</url>')[0]).not.toContain('<lastmod>');
  });

  it('escapes XML-sensitive canonical URLs', () => {
    const xml = renderSitemap([
      {
        path: '/blog',
        title: 'Blog',
        description: 'Writing',
        kind: 'page',
        canonicalUrl: 'https://hoatrinh.dev/blog?x=1&y=2',
      },
    ]);

    expect(xml).toContain('<loc>https://hoatrinh.dev/blog?x=1&amp;y=2</loc>');
  });
});
```

- [ ] **Step 2: Run the sitemap test and verify it fails because the renderer is missing**

From `apps/web`, run:

```bash
bun x vitest run scripts/build-sitemap.test.ts
```

Expected failure indicator:

```txt
FAIL  scripts/build-sitemap.test.ts
Cannot find module './build-sitemap'
```

- [ ] **Step 3: Create the sitemap renderer**

Create `apps/web/scripts/build-sitemap.ts` with this complete content:

```ts
import type { RouteMeta } from '../src/route-meta';

const XML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
};

export function renderSitemap(routes: RouteMeta[]): string {
  const urls = routes.map(renderUrlEntry).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

function renderUrlEntry(route: RouteMeta): string {
  const lastmod = route.kind === 'article' ? (route.modifiedTime ?? route.publishedTime) : undefined;
  const lines = [
    '  <url>',
    `    <loc>${escapeXml(route.canonicalUrl)}</loc>`,
    ...(lastmod ? [`    <lastmod>${escapeXml(lastmod)}</lastmod>`] : []),
    '  </url>',
  ];
  return lines.join('\n');
}

function escapeXml(s: string): string {
  return s.replace(/[&<>"]/g, (c) => XML_ESCAPES[c] ?? c);
}
```

- [ ] **Step 4: Run the sitemap test and verify it passes**

From `apps/web`, run:

```bash
bun x vitest run scripts/build-sitemap.test.ts
```

Expected success indicator:

```txt
PASS  scripts/build-sitemap.test.ts
```

- [ ] **Step 5: Commit the sitemap renderer**

From the repo root, run:

```bash
git add apps/web/scripts/build-sitemap.ts apps/web/scripts/build-sitemap.test.ts
git commit -m "feat: render sitemap from route metadata"
```

Expected success indicator:

```txt
[master
```

### Task 7: Add tested root robots.txt and llms.txt renderers

**Files:**
- Create: `apps/web/scripts/build-robots.ts`
- Create: `apps/web/scripts/build-robots.test.ts`
- Create: `apps/web/scripts/build-llms.ts`
- Create: `apps/web/scripts/build-llms.test.ts`

- [ ] **Step 1: Write the failing robots.txt test**

Create `apps/web/scripts/build-robots.test.ts` with this complete content:

```ts
import { describe, expect, it } from 'vitest';
import { renderRobotsTxt } from './build-robots';

describe('renderRobotsTxt', () => {
  it('allows crawling and points to the canonical sitemap', () => {
    expect(renderRobotsTxt('https://hoatrinh.dev')).toBe(`User-agent: *
Allow: /

Sitemap: https://hoatrinh.dev/sitemap.xml
`);
  });

  it('normalizes trailing slashes on the site URL', () => {
    expect(renderRobotsTxt('https://hoatrinh.dev/')).toContain(
      'Sitemap: https://hoatrinh.dev/sitemap.xml',
    );
  });
});
```

- [ ] **Step 2: Write the failing llms.txt test**

Create `apps/web/scripts/build-llms.test.ts` with this complete content:

```ts
import { describe, expect, it } from 'vitest';
import type { RouteMeta } from '../src/route-meta';
import { renderLlmsTxt } from './build-llms';

const routes: RouteMeta[] = [
  {
    path: '/',
    title: 'Hoa Trinh - Builder',
    description: 'Hoa Trinh. Builder. Brisbane.',
    kind: 'page',
    canonicalUrl: 'https://hoatrinh.dev',
  },
  {
    path: '/blog',
    title: 'Blog - Hoa Trinh',
    description: 'Writing from Hoa Trinh on building, habits, and the work behind the work.',
    kind: 'page',
    canonicalUrl: 'https://hoatrinh.dev/blog',
  },
  {
    path: '/post/ai-made-learning-fun-again',
    title: 'AI made learning fun again - Hoa Trinh',
    description: 'AI made learning fun again after years of friction.',
    kind: 'article',
    canonicalUrl: 'https://hoatrinh.dev/post/ai-made-learning-fun-again',
    publishedTime: '2026-04-30',
    modifiedTime: '2026-04-30',
    section: 'learning',
  },
];

describe('renderLlmsTxt', () => {
  it('keeps guidance short and explicitly blog-first', () => {
    const txt = renderLlmsTxt(routes);

    expect(txt).toContain('# hoatrinh.dev');
    expect(txt).toContain('Best content to fetch first:');
    expect(txt).toContain('- https://hoatrinh.dev/blog - canonical index for writing.');
    expect(txt).toContain(
      '- https://hoatrinh.dev/post/ai-made-learning-fun-again - article page: AI made learning fun again - Hoa Trinh.',
    );
    expect(txt).toContain('Prefer /blog and individual /post/ pages for extraction, citation, and summaries.');
    expect(txt.split('\n')).toHaveLength(13);
  });

  it('does not list non-article routes except the blog index', () => {
    const txt = renderLlmsTxt(routes);

    expect(txt).not.toContain('- https://hoatrinh.dev -');
  });
});
```

- [ ] **Step 3: Run both tests and verify they fail because the renderers are missing**

From `apps/web`, run:

```bash
bun x vitest run scripts/build-robots.test.ts scripts/build-llms.test.ts
```

Expected failure indicators:

```txt
FAIL  scripts/build-robots.test.ts
Cannot find module './build-robots'
FAIL  scripts/build-llms.test.ts
Cannot find module './build-llms'
```

- [ ] **Step 4: Create the robots.txt renderer**

Create `apps/web/scripts/build-robots.ts` with this complete content:

```ts
import { normalizeSiteUrl } from '../src/route-meta';

export function renderRobotsTxt(siteUrl: string): string {
  const normalizedSiteUrl = normalizeSiteUrl(siteUrl);
  return `User-agent: *
Allow: /

Sitemap: ${normalizedSiteUrl}/sitemap.xml
`;
}
```

- [ ] **Step 5: Create the llms.txt renderer**

Create `apps/web/scripts/build-llms.ts` with this complete content:

```ts
import type { RouteMeta } from '../src/route-meta';

export function renderLlmsTxt(routes: RouteMeta[]): string {
  const blogRoute = routes.find((route) => route.path === '/blog');
  const articleRoutes = routes.filter((route) => route.kind === 'article');
  const fetchTargets = [
    ...(blogRoute ? [`- ${blogRoute.canonicalUrl} - canonical index for writing.`] : []),
    ...articleRoutes.map(
      (route) => `- ${route.canonicalUrl} - article page: ${route.title}.`,
    ),
  ];

  return `# hoatrinh.dev

Hoa Trinh's personal site for projects, experience, and writing.

Best content to fetch first:
${fetchTargets.join('\n')}

Guidance:
- Prefer /blog and individual /post/ pages for extraction, citation, and summaries.
- The terminal shell is the visual interface; blog post pages contain the strongest article semantics.
`;
}
```

- [ ] **Step 6: Run both tests and verify they pass**

From `apps/web`, run:

```bash
bun x vitest run scripts/build-robots.test.ts scripts/build-llms.test.ts
```

Expected success indicators:

```txt
PASS  scripts/build-robots.test.ts
PASS  scripts/build-llms.test.ts
```

- [ ] **Step 7: Commit the discovery artifact renderers**

From the repo root, run:

```bash
git add apps/web/scripts/build-robots.ts apps/web/scripts/build-robots.test.ts apps/web/scripts/build-llms.ts apps/web/scripts/build-llms.test.ts
git commit -m "feat: render robots and llms discovery files"
```

Expected success indicator:

```txt
[master
```

### Task 8: Wire discovery artifacts into prerender

**Files:**
- Modify: `apps/web/scripts/prerender.ts`
- Test: `apps/web/scripts/build-sitemap.test.ts`, `apps/web/scripts/build-robots.test.ts`, `apps/web/scripts/build-llms.test.ts`, `apps/web/scripts/shell.test.ts`

- [ ] **Step 1: Update prerender imports, types, route loading, and shell invocation**

Apply this exact diff to `apps/web/scripts/prerender.ts`:

```diff
@@
 import { getBlogPosts } from '@hoatrinh/content';
 import { createServer } from 'vite';
 import solid from 'vite-plugin-solid';
+import type { RouteMeta } from '../src/route-meta';
+import { renderLlmsTxt } from './build-llms';
+import { renderRobotsTxt } from './build-robots';
 import { renderRss } from './build-rss';
+import { renderSitemap } from './build-sitemap';
 import { shellHtml } from './shell';
 
 type RenderResult = { body: string; head: string };
-type RouteDef = { path: string; title: string; description: string };
 type EntryServer = {
   renderUrl: (url: string) => Promise<RenderResult>;
-  getRoutes: () => RouteDef[];
+  getRoutes: (siteUrl?: string) => RouteMeta[];
 };
@@
-const routes = getRoutes();
+const routes = getRoutes(SITE_URL);
 
-async function renderRoute(route: RouteDef) {
+async function renderRoute(route: RouteMeta) {
   const rendered = await renderUrl(route.path);
-  const html = shellHtml(rendered.body, rendered.head, {
-    title: route.title,
-    description: route.description,
-    url: `${SITE_URL}${route.path === '/' ? '' : route.path}`,
-  });
+  const html = shellHtml(rendered.body, rendered.head, route);
```

- [ ] **Step 2: Replace inline sitemap writing and add robots plus llms writers**

Apply this exact diff to `apps/web/scripts/prerender.ts`:

```diff
@@
 async function renderNotFound() {
   const notFound = await renderUrl('/__not_found__');
   await writeFile(
     join(DIST, '404.html'),
     shellHtml(notFound.body, notFound.head, {
+      path: '/404',
       title: 'Not Found',
       description: 'Route not found.',
-      url: `${SITE_URL}/404`,
+      kind: 'page',
+      canonicalUrl: `${SITE_URL}/404`,
     }),
   );
 }
 
 async function writeSitemap() {
-  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
-<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
-${routes.map((r) => `  <url><loc>${SITE_URL}${r.path === '/' ? '' : r.path}</loc></url>`).join('\n')}
-</urlset>
-`;
-  await writeFile(join(DIST, 'sitemap.xml'), sitemap);
+  await writeFile(join(DIST, 'sitemap.xml'), renderSitemap(routes));
 }
@@
 async function writeRss() {
   const posts = getBlogPosts();
   const xml = renderRss(posts, SITE_URL);
   await writeFile(join(DIST, 'rss.xml'), xml);
 }
 
-await Promise.all([...routes.map(renderRoute), renderNotFound(), writeSitemap(), writeRss()]);
-console.log('  wrote sitemap.xml, rss.xml, and 404.html');
+async function writeRobots() {
+  await writeFile(join(DIST, 'robots.txt'), renderRobotsTxt(SITE_URL));
+}
+
+async function writeLlms() {
+  await writeFile(join(DIST, 'llms.txt'), renderLlmsTxt(routes));
+}
+
+await Promise.all([
+  ...routes.map(renderRoute),
+  renderNotFound(),
+  writeSitemap(),
+  writeRss(),
+  writeRobots(),
+  writeLlms(),
+]);
+console.log('  wrote sitemap.xml, rss.xml, robots.txt, llms.txt, and 404.html');
 
 await vite.close();
```

- [ ] **Step 3: Run focused unit tests for the prerender dependencies**

From `apps/web`, run:

```bash
bun x vitest run scripts/shell.test.ts scripts/build-sitemap.test.ts scripts/build-robots.test.ts scripts/build-llms.test.ts src/entry-server.test.ts
```

Expected success indicators:

```txt
PASS  scripts/shell.test.ts
PASS  scripts/build-sitemap.test.ts
PASS  scripts/build-robots.test.ts
PASS  scripts/build-llms.test.ts
PASS  src/entry-server.test.ts
```

- [ ] **Step 4: Run build and prerender to verify root artifacts are written**

From the repo root, run:

```bash
bun run build && bun run prerender
```

Expected success indicators:

```txt
✓ built
wrote sitemap.xml, rss.xml, robots.txt, llms.txt, and 404.html
```

- [ ] **Step 5: Commit the prerender wiring**

From the repo root, run:

```bash
git add apps/web/scripts/prerender.ts
git commit -m "feat: write AI discovery artifacts during prerender"
```

Expected success indicator:

```txt
[master
```

### Task 9: Strengthen blog post article semantics without changing the visual frame

**Files:**
- Modify: `apps/web/src/components/blocks/PostBlock/PostBlock.tsx`
- Test: `apps/web/tests/e2e/blog.spec.ts`

- [ ] **Step 1: Update PostBlock semantic structure**

Apply this exact diff to `apps/web/src/components/blocks/PostBlock/PostBlock.tsx`:

```diff
@@
       </div>
       <div class={styles.body}>
-        <h1 class={styles.title}>{props.data.post.title}</h1>
-        <p class={styles.meta}>
-          {props.data.post.date} · {props.data.post.readingTime} min · {props.data.post.tag}
-        </p>
+        <header>
+          <h1 class={styles.title}>{props.data.post.title}</h1>
+          <p class={styles.meta}>
+            <time datetime={props.data.post.date}>{props.data.post.date}</time> ·{' '}
+            {props.data.post.readingTime} min · {props.data.post.tag}
+          </p>
+        </header>
         <hr class={styles.rule} />
         <div class={styles.content} innerHTML={props.data.post.bodyHtml} />
       </div>
-      <div class={styles.footer}>
+      <footer class={styles.footer}>
         <a href="/blog">← back to /blog</a>
-      </div>
+      </footer>
     </article>
   );
 }
```

- [ ] **Step 2: Run the existing static blog e2e test suite after build and prerender**

From the repo root, run:

```bash
bun run build && bun run prerender && bun run e2e -- apps/web/tests/e2e/blog.spec.ts
```

Expected success indicators:

```txt
✓ built
wrote sitemap.xml, rss.xml, robots.txt, llms.txt, and 404.html
5 passed
```

- [ ] **Step 3: Commit the semantic article markup change**

From the repo root, run:

```bash
git add apps/web/src/components/blocks/PostBlock/PostBlock.tsx
git commit -m "feat: strengthen blog post article markup"
```

Expected success indicator:

```txt
[master
```

### Task 10: Add a post-prerender AI fetch verifier with tests

**Files:**
- Create: `apps/web/scripts/verify-ai-fetch.ts`
- Create: `apps/web/scripts/verify-ai-fetch.test.ts`

- [ ] **Step 1: Write failing verifier tests**

Create `apps/web/scripts/verify-ai-fetch.test.ts` with this complete content:

```ts
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { afterEach, describe, expect, it } from 'vitest';
import { verifyAiFetch } from './verify-ai-fetch';

let tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.map((dir) => rm(dir, { recursive: true, force: true })));
  tempDirs = [];
});

async function createValidDist(): Promise<string> {
  const dist = await mkdtemp(join(tmpdir(), 'ai-fetch-dist-'));
  tempDirs.push(dist);

  await mkdir(join(dist, 'post', 'ai-made-learning-fun-again'), { recursive: true });
  await writeFile(
    join(dist, 'robots.txt'),
    `User-agent: *
Allow: /

Sitemap: https://hoatrinh.dev/sitemap.xml
`,
  );
  await writeFile(
    join(dist, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://hoatrinh.dev/blog</loc></url>
  <url><loc>https://hoatrinh.dev/post/ai-made-learning-fun-again</loc><lastmod>2026-04-30</lastmod></url>
</urlset>
`,
  );
  await writeFile(
    join(dist, 'llms.txt'),
    `# hoatrinh.dev

Best content to fetch first:
- https://hoatrinh.dev/blog - canonical index for writing.
- https://hoatrinh.dev/post/ai-made-learning-fun-again - article page: AI made learning fun again - Hoa Trinh.

Guidance:
- Prefer /blog and individual /post/ pages for extraction, citation, and summaries.
`,
  );
  await writeFile(
    join(dist, 'post', 'ai-made-learning-fun-again', 'index.html'),
    `<!doctype html>
<html lang="en">
  <head>
    <title>AI made learning fun again - Hoa Trinh</title>
    <meta name="description" content="AI made learning fun again after years of friction." />
    <meta property="og:type" content="article" />
    <meta property="article:published_time" content="2026-04-30" />
    <meta property="article:section" content="learning" />
    <link rel="canonical" href="https://hoatrinh.dev/post/ai-made-learning-fun-again" />
    <script type="application/ld+json">{"@context":"https://schema.org","@type":"BlogPosting","headline":"AI made learning fun again - Hoa Trinh","description":"AI made learning fun again after years of friction.","url":"https://hoatrinh.dev/post/ai-made-learning-fun-again","datePublished":"2026-04-30"}</script>
  </head>
  <body>
    <article><header><h1>AI made learning fun again</h1><time datetime="2026-04-30">2026-04-30</time></header><footer><a href="/blog">back</a></footer></article>
  </body>
</html>`,
  );

  return dist;
}

describe('verifyAiFetch', () => {
  it('passes when all discovery files and post article surfaces exist', async () => {
    const dist = await createValidDist();

    await expect(verifyAiFetch(dist)).resolves.toEqual({
      checked: ['robots.txt', 'sitemap.xml', 'llms.txt', 'post/ai-made-learning-fun-again/index.html'],
    });
  });

  it('fails when llms.txt does not contain blog-first guidance', async () => {
    const dist = await createValidDist();
    await writeFile(join(dist, 'llms.txt'), '# hoatrinh.dev\n');

    await expect(verifyAiFetch(dist)).rejects.toThrow(
      'llms.txt must mention /blog and individual /post/ pages',
    );
  });

  it('fails when the post HTML has zero or multiple BlogPosting blocks', async () => {
    const dist = await createValidDist();
    const postHtml = join(dist, 'post', 'ai-made-learning-fun-again', 'index.html');
    await writeFile(postHtml, '<html><head></head><body><article></article></body></html>');

    await expect(verifyAiFetch(dist)).rejects.toThrow(
      'post HTML must contain exactly one BlogPosting JSON-LD block',
    );
  });
});
```

- [ ] **Step 2: Run the verifier test and verify it fails because the verifier is missing**

From `apps/web`, run:

```bash
bun x vitest run scripts/verify-ai-fetch.test.ts
```

Expected failure indicator:

```txt
FAIL  scripts/verify-ai-fetch.test.ts
Cannot find module './verify-ai-fetch'
```

- [ ] **Step 3: Create the verifier script**

Create `apps/web/scripts/verify-ai-fetch.ts` with this complete content:

```ts
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export type VerifyAiFetchResult = {
  checked: string[];
};

export async function verifyAiFetch(
  distDir = fileURLToPath(new URL('../dist', import.meta.url)),
): Promise<VerifyAiFetchResult> {
  const robots = await readText(distDir, 'robots.txt');
  assertIncludes(robots, 'Sitemap: https://hoatrinh.dev/sitemap.xml', 'robots.txt must reference sitemap.xml');

  const sitemap = await readText(distDir, 'sitemap.xml');
  assertIncludes(sitemap, 'https://hoatrinh.dev/blog', 'sitemap.xml must include /blog');
  assertIncludes(sitemap, 'https://hoatrinh.dev/post/', 'sitemap.xml must include at least one /post/ URL');

  const llms = await readText(distDir, 'llms.txt');
  assertIncludes(llms, 'Best content to fetch first:', 'llms.txt must include fetch guidance');
  assertIncludes(
    llms,
    'Prefer /blog and individual /post/ pages',
    'llms.txt must mention /blog and individual /post/ pages',
  );

  const postHtmlPath = await firstPostHtmlPath(distDir);
  const postHtml = await readFile(postHtmlPath.absolute, 'utf8');
  assertIncludes(postHtml, '<link rel="canonical"', 'post HTML must contain a canonical link');
  assertIncludes(postHtml, '<meta name="description"', 'post HTML must contain a description meta tag');
  assertIncludes(postHtml, '<meta property="og:type" content="article"', 'post HTML must use og:type article');
  assertIncludes(postHtml, '<meta property="article:published_time"', 'post HTML must contain article publish metadata');
  assertIncludes(postHtml, '<article', 'post HTML must contain article markup');
  assertIncludes(postHtml, '<time datetime="', 'post HTML must contain a datetime time element');

  const blogPostingMatches = postHtml.match(/"@type":"BlogPosting"/g) ?? [];
  if (blogPostingMatches.length !== 1) {
    throw new Error('post HTML must contain exactly one BlogPosting JSON-LD block');
  }

  return {
    checked: ['robots.txt', 'sitemap.xml', 'llms.txt', postHtmlPath.relative],
  };
}

async function readText(distDir: string, relativePath: string): Promise<string> {
  return readFile(join(distDir, relativePath), 'utf8');
}

async function firstPostHtmlPath(distDir: string): Promise<{ absolute: string; relative: string }> {
  const postDir = join(distDir, 'post');
  const entries = await readdir(postDir, { withFileTypes: true });
  const firstPost = entries.find((entry) => entry.isDirectory());
  if (!firstPost) {
    throw new Error('dist/post must contain at least one prerendered post directory');
  }

  const relative = `post/${firstPost.name}/index.html`;
  return { absolute: join(distDir, relative), relative };
}

function assertIncludes(haystack: string, needle: string, message: string): void {
  if (!haystack.includes(needle)) {
    throw new Error(message);
  }
}

if (import.meta.main) {
  const result = await verifyAiFetch();
  console.log(`AI fetch verification passed: ${result.checked.join(', ')}`);
}
```

- [ ] **Step 4: Run the verifier test and verify it passes**

From `apps/web`, run:

```bash
bun x vitest run scripts/verify-ai-fetch.test.ts
```

Expected success indicator:

```txt
PASS  scripts/verify-ai-fetch.test.ts
```

- [ ] **Step 5: Commit the verifier**

From the repo root, run:

```bash
git add apps/web/scripts/verify-ai-fetch.ts apps/web/scripts/verify-ai-fetch.test.ts
git commit -m "test: verify prerendered AI fetch surfaces"
```

Expected success indicator:

```txt
[master
```

### Task 11: Wire the verifier into package scripts and CI

**Files:**
- Modify: `apps/web/package.json`
- Modify: `package.json`
- Modify: `.github/workflows/ci.yml`

- [ ] **Step 1: Add the web package verifier script**

Apply this exact diff to `apps/web/package.json`:

```diff
@@
-    "prerender": "bun run scripts/prerender.ts",
+    "prerender": "bun run scripts/prerender.ts",
+    "verify:ai-fetch": "bun run scripts/verify-ai-fetch.ts",
     "local:ai": "bun run build && bun run prerender && bunx wrangler pages dev dist",
```

- [ ] **Step 2: Add the root verifier script**

Apply this exact diff to `package.json`:

```diff
@@
-    "prerender": "bun run --filter @hoatrinh/web prerender",
+    "prerender": "bun run --filter @hoatrinh/web prerender",
+    "verify:ai-fetch": "bun run --filter @hoatrinh/web verify:ai-fetch",
     "preview": "bun run --filter @hoatrinh/web preview",
```

- [ ] **Step 3: Add the verifier to CI immediately after prerender**

Apply this exact diff to `.github/workflows/ci.yml`:

```diff
@@
       - run: bun run prerender
         env:
           SITE_URL: ${{ vars.SITE_URL || 'https://hoatrinh.dev' }}
+      - run: bun run verify:ai-fetch
       - name: Install Playwright browsers
         run: bun x playwright install --with-deps chromium
```

- [ ] **Step 4: Run build, prerender, and the new verifier command**

From the repo root, run:

```bash
bun run build && bun run prerender && bun run verify:ai-fetch
```

Expected success indicators:

```txt
✓ built
wrote sitemap.xml, rss.xml, robots.txt, llms.txt, and 404.html
AI fetch verification passed: robots.txt, sitemap.xml, llms.txt, post/ai-made-learning-fun-again/index.html
```

- [ ] **Step 5: Commit script and CI wiring**

From the repo root, run:

```bash
git add apps/web/package.json package.json .github/workflows/ci.yml
git commit -m "ci: verify AI fetch artifacts after prerender"
```

Expected success indicator:

```txt
[master
```

### Task 12: Extend E2E coverage for AI-facing blog extraction surfaces

**Files:**
- Modify: `apps/web/tests/e2e/blog.spec.ts`

- [ ] **Step 1: Add request-level assertions for root discovery files and post HTML**

Append this exact content to the end of `apps/web/tests/e2e/blog.spec.ts`:

```ts

test('serves root AI discovery files with blog-first guidance', async ({ request }) => {
  const robots = await request.get('/robots.txt');
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain('Sitemap: https://hoatrinh.dev/sitemap.xml');

  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.status()).toBe(200);
  const sitemapXml = await sitemap.text();
  expect(sitemapXml).toContain('https://hoatrinh.dev/blog');
  expect(sitemapXml).toContain('https://hoatrinh.dev/post/ai-made-learning-fun-again');
  expect(sitemapXml).toContain('<lastmod>2026-04-30</lastmod>');

  const llms = await request.get('/llms.txt');
  expect(llms.status()).toBe(200);
  const llmsTxt = await llms.text();
  expect(llmsTxt).toContain('Best content to fetch first:');
  expect(llmsTxt).toContain('Prefer /blog and individual /post/ pages');
});

test('post HTML exposes article metadata and semantic article markup', async ({ request }) => {
  const res = await request.get(firstPostPath);
  expect(res.status()).toBe(200);
  const html = await res.text();

  expect(html).toContain(
    '<link rel="canonical" href="https://hoatrinh.dev/post/ai-made-learning-fun-again" />',
  );
  expect(html).toContain('<meta name="description"');
  expect(html).toContain('<meta property="og:type" content="article" />');
  expect(html).toContain('<meta property="article:published_time" content="2026-04-30" />');
  expect(html).toContain('"@type":"BlogPosting"');
  expect(html).toContain('<article');
  expect(html).toContain('<header>');
  expect(html).toContain('<time datetime="2026-04-30">2026-04-30</time>');
  expect(html).toContain('<footer');
});
```

- [ ] **Step 2: Run the blog E2E file after build and prerender**

From the repo root, run:

```bash
bun run build && bun run prerender && bun run e2e -- apps/web/tests/e2e/blog.spec.ts
```

Expected success indicators:

```txt
✓ built
wrote sitemap.xml, rss.xml, robots.txt, llms.txt, and 404.html
7 passed
```

- [ ] **Step 3: Commit E2E coverage**

From the repo root, run:

```bash
git add apps/web/tests/e2e/blog.spec.ts
git commit -m "test: cover blog AI discovery surfaces"
```

Expected success indicator:

```txt
[master
```

### Task 13: Run full validation in CI order and fix formatting drift

**Files:**
- Verify: all changed files under `apps/web/`, root `package.json`, `.github/workflows/ci.yml`

- [ ] **Step 1: Run typecheck**

From the repo root, run:

```bash
bun run typecheck
```

Expected success indicators:

```txt
@hoatrinh/web typecheck: tsc --noEmit
@hoatrinh/content typecheck: tsc --noEmit
```

- [ ] **Step 2: Run lint**

From the repo root, run:

```bash
bun run lint
```

Expected success indicators:

```txt
Checked
check:contrast
```

- [ ] **Step 3: Run unit tests**

From the repo root, run:

```bash
bun run test
```

Expected success indicator:

```txt
Test Files
```

The final Vitest summary must report zero failed test files.

- [ ] **Step 4: Run build, prerender, verifier, and E2E**

From the repo root, run:

```bash
bun run build && bun run prerender && bun run verify:ai-fetch && bun run e2e
```

Expected success indicators:

```txt
✓ built
wrote sitemap.xml, rss.xml, robots.txt, llms.txt, and 404.html
AI fetch verification passed: robots.txt, sitemap.xml, llms.txt, post/ai-made-learning-fun-again/index.html
passed
```

- [ ] **Step 5: If Biome changed files during an earlier format run, commit the formatting-only drift**

From the repo root, run:

```bash
git status --short
```

Expected success indicator when no formatting drift remains:

```txt
```

If `git status --short` prints changed tracked files created by `bun run format`, run:

```bash
git add apps/web src package.json .github/workflows/ci.yml
git commit -m "style: format AI fetch support changes"
```

Expected success indicator:

```txt
[master
```

### Task 14: Final self-review for spec coverage, placeholder scan, and type consistency

**Files:**
- Verify: `docs/superpowers/specs/2026-05-01-ai-fetch-support-design.md`
- Verify: changed implementation files from Tasks 1 through 13

- [ ] **Step 1: Review spec coverage against the implemented files**

From the repo root, run this exact command:

```bash
bun -e "const checks = [ ['shared route metadata', 'apps/web/src/entry-server.tsx'], ['robots renderer', 'apps/web/scripts/build-robots.ts'], ['llms renderer', 'apps/web/scripts/build-llms.ts'], ['sitemap renderer', 'apps/web/scripts/build-sitemap.ts'], ['article shell metadata', 'apps/web/scripts/shell.ts'], ['post article markup', 'apps/web/src/components/blocks/PostBlock/PostBlock.tsx'], ['post-prerender verifier', 'apps/web/scripts/verify-ai-fetch.ts'], ['CI verifier', '.github/workflows/ci.yml'] ]; for (const [label, file] of checks) console.log(`${label}: ${file}`);"
```

Expected output:

```txt
shared route metadata: apps/web/src/entry-server.tsx
robots renderer: apps/web/scripts/build-robots.ts
llms renderer: apps/web/scripts/build-llms.ts
sitemap renderer: apps/web/scripts/build-sitemap.ts
article shell metadata: apps/web/scripts/shell.ts
post article markup: apps/web/src/components/blocks/PostBlock/PostBlock.tsx
post-prerender verifier: apps/web/scripts/verify-ai-fetch.ts
CI verifier: .github/workflows/ci.yml
```

Confirm each line maps to one approved spec requirement: shared metadata pipeline, root discovery artifacts, article-only post treatment, no blog schema widening, and verification as a product requirement.

- [ ] **Step 2: Scan changed source files for placeholder text without writing the disallowed tokens into this plan**

From the repo root, run:

```bash
bun -e "const files = ['apps/web/src/route-meta.ts','apps/web/src/entry-server.tsx','apps/web/scripts/shell.ts','apps/web/scripts/build-sitemap.ts','apps/web/scripts/build-robots.ts','apps/web/scripts/build-llms.ts','apps/web/scripts/verify-ai-fetch.ts','apps/web/src/components/blocks/PostBlock/PostBlock.tsx']; const banned = ['T'+'BD','T'+'ODO','implement'+' later','fill'+' in details',String.fromCharCode(8230)]; const fs = require('node:fs'); let failed = false; for (const file of files) { const text = fs.readFileSync(file, 'utf8'); for (const needle of banned) { if (text.includes(needle)) { console.error(`${file}: contains ${needle}`); failed = true; } } } if (failed) process.exit(1); console.log('placeholder scan passed');"
```

Expected output:

```txt
placeholder scan passed
```

- [ ] **Step 3: Check type consistency for RouteMeta property names**

From the repo root, run:

```bash
bun run typecheck
```

Expected success indicators:

```txt
@hoatrinh/web typecheck: tsc --noEmit
@hoatrinh/content typecheck: tsc --noEmit
```

- [ ] **Step 4: Commit final review fixes if the review changed files**

From the repo root, run:

```bash
git status --short
```

Expected success indicator when the review found no issues:

```txt
```

If the review required a source or test fix, run:

```bash
git add apps/web package.json .github/workflows/ci.yml
git commit -m "fix: address AI fetch support review findings"
```

Expected success indicator:

```txt
[master
```

## Plan Writer Self-Review

- Spec coverage: The tasks cover the shared route metadata pipeline, root `robots.txt`, root `sitemap.xml`, root `llms.txt`, blog-first guidance, article-only `/post/` metadata, minimal `BlogPosting` JSON-LD, stronger `PostBlock` semantics, no content schema changes, targeted unit tests, post-prerender verification, CI wiring, and E2E coverage.
- Placeholder scan: This plan avoids unresolved fill-in markers in implementation steps and includes a final executable scan that checks changed source files without embedding banned marker strings directly.
- Type consistency: The plan uses one `RouteMeta` shape throughout: `path`, `title`, `description`, `kind`, `canonicalUrl`, `publishedTime`, `modifiedTime`, and `section`. Optional fields are added conditionally or only on article routes to satisfy `exactOptionalPropertyTypes`.
