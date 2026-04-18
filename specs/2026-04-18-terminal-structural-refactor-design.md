---
title: Terminal Structural Refactor
date: 2026-04-18
status: approved
related:
  - specs/hoatrinh_terminal_design_system.md
  - specs/2026-04-17-hoatrinh-portfolio-design.md
---

# Terminal Structural Refactor

## Context

The current build renders its pages as a centered 72ch prose column with a thin sticky prompt at the bottom. Against `specs/hoatrinh_terminal_design_system.md` it fails three central requirements:

1. **Prompt is not central and immediately usable.** The sticky bottom bar reads as decoration, not as the primary interaction surface.
2. **Output blocks are not "terminal-native modules."** `ProfileBlock`, `ProjectsBlock`, etc. render as bare prose with no framing, header, or visible relationship to the command that produced them.
3. **No system feel.** Flat background, no grid, no elevated surfaces, no visible command-to-response linkage.

The build is currently *below* the restrained hoatrinh spec (it has lost terminal-ness without gaining portfolio polish) and reads as a static blog with a terminal-themed header. This refactor recovers the "terminal-native" quality through structural vocabulary, not through color saturation.

## Approved decisions

Captured from brainstorming on 2026-04-18:

1. **Tokens unchanged.** Keep the restrained hoatrinh palette (`accent-primary: #6fe0a1`, near-black background). No move toward mono's `#37F712` matrix green.
2. **Landing state = prompt-first with motd.** On `/`, render a compact 3-line motd above an empty prompt. Deep-link routes (`/about`, `/projects`, ...) still auto-run their command.
3. **Prompt stays sticky-bottom, restyled.** Classic terminal model. Visual weight comes from an elevated bar, focus glow, visible caret, left-edge accent rule, optional inline keybind hint.
4. **Per-kind block chrome (hybrid).**
   - `text`, `error`, `help` -> `plain` variant (echo + body, no frame)
   - `skills`, `contact` -> `frame` variant (left-edge accent rule)
   - `profile`, `projects`, `project`, `experience` -> `titled` variant (header strip + bordered body)
5. **Subtle dot grid background.** 1px dots at 24px spacing, derived from `border-default` at ~35% alpha. Hidden under `prefers-contrast: more`.
6. **Implementation via one new primitive** (`<OutputPanel>`) + one small new component (`<Motd>`). No engine, routing, SSR, content, or token value changes.

## Architecture

### New primitives

#### `<OutputPanel>`

Single primitive that wraps every terminal entry and owns its framing chrome.

```tsx
type Variant = 'plain' | 'frame' | 'titled';

interface OutputPanelProps {
  input: string;         // the command string that produced this entry
  variant: Variant;
  meta?: string;         // right-aligned string in titled header (omit to hide)
  children: JSX.Element; // the block component, rendered as body
}
```

Responsibilities:
- Renders the outer `<article>` and the sr-only `<h2>` (moved from `EntryRenderer`).
- Renders the visible input echo (moved from `InputEcho`, which is deleted).
- Applies per-variant framing CSS.
- Owns the entry enter animation (moved from `EntryRenderer.module.css`).

#### `<Motd>`

Compact landing identity block. Rendered above `<EntryList>` when `state.entries.length === 0`. Three text lines, no box, no ASCII art. Unmounts the instant the first command submits.

Props: `onSuggestion(cmd: string): void` (for the clickable `help`/`about` tokens on line 3).

### Component seam changes

- `EntryRenderer` wraps its `<Switch>` in an `<OutputPanel>`. It computes `variant` and `meta` from `entry.kind`:

  | kind        | variant  | meta                       |
  | ----------- | -------- | -------------------------- |
  | `text`      | `plain`  | -                          |
  | `error`     | `plain`  | -                          |
  | `help`      | `plain`  | -                          |
  | `skills`    | `frame`  | -                          |
  | `contact`   | `frame`  | -                          |
  | `profile`   | `titled` | `profile`                  |
  | `projects`  | `titled` | `${count} projects`        |
  | `project`   | `titled` | `${slug}`                  |
  | `experience`| `titled` | `${count} roles`           |

- `InputEcho` is deleted; its role is absorbed by `OutputPanel`'s header.
- Each block component stops rendering its own outer frame or title header; it becomes the body only.

## Page layout

`TerminalPage` becomes a three-row flex column inside the existing centered 72ch column.

### Row 1 - session header (new)

Single line, `text-xs`, `text-dim`. Left: `hoa@trinh.dev` in `accent-primary` weight 700, then ` - session ` in `text-muted`, then an ISO date string of page load in `text-dim` (format `YYYY-MM-DD`, no clock time to avoid SSR/client mismatch concerns). Right: `type 'help' for commands` in `text-muted`, hidden below 640px.

No border below; spacing alone separates it.

### Row 2 - output region

Flex-grows, scrollable (`overflow-y: auto`). Contains:
- `<Motd>` when `state.entries.length === 0`
- `<EntryList>` always

Vertical rhythm between panels: `var(--space-5)`. First child of `EntryList` gets `margin-top: var(--space-4)` for breathing room from the motd.

Existing click-to-focus behavior on the scroll region is preserved.

### Row 3 - prompt bar

Full-bleed within the 72ch column. Elevated (`bg-elevated`), 1px `border-default` top, padding `var(--space-3) var(--space-4)`. Sticky-bottom, `z-index: 2`. Full detail in the Prompt section.

### Background

On `body` (not on the column):
```css
background-image: radial-gradient(var(--grid-dot) 1px, transparent 1px);
background-size: 24px 24px;
```

with `--grid-dot` defined in `tokens.css` as `rgba(31, 42, 35, 0.35)` (the RGB of `border-default` `#1f2a23` at 35% alpha). Under `prefers-contrast: more`, hide via `background-image: none`.

### Column width and responsive padding

- `max-width: 72ch`, centered.
- `>=640px`: column padding `var(--space-6)`.
- `<640px`: column padding `var(--space-4)`.

## Prompt

### Anatomy

Three parts inside the sticky bar: sigil, input, optional inline hint.

- **Sigil** (`hoa@trinh.dev ~ %`): `font-code`, weight 700, `accent-primary`, 1ch right-margin.
- **Input**: `font-code`, `text-md` desktop / `text-base` mobile, `text-primary`, `caret-color: accent-primary`, `flex: 1`. No border or padding on the input itself.
- **Inline hint** (new, optional): `↵ run · ↑↓ history · ⇥ complete`, `text-dim`, small. Shown only when `state.currentInput === ''` AND input is focused. Hidden below 640px. `aria-hidden="true"`.

### Container

- `bg-elevated`, 1px `border-default` top only.
- Padding: `var(--space-3) var(--space-4)`.
- `position: sticky; bottom: 0; z-index: 2`.
- Left-edge 2px `accent-primary` rule via `box-shadow: inset 2px 0 0 var(--accent-primary)` (no DOM). Mirrors the `frame` variant so the prompt visually rhymes with its own output history.

### States

| state            | treatment                                                                                       |
| ---------------- | ----------------------------------------------------------------------------------------------- |
| default          | as above                                                                                        |
| hover (container)| `border-color: border-strong`. No background change.                                            |
| focus-visible    | container border -> `border-strong`, plus `box-shadow: 0 0 0 2px rgba(accent/0.25), inset 2px 0 0 accent-primary`. Caret blinks (browser default). |
| active typing    | same as focus-visible; inline hint hides                                                         |
| disabled         | opacity `0.5`, `cursor: not-allowed`, `aria-disabled`. Defined for completeness; not used today. |
| error            | left rule flashes `state-error` for 200ms, then returns. Under `prefers-reduced-motion`: left rule stays `state-error` until next keystroke (no flash). |

### Mobile (`<640px`)

- Sigil shortens to `~ %`.
- Inline hint hides.
- Padding tightens to `var(--space-2) var(--space-3)`.
- Safe-area: `padding-bottom: calc(var(--space-3) + env(safe-area-inset-bottom))`.

### Accessibility

- Existing `sr-only` label and `aria-live` announce region preserved.
- Inline hint is `aria-hidden="true"` (duplicates what `aria-describedby` already exposes).
- Focus indicator meets WCAG 2.2: 2px, plus non-color signal (border change).

## Output block variants

All three variants share a DOM skeleton: `<article role="group" aria-labelledby={id}>` with a hidden `<h2 class="sr-only">Output of: {input}</h2>`. The visible echo and framing differ.

### `plain`

Used for: `text`, `error`, `help`.

- Stack: input echo line, then body. `gap: var(--space-2)`.
- Echo: `> <input>` in `font-code`. Sigil (`>`) in `text-muted`; input text in `text-primary`.
- No border, no rule, no background.
- Between adjacent plain entries: `margin-top: var(--space-4)`.
- `error`: body text uses `state-error`; existing clickable suggestion tokens preserved.

### `frame`

Used for: `skills`, `contact`.

- Left-edge 2px accent rule spanning full height: `box-shadow: inset 2px 0 0 var(--accent-primary)`.
- Padding: `0 var(--space-4)` so content clears the rule.
- Echo line on top, body below. `gap: var(--space-2)`.
- No top/right/bottom border, no background.

### `titled`

Used for: `profile`, `projects`, `project`, `experience`.

- **Header strip**: `display: flex; justify-content: space-between`, `padding: var(--space-2) var(--space-3)`, `bg-subtle`, 1px `border-default` bottom.
  - Left: `> <input>` (same typography as plain echo).
  - Right: `meta` in `text-dim`, `text-xs`, `letter-spacing: 0.05em`. Omitted entirely if not provided.
- **Body**: `padding: var(--space-4)`, `bg-elevated`.
- **Container**: 1px `border-default`, `radius-md`, no shadow.
- On `<640px`: meta hides (header shows only `> input`); body padding stays `var(--space-4)`; on `<400px`, body padding tightens to `var(--space-3)`.

### Block internals cleanup

Each block's `.module.css` under `components/blocks/*` drops:
- Any outer `.root` flex/grid wrapper (panel handles this).
- Any self-owned framing (border, background, radius).
- Any heading styles that duplicate the `titled` panel header.

Kept: all internal content styles (typography, link lists, grids of sub-items).

Concrete notes per block:
- `ProfileBlock`: keep `.name` (remains `<h1>` for semantics, styled as today), `.role`, `.body`, `.links`. Drop `.root` and `.header` wrappers.
- `ProjectsBlock`, `ProjectBlock`, `ExperienceBlock`: same pattern. Their internal item grids/lists are untouched.
- `SkillsBlock`, `ContactBlock`: drop any root frame; internals untouched.
- `TextBlock`, `ErrorBlock`, `HelpBlock`: drop any root frame; internals untouched.

## Motd

Rendered when `state.entries.length === 0`. `margin-top: var(--space-6)` so the grid reads above it. No box, no border.

### Content

- Line 1: `hoa trinh hai` - `text-primary`, weight 700, `text-lg`, `font-code`.
- Line 2: `senior software engineer · vietnam` - `text-muted`, `text-sm`, `font-code`.
- Line 3: `type 'help' to see commands, or try 'about'` - `text-dim`, `text-sm`, `font-code`. The `help` and `about` tokens are actual `<button type="button">` elements, keyboard-reachable, focus-visible, that call `onSuggestion` (same path error-block suggestions use).

### Removal

Unmounts the instant `state.entries.length > 0`.

## Motion

- **Entry enter animation**: 120ms fade + 4px translate-up. Moves from `EntryRenderer.module.css` to `OutputPanel.module.css`.
- **Prompt error flash**: 200ms color transition on the left rule only.
- **Caret**: browser default blink (no custom animation).
- Everything else is static.

Under `@media (prefers-reduced-motion: reduce)`:
- Disable entry enter animation.
- Disable prompt error flash; left rule stays `state-error` until next keystroke.
- Grid (static) unaffected.

## Accessibility

- **Tab order**: skip-link -> prompt -> output region interactive elements (existing click-to-focus unchanged). Motd buttons land naturally after prompt.
- **`prefers-contrast: more`**: hide dot grid; bump `border-default` -> `border-strong`; raise `text-muted` closer to `text-primary`. Single `@media` block in `global.css` / `tokens.css`.
- **Focus ring**: 2px `accent-primary` outline with 2px offset on all focusables. Defined once in `global.css`; no per-component overrides.
- **Screen reader**: `role="log" aria-live="polite"` on `EntryList` preserved. Each `OutputPanel` retains the sr-only `<h2>` identifying the input.
- **Hit targets**: clickable tokens (motd, error suggestions) get `min-height: 32px` via padding. No hover-only interactions anywhere.
- **Color**: no functional information encoded in color alone (error state also uses the left-rule color change on the prompt, and `state-error` text in body).

## Responsive behavior

| breakpoint | column padding | sigil   | prompt hint | titled meta | panel body padding |
| ---------- | -------------- | ------- | ----------- | ----------- | ------------------ |
| >=640px    | `space-6`      | full    | shown       | shown       | `space-4`          |
| 400-639px  | `space-4`      | `~ %`   | hidden      | hidden      | `space-4`          |
| <400px     | `space-4`      | `~ %`   | hidden      | hidden      | `space-3`          |

## File map

### New files

- `apps/web/src/components/OutputPanel/OutputPanel.tsx`
- `apps/web/src/components/OutputPanel/OutputPanel.module.css`
- `apps/web/src/components/OutputPanel/OutputPanel.test.tsx`
- `apps/web/src/components/Motd/Motd.tsx`
- `apps/web/src/components/Motd/Motd.module.css`

### Rewrites / edits

- `apps/web/src/styles/global.css` - body dot-grid, global focus-ring rule, `prefers-contrast: more` block, `prefers-reduced-motion` block.
- `apps/web/src/styles/tokens.css` - add `--grid-dot` variable only. No value changes to existing tokens.
- `apps/web/src/routes/TerminalPage.tsx` - add session header row; render `<Motd>` when `entries.length === 0`.
- `apps/web/src/routes/TerminalPage.module.css` - 3-row flex layout, responsive column padding.
- `apps/web/src/components/Prompt/Prompt.tsx` - add inline hint element (conditional: empty input + focus).
- `apps/web/src/components/Prompt/Prompt.module.css` - full rewrite per Prompt section.
- `apps/web/src/components/EntryRenderer/EntryRenderer.tsx` - wrap `<Switch>` in `<OutputPanel>`; compute variant + meta from `entry.kind`. Drop its own `<article>` / `<h2>` markup. (Corresponding `.module.css` is deleted; see Deletions.)
- Each `components/blocks/*/*.module.css` - drop self-owned root frames per Output block variants / Block internals cleanup.
- Each `components/blocks/*/*.tsx` - where the kind now uses `titled`, remove the block's own title/header markup.

### Deletions

- `apps/web/src/components/InputEcho/InputEcho.tsx`
- `apps/web/src/components/InputEcho/InputEcho.module.css`
- `apps/web/src/components/EntryRenderer/EntryRenderer.module.css`

### Tests

- `EntryRenderer.test.tsx` - update to assert correct variant selection per kind; preserve existing behavior assertions.
- `OutputPanel.test.tsx` - new: renders input echo; picks variant classes per prop; passes children through; renders meta only when provided.
- `Prompt.test.tsx` - extend: inline hint shows when empty + focused, hides on input, hides below 640px.

### Untouched

- `apps/web/src/terminal/*` (engine, parser, store, registry, execute, autocomplete, history, handlers).
- `apps/web/src/App.tsx` (routing).
- `apps/web/src/entry-client.tsx`, `entry-server.tsx` (SSR).
- `packages/content/*`.
- `apps/web/src/styles/reset.css`, `fonts.css`.

## Acceptance criteria

### Visual

- [ ] Landing `/` shows motd above empty prompt; prompt is unmistakably the primary interaction.
- [ ] `/about` auto-runs `about` and shows a `titled` panel with `profile` meta.
- [ ] `/projects` shows a `titled` panel with `${count} projects` meta.
- [ ] `help` output renders as `plain` variant.
- [ ] `skills` output renders with left-edge accent rule (`frame`).
- [ ] Dot grid visible in gutters but not under panels.
- [ ] Prompt bar is elevated with left accent rule; focus state shows glow + border shift.

### Interaction

- [ ] Clicking anywhere in the output region focuses the prompt (existing behavior preserved).
- [ ] Keyboard-only user can reach prompt, motd buttons, suggestion tokens, and all links.
- [ ] Tab + history navigation still work.
- [ ] Submitting an erroring command flashes the prompt left rule red for 200ms (or shows steady red under reduced motion).
- [ ] Motd unmounts after the first command submit; does not return.

### Accessibility

- [ ] `role="log"` + `aria-live="polite"` announces each new entry.
- [ ] Every focusable element has a visible 2px focus ring.
- [ ] `prefers-reduced-motion` disables entry animation and error flash.
- [ ] `prefers-contrast: more` hides the dot grid and increases text/border contrast.
- [ ] No feature depends on hover alone.
- [ ] Muted and dim text meet WCAG 2.2 AA at their typographic sizes.

### Responsive

- [ ] At 375px viewport: column padding tightens, prompt sigil shortens to `~ %`, titled meta hides, panels stack and stay legible.
- [ ] No horizontal scroll at any viewport 320-1920px.
- [ ] Safe-area inset respected on iOS.

### Anti-gimmick check (from hoatrinh spec QA)

- [ ] If the grid were removed, the site would still feel structured (spacing + panels do the work).
- [ ] If glow on focus were removed, focus would still be visible (border change does the work).
- [ ] Green accent is used intentionally (prompt, focus, left rules), not on every element.
- [ ] The site does not read as a blog with a terminal header.

## Out of scope

Deferred and NOT part of this refactor:

- Adding new commands or new block kinds.
- Token value changes (palette, typography scale, spacing scale).
- Routing changes or new pages.
- Onboarding flow, hint persistence, or local-storage state.
- Command palette / pop-over UIs.
- Any motion beyond entry fade-in and prompt error flash.
- ASCII art / figlet banners.
- Any move toward the brighter mono-source palette.
