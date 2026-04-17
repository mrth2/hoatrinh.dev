# hoatrinh.dev MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the MVP of `hoatrinh.dev` — a terminal-native portfolio with 8 commands, URL-mirrored routes, and static site generation, deployed to Cloudflare Pages.

**Architecture:** Bun monorepo. `packages/content` provides typed content (Zod schemas + Markdown loaders). `apps/web` is a Solid + Vite SPA that doubles as an SSG-prerendered static site. A typed-entry terminal engine drives both the interactive UI and pre-rendered route HTML via one shared code path.

**Tech Stack:** Bun (workspaces, runtime), TypeScript, Solid, Vite, `@solidjs/router`, `@solidjs/meta`, Zod, gray-matter, marked, shiki, Biome, Vitest, Playwright, Cloudflare Pages.

**Spec reference:** `specs/2026-04-17-hoatrinh-portfolio-design.md` (this plan implements that design verbatim).

---

## Working notes (read once, applies to every task)

**TDD pattern** — every logic-bearing task follows RED → GREEN → commit:
1. Write the failing test first.
2. Run it; confirm it fails with a specific error (not a typo or import error).
3. Write the minimal implementation.
4. Run the test; confirm it passes.
5. Run the full test suite (`bun run test`); confirm nothing regressed.
6. Commit with a Conventional Commits message.

UI/config tasks don't TDD — they follow: write → verify by running the relevant command → commit.

**Test locations:** unit tests are co-located with source (`foo.ts` + `foo.test.ts`). E2E tests live in `apps/web/tests/e2e/`.

**Workspace package name:** `@hoatrinh/content` (scoped). Import it from `apps/web` as `import { getProjects } from '@hoatrinh/content'`.

**Commit message style:** Conventional Commits. `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`. Include a body if the change is non-obvious. Every task ends with exactly one commit.

**Do not skip tests.** If a test is awkward to write, that's a signal the design has a seam issue — raise it at the phase checkpoint rather than skipping.

**Do not edit the design spec.** If the plan diverges from `specs/2026-04-17-hoatrinh-portfolio-design.md`, flag it at the review checkpoint. The spec is the contract.

**Branch:** `master` (renamed from `main`). Commits land directly on master for this project (single-author).

**Bun scripts convention:** commands run from repo root use `bun run --filter <workspace> <script>`. Each workspace has its own scripts. Root `package.json` has fan-out scripts like `bun run test` → runs test in all workspaces.

---

## Phase 1 — Repo skeleton

**Goal:** monorepo boots; `bun install`, `bun run typecheck`, `bun run lint`, `bun run test` all succeed on an empty codebase.

### Task 1.1 — Root `package.json` with workspaces

**Files:**
- Create: `package.json`

- [ ] **Step 1:** Create root `package.json`:

```json
{
  "name": "hoatrinh-dev",
  "private": true,
  "type": "module",
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "bun run --filter @hoatrinh/web dev",
    "build": "bun run --filter @hoatrinh/web build",
    "prerender": "bun run --filter @hoatrinh/web prerender",
    "preview": "bun run --filter @hoatrinh/web preview",
    "test": "bun run --filter '*' test",
    "test:unit": "bun run --filter '*' test:unit",
    "e2e": "bun run --filter @hoatrinh/web e2e",
    "typecheck": "bun run --filter '*' typecheck",
    "lint": "biome check .",
    "format": "biome format --write ."
  },
  "devDependencies": {
    "@biomejs/biome": "latest",
    "typescript": "latest"
  }
}
```

- [ ] **Step 2:** `bun install` and confirm no errors.
- [ ] **Step 3:** Commit:
```bash
git add package.json bun.lock
git commit -m "chore: initialise bun workspaces at repo root"
```

### Task 1.2 — Shared TypeScript config

**Files:**
- Create: `tsconfig.base.json`
- Create: `tsconfig.json` (root, for IDE)

- [ ] **Step 1:** Create `tsconfig.base.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "jsxImportSource": "solid-js",
    "strict": true,
    "noImplicitOverride": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "types": []
  }
}
```

- [ ] **Step 2:** Create root `tsconfig.json`:

```json
{
  "files": [],
  "references": [
    { "path": "./apps/web" },
    { "path": "./packages/content" }
  ]
}
```

- [ ] **Step 3:** Commit:
```bash
git add tsconfig.base.json tsconfig.json
git commit -m "chore: add shared tsconfig.base and root project references"
```

### Task 1.3 — Biome config

**Files:**
- Create: `biome.json`

- [ ] **Step 1:** Create `biome.json`:

```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.0/schema.json",
  "files": {
    "ignore": ["**/dist/**", "**/node_modules/**", "**/.vite/**", "**/playwright-report/**", "**/test-results/**"]
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "style": {
        "useImportType": "error",
        "useNodejsImportProtocol": "error"
      },
      "suspicious": {
        "noExplicitAny": "warn"
      }
    }
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "trailingCommas": "all",
      "semicolons": "always"
    }
  }
}
```

- [ ] **Step 2:** Run `bun run lint`. Expect no files found / clean pass.
- [ ] **Step 3:** Commit:
```bash
git add biome.json
git commit -m "chore: add biome config for lint and format"
```

### Task 1.4 — `packages/content` skeleton

**Files:**
- Create: `packages/content/package.json`
- Create: `packages/content/tsconfig.json`
- Create: `packages/content/src/index.ts`

- [ ] **Step 1:** Create `packages/content/package.json`:

```json
{
  "name": "@hoatrinh/content",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts"
  },
  "scripts": {
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:unit": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "gray-matter": "latest",
    "marked": "latest",
    "shiki": "latest",
    "zod": "latest"
  },
  "devDependencies": {
    "typescript": "latest",
    "vitest": "latest"
  }
}
```

- [ ] **Step 2:** Create `packages/content/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "types": ["vitest/globals"]
  },
  "include": ["src/**/*"]
}
```

- [ ] **Step 3:** Create `packages/content/src/index.ts`:

```ts
export {};
```

- [ ] **Step 4:** `bun install` from repo root.
- [ ] **Step 5:** Run `bun run --filter @hoatrinh/content typecheck`. Expect clean.
- [ ] **Step 6:** Commit:
```bash
git add packages/content/ bun.lock package.json
git commit -m "chore(content): scaffold @hoatrinh/content workspace"
```

### Task 1.5 — `apps/web` skeleton

**Files:**
- Create: `apps/web/package.json`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/vite.config.ts`
- Create: `apps/web/index.html`
- Create: `apps/web/src/entry-client.tsx`
- Create: `apps/web/src/App.tsx`

- [ ] **Step 1:** Create `apps/web/package.json`:

```json
{
  "name": "@hoatrinh/web",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview --port 4173",
    "prerender": "bun run scripts/prerender.ts",
    "e2e": "playwright test",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:unit": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@fontsource/jetbrains-mono": "latest",
    "@fontsource/space-mono": "latest",
    "@hoatrinh/content": "workspace:*",
    "@solidjs/meta": "latest",
    "@solidjs/router": "latest",
    "solid-js": "latest"
  },
  "devDependencies": {
    "@playwright/test": "latest",
    "@solidjs/testing-library": "latest",
    "@testing-library/jest-dom": "latest",
    "jsdom": "latest",
    "typescript": "latest",
    "vite": "latest",
    "vite-plugin-solid": "latest",
    "vitest": "latest"
  }
}
```

- [ ] **Step 2:** Create `apps/web/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "outDir": "./dist-types",
    "rootDir": "./",
    "types": ["vite/client", "vitest/globals", "@testing-library/jest-dom"],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*", "scripts/**/*", "tests/**/*", "vite.config.ts", "playwright.config.ts"],
  "references": [{ "path": "../../packages/content" }]
}
```

- [ ] **Step 3:** Create `apps/web/vite.config.ts`:

```ts
import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solid()],
  resolve: {
    alias: { '@': new URL('./src', import.meta.url).pathname },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
  },
});
```

- [ ] **Step 4:** Create `apps/web/src/test-setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 5:** Create `apps/web/index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>hoatrinh.dev</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/entry-client.tsx"></script>
  </body>
</html>
```

- [ ] **Step 6:** Create `apps/web/src/App.tsx`:

```tsx
export function App() {
  return <div>hoatrinh.dev</div>;
}
```

- [ ] **Step 7:** Create `apps/web/src/entry-client.tsx`:

```tsx
import { render } from 'solid-js/web';
import { App } from './App';

const root = document.getElementById('app');
if (!root) throw new Error('#app root missing');
render(() => <App />, root);
```

- [ ] **Step 8:** `bun install`; then `bun run --filter @hoatrinh/web typecheck`. Expect clean.
- [ ] **Step 9:** `bun run dev` briefly, confirm localhost:5173 serves the page. Kill.
- [ ] **Step 10:** Commit:
```bash
git add apps/web/ bun.lock package.json
git commit -m "chore(web): scaffold @hoatrinh/web workspace with solid + vite"
```

### Task 1.6 — CI workflow

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1:** Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [master]
  pull_request:

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest
      - run: bun install --frozen-lockfile
      - run: bun run typecheck
      - run: bun run lint
      - run: bun run test
      - run: bun run build
      - run: bun run prerender
      - name: Install Playwright browsers
        run: bun x playwright install --with-deps chromium
      - run: bun run e2e
```

- [ ] **Step 2:** Commit:
```bash
git add .github/
git commit -m "ci: add GitHub Actions workflow for typecheck, lint, test, build, e2e"
```

---

## ✋ REVIEW CHECKPOINT — Phase 1

Before proceeding to Phase 2, verify:
- `bun install` succeeds from a clean clone.
- `bun run typecheck` is green across both workspaces.
- `bun run lint` is green.
- `bun run dev` boots and serves the placeholder App.
- Commit history is clean, one commit per task.

---

## Phase 2 — Content package

**Goal:** `@hoatrinh/content` exposes typed `getProfile`, `getProjects`, `getProject`, `getExperience`, `getSkills`, `getLinks`. Markdown content is validated at build time. Seed data exists for one project, one experience, and the profile.

### Task 2.1 — Zod schemas

**Files:**
- Create: `packages/content/src/schema.ts`
- Create: `packages/content/src/schema.test.ts`

- [ ] **Step 1:** Write the failing test first. Create `packages/content/src/schema.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { ExperienceFrontmatter, ProfileFrontmatter, ProjectFrontmatter } from './schema';

describe('ProjectFrontmatter', () => {
  it('accepts a valid project', () => {
    const parsed = ProjectFrontmatter.parse({
      slug: 'keepgoing',
      title: 'KeepGoing',
      tagline: 'A tool for focus',
      status: 'active',
      role: 'Creator',
      year: 2025,
      tech: ['TypeScript', 'Bun'],
      links: { live: 'https://keepgoing.dev', repo: 'https://github.com/mrth2/keepgoing' },
      featured: true,
    });
    expect(parsed.slug).toBe('keepgoing');
  });

  it('rejects an uppercase slug', () => {
    expect(() =>
      ProjectFrontmatter.parse({
        slug: 'KeepGoing',
        title: 't',
        tagline: 't',
        status: 'active',
        role: 'r',
        year: 2024,
        tech: [],
      }),
    ).toThrow();
  });

  it('rejects a tagline over 140 chars', () => {
    expect(() =>
      ProjectFrontmatter.parse({
        slug: 'x',
        title: 't',
        tagline: 'x'.repeat(141),
        status: 'active',
        role: 'r',
        year: 2024,
        tech: [],
      }),
    ).toThrow();
  });

  it('defaults featured to false and links to {}', () => {
    const parsed = ProjectFrontmatter.parse({
      slug: 'x',
      title: 't',
      tagline: 't',
      status: 'active',
      role: 'r',
      year: 2024,
      tech: [],
    });
    expect(parsed.featured).toBe(false);
    expect(parsed.links).toEqual({});
  });
});

describe('ExperienceFrontmatter', () => {
  it('accepts "present" as end', () => {
    const parsed = ExperienceFrontmatter.parse({
      slug: 'oneqode',
      company: 'OneQode',
      title: 'Engineer',
      start: '2024-01',
      end: 'present',
      highlights: ['Shipped X'],
    });
    expect(parsed.end).toBe('present');
  });

  it('rejects start in wrong format', () => {
    expect(() =>
      ExperienceFrontmatter.parse({
        slug: 'x',
        company: 'c',
        title: 't',
        start: '2024',
        end: 'present',
        highlights: [],
      }),
    ).toThrow();
  });

  it('caps highlights at 6', () => {
    expect(() =>
      ExperienceFrontmatter.parse({
        slug: 'x',
        company: 'c',
        title: 't',
        start: '2024-01',
        end: 'present',
        highlights: Array(7).fill('h'),
      }),
    ).toThrow();
  });
});

describe('ProfileFrontmatter', () => {
  it('accepts a complete profile', () => {
    const parsed = ProfileFrontmatter.parse({
      name: 'Hoa Trinh',
      role: 'Software Engineer',
      location: 'Remote',
      email: 'hoa@example.com',
      links: [{ label: 'GitHub', href: 'https://github.com/mrth2' }],
    });
    expect(parsed.name).toBe('Hoa Trinh');
  });
});
```

- [ ] **Step 2:** Run `bun run --filter @hoatrinh/content test`. Expect fail (schema missing).

- [ ] **Step 3:** Create `packages/content/src/schema.ts`:

```ts
import { z } from 'zod';

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
export type ProjectMeta = z.infer<typeof ProjectFrontmatter>;
export type Project = ProjectMeta & { bodyHtml: string };

export const ExperienceFrontmatter = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  company: z.string(),
  title: z.string(),
  start: z.string().regex(/^\d{4}-\d{2}$/),
  end: z.union([z.string().regex(/^\d{4}-\d{2}$/), z.literal('present')]),
  location: z.string().optional(),
  tech: z.array(z.string()).default([]),
  highlights: z.array(z.string()).max(6),
});
export type ExperienceMeta = z.infer<typeof ExperienceFrontmatter>;
export type Experience = ExperienceMeta & { bodyHtml: string };

export const ProfileFrontmatter = z.object({
  name: z.string(),
  role: z.string(),
  location: z.string(),
  pronouns: z.string().optional(),
  email: z.string().email().optional(),
  links: z.array(z.object({ label: z.string(), href: z.string().url() })),
});
export type ProfileMeta = z.infer<typeof ProfileFrontmatter>;
export type Profile = ProfileMeta & { bodyHtml: string };

export type SkillGroup = { label: string; items: string[] };
export type Link = { label: string; href: string; kind: 'email' | 'social' | 'code' | 'other' };
```

- [ ] **Step 4:** Run tests; expect pass.
- [ ] **Step 5:** Commit:
```bash
git add packages/content/src/schema.ts packages/content/src/schema.test.ts
git commit -m "feat(content): add zod schemas for profile, project, experience"
```

### Task 2.2 — Structured data (skills, links)

**Files:**
- Create: `packages/content/src/skills.ts`
- Create: `packages/content/src/links.ts`
- Create: `packages/content/src/skills.test.ts`

- [ ] **Step 1:** Write `packages/content/src/skills.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { getSkills } from './skills';

describe('getSkills', () => {
  it('returns non-empty groups', () => {
    const groups = getSkills();
    expect(groups.length).toBeGreaterThan(0);
    for (const g of groups) {
      expect(g.label).toBeTruthy();
      expect(g.items.length).toBeGreaterThan(0);
    }
  });

  it('has no duplicate group labels', () => {
    const labels = getSkills().map((g) => g.label);
    expect(new Set(labels).size).toBe(labels.length);
  });
});
```

- [ ] **Step 2:** Run tests; expect fail (module missing).

- [ ] **Step 3:** Create `packages/content/src/skills.ts` with a starter matrix (final content comes from user in Phase 10):

```ts
import type { SkillGroup } from './schema';

const skills: SkillGroup[] = [
  { label: 'Languages', items: ['TypeScript', 'JavaScript', 'Go', 'Python'] },
  { label: 'Frontend', items: ['Solid', 'React', 'Vue', 'Vite'] },
  { label: 'Backend', items: ['Node', 'Bun', 'Deno'] },
  { label: 'Infra', items: ['Cloudflare', 'Docker', 'Postgres'] },
];

export function getSkills(): SkillGroup[] {
  return skills;
}
```

- [ ] **Step 4:** Create `packages/content/src/links.ts`:

```ts
import type { Link } from './schema';

const links: Link[] = [
  { label: 'Email', href: 'mailto:hoa@example.com', kind: 'email' },
  { label: 'GitHub', href: 'https://github.com/mrth2', kind: 'code' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/hoa-trinh-dev/', kind: 'social' },
];

export function getLinks(): Link[] {
  return links;
}
```

- [ ] **Step 5:** Run tests; expect pass.
- [ ] **Step 6:** Commit:
```bash
git add packages/content/src/skills.ts packages/content/src/links.ts packages/content/src/skills.test.ts
git commit -m "feat(content): add skills and links structured data (seed values)"
```

### Task 2.3 — Markdown renderer

**Files:**
- Create: `packages/content/src/markdown-render.ts`
- Create: `packages/content/src/markdown-render.test.ts`

- [ ] **Step 1:** Write test `packages/content/src/markdown-render.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { renderMarkdown } from './markdown-render';

describe('renderMarkdown', () => {
  it('renders paragraphs', async () => {
    const html = await renderMarkdown('Hello **world**.');
    expect(html).toContain('<p>');
    expect(html).toContain('<strong>world</strong>');
  });

  it('renders links', async () => {
    const html = await renderMarkdown('[site](https://example.com)');
    expect(html).toContain('<a href="https://example.com"');
  });

  it('does not pass through raw HTML', async () => {
    const html = await renderMarkdown('<script>alert(1)</script>');
    expect(html).not.toContain('<script>');
  });
});
```

- [ ] **Step 2:** Run tests; expect fail.

- [ ] **Step 3:** Create `packages/content/src/markdown-render.ts`:

```ts
import { Marked } from 'marked';

const marked = new Marked({ async: false, gfm: true, breaks: false });
marked.use({
  renderer: {
    html() {
      return '';
    },
  },
});

export async function renderMarkdown(source: string): Promise<string> {
  const result = await marked.parse(source);
  return typeof result === 'string' ? result : await result;
}
```

- [ ] **Step 4:** Run tests; expect pass.
- [ ] **Step 5:** Commit:
```bash
git add packages/content/src/markdown-render.ts packages/content/src/markdown-render.test.ts
git commit -m "feat(content): add markdown-to-html renderer with raw-html stripping"
```

### Task 2.4 — Loader core (glob + frontmatter + validation)

**Files:**
- Create: `packages/content/src/loaders.ts`
- Create: `packages/content/src/loaders.test.ts`
- Create: `packages/content/markdown/__fixtures__/good.md`
- Create: `packages/content/markdown/__fixtures__/bad.md`

- [ ] **Step 1:** Create fixtures.

`packages/content/markdown/__fixtures__/good.md`:
```md
---
slug: good
title: Good
tagline: A fixture
status: active
role: Maker
year: 2025
tech:
  - TS
---

Body goes here.
```

`packages/content/markdown/__fixtures__/bad.md`:
```md
---
slug: BAD
title: Bad
---

Oops.
```

- [ ] **Step 2:** Write `packages/content/src/loaders.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { ProjectFrontmatter } from './schema';
import { loadMarkdownEntity } from './loaders';

const goodPath = fileURLToPath(new URL('../markdown/__fixtures__/good.md', import.meta.url));
const badPath = fileURLToPath(new URL('../markdown/__fixtures__/bad.md', import.meta.url));

describe('loadMarkdownEntity', () => {
  it('parses and validates a good file', async () => {
    const raw = await readFile(goodPath, 'utf8');
    const result = await loadMarkdownEntity(raw, ProjectFrontmatter, 'good.md');
    expect(result.slug).toBe('good');
    expect(result.bodyHtml).toContain('<p>Body goes here.</p>');
  });

  it('throws on schema failure with filename in error', async () => {
    const raw = await readFile(badPath, 'utf8');
    await expect(
      loadMarkdownEntity(raw, ProjectFrontmatter, 'bad.md'),
    ).rejects.toThrow(/bad\.md/);
  });
});
```

- [ ] **Step 3:** Run tests; expect fail.

- [ ] **Step 4:** Create `packages/content/src/loaders.ts`:

```ts
import matter from 'gray-matter';
import type { z } from 'zod';
import { renderMarkdown } from './markdown-render';

export async function loadMarkdownEntity<T extends z.ZodType>(
  raw: string,
  schema: T,
  filename: string,
): Promise<z.infer<T> & { bodyHtml: string }> {
  const { data, content } = matter(raw);
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    throw new Error(
      `[content] ${filename}: frontmatter validation failed — ${parsed.error.message}`,
    );
  }
  const bodyHtml = await renderMarkdown(content);
  return { ...parsed.data, bodyHtml };
}
```

- [ ] **Step 5:** Run tests; expect pass.
- [ ] **Step 6:** Commit:
```bash
git add packages/content/src/loaders.ts packages/content/src/loaders.test.ts packages/content/markdown/__fixtures__/
git commit -m "feat(content): add markdown entity loader with frontmatter validation"
```

### Task 2.5 — Collection loaders (projects, experience, profile)

**Files:**
- Create: `packages/content/src/projects.ts`
- Create: `packages/content/src/experience.ts`
- Create: `packages/content/src/profile.ts`
- Create: `packages/content/src/projects.test.ts`
- Create: `packages/content/markdown/profile.md`
- Create: `packages/content/markdown/projects/keepgoing.md`
- Create: `packages/content/markdown/experience/oneqode.md`

- [ ] **Step 1:** Create seed markdown files.

`packages/content/markdown/profile.md`:
```md
---
name: Hoa Trinh
role: Software Engineer
location: Remote
links:
  - label: GitHub
    href: https://github.com/mrth2
  - label: LinkedIn
    href: https://www.linkedin.com/in/hoa-trinh-dev/
---

Placeholder bio. Replaced during content authoring (Phase 10).
```

`packages/content/markdown/projects/keepgoing.md`:
```md
---
slug: keepgoing
title: KeepGoing
tagline: Context and momentum across coding sessions
status: active
role: Creator
year: 2025
tech:
  - TypeScript
  - Bun
links:
  live: https://keepgoing.dev
  repo: https://github.com/mrth2/keepgoing
featured: true
---

Placeholder description. Replaced during content authoring.
```

`packages/content/markdown/experience/oneqode.md`:
```md
---
slug: oneqode
company: OneQode
title: Software Engineer
start: 2024-01
end: present
tech:
  - TypeScript
  - Solid
highlights:
  - Placeholder highlight
---

Placeholder narrative.
```

- [ ] **Step 2:** Write `packages/content/src/projects.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { getProject, getProjects } from './projects';

describe('getProjects', () => {
  it('returns at least the seed project', () => {
    const projects = getProjects();
    expect(projects.length).toBeGreaterThan(0);
    expect(projects.find((p) => p.slug === 'keepgoing')).toBeDefined();
  });

  it('sorts featured first, then year desc', () => {
    const projects = getProjects();
    for (let i = 1; i < projects.length; i++) {
      const prev = projects[i - 1]!;
      const curr = projects[i]!;
      if (prev.featured && !curr.featured) continue;
      if (!prev.featured && curr.featured) throw new Error('non-featured before featured');
      expect(prev.year).toBeGreaterThanOrEqual(curr.year);
    }
  });
});

describe('getProject', () => {
  it('returns a project by slug', () => {
    expect(getProject('keepgoing')?.title).toBe('KeepGoing');
  });

  it('returns undefined for unknown slug', () => {
    expect(getProject('nope')).toBeUndefined();
  });
});
```

- [ ] **Step 3:** Run tests; expect fail.

- [ ] **Step 4:** Create `packages/content/src/projects.ts`:

```ts
import { loadMarkdownEntity } from './loaders';
import { type Project, ProjectFrontmatter } from './schema';

const rawFiles = import.meta.glob<string>('../markdown/projects/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
});

const projects: Project[] = await Promise.all(
  Object.entries(rawFiles).map(async ([path, raw]) => {
    const filename = path.split('/').pop() ?? path;
    const entity = await loadMarkdownEntity(raw, ProjectFrontmatter, filename);
    const stem = filename.replace(/\.md$/, '');
    if (stem !== entity.slug) {
      throw new Error(`[content] ${filename}: filename stem "${stem}" != slug "${entity.slug}"`);
    }
    return entity;
  }),
);

projects.sort((a, b) => {
  if (a.featured !== b.featured) return a.featured ? -1 : 1;
  return b.year - a.year;
});

export function getProjects(opts: { featured?: boolean } = {}): Project[] {
  if (opts.featured === undefined) return projects;
  return projects.filter((p) => p.featured === opts.featured);
}

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug.toLowerCase());
}
```

- [ ] **Step 5:** Create `packages/content/src/experience.ts`:

```ts
import { loadMarkdownEntity } from './loaders';
import { type Experience, ExperienceFrontmatter } from './schema';

const rawFiles = import.meta.glob<string>('../markdown/experience/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
});

const entries: Experience[] = await Promise.all(
  Object.entries(rawFiles).map(async ([path, raw]) => {
    const filename = path.split('/').pop() ?? path;
    const entity = await loadMarkdownEntity(raw, ExperienceFrontmatter, filename);
    const stem = filename.replace(/\.md$/, '');
    if (stem !== entity.slug) {
      throw new Error(`[content] ${filename}: filename stem "${stem}" != slug "${entity.slug}"`);
    }
    return entity;
  }),
);

entries.sort((a, b) => (b.start > a.start ? 1 : b.start < a.start ? -1 : 0));

export function getExperience(): Experience[] {
  return entries;
}
```

- [ ] **Step 6:** Create `packages/content/src/profile.ts`:

```ts
import { loadMarkdownEntity } from './loaders';
import { type Profile, ProfileFrontmatter } from './schema';

const raw = import.meta.glob<string>('../markdown/profile.md', {
  eager: true,
  query: '?raw',
  import: 'default',
});

const entries = Object.values(raw);
if (entries.length !== 1) {
  throw new Error(`[content] expected exactly one profile.md, found ${entries.length}`);
}

const profile: Profile = await loadMarkdownEntity(entries[0]!, ProfileFrontmatter, 'profile.md');

export function getProfile(): Profile {
  return profile;
}
```

- [ ] **Step 7:** Update `packages/content/src/index.ts`:

```ts
export * from './schema';
export { getProjects, getProject } from './projects';
export { getExperience } from './experience';
export { getProfile } from './profile';
export { getSkills } from './skills';
export { getLinks } from './links';
```

- [ ] **Step 8:** Run tests; expect pass. (Vitest loads via Vite so `import.meta.glob` works.)
- [ ] **Step 9:** Commit:
```bash
git add packages/content/src/ packages/content/markdown/
git commit -m "feat(content): add collection loaders and seed markdown for profile, projects, experience"
```

### Task 2.6 — Cross-entity validation (duplicates, stem match)

**Files:**
- Modify: `packages/content/src/projects.ts` (already validates stem)
- Create: `packages/content/src/validation.test.ts`

- [ ] **Step 1:** Write `packages/content/src/validation.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { getProjects } from './projects';
import { getSkills } from './skills';
import { getLinks } from './links';

describe('content cross-validation', () => {
  it('project slugs are unique', () => {
    const slugs = getProjects().map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('skill group labels are unique', () => {
    const labels = getSkills().map((g) => g.label);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it('link hrefs are unique', () => {
    const hrefs = getLinks().map((l) => l.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });
});
```

- [ ] **Step 2:** Run tests; expect pass (data is clean).
- [ ] **Step 3:** Commit:
```bash
git add packages/content/src/validation.test.ts
git commit -m "test(content): add uniqueness tests for slugs and labels"
```

---

## ✋ REVIEW CHECKPOINT — Phase 2

Verify:
- `bun run --filter @hoatrinh/content test` green (all schemas, loaders, collection validation).
- `import { getProjects } from '@hoatrinh/content'` from `apps/web` code path works.
- Seed markdown files present and parse cleanly.
- Build refuses malformed content (try breaking a fixture briefly to confirm).

---

## Phase 3 — Terminal engine

**Goal:** pure-TypeScript terminal engine with unit-tested parser, registry, handlers, history, autocomplete, and execute. No Solid primitives outside `store.ts`.

### Task 3.1 — Entry types

**Files:**
- Create: `apps/web/src/terminal/entries.ts`

- [ ] **Step 1:** Create `apps/web/src/terminal/entries.ts`:

```ts
import type { Experience, Link, Profile, Project, SkillGroup } from '@hoatrinh/content';

export type BaseEntry = { id: string; input: string };

export type ProfileEntry = BaseEntry & { kind: 'profile'; data: Profile };
export type ProjectsEntry = BaseEntry & { kind: 'projects'; data: Project[] };
export type ProjectEntry = BaseEntry & { kind: 'project'; data: Project };
export type ExperienceEntry = BaseEntry & { kind: 'experience'; data: Experience[] };
export type SkillsEntry = BaseEntry & { kind: 'skills'; data: SkillGroup[] };
export type ContactEntry = BaseEntry & { kind: 'contact'; data: Link[] };
export type HelpEntry = BaseEntry & {
  kind: 'help';
  data: { commands: Array<{ name: string; usage: string; summary: string }> };
};
export type TextEntry = BaseEntry & { kind: 'text'; lines: string[] };
export type ErrorEntry = BaseEntry & {
  kind: 'error';
  message: string;
  suggestions: string[];
};

export type TerminalEntry =
  | ProfileEntry
  | ProjectsEntry
  | ProjectEntry
  | ExperienceEntry
  | SkillsEntry
  | ContactEntry
  | HelpEntry
  | TextEntry
  | ErrorEntry;

export type ClearAction = { action: 'clear' };

let idSeq = 0;
export function nextEntryId(): string {
  idSeq += 1;
  return `e${idSeq}`;
}

export function resetEntryIds(): void {
  idSeq = 0;
}
```

- [ ] **Step 2:** Typecheck: `bun run --filter @hoatrinh/web typecheck`. Expect clean.
- [ ] **Step 3:** Commit:
```bash
git add apps/web/src/terminal/entries.ts
git commit -m "feat(terminal): add TerminalEntry discriminated union and id generator"
```

### Task 3.2 — Parser

**Files:**
- Create: `apps/web/src/terminal/parser.ts`
- Create: `apps/web/src/terminal/parser.test.ts`

- [ ] **Step 1:** Write test first:

```ts
import { describe, expect, it } from 'vitest';
import { parseInput } from './parser';

describe('parseInput', () => {
  it('returns null for empty input', () => {
    expect(parseInput('')).toBeNull();
    expect(parseInput('   ')).toBeNull();
  });

  it('parses a bare command', () => {
    expect(parseInput('about')).toEqual({ cmd: 'about', args: [], rest: '' });
  });

  it('lowercases command but preserves arg case', () => {
    expect(parseInput('Project KeepGoing')).toEqual({
      cmd: 'project',
      args: ['KeepGoing'],
      rest: 'KeepGoing',
    });
  });

  it('preserves whitespace in rest', () => {
    expect(parseInput('ask what is typescript')).toEqual({
      cmd: 'ask',
      args: ['what', 'is', 'typescript'],
      rest: 'what is typescript',
    });
  });

  it('trims leading and trailing whitespace', () => {
    expect(parseInput('  help  ')).toEqual({ cmd: 'help', args: [], rest: '' });
  });

  it('collapses internal whitespace for args', () => {
    expect(parseInput('project    foo')).toEqual({
      cmd: 'project',
      args: ['foo'],
      rest: 'foo',
    });
  });
});
```

- [ ] **Step 2:** Run tests; expect fail.
- [ ] **Step 3:** Create `apps/web/src/terminal/parser.ts`:

```ts
export type ParsedInput = { cmd: string; args: string[]; rest: string };

export function parseInput(raw: string): ParsedInput | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const parts = trimmed.split(/\s+/);
  const cmd = parts[0]!.toLowerCase();
  const args = parts.slice(1);
  const rest = trimmed.slice(parts[0]!.length).trim();
  return { cmd, args, rest };
}
```

- [ ] **Step 4:** Run tests; expect pass.
- [ ] **Step 5:** Commit:
```bash
git add apps/web/src/terminal/parser.ts apps/web/src/terminal/parser.test.ts
git commit -m "feat(terminal): add minimal command parser with remainder support"
```

### Task 3.3 — Suggestions (nearest-match)

**Files:**
- Create: `apps/web/src/terminal/suggestions.ts`
- Create: `apps/web/src/terminal/suggestions.test.ts`

- [ ] **Step 1:** Write test:

```ts
import { describe, expect, it } from 'vitest';
import { nearestMatches } from './suggestions';

describe('nearestMatches', () => {
  const vocab = ['about', 'projects', 'project', 'experience', 'skills', 'contact', 'help'];

  it('finds exact prefix', () => {
    expect(nearestMatches('proj', vocab)).toContain('projects');
    expect(nearestMatches('proj', vocab)).toContain('project');
  });

  it('tolerates one typo', () => {
    expect(nearestMatches('abot', vocab)).toContain('about');
    expect(nearestMatches('hepl', vocab)).toContain('help');
  });

  it('returns empty when too far', () => {
    expect(nearestMatches('xyzzy', vocab)).toEqual([]);
  });

  it('caps suggestions', () => {
    expect(nearestMatches('pro', vocab).length).toBeLessThanOrEqual(3);
  });
});
```

- [ ] **Step 2:** Run tests; expect fail.
- [ ] **Step 3:** Create `apps/web/src/terminal/suggestions.ts`:

```ts
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  const curr = new Array(b.length + 1).fill(0);
  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1]! + 1, prev[j]! + 1, prev[j - 1]! + cost);
    }
    for (let j = 0; j <= b.length; j++) prev[j] = curr[j]!;
  }
  return prev[b.length]!;
}

export function nearestMatches(input: string, vocab: readonly string[], limit = 3): string[] {
  const scored = vocab
    .map((v) => ({ v, score: v.startsWith(input) ? -1 : levenshtein(input, v) }))
    .filter((x) => x.score <= 2)
    .sort((a, b) => a.score - b.score)
    .slice(0, limit);
  return scored.map((x) => x.v);
}
```

- [ ] **Step 4:** Run tests; expect pass.
- [ ] **Step 5:** Commit:
```bash
git add apps/web/src/terminal/suggestions.ts apps/web/src/terminal/suggestions.test.ts
git commit -m "feat(terminal): add levenshtein-based nearest-match suggestions"
```

### Task 3.4 — Registry

**Files:**
- Create: `apps/web/src/terminal/registry.ts`
- Create: `apps/web/src/terminal/registry.test.ts`

- [ ] **Step 1:** Write test:

```ts
import { describe, expect, it } from 'vitest';
import { createRegistry, resolveCommand } from './registry';

const specs = [
  { name: 'about', aliases: ['whoami'], summary: 'about me', handler: () => null as never },
  { name: 'projects', aliases: ['work'], summary: 'projects', handler: () => null as never },
];

describe('resolveCommand', () => {
  const reg = createRegistry(specs);

  it('resolves by name', () => {
    expect(resolveCommand(reg, 'about')?.name).toBe('about');
  });

  it('resolves by alias', () => {
    expect(resolveCommand(reg, 'whoami')?.name).toBe('about');
    expect(resolveCommand(reg, 'work')?.name).toBe('projects');
  });

  it('is case-insensitive on name lookup', () => {
    expect(resolveCommand(reg, 'About')?.name).toBe('about');
  });

  it('returns undefined for unknown', () => {
    expect(resolveCommand(reg, 'nope')).toBeUndefined();
  });

  it('returns vocab with all names and aliases', () => {
    expect(reg.vocab).toEqual(expect.arrayContaining(['about', 'whoami', 'projects', 'work']));
  });
});
```

- [ ] **Step 2:** Run tests; expect fail.
- [ ] **Step 3:** Create `apps/web/src/terminal/registry.ts`:

```ts
import type { TerminalEntry, ClearAction } from './entries';

export type CommandContext = {
  navigate?: (path: string) => void;
};

export type CommandResult = TerminalEntry | Promise<TerminalEntry> | ClearAction;

export type CommandSpec = {
  name: string;
  aliases?: string[];
  summary: string;
  argsHint?: string;
  route?: string | ((args: string[], rest: string) => string | null);
  handler: (args: string[], rest: string, ctx: CommandContext) => CommandResult;
};

export type Registry = {
  specs: CommandSpec[];
  byName: Map<string, CommandSpec>;
  vocab: string[];
};

export function createRegistry(specs: CommandSpec[]): Registry {
  const byName = new Map<string, CommandSpec>();
  for (const spec of specs) {
    byName.set(spec.name, spec);
    for (const alias of spec.aliases ?? []) byName.set(alias, spec);
  }
  const vocab = Array.from(byName.keys());
  return { specs, byName, vocab };
}

export function resolveCommand(registry: Registry, input: string): CommandSpec | undefined {
  return registry.byName.get(input.toLowerCase());
}
```

- [ ] **Step 4:** Run tests; expect pass.
- [ ] **Step 5:** Commit:
```bash
git add apps/web/src/terminal/registry.ts apps/web/src/terminal/registry.test.ts
git commit -m "feat(terminal): add command registry with alias and vocab support"
```

### Task 3.5 — History

**Files:**
- Create: `apps/web/src/terminal/history.ts`
- Create: `apps/web/src/terminal/history.test.ts`

- [ ] **Step 1:** Write test:

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createHistory } from './history';

describe('createHistory', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('pushes entries and persists', () => {
    const h = createHistory();
    h.push('about');
    h.push('projects');
    expect(h.entries()).toEqual(['projects', 'about']);
    const loaded = createHistory();
    expect(loaded.entries()).toEqual(['projects', 'about']);
  });

  it('dedupes consecutive duplicates', () => {
    const h = createHistory();
    h.push('about');
    h.push('about');
    h.push('help');
    expect(h.entries()).toEqual(['help', 'about']);
  });

  it('caps at 50', () => {
    const h = createHistory();
    for (let i = 0; i < 60; i++) h.push(`cmd${i}`);
    expect(h.entries().length).toBe(50);
    expect(h.entries()[0]).toBe('cmd59');
  });

  it('cursor navigates Up/Down with draft restore', () => {
    const h = createHistory();
    h.push('about');
    h.push('projects');
    expect(h.startNavigation('typing...')).toBe('projects');
    expect(h.navigateUp()).toBe('about');
    expect(h.navigateUp()).toBe('about');
    expect(h.navigateDown()).toBe('projects');
    expect(h.navigateDown()).toBe('typing...');
    expect(h.cursor()).toBe(-1);
  });

  it('reset() clears cursor and draft', () => {
    const h = createHistory();
    h.push('a');
    h.startNavigation('');
    h.navigateUp();
    h.reset();
    expect(h.cursor()).toBe(-1);
  });
});
```

- [ ] **Step 2:** Run tests; expect fail.
- [ ] **Step 3:** Create `apps/web/src/terminal/history.ts`:

```ts
const STORAGE_KEY = 'hoatrinh:history';
const CAP = 50;

function loadFromSession(): string[] {
  if (typeof sessionStorage === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function persist(list: string[]): void {
  if (typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // swallow; history is best-effort
  }
}

export type History = {
  entries: () => string[];
  push: (input: string) => void;
  cursor: () => number;
  startNavigation: (draft: string) => string | null;
  navigateUp: () => string | null;
  navigateDown: () => string | null;
  reset: () => void;
};

export function createHistory(): History {
  let list = loadFromSession();
  let cursor = -1;
  let draft = '';

  return {
    entries: () => list.slice(),
    push(input) {
      if (!input) return;
      if (list[0] === input) return;
      list = [input, ...list].slice(0, CAP);
      persist(list);
    },
    cursor: () => cursor,
    startNavigation(d) {
      if (!list.length) return null;
      draft = d;
      cursor = 0;
      return list[0]!;
    },
    navigateUp() {
      if (!list.length) return null;
      if (cursor < 0) {
        cursor = 0;
        return list[0]!;
      }
      cursor = Math.min(cursor + 1, list.length - 1);
      return list[cursor]!;
    },
    navigateDown() {
      if (cursor <= 0) {
        cursor = -1;
        const d = draft;
        draft = '';
        return d;
      }
      cursor -= 1;
      return list[cursor]!;
    },
    reset() {
      cursor = -1;
      draft = '';
    },
  };
}
```

- [ ] **Step 4:** Run tests; expect pass.
- [ ] **Step 5:** Commit:
```bash
git add apps/web/src/terminal/history.ts apps/web/src/terminal/history.test.ts
git commit -m "feat(terminal): add sessionStorage-backed history with cursor navigation"
```

### Task 3.6 — Handlers (one-task umbrella)

**Files:**
- Create: `apps/web/src/terminal/handlers/about.ts`, `projects.ts`, `project.ts`, `experience.ts`, `skills.ts`, `contact.ts`, `help.ts`, `clear.ts`
- Create: `apps/web/src/terminal/handlers/*.test.ts` (one per handler)

- [ ] **Step 1:** Create `apps/web/src/terminal/handlers/about.ts`:

```ts
import { getProfile } from '@hoatrinh/content';
import { nextEntryId, type ProfileEntry } from '../entries';

export function aboutHandler(_args: string[], _rest: string, _ctx: unknown): ProfileEntry {
  return { id: nextEntryId(), input: 'about', kind: 'profile', data: getProfile() };
}
```

- [ ] **Step 2:** Create `apps/web/src/terminal/handlers/about.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { aboutHandler } from './about';

describe('aboutHandler', () => {
  it('returns a profile entry', () => {
    const entry = aboutHandler([], '', {});
    expect(entry.kind).toBe('profile');
    expect(entry.data.name).toBeTruthy();
  });
});
```

- [ ] **Step 3:** Create `projects.ts`:

```ts
import { getProjects } from '@hoatrinh/content';
import { nextEntryId, type ProjectsEntry } from '../entries';

export function projectsHandler(_args: string[], _rest: string, _ctx: unknown): ProjectsEntry {
  return { id: nextEntryId(), input: 'projects', kind: 'projects', data: getProjects() };
}
```

- [ ] **Step 4:** Create `projects.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { projectsHandler } from './projects';

describe('projectsHandler', () => {
  it('returns a non-empty list', () => {
    const entry = projectsHandler([], '', {});
    expect(entry.kind).toBe('projects');
    expect(entry.data.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 5:** Create `project.ts`:

```ts
import { getProject } from '@hoatrinh/content';
import { nextEntryId, type ErrorEntry, type ProjectEntry } from '../entries';

export function projectHandler(args: string[], _rest: string, _ctx: unknown): ProjectEntry | ErrorEntry {
  const slug = args[0]?.toLowerCase();
  if (!slug) {
    return {
      id: nextEntryId(),
      input: 'project',
      kind: 'error',
      message: 'project requires a slug. Try: project <slug>',
      suggestions: ['projects'],
    };
  }
  const project = getProject(slug);
  if (!project) {
    return {
      id: nextEntryId(),
      input: `project ${slug}`,
      kind: 'error',
      message: `No project "${slug}" found.`,
      suggestions: ['projects'],
    };
  }
  return { id: nextEntryId(), input: `project ${slug}`, kind: 'project', data: project };
}
```

- [ ] **Step 6:** Create `project.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { projectHandler } from './project';

describe('projectHandler', () => {
  it('returns error when slug missing', () => {
    const entry = projectHandler([], '', {});
    expect(entry.kind).toBe('error');
  });

  it('returns error for unknown slug', () => {
    const entry = projectHandler(['nope'], '', {});
    expect(entry.kind).toBe('error');
    if (entry.kind === 'error') expect(entry.suggestions).toContain('projects');
  });

  it('returns project entry when slug matches', () => {
    const entry = projectHandler(['keepgoing'], '', {});
    expect(entry.kind).toBe('project');
    if (entry.kind === 'project') expect(entry.data.slug).toBe('keepgoing');
  });
});
```

- [ ] **Step 7:** Create `experience.ts`:

```ts
import { getExperience } from '@hoatrinh/content';
import { nextEntryId, type ExperienceEntry } from '../entries';

export function experienceHandler(_args: string[], _rest: string, _ctx: unknown): ExperienceEntry {
  return { id: nextEntryId(), input: 'experience', kind: 'experience', data: getExperience() };
}
```

With test mirroring the projects pattern.

- [ ] **Step 8:** Create `skills.ts`:

```ts
import { getSkills } from '@hoatrinh/content';
import { nextEntryId, type SkillsEntry } from '../entries';

export function skillsHandler(_args: string[], _rest: string, _ctx: unknown): SkillsEntry {
  return { id: nextEntryId(), input: 'skills', kind: 'skills', data: getSkills() };
}
```

With test.

- [ ] **Step 9:** Create `contact.ts`:

```ts
import { getLinks } from '@hoatrinh/content';
import { nextEntryId, type ContactEntry } from '../entries';

export function contactHandler(_args: string[], _rest: string, _ctx: unknown): ContactEntry {
  return { id: nextEntryId(), input: 'contact', kind: 'contact', data: getLinks() };
}
```

With test.

- [ ] **Step 10:** Create `help.ts` (uses the registry, so takes `specs` as arg):

```ts
import { nextEntryId, type HelpEntry } from '../entries';
import type { CommandSpec } from '../registry';

export function makeHelpHandler(getSpecs: () => CommandSpec[]) {
  return function helpHandler(_args: string[], _rest: string, _ctx: unknown): HelpEntry {
    const commands = getSpecs().map((s) => ({
      name: s.name,
      usage: s.argsHint ? `${s.name} ${s.argsHint}` : s.name,
      summary: s.summary,
    }));
    return { id: nextEntryId(), input: 'help', kind: 'help', data: { commands } };
  };
}
```

With test that verifies `commands` reflects input specs.

- [ ] **Step 11:** Create `clear.ts`:

```ts
import type { ClearAction } from '../entries';

export function clearHandler(_args: string[], _rest: string, _ctx: unknown): ClearAction {
  return { action: 'clear' };
}
```

With test:

```ts
import { describe, expect, it } from 'vitest';
import { clearHandler } from './clear';

describe('clearHandler', () => {
  it('returns clear action', () => {
    expect(clearHandler([], '', {})).toEqual({ action: 'clear' });
  });
});
```

- [ ] **Step 12:** Run all tests; expect pass.
- [ ] **Step 13:** Commit:
```bash
git add apps/web/src/terminal/handlers/
git commit -m "feat(terminal): add handlers for about, projects, project, experience, skills, contact, help, clear"
```

### Task 3.7 — Registry wiring

**Files:**
- Create: `apps/web/src/terminal/commands.ts`

- [ ] **Step 1:** Create `apps/web/src/terminal/commands.ts`:

```ts
import { aboutHandler } from './handlers/about';
import { clearHandler } from './handlers/clear';
import { contactHandler } from './handlers/contact';
import { experienceHandler } from './handlers/experience';
import { makeHelpHandler } from './handlers/help';
import { projectHandler } from './handlers/project';
import { projectsHandler } from './handlers/projects';
import { skillsHandler } from './handlers/skills';
import { createRegistry, type CommandSpec } from './registry';

const baseSpecs: CommandSpec[] = [
  { name: 'about', aliases: ['whoami'], summary: 'Who I am', route: '/about', handler: aboutHandler },
  { name: 'projects', aliases: ['work'], summary: 'Things I have built', route: '/projects', handler: projectsHandler },
  {
    name: 'project',
    summary: 'Details for one project',
    argsHint: '<slug>',
    route: (args) => (args[0] ? `/project/${args[0].toLowerCase()}` : null),
    handler: projectHandler,
  },
  { name: 'experience', aliases: ['cv'], summary: 'Past roles', route: '/experience', handler: experienceHandler },
  { name: 'skills', aliases: ['stack'], summary: 'Tech and tools', route: '/skills', handler: skillsHandler },
  { name: 'contact', aliases: ['links'], summary: 'Ways to reach me', route: '/contact', handler: contactHandler },
  { name: 'clear', summary: 'Clear the screen', handler: clearHandler },
];

export const specs: CommandSpec[] = [
  ...baseSpecs,
  { name: 'help', summary: 'List commands', route: '/help', handler: makeHelpHandler(() => specs) },
];

export const registry = createRegistry(specs);
```

- [ ] **Step 2:** Typecheck; expect clean.
- [ ] **Step 3:** Commit:
```bash
git add apps/web/src/terminal/commands.ts
git commit -m "feat(terminal): wire command registry with all MVP handlers"
```

### Task 3.8 — Autocomplete

**Files:**
- Create: `apps/web/src/terminal/autocomplete.ts`
- Create: `apps/web/src/terminal/autocomplete.test.ts`

- [ ] **Step 1:** Write test:

```ts
import { describe, expect, it } from 'vitest';
import { autocomplete } from './autocomplete';

const commands = ['about', 'projects', 'project', 'experience', 'skills', 'contact', 'help', 'clear'];
const projectSlugs = ['keepgoing', 'win95-fun'];

describe('autocomplete', () => {
  it('completes an unambiguous command prefix', () => {
    expect(autocomplete('abo', { commands, projectSlugs })).toEqual({
      completion: 'about',
      candidates: [],
    });
  });

  it('returns candidates for ambiguous prefix', () => {
    const res = autocomplete('proj', { commands, projectSlugs });
    expect(res.completion).toBeNull();
    expect(res.candidates).toEqual(expect.arrayContaining(['projects', 'project']));
  });

  it('completes a project slug after "project "', () => {
    expect(autocomplete('project keep', { commands, projectSlugs })).toEqual({
      completion: 'project keepgoing',
      candidates: [],
    });
  });

  it('returns empty on unknown prefix', () => {
    expect(autocomplete('xyz', { commands, projectSlugs })).toEqual({
      completion: null,
      candidates: [],
    });
  });
});
```

- [ ] **Step 2:** Run tests; expect fail.
- [ ] **Step 3:** Create `apps/web/src/terminal/autocomplete.ts`:

```ts
export type AutocompleteOptions = {
  commands: readonly string[];
  projectSlugs: readonly string[];
};

export type AutocompleteResult = {
  completion: string | null;
  candidates: string[];
};

export function autocomplete(input: string, opts: AutocompleteOptions): AutocompleteResult {
  const trimmed = input.trimStart();
  if (!trimmed.includes(' ')) {
    return completeAgainst(trimmed, opts.commands);
  }
  const [cmd, ...rest] = trimmed.split(/\s+/);
  if (cmd === 'project' && rest.length === 1) {
    const sub = completeAgainst(rest[0]!, opts.projectSlugs);
    if (sub.completion) return { completion: `project ${sub.completion}`, candidates: [] };
    return { completion: null, candidates: sub.candidates.map((c) => `project ${c}`) };
  }
  return { completion: null, candidates: [] };
}

function completeAgainst(prefix: string, vocab: readonly string[]): AutocompleteResult {
  if (!prefix) return { completion: null, candidates: [] };
  const matches = vocab.filter((v) => v.startsWith(prefix.toLowerCase()));
  if (matches.length === 1) return { completion: matches[0]!, candidates: [] };
  if (matches.length > 1) return { completion: null, candidates: matches };
  return { completion: null, candidates: [] };
}
```

- [ ] **Step 4:** Run tests; expect pass.
- [ ] **Step 5:** Commit:
```bash
git add apps/web/src/terminal/autocomplete.ts apps/web/src/terminal/autocomplete.test.ts
git commit -m "feat(terminal): add tab completion for commands and project slugs"
```

### Task 3.9 — Store + execute

**Files:**
- Create: `apps/web/src/terminal/store.ts`
- Create: `apps/web/src/terminal/execute.ts`
- Create: `apps/web/src/terminal/execute.test.ts`

- [ ] **Step 1:** Create `apps/web/src/terminal/store.ts`:

```ts
import { createStore } from 'solid-js/store';
import type { TerminalEntry } from './entries';

export type TerminalState = {
  entries: TerminalEntry[];
  currentInput: string;
  isExecuting: boolean;
};

export function createTerminalStore(initialEntries: TerminalEntry[] = []) {
  return createStore<TerminalState>({
    entries: initialEntries,
    currentInput: '',
    isExecuting: false,
  });
}
```

- [ ] **Step 2:** Write test `apps/web/src/terminal/execute.test.ts`:

```ts
import { beforeEach, describe, expect, it } from 'vitest';
import { createTerminalStore } from './store';
import { execute } from './execute';
import { registry } from './commands';
import { resetEntryIds } from './entries';

describe('execute', () => {
  beforeEach(() => {
    sessionStorage.clear();
    resetEntryIds();
  });

  it('appends a profile entry for "about"', async () => {
    const [state, setState] = createTerminalStore();
    await execute('about', { state, setState, registry, navigate: () => {} });
    expect(state.entries).toHaveLength(1);
    expect(state.entries[0]!.kind).toBe('profile');
  });

  it('ignores blank input', async () => {
    const [state, setState] = createTerminalStore();
    await execute('   ', { state, setState, registry, navigate: () => {} });
    expect(state.entries).toHaveLength(0);
  });

  it('appends error entry for unknown command', async () => {
    const [state, setState] = createTerminalStore();
    await execute('xyzzy', { state, setState, registry, navigate: () => {} });
    const entry = state.entries[0]!;
    expect(entry.kind).toBe('error');
  });

  it('suggests nearest match for typo', async () => {
    const [state, setState] = createTerminalStore();
    await execute('abot', { state, setState, registry, navigate: () => {} });
    const entry = state.entries[0]!;
    expect(entry.kind).toBe('error');
    if (entry.kind === 'error') expect(entry.suggestions).toContain('about');
  });

  it('clears entries on "clear"', async () => {
    const [state, setState] = createTerminalStore();
    await execute('about', { state, setState, registry, navigate: () => {} });
    await execute('clear', { state, setState, registry, navigate: () => {} });
    expect(state.entries).toHaveLength(0);
  });

  it('calls navigate for routable commands', async () => {
    const [state, setState] = createTerminalStore();
    let visited: string | null = null;
    await execute('projects', {
      state,
      setState,
      registry,
      navigate: (p) => {
        visited = p;
      },
    });
    expect(visited).toBe('/projects');
  });
});
```

- [ ] **Step 3:** Run tests; expect fail.
- [ ] **Step 4:** Create `apps/web/src/terminal/execute.ts`:

```ts
import type { SetStoreFunction } from 'solid-js/store';
import { nextEntryId, type TerminalEntry } from './entries';
import { parseInput } from './parser';
import { resolveCommand, type Registry } from './registry';
import { nearestMatches } from './suggestions';
import type { TerminalState } from './store';

export type ExecuteContext = {
  state: TerminalState;
  setState: SetStoreFunction<TerminalState>;
  registry: Registry;
  navigate: (path: string) => void;
};

export async function execute(raw: string, ctx: ExecuteContext): Promise<void> {
  const parsed = parseInput(raw);
  if (!parsed) return;

  const spec = resolveCommand(ctx.registry, parsed.cmd);
  if (!spec) {
    const entry: TerminalEntry = {
      id: nextEntryId(),
      input: raw.trim(),
      kind: 'error',
      message: `Command not found: ${parsed.cmd}`,
      suggestions: nearestMatches(parsed.cmd, ctx.registry.vocab),
    };
    ctx.setState('entries', (list) => [...list, entry]);
    return;
  }

  const result = await Promise.resolve(spec.handler(parsed.args, parsed.rest, {}));

  if ('action' in result && result.action === 'clear') {
    ctx.setState('entries', []);
    return;
  }

  const entry = result as TerminalEntry;
  ctx.setState('entries', (list) => [...list, entry]);

  const routeVal = typeof spec.route === 'function' ? spec.route(parsed.args, parsed.rest) : spec.route;
  if (routeVal) ctx.navigate(routeVal);
}
```

- [ ] **Step 5:** Run tests; expect pass.
- [ ] **Step 6:** Commit:
```bash
git add apps/web/src/terminal/store.ts apps/web/src/terminal/execute.ts apps/web/src/terminal/execute.test.ts
git commit -m "feat(terminal): add Solid store and execute pipeline with navigation"
```

---

## ✋ REVIEW CHECKPOINT — Phase 3

Verify:
- `bun run --filter @hoatrinh/web test` green (all terminal/* tests).
- Execute flow covers: valid, blank, unknown, typo, clear, routable command navigation.
- No Solid primitives outside `store.ts` — `grep -r "from 'solid-js'" apps/web/src/terminal/` should only hit `store.ts`.

---

## Phase 4 — Design tokens and global styles

**Goal:** global CSS, fonts, tokens loaded; reset applied; focus-visible consistent.

### Task 4.1 — Tokens

**Files:**
- Create: `apps/web/src/styles/tokens.css`

- [ ] **Step 1:** Create `apps/web/src/styles/tokens.css` — copy the `:root` block from spec Section 8.2 verbatim.
- [ ] **Step 2:** Commit:
```bash
git add apps/web/src/styles/tokens.css
git commit -m "feat(web): add design tokens (colors, typography, spacing, focus)"
```

### Task 4.2 — Reset and global

**Files:**
- Create: `apps/web/src/styles/reset.css`
- Create: `apps/web/src/styles/global.css`

- [ ] **Step 1:** Create `apps/web/src/styles/reset.css`:

```css
*, *::before, *::after { box-sizing: border-box; }
* { margin: 0; }
html, body { height: 100%; }
body { line-height: 1.5; -webkit-font-smoothing: antialiased; }
img, picture, video, canvas, svg { display: block; max-width: 100%; }
input, button, textarea, select { font: inherit; color: inherit; background: transparent; border: 0; }
button { cursor: pointer; }
a { color: inherit; text-decoration: none; }
```

- [ ] **Step 2:** Create `apps/web/src/styles/global.css`:

```css
body {
  color: var(--text-primary);
  font: 400 var(--text-base) / var(--leading-relaxed) var(--font-ui);
  background-color: var(--bg-base);
  background-image:
    radial-gradient(ellipse at top, rgba(111, 224, 161, 0.02), transparent 60%);
  min-height: 100dvh;
}

*:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-offset);
  border-radius: var(--radius-sm);
}

::selection {
  background: var(--accent-primary);
  color: var(--bg-base);
}

a { color: var(--accent-primary); }
a:hover { text-decoration: underline; }

.sr-only {
  position: absolute;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0, 0, 0, 0);
  white-space: nowrap; border: 0;
}

.skip-link {
  position: absolute;
  top: -100px;
  left: var(--space-2);
  background: var(--bg-elevated);
  color: var(--text-primary);
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  z-index: 100;
}
.skip-link:focus { top: var(--space-2); }
```

- [ ] **Step 3:** Commit:
```bash
git add apps/web/src/styles/reset.css apps/web/src/styles/global.css
git commit -m "feat(web): add reset and global styles with focus-visible and skip-link"
```

### Task 4.3 — Fonts

**Files:**
- Create: `apps/web/src/styles/fonts.css`

- [ ] **Step 1:** Create `apps/web/src/styles/fonts.css`:

```css
@import url('@fontsource/space-mono/latin-400.css');
@import url('@fontsource/space-mono/latin-700.css');
@import url('@fontsource/jetbrains-mono/latin-400.css');
@import url('@fontsource/jetbrains-mono/latin-500.css');
@import url('@fontsource/jetbrains-mono/latin-700.css');
```

- [ ] **Step 2:** Update `apps/web/src/entry-client.tsx` to import CSS:

```tsx
import './styles/tokens.css';
import './styles/reset.css';
import './styles/fonts.css';
import './styles/global.css';
import { render } from 'solid-js/web';
import { App } from './App';

const root = document.getElementById('app');
if (!root) throw new Error('#app root missing');
render(() => <App />, root);
```

- [ ] **Step 3:** `bun run dev`; verify fonts load in devtools Network tab. Kill.
- [ ] **Step 4:** Commit:
```bash
git add apps/web/src/styles/fonts.css apps/web/src/entry-client.tsx
git commit -m "feat(web): load Space Mono + JetBrains Mono via fontsource"
```

---

## ✋ REVIEW CHECKPOINT — Phase 4

Verify:
- Dev server renders placeholder with dark background, green-tinted accent on selection.
- Fonts load in devtools; `body` computed styles show `Space Mono`.
- Focus ring visible on tab-navigating into the document.

---

## Phase 5 — UI components

**Goal:** all Prompt, EntryList, EntryRenderer, InputEcho and block components exist, each rendering typed data correctly.

Convention per component:
- Folder `apps/web/src/components/<Name>/`
- `<Name>.tsx` + `<Name>.module.css`
- Optionally `<Name>.test.tsx` for render logic (dispatcher, Prompt input handling)

### Task 5.1 — InputEcho

**Files:**
- Create: `apps/web/src/components/InputEcho/InputEcho.tsx`
- Create: `apps/web/src/components/InputEcho/InputEcho.module.css`

- [ ] **Step 1:** Create `InputEcho.tsx`:

```tsx
import styles from './InputEcho.module.css';

export function InputEcho(props: { text: string }) {
  return (
    <div class={styles.echo}>
      <span class={styles.sigil} aria-hidden="true">&gt;</span>
      <span class={styles.text}>{props.text}</span>
    </div>
  );
}
```

- [ ] **Step 2:** Create `InputEcho.module.css`:

```css
.echo {
  display: flex;
  gap: var(--space-2);
  font-family: var(--font-code);
  font-size: var(--text-base);
  font-weight: 500;
  color: var(--text-muted);
  margin-bottom: var(--space-2);
}
.sigil { color: var(--accent-primary); }
.text { color: var(--text-primary); }
```

- [ ] **Step 3:** Commit:
```bash
git add apps/web/src/components/InputEcho/
git commit -m "feat(web): add InputEcho component"
```

### Task 5.2 — Block components (one commit)

Each block is a pure render function. Create all in one pass, one commit at the end.

**Files:**
- Create: `apps/web/src/components/blocks/ProfileBlock/{ProfileBlock.tsx,.module.css}`
- Create: `apps/web/src/components/blocks/ProjectsBlock/{ProjectsBlock.tsx,.module.css}`
- Create: `apps/web/src/components/blocks/ProjectBlock/{ProjectBlock.tsx,.module.css}`
- Create: `apps/web/src/components/blocks/ExperienceBlock/{ExperienceBlock.tsx,.module.css}`
- Create: `apps/web/src/components/blocks/SkillsBlock/{SkillsBlock.tsx,.module.css}`
- Create: `apps/web/src/components/blocks/ContactBlock/{ContactBlock.tsx,.module.css}`
- Create: `apps/web/src/components/blocks/HelpBlock/{HelpBlock.tsx,.module.css}`
- Create: `apps/web/src/components/blocks/TextBlock/{TextBlock.tsx,.module.css}`
- Create: `apps/web/src/components/blocks/ErrorBlock/{ErrorBlock.tsx,.module.css}`

- [ ] **Step 1:** `ProfileBlock.tsx`:

```tsx
import type { Profile } from '@hoatrinh/content';
import styles from './ProfileBlock.module.css';

export function ProfileBlock(props: { data: Profile }) {
  return (
    <section class={styles.root}>
      <header class={styles.header}>
        <h1 class={styles.name}>{props.data.name}</h1>
        <p class={styles.role}>{props.data.role} · {props.data.location}</p>
      </header>
      <div class={styles.body} innerHTML={props.data.bodyHtml} />
      <ul class={styles.links}>
        {props.data.links.map((l) => (
          <li><a href={l.href}>{l.label}</a></li>
        ))}
      </ul>
    </section>
  );
}
```

`ProfileBlock.module.css`:

```css
.root { display: flex; flex-direction: column; gap: var(--space-3); }
.header { display: flex; flex-direction: column; gap: var(--space-1); }
.name { font-size: var(--text-xl); font-weight: 700; color: var(--text-primary); }
.role { font-size: var(--text-sm); color: var(--text-muted); }
.body { color: var(--text-primary); }
.body :global(p) { margin-bottom: var(--space-2); }
.links { display: flex; flex-wrap: wrap; gap: var(--space-4); list-style: none; padding: 0; }
```

- [ ] **Step 2:** `ProjectsBlock.tsx`:

```tsx
import type { Project } from '@hoatrinh/content';
import styles from './ProjectsBlock.module.css';

export function ProjectsBlock(props: { data: Project[] }) {
  return (
    <section class={styles.root}>
      <p class={styles.count}>{props.data.length} project{props.data.length === 1 ? '' : 's'} found.</p>
      <ul class={styles.list}>
        {props.data.map((p) => (
          <li class={styles.row}>
            <a class={styles.slug} href={`/project/${p.slug}`}>{p.slug}</a>
            <span class={styles.title}>{p.title}</span>
            <span class={styles.year}>{p.year}</span>
            <span class={styles.tagline}>{p.tagline}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

`ProjectsBlock.module.css`:

```css
.root { display: flex; flex-direction: column; gap: var(--space-3); }
.count { color: var(--text-muted); font-size: var(--text-sm); }
.list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: var(--space-1); }
.row {
  display: grid;
  grid-template-columns: minmax(8ch, 1fr) minmax(16ch, 2fr) 6ch minmax(0, 3fr);
  gap: var(--space-3);
  padding: var(--space-1) 0;
  border-bottom: 1px dashed var(--border-default);
  font-family: var(--font-code);
  font-size: var(--text-sm);
}
.slug { color: var(--accent-primary); }
.title { color: var(--text-primary); }
.year { color: var(--text-dim); }
.tagline { color: var(--text-muted); }
@media (max-width: 640px) {
  .row { grid-template-columns: 1fr; gap: 0; }
}
```

- [ ] **Step 3:** `ProjectBlock.tsx`:

```tsx
import type { Project } from '@hoatrinh/content';
import styles from './ProjectBlock.module.css';

export function ProjectBlock(props: { data: Project }) {
  return (
    <article class={styles.root}>
      <header class={styles.header}>
        <h1 class={styles.title}>{props.data.title}</h1>
        <p class={styles.tagline}>{props.data.tagline}</p>
        <dl class={styles.meta}>
          <div><dt>Role</dt><dd>{props.data.role}</dd></div>
          <div><dt>Year</dt><dd>{props.data.year}</dd></div>
          <div><dt>Status</dt><dd>{props.data.status}</dd></div>
        </dl>
        {props.data.tech.length > 0 && (
          <ul class={styles.tech}>
            {props.data.tech.map((t) => <li>{t}</li>)}
          </ul>
        )}
      </header>
      <div class={styles.body} innerHTML={props.data.bodyHtml} />
      {(props.data.links.live || props.data.links.repo) && (
        <ul class={styles.links}>
          {props.data.links.live && <li><a href={props.data.links.live}>Live</a></li>}
          {props.data.links.repo && <li><a href={props.data.links.repo}>Repo</a></li>}
        </ul>
      )}
    </article>
  );
}
```

`ProjectBlock.module.css`:

```css
.root { display: flex; flex-direction: column; gap: var(--space-3); }
.header { display: flex; flex-direction: column; gap: var(--space-2); }
.title { font-size: var(--text-xl); font-weight: 700; }
.tagline { color: var(--text-muted); font-size: var(--text-md); }
.meta { display: flex; flex-wrap: wrap; gap: var(--space-4); font-size: var(--text-xs); color: var(--text-muted); }
.meta div { display: flex; gap: var(--space-1); }
.meta dt::after { content: ':'; }
.meta dd { color: var(--text-primary); }
.tech { display: flex; flex-wrap: wrap; gap: var(--space-1); list-style: none; padding: 0; }
.tech li {
  font-family: var(--font-code);
  font-size: var(--text-xs);
  color: var(--text-muted);
  border: 1px solid var(--border-default);
  padding: 0 var(--space-2);
  border-radius: var(--radius-sm);
}
.body :global(p) { margin-bottom: var(--space-2); }
.body :global(code) {
  font-family: var(--font-code);
  background: var(--bg-subtle);
  padding: 0 var(--space-1);
  border-radius: var(--radius-sm);
}
.links { display: flex; gap: var(--space-4); list-style: none; padding: 0; }
```

- [ ] **Step 4:** `ExperienceBlock.tsx`:

```tsx
import type { Experience } from '@hoatrinh/content';
import styles from './ExperienceBlock.module.css';

function formatDates(start: string, end: string | 'present'): string {
  return `${start} – ${end}`;
}

export function ExperienceBlock(props: { data: Experience[] }) {
  return (
    <ol class={styles.list}>
      {props.data.map((e) => (
        <li class={styles.role}>
          <div class={styles.head}>
            <span class={styles.company}>{e.company}</span>
            <span class={styles.sep}>·</span>
            <span class={styles.title}>{e.title}</span>
            <span class={styles.dates}>{formatDates(e.start, e.end)}</span>
          </div>
          {e.location && <div class={styles.location}>{e.location}</div>}
          {e.highlights.length > 0 && (
            <ul class={styles.highlights}>
              {e.highlights.map((h) => <li>{h}</li>)}
            </ul>
          )}
        </li>
      ))}
    </ol>
  );
}
```

`ExperienceBlock.module.css`:

```css
.list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: var(--space-4); }
.role { display: flex; flex-direction: column; gap: var(--space-1); }
.head { display: flex; flex-wrap: wrap; gap: var(--space-2); align-items: baseline; }
.company { color: var(--accent-primary); font-weight: 700; }
.sep { color: var(--text-dim); }
.title { color: var(--text-primary); }
.dates { color: var(--text-muted); font-family: var(--font-code); font-size: var(--text-xs); margin-left: auto; }
.location { color: var(--text-muted); font-size: var(--text-xs); }
.highlights { padding-left: var(--space-4); color: var(--text-primary); font-size: var(--text-sm); }
.highlights li { margin-bottom: var(--space-1); }
```

- [ ] **Step 5:** `SkillsBlock.tsx`:

```tsx
import type { SkillGroup } from '@hoatrinh/content';
import styles from './SkillsBlock.module.css';

export function SkillsBlock(props: { data: SkillGroup[] }) {
  return (
    <section class={styles.root}>
      {props.data.map((g) => (
        <div class={styles.group}>
          <h2 class={styles.label}>{g.label}</h2>
          <ul class={styles.items}>
            {g.items.map((i) => <li>{i}</li>)}
          </ul>
        </div>
      ))}
    </section>
  );
}
```

`SkillsBlock.module.css`:

```css
.root { display: grid; grid-template-columns: repeat(auto-fit, minmax(14ch, 1fr)); gap: var(--space-4); }
.group { display: flex; flex-direction: column; gap: var(--space-1); }
.label { font-size: var(--text-xs); text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-muted); }
.items { list-style: none; padding: 0; display: flex; flex-direction: column; gap: var(--space-1); font-family: var(--font-code); font-size: var(--text-sm); }
```

- [ ] **Step 6:** `ContactBlock.tsx`:

```tsx
import type { Link } from '@hoatrinh/content';
import styles from './ContactBlock.module.css';

export function ContactBlock(props: { data: Link[] }) {
  return (
    <ul class={styles.list}>
      {props.data.map((l) => (
        <li class={styles.row}>
          <span class={styles.label}>{l.label}</span>
          <a class={styles.link} href={l.href}>{l.href}</a>
        </li>
      ))}
    </ul>
  );
}
```

`ContactBlock.module.css`:

```css
.list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: var(--space-1); font-family: var(--font-code); font-size: var(--text-sm); }
.row { display: grid; grid-template-columns: 12ch 1fr; gap: var(--space-3); }
.label { color: var(--text-muted); }
.link { color: var(--accent-primary); }
@media (max-width: 640px) {
  .row { grid-template-columns: 1fr; }
}
```

- [ ] **Step 7:** `HelpBlock.tsx`:

```tsx
import styles from './HelpBlock.module.css';
import type { HelpEntry } from '@/terminal/entries';

export function HelpBlock(props: { data: HelpEntry['data'] }) {
  return (
    <section class={styles.root}>
      <p class={styles.hint}>Type a command and press Enter. Tab completes. Up/Down scroll history.</p>
      <table class={styles.table}>
        <tbody>
          {props.data.commands.map((c) => (
            <tr>
              <td class={styles.usage}>{c.usage}</td>
              <td class={styles.summary}>{c.summary}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p class={styles.footer}>built with solid, vite, bun, typescript</p>
    </section>
  );
}
```

`HelpBlock.module.css`:

```css
.root { display: flex; flex-direction: column; gap: var(--space-3); }
.hint { color: var(--text-muted); font-size: var(--text-sm); }
.table { border-collapse: collapse; font-family: var(--font-code); font-size: var(--text-sm); }
.table td { padding: var(--space-1) var(--space-3) var(--space-1) 0; vertical-align: top; }
.usage { color: var(--accent-primary); white-space: nowrap; }
.summary { color: var(--text-primary); }
.footer { color: var(--text-dim); font-size: var(--text-xs); }
```

- [ ] **Step 8:** `TextBlock.tsx`:

```tsx
import styles from './TextBlock.module.css';

export function TextBlock(props: { lines: string[] }) {
  return (
    <div class={styles.root}>
      {props.lines.map((l) => <p>{l}</p>)}
    </div>
  );
}
```

`TextBlock.module.css`:

```css
.root { color: var(--text-primary); font-family: var(--font-code); font-size: var(--text-sm); display: flex; flex-direction: column; gap: var(--space-1); }
.root p:empty::before { content: '\00a0'; }
```

- [ ] **Step 9:** `ErrorBlock.tsx`:

```tsx
import styles from './ErrorBlock.module.css';

export function ErrorBlock(props: {
  message: string;
  suggestions: string[];
  onSuggestion?: (s: string) => void;
}) {
  return (
    <div class={styles.root}>
      <p class={styles.message}><span aria-hidden="true">×</span> {props.message}</p>
      {props.suggestions.length > 0 && (
        <p class={styles.suggestLine}>
          Try:{' '}
          {props.suggestions.map((s, i) => (
            <>
              {i > 0 && ', '}
              <button
                class={styles.chip}
                type="button"
                onClick={() => props.onSuggestion?.(s)}
              >
                {s}
              </button>
            </>
          ))}
        </p>
      )}
    </div>
  );
}
```

`ErrorBlock.module.css`:

```css
.root { display: flex; flex-direction: column; gap: var(--space-1); color: var(--state-error); font-family: var(--font-code); font-size: var(--text-sm); }
.message { display: flex; gap: var(--space-1); align-items: baseline; }
.suggestLine { color: var(--text-muted); }
.chip {
  font-family: var(--font-code);
  color: var(--accent-primary);
  text-decoration: underline dotted;
  padding: 0;
}
.chip:hover { text-decoration: underline solid; }
```

- [ ] **Step 10:** Typecheck; expect clean.
- [ ] **Step 11:** Commit:
```bash
git add apps/web/src/components/blocks/
git commit -m "feat(web): add all entry block components (profile, projects, project, experience, skills, contact, help, text, error)"
```

### Task 5.3 — EntryRenderer

**Files:**
- Create: `apps/web/src/components/EntryRenderer/EntryRenderer.tsx`
- Create: `apps/web/src/components/EntryRenderer/EntryRenderer.module.css`
- Create: `apps/web/src/components/EntryRenderer/EntryRenderer.test.tsx`

- [ ] **Step 1:** Write test:

```tsx
import { describe, expect, it } from 'vitest';
import { render } from '@solidjs/testing-library';
import { EntryRenderer } from './EntryRenderer';
import { resetEntryIds, nextEntryId } from '@/terminal/entries';
import type { TerminalEntry } from '@/terminal/entries';

function textEntry(input: string, lines: string[]): TerminalEntry {
  resetEntryIds();
  return { id: nextEntryId(), input, kind: 'text', lines };
}

describe('EntryRenderer', () => {
  it('renders the input echo', () => {
    const { getByText } = render(() => <EntryRenderer entry={textEntry('help', ['hi'])} />);
    expect(getByText('help')).toBeInTheDocument();
  });

  it('renders the text body', () => {
    const { getByText } = render(() => <EntryRenderer entry={textEntry('x', ['hello world'])} />);
    expect(getByText('hello world')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2:** Run tests; expect fail.
- [ ] **Step 3:** Create `EntryRenderer.tsx`:

```tsx
import { Match, Switch } from 'solid-js';
import { ContactBlock } from '../blocks/ContactBlock/ContactBlock';
import { ErrorBlock } from '../blocks/ErrorBlock/ErrorBlock';
import { ExperienceBlock } from '../blocks/ExperienceBlock/ExperienceBlock';
import { HelpBlock } from '../blocks/HelpBlock/HelpBlock';
import { ProfileBlock } from '../blocks/ProfileBlock/ProfileBlock';
import { ProjectBlock } from '../blocks/ProjectBlock/ProjectBlock';
import { ProjectsBlock } from '../blocks/ProjectsBlock/ProjectsBlock';
import { SkillsBlock } from '../blocks/SkillsBlock/SkillsBlock';
import { TextBlock } from '../blocks/TextBlock/TextBlock';
import { InputEcho } from '../InputEcho/InputEcho';
import type { TerminalEntry } from '@/terminal/entries';
import styles from './EntryRenderer.module.css';

export function EntryRenderer(props: {
  entry: TerminalEntry;
  onSuggestion?: (s: string) => void;
}) {
  const labelId = `entry-${props.entry.id}-label`;
  return (
    <article class={styles.entry} data-kind={props.entry.kind} aria-labelledby={labelId}>
      <h2 id={labelId} class="sr-only">Output of: {props.entry.input || 'empty'}</h2>
      <InputEcho text={props.entry.input} />
      <div class={styles.body}>
        <Switch>
          <Match when={props.entry.kind === 'profile'}>
            <ProfileBlock data={(props.entry as Extract<TerminalEntry, { kind: 'profile' }>).data} />
          </Match>
          <Match when={props.entry.kind === 'projects'}>
            <ProjectsBlock data={(props.entry as Extract<TerminalEntry, { kind: 'projects' }>).data} />
          </Match>
          <Match when={props.entry.kind === 'project'}>
            <ProjectBlock data={(props.entry as Extract<TerminalEntry, { kind: 'project' }>).data} />
          </Match>
          <Match when={props.entry.kind === 'experience'}>
            <ExperienceBlock data={(props.entry as Extract<TerminalEntry, { kind: 'experience' }>).data} />
          </Match>
          <Match when={props.entry.kind === 'skills'}>
            <SkillsBlock data={(props.entry as Extract<TerminalEntry, { kind: 'skills' }>).data} />
          </Match>
          <Match when={props.entry.kind === 'contact'}>
            <ContactBlock data={(props.entry as Extract<TerminalEntry, { kind: 'contact' }>).data} />
          </Match>
          <Match when={props.entry.kind === 'help'}>
            <HelpBlock data={(props.entry as Extract<TerminalEntry, { kind: 'help' }>).data} />
          </Match>
          <Match when={props.entry.kind === 'text'}>
            <TextBlock lines={(props.entry as Extract<TerminalEntry, { kind: 'text' }>).lines} />
          </Match>
          <Match when={props.entry.kind === 'error'}>
            <ErrorBlock
              message={(props.entry as Extract<TerminalEntry, { kind: 'error' }>).message}
              suggestions={(props.entry as Extract<TerminalEntry, { kind: 'error' }>).suggestions}
              onSuggestion={props.onSuggestion}
            />
          </Match>
        </Switch>
      </div>
    </article>
  );
}
```

- [ ] **Step 4:** Create `EntryRenderer.module.css`:

```css
.entry {
  display: flex;
  flex-direction: column;
  padding: var(--space-2) 0;
}

@media (prefers-reduced-motion: no-preference) {
  .entry { animation: entry-in 120ms ease-out; }
}

@keyframes entry-in {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: none; }
}

.body { display: flex; flex-direction: column; gap: var(--space-2); }
```

- [ ] **Step 5:** Run tests; expect pass.
- [ ] **Step 6:** Commit:
```bash
git add apps/web/src/components/EntryRenderer/
git commit -m "feat(web): add EntryRenderer dispatcher with aria-labelledby per entry"
```

### Task 5.4 — EntryList

**Files:**
- Create: `apps/web/src/components/EntryList/EntryList.tsx`
- Create: `apps/web/src/components/EntryList/EntryList.module.css`

- [ ] **Step 1:** Create `EntryList.tsx`:

```tsx
import { For } from 'solid-js';
import { EntryRenderer } from '../EntryRenderer/EntryRenderer';
import type { TerminalEntry } from '@/terminal/entries';
import styles from './EntryList.module.css';

export function EntryList(props: {
  entries: TerminalEntry[];
  onSuggestion?: (s: string) => void;
}) {
  return (
    <section
      role="log"
      aria-live="polite"
      aria-atomic="false"
      aria-label="Terminal output"
      class={styles.list}
    >
      <For each={props.entries}>
        {(entry) => <EntryRenderer entry={entry} onSuggestion={props.onSuggestion} />}
      </For>
    </section>
  );
}
```

- [ ] **Step 2:** Create `EntryList.module.css`:

```css
.list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
```

- [ ] **Step 3:** Commit:
```bash
git add apps/web/src/components/EntryList/
git commit -m "feat(web): add EntryList log region"
```

### Task 5.5 — Prompt

**Files:**
- Create: `apps/web/src/components/Prompt/Prompt.tsx`
- Create: `apps/web/src/components/Prompt/Prompt.module.css`
- Create: `apps/web/src/components/Prompt/Prompt.test.tsx`

- [ ] **Step 1:** Write test:

```tsx
import { describe, expect, it, vi } from 'vitest';
import { render, fireEvent } from '@solidjs/testing-library';
import { Prompt } from './Prompt';

describe('Prompt', () => {
  it('calls onSubmit with the input value', () => {
    const onSubmit = vi.fn();
    const { getByLabelText } = render(() => (
      <Prompt value="" onInput={() => {}} onSubmit={onSubmit} onHistory={() => null} onTab={() => null} />
    ));
    const input = getByLabelText(/terminal prompt/i) as HTMLInputElement;
    input.value = 'about';
    fireEvent.input(input);
    fireEvent.submit(input.form!);
    expect(onSubmit).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2:** Run tests; expect fail.
- [ ] **Step 3:** Create `Prompt.tsx`:

```tsx
import { createSignal } from 'solid-js';
import styles from './Prompt.module.css';

export type HistoryDirection = 'up' | 'down';
export type TabAction = { completion: string | null; candidates: string[] };

export function Prompt(props: {
  value: string;
  sigil?: string;
  onInput: (v: string) => void;
  onSubmit: (raw: string) => void;
  onHistory: (dir: HistoryDirection) => string | null;
  onTab: (raw: string) => TabAction | null;
}) {
  let inputEl: HTMLInputElement | undefined;
  const [announce, setAnnounce] = createSignal<string>('');

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const next = props.onHistory('up');
      if (next !== null) props.onInput(next);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = props.onHistory('down');
      if (next !== null) props.onInput(next);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const result = props.onTab(props.value);
      if (!result) return;
      if (result.completion) {
        props.onInput(result.completion);
      } else if (result.candidates.length > 0) {
        setAnnounce(`Matches: ${result.candidates.join(', ')}`);
      }
    }
  }

  function handleSubmit(e: Event) {
    e.preventDefault();
    props.onSubmit(props.value);
  }

  return (
    <form class={styles.prompt} onSubmit={handleSubmit} role="search">
      <label for="terminal-input" class="sr-only">Terminal prompt, type a command</label>
      <span class={styles.sigil} aria-hidden="true">{props.sigil ?? 'hoa@trinh.dev ~ %'}</span>
      <input
        id="terminal-input"
        ref={inputEl}
        class={styles.input}
        type="text"
        value={props.value}
        autocomplete="off"
        autocorrect="off"
        autocapitalize="none"
        spellcheck={false}
        enterkeyhint="go"
        inputmode="text"
        aria-describedby="prompt-announce"
        onInput={(e) => props.onInput(e.currentTarget.value)}
        onKeyDown={handleKeyDown}
      />
      <span id="prompt-announce" class="sr-only" aria-live="polite">{announce()}</span>
    </form>
  );
}
```

- [ ] **Step 4:** Create `Prompt.module.css`:

```css
.prompt {
  display: flex;
  gap: var(--space-2);
  align-items: baseline;
  padding: var(--space-2) 0;
  position: sticky;
  bottom: 0;
  background: var(--bg-base);
}
.sigil {
  font-family: var(--font-code);
  font-weight: 700;
  color: var(--accent-primary);
  white-space: nowrap;
}
.input {
  font-family: var(--font-code);
  font-size: var(--text-base);
  color: var(--text-primary);
  caret-color: var(--accent-primary);
  flex: 1;
  min-width: 0;
}
@media (max-width: 640px) {
  .input { font-size: var(--text-md); }
}
```

- [ ] **Step 5:** Run tests; expect pass.
- [ ] **Step 6:** Commit:
```bash
git add apps/web/src/components/Prompt/
git commit -m "feat(web): add Prompt component with history and tab handlers"
```

---

## ✋ REVIEW CHECKPOINT — Phase 5

Verify:
- Component tests green.
- Imports resolve (`@/terminal/entries`, `@hoatrinh/content`).
- No component depends on a specific page layout — each is usable in isolation.

---

## Phase 6 — Routing and TerminalPage

**Goal:** App uses `@solidjs/router` with a route per initial-command. Hydration works. Client-side command execution updates URL.

### Task 6.1 — TerminalPage

**Files:**
- Create: `apps/web/src/routes/TerminalPage.tsx`
- Create: `apps/web/src/routes/TerminalPage.module.css`

- [ ] **Step 1:** Create `apps/web/src/routes/TerminalPage.tsx`:

```tsx
import { onMount } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { createHistory } from '@/terminal/history';
import { execute } from '@/terminal/execute';
import { registry } from '@/terminal/commands';
import { autocomplete } from '@/terminal/autocomplete';
import { createTerminalStore } from '@/terminal/store';
import { EntryList } from '@/components/EntryList/EntryList';
import { Prompt } from '@/components/Prompt/Prompt';
import { getProjects } from '@hoatrinh/content';
import styles from './TerminalPage.module.css';

export function TerminalPage(props: { initialCommand?: string }) {
  const [state, setState] = createTerminalStore();
  const navigate = useNavigate();
  const history = createHistory();

  onMount(async () => {
    if (props.initialCommand) {
      await execute(props.initialCommand, { state, setState, registry, navigate: () => {} });
    }
    if (matchMedia('(pointer: fine)').matches) {
      document.getElementById('terminal-input')?.focus();
    }
  });

  async function submit(raw: string) {
    const trimmed = raw.trim();
    if (trimmed) history.push(trimmed);
    setState('currentInput', '');
    history.reset();
    await execute(raw, { state, setState, registry, navigate });
  }

  function onHistory(dir: 'up' | 'down') {
    if (history.cursor() < 0 && dir === 'up') return history.startNavigation(state.currentInput);
    return dir === 'up' ? history.navigateUp() : history.navigateDown();
  }

  function onTab(raw: string) {
    return autocomplete(raw, {
      commands: registry.vocab,
      projectSlugs: getProjects().map((p) => p.slug),
    });
  }

  function onSuggestion(s: string) {
    setState('currentInput', s);
    submit(s);
  }

  function onListClick(e: MouseEvent) {
    const selection = window.getSelection();
    if (selection && selection.toString()) return;
    if ((e.target as HTMLElement).closest('a, button')) return;
    document.getElementById('terminal-input')?.focus();
  }

  return (
    <main class={styles.page}>
      <a class="skip-link" href="#terminal-input">Skip to prompt</a>
      <div class={styles.scroll} onClick={onListClick}>
        <EntryList entries={state.entries} onSuggestion={onSuggestion} />
      </div>
      <Prompt
        value={state.currentInput}
        onInput={(v) => setState('currentInput', v)}
        onSubmit={submit}
        onHistory={onHistory}
        onTab={onTab}
      />
    </main>
  );
}
```

- [ ] **Step 2:** Create `TerminalPage.module.css`:

```css
.page {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  max-width: 72ch;
  margin: 0 auto;
  padding: var(--space-4) var(--space-4) 0;
  gap: var(--space-2);
}
@media (min-width: 640px) {
  .page { padding: var(--space-6); }
}
.scroll { flex: 1; overflow-y: auto; }
```

- [ ] **Step 3:** Commit:
```bash
git add apps/web/src/routes/TerminalPage.tsx apps/web/src/routes/TerminalPage.module.css
git commit -m "feat(web): add TerminalPage route with history, tab completion, focus routing"
```

### Task 6.2 — NotFoundPage

**Files:**
- Create: `apps/web/src/routes/NotFoundPage.tsx`

- [ ] **Step 1:** Create:

```tsx
import { TerminalPage } from './TerminalPage';

export function NotFoundPage() {
  return <TerminalPage initialCommand="help" />;
}
```

- [ ] **Step 2:** Commit:
```bash
git add apps/web/src/routes/NotFoundPage.tsx
git commit -m "feat(web): 404 falls back to help output"
```

### Task 6.3 — App + Router

**Files:**
- Modify: `apps/web/src/App.tsx`

- [ ] **Step 1:** Replace `apps/web/src/App.tsx`:

```tsx
import { Route, Router } from '@solidjs/router';
import { TerminalPage } from './routes/TerminalPage';
import { NotFoundPage } from './routes/NotFoundPage';

export function App(props: { url?: string }) {
  return (
    <Router url={props.url}>
      <Route path="/" component={() => <TerminalPage initialCommand="about" />} />
      <Route path="/about" component={() => <TerminalPage initialCommand="about" />} />
      <Route path="/projects" component={() => <TerminalPage initialCommand="projects" />} />
      <Route
        path="/project/:slug"
        component={(p: any) => <TerminalPage initialCommand={`project ${p.params.slug}`} />}
      />
      <Route path="/experience" component={() => <TerminalPage initialCommand="experience" />} />
      <Route path="/skills" component={() => <TerminalPage initialCommand="skills" />} />
      <Route path="/contact" component={() => <TerminalPage initialCommand="contact" />} />
      <Route path="/help" component={() => <TerminalPage initialCommand="help" />} />
      <Route path="*" component={NotFoundPage} />
    </Router>
  );
}
```

- [ ] **Step 2:** `bun run dev` → visit `/`, `/projects`, `/project/keepgoing`, `/zzz`. Confirm correct initial entry for each.
- [ ] **Step 3:** Commit:
```bash
git add apps/web/src/App.tsx
git commit -m "feat(web): wire router with all MVP routes"
```

---

## ✋ REVIEW CHECKPOINT — Phase 6

Verify in dev server:
- `/` shows `> about` with profile block, prompt focused on desktop.
- Typing `projects` changes URL to `/projects`.
- Unknown URL falls back to `help`.
- `clear` empties visible entries.
- Up arrow recalls last command.
- Tab completes `abo` → `about`.

---

## Phase 7 — SSG prerender

**Goal:** `bun run build && bun run prerender` emits static HTML for every route with correct meta tags.

### Task 7.1 — Entry-server + prerender script

**Files:**
- Create: `apps/web/src/entry-server.tsx`
- Create: `apps/web/scripts/shell.ts`
- Create: `apps/web/scripts/prerender.ts`

- [ ] **Step 1:** Create `apps/web/src/entry-server.tsx`:

```tsx
import { generateHydrationScript, renderToString } from 'solid-js/web';
import { MetaProvider, renderTags } from '@solidjs/meta';
import { App } from './App';

export type RenderResult = { body: string; head: string };

export async function renderUrl(url: string): Promise<RenderResult> {
  const tags: any[] = [];
  const body = renderToString(() => (
    <MetaProvider tags={tags}>
      <App url={url} />
    </MetaProvider>
  ));
  const head = renderTags(tags) + generateHydrationScript();
  return { body, head };
}
```

- [ ] **Step 2:** Create `apps/web/scripts/shell.ts`:

```ts
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const indexHtml = readFileSync(
  fileURLToPath(new URL('../dist/index.html', import.meta.url)),
  'utf8',
);

export function shellHtml(body: string, head: string, meta: { title: string; description: string; url: string }) {
  let out = indexHtml;
  out = out.replace(
    /<title>.*<\/title>/,
    `<title>${escape(meta.title)}</title>\n    <meta name="description" content="${escape(meta.description)}" />\n    <meta property="og:title" content="${escape(meta.title)}" />\n    <meta property="og:description" content="${escape(meta.description)}" />\n    <meta property="og:url" content="${escape(meta.url)}" />\n    <meta property="og:type" content="website" />\n    <link rel="canonical" href="${escape(meta.url)}" />\n    ${head}`,
  );
  out = out.replace(
    '<div id="app"></div>',
    `<div id="app">${body}</div>`,
  );
  return out;
}

function escape(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
}
```

- [ ] **Step 3:** Create `apps/web/scripts/prerender.ts`:

```ts
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderUrl } from '../src/entry-server';
import { shellHtml } from './shell';
import { getProjects, getProfile } from '@hoatrinh/content';

const DIST = fileURLToPath(new URL('../dist', import.meta.url));
const SITE_URL = process.env.SITE_URL || 'https://hoatrinh.dev';

const profile = getProfile();

type RouteDef = { path: string; title: string; description: string };

const routes: RouteDef[] = [
  { path: '/', title: `${profile.name} — ${profile.role}`, description: `${profile.name}. ${profile.role}. ${profile.location}.` },
  { path: '/about', title: `About — ${profile.name}`, description: profile.role },
  { path: '/projects', title: `Projects — ${profile.name}`, description: 'Things I have built.' },
  { path: '/experience', title: `Experience — ${profile.name}`, description: 'Past roles.' },
  { path: '/skills', title: `Skills — ${profile.name}`, description: 'Tech and tools I work with.' },
  { path: '/contact', title: `Contact — ${profile.name}`, description: 'Ways to reach me.' },
  { path: '/help', title: `Help — ${profile.name}`, description: 'Commands available.' },
  ...getProjects().map((p) => ({
    path: `/project/${p.slug}`,
    title: `${p.title} — ${profile.name}`,
    description: p.tagline,
  })),
];

for (const route of routes) {
  const rendered = await renderUrl(route.path);
  const html = shellHtml(rendered.body, rendered.head, {
    title: route.title,
    description: route.description,
    url: `${SITE_URL}${route.path === '/' ? '' : route.path}`,
  });
  const outPath = route.path === '/' ? join(DIST, 'index.html') : join(DIST, route.path.slice(1), 'index.html');
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, html);
  console.log(`  prerendered ${route.path} → ${outPath.replace(DIST, 'dist')}`);
}

// 404
const notFound = await renderUrl('/__not_found__');
await writeFile(
  join(DIST, '404.html'),
  shellHtml(notFound.body, notFound.head, {
    title: `Not Found — ${profile.name}`,
    description: 'Route not found.',
    url: `${SITE_URL}/404`,
  }),
);

// sitemap
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map((r) => `  <url><loc>${SITE_URL}${r.path === '/' ? '' : r.path}</loc></url>`).join('\n')}
</urlset>
`;
await writeFile(join(DIST, 'sitemap.xml'), sitemap);
console.log('  wrote sitemap.xml and 404.html');
```

- [ ] **Step 4:** Run `bun run build && bun run prerender`. Expect success + files in `apps/web/dist/`.
- [ ] **Step 5:** Spot-check: open `dist/project/keepgoing/index.html` in a browser with JS disabled — should show the project block.
- [ ] **Step 6:** Commit:
```bash
git add apps/web/src/entry-server.tsx apps/web/scripts/
git commit -m "feat(web): add SSG prerender pipeline with sitemap and 404"
```

### Task 7.2 — Vite config: emit index.html as template

The default Vite build emits `dist/index.html` which the prerender script reads as a template. Verify this works; no config change needed. If the build produces no `dist/index.html` (e.g., because an SSR plugin was added later), revisit.

- [ ] **Step 1:** Confirm `apps/web/dist/index.html` exists after `bun run build`.
- [ ] **Step 2:** If missing, surface at review checkpoint; do not improvise.

---

## ✋ REVIEW CHECKPOINT — Phase 7

Verify:
- `apps/web/dist/` contains HTML for every route.
- Viewing `/project/keepgoing/index.html` in a browser with JS disabled shows content.
- `dist/sitemap.xml` lists every route.
- `dist/404.html` present.

---

## Phase 8 — E2E smoke tests

### Task 8.1 — Playwright config and smoke spec

**Files:**
- Create: `apps/web/playwright.config.ts`
- Create: `apps/web/tests/e2e/smoke.spec.ts`

- [ ] **Step 1:** Create `apps/web/playwright.config.ts`:

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  use: { baseURL: 'http://localhost:4173' },
  webServer: {
    command: 'bun run preview',
    port: 4173,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
```

- [ ] **Step 2:** Create `apps/web/tests/e2e/smoke.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test('cold load runs about', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('#terminal-input')).toBeFocused();
});

test('projects command updates URL', async ({ page }) => {
  await page.goto('/');
  const input = page.locator('#terminal-input');
  await input.fill('projects');
  await input.press('Enter');
  await expect(page).toHaveURL(/\/projects$/);
});

test('deep link renders statically (js disabled)', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/project/keepgoing');
  await expect(page.getByText('keepgoing', { exact: false })).toBeVisible();
  await context.close();
});

test('unknown command shows error with suggestion', async ({ page }) => {
  await page.goto('/');
  const input = page.locator('#terminal-input');
  await input.fill('abot');
  await input.press('Enter');
  await expect(page.getByRole('button', { name: 'about' })).toBeVisible();
});

test('up arrow recalls previous command', async ({ page }) => {
  await page.goto('/');
  const input = page.locator('#terminal-input');
  await input.fill('projects');
  await input.press('Enter');
  await input.press('ArrowUp');
  await expect(input).toHaveValue('projects');
});

test('clear empties the entry list', async ({ page }) => {
  await page.goto('/');
  const input = page.locator('#terminal-input');
  await input.fill('clear');
  await input.press('Enter');
  await expect(page.locator('[data-kind]')).toHaveCount(0);
});
```

- [ ] **Step 3:** `bun x playwright install chromium` once, then `bun run e2e`. Expect pass.
- [ ] **Step 4:** Commit:
```bash
git add apps/web/playwright.config.ts apps/web/tests/e2e/
git commit -m "test(web): add playwright smoke suite for all critical paths"
```

---

## ✋ REVIEW CHECKPOINT — Phase 8

Verify:
- `bun run e2e` green locally.
- CI (on push) runs the full pipeline including e2e.

---

## Phase 9 — Deployment to Cloudflare Pages

Mostly manual steps. Documented here for the record.

### Task 9.1 — Build configuration

**Files:**
- Create: `README.md` (first time)

- [ ] **Step 1:** Create `README.md`:

```md
# hoatrinh.dev

Terminal-native personal portfolio. Bun monorepo, Solid + Vite, static-site generated, deployed to Cloudflare Pages.

## Dev

```bash
bun install
bun run dev       # http://localhost:5173
bun run test      # unit
bun run e2e       # smoke
bun run typecheck
bun run build && bun run prerender
bun run preview   # serves dist at http://localhost:4173
```

## Specs

- `specs/ai_terminal_portfolio_spec.md` — product spec
- `specs/hoatrinh_terminal_design_system.md` — design system
- `specs/2026-04-17-hoatrinh-portfolio-design.md` — MVP implementation design
- `specs/2026-04-17-hoatrinh-portfolio-mvp-plan.md` — task-level plan
```

- [ ] **Step 2:** Commit:
```bash
git add README.md
git commit -m "docs: add README with dev commands and spec index"
```

### Task 9.2 — Cloudflare Pages setup (manual)

- [ ] **Step 1:** Push `master` to a new GitHub repo.
- [ ] **Step 2:** In Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git.
- [ ] **Step 3:** Configure build:
  - Framework preset: **None**
  - Build command: `bun install && bun run build && bun run prerender`
  - Build output: `apps/web/dist`
  - Environment variables: `BUN_VERSION=1.1.x` (match your local version), `SITE_URL=https://hoatrinh.dev`
- [ ] **Step 4:** Trigger first deploy; confirm preview URL works.
- [ ] **Step 5:** Add custom domain `hoatrinh.dev`; confirm DNS + HTTPS.
- [ ] **Step 6:** Commit nothing (settings are in CF dashboard).

### Task 9.3 — Cloudflare Web Analytics (optional, recommended)

- [ ] **Step 1:** In CF dashboard → Web Analytics → add site.
- [ ] **Step 2:** Copy the beacon snippet; add to `apps/web/index.html` just before `</body>`.
- [ ] **Step 3:** Re-run prerender locally, confirm snippet appears in `dist/*/index.html`.
- [ ] **Step 4:** Commit:
```bash
git add apps/web/index.html
git commit -m "feat(web): add cloudflare web analytics beacon"
```

---

## ✋ REVIEW CHECKPOINT — Phase 9

Verify:
- Preview URL reachable; content correct.
- Custom domain serves over HTTPS.
- Analytics receiving events after a few visits.

---

## Phase 10 — Content authoring

**Goal:** replace placeholder content with real bio, real project and experience entries.

### Task 10.1 — Gather source material

- [ ] **Step 1:** Fetch `https://hoatrinh.dev` (current outdated site), save relevant text.
- [ ] **Step 2:** Open GitHub profile `https://github.com/mrth2` — capture repo list, descriptions.
- [ ] **Step 3:** Ask user to paste LinkedIn bio + role summaries (LinkedIn blocks scraping).
- [ ] **Step 4:** Review `https://keepgoing.dev` and `https://win95.fun` for project descriptions.

### Task 10.2 — Profile content

**Files:**
- Modify: `packages/content/markdown/profile.md`

- [ ] **Step 1:** Replace placeholder with real bio. Preserve frontmatter schema.
- [ ] **Step 2:** Verify `bun run --filter @hoatrinh/content test` still green.
- [ ] **Step 3:** Commit:
```bash
git add packages/content/markdown/profile.md
git commit -m "content: write real profile bio and links"
```

### Task 10.3 — Project entries

**Files:**
- Modify: `packages/content/markdown/projects/keepgoing.md`
- Create: `packages/content/markdown/projects/win95-fun.md`
- Create: additional project files as applicable

- [ ] **Step 1:** For each project: confirm `slug` matches filename stem; tagline ≤ 140 chars; valid status enum; year int; tech list; live/repo URLs; featured boolean.
- [ ] **Step 2:** Run tests.
- [ ] **Step 3:** Commit:
```bash
git add packages/content/markdown/projects/
git commit -m "content: write real project entries"
```

### Task 10.4 — Experience entries

**Files:**
- Modify: `packages/content/markdown/experience/oneqode.md`
- Create: additional experience files as applicable

- [ ] **Step 1:** Write each role. Frontmatter must be complete.
- [ ] **Step 2:** Run tests.
- [ ] **Step 3:** Commit:
```bash
git add packages/content/markdown/experience/
git commit -m "content: write real experience entries"
```

### Task 10.5 — Refine skills and links

**Files:**
- Modify: `packages/content/src/skills.ts`
- Modify: `packages/content/src/links.ts`

- [ ] **Step 1:** Update skill groups to match current stack.
- [ ] **Step 2:** Update links with real email, real socials.
- [ ] **Step 3:** Run tests.
- [ ] **Step 4:** Commit:
```bash
git add packages/content/src/skills.ts packages/content/src/links.ts
git commit -m "content: refine skills matrix and contact links"
```

---

## ✋ REVIEW CHECKPOINT — Phase 10

Verify:
- All content files pass Zod validation.
- `bun run build && bun run prerender` generates HTML for every real project/experience slug.
- Preview deploy reflects real content.

---

## Phase 11 — Pre-launch QA

### Task 11.1 — Lighthouse

- [ ] **Step 1:** Against the preview URL, run Lighthouse (desktop + mobile).
- [ ] **Step 2:** Confirm Performance ≥ 95, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95.
- [ ] **Step 3:** If any score under target, note it as a follow-up; do not block launch on Performance if LCP meets the spec target.

### Task 11.2 — Keyboard-only pass

- [ ] **Step 1:** Tab through the full page; confirm all interactive elements reachable with visible focus ring.
- [ ] **Step 2:** Test Up/Down history, Tab completion, Enter to submit, suggestion chip focus.
- [ ] **Step 3:** Fix any gaps; commit with message `fix(a11y): ...`.

### Task 11.3 — Accessibility scan

- [ ] **Step 1:** Run axe DevTools on `/`, `/projects`, `/project/keepgoing`, `/experience`.
- [ ] **Step 2:** Address any critical or serious issues.
- [ ] **Step 3:** Commit fixes.

### Task 11.4 — Content proofread

- [ ] **Step 1:** Read every entry aloud. Check typos, tone (concise, direct, not salesy).
- [ ] **Step 2:** Verify all outbound links resolve.
- [ ] **Step 3:** Commit corrections.

### Task 11.5 — Verify token color contrast

- [ ] **Step 1:** Run each text-on-surface pair in `apps/web/src/styles/tokens.css` through a contrast checker:
  - `--text-primary` on `--bg-base`
  - `--text-muted` on `--bg-base`
  - `--text-primary` on `--bg-elevated`
  - `--accent-primary` on `--bg-base`
  - `--state-error` on `--bg-base`
- [ ] **Step 2:** Confirm body text pairs meet WCAG 2.2 AA (4.5:1). Confirm UI/state colors meet 3:1.
- [ ] **Step 3:** If any pair fails, adjust the hex and re-test. Commit as `chore(design): adjust token X for AA contrast`.

### Task 11.6 — Final launch

- [ ] **Step 1:** Merge last changes to `master`.
- [ ] **Step 2:** Confirm production deploy succeeds.
- [ ] **Step 3:** Submit sitemap to Google Search Console manually.
- [ ] **Step 4:** Share with a few trusted reviewers; collect immediate feedback.

---

## ✋ FINAL CHECKPOINT

MVP is live when:
- `hoatrinh.dev` serves a terminal-native portfolio with 8 working commands.
- Deep links `/project/<slug>`, `/experience`, etc. work without JS.
- Lighthouse ≥ 95 across the four categories.
- Content is real (no placeholder strings in production).
- CI is green on master.

---

## Out of scope (V2 roadmap)

See spec Section 11. In order of likely pickup:

1. `apps/ai-worker/` with grounded `ask <question>` command.
2. Blog system: `packages/content/markdown/writing/`, `/blog` + `/post/<slug>` routes.
3. Per-project OG card generation.
4. Theme switching.
5. Lighthouse CI.
