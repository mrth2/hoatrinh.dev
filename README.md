# hoatrinh.dev

Terminal-style personal portfolio. Built with SolidJS, Vite, and Bun.

## Stack

- **Frontend:** SolidJS + Vite SPA with SSR prerender to static HTML
- **Content:** Markdown + frontmatter, validated with Zod, rendered via marked + shiki
- **Monorepo:** Bun workspaces
  - `apps/web` - the SPA
  - `apps/recto-landing` - RECTO pre-MVP landing page (Vite + Solid + Pages Function)
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

## LLM terminal chat (`/ask <question>`)

The terminal now supports an AI command:

- `/ask <question>` - ask about Hoa Trinh Hai (profile, projects, experience, skills, contact)

Out-of-topic questions are refused by policy.

### Workers AI setup (free-tier path)

This repo uses a Cloudflare Pages Function at `apps/web/functions/api/ask.ts` and calls Workers AI server-side.

Preferred runtime setup:

- Bind `AI` in Cloudflare Pages/Workers (recommended, no token/account env needed)

Optional REST fallback environment variables (used only when `AI` binding is missing):

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`
- `WORKERS_AI_MODEL` (optional, defaults to `@cf/meta/llama-3.1-8b-instruct`)
- `WORKERS_AI_FALLBACK_MODELS` (optional, comma-separated models; used on 429/5xx or empty output)

Deployment includes functions with:

- `wrangler pages deploy apps/web/dist --functions=apps/web/functions`

### Local testing before deploy

1. Copy env template:
   - `cp apps/web/.dev.vars.example apps/web/.dev.vars`
2. Fill real values in `apps/web/.dev.vars`.
3. Run local full-stack Pages runtime:
   - `bun run local:ai`

This command builds + prerenders the site, then runs Cloudflare Pages local server from `apps/web` (which includes its `functions/` directory), so `/ask <question>` works locally.
