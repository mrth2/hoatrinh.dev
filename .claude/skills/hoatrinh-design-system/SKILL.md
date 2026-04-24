---
name: hoatrinh-design-system
description: Use when adding, modifying, or reviewing any UI component, style, animation, or visual token in the hoatrinh.dev project. Prevents drift toward Cyberpunk neon-green or cold Terminal-green aesthetics.
---

# hoatrinh.dev Design System - Warm Amber Terminal

## Theme Identity

**"Cozy Hacker"** - a vintage amber CRT terminal. Warm, personal, and readable. Not a cold Matrix/hacker room, not a Blade Runner neon city.

Think: Kaypro II amber monitor at 2am. Dangerous but inviting.

The theme sits between two reference aesthetics but is distinct from both:

| Trait | Cyberpunk | Terminal CLI | **hoatrinh.dev** |
|-------|-----------|--------------|------------------|
| Background warmth | Cold (#0a0a0f) | Neutral (#0a0a0a) | **Warm (#0a0806)** |
| Primary accent | Electric green | Matrix green | **Amber (#ffb347)** |
| Effect intensity | Aggressive neon glows | Moderate | **Restrained / barely-there** |
| Radius | 0px chamfer | 0px sharp | **2-6px soft** |
| Personality | Dangerous megacity | Shell hacker | **Personal, cozy, alive** |

---

## Design Tokens (source of truth: `apps/web/src/styles/tokens.css`)

### Surfaces
```
--bg-base:     #0a0806   warm void (never pure black)
--bg-elevated: #14100a   prompt bar, popups
--bg-subtle:   #1a140c   inline code, secondary cards
```

### Text
```
--text-primary: #ecdfc2  warm cream (body, headings)
--text-muted:   #a08a64  secondary labels, meta
--text-dim:     #5a4a30  decoration/meta only - NEVER body text
```

### Borders
```
--border-default: #2a1f10  standard dividers
--border-strong:  #3a2f1e  hover / focus-adjacent borders
```

### Accent Tricolor System (strict roles - do NOT reassign)
```
--accent-primary:   #ffb347   amber   - brand face, interactive elements, focus rings, primary CTAs
--accent-secondary: #7dc69a   muted green - success / "system alive" signals ONLY (caret, OK states)
--accent-hover:     #ff4fd8   magenta - hover state ONLY, never default state, never decorative
```

### State
```
--state-success: var(--accent-secondary)   #7dc69a
--state-warning: #f0b46a
--state-error:   #ff8a5c   warm coral (not pure red)
--state-info:    var(--accent-primary)
```

### Typography
```
--font-ui:   "Space Mono", ui-monospace, ...    UI chrome, labels, session bar
--font-code: "JetBrains Mono", ui-monospace, ... code blocks, prompt input, tech tags
```
No new font families. These two only.

### Type Scale
```
--text-xs: 12px   --text-sm: 13px   --text-base: 14px  --text-md: 16px
--text-lg: 18px   --text-xl: 22px   --text-2xl: 28px   --text-display: 36px
```

### Spacing (8px base)
```
--space-1: 4px   --space-2: 8px   --space-3: 12px   --space-4: 16px
--space-5: 20px  --space-6: 24px  --space-8: 32px   --space-10: 40px
```

### Radius
```
--radius-sm: 2px   --radius-md: 4px   --radius-lg: 6px
```
Never use 0px sharp corners. Never use clip-path chamfers.

---

## Effect Rules

### Scanlines (global, `body::before`)
```css
background: repeating-linear-gradient(
  to bottom,
  rgba(255, 255, 255, 0.015) 0 1px,   /* MAX 0.02 opacity */
  transparent 1px 3px
);
```
Faint enough to be subliminal. The user should not consciously notice them.

### Text glow - allowed uses
```css
/* Name/hero only */
text-shadow: 0 0 14px rgba(255, 179, 71, 0.22);

/* Hover magenta glow (anchors, cmd buttons) */
text-shadow: 0 0 10px rgba(255, 79, 216, 0.4);
```
Max shadow opacity: **0.35**. No stacked multi-layer glow effects. No box-shadow neon.

### Caret / block cursor
```css
background: var(--accent-secondary);   /* green, not amber */
box-shadow: 0 0 8px rgba(125, 198, 154, 0.6);
animation: blink 1s steps(2) infinite;
```
The only element that uses the muted-green for a visual effect.

### Dot grid background (`body`)
```css
background-image: radial-gradient(var(--grid-dot) 1px, transparent 1px);
background-size: 24px 24px;
/* --grid-dot: rgba(110, 80, 30, 0.25) */
```
Warm dots, not green circuit traces.

### No-go effects
- No `clip-path` chamfered corners
- No `box-shadow` neon glows (layered or stacked)
- No chromatic aberration (RGB text-shadow splits)
- No glitch keyframe animations on content
- No scanline moving animations
- No circuit SVG backgrounds

---

## Component Patterns

### New CSS module structure
```css
/* Match existing: colocated .module.css, tokens only, no hardcoded hex */
.wrapper {
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  font-family: var(--font-code);
  color: var(--text-primary);
}

.label {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.highlight {
  color: var(--accent-primary);  /* amber for brand/interactive */
}

.wrapper:hover {
  border-color: var(--border-strong);
}
```

### Interactive states
```css
/* Focus */
outline: 2px solid var(--accent-primary);
outline-offset: 2px;

/* Hover text link */
color: var(--accent-hover);  /* magenta ONLY on hover */
text-shadow: 0 0 10px rgba(255, 79, 216, 0.4);

/* Left-edge accent (prompt bar pattern) */
box-shadow: inset 2px 0 0 var(--accent-primary);
```

### Terminal entry blocks
Each command result is a block under `components/blocks/`. Pattern:
- Container has no explicit background (inherits `--bg-base`)
- Content uses `--font-code` for technical values, `--font-ui` for prose labels
- Tech tags: `border: 1px solid var(--border-default)`, `border-radius: var(--radius-sm)`, `color: var(--text-muted)`
- Links: amber default, magenta on hover (see `global.css`)

---

## Accent Color Quick Reference

| Situation | Token | Color |
|-----------|-------|-------|
| Interactive link default | `--accent-primary` | amber |
| Button, CTA, focus ring | `--accent-primary` | amber |
| Link hover / cmd hover | `--accent-hover` | magenta |
| Blinking caret | `--accent-secondary` | muted green |
| Success / OK state | `--accent-secondary` | muted green |
| Error state | `--state-error` | warm coral |
| Warning | `--state-warning` | warm amber |
| Session bar "." dot | `--accent-secondary` | muted green |

---

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Adding `box-shadow: 0 0 10px #ffb347` neon glow | Use `text-shadow` at max 0.25 opacity instead |
| Using `color: #00ff88` or any Matrix green | Use `--accent-secondary` (#7dc69a) - intentionally muted |
| Using `border-radius: 0` for "terminal feel" | Use `--radius-sm` (2px) - the theme is soft not sharp |
| Hardcoding `#ffb347` directly in CSS | Always use `var(--accent-primary)` |
| Making magenta the default color | `--accent-hover` is ONLY for `:hover` states |
| Adding Orbitron or VT323 fonts | Space Mono + JetBrains Mono only |
| Bold scanline or moving scanline animation | Keep scanlines subliminal at ≤0.02 opacity, static |
| Adding `clip-path` polygon cuts on cards | Use `--radius-sm/md/lg` |

---

## Adding a New Command/Feature Checklist

1. CSS module colocated with component (`ComponentName.module.css`)
2. All colors via CSS custom properties - no hex literals in component CSS
3. Fonts: `var(--font-ui)` for prose, `var(--font-code)` for technical text
4. Interactive elements: amber default, magenta hover, green for success signals only
5. Hover transitions: `transition: color 120ms ease-out` or `border-color 120ms ease-out` - nothing longer than 200ms
6. Animations: only if meaningful (e.g., caret blink, prompt-error-flash). Respect `prefers-reduced-motion`.
7. No new global CSS - extend tokens or add to the component module

## File Locations

| File | Purpose |
|------|---------|
| `apps/web/src/styles/tokens.css` | ALL design tokens - edit here for global changes |
| `apps/web/src/styles/global.css` | Body baseline, scanlines, link rules, focus styles |
| `apps/web/src/styles/fonts.css` | Font imports only |
| `apps/web/src/styles/reset.css` | Box model reset |
| `apps/web/src/components/blocks/` | One component per command output type |
| `apps/web/src/components/Prompt/` | Input bar at bottom |
| `apps/web/src/routes/TerminalPage.module.css` | Session bar, page layout |
