---
name: hoatrinh-terminal
description: Terminal-native portfolio design system derived from mono-inspired principles, adapted for a modern personal developer portfolio.
license: MIT
metadata:
  author: Hoa Trinh
  derived_from: typeui mono design skill
---

# hoatrinh.dev Terminal Design System

## Context and Goals

This design system defines the visual and interaction language for `hoatrinh.dev`, a terminal-native personal portfolio.

The goal is to create a UI that feels:
- technical
- minimal
- fast
- intentional
- keyboard-first
- terminal-inspired without becoming a gimmick

This is not a startup landing page, not a dashboard, and not a fake hacker simulation.

The design system must help the product feel like a real developer portfolio expressed through command-driven interaction.

---

## Design Intent

The interface must present a strong monospace-led identity, restrained contrast, compact spacing, explicit interaction states, and system-like structure while preserving readability, accessibility, and calm visual rhythm.

---

## Product-Specific Principles

- Terminal interaction is the center of the experience
- Visual styling must support command interaction, not overpower it
- Monospace styling should feel modern and readable, not novelty-heavy
- Every decorative element must justify itself through clarity, structure, or tone
- The system must feel more like a developer environment than a marketing page
- Accessibility and readability must take priority over visual intensity
- Rich content blocks must still belong to the same terminal-native visual language

---

## Design Tokens and Foundations

### Typography

#### Font roles

- **Primary / UI / display:** `Space Mono`, monospace fallback stack
- **Code / prompt / inline command:** `JetBrains Mono`, monospace fallback stack

#### Typography rules

- Headings must use a monospace-led display treatment
- Body text must remain readable at comfortable line length
- Large display text may be expressive, but must not reduce clarity
- Inline commands must be visually distinct from surrounding prose
- Do not mix unrelated font personalities

#### Recommended type behavior

- Use heavier weights for command headers and high-emphasis labels
- Use regular or medium weight for body text
- Use tighter visual rhythm for labels, prompts, and metadata
- Maintain clear hierarchy through size and spacing, not only color

---

### Color Philosophy

The palette should remain dark, restrained, and high-contrast.

The interface should feel terminal-native, but not neon-saturated by default.

#### Core token roles

- `bg.base` — primary page background
- `bg.elevated` — panels and grouped surfaces
- `bg.subtle` — subtle separators or inactive rows
- `border.default` — standard panel and input borders
- `border.strong` — emphasized states
- `text.primary` — default readable text
- `text.muted` — supporting labels and metadata
- `text.dim` — low-emphasis system text
- `accent.primary` — primary terminal accent
- `accent.secondary` — optional supporting accent, use sparingly
- `state.success`
- `state.warning`
- `state.error`
- `state.info`
- `focus.ring`

#### Color behavior rules

- `accent.primary` must be used intentionally, not on every element
- Large surfaces should not glow aggressively
- Text must preserve strong contrast against background
- Muted text must still meet readability expectations
- Error, warning, and success colors must be reserved for actual state communication
- Avoid rainbow-accented UI unless the content explicitly requires status differentiation

#### Aesthetic recommendation

Base visual mood:
- near-black background
- dark green-tinted or neutral elevated surfaces
- soft monochrome text
- controlled green accent
- optional very limited blue accent for secondary emphasis

---

### Spacing

The system uses compact density, but never cramped density.

#### Spacing rules

- Commands, labels, panels, and metadata should feel tight and efficient
- Reading blocks must still have enough breathing room for comprehension
- Large sections should separate clearly through spacing, not decorative separators alone
- Related items must be visually grouped through consistent vertical rhythm
- Avoid both oversized landing-page spacing and overcompressed terminal clutter

---

### Borders and Surfaces

- Panels must use thin, crisp borders
- Border radius should remain small to moderate
- Surfaces should layer through contrast and border treatment, not heavy shadows
- Shadows should be minimal or absent
- Glow should be restrained and used mainly on focus, active, or highlighted interactive states
- Decorative framing must not overpower content

---

### Background Treatment

- Subtle grid or system-like texture may be used
- Background textures must remain low-noise and low-contrast
- If a grid is used, it must not interfere with text readability
- Avoid strong CRT simulation, scanline overload, or visual flicker effects

---

## Core Layout Rules

### Page Structure

The site must not be structured like a generic marketing landing page.

The layout should prioritize:
- prompt visibility
- output readability
- command flow
- progressive content reveal

### Layout expectations

- The prompt area must feel central and immediately usable
- Content should appear as structured output regions rather than traditional content sections first
- Rich content blocks may appear inline with terminal output
- The page should feel like a living interface, not a stack of promotional sections

### Responsive behavior

- On mobile, the prompt and output must remain legible and easy to interact with
- Dense desktop layouts must simplify cleanly on narrow screens
- Panels must stack naturally without losing hierarchy
- Input fields and tap targets must remain comfortable on touch devices

---

## Component-Level Rules

### 1. Prompt / Command Input

#### Intent
The prompt is the primary interaction object and must feel trustworthy, visible, and responsive.

#### Anatomy
- prompt label / path indicator
- input field
- caret / cursor treatment
- optional inline suggestion or hint
- optional command status feedback

#### Rules
- The prompt must be visually prominent without dominating the screen
- The input must always look interactive
- Focus-visible state must be unmistakable
- Placeholder or hint text must never compete with actual input text
- Prompt labels should feel system-like and concise
- The input must remain readable at all times, even in empty state

#### States
- default
- hover
- focus-visible
- active typing
- disabled
- error

#### Interaction
- Keyboard interaction must be first-class
- Pointer interaction must clearly place focus
- On mobile, tapping anywhere appropriate should help users engage with the prompt quickly

---

### 2. Command Output Blocks

#### Intent
Output blocks represent the primary content surface of the site.

#### Rules
- Output must feel sequential and structured
- Commands and responses must be visually related
- Output blocks may mix plain text and richer subcomponents
- Each output block must remain easy to scan
- Output history must not visually collapse into noise

#### Variants
- plain text output
- system message
- error message
- project result block
- profile summary block
- timeline block
- AI answer block *(V2)*

#### States
- default
- loading
- error
- highlighted / referenced

---

### 3. Panels / Cards

#### Intent
Cards are supporting structures for content that benefits from stronger hierarchy, not a replacement for terminal output.

#### Rules
- Use cards for projects, grouped links, experience summaries, writing previews, and support panels
- Cards must feel like terminal-native modules, not SaaS dashboard widgets
- Titles should be concise and system-like where appropriate
- Metadata should be easy to scan
- Avoid excessive badge noise
- Avoid decorative card chrome that competes with content

#### Responsive behavior
- Cards must stack naturally on mobile
- Dense metadata should wrap cleanly
- Long titles and descriptions must not break layout

---

### 4. Buttons and Action Triggers

#### Rules
- Buttons should feel like command actions, not glossy marketing CTAs
- Primary actions should use restrained accent emphasis
- Secondary actions should rely more on border and text treatment
- Hover and active states must be explicit
- Disabled buttons must be visibly inactive but still legible
- Button labels must be concise and action-oriented

#### Avoid
- oversized rounded CTA buttons
- excessive glow
- generic startup copy such as “Get Started Now”

---

### 5. Labels, Metadata, and System Text

#### Rules
- Labels may use uppercase or system-style formatting sparingly
- Metadata must remain readable and not become decorative noise
- Use muted text tokens for secondary information
- Avoid overusing bracketed or machine-like syntax in every component
- System flavor should support tone, not parody it

---

### 6. Navigation and Discoverability

#### Rules
- The primary discovery model is command input
- Secondary navigation aids may exist, but must remain visually subordinate
- Helpful suggested commands may be clickable
- Navigation must not revert the experience into a standard webpage menu-first product
- If a secondary menu exists, it must feel like support for the terminal, not competition with it

---

### 7. Empty, Loading, and Error States

#### Rules
- Empty states must guide the user toward useful next actions
- Loading states must feel lightweight and intentional
- Error states must be clear, short, and recoverable
- Errors must suggest the next valid command or recovery path where possible
- Avoid vague system messages that sound dramatic but say nothing useful

---

### 8. Onboarding

#### Rules
- The first-run experience must reduce intimidation
- Users should immediately know at least one useful command
- Onboarding hints must be short and dismissible or naturally ignorable
- Do not gate the experience behind a long intro animation
- Do not assume users know terminal conventions

---

## Accessibility Requirements and Testable Acceptance Criteria

### Global requirements

- All interactive elements must be keyboard reachable
- Focus-visible indicators must be consistently visible
- Color contrast must meet WCAG 2.2 AA for text and critical UI states
- Semantic HTML must be preferred before adding ARIA
- Labels for inputs and actions must be screen-reader understandable
- Hit targets must be usable on touch devices
- Motion reduction preferences must be respected

### Testable acceptance criteria

- A keyboard-only user can reach the prompt, submit commands, and review output
- Focus location is always visible during navigation
- Muted text remains readable and does not disappear into the background
- Invalid commands return readable feedback
- Mobile users can tap into the prompt without precision frustration
- No key functionality depends on hover alone
- Reduced-motion mode removes non-essential animated behavior

---

## Content and Tone Standards

### Writing style

All UI writing should be:
- concise
- confident
- clear
- calm
- slightly playful only where appropriate

### Examples of preferred tone

Good:
- `Command not found. Try "help" to view available commands.`
- `3 projects found.`
- `AI is currently unavailable. Try again later or use deterministic commands.`

Avoid:
- `Oops! Something weird happened in the matrix.`
- `Initializing hyper-intelligent portfolio engine...`
- `Welcome, operator. Prepare for immersion.`

### Content rules

- Commands and labels must be explicit
- Error messages must help recovery
- Portfolio descriptions must sound human, not salesy
- System flavor should stay subtle
- Avoid startup jargon, fake mystery, and overdramatic hacker phrasing

---

## Anti-Patterns and Prohibited Implementations

Do not implement the site as:
- a startup landing page with terminal skin
- a fake shell clone with poor usability
- a neon-saturated hacker parody
- a dashboard-style interface full of unnecessary widgets
- a marketing page where command input is a decorative hero element only
- a portfolio that depends entirely on AI chat to explain core content

Do not:
- overuse glow on text and borders
- apply grid textures too strongly
- rely on decorative separators instead of spacing
- fill the page with boxed panels without hierarchy
- turn every label into uppercase machine syntax
- make text too dim in pursuit of aesthetic mood
- hide important content behind obscure commands
- prioritize novelty over legibility

---

## Migration Notes for Any Borrowed Mono-Like UI

If reusing mono-inspired UI patterns or existing visual references:

- Keep the typography direction, but reduce visual aggression where needed
- Keep the panel language, but remove startup or pricing-page assumptions
- Keep the dark system feel, but adapt it to portfolio content rather than product marketing
- Reduce unnecessary decorative chrome
- Replace CTA-first hierarchy with prompt-first hierarchy
- Convert section cards into command-result modules
- Treat green accent as a tool for emphasis, not a blanket color for everything

---

## QA Checklist

Use this checklist during design review and implementation review.

### Product alignment
- Does the interface still feel like a terminal-native portfolio?
- Is the prompt clearly central to the experience?
- Does the UI avoid feeling like a generic landing page?

### Visual consistency
- Are typography, spacing, border treatment, and accent usage consistent?
- Is the accent color used intentionally rather than everywhere?
- Are cards and panels visually subordinate to content rather than dominating it?

### Interaction quality
- Are prompt states clear in all situations?
- Are command outputs easy to scan?
- Are error and empty states recoverable?
- Is mobile interaction practical?

### Accessibility
- Can the site be used keyboard-first?
- Are focus-visible states clear?
- Is text contrast sufficient?
- Are touch targets usable?
- Is reduced motion respected?

### Tone and content
- Does the writing sound like a real developer rather than a product landing page?
- Are system-style labels used with restraint?
- Are error messages clear and useful?

### Anti-gimmick check
- If glow, grid, or matrix styling were reduced by 30%, would the site still feel strong?
- If the visual effects disappeared, would the product structure still work?
- Does the interface still prioritize clarity over aesthetic theater?