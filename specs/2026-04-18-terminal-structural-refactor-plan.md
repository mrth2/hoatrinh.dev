# Terminal Structural Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align the hoatrinh.dev build with `specs/hoatrinh_terminal_design_system.md` by introducing structural vocabulary (OutputPanel primitive + Motd landing + restyled prompt + per-kind block chrome + subtle dot-grid background) without changing tokens, engine, routing, SSR, or content.

**Architecture:** Add one new primitive (`<OutputPanel>`) that owns every terminal entry's framing (input echo + per-variant chrome), one small landing component (`<Motd>`), and restyle `<Prompt>` into an elevated sticky-bottom bar. Each block component sheds its own outer frame and becomes pure body. `EntryRenderer` chooses variant + meta per `entry.kind`. `InputEcho` is deleted.

**Tech Stack:** SolidJS + `@solidjs/router` + Vite + CSS Modules + Vitest + `@solidjs/testing-library` + Biome + Bun workspaces. Design tokens in `apps/web/src/styles/tokens.css`. Existing patterns: `*.module.css` per component folder; sr-only label + `aria-live` for accessibility; `prefers-reduced-motion` respected.

**Reference:** `specs/2026-04-18-terminal-structural-refactor-design.md` (commit `753f0e1`).

---

## File structure

### New files
- `apps/web/src/components/OutputPanel/OutputPanel.tsx`
- `apps/web/src/components/OutputPanel/OutputPanel.module.css`
- `apps/web/src/components/OutputPanel/OutputPanel.test.tsx`
- `apps/web/src/components/Motd/Motd.tsx`
- `apps/web/src/components/Motd/Motd.module.css`
- `apps/web/src/components/Motd/Motd.test.tsx`

### Modified files
- `apps/web/src/styles/tokens.css` — add `--grid-dot`.
- `apps/web/src/styles/global.css` — add dot-grid background, `prefers-contrast: more`, `prefers-reduced-motion` blocks.
- `apps/web/src/routes/TerminalPage.tsx` — add session header, render `<Motd>` when empty.
- `apps/web/src/routes/TerminalPage.module.css` — 3-row flex layout, responsive padding.
- `apps/web/src/components/Prompt/Prompt.tsx` — inline hint element.
- `apps/web/src/components/Prompt/Prompt.module.css` — full rewrite.
- `apps/web/src/components/Prompt/Prompt.test.tsx` — inline hint assertions.
- `apps/web/src/components/EntryRenderer/EntryRenderer.tsx` — wrap in `<OutputPanel>`, drop own markup.
- `apps/web/src/components/EntryRenderer/EntryRenderer.test.tsx` — variant mapping assertions.
- Each block `.tsx` / `.module.css` under `apps/web/src/components/blocks/*` — drop root frames, drop internal titles for `titled` kinds (`ProfileBlock`, `ProjectBlock`).

### Deleted files
- `apps/web/src/components/InputEcho/InputEcho.tsx`
- `apps/web/src/components/InputEcho/InputEcho.module.css`
- `apps/web/src/components/EntryRenderer/EntryRenderer.module.css`

### Commands reference
Repo root: `/Users/kyle/Workspace/Personal/hoatrinh.dev`.

- Run unit tests (web): `bun run --filter @hoatrinh/web test`
- Run a single test file: `cd apps/web && bun x vitest run src/path/to/file.test.tsx`
- Typecheck: `bun run typecheck`
- Lint + format check: `bun run lint`
- Dev server: `bun run dev` (http://localhost:5173)
- Build + preview (for smoke tests): `bun run build && bun run preview`
- Playwright e2e: `bun run e2e`

---

## Task 1: Add `--grid-dot` token and dot-grid background

**Files:**
- Modify: `apps/web/src/styles/tokens.css`
- Modify: `apps/web/src/styles/global.css`

- [ ] **Step 1: Add `--grid-dot` token**

Open `apps/web/src/styles/tokens.css`. Inside the `:root { ... }` block, after the `--border-width: 1px;` line (currently the last line), add:

```css
  /* grid */
  --grid-dot: rgba(31, 42, 35, 0.35);  /* border-default #1f2a23 at 35% alpha */
```

Resulting tail of `:root`:

```css
  /* borders */
  --border-width: 1px;

  /* grid */
  --grid-dot: rgba(31, 42, 35, 0.35);  /* border-default #1f2a23 at 35% alpha */
}
```

- [ ] **Step 2: Replace body background in `global.css`**

Open `apps/web/src/styles/global.css`. Replace the existing `body { ... }` block (the first rule in the file) with:

```css
body {
  color: var(--text-primary);
  font: 400 var(--text-base) / var(--leading-relaxed) var(--font-ui);
  background-color: var(--bg-base);
  background-image: radial-gradient(var(--grid-dot) 1px, transparent 1px);
  background-size: 24px 24px;
  background-attachment: fixed;
  min-height: 100dvh;
}
```

(The previous green radial glow is removed — the grid does the work now.)

- [ ] **Step 3: Add `prefers-contrast: more` and `prefers-reduced-motion` blocks**

Append to the end of `apps/web/src/styles/global.css`:

```css
@media (prefers-contrast: more) {
  body { background-image: none; }
  :root {
    --border-default: var(--border-strong);
    --text-muted: #b8c1bb;
  }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
}
```

- [ ] **Step 4: Verify typecheck + lint**

Run: `bun run typecheck && bun run lint`
Expected: both pass.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/styles/tokens.css apps/web/src/styles/global.css
git commit -m "feat(web): add dot-grid background and contrast/motion media blocks"
```

---

## Task 2: Create `OutputPanel` component (tests first)

**Files:**
- Create: `apps/web/src/components/OutputPanel/OutputPanel.test.tsx`
- Create: `apps/web/src/components/OutputPanel/OutputPanel.tsx`
- Create: `apps/web/src/components/OutputPanel/OutputPanel.module.css`

- [ ] **Step 1: Write the failing test**

Create `apps/web/src/components/OutputPanel/OutputPanel.test.tsx` with:

```tsx
import { describe, expect, it } from 'vitest';
import { render } from '@solidjs/testing-library';
import { OutputPanel } from './OutputPanel';

describe('OutputPanel', () => {
  it('renders the input echo', () => {
    const { getByText } = render(() => (
      <OutputPanel input="about" variant="plain">
        <p>body</p>
      </OutputPanel>
    ));
    expect(getByText('about')).toBeInTheDocument();
  });

  it('renders children as body', () => {
    const { getByText } = render(() => (
      <OutputPanel input="about" variant="plain">
        <p>hello body</p>
      </OutputPanel>
    ));
    expect(getByText('hello body')).toBeInTheDocument();
  });

  it('applies plain variant data attribute', () => {
    const { container } = render(() => (
      <OutputPanel input="help" variant="plain">
        <p>body</p>
      </OutputPanel>
    ));
    expect(container.querySelector('[data-variant="plain"]')).not.toBeNull();
  });

  it('applies frame variant data attribute', () => {
    const { container } = render(() => (
      <OutputPanel input="skills" variant="frame">
        <p>body</p>
      </OutputPanel>
    ));
    expect(container.querySelector('[data-variant="frame"]')).not.toBeNull();
  });

  it('applies titled variant data attribute', () => {
    const { container } = render(() => (
      <OutputPanel input="projects" variant="titled" meta="3 projects">
        <p>body</p>
      </OutputPanel>
    ));
    expect(container.querySelector('[data-variant="titled"]')).not.toBeNull();
  });

  it('renders meta only when provided (titled)', () => {
    const { queryByText } = render(() => (
      <OutputPanel input="projects" variant="titled" meta="3 projects">
        <p>body</p>
      </OutputPanel>
    ));
    expect(queryByText('3 projects')).not.toBeNull();
  });

  it('omits meta element when not provided (titled)', () => {
    const { container } = render(() => (
      <OutputPanel input="profile" variant="titled">
        <p>body</p>
      </OutputPanel>
    ));
    expect(container.querySelector('[data-meta]')).toBeNull();
  });

  it('exposes an sr-only label derived from input', () => {
    const { getByText } = render(() => (
      <OutputPanel input="about" variant="plain">
        <p>body</p>
      </OutputPanel>
    ));
    const label = getByText(/Output of: about/i);
    expect(label).toBeInTheDocument();
  });

  it('uses "(empty)" in the sr-only label when input is blank', () => {
    const { getByText } = render(() => (
      <OutputPanel input="" variant="plain">
        <p>body</p>
      </OutputPanel>
    ));
    expect(getByText(/Output of: \(empty\)/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/web && bun x vitest run src/components/OutputPanel/OutputPanel.test.tsx`
Expected: FAIL — `Cannot find module './OutputPanel'`.

- [ ] **Step 3: Create the stylesheet**

Create `apps/web/src/components/OutputPanel/OutputPanel.module.css` with:

```css
.panel {
  display: flex;
  flex-direction: column;
}

@media (prefers-reduced-motion: no-preference) {
  .panel { animation: entry-in 120ms ease-out; }
}

@keyframes entry-in {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: none; }
}

.echo {
  display: flex;
  gap: var(--space-2);
  align-items: baseline;
  font-family: var(--font-code);
  font-size: var(--text-sm);
}
.echoSigil { color: var(--text-muted); }
.echoText  { color: var(--text-primary); word-break: break-word; }

.body { display: flex; flex-direction: column; gap: var(--space-2); }

/* ---------- plain ---------- */
.panel[data-variant="plain"] {
  gap: var(--space-2);
}

/* ---------- frame ---------- */
.panel[data-variant="frame"] {
  padding: 0 var(--space-4);
  box-shadow: inset 2px 0 0 var(--accent-primary);
  gap: var(--space-2);
}

/* ---------- titled ---------- */
.panel[data-variant="titled"] {
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  overflow: hidden;
  gap: 0;
}
.panel[data-variant="titled"] .header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  background: var(--bg-subtle);
  border-bottom: 1px solid var(--border-default);
}
.panel[data-variant="titled"] .header .echo { font-size: var(--text-sm); }
.panel[data-variant="titled"] .meta {
  color: var(--text-dim);
  font-family: var(--font-code);
  font-size: var(--text-xs);
  letter-spacing: 0.05em;
  text-transform: lowercase;
  white-space: nowrap;
}
.panel[data-variant="titled"] .body {
  padding: var(--space-4);
  background: var(--bg-elevated);
  gap: var(--space-3);
}

@media (max-width: 640px) {
  .panel[data-variant="titled"] .meta { display: none; }
}
@media (max-width: 400px) {
  .panel[data-variant="titled"] .body { padding: var(--space-3); }
}
```

- [ ] **Step 4: Implement `OutputPanel.tsx`**

Create `apps/web/src/components/OutputPanel/OutputPanel.tsx`:

```tsx
import { createUniqueId, type JSX } from 'solid-js';
import styles from './OutputPanel.module.css';

export type OutputPanelVariant = 'plain' | 'frame' | 'titled';

export function OutputPanel(props: {
  input: string;
  variant: OutputPanelVariant;
  meta?: string;
  children: JSX.Element;
}) {
  const labelId = `panel-${createUniqueId()}-label`;
  const displayInput = () => (props.input === '' ? '(empty)' : props.input);

  return (
    <article
      class={styles.panel}
      data-variant={props.variant}
      aria-labelledby={labelId}
    >
      <h2 id={labelId} class="sr-only">Output of: {displayInput()}</h2>

      {props.variant === 'titled' ? (
        <div class={styles.header}>
          <Echo input={props.input} />
          {props.meta !== undefined ? (
            <span class={styles.meta} data-meta>{props.meta}</span>
          ) : null}
        </div>
      ) : (
        <Echo input={props.input} />
      )}

      <div class={styles.body}>{props.children}</div>
    </article>
  );
}

function Echo(props: { input: string }) {
  return (
    <div class={styles.echo}>
      <span class={styles.echoSigil} aria-hidden="true">&gt;</span>
      <span class={styles.echoText}>{props.input}</span>
    </div>
  );
}
```

`createUniqueId()` is SolidJS's SSR-safe unique-ID primitive — deterministic between server and client, so hydration doesn't mismatch.

- [ ] **Step 5: Run the test again to verify it passes**

Run: `cd apps/web && bun x vitest run src/components/OutputPanel/OutputPanel.test.tsx`
Expected: all 9 tests PASS.

- [ ] **Step 6: Typecheck + lint**

Run: `bun run typecheck && bun run lint`
Expected: both pass.

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/components/OutputPanel
git commit -m "feat(web): add OutputPanel primitive with plain/frame/titled variants"
```

---

## Task 3: Refactor `EntryRenderer` to use `OutputPanel`

**Files:**
- Modify: `apps/web/src/components/EntryRenderer/EntryRenderer.test.tsx`
- Modify: `apps/web/src/components/EntryRenderer/EntryRenderer.tsx`
- Delete: `apps/web/src/components/EntryRenderer/EntryRenderer.module.css`
- Delete: `apps/web/src/components/InputEcho/InputEcho.tsx`
- Delete: `apps/web/src/components/InputEcho/InputEcho.module.css`

- [ ] **Step 1: Extend the test file to cover variant selection**

Replace the contents of `apps/web/src/components/EntryRenderer/EntryRenderer.test.tsx` with:

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

function projectsEntry(count: number): TerminalEntry {
  resetEntryIds();
  const data = Array.from({ length: count }, (_, i) => ({
    slug: `p${i}`, title: `Project ${i}`, year: 2024, role: 'r',
    status: 'shipped', tech: [], links: {}, bodyHtml: '', tagline: 't',
  })) as unknown as Extract<TerminalEntry, { kind: 'projects' }>['data'];
  return { id: nextEntryId(), input: 'projects', kind: 'projects', data };
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

  it('wraps text entries in a plain OutputPanel', () => {
    const { container } = render(() => <EntryRenderer entry={textEntry('x', ['y'])} />);
    expect(container.querySelector('[data-variant="plain"]')).not.toBeNull();
  });

  it('wraps projects entries in a titled OutputPanel with count meta', () => {
    const { container, getByText } = render(() => <EntryRenderer entry={projectsEntry(3)} />);
    expect(container.querySelector('[data-variant="titled"]')).not.toBeNull();
    expect(getByText('3 projects')).toBeInTheDocument();
  });

  it('pluralises meta for exactly one project', () => {
    const { getByText } = render(() => <EntryRenderer entry={projectsEntry(1)} />);
    expect(getByText('1 project')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/web && bun x vitest run src/components/EntryRenderer/EntryRenderer.test.tsx`
Expected: FAIL — new assertions fail (existing ones still pass, new variant checks fail).

- [ ] **Step 3: Rewrite `EntryRenderer.tsx`**

Replace the contents of `apps/web/src/components/EntryRenderer/EntryRenderer.tsx` with:

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
import { OutputPanel, type OutputPanelVariant } from '../OutputPanel/OutputPanel';
import type { TerminalEntry } from '@/terminal/entries';

export function EntryRenderer(props: {
  entry: TerminalEntry;
  onSuggestion?: ((s: string) => void) | undefined;
}) {
  const variant = (): OutputPanelVariant => variantFor(props.entry.kind);
  const meta = () => metaFor(props.entry);

  return (
    <OutputPanel input={props.entry.input} variant={variant()} meta={meta()}>
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
    </OutputPanel>
  );
}

function variantFor(kind: TerminalEntry['kind']): OutputPanelVariant {
  switch (kind) {
    case 'profile':
    case 'projects':
    case 'project':
    case 'experience':
      return 'titled';
    case 'skills':
    case 'contact':
      return 'frame';
    case 'text':
    case 'help':
    case 'error':
      return 'plain';
  }
}

function metaFor(entry: TerminalEntry): string | undefined {
  switch (entry.kind) {
    case 'profile':
      return 'profile';
    case 'projects': {
      const n = entry.data.length;
      return `${n} ${n === 1 ? 'project' : 'projects'}`;
    }
    case 'project':
      return entry.data.slug;
    case 'experience': {
      const n = entry.data.length;
      return `${n} ${n === 1 ? 'role' : 'roles'}`;
    }
    default:
      return undefined;
  }
}
```

- [ ] **Step 4: Delete the now-unused CSS and the `InputEcho` component**

```bash
rm apps/web/src/components/EntryRenderer/EntryRenderer.module.css
rm -rf apps/web/src/components/InputEcho
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `cd apps/web && bun x vitest run src/components/EntryRenderer/EntryRenderer.test.tsx`
Expected: all 5 tests PASS.

- [ ] **Step 6: Run the full web test suite**

Run: `bun run --filter @hoatrinh/web test`
Expected: all tests PASS (no test imported `InputEcho` directly; check-after-fact if anything breaks).

- [ ] **Step 7: Typecheck + lint**

Run: `bun run typecheck && bun run lint`
Expected: both pass.

- [ ] **Step 8: Commit**

```bash
git add apps/web/src/components/EntryRenderer apps/web/src/components/InputEcho
git commit -m "refactor(web): route EntryRenderer output through OutputPanel, drop InputEcho"
```

(Staging both the modified folder and the deleted folder captures the deletions.)

---

## Task 4: Strip root frames from block components

The blocks with outer `.root` flex wrappers or their own headers now double-frame content, because `OutputPanel` wraps everything. This task removes those wrappers so blocks render as pure bodies.

**Files (all modify):**
- `apps/web/src/components/blocks/ProfileBlock/ProfileBlock.tsx`
- `apps/web/src/components/blocks/ProfileBlock/ProfileBlock.module.css`
- `apps/web/src/components/blocks/ProjectBlock/ProjectBlock.tsx`
- `apps/web/src/components/blocks/ProjectBlock/ProjectBlock.module.css`
- `apps/web/src/components/blocks/ProjectsBlock/ProjectsBlock.tsx`
- `apps/web/src/components/blocks/ProjectsBlock/ProjectsBlock.module.css`
- `apps/web/src/components/blocks/ExperienceBlock/ExperienceBlock.module.css`
- `apps/web/src/components/blocks/SkillsBlock/SkillsBlock.module.css`
- `apps/web/src/components/blocks/ContactBlock/ContactBlock.module.css`
- `apps/web/src/components/blocks/HelpBlock/HelpBlock.module.css`
- `apps/web/src/components/blocks/TextBlock/TextBlock.module.css`
- `apps/web/src/components/blocks/ErrorBlock/ErrorBlock.module.css`

- [ ] **Step 1: Simplify `ProfileBlock.tsx` (titled kind — drop its own header)**

The `titled` panel header now shows `> about` + `profile` meta. The inner profile name + role should demote: name stays `<h1>` for semantics but becomes the first visible content, not a header.

Replace `apps/web/src/components/blocks/ProfileBlock/ProfileBlock.tsx` with:

```tsx
import { For } from 'solid-js';
import type { Profile } from '@hoatrinh/content';
import styles from './ProfileBlock.module.css';

export function ProfileBlock(props: { data: Profile }) {
  return (
    <>
      <h1 class={styles.name}>{props.data.name}</h1>
      <p class={styles.role}>{props.data.role} · {props.data.location}</p>
      <div class={styles.body} innerHTML={props.data.bodyHtml} />
      <ul class={styles.links}>
        <For each={props.data.links}>
          {(l) => <li><a href={l.href}>{l.label}</a></li>}
        </For>
      </ul>
    </>
  );
}
```

- [ ] **Step 2: Update `ProfileBlock.module.css` (drop root/header wrappers)**

Replace `apps/web/src/components/blocks/ProfileBlock/ProfileBlock.module.css` with:

```css
.name { font-size: var(--text-xl); font-weight: 700; color: var(--text-primary); }
.role { font-size: var(--text-sm); color: var(--text-muted); }
.body { color: var(--text-primary); }
.body :global(p) { margin-bottom: var(--space-2); }
.links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  list-style: none;
  padding: 0;
  margin-top: var(--space-2);
}
```

- [ ] **Step 3: Simplify `ProjectBlock.tsx` (titled kind — drop its own header)**

Replace `apps/web/src/components/blocks/ProjectBlock/ProjectBlock.tsx` with:

```tsx
import { For } from 'solid-js';
import type { Project } from '@hoatrinh/content';
import styles from './ProjectBlock.module.css';

export function ProjectBlock(props: { data: Project }) {
  return (
    <>
      <h1 class={styles.title}>{props.data.title}</h1>
      <p class={styles.tagline}>{props.data.tagline}</p>
      <dl class={styles.meta}>
        <div><dt>Role</dt><dd>{props.data.role}</dd></div>
        <div><dt>Year</dt><dd>{props.data.year}</dd></div>
        <div><dt>Status</dt><dd>{props.data.status}</dd></div>
      </dl>
      {props.data.tech.length > 0 && (
        <ul class={styles.tech}>
          <For each={props.data.tech}>{(t) => <li>{t}</li>}</For>
        </ul>
      )}
      <div class={styles.body} innerHTML={props.data.bodyHtml} />
      {(props.data.links.live || props.data.links.repo) && (
        <ul class={styles.links}>
          {props.data.links.live && <li><a href={props.data.links.live}>Live</a></li>}
          {props.data.links.repo && <li><a href={props.data.links.repo}>Repo</a></li>}
        </ul>
      )}
    </>
  );
}
```

- [ ] **Step 4: Update `ProjectBlock.module.css` (drop `.root`/`.header`, keep internals)**

Replace `apps/web/src/components/blocks/ProjectBlock/ProjectBlock.module.css` with:

```css
.title { font-size: var(--text-xl); font-weight: 700; }
.tagline { color: var(--text-muted); font-size: var(--text-md); }
.meta { display: flex; flex-wrap: wrap; gap: var(--space-4); font-size: var(--text-xs); color: var(--text-muted); margin: 0; }
.meta div { display: flex; gap: var(--space-1); }
.meta dt::after { content: ':'; }
.meta dd { color: var(--text-primary); margin: 0; }
.tech { display: flex; flex-wrap: wrap; gap: var(--space-1); list-style: none; padding: 0; margin: 0; }
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
.links { display: flex; gap: var(--space-4); list-style: none; padding: 0; margin-top: var(--space-2); }
```

- [ ] **Step 5: Update `ProjectsBlock.tsx` (drop root section; remove the "N project(s) found." line — it duplicates the new panel meta)**

Replace `apps/web/src/components/blocks/ProjectsBlock/ProjectsBlock.tsx` with:

```tsx
import { For } from 'solid-js';
import type { Project } from '@hoatrinh/content';
import styles from './ProjectsBlock.module.css';

export function ProjectsBlock(props: { data: Project[] }) {
  return (
    <ul class={styles.list}>
      <For each={props.data}>
        {(p) => (
          <li class={styles.row}>
            <a class={styles.slug} href={`/project/${p.slug}`}>{p.slug}</a>
            <span class={styles.title}>{p.title}</span>
            <span class={styles.year}>{p.year}</span>
            <span class={styles.tagline}>{p.tagline}</span>
          </li>
        )}
      </For>
    </ul>
  );
}
```

- [ ] **Step 6: Update `ProjectsBlock.module.css` (drop `.root`, drop `.count`)**

Replace `apps/web/src/components/blocks/ProjectsBlock/ProjectsBlock.module.css` with:

```css
.list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: var(--space-1); }
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

- [ ] **Step 7: Review remaining block CSS files and remove `.root` wrappers where present**

The remaining block CSS files may carry vestigial `.root { display: flex; flex-direction: column; gap: ... }` rules. Since their `.tsx` files still reference `.root`, a full strip would require touching `.tsx` too. Strategy: for each file below, if `.root` exists and adds nothing beyond what `OutputPanel`'s body (`display: flex; flex-direction: column; gap: var(--space-2)`) already provides, delete both the `.root` rule and its reference in the `.tsx`.

For each of the following files, read the current contents first, then apply the listed change:

**`apps/web/src/components/blocks/ExperienceBlock/ExperienceBlock.module.css`** — no `.root`, skip this one. Leave the file as-is.

**`apps/web/src/components/blocks/SkillsBlock/SkillsBlock.tsx`** — replace with:

```tsx
import { For } from 'solid-js';
import type { SkillGroup } from '@hoatrinh/content';
import styles from './SkillsBlock.module.css';

export function SkillsBlock(props: { data: SkillGroup[] }) {
  return (
    <For each={props.data}>
      {(g) => (
        <div class={styles.group}>
          <h2 class={styles.label}>{g.label}</h2>
          <ul class={styles.items}>
            <For each={g.items}>{(i) => <li>{i}</li>}</For>
          </ul>
        </div>
      )}
    </For>
  );
}
```

**`apps/web/src/components/blocks/SkillsBlock/SkillsBlock.module.css`** — read first, then delete any `.root { ... }` rule if present. Keep `.group`, `.label`, `.items`.

**`apps/web/src/components/blocks/ContactBlock/ContactBlock.module.css`** — read first. If a `.root` / `.list` wrapper rule exists, keep it (the `ContactBlock.tsx` uses `.list` on its `<ul>`, which is fine — the body has one child).

**`apps/web/src/components/blocks/HelpBlock/HelpBlock.tsx`** — replace with:

```tsx
import { For } from 'solid-js';
import styles from './HelpBlock.module.css';
import type { HelpEntry } from '@/terminal/entries';

export function HelpBlock(props: { data: HelpEntry['data'] }) {
  return (
    <>
      <p class={styles.hint}>Type a command and press Enter. Tab completes. Up/Down scroll history.</p>
      <table class={styles.table}>
        <tbody>
          <For each={props.data.commands}>
            {(c) => (
              <tr>
                <td class={styles.usage}>{c.usage}</td>
                <td class={styles.summary}>{c.summary}</td>
              </tr>
            )}
          </For>
        </tbody>
      </table>
      <p class={styles.footer}>built with solid, vite, bun, typescript</p>
    </>
  );
}
```

**`apps/web/src/components/blocks/HelpBlock/HelpBlock.module.css`** — read first, delete any `.root` rule if present.

**`apps/web/src/components/blocks/TextBlock/TextBlock.module.css`** — read first. If the file contains `.root` with only flex/gap declarations, delete it. If there are meaningful styles (e.g., typography on paragraphs), keep them and convert to `:global` or bare selectors as needed. Since `TextBlock.tsx` wraps in `<div class={styles.root}>`, a simpler fix: leave `TextBlock.tsx` as-is and let `.root` be a no-op if its rules are deleted — but prefer to shrink:

**`apps/web/src/components/blocks/TextBlock/TextBlock.tsx`** — replace with:

```tsx
import { For } from 'solid-js';

export function TextBlock(props: { lines: string[] }) {
  return <For each={props.lines}>{(l) => <p>{l}</p>}</For>;
}
```

Then **`TextBlock.module.css`** can be emptied or deleted entirely. If you delete, remove the import from `TextBlock.tsx` (already done above — no import) and delete the file:

```bash
rm apps/web/src/components/blocks/TextBlock/TextBlock.module.css
```

**`apps/web/src/components/blocks/ErrorBlock/ErrorBlock.module.css`** — leave alone; `.root` holds the error message styling that matters.

- [ ] **Step 8: Verify all block files compile**

Run: `bun run typecheck`
Expected: PASS.

- [ ] **Step 9: Run the web test suite**

Run: `bun run --filter @hoatrinh/web test`
Expected: all tests PASS.

- [ ] **Step 10: Commit**

```bash
git add apps/web/src/components/blocks
git commit -m "refactor(web): strip block outer frames now owned by OutputPanel"
```

---

## Task 5: Create `Motd` component (tests first)

**Files:**
- Create: `apps/web/src/components/Motd/Motd.test.tsx`
- Create: `apps/web/src/components/Motd/Motd.tsx`
- Create: `apps/web/src/components/Motd/Motd.module.css`

- [ ] **Step 1: Write the failing test**

Create `apps/web/src/components/Motd/Motd.test.tsx`:

```tsx
import { describe, expect, it, vi } from 'vitest';
import { render, fireEvent } from '@solidjs/testing-library';
import { Motd } from './Motd';

describe('Motd', () => {
  it('renders the name line', () => {
    const { getByText } = render(() => <Motd onSuggestion={() => {}} />);
    expect(getByText(/hoa trinh hai/i)).toBeInTheDocument();
  });

  it('renders the role and location line', () => {
    const { getByText } = render(() => <Motd onSuggestion={() => {}} />);
    expect(getByText(/senior software engineer/i)).toBeInTheDocument();
  });

  it('renders help and about as buttons', () => {
    const { getByRole } = render(() => <Motd onSuggestion={() => {}} />);
    expect(getByRole('button', { name: 'help' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'about' })).toBeInTheDocument();
  });

  it('calls onSuggestion with "help" when the help button is clicked', () => {
    const onSuggestion = vi.fn();
    const { getByRole } = render(() => <Motd onSuggestion={onSuggestion} />);
    fireEvent.click(getByRole('button', { name: 'help' }));
    expect(onSuggestion).toHaveBeenCalledWith('help');
  });

  it('calls onSuggestion with "about" when the about button is clicked', () => {
    const onSuggestion = vi.fn();
    const { getByRole } = render(() => <Motd onSuggestion={onSuggestion} />);
    fireEvent.click(getByRole('button', { name: 'about' }));
    expect(onSuggestion).toHaveBeenCalledWith('about');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/web && bun x vitest run src/components/Motd/Motd.test.tsx`
Expected: FAIL — `Cannot find module './Motd'`.

- [ ] **Step 3: Implement `Motd.tsx`**

Create `apps/web/src/components/Motd/Motd.tsx`:

```tsx
import styles from './Motd.module.css';

export function Motd(props: { onSuggestion: (cmd: string) => void }) {
  return (
    <section class={styles.motd} aria-label="Welcome message">
      <p class={styles.name}>hoa trinh hai</p>
      <p class={styles.role}>senior software engineer · vietnam</p>
      <p class={styles.hint}>
        type{' '}
        <button type="button" class={styles.cmd} onClick={() => props.onSuggestion('help')}>help</button>
        {' '}to see commands, or try{' '}
        <button type="button" class={styles.cmd} onClick={() => props.onSuggestion('about')}>about</button>
      </p>
    </section>
  );
}
```

- [ ] **Step 4: Create `Motd.module.css`**

Create `apps/web/src/components/Motd/Motd.module.css`:

```css
.motd {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  margin-top: var(--space-6);
  font-family: var(--font-code);
}
.name { font-size: var(--text-lg); font-weight: 700; color: var(--text-primary); }
.role { font-size: var(--text-sm); color: var(--text-muted); }
.hint { font-size: var(--text-sm); color: var(--text-dim); }
.cmd {
  font: inherit;
  color: var(--accent-primary);
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}
.cmd:hover { text-decoration: underline; }
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `cd apps/web && bun x vitest run src/components/Motd/Motd.test.tsx`
Expected: all 5 tests PASS.

- [ ] **Step 6: Typecheck + lint**

Run: `bun run typecheck && bun run lint`
Expected: both pass.

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/components/Motd
git commit -m "feat(web): add Motd landing component with clickable command suggestions"
```

---

## Task 6: Restyle `<Prompt>` — add inline hint (logic + tests)

**Files:**
- Modify: `apps/web/src/components/Prompt/Prompt.tsx`
- Modify: `apps/web/src/components/Prompt/Prompt.test.tsx`

- [ ] **Step 1: Extend the test file**

Replace the contents of `apps/web/src/components/Prompt/Prompt.test.tsx` with:

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

  it('shows the inline hint when input is empty and focused', () => {
    const { getByLabelText, queryByText } = render(() => (
      <Prompt value="" onInput={() => {}} onSubmit={() => {}} onHistory={() => null} onTab={() => null} />
    ));
    const input = getByLabelText(/terminal prompt/i) as HTMLInputElement;
    fireEvent.focus(input);
    expect(queryByText(/run · .*history · .*complete/i)).not.toBeNull();
  });

  it('hides the inline hint while typing', () => {
    const { getByLabelText, queryByText } = render(() => (
      <Prompt value="a" onInput={() => {}} onSubmit={() => {}} onHistory={() => null} onTab={() => null} />
    ));
    const input = getByLabelText(/terminal prompt/i) as HTMLInputElement;
    fireEvent.focus(input);
    expect(queryByText(/run · .*history · .*complete/i)).toBeNull();
  });

  it('hides the inline hint when input is empty but not focused', () => {
    const { queryByText } = render(() => (
      <Prompt value="" onInput={() => {}} onSubmit={() => {}} onHistory={() => null} onTab={() => null} />
    ));
    expect(queryByText(/run · .*history · .*complete/i)).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify new assertions fail**

Run: `cd apps/web && bun x vitest run src/components/Prompt/Prompt.test.tsx`
Expected: FAIL — the 3 new hint tests fail; the existing submit test still passes.

- [ ] **Step 3: Update `Prompt.tsx` to add focus state + inline hint**

Replace the contents of `apps/web/src/components/Prompt/Prompt.tsx` with:

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
  const [announce, setAnnounce] = createSignal<string>('');
  const [focused, setFocused] = createSignal(false);

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

  const showHint = () => focused() && props.value === '';

  return (
    <form class={styles.prompt} onSubmit={handleSubmit}>
      <label for="terminal-input" class="sr-only">Terminal prompt, type a command</label>
      <span class={styles.sigil} aria-hidden="true">{props.sigil ?? 'hoa@trinh.dev ~ %'}</span>
      <input
        id="terminal-input"
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
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {showHint() && (
        <span class={styles.hint} aria-hidden="true">↵ run · ↑↓ history · ⇥ complete</span>
      )}
      <span id="prompt-announce" class="sr-only" aria-live="polite">{announce()}</span>
    </form>
  );
}
```

- [ ] **Step 4: Run the Prompt test to verify it passes**

Run: `cd apps/web && bun x vitest run src/components/Prompt/Prompt.test.tsx`
Expected: all 4 tests PASS.

- [ ] **Step 5: Typecheck + lint**

Run: `bun run typecheck && bun run lint`
Expected: both pass.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/components/Prompt
git commit -m "feat(web): add inline hint to Prompt when empty and focused"
```

---

## Task 7: Restyle `<Prompt>` — rewrite CSS

**Files:**
- Modify: `apps/web/src/components/Prompt/Prompt.module.css`

- [ ] **Step 1: Replace `Prompt.module.css`**

Replace the entire contents of `apps/web/src/components/Prompt/Prompt.module.css` with:

```css
.prompt {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: var(--space-2);
  position: sticky;
  bottom: 0;
  z-index: 2;
  padding: var(--space-3) var(--space-4) calc(var(--space-3) + env(safe-area-inset-bottom, 0px));
  background: var(--bg-elevated);
  border-top: 1px solid var(--border-default);
  box-shadow: inset 2px 0 0 var(--accent-primary);
  transition: border-color 120ms ease-out, box-shadow 120ms ease-out;
}

.prompt:hover {
  border-top-color: var(--border-strong);
}

.prompt:focus-within {
  border-top-color: var(--border-strong);
  box-shadow:
    inset 2px 0 0 var(--accent-primary),
    0 0 0 2px rgba(111, 224, 161, 0.25);
}

.sigil {
  font-family: var(--font-code);
  font-weight: 700;
  color: var(--accent-primary);
  white-space: nowrap;
}

.input {
  font-family: var(--font-code);
  font-size: var(--text-md);
  color: var(--text-primary);
  caret-color: var(--accent-primary);
  background: transparent;
  border: 0;
  outline: 0;
  flex: 1;
  min-width: 0;
  padding: 0;
}
.input:focus-visible { outline: 0; }

.hint {
  font-family: var(--font-code);
  font-size: var(--text-xs);
  color: var(--text-dim);
  white-space: nowrap;
}

@media (max-width: 640px) {
  .prompt { padding: var(--space-2) var(--space-3) calc(var(--space-2) + env(safe-area-inset-bottom, 0px)); }
  .input { font-size: var(--text-base); }
  .hint { display: none; }
  /* Sigil shortening: replace prompt sigil on narrow screens via pseudo-element */
  .sigil { font-size: 0; }
  .sigil::after {
    content: "~ %";
    font-size: var(--text-base);
  }
}
```

Notes:
- The input's default `:focus-visible` outline is suppressed because the *container* (`.prompt`) provides the visible focus treatment via `:focus-within`. This is preserved for accessibility because the 2px ring on the container plus the color-change border-top together meet WCAG 2.2 focus appearance.
- The narrow-screen sigil shortening uses `font-size: 0` + `::after` to swap the visible text without changing the JSX — the sr-only label on the input still describes the prompt correctly.
- The focus glow's `rgba(111, 224, 161, 0.25)` is `accent-primary` (`#6fe0a1`) at 25% alpha.

- [ ] **Step 2: Dev server smoke test**

Run: `bun run dev` (leave running in a separate terminal).
Open: `http://localhost:5173/`
Verify manually:
- Prompt bar is elevated (visible border + different background from page).
- Left edge of prompt bar shows a 2px green rule.
- Focusing the input (click or tab) shows a soft green glow and a brighter border-top.
- Typing hides the inline hint; emptying the input and keeping focus shows it again.
- Caret blinks in accent green.
- Resize to 375px width: sigil shows `~ %`; hint hides.

Stop the dev server when done (`Ctrl-C`).

- [ ] **Step 3: Typecheck + lint**

Run: `bun run typecheck && bun run lint`
Expected: both pass.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/components/Prompt/Prompt.module.css
git commit -m "style(web): elevate Prompt bar with focus glow and mobile sigil-short"
```

---

## Task 8: `TerminalPage` — session header + motd + 3-row layout

**Files:**
- Modify: `apps/web/src/routes/TerminalPage.tsx`
- Modify: `apps/web/src/routes/TerminalPage.module.css`

- [ ] **Step 1: Update `TerminalPage.tsx`**

Replace the contents of `apps/web/src/routes/TerminalPage.tsx` with:

```tsx
import { getProjects } from '@hoatrinh/content';
import { useNavigate } from '@solidjs/router';
import { onMount } from 'solid-js';
import { EntryList } from '@/components/EntryList/EntryList';
import { Motd } from '@/components/Motd/Motd';
import { Prompt } from '@/components/Prompt/Prompt';
import { autocomplete } from '@/terminal/autocomplete';
import { registry } from '@/terminal/commands';
import { execute } from '@/terminal/execute';
import { createHistory } from '@/terminal/history';
import { createTerminalStore } from '@/terminal/store';
import styles from './TerminalPage.module.css';

const PROJECT_SLUGS = getProjects().map((p) => p.slug);
const NOOP_NAVIGATE = () => {};
const SESSION_DATE = new Date().toISOString().slice(0, 10);

export function TerminalPage(props: { initialCommand?: string }) {
  const [state, setState] = createTerminalStore();
  const navigate = useNavigate();
  const history = createHistory();

  if (props.initialCommand) {
    // Run synchronously at setup (not onMount) so SSR includes the rendered entries
    // and client hydration matches. Router already landed us at this URL, so
    // suppress execute's navigate side effect.
    void execute(props.initialCommand, { state, setState, registry, navigate: NOOP_NAVIGATE });
  }

  function focusInput() {
    document.getElementById('terminal-input')?.focus();
  }

  onMount(() => {
    if (matchMedia('(pointer: fine)').matches) focusInput();
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
      projectSlugs: PROJECT_SLUGS,
    });
  }

  function onSuggestion(s: string) {
    setState('currentInput', s);
    submit(s);
  }

  function onListClick(e: MouseEvent) {
    const selection = window.getSelection();
    if (selection?.toString()) return;
    if ((e.target as HTMLElement).closest('a, button')) return;
    focusInput();
  }

  return (
    <main class={styles.page}>
      <a class="skip-link" href="#terminal-input">
        Skip to prompt
      </a>
      <header class={styles.sessionBar} aria-label="Session">
        <span class={styles.sessionHost}>hoa@trinh.dev</span>
        <span class={styles.sessionSep}> · session </span>
        <time class={styles.sessionDate} datetime={SESSION_DATE}>{SESSION_DATE}</time>
        <span class={styles.sessionHelp}>type 'help' for commands</span>
      </header>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: click-to-focus is a pointer-only enhancement; keyboard users tab to #terminal-input directly */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: keyboard users reach the input via Tab; this click handler is an enhancement */}
      <div class={styles.scroll} onClick={onListClick}>
        {state.entries.length === 0 && <Motd onSuggestion={onSuggestion} />}
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

- [ ] **Step 2: Update `TerminalPage.module.css`**

Replace the contents of `apps/web/src/routes/TerminalPage.module.css` with:

```css
.page {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  max-width: 72ch;
  margin: 0 auto;
  padding: var(--space-4) var(--space-4) 0;
}

@media (min-width: 640px) {
  .page { padding: var(--space-6) var(--space-6) 0; }
}

.sessionBar {
  display: flex;
  gap: var(--space-2);
  align-items: baseline;
  font-family: var(--font-code);
  font-size: var(--text-xs);
  padding: var(--space-2) 0 var(--space-4);
  color: var(--text-dim);
}
.sessionHost { color: var(--accent-primary); font-weight: 700; }
.sessionSep  { color: var(--text-muted); }
.sessionDate { color: var(--text-dim); }
.sessionHelp { margin-left: auto; color: var(--text-muted); }

@media (max-width: 640px) {
  .sessionHelp { display: none; }
}

.scroll {
  flex: 1;
  overflow-y: auto;
}
```

Notes:
- Row gap between output entries is intentionally not set here — `EntryList` already has a gap (verify at Step 3 below). If it needs tightening later, adjust `EntryList.module.css`, not this file.

- [ ] **Step 3: Verify `EntryList` spacing**

Open `apps/web/src/components/EntryList/EntryList.module.css`. If it does not currently define `.list { gap: ... }`, add one so panels breathe:

```css
.list {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}
```

If the file already has a `gap`, update it to `var(--space-5)`. This matches the spec's between-panel rhythm.

- [ ] **Step 4: Full web test suite**

Run: `bun run --filter @hoatrinh/web test`
Expected: all tests PASS.

- [ ] **Step 5: Typecheck + lint**

Run: `bun run typecheck && bun run lint`
Expected: both pass.

- [ ] **Step 6: Dev server smoke test**

Run: `bun run dev` and open `http://localhost:5173/`:
- See a session bar at the top (`hoa@trinh.dev · session <today>`, help hint on the right).
- See the `<Motd>` immediately (`hoa trinh hai`, role, click-hint line).
- No profile auto-loaded (because `/` is the landing — motd replaces auto-about).

Wait — check `App.tsx`: the current root `/` routes to `<TerminalPage initialCommand="about" />`. With the Motd in place, we still run `about` on `/`, which means the motd never shows (because `entries.length > 0` after the initial command). This is a conflict with the spec's "Landing state = prompt-first with motd" decision.

Resolve: change `App.tsx` so `/` has no `initialCommand`. Keep `/about` auto-running `about`. See Step 7.

- [ ] **Step 7: Update `App.tsx` to drop `initialCommand` from `/`**

Open `apps/web/src/App.tsx`. Change the `/` route from:

```tsx
<Route path="/" component={() => <TerminalPage initialCommand="about" />} />
```

to:

```tsx
<Route path="/" component={() => <TerminalPage />} />
```

Leave `/about`, `/projects`, etc. untouched.

- [ ] **Step 8: Re-run dev server smoke test**

Run: `bun run dev` (if stopped; or restart if running).
Verify:
- `/` shows session bar + motd + empty prompt. No auto-profile.
- Clicking the `help` button in motd runs `help` and shows a `plain` OutputPanel with the help contents.
- Motd disappears after first command.
- `/about` auto-runs `about` and shows a `titled` panel with `profile` meta.
- `/projects` shows a `titled` panel with `N projects` meta.
- `/skills` shows a `frame` (left-edge green rule, no box).

Stop the dev server (`Ctrl-C`).

- [ ] **Step 9: Commit**

```bash
git add apps/web/src/routes/TerminalPage.tsx apps/web/src/routes/TerminalPage.module.css apps/web/src/components/EntryList/EntryList.module.css apps/web/src/App.tsx
git commit -m "feat(web): add session bar + Motd; drop auto-about on landing route"
```

---

## Task 9: Prompt error state (red left rule when last command errored)

**Files:**
- Modify: `apps/web/src/routes/TerminalPage.tsx`
- Modify: `apps/web/src/components/Prompt/Prompt.tsx`
- Modify: `apps/web/src/components/Prompt/Prompt.test.tsx`
- Modify: `apps/web/src/components/Prompt/Prompt.module.css`

State model (no store change required): the prompt shows the error state when the most recent entry's `kind === 'error'` AND the current input is empty. As soon as the user types, `currentInput` becomes non-empty and the error state clears. This satisfies "until next keystroke" naturally.

- [ ] **Step 1: Extend the Prompt test file**

Append the following tests inside the existing `describe('Prompt', ...)` block in `apps/web/src/components/Prompt/Prompt.test.tsx` (just before the closing `});`):

```tsx
  it('applies data-errored when the errored prop is true', () => {
    const { container } = render(() => (
      <Prompt
        value=""
        errored={true}
        onInput={() => {}}
        onSubmit={() => {}}
        onHistory={() => null}
        onTab={() => null}
      />
    ));
    expect(container.querySelector('form[data-errored="true"]')).not.toBeNull();
  });

  it('omits data-errored when the errored prop is false or absent', () => {
    const { container } = render(() => (
      <Prompt
        value=""
        onInput={() => {}}
        onSubmit={() => {}}
        onHistory={() => null}
        onTab={() => null}
      />
    ));
    const form = container.querySelector('form');
    expect(form?.getAttribute('data-errored')).not.toBe('true');
  });
```

- [ ] **Step 2: Run tests to verify new ones fail**

Run: `cd apps/web && bun x vitest run src/components/Prompt/Prompt.test.tsx`
Expected: the two new tests FAIL (prop doesn't exist yet); existing four PASS.

- [ ] **Step 3: Update `Prompt.tsx` to accept `errored`**

Replace the contents of `apps/web/src/components/Prompt/Prompt.tsx` with:

```tsx
import { createSignal } from 'solid-js';
import styles from './Prompt.module.css';

export type HistoryDirection = 'up' | 'down';
export type TabAction = { completion: string | null; candidates: string[] };

export function Prompt(props: {
  value: string;
  sigil?: string;
  errored?: boolean;
  onInput: (v: string) => void;
  onSubmit: (raw: string) => void;
  onHistory: (dir: HistoryDirection) => string | null;
  onTab: (raw: string) => TabAction | null;
}) {
  const [announce, setAnnounce] = createSignal<string>('');
  const [focused, setFocused] = createSignal(false);

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

  const showHint = () => focused() && props.value === '';

  return (
    <form
      class={styles.prompt}
      onSubmit={handleSubmit}
      {...(props.errored ? { 'data-errored': 'true' } : {})}
    >
      <label for="terminal-input" class="sr-only">Terminal prompt, type a command</label>
      <span class={styles.sigil} aria-hidden="true">{props.sigil ?? 'hoa@trinh.dev ~ %'}</span>
      <input
        id="terminal-input"
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
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {showHint() && (
        <span class={styles.hint} aria-hidden="true">↵ run · ↑↓ history · ⇥ complete</span>
      )}
      <span id="prompt-announce" class="sr-only" aria-live="polite">{announce()}</span>
    </form>
  );
}
```

- [ ] **Step 4: Wire `errored` from `TerminalPage`**

In `apps/web/src/routes/TerminalPage.tsx`, add an `errored` derivation and pass it to `<Prompt>`.

Find the Prompt JSX block:

```tsx
      <Prompt
        value={state.currentInput}
        onInput={(v) => setState('currentInput', v)}
        onSubmit={submit}
        onHistory={onHistory}
        onTab={onTab}
      />
```

Replace with:

```tsx
      <Prompt
        value={state.currentInput}
        errored={isErrored()}
        onInput={(v) => setState('currentInput', v)}
        onSubmit={submit}
        onHistory={onHistory}
        onTab={onTab}
      />
```

Then add the `isErrored` accessor inside the `TerminalPage` function body, before `return`:

```tsx
  const isErrored = () => {
    if (state.currentInput !== '') return false;
    const last = state.entries[state.entries.length - 1];
    return last?.kind === 'error';
  };
```

- [ ] **Step 5: Add error-state CSS to `Prompt.module.css`**

Append to `apps/web/src/components/Prompt/Prompt.module.css`:

```css
.prompt[data-errored="true"] {
  box-shadow: inset 2px 0 0 var(--state-error);
}

.prompt[data-errored="true"]:focus-within {
  box-shadow:
    inset 2px 0 0 var(--state-error),
    0 0 0 2px rgba(111, 224, 161, 0.25);
}

@media (prefers-reduced-motion: no-preference) {
  .prompt[data-errored="true"] {
    animation: prompt-error-flash 200ms ease-out;
  }
}

@keyframes prompt-error-flash {
  0%   { box-shadow: inset 2px 0 0 var(--state-error), 0 0 0 2px rgba(255, 122, 122, 0.25); }
  100% { box-shadow: inset 2px 0 0 var(--state-error); }
}
```

Notes:
- Under normal motion: a 200ms flash (the red-tinted glow fades to none); after the animation the left rule stays red steadily until the user types.
- Under reduced motion: no flash; the rule is steadily red until the user types.
- When the user types, `currentInput` becomes non-empty so `isErrored()` returns false, `data-errored` is removed, and the rule reverts to green.
- When focused + errored, the red left rule is preserved and the green focus glow still shows (explicit combined rule above).

- [ ] **Step 6: Run Prompt tests**

Run: `cd apps/web && bun x vitest run src/components/Prompt/Prompt.test.tsx`
Expected: all 6 tests PASS.

- [ ] **Step 7: Full web tests + typecheck + lint**

Run: `bun run --filter @hoatrinh/web test && bun run typecheck && bun run lint`
Expected: all pass.

- [ ] **Step 8: Dev smoke test**

Run: `bun run dev`. At `http://localhost:5173/`, type `xyzzy` (not a command) and press Enter. Expected:
- An error entry renders in the output (`Command not found: xyzzy`).
- The prompt's left rule turns red and, under normal motion, briefly flashes.
- Type any character: the rule returns to green immediately.

Stop the dev server.

- [ ] **Step 9: Commit**

```bash
git add apps/web/src/routes/TerminalPage.tsx apps/web/src/components/Prompt
git commit -m "feat(web): show red left rule on prompt when last command errored"
```

---

## Task 10: Final verification and QA

- [ ] **Step 1: Full test suite**

Run: `bun run test`
Expected: all tests PASS.

- [ ] **Step 2: Typecheck**

Run: `bun run typecheck`
Expected: PASS.

- [ ] **Step 3: Lint**

Run: `bun run lint`
Expected: PASS (no errors; warnings OK if consistent with existing code).

- [ ] **Step 4: Production build + preview**

Run: `bun run build`
Expected: successful build, no errors.

Then: `bun run preview`
Open: the URL printed by the preview script.
Verify (matches the Acceptance Criteria section of the spec):
- `/` shows motd + empty prompt; prompt bar elevated with left green rule.
- `/about` shows a titled panel with `profile` meta and profile content.
- `/projects` shows a titled panel with `N projects` meta and the project table.
- `/help` shows a plain output (no border/rule).
- `/skills` shows a frame output (left green rule, no box).
- `404` shows NotFound page (unchanged).
- Dot grid visible in gutters, not under titled panels.
- Focus ring on prompt is visible on keyboard focus.
- Empty command (just Enter) creates an entry with `Output of: (empty)` in the sr-only label.

Stop preview (`Ctrl-C`).

- [ ] **Step 5: Playwright e2e**

Run: `bun run e2e`
Expected: all smoke tests PASS. If any break due to prompt/markup changes, inspect and update selectors (not a plan task — surface to the user).

- [ ] **Step 6: Mobile viewport manual check**

Restart dev server: `bun run dev`.
Open DevTools, toggle device toolbar, pick iPhone SE (375×667). Verify:
- Column padding tightens.
- Session help hint (`type 'help' ...`) hides.
- Prompt sigil shows `~ %`.
- Inline hint in prompt hides.
- Titled panel meta hides (header shows only `> input`).
- Titled panel body stays readable.
- Prompt respects safe-area at the bottom.

Stop dev server.

- [ ] **Step 7: Accessibility quick pass**

Still in dev, on desktop:
- Tab from page load: skip link should appear, Enter focuses prompt.
- Tab from prompt: moves to Motd `help` button, then `about` button (if motd present).
- With motd dismissed, Tab from prompt goes to entry-internal links (e.g., project slugs in projects panel).
- Enable `prefers-reduced-motion` in DevTools (Rendering tab): entry animation is disabled.
- Enable `prefers-contrast: more`: dot grid disappears, borders thicken.

Stop dev server.

- [ ] **Step 8: Final commit (if any stragglers)**

If the verification pass produced any small corrections, commit them:

```bash
git status
# If changes: stage specifically, then:
git commit -m "fix(web): <what was corrected>"
```

If no corrections are needed, skip.

- [ ] **Step 9: Push and open PR (optional — confirm with user)**

Do NOT push or open a PR without explicit user confirmation. Print a summary and ask:

```
Refactor complete. <N> commits:
  <shortlog>
Want to push master to origin and/or open a PR?
```

---

## Acceptance criteria (mirrors the spec)

Implementation is complete when all of the following are true:

### Visual
- [ ] Landing `/` shows motd above empty prompt.
- [ ] `/about` auto-runs `about` and shows a titled panel with `profile` meta.
- [ ] `/projects` shows a titled panel with `${count} projects` meta.
- [ ] `/help` renders as plain variant.
- [ ] `/skills` renders as frame variant (left-edge green rule).
- [ ] Dot grid visible in gutters but not under titled panels.
- [ ] Prompt bar is elevated with left-edge accent rule; focus state shows glow + border shift.

### Interaction
- [ ] Click anywhere in output region focuses prompt.
- [ ] Keyboard-only user can reach prompt, motd buttons, suggestion tokens, and all links.
- [ ] Tab completion and up/down history still work.
- [ ] Motd unmounts after the first command submit.

### Accessibility
- [ ] `role="log"` + `aria-live="polite"` announces each new entry.
- [ ] Every focusable element has a visible 2px focus ring.
- [ ] `prefers-reduced-motion` disables entry animation.
- [ ] `prefers-contrast: more` hides the dot grid and increases text/border contrast.
- [ ] No feature depends on hover alone.

### Responsive
- [ ] At 375px: column padding tightens, prompt sigil shortens to `~ %`, titled meta hides.
- [ ] No horizontal scroll at 320–1920px.
- [ ] Safe-area inset respected on iOS.

### Tests
- [ ] `OutputPanel.test.tsx` — 9 tests pass.
- [ ] `EntryRenderer.test.tsx` — 5 tests pass.
- [ ] `Motd.test.tsx` — 5 tests pass.
- [ ] `Prompt.test.tsx` — 6 tests pass.
- [ ] All pre-existing tests still pass.
- [ ] `typecheck`, `lint`, `build` all green.

---

## Out of scope (do NOT touch)

- Adding new commands or new `TerminalEntry` kinds.
- Changing design tokens other than adding `--grid-dot`.
- Routing changes besides dropping `initialCommand` from `/`.
- Onboarding flow, hint persistence, local-storage.
- Command palette or popovers.
- Motion beyond entry fade-in and prompt error flash (error flash is deferred — see below).
- ASCII art / figlet banners.
- Moving the palette toward the brighter mono-source green.

### Deferred
Nothing from the spec is deferred — the full acceptance criteria set is covered across Tasks 1-10.
