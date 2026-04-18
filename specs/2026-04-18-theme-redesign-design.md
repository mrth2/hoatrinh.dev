---
title: Theme Redesign (D+ amber + muted green + hover neon)
date: 2026-04-18
status: approved
related:
  - specs/hoatrinh_terminal_design_system.md
  - specs/2026-04-17-hoatrinh-portfolio-design.md
  - specs/2026-04-18-terminal-structural-refactor-design.md
  - specs/theme-demos/color-palettes.html
---

# Theme Redesign (D+)

## Context

The current theme is a minimalist phosphor-green terminal: near-black background, `#6fe0a1` mint accent, dot grid, Space Mono + JetBrains Mono. The structural refactor (see related) established the prompt-first, output-panel vocabulary. What the current build still lacks is personality and presence: the landing page reads as empty space with a hero at the top and a prompt at the bottom, the palette is tasteful but generic for a dev portfolio, and the motd carries no sense of arrival.

This redesign keeps the terminal architecture intact and shifts the aesthetic to amber-primary (VT220 warmth) with a muted phosphor green in a supporting semantic role and a single hover-only neon magenta accent. It also fills the landing page with a boot sequence on first visit that condenses to a compact motd on subsequent navigation, and rotates content across four voices (warm, dry, factual, poetic) so the site feels different on different visits without committing to a single personality.

Positioning on the user's 60/40 "taste / bold" axis:

- 60% taste: warm amber + restrained layout + scanline at <2% alpha
- 40% bold: hover neon magenta + boot sequence presence + rotating content

## Approved decisions

Captured from brainstorming on 2026-04-18:

1. **Palette direction = D+.** Amber primary, muted green secondary (structural/success only), neon magenta as hover-only accent. Warm-black background. See Palette section.
2. **Scope = holistic theme refresh, not a pure palette swap.** Layout, typography, motd behavior, SessionBar tuning all in scope. Kept in service of the D+ feel, not a ground-up redesign.
3. **Landing page = boot sequence on first load, compact motd thereafter.** Gated by `sessionStorage`. Skippable by any keystroke or click. Respects `prefers-reduced-motion`.
4. **Motd voice = mix.** Rotating pull from four tagged content pools (`greeting`, `tip`, `fact`, `poetic`). One item from each category per boot.
5. **One spec, three sequential PRs.** Phase A = palette. Phase B = layout and effects. Phase C = motd and SessionBar behavior. Each phase is shippable alone.
6. **No new routes, no new commands, no component API changes.** Existing engine and content pipeline preserved.

## Palette

Replaces values in `apps/web/src/styles/tokens.css`. Token names unchanged; components do not need to rename anything.

```css
/* surfaces - warm black */
--bg-base:        #0a0806;
--bg-elevated:    #14100a;
--bg-subtle:      #1a140c;

/* borders - warm brown-black */
--border-default: #2a1f10;
--border-strong:  #3a2f1e;

/* text - warm cream */
--text-primary:   #ecdfc2;
--text-muted:     #a08a64;
--text-dim:       #5a4a30;   /* decorative only, never body */

/* accents */
--accent-primary:   #ffb347;   /* amber, the face of the brand */
--accent-secondary: #7dc69a;   /* muted green, semantic success only */
--accent-hover:     #ff4fd8;   /* NEW, interactive-only */

/* state */
--state-success: var(--accent-secondary);
--state-warning: #f0b46a;
--state-error:   #ff8a5c;      /* warm coral replaces cool red */
--state-info:    var(--accent-primary);

/* focus ring unchanged semantically; inherits amber */
--focus-ring-color: var(--accent-primary);

/* grid dot - warmer, slightly higher alpha */
--grid-dot: rgba(110, 80, 30, 0.25);
```

Prior `--accent-secondary` (`#7ab8ff` blue) had no load-bearing use in current components; repurposing is safe. `--accent-hover` is a new token.

## Role rules

The palette is applied by semantic role, not by component. Global rules:

| Role | Token | Where it appears |
|---|---|---|
| Brand identity | `--accent-primary` (amber) | prompt `ps`, H1 emphasis word, help-line keywords, section title pills/glyphs, chip-active, link at rest, focus ring, `::selection` |
| Liveness / success | `--accent-secondary` (muted green) | blinking cursor (with small box-shadow glow), SessionBar status dot when last command was `ok`, `ok` badges, successful acknowledgements |
| Interactive reach | `--accent-hover` (neon magenta) | link `:hover` (color + underline + text-shadow glow), button hover in any future focus-command UI |
| Error | `--state-error` (warm coral) | left 3px rule on prompt when last command errored, `command not found` messages, SessionBar status dot in error state |

**Global invariant:** `--accent-hover` never appears at rest. It fires only on pointer/keyboard focus. This keeps the single cyberpunk moment within reach without letting it dominate.

## Typography, layout, effects

Fonts unchanged: `Space Mono` (UI) and `JetBrains Mono` (code/prompt). Weights and sizes as currently tokenized.

### Typography

- Hero H1 moves from `28px / 700` to `--text-display` (`36px / 700`). Token already exists.
- H1 gets a single amber glow: `text-shadow: 0 0 14px rgba(255, 179, 71, 0.22)`. No glow on body text.
- Section titles keep uppercase 11px `letter-spacing: 0.14em`. Add an amber `▸` prefix glyph with `margin-right: 6px`. One glyph, consistent across every section title.

### Layout

- Content column max-width `720px`, centered. Currently unbounded. Applied on the terminal output container, not on the prompt (prompt remains full-width sticky).
- Hero top padding reduced from `64px` to `40px`. Hero sits closer to the topbar so first-paint feels less empty.
- Output rows gain a 1px amber left rule at 18% alpha, running vertically alongside the output stream. This creates the "terminal log" feel without heavy framing.

### Effects

- **Scanline overlay.** Fixed `::before` on `body`, `background: repeating-linear-gradient(to bottom, rgba(255,255,255,0.015) 0 1px, transparent 1px 3px)`. Layered below content with `pointer-events: none`. Disabled under `prefers-reduced-motion` and `prefers-contrast: more`.
- **Cursor glow.** Blinking block cursor gets `box-shadow: 0 0 8px rgba(125, 198, 154, 0.6)`. Subtle.
- **No glitch, no chromatic aberration, no katakana, no heavy CRT.** Out of scope.

## Motd and boot behavior

### State machine

Single `sessionStorage` key `hoa:booted`.

- Key absent on mount -> render boot sequence, then set key to `"1"`.
- Key present on mount -> render compact motd block instantly, no animation.

Incognito or a new browser tab = boot again. Reloads within a tab = compact.

### Boot sequence (first load per tab)

Streams four lines, one character at a time, with a jittered 10 to 30ms per-character delay. Total runtime ~2 to 3 seconds. Lines:

```
initializing session...
{rotating-greeting}
last login: {relative-time} from {ua-hash}
{rotating-tip-or-fact}
```

After the last line completes, the compact motd block fades in and the prompt becomes active.

**Skip.** Any keystroke or click before the last line completes sets `hoa:booted="1"` and jumps to the final rendered state instantly.

**Reduced motion.** If `(prefers-reduced-motion: reduce)` matches, the final state renders on mount with no streaming. `hoa:booted` is set the same way.

**`{ua-hash}`** is a short hash of `navigator.userAgent` computed client-side, used purely for flavor (looks like a connection origin). Not a tracker.

### Compact motd block (always visible after boot)

One row, amber-dim tone:

```
hoa@trinh.dev · ready  ●   {rotating-subline}
```

The `●` is the green status dot (drives off the last-command state, same signal SessionBar uses). The subline rotates on each page load by pulling one random item from any category.

### Content pools (`packages/content/motd` or similar)

TypeScript module exporting four tagged arrays. ~6 to 8 items per category to start, easy to extend. Example seed content:

```ts
export const greetings = [
  'welcome back, traveller.',
  'good to see you.',
  'you made it.',
  'ok. let\'s build.',
];

export const tips = [
  'try `projects` - most of the interesting stuff is there',
  'type `help` for commands',
  'type `about` for the short version',
];

export const facts = [
  'last deploy: {relative} ago',
  '`{latest-commit-subject}`',   // from build-time data
];

export const poetic = [
  'the river does not hurry, yet it arrives.',
  'good code is a letter to the future.',
];
```

`{relative}` and `{latest-commit-subject}` are placeholders resolved at build time by a small `scripts/motd.ts` that writes a generated JSON (or TS module) committed alongside the build output. No client-side git calls.

A picker utility selects one item per category for boot, one random (across categories) for compact. Picker is seeded with a fresh `Math.random()` per call; tests can inject a deterministic seed.

### SessionBar tune (colors shift, behavior unchanged)

- `hoa@trinh.dev` identity: amber
- Date / session id: muted
- New `●` status dot (right-aligned, small): green on last-ok, coral on last-error, amber on pending. Reflects the existing last-command signal from the structural refactor commit.

No new component, no new signal. Pure recolor and adding a small dot element.

## Accessibility

Contrast against new `--bg-base` `#0a0806`. Targets: AA (4.5:1) for normal text, AAA (7:1) for critical UI.

| Pair | Approx ratio | Status |
|---|---|---|
| `--text-primary` `#ecdfc2` on bg | ~13:1 | AAA |
| `--text-muted` `#a08a64` on bg | ~5.2:1 | AA |
| `--text-dim` `#5a4a30` on bg | ~2.1:1 | decorative only |
| `--accent-primary` `#ffb347` on bg | ~11.5:1 | AAA |
| `--accent-secondary` `#7dc69a` on bg | ~9.5:1 | AAA |
| `--state-error` `#ff8a5c` on bg | ~7.3:1 | AAA |
| `--accent-hover` `#ff4fd8` on bg | ~6.5:1 | AA (hover only) |

Exact contrast values are verified during Phase A via a build-time check script (`scripts/check-contrast.ts` or similar). Any drop below target fails the check.

**Preferences honored:**

- `prefers-reduced-motion: reduce`: boot sequence skipped, final state rendered on mount. Cursor blink kept (critical feedback). Scanline overlay disabled.
- `prefers-contrast: more`: scanline and dot grid disabled. `--text-muted` and `--text-dim` brightened (inherit existing rule in `global.css`, update values for warm palette). Hero glow disabled. Focus ring width `3px`.
- Focus ring: amber, 2px solid, 2px offset. Unchanged from existing pattern.
- `::selection`: amber background, `--bg-base` text.

## Testing

- **Visual regression.** Existing e2e screenshot tests expect diffs across every view; goldens are regenerated during the phase PRs. Each phase updates only the views it affects.
- **Unit.**
  - Motd content picker returns one item per tagged category for boot, one random for compact. Deterministic with a seed.
  - Boot state machine transitions: no-key -> boot -> key-set, key-set -> compact-instant, skip-event -> final-state, reduced-motion -> final-state.
- **A11y.** Playwright-axe pass on `/`, `/about`, and the error-prompt state. Contrast check script runs in CI.
- **Manual smoke checklist** (documented in plan):
  - Fresh tab: boot streams
  - Reload same tab: compact renders instantly
  - New tab: boot streams again
  - Incognito: boot streams
  - Keystroke during boot: jumps to compact
  - `prefers-reduced-motion` (via devtools): no animation, compact renders on mount
  - `prefers-contrast: more`: scanline off, dim values legible
  - Link hover: neon magenta appears and disappears cleanly

## Phasing

One spec, three sequential PRs. Each ships alone and leaves the site coherent at each stop.

### Phase A: palette swap (~0.5d)

- Update `apps/web/src/styles/tokens.css` values
- Add `--accent-hover` token
- Update `global.css` `::selection` and `prefers-contrast: more` overrides
- Add `scripts/check-contrast.ts` and wire into `bun run lint` or similar
- Update e2e screenshot goldens
- Zero component-structure changes

### Phase B: layout and effects (~0.5d)

- Hero size to `--text-display` and add amber glow
- Content column max-width 720px
- Hero top padding reduction
- Output row left-rule styling
- Scanline overlay `::before` on `body`
- Cursor glow
- Section title glyph prefix
- Update e2e goldens

### Phase C: motd and SessionBar behavior (~1d)

- Create `packages/content/motd` module with tagged pools and picker
- Create `scripts/motd.ts` to resolve build-time placeholders (`{relative}`, `{latest-commit-subject}`)
- Extend `<Motd>` component with boot/compact state machine driven by `sessionStorage`
- Implement character-streamer with jitter, skip handler, reduced-motion branch
- Add `●` status dot element to SessionBar, wire to existing last-command signal
- Unit + a11y tests
- Update e2e goldens

## Risks and open questions

- **Scanline on high-density displays.** 1px-at-3px stripes can alias on HiDPI. Mitigated by very low alpha (1.5%). If it reads noisy, drop to 1% or remove from the default set.
- **Amber saturation.** `#ffb347` is bright; hours of viewing may feel warm. We can shift to `#f5a53a` (slightly muted) if it's too much after Phase A ships. Tuning, not redesign.
- **Boot sequence timing.** 2-3 seconds is a guess. If it feels long, tighten per-char delay. If short, lengthen the last line (tip) by a few tokens.
- **Content pool seed vs fresh content.** Initial seed is ~6-8 per category (~30 items total). Adding more is trivial; feels fine for a portfolio.
- **`last-deploy`/`latest-commit` at build time.** Requires wiring into the prerender / build scripts. If that bogs Phase C down, ship with static greetings/tips and add dynamic facts as a follow-up.

## Out of scope (explicit)

- New routes, new commands, component API changes
- Logo or favicon changes (favicon was just updated in the a11y pass)
- Content editing for `/about`, `/projects`, `/experience` bodies
- Light-mode variant. Site stays dark-only.
- Any analytics, telemetry, or user preference persistence beyond `sessionStorage` for boot state
- Glitch animation, chromatic aberration, katakana decoration, heavy CRT effects (explicitly rejected during brainstorming in favor of D+)
