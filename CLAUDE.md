# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Terminal-style personal portfolio for hoatrinh.dev. Bun workspaces monorepo:

- `apps/web` (`@hoatrinh/web`): SolidJS + Vite SPA with SSR prerender to static HTML. The UI is a single terminal page driven by a command registry.
- `packages/content` (`@hoatrinh/content`): markdown + frontmatter content (profile, projects, experience) loaded at build time via Vite's `import.meta.glob`, validated with zod, rendered via `marked` + `shiki`.

Biome is the single source of truth for lint + format. TS is strict (`exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`).

## Common commands

Always use `bun` (not `npm`/`pnpm`). Commands run from repo root unless noted.

- `bun install` - install workspace deps
- `bun run dev` - Vite dev server for `@hoatrinh/web`
- `bun run build` - Vite production build
- `bun run prerender` - SSR each route in `getRoutes()` to static HTML + sitemap.xml + 404.html under `apps/web/dist/`
- `bun run preview` - local preview of the prerendered build (port 4173, used by Playwright)
- `bun run typecheck` - tsc --noEmit across all workspaces
- `bun run lint` - `biome check .`
- `bun run format` - `biome format --write .`
- `bun run test` / `bun run test:unit` - vitest across all workspaces
- `bun run e2e` - Playwright smoke tests (auto-starts `preview`; requires `bun run build && bun run prerender` first, matching CI)

Run a single test file: `bun x vitest run path/to/file.test.ts` (from the workspace that owns it, e.g. `apps/web` or `packages/content`). Watch mode: `bun run test:watch`.

CI (`.github/workflows/ci.yml`) runs: typecheck → lint → test → build → prerender → e2e. Keep that order in mind when debugging CI failures locally.

## apps/web guardrails

For any change under `apps/web/`, always run these from repo root before finishing:

- `bun run typecheck`
- `bun run lint`
- `bun run test`

## Architecture

### Terminal command pipeline (`apps/web/src/terminal/`)

The whole site is one route component (`routes/TerminalPage.tsx`) that dispatches commands through a small pipeline:

1. `parser.ts` tokenizes raw input into `{ cmd, args, rest }`.
2. `registry.ts` holds `CommandSpec`s keyed by name + aliases; `commands.ts` assembles the registry from `handlers/*`.
3. `execute.ts` resolves a spec, invokes its `handler`, appends the resulting `TerminalEntry` to the store, and optionally calls `navigate(spec.route)` to sync the URL. Unknown commands produce an `ErrorEntry` with `nearestMatches` suggestions from `suggestions.ts`.
4. Each `handlers/<cmd>.ts` is a pure function that returns a typed `TerminalEntry` (see `entries.ts` for the discriminated union) or a `ClearAction`.
5. `components/EntryRenderer` switches on `entry.kind` to render the right block under `components/blocks/*`. Data-shape changes: update `entries.ts`, the handler, and the matching block together.

Adding a new command = new file in `handlers/`, a `CommandSpec` entry in `commands.ts`, a new `TerminalEntry` variant (if the shape is new) in `entries.ts`, and a block component in `components/blocks/`.

### Route = initial command (SSR-critical)

`App.tsx` maps URLs like `/about`, `/projects`, `/project/:slug` to `<TerminalPage initialCommand="...">`. The initial command runs **synchronously during component setup** (not in `onMount`) so SSR captures the rendered entries and client hydration matches; `execute` is called with a no-op `navigate` to suppress the side-effect that would otherwise re-push the same URL. If you change this lifecycle, hydration will mismatch.

### SSR + prerender

- `entry-server.tsx` exposes `renderUrl(url)` (uses `renderToString`) and `getRoutes()` (derives the route list from content).
- `scripts/prerender.ts` spins up a Vite SSR server, renders every route returned by `getRoutes()` plus a `/__not_found__` path, and injects the HTML into the built `dist/index.html` shell via `scripts/shell.ts`. `shell.ts` refuses to run twice on the same `dist/index.html` (it detects already-injected `og:title` meta) - rebuild before re-prerendering.
- `entry-client.tsx` calls `hydrate()` when `#app` has SSR children, else `render()` (the recent `66381de` fix).

### Content package (`packages/content`)

- Markdown files live under `packages/content/markdown/{projects,experience}/*.md` plus `profile.md`. Filename stem MUST equal the `slug` frontmatter field - `projects.ts` throws on mismatch.
- `loaders.ts#loadMarkdownEntity` parses frontmatter with `js-yaml`, validates with a zod schema from `schema.ts`, and renders the body with `markdown-render.ts`. Schema failures throw loudly at load time.
- Content modules use Vite's `import.meta.glob(..., { eager: true, query: '?raw' })` and do **top-level await** to resolve all entities before export. This means content is part of the module graph: `getProjects()` etc. are synchronous to callers but the package requires a Vite/SSR environment (noExternal'd in `prerender.ts`).

### Styling

CSS is vanilla + CSS Modules per component. Design tokens live in `apps/web/src/styles/tokens.css`. Fonts are `@fontsource/jetbrains-mono` + `@fontsource/space-mono`, loaded by `entry-client.tsx`.

### Tests

- Unit tests colocated with source (`*.test.ts(x)`), vitest + jsdom, setup in `src/test-setup.ts`.
- E2E smoke tests in `apps/web/tests/e2e/` run against the prerendered preview.

## Gotchas

- `biome.json` excludes `.keepgoing`, `dist`, `playwright-report`, `test-results`, `bun.lock`. If lint suddenly covers one of these, check `files.includes`.
- `specs/` contains design docs and plans, not code. It is not lint/test-excluded but also not imported by anything - treat it as reference material.
- `exactOptionalPropertyTypes` is on: never pass `undefined` where an optional key is expected; spread conditionally (see `<Router {...(props.url !== undefined ? { url: props.url } : {})}>` in `App.tsx`).
- Do not touch `dist/index.html` by hand between `build` and `prerender`; `shell.ts` asserts it is pristine.
