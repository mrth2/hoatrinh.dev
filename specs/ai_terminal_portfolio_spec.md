# hoatrinh.dev — AI Terminal Portfolio Spec

## Overview

`hoatrinh.dev` is a personal portfolio rebuilt as a terminal-native interactive website.

Instead of conventional navigation, visitors explore content by typing commands into a prompt-driven interface. The site should feel like a hybrid between a developer tool, a portfolio, and a lightweight conversational system.

This is not a fake shell simulation. It is a focused, modern portfolio that uses terminal interaction as its primary experience model.

The site must communicate:
- technical identity
- clarity of thinking
- strong interaction design
- personal style without gimmick overload

---

## Product Goals

- Build a distinct portfolio experience centered around command-based interaction
- Present projects, background, experience, skills, and contact information in a memorable format
- Keep the experience usable for both technical and non-technical visitors
- Make the site feel fast, lightweight, and intentional
- Support optional AI-assisted exploration without making AI a hard dependency
- Keep content maintainable through structured local sources

---

## Non-Goals

- Simulating a full operating system terminal
- Reproducing shell behavior beyond what is useful for the portfolio
- Building a general-purpose chatbot
- Making AI the only path to access portfolio content
- Adding visual effects that reduce readability or performance
- Turning the site into a startup landing page with terminal styling

---

## Core Experience

When a visitor lands on the site, they should immediately encounter a terminal-style interface with a visible prompt and a short onboarding hint.

The user experience should allow visitors to:
- type commands
- navigate command history
- receive structured output
- open richer UI blocks when content benefits from stronger visual formatting
- optionally ask natural-language questions in a later version

The site should feel:
- responsive
- keyboard-first
- minimal
- readable
- technical but approachable

Terminal interaction is the primary experience, but usability must always win over novelty.

---

## Information Architecture

The portfolio should expose the following content areas:

- About
- Projects
- Experience
- Skills
- Contact
- Writing / Blog *(V2)*
- AI Q&A *(V2 or optional enhancement)*

Each content area must be accessible through deterministic commands and not depend on AI.

---

## Content Model

All portfolio content must come from structured local sources, not from hardcoded UI copy scattered across components.

Suggested content domains:
- profile
- projects
- experience
- skills
- links/contact
- writing entries
- AI grounding context / fallback responses

The structured content source is the canonical source of truth.

AI, when enabled, must be grounded in this source and must not invent achievements, roles, or project details.

---

## Interaction Model

The site is centered around a command prompt.

### Core command examples

- `help`
- `about`
- `projects`
- `project <name>`
- `experience`
- `skills`
- `contact`
- `clear`

### V2 command examples

- `blog`
- `post <slug>`
- `ask <question>`
- `theme`
- optional aliases such as `whoami`, `work`, `stack`, `links`

### Command behavior rules

- Commands must be case-insensitive
- Leading and trailing whitespace must be ignored
- Invalid commands must return a helpful error state with suggested next commands
- The interface must support command history navigation
- The interface should support basic autocomplete or command suggestions
- The interface should provide a first-run hint such as suggesting `help`
- The system may support clickable suggestions, but typed command input remains the main interaction model

---

## Output Rules

Command output must be:
- concise
- readable
- structured
- visually consistent
- terminal-inspired without becoming cryptic

Some commands may render richer UI blocks when needed, including:
- project cards
- profile summary panels
- timeline sections
- link groups
- writing previews
- AI answer panels

Rich content blocks must still feel like part of the same terminal-native system.

---

## AI Role

AI is an enhancement layer, not a core dependency.

AI should allow visitors to ask natural-language questions about:
- work
- projects
- technical preferences
- experience
- background
- areas of interest

### AI requirements

- AI responses must be grounded in curated portfolio content
- AI must not invent facts
- AI must not replace deterministic commands
- AI must fail gracefully
- AI must have fallback behavior if unavailable
- AI usage must be cost-aware and abuse-aware
- The site must remain fully useful without AI

### Recommended release model

- MVP: no AI required
- V2: add grounded `ask <question>` support

---

## Accessibility Requirements

The terminal metaphor must not reduce accessibility.

Requirements:
- keyboard navigation must work end-to-end
- focus-visible states must always be present
- color contrast must remain readable
- semantic HTML must be preferred over ARIA-heavy workarounds
- interactive hit areas must remain usable on mobile
- reduced motion must be respected
- error states must be understandable
- important content must not be hidden behind obscure commands only

The site should remain understandable even for visitors unfamiliar with terminal interfaces.

---

## Performance Requirements

Performance is part of the product identity.

Requirements:
- minimal initial load
- low-latency command response
- lightweight rendering
- minimal unnecessary visual reflow
- no heavy dependency justified only by aesthetics
- smooth interaction across desktop and mobile

---

## Visual Direction

The site should look terminal-inspired, but modern and intentional.

Desired qualities:
- dark, focused, low-noise visual presentation
- monospace-led typography
- strong hierarchy through scale and spacing
- thin borders and restrained accents
- subtle grid or system-like background treatment only if it does not become noisy
- minimal motion, used only to clarify interaction or enhance feel

Avoid:
- fake hacker aesthetics
- excessive CRT or glitch effects
- overly bright neon overuse
- landing-page marketing patterns disguised as terminal UI
- decorative motion without purpose

---

## Tone of Voice

The content tone should be:
- concise
- technically confident
- human
- slightly playful where appropriate
- direct, not corporate
- expressive, but not exaggerated

The site should sound like a real developer, not a startup landing page and not an overproduced personal brand.

---

## Recommended Tech Direction

Primary stack:
- SolidJS
- Vite
- TypeScript

Preferred supporting ideas:
- custom terminal renderer
- structured content via local TypeScript or Markdown files
- optional lightweight motion
- optional edge/serverless endpoint for AI

The stack should reinforce the project identity: lightweight, reactive, and intentionally engineered.

---

## MVP Scope

The MVP must feel complete without AI.

### MVP includes

- terminal-style landing experience
- visible prompt and onboarding hint
- command input
- deterministic local content
- commands:
  - `help`
  - `about`
  - `projects`
  - `project <name>`
  - `experience`
  - `skills`
  - `contact`
  - `clear`
- command history navigation
- basic autocomplete or command suggestions
- invalid command handling with recovery guidance
- structured project display
- structured profile and experience output
- responsive behavior
- accessibility-conscious interaction baseline
- performance-conscious rendering
- metadata / SEO basics

### MVP excludes

- AI Q&A
- blog system
- streamed answers
- advanced theming
- sound effects
- gimmick-heavy visuals
- account/session personalization
- CMS/admin features

---

## V2 Scope

V2 extends the portfolio after the terminal-first MVP is solid.

### V2 may include

- `ask <question>`
- grounded AI answers with fallback strategy
- `blog`
- `post <slug>`
- Markdown writing system
- richer aliases
- deeper command suggestions
- theme switching
- shareable deep links to specific views
- optional response streaming
- lightweight personality details / easter eggs

### V2 constraints

- AI remains optional
- content remains deterministic at the source layer
- latency must stay acceptable
- extra features must not harm clarity or performance

---

## Success Criteria

This remake is successful if the site:
- feels meaningfully different from a standard portfolio
- remains understandable and usable
- communicates strong technical identity
- helps visitors discover relevant work quickly
- feels polished in both writing and interaction
- remains maintainable over time
- still works as a strong portfolio even if AI is disabled

---

## One-Line Description

A terminal-native portfolio where visitors explore my work through commands, structured interaction, and optional AI-assisted discovery.