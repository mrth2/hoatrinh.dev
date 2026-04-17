# hoatrinh.dev — MVP Implementation Design

**Date:** 2026-04-17
**Status:** Design approved, ready for implementation planning
**Inputs:** `specs/ai_terminal_portfolio_spec.md`, `specs/hoatrinh_terminal_design_system.md`

This document is the implementation-level design for the MVP of `hoatrinh.dev`. It translates the product spec and design system into concrete architecture, file layout, interfaces, and quality gates. Every decision recorded here has an identified owner (product spec, design system, or brainstorming decision) so reviewers can trace the "why".

---

## 1. Goals and non-goals (recap)

The product spec is the source of truth for goals. Summary:

- Terminal-native portfolio. Prompt is the primary interaction.
- Works without AI. AI is a V2 enhancement layer only.
- Fast, lightweight, keyboard-first.
- Accessible: WCAG 2.2 AA text contrast, full keyboard navigation, reduced-motion respected.
- Maintainable: content in structured local sources, single source of truth.
- SEO-friendly: static HTML per route, shareable deep links.

Out of scope for MVP: AI Q&A, blog, theming, streamed responses, personalisation, CMS.

---

## 2. Decisions made during brainstorming

Each bullet is a decision reached with the user on 2026-04-17. These override any default assumption that might read differently in the source specs.

| # | Decision | Rationale |
|---|----------|-----------|
| D1 | Content sourced from LinkedIn profile, current `hoatrinh.dev` site, GitHub (mrth2), and the `keepgoing` + `win95.fun` side projects | User directs — LinkedIn unlikely to be scrape-accessible, so pastes will fill gaps |
| D2 | Deploy target: **Cloudflare Pages**, with V2 AI as a separate Cloudflare Worker | Fast edge, cheap AI cost envelope, clean isolation between site and AI endpoint |
| D3 | Landing state: auto-run `about` at load — `> about` echo visible, then profile block, then empty prompt | Gives real content immediately without a fake typing animation; teaches the interaction model by example |
| D4 | URLs mirror commands; each route pre-renders via SSG (`/about`, `/projects`, `/project/:slug`, `/experience`, `/skills`, `/contact`, `/help`) | SEO-meaningful for recruiters; deep links shareable; "command → URL" reinforces mental model |
| D5 | Content model: co-located Markdown with Zod-validated frontmatter for prose entities (profile, projects, experience); pure TS modules for structured-only content (skills, links) | One file per entity, natural prose, strong typing — the spec's "hybrid" phrasing, resolved to its simplest form |
| D6 | Session persistence: **sessionStorage** (per-tab), command input history only; visible output resets on reload | Faithful to terminal per-process semantics; deep links handle cross-session "resume" use case |
| D7 | Command parser: minimal word-parser + remainder-arg (for V2 `ask <question>`). No flags, no quotes, no pipes. Command name case-insensitive | Covers every MVP command with minimal parser surface |
| D8 | Quality bar: Vitest unit tests on parser/registry/handlers/content schemas + one Playwright smoke test per critical surface | B would let UI silently break; D is overkill for a single-author portfolio |
| D9 | Stack: plain Solid + Vite + Bun + TypeScript (no SolidStart) | Matches spec verbatim; SolidStart's Vinxi/Nitro layer is unnecessary overhead for ~15 static routes. Custom prerender script replaces meta-framework SSG |
| D10 | Monorepo via Bun workspaces — `apps/web` now, room for `apps/ai-worker` (V2) and additional apps/packages | User-directed; V2 Worker will share the content package |
| D11 | Terminal engine model: **Approach A** — typed entries (discriminated union), pure-function command handlers, dispatcher-based rendering | Commands are unit-testable without DOM; same data path feeds both client terminal and SSG routes |
| D12 | Lint + format via Biome (single tool, native Bun integration) | Lightweight; swappable to ESLint+Prettier later if preference changes |
| D13 | No masthead, no footer. The prompt label is the identity line. `help` footer line holds stack credits for the curious | Pure terminal expression; matches spec's "not a stack of promotional sections" |
| D14 | Native browser caret, `caret-color: var(--accent-primary)` | Accessible, respects system blink-rate, no fake-cursor positioning bugs |

---

## 3. Repository structure

```
hoatrinh.dev/
├── package.json              # root workspace declaration
├── bun.lock
├── tsconfig.base.json        # shared compiler options
├── biome.json                # lint + format config
├── .gitignore
├── .github/
│   └── workflows/
│       └── ci.yml
├── specs/                    # product + design system specs (inputs)
│   ├── ai_terminal_portfolio_spec.md
│   ├── hoatrinh_terminal_design_system.md
│   └── 2026-04-17-hoatrinh-portfolio-design.md   # this doc
├── apps/
│   └── web/
│       ├── src/
│       ├── public/
│       ├── scripts/
│       │   └── prerender.ts
│       ├── tests/
│       ├── vite.config.ts
│       ├── playwright.config.ts
│       ├── tsconfig.json
│       └── package.json
└── packages/
    └── content/
        ├── src/
        ├── markdown/
        ├── tsconfig.json
        └── package.json
```

**V2 additions (not built in MVP, but the structure accommodates them):**

- `apps/ai-worker/` — Cloudflare Worker providing grounded `ask` endpoint
- `apps/web/src/routes/blog/` and `packages/content/markdown/writing/` — blog
- `packages/ai-grounding/` — shared grounding-context builder if it grows beyond a single file

---

## 4. Tooling

- **Bun** — package manager, script runtime, test runtime. Workspaces declared in root `package.json`.
- **Vite** — dev server and build for `apps/web`. Required by Solid; not replaced by the monorepo tooling.
- **TypeScript** — strict mode. Project references from `tsconfig.base.json`.
- **Biome** — lint + format. One config at repo root.
- **Vitest** — unit tests, executed on Bun.
- **Playwright** — smoke E2E against built + prerendered output.
- **`@fontsource/space-mono`, `@fontsource/jetbrains-mono`** — self-hosted web fonts, Latin subset only.

No Turborepo or Nx. Root `package.json` scripts use `bun run --filter` for per-workspace commands; the monorepo is small enough that task orchestration is unnecessary.

---

## 5. Content model (`packages/content`)

### 5.1 Responsibility

- Provide typed, validated content to `apps/web` at build time (for SSG + runtime data).
- Provide the same content to the V2 `apps/ai-worker` at runtime (as grounding context).
- Fail the build if any content is malformed.

### 5.2 File layout

```
packages/content/
├── src/
│   ├── schema.ts          # Zod schemas for all entities
│   ├── loaders.ts          # Markdown glob + frontmatter parse + validation
│   ├── markdown-render.ts  # Markdown → HTML at build time (shiki for code blocks)
│   ├── profile.ts          # singleton loader
│   ├── projects.ts         # collection loader + sort
│   ├── experience.ts       # collection loader + sort
│   ├── skills.ts           # structured-only (TS data)
│   ├── links.ts            # structured-only (TS data)
│   ├── grounding.ts        # V2: compact text bundle for AI
│   └── index.ts
├── markdown/
│   ├── profile.md
│   ├── projects/
│   │   ├── keepgoing.md
│   │   ├── win95-fun.md
│   │   └── ...
│   └── experience/
│       ├── oneqode-2024.md
│       └── ...
└── package.json
```

### 5.3 Schemas

```ts
// schema.ts — these shapes are the MVP contract.
// Additional fields are a post-MVP concern handled by schema evolution.

export const ProjectFrontmatter = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string(),
  tagline: z.string().max(140),
  status: z.enum(['active', 'archived', 'experimental']),
  role: z.string(),
  year: z.number().int(),
  tech: z.array(z.string()),
  links: z
    .object({
      live: z.string().url().optional(),
      repo: z.string().url().optional(),
    })
    .default({}),
  featured: z.boolean().default(false),
});
export type Project = z.infer<typeof ProjectFrontmatter> & { bodyHtml: string };

export const ExperienceFrontmatter = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  company: z.string(),
  title: z.string(),
  start: z.string().regex(/^\d{4}-\d{2}$/),  // YYYY-MM
  end: z.union([z.string().regex(/^\d{4}-\d{2}$/), z.literal('present')]),
  location: z.string().optional(),
  tech: z.array(z.string()).default([]),
  highlights: z.array(z.string()).max(6),
});
export type Experience = z.infer<typeof ExperienceFrontmatter> & { bodyHtml: string };

export const ProfileFrontmatter = z.object({
  name: z.string(),
  role: z.string(),
  location: z.string(),
  pronouns: z.string().optional(),
  email: z.string().email().optional(),
  links: z.array(z.object({ label: z.string(), href: z.string().url() })),
});
export type Profile = z.infer<typeof ProfileFrontmatter> & { bodyHtml: string };

export type SkillGroup = { label: string; items: string[] };
export type Link = { label: string; href: string; kind: 'email' | 'social' | 'code' | 'other' };
```

### 5.4 Loader mechanics

- `import.meta.glob('./markdown/projects/*.md', { eager: true, query: '?raw', import: 'default' })` inlines all Markdown at build time.
- `gray-matter` parses frontmatter; Zod validates. Validation errors throw — the build refuses to ship malformed content.
- Markdown body is pre-rendered to HTML at build time using `marked` (or `markdown-it`) with a safe subset. Code blocks are highlighted with `shiki` using a theme derived from the portfolio's design tokens.
- Loader exports expose fully typed objects with a pre-rendered `bodyHtml` string.

### 5.5 Public API

```ts
getProfile(): Profile;
getProjects(opts?: { featured?: boolean }): Project[];   // sorted: featured first, then year desc
getProject(slug: string): Project | undefined;
getExperience(): Experience[];                            // sorted: start desc
getSkills(): SkillGroup[];
getLinks(): Link[];
getGroundingContext(): string;   // V2 — summarised bundle for AI prompt
```

### 5.6 Validation at build time

The content package has a `validate` script run as part of CI and the main build. It imports every loader (triggering Zod validation on every file) and additionally enforces:

- filename-stem matches `frontmatter.slug` for collections
- no duplicate slugs in a collection
- no duplicate keys in `skills.ts` / `links.ts`

Any failure aborts the build with a clear message pointing to the file.

---

## 6. Terminal engine (`apps/web/src/terminal`)

### 6.1 State

```ts
type TerminalState = {
  entries: TerminalEntry[];   // visible output blocks, in insertion order
  history: string[];          // input history, persisted to sessionStorage
  historyCursor: number;      // -1 = not navigating; 0 = most recent
  historyDraft: string;       // in-progress input stashed when user starts Up-arrow navigation
  currentInput: string;
  isExecuting: boolean;       // true while async handlers run (V2)
};
```

Created via `createStore` from `solid-js/store`.

### 6.2 Entry union

```ts
type BaseEntry = { id: string; input: string };

type TerminalEntry =
  | (BaseEntry & { kind: 'profile';    data: Profile })
  | (BaseEntry & { kind: 'projects';   data: Project[] })
  | (BaseEntry & { kind: 'project';    data: Project })
  | (BaseEntry & { kind: 'experience'; data: Experience[] })
  | (BaseEntry & { kind: 'skills';     data: SkillGroup[] })
  | (BaseEntry & { kind: 'contact';    data: Link[] })
  | (BaseEntry & { kind: 'help';       data: CommandListing })
  | (BaseEntry & { kind: 'text';       lines: string[] })
  | (BaseEntry & { kind: 'error';      message: string; suggestions: string[] });
```

Every entry carries the originating `input` string so the rendered block can show `> about` echo above the body.

### 6.3 Command contract

```ts
type CommandContext = { content: ContentAPI /* V2: aiClient, navigate */ };

type CommandResult = TerminalEntry | Promise<TerminalEntry> | { action: 'clear' };

type CommandSpec = {
  name: string;
  aliases?: string[];
  summary: string;
  argsHint?: string;
  handler: (args: string[], rest: string, ctx: CommandContext) => CommandResult;
};
```

`{ action: 'clear' }` is the only escape-hatch return; everything else returns a typed entry.

### 6.4 Command registry (MVP)

| Name       | Aliases  | Args      | Handler outcome            |
|------------|----------|-----------|----------------------------|
| `help`     |          |           | `{ kind: 'help', data }`   |
| `about`    | `whoami` |           | `{ kind: 'profile', data }`|
| `projects` | `work`   |           | `{ kind: 'projects', data }`|
| `project`  |          | `<slug>`  | `{ kind: 'project', data }` or error|
| `experience`|`cv`     |           | `{ kind: 'experience', data }`|
| `skills`   | `stack`  |           | `{ kind: 'skills', data }` |
| `contact`  | `links`  |           | `{ kind: 'contact', data }`|
| `clear`    |          |           | `{ action: 'clear' }`      |

Aliases are cheap and improve discoverability.

### 6.5 Parser

```ts
function parseInput(raw: string): { cmd: string; args: string[]; rest: string } | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const parts = trimmed.split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1);                  // lowercased? No — preserve original args
  const rest = trimmed.slice(parts[0].length).trim(); // preserves case and inner whitespace
  return { cmd, args, rest };
}
```

Slug matching in handlers is case-insensitive (all slugs are already lowercase, so the handler lowercases args before lookup).

### 6.6 Execution flow (`execute.ts`)

1. `input = state.currentInput`; clear the input; reset `historyCursor` to -1.
2. If `input.trim() === ''`: append a blank `text` entry (for spacing) and return.
3. Push `input` to `history` (dedupe consecutive duplicates, cap at 50); persist to sessionStorage.
4. `parsed = parseInput(input)`.
5. Look up `parsed.cmd` in the registry (name or alias).
6. Unknown command → append `error` entry. `suggestions` uses Levenshtein distance against known names; threshold ≤ 2.
7. Missing required arg → append `error` entry with the command's `argsHint`.
8. Valid command → invoke handler. If it returns `{ action: 'clear' }`, reset `entries: []`. Otherwise append the entry.
9. If the command corresponds to a route (D4), call `navigate(url)` to reflect state in the URL bar (no reload).

### 6.7 History navigation

- Up: if cursor is -1, stash `currentInput` into `historyDraft`, then set cursor to 0 and load `history[0]`. Subsequent Up increments cursor (older).
- Down: decrement cursor. At cursor -1, restore `historyDraft` into `currentInput`.
- Any non-arrow keystroke resets cursor to -1 and clears `historyDraft`.

### 6.8 Autocomplete

- Tab on a command-name prefix: complete if the match is unambiguous; otherwise append a `text` entry listing candidates (e.g., `Matches: project, projects`).
- Tab on `project <partial>`: complete against known project slugs.
- No inline ghost text in MVP.

### 6.9 File layout

```
apps/web/src/terminal/
├── store.ts
├── parser.ts
├── registry.ts
├── execute.ts
├── history.ts
├── autocomplete.ts
├── suggestions.ts         # Levenshtein nearest-match
├── handlers/
│   ├── about.ts
│   ├── projects.ts
│   ├── project.ts
│   ├── experience.ts
│   ├── skills.ts
│   ├── contact.ts
│   ├── help.ts
│   └── clear.ts
└── index.ts
```

Engine files are plain TypeScript — no Solid primitives outside `store.ts`. Unit-testable with zero DOM setup.

---

## 7. Rendering and routing (`apps/web/src`)

### 7.1 Component tree

```
<App>
  └── <Router>
      └── <TerminalPage initialCommand=...>
          ├── <EntryList>
          │     └── <EntryRenderer entry={e} /> × N
          └── <Prompt />
```

`<TerminalPage>` receives `initialCommand` from the route, executes it once (at build time during SSG, at hydration on client), seeds `entries: [initialEntry]`, then user input drives further state.

### 7.2 EntryRenderer

```tsx
function EntryRenderer(props: { entry: TerminalEntry }) {
  return (
    <article class="entry" data-kind={props.entry.kind}>
      <InputEcho text={props.entry.input} />
      <Switch>
        <Match when={props.entry.kind === 'profile'}>
          <ProfileBlock data={(props.entry as ProfileEntry).data} />
        </Match>
        <Match when={props.entry.kind === 'projects'}>
          <ProjectsBlock data={(props.entry as ProjectsEntry).data} />
        </Match>
        {/* ...one Match per kind */}
      </Switch>
    </article>
  );
}
```

### 7.3 Block components

All in `apps/web/src/components/blocks/`. Each is a pure render function: typed data in, DOM out. No stores, no async, no side effects.

| Block             | Purpose                                                         |
|-------------------|-----------------------------------------------------------------|
| `ProfileBlock`    | Name, role, location, bio (HTML), quick links                   |
| `ProjectsBlock`   | Dense list: slug · title · year · tagline                       |
| `ProjectBlock`    | Full detail: title, meta row, body HTML, links                  |
| `ExperienceBlock` | Timeline of roles with dates + highlights                       |
| `SkillsBlock`     | Grouped columns: languages / frontend / backend / infra / etc.  |
| `ContactBlock`    | Label → link list                                               |
| `HelpBlock`       | Two-column table of commands + summary; footer stack credit     |
| `TextBlock`       | Plain lines                                                     |
| `ErrorBlock`      | `×` + message + suggestion chips (buttons)                      |

All blocks render as terminal-native modules per the design system: thin border, no shadow, restrained accent, dense rows. No card chrome.

### 7.4 Routes

```tsx
<Router>
  <Route path="/"              component={() => <TerminalPage initialCommand="about" />} />
  <Route path="/about"         component={() => <TerminalPage initialCommand="about" />} />
  <Route path="/projects"      component={() => <TerminalPage initialCommand="projects" />} />
  <Route path="/project/:slug" component={(p) => <TerminalPage initialCommand={`project ${p.params.slug}`} />} />
  <Route path="/experience"    component={() => <TerminalPage initialCommand="experience" />} />
  <Route path="/skills"        component={() => <TerminalPage initialCommand="skills" />} />
  <Route path="/contact"       component={() => <TerminalPage initialCommand="contact" />} />
  <Route path="/help"          component={() => <TerminalPage initialCommand="help" />} />
  <Route path="*"              component={NotFoundPage} />
</Router>
```

After first render, typed commands that correspond to routes call `navigate()` to update the URL. Non-routed outcomes (`clear`, errors, future one-offs) don't touch URL state.

### 7.5 SSG prerender (`apps/web/scripts/prerender.ts`)

Invoked via `bun run prerender` after `vite build`.

```ts
import { renderToString } from 'solid-js/web';
import { MetaProvider, renderTags } from '@solidjs/meta';
import { getProjects } from '@hoatrinh/content';
import { App } from '../src/App';
import { shellHtml } from './shell';

const routes = [
  '/', '/about', '/projects', '/experience', '/skills', '/contact', '/help',
  ...getProjects().map(p => `/project/${p.slug}`),
];

for (const route of routes) {
  const tags: any[] = [];
  const body = renderToString(() => (
    <MetaProvider tags={tags}>
      <App url={route} />
    </MetaProvider>
  ));
  await Bun.write(outPath(route), shellHtml(body, renderTags(tags)));
}
// plus a 404.html that Cloudflare Pages serves for unmatched URLs
// plus a sitemap.xml built from the same routes list
```

`shellHtml` wraps the rendered body with `<!DOCTYPE html>`, `<head>` (meta tags, font preloads, Vite's generated CSS/JS tags), and closes with the client hydration bootstrap.

### 7.6 Meta tags per route

Each initial-command code path sets `<Title>` + description + OG tags via `@solidjs/meta`. The prerender harvests them into the output `<head>`. MVP ships with a single default OG image; per-project custom OG cards are deferred.

### 7.7 Fonts

`@fontsource/space-mono` and `@fontsource/jetbrains-mono` — self-hosted, Latin subset. Preloaded in `<head>` for 400 + 700 of the UI face.

### 7.8 Hydration

On first paint, the Vite client bundle hydrates the app. Solid Router takes over client-side navigation. Subsequent route changes happen without reload.

### 7.9 Asset budget

- Initial JS: ≤ 40 KB gzip
- Initial CSS: ≤ 10 KB gzip
- HTML per route: ≤ 20 KB uncompressed
- LCP target: < 1s warm cache, < 2s cold on a mid-range phone

---

## 8. Design system implementation

### 8.1 Styling approach

Plain CSS + CSS variables for tokens; CSS Modules for per-component styles. No Tailwind, no CSS-in-JS runtime. All styling at `apps/web/src/styles/` (globals) and co-located `.module.css` files next to components.

### 8.2 Token file (`apps/web/src/styles/tokens.css`)

Starting values — each contrast pair is verified against WCAG 2.2 AA before MVP launch.

```css
:root {
  /* surfaces */
  --bg-base:        #0a0d0b;
  --bg-elevated:    #121814;
  --bg-subtle:      #171d1a;

  /* borders */
  --border-default: #1f2a23;
  --border-strong:  #2f4036;

  /* text */
  --text-primary:   #d8e1da;
  --text-muted:     #8b9891;
  --text-dim:       #5e6a64;   /* decorative / meta only, never body */

  /* accents */
  --accent-primary:   #6fe0a1;
  --accent-secondary: #7ab8ff;

  /* state */
  --state-success: var(--accent-primary);
  --state-warning: #f0b46a;
  --state-error:   #ff7a7a;
  --state-info:    var(--accent-secondary);

  /* focus */
  --focus-ring-width: 2px;
  --focus-ring-color: var(--accent-primary);
  --focus-offset: 2px;

  /* typography */
  --font-ui:   'Space Mono', ui-monospace, 'SF Mono', Menlo, monospace;
  --font-code: 'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace;

  --text-xs:       12px;
  --text-sm:       13px;
  --text-base:     14px;
  --text-md:       16px;
  --text-lg:       18px;
  --text-xl:       22px;
  --text-2xl:      28px;
  --text-display:  36px;

  --leading-tight:  1.25;
  --leading-normal: 1.55;
  --leading-relaxed: 1.6;

  /* spacing */
  --space-1: 4px;   --space-2: 8px;   --space-3: 12px;
  --space-4: 16px;  --space-5: 20px;  --space-6: 24px;
  --space-8: 32px;  --space-10: 40px; --space-12: 48px;

  /* radius */
  --radius-sm: 2px;
  --radius-md: 4px;
  --radius-lg: 6px;

  /* borders */
  --border-width: 1px;
}
```

### 8.3 Typography roles

| Use                    | Font        | Size           | Weight |
|------------------------|-------------|----------------|--------|
| Body prose             | `--font-ui` | `--text-base`  | 400    |
| Entry input echo       | `--font-code` | `--text-base` | 500  |
| Prompt input           | `--font-code` | `--text-base` desktop / `--text-md` mobile | 400 |
| Prompt label (sigil)   | `--font-code` | `--text-base` | 700  |
| Section headings       | `--font-ui` | `--text-lg`    | 700    |
| Metadata / row meta    | `--font-ui` | `--text-xs`    | 400, `--text-muted` |
| Block titles (project) | `--font-ui` | `--text-xl`    | 700    |

Input is ≥ 16px on mobile to prevent iOS zoom on focus.

### 8.4 Layout chrome

- No masthead.
- No footer.
- Body has a single main column, max-width ≈ 72ch desktop, full-width with `--space-4` gutter on mobile.
- `help` output contains a muted footer line crediting stack ("built with solid, vite, bun, ts").

### 8.5 Background

```css
body {
  color: var(--text-primary);
  font: 400 var(--text-base) / var(--leading-relaxed) var(--font-ui);
  background-color: var(--bg-base);
  background-image:
    radial-gradient(ellipse at top, rgba(111, 224, 161, 0.02), transparent 60%);
}
```

Optional ultra-faint dot grid, kept behind a style token flag in case it reads noisy during QA.

### 8.6 Focus

```css
*:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-offset);
  border-radius: var(--radius-sm);
}
```

Applied globally. No element-specific focus overrides without strong reason.

### 8.7 Caret

```css
.prompt-input {
  caret-color: var(--accent-primary);
  /* no custom block caret */
}
```

### 8.8 Motion

```css
@media (prefers-reduced-motion: no-preference) {
  .entry { animation: entry-in 120ms ease-out; }
}
@keyframes entry-in {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: none; }
}
```

No other animations. No page transitions. No typing effects.

### 8.9 Accessibility model

- `<EntryList>` = `<section role="log" aria-live="polite" aria-atomic="false" aria-label="Terminal output">`.
- Each entry = `<article aria-labelledby="entry-<id>-label">` with a visually hidden `<h2 id="entry-<id>-label">Output of: <command></h2>`.
- `<Prompt>` = `<form>` wrapping `<label>` + `<input>`. Label is visually hidden and reads "Terminal prompt, type a command"; on-screen sigil is a separate decorative element. `aria-describedby` points to a hint element.
- Focus stays on the input after every command — keyboard users never lose position.
- On touch devices, tapping anywhere in `<EntryList>` (outside text selection) focuses the input. On pointer-fine devices, input auto-focuses on page load.
- Color is never sole state carrier: errors prefix `×`, warnings `!`, success `✓`. Screen readers get these as content.
- Clickable suggestion chips are `<button>`s in tab order, not styled divs.
- Tab completion candidates render as a plain text entry — no popup, no combobox ARIA complexity.
- "Skip to prompt" link at top of `<body>` for keyboard users landing mid-scroll.

### 8.10 Input attributes (mobile hygiene)

```html
<input
  autocomplete="off"
  autocorrect="off"
  autocapitalize="none"
  spellcheck="false"
  enterkeyhint="go"
  inputmode="text"
/>
```

---

## 9. Quality gates

### 9.1 Unit tests (Vitest)

- `parser.test.ts` — input strings → parse result matrix (whitespace, empty, case).
- `registry.test.ts` — name + alias resolution, nearest-match suggestions.
- `history.test.ts` — cursor navigation, sessionStorage round-trip, dedupe, cap.
- `handlers/*.test.ts` — one per handler; mock content fixtures; asserts entry shape.
- `content/schema.test.ts` — bad frontmatter fixtures rejected; good fixtures accepted.
- `autocomplete.test.ts` — prefix matching against commands and slugs.

Target: ~80% line coverage on `terminal/` and `content/`. No target on `components/`.

### 9.2 Smoke E2E (Playwright)

- Cold `/` → `about` entry rendered; prompt focused on desktop only.
- Type `projects` + Enter → list renders; URL becomes `/projects`.
- Deep link `/project/<slug>` with JS disabled → project content in prerendered HTML.
- Unknown command → error entry with at least one suggestion chip.
- Up arrow after submitting `about` → input restored to `about`.
- `clear` → entry list empties.
- Keyboard-only: Tab reaches a suggestion chip; Enter activates it.

### 9.3 CI (`.github/workflows/ci.yml`)

On every push/PR:

1. `bun install --frozen-lockfile`
2. `bun run typecheck` (`tsc --noEmit` across workspaces via project references)
3. `bun run lint` (`biome check`)
4. `bun run test` (Vitest)
5. `bun run build` (Vite production)
6. `bun run prerender`
7. `bun run e2e` (Playwright against `bun run preview`)

Single job. Green CI required for merge.

### 9.4 Content validation

Part of the main build (see Section 5.6). Build fails if any Markdown frontmatter violates its Zod schema, if a filename doesn't match its frontmatter slug, or if duplicate slugs/keys appear.

### 9.5 Performance verification

Manual Lighthouse run pre-launch against production URL. Targets:

- Performance ≥ 95
- Accessibility ≥ 95
- Best Practices ≥ 95
- SEO ≥ 95

Lighthouse CI is not added in MVP.

---

## 10. Deployment

### 10.1 Cloudflare Pages

- Connect GitHub repo.
- Build command: `bun install && bun run build && bun run prerender`.
- Build output directory: `apps/web/dist`.
- Environment: `BUN_VERSION` pinned to the local Bun version.
- Preview deploys per PR.
- Production deploys on merge to `master`.
- Custom domain: `hoatrinh.dev` (apex); `www.hoatrinh.dev` redirects to apex via Cloudflare rule.
- Auto HTTPS.
- 404: `dist/404.html` served for unmatched URLs.

### 10.2 Observability

Cloudflare Web Analytics — cookie-free, free tier. No Sentry in MVP.

### 10.3 Local dev

```
bun install
bun run dev                          # Vite dev server for apps/web
bun run test                         # Vitest watch mode
bun run typecheck
bun run build && bun run prerender   # reproduce prod output
```

---

## 11. Explicitly out of scope for MVP

Deferred to V2 or later:

- AI worker (`apps/ai-worker`, grounded `ask <question>`)
- Blog system (`post <slug>`, Markdown writing collection, routes)
- Theme switching
- Per-project OG card images
- Lighthouse CI
- Structured data / JSON-LD
- Sitemap submission to Google Search Console (do once manually post-launch)
- Streamed AI answers
- Personality easter eggs

---

## 12. Open items (tracked, not blocking)

- Final prompt-label form (e.g., `hoa@trinh.dev ~ %`) — confirm during styling pass.
- Exact green hex value — A/B tested against `--bg-base` with a contrast checker before MVP launch.
- Decision to keep or drop the faint dot-grid background — made during first UI QA.
- Shape of V2 `getGroundingContext()` output — designed alongside the AI worker spec, not MVP.

---

## 13. Implementation slicing (input for the plan)

The implementation plan (next skill invocation) will slice roughly along these seams. Listed here so the plan can consume them directly:

1. Repo skeleton: workspaces, tsconfig, biome, CI scaffold.
2. Content package: schemas, loaders, build validation, skills/links data, one seed project markdown.
3. Terminal engine: store, parser, registry, execute, history, autocomplete, handlers (one per command) — all pure TS, unit-tested in isolation.
4. Design tokens + global styles + font setup.
5. Components: Prompt, InputEcho, EntryList, EntryRenderer, each block, NotFoundPage.
6. Routing + TerminalPage integration.
7. SSG prerender script + shellHtml + meta tags per route.
8. Playwright smoke tests.
9. CF Pages integration; DNS; custom domain; analytics.
10. Content authoring: profile + experience + projects (pull from LinkedIn, GitHub, existing site).
11. Pre-launch QA: Lighthouse, keyboard-only pass, a11y scan, content proofread.

Each slice is independently testable. Slices 1–4 unblock 5–7; slices 8–10 run in parallel after slice 7.
