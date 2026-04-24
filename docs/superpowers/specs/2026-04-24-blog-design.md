# Blog listing & post detail - design

Status: approved via `/superpowers:brainstorming` on 2026-04-24.
Scope: add a terminal-native blog to hoatrinh.dev. Listing at `/blog`, detail at `/post/<slug>`. First post is a "minor daily habits" piece; author commits to one new post per week.

## Goals

- One new content type (`blog`) that mirrors the existing `projects` / `experience` content pipeline and the existing `projects` + `project <slug>` command duality.
- A listing view that feels substantial from post #1 and scales to ~50 posts without becoming a card wall.
- A post detail view that is readable for long-form prose without breaking the terminal aesthetic.
- A small, visible cadence indicator that makes the weekly-posting promise legible to both the reader and the author.
- Keep the existing pattern intact: every route maps to a single command; SSR/prerender is derived from `getRoutes()`.

## Non-goals (v1)

RSS feed, sharing/social widgets, comments, view counts, search, tag-filter routes, post series, author bylines, cover images, code-block copy buttons, per-post OG images, prev/next footer rendering. The data for prev/next is threaded through so the footer can flip on later without schema change.

## Data model

### Content folder

```
packages/content/markdown/blog/<slug>.md
```

Filename stem MUST equal the `slug` frontmatter field. Throws on mismatch at load time, matching `projects.ts`.

### Frontmatter schema (`packages/content/src/schema.ts`)

```ts
blogPostSchema = z.object({
  slug: z.string().regex(/^[a-z0-9][a-z0-9-]*$/),
  title: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  excerpt: z.string().min(1).max(160),
  tag: z.string().regex(/^[a-z0-9][a-z0-9-]*$/),
  readingTime: z.number().int().positive().optional(),
  draft: z.boolean().optional(),
});
```

### Loader (`packages/content/src/blog.ts`)

- Uses `import.meta.glob('../markdown/blog/*.md', { eager: true, query: '?raw' })` + `loadMarkdownEntity` (same as `projects.ts`).
- `readingTime` auto-computed when absent: `Math.max(1, Math.round(wordCount / 220))` over the raw body (pre-markdown render). Explicit value in frontmatter wins.
- Drafts filtered out of exports. A `draft: true` post is not in the list, not in `getRoutes()`, not reachable by `post <slug>`.
- Exports:
  - `getBlogPosts(): BlogPost[]` - sorted newest-first by `date`, drafts excluded.
  - `getBlogPost(slug: string): BlogPost | undefined` - drafts excluded.
  - `BlogPost` type: all frontmatter fields plus `bodyHtml: string` (rendered via existing `markdown-render.ts` pipeline).
- Re-exported from `packages/content/src/index.ts`.

## Commands & routes

### Command specs (`apps/web/src/terminal/commands.ts`)

```ts
{ name: 'blog',
  aliases: ['posts', 'writing', 'b'],
  summary: 'Things I write',
  route: '/blog',
  handler: blogHandler }

{ name: 'post',
  aliases: ['read'],
  summary: 'Read a post',
  argsHint: '<slug>',
  route: (args) => args[0] ? `/post/${args[0].toLowerCase()}` : null,
  handler: postHandler }
```

`blog` is listed in `help`. `post` is not listed (requires a slug), matching the existing `project` behaviour.

### Handlers

- `blogHandler` → returns `BlogListEntry`. Computes cadence: `{ targetDays: 7, postCount, latestDate, nextBy }` where `nextBy = addDays(latestDate, 7)`. Empty list → `postCount: 0`, `latestDate: ''`, `nextBy: todayISO()`.
- `postHandler` → resolves slug via `getBlogPost(slug)`. Unknown slug produces an `ErrorEntry` with `nearestMatches` drawn from all known slugs (same pattern as `projectHandler`). Known slug returns `PostEntry` containing fully-resolved fields plus `prev` / `next` neighbour refs computed from `getBlogPosts()`.

### App routing (`apps/web/src/App.tsx`)

Replace the current catch-all-only setup with explicit routes so `/post/:slug` can forward the slug into the initial command. Existing routes become explicit:

```tsx
<Route path="/" component={() => <TerminalPage />} />
<Route path="/about" component={() => <TerminalPage initialCommand="about" />} />
<Route path="/projects" component={() => <TerminalPage initialCommand="projects" />} />
<Route path="/project/:slug" component={(p) => <TerminalPage initialCommand={`project ${p.params.slug}`} />} />
<Route path="/experience" component={() => <TerminalPage initialCommand="experience" />} />
<Route path="/skills" component={() => <TerminalPage initialCommand="skills" />} />
<Route path="/contact" component={() => <TerminalPage initialCommand="contact" />} />
<Route path="/help" component={() => <TerminalPage initialCommand="help" />} />
<Route path="/blog" component={() => <TerminalPage initialCommand="blog" />} />
<Route path="/post/:slug" component={(p) => <TerminalPage initialCommand={`post ${p.params.slug}`} />} />
<Route path="/*" component={() => <TerminalPage initialCommand="help" />} />
```

`initialCommand` already runs synchronously during component setup, which is SSR-critical; this change only broadens which URLs resolve.

### SSR / prerender (`apps/web/src/entry-server.tsx`)

`getRoutes()` extends to include:

- `/blog`
- `/post/<slug>` for each post returned by `getBlogPosts()` (drafts already filtered).

Sitemap picks these up automatically since it iterates `getRoutes()`. `scripts/prerender.ts` needs no change.

## UI

### New entry types (`apps/web/src/terminal/entries.ts`)

```ts
BlogListEntry = BaseEntry & {
  kind: 'blog-list';
  data: {
    cadence: { targetDays: 7; postCount: number; latestDate: string; nextBy: string };
    posts: Array<{
      slug: string;
      title: string;
      date: string;        // ISO
      tag: string;
      excerpt: string;
      readingTime: number; // minutes
    }>;
  };
};

PostEntry = BaseEntry & {
  kind: 'post';
  data: {
    slug: string;
    title: string;
    date: string;          // ISO
    tag: string;
    readingTime: number;
    bodyHtml: string;
    prev?: { slug: string; title: string };
    next?: { slug: string; title: string };
  };
};
```

Both added to the `TerminalEntry` discriminated union. `EntryRenderer` gains a `case 'blog-list'` and `case 'post'`.

### BlogListBlock (`apps/web/src/components/blocks/BlogListBlock/`)

Renders within the default entry width (no opt-out). Two stacked parts:

**Cadence header** - a small framed sub-block:
- `background: var(--bg-elevated)`, `border: 1px solid var(--border-default)`, `border-radius: var(--radius-sm)`.
- Left-edge amber rule: `box-shadow: inset 2px 0 0 var(--accent-primary)` (prompt-bar pattern).
- One line, `padding: var(--space-2) var(--space-3)`, `--font-code`, `--text-xs`.
- Content: `cadence: weekly   posts: <n>   last: <YYYY-MM-DD>   next by: <YYYY-MM-DD>`.
- Labels in `--text-muted`, values in `--text-primary`.
- `nextBy` text color switches to `--state-warning` when `new Date() > nextBy` (stale-cadence self-nag). No animation.
- Empty state: `cadence: weekly   posts: 0   next by: <today>` and the posts block renders one muted line `no posts yet - check back soon.`

**Post rows** - one `<a href="/post/{slug}">` per post:
- `padding-block: var(--space-3)`, separator `border-top: 1px solid var(--border-default)` between rows.
- Line 1: `--text-xs`, `--text-muted`, `--font-code` - `${date} · ${readingTime} min · ${tag}`.
- Line 2: `--text-md`, `--text-primary`, `--font-code` - title.
- Line 3: `--text-sm`, `--text-muted`, `--font-ui` - excerpt; `white-space: nowrap; overflow: hidden; text-overflow: ellipsis` so long excerpts clamp to one line.
- Hover: border shifts to `--border-strong`, title follows the global link-hover rule (magenta with 0.4-opacity magenta text-shadow). `transition: border-color 120ms ease-out`.
- Focus: outline `2px solid var(--accent-primary)` with `outline-offset: 2px`.

### PostBlock (`apps/web/src/components/blocks/PostBlock/`)

Opts out of the normal entry width for prose readability. Single framed wrapper:
- `max-inline-size: 680px`, `background: var(--bg-elevated)`, `border: 1px solid var(--border-default)`, `border-radius: var(--radius-sm)`.
- Left-edge amber rule: `box-shadow: inset 2px 0 0 var(--accent-primary)`.

Three internal parts separated by `border: 1px solid var(--border-default)`:

1. **Header bar** - decorative filename. `padding: var(--space-2) var(--space-3)`, `--font-code`, `--text-xs`.
   - Content: `$ open post/<slug>.md`. `$` in `--text-dim`, `open` in `--accent-primary`, path in `--text-muted`.
   - Not runnable, purely evokes "you opened a file."

2. **Body** - `padding: var(--space-5) var(--space-6)`.
   - H1 title, `--text-2xl`, `--font-ui`, `--text-primary`.
   - Meta line, `--text-xs`, `--text-muted`, `--font-code`: `${date} · ${readingTime} min · ${tag}`. Tag is plain text (not a link in v1).
   - Horizontal rule, `border-top: 1px solid var(--border-default)`, `margin-block: var(--space-4)`.
   - Rendered markdown body via existing `markdown-render.ts` (shiki code blocks, inline code on `--bg-subtle`).
   - Prose typography: `--font-ui`, `--text-md` (bumped from default 14), `line-height: 1.7`.
   - Links inside body follow the global amber→magenta-hover rule.

3. **Footer** - `padding: var(--space-3) var(--space-6)`, `--font-code`, `--text-xs`.
   - Single line: `<a href="/blog">← back to /blog</a>`.
   - Prev/next data is available on the entry but not rendered in v1; flipping it on is a CSS-and-JSX-only change later.

### Sketches

Listing:

```
┃ cadence: weekly   posts: 1   last: 2026-04-27   next by: 2026-05-04
──────────────────────────────────────────────
  2026-04-27 · 4 min · habits
  The small habits I keep on rails
  Why I wired my mornings to Todoist, and what I'd cut if I had to.
──────────────────────────────────────────────
```

Post:

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ $ open post/the-small-habits-i-keep-on-rails.md       ┃
┠───────────────────────────────────────────────────────┨
┃  The small habits I keep on rails                     ┃
┃  2026-04-27 · 4 min · habits                          ┃
┃  ───                                                  ┃
┃  [body paragraphs, shiki code blocks, etc.]           ┃
┠───────────────────────────────────────────────────────┨
┃ ← back to /blog                                       ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

## Design-system compliance

All colors via CSS custom properties from `tokens.css`. No hex literals. No `box-shadow` neon glow; only the allowed `inset` amber edge rule and text-shadow on link hover. Hover transitions ≤200ms. `border-radius` uses `--radius-sm` (never 0). Fonts are Space Mono / JetBrains Mono only - no new families. Scanline and grid background rules untouched.

## Tests

**Unit (content package):** `packages/content/src/blog.test.ts`
- Schema happy path parses a valid post.
- Filename stem must match `slug`; throws on mismatch.
- `draft: true` posts excluded from `getBlogPosts()` and `getBlogPost()`.
- Auto-computed reading time ≥ 1; explicit `readingTime` overrides the auto value.
- Posts are returned sorted newest-first by `date`.

**Unit (handlers):**
- `blog.test.ts`: cadence math for `postCount: 0` (empty state), `postCount: 1` (single post, `nextBy = latest + 7d`), stale case (`latestDate` > 7 days ago → handler still returns a `nextBy`; staleness styling is block-level).
- `post.test.ts`: known slug → `PostEntry` with populated body HTML and correct prev/next refs at list ends (undefined at boundaries). Unknown slug → `ErrorEntry` with `nearestMatches` drawn from post slugs.

**Component:**
- `BlogListBlock.test.tsx`: renders cadence labels/values, a row per post with correct metadata, row anchor `href` points to `/post/{slug}`, stale `nextBy` gets the warning-colored class.
- `PostBlock.test.tsx`: renders title, meta line, body HTML (via `innerHTML`), back-link `href="/blog"`, header bar shows slug-derived filename.

**E2E:** `apps/web/tests/e2e/blog.spec.ts`
- Navigate to `/blog`, assert cadence line and at least one post row are present.
- Click the first post row; assert URL is `/post/<slug>` and the H1 matches the post title.

## Files

**Added**

```
packages/content/markdown/blog/the-small-habits-i-keep-on-rails.md
packages/content/src/blog.ts
packages/content/src/blog.test.ts
apps/web/src/terminal/handlers/blog.ts
apps/web/src/terminal/handlers/blog.test.ts
apps/web/src/terminal/handlers/post.ts
apps/web/src/terminal/handlers/post.test.ts
apps/web/src/components/blocks/BlogListBlock/index.tsx
apps/web/src/components/blocks/BlogListBlock/BlogListBlock.module.css
apps/web/src/components/blocks/BlogListBlock/BlogListBlock.test.tsx
apps/web/src/components/blocks/PostBlock/index.tsx
apps/web/src/components/blocks/PostBlock/PostBlock.module.css
apps/web/src/components/blocks/PostBlock/PostBlock.test.tsx
apps/web/tests/e2e/blog.spec.ts
```

**Modified**

```
packages/content/src/schema.ts                 # + blogPostSchema
packages/content/src/index.ts                  # re-export BlogPost / getBlogPosts / getBlogPost
apps/web/src/terminal/commands.ts              # + blog, post specs
apps/web/src/terminal/entries.ts               # + BlogListEntry, PostEntry in union
apps/web/src/components/EntryRenderer/index.tsx # + 2 cases
apps/web/src/App.tsx                           # explicit routes for all commands
apps/web/src/entry-server.tsx                  # getRoutes() includes /blog + /post/<slug>
```

## Open items deferred to later changes

- Prev/next footer rendering (data already threaded).
- RSS feed (new prerender step, same post list).
- Per-post OG meta (requires extending `shell.ts` injection beyond the current single og:title).
- Tag-filter routes (`/blog/tag/<x>`) when post volume justifies it.
