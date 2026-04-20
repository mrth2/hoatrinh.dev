# hoatrinh.dev

Terminal-style personal portfolio. Built with SolidJS, Vite, and Bun.

## Stack

- **Frontend:** SolidJS + Vite SPA with SSR prerender to static HTML
- **Content:** Markdown + frontmatter, validated with Zod, rendered via marked + shiki
- **Monorepo:** Bun workspaces
  - `apps/web` - the SPA
  - `packages/content` - content loading and rendering

## Getting Started

```bash
bun install
bun run dev
```

## Commands

| Command | Description |
|---|---|
| `bun run dev` | Start Vite dev server |
| `bun run build` | Production build |
| `bun run prerender` | SSR prerender to static HTML |
| `bun run preview` | Preview prerendered build |
| `bun run typecheck` | Type-check all workspaces |
| `bun run lint` | Biome lint |
| `bun run format` | Biome format |
| `bun run test` | Vitest unit tests |
| `bun run e2e` | Playwright e2e tests |

## Architecture

The site is a single terminal-style page. User input is parsed and dispatched through a command registry (`apps/web/src/terminal/`). Each command returns a typed entry that is rendered by a matching block component.

Content lives in `packages/content/markdown/` as Markdown files with frontmatter. All content is loaded eagerly at build time.
