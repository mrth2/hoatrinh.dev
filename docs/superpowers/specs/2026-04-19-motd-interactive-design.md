# MOTD: interactive command index + ambient life

Date: 2026-04-19
Status: approved for implementation

## Problem

On first load the home page shows the session bar, a short MOTD, and a large
dead void above the prompt. The page reads as static and gives the visitor
nothing to click. Two complaints:

1. Empty vertical space (~60% of the viewport on desktop).
2. No sense the page is alive until the visitor types.

## Goal

Make the first render feel dense and interactive without betraying the warm
amber terminal aesthetic (no card grid, no dashboard widgets, no neon).

## Non-goals

- Replacing the command-driven interaction model. Typing must keep working.
- Adding new routes or new commands.
- Redesigning the session bar or prompt beyond what is specified here.
- Adding a tail-log ticker (C4), numbered shortcuts, row underline draw, or
  per-row last-updated dates. These were considered and deferred.

## Design

Two layers:

### Layer 1 - Command Index (B1, ls -l rows)

A new block inside the MOTD, replacing the redundant hint line
(`type help to see commands, or try about`). Appears in all three MOTD modes
(compact, boot-static, boot-animated). Disappears with the MOTD once any
command runs, same as today (`state.entries.length === 0` gate in
`TerminalPage.tsx:102`).

Layout: three-column grid per row, monospace, left-aligned.

```
── commands ────────────────────────────────────────────────── 6 total
about        who i am
projects     things i have built                         4
experience   past roles                                  3
skills       tech and tools                             12
contact      ways to reach me
help         list commands
```

- Column 1 (`name`, amber `--accent-primary`, ~12ch): command name.
- Column 2 (`summary`, muted `--text-muted`, flex): the existing
  `CommandSpec.summary` string. No rewriting.
- Column 3 (`meta`, dim `--text-dim`, auto): count where meaningful,
  blank otherwise.
  - `projects` -> `getProjects().length`
  - `experience` -> `getExperience().length`
  - `skills` -> sum of `getSkills()[i].items.length`
  - `about`, `contact`, `help` -> empty

Row source: `registry.specs`, filtered to drop `clear` (utility, not a
content route). Order matches the current `specs` array so `help` is last.

Interactions:
- Each row is a `<button type="button">` firing `onSuggestion(name)` - reuses
  the existing `onSuggestion` prop already threaded from `TerminalPage` through
  `Motd` and used by the `cmd` buttons in the hint. Clicking a row runs the
  command and navigates (same as typing the name).
- Hover / focus-visible: row gets `background: var(--bg-subtle)`,
  `box-shadow: inset 2px 0 0 var(--accent-primary)`, name switches to
  `--accent-hover` (magenta) with the allowed 0.4-opacity text glow.
- Keyboard: rows are tab-focusable. Enter and Space run the command (default
  button behavior). Shift+Tab from the first row reaches the skip link;
  Tab from the last row reaches the prompt input.

### Layer 2 - Ambient life

Three elements, all CSS-only or near-zero JS.

**C1. Live clock in the session bar.**
Session bar becomes `hi@hoatrinh.dev · session YYYY-MM-DD HH:MM ●`. A new
`<time class={styles.sessionTime}>` span is appended after the existing date.
The initial value is computed server-side from `new Date()` at the same
moment used for `SESSION_DATE`. On the client, `onMount` starts a
`setInterval(..., 30_000)` that updates a signal every 30 s, guaranteeing
minute-level accuracy. No JS runs on SSR. Hydration is safe: the server's
rendered HH:MM is usually within the same minute as the client's first render,
and even a drift across a minute boundary is a visible content change, not a
Solid hydration error (the text node updates in place).

**C2. Heartbeat on status dots.**
Both the session-bar status dot (`TerminalPage.module.css` `.sessionStatus`)
and the MOTD ready dot (`Motd.module.css` `.dot`) pulse opacity `1 -> 0.55 -> 1`
over 4 s, ease-in-out, infinite. The animation applies only to the "ok" state
on the session bar; "pending" and "error" keep their existing styling so the
error state still reads as distinct. `prefers-reduced-motion: reduce`
disables both.

**C5. First-paint reveal.**
The compact MOTD fades and slides 4px up over 300ms on mount. Compact is the
initial SSR state for every visitor; on fresh boot-eligible tabs `onMount`
swaps mode to `boot-animated` immediately, so the reveal is the entrance for
return visitors (hasBooted = true) and a near-imperceptible flash for fresh
visitors before the boot sequence takes over. Boot-static and boot-animated
paths are unchanged - they already own their entrance. Implemented by
animating the existing `[data-motd-compact]` root:

```css
@keyframes motd-reveal {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: none; }
}
[data-motd-compact] { animation: motd-reveal 300ms ease-out; }
@media (prefers-reduced-motion: reduce) {
  [data-motd-compact] { animation: none; }
}
```

## Files touched

| File | Change |
|------|--------|
| `apps/web/src/components/CommandIndex/CommandIndex.tsx` | NEW - renders the ls -style rows |
| `apps/web/src/components/CommandIndex/CommandIndex.module.css` | NEW - row styles, grid columns, hover states |
| `apps/web/src/components/CommandIndex/CommandIndex.test.tsx` | NEW - unit tests |
| `apps/web/src/components/Motd/Motd.tsx` | EDIT - insert `<CommandIndex>`, remove hint line from all three paths |
| `apps/web/src/components/Motd/Motd.module.css` | EDIT - heartbeat on `.dot`, first-paint reveal on `[data-motd-compact]`, remove unused `.hint`/`.cmd` rules if no other caller |
| `apps/web/src/routes/TerminalPage.tsx` | EDIT - live clock signal + interval, render `{currentTime()}` in session bar |
| `apps/web/src/routes/TerminalPage.module.css` | EDIT - `.sessionTime` span style, heartbeat on `.sessionStatus[data-state="ok"]` |
| `apps/web/src/components/Motd/Motd.test.tsx` (if exists) | EDIT - assert hint removed, index present |

Biome will format. No token changes required - every color maps to an
existing CSS custom property in `apps/web/src/styles/tokens.css`.

## Data flow

```
Motd.tsx (existing)
   props: { onSuggestion }
   renders CompactMotd | BootStatic | BootAnimated
      each embeds <CommandIndex onSuggestion={props.onSuggestion} />

CommandIndex.tsx (new)
   props: { onSuggestion: (cmd: string) => void }
   const rows = buildRows()  // pure, module-level
   renders <section> <header/> <button row/> x N </section>

buildRows() (module-level pure function)
   pulls:
      - specs from '@/terminal/commands' (already imported elsewhere)
      - counts:
         projects   = getProjects().length
         experience = getExperience().length
         skills     = getSkills().reduce((n, g) => n + g.items.length, 0)
   filters out 'clear'
   returns Array<{ name, summary, count?: number }>
```

No new state. No new async. No MOTD lifecycle changes.

## SSR / hydration

- CommandIndex is fully deterministic - same HTML on server and client.
- Live clock initial value is computed from `new Date()` on both server and
  client. The minute window is almost always aligned; Solid tolerates text
  drift on hydration for time-based content (not a structural mismatch).
- The `setInterval` only runs after `onMount`, which only runs client-side.
- Heartbeat and reveal animations are CSS-only, no hydration implications.

## Accessibility

- Rows are `<button>` elements inside a `<nav aria-label="Command index">`.
- Visible focus ring uses the existing `--accent-primary` outline per design
  system.
- `prefers-reduced-motion: reduce` disables heartbeat and reveal. The live
  clock still ticks (content update, not motion).
- The existing skip link (`<a class="skip-link" href="#terminal-input">`)
  still reaches the prompt ahead of the rows in tab order; no change.

## Testing

Unit (vitest + jsdom):
- CommandIndex renders one row per spec, excluding `clear`.
- Counts appear for projects / experience / skills; other rows have empty
  meta cells.
- Clicking a row calls `onSuggestion` with the command name.
- Pressing Enter on a focused row calls `onSuggestion` (native button).
- Motd no longer renders the hint line in any mode.
- Motd renders CommandIndex in all three modes (compact, boot-static,
  boot-animated after `done()`).

E2E (Playwright smoke):
- Home loads, command index visible with expected 6 rows.
- Clicking the `about` row navigates to `/about` and renders the about block.
- Existing boot-sequence smoke tests remain green (CommandIndex appears at
  the end of the animated boot).

No snapshot tests added. If existing snapshots cover the hint line they must
be updated.

## Rollout

Single branch, single PR. No flags. Visual change is covered by e2e smoke.
If anything looks off in production (unlikely - purely additive rendering),
revert is a single commit.

## Deferred (explicitly out of scope)

- Numbered shortcuts (`[1] about`) - separate follow-up if wanted.
- Hover underline draw left-to-right - micro-polish.
- Idle tail-log - rejected as fake theatre.
- Per-row last-updated timestamps - rejected for stale-data risk and
  requires frontmatter.
- Rewriting the session bar layout for mobile - existing wrapping is fine.
