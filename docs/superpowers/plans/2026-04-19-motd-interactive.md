# MOTD Interactive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fill the empty first-paint space below the hero with a clickable ls-style command index, and add three subtle ambient-motion elements (live clock, heartbeat dots, first-paint reveal), without leaving the warm amber design system.

**Architecture:** One new presentational component (`CommandIndex`) that pulls rows from the existing command registry and content package. Embed it in the three existing `Motd` modes (compact, boot-static, boot-animated) in place of the redundant hint line. Three additive CSS / small-JS changes for ambient motion: a minute-tick signal in `TerminalPage` feeding a new `<time>` in the session bar; CSS `@keyframes` for the status-dot pulse; CSS `@keyframes` for the compact MOTD's first-paint reveal.

**Tech Stack:** Solid.js (`solid-js`, `@solidjs/testing-library`), TypeScript strict, CSS Modules with tokens from `apps/web/src/styles/tokens.css`, vitest + jsdom for unit tests, Playwright for e2e. Bun workspace. Biome for lint + format.

**Spec:** `docs/superpowers/specs/2026-04-19-motd-interactive-design.md`

**Branch strategy:** Working directly on `master` (no git remote; personal repo per project memory). If you prefer isolation, create a short-lived branch `feat/motd-interactive` and merge when done.

**Files created:**
- `apps/web/src/components/CommandIndex/CommandIndex.tsx`
- `apps/web/src/components/CommandIndex/CommandIndex.module.css`
- `apps/web/src/components/CommandIndex/CommandIndex.test.tsx`

**Files modified:**
- `apps/web/src/components/Motd/Motd.tsx` (remove `.hint` JSX, insert `<CommandIndex>`)
- `apps/web/src/components/Motd/Motd.module.css` (heartbeat on `.dot`, first-paint reveal)
- `apps/web/src/components/Motd/Motd.test.tsx` (loosen name matchers to regex for commands that now come from `CommandIndex`; add negative assertion for the removed hint line)
- `apps/web/src/routes/TerminalPage.tsx` (live clock signal, render `<time>` in session bar)
- `apps/web/src/routes/TerminalPage.module.css` (`.sessionTime` style, heartbeat on `.sessionStatus[data-state="ok"]`)
- `apps/web/tests/e2e/smoke.spec.ts` (new click-the-index test)

---

## Task 1: CommandIndex renders one button per command

**Files:**
- Create: `apps/web/src/components/CommandIndex/CommandIndex.tsx`
- Create: `apps/web/src/components/CommandIndex/CommandIndex.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `apps/web/src/components/CommandIndex/CommandIndex.test.tsx`:

```tsx
import { cleanup, render } from '@solidjs/testing-library';
import { afterEach, describe, expect, it } from 'vitest';
import { CommandIndex } from './CommandIndex';

describe('CommandIndex', () => {
  afterEach(cleanup);

  it('renders one button per command, excluding clear', () => {
    const { getAllByRole } = render(() => <CommandIndex onSuggestion={() => {}} />);
    const buttons = getAllByRole('button');
    const names = buttons.map((b) => b.textContent?.split(/\s+/)[0]?.trim());
    expect(names).toEqual(['about', 'projects', 'experience', 'skills', 'contact', 'help']);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun x vitest run apps/web/src/components/CommandIndex/CommandIndex.test.tsx`
Expected: FAIL with `Cannot find module './CommandIndex'` or similar.

- [ ] **Step 3: Write minimal implementation**

Create `apps/web/src/components/CommandIndex/CommandIndex.tsx`:

```tsx
import { For } from 'solid-js';
import { getExperience, getProjects, getSkills } from '@hoatrinh/content';
import { specs as commandSpecs } from '@/terminal/commands';
import styles from './CommandIndex.module.css';

type Row = {
  name: string;
  summary: string;
  count?: number;
};

function buildRows(): Row[] {
  const counts: Record<string, number | undefined> = {
    projects: getProjects().length,
    experience: getExperience().length,
    skills: getSkills().reduce((n, g) => n + g.items.length, 0),
  };
  return commandSpecs
    .filter((s) => s.name !== 'clear')
    .map((s) => {
      const count = counts[s.name];
      return count !== undefined ? { name: s.name, summary: s.summary, count } : { name: s.name, summary: s.summary };
    });
}

export function CommandIndex(props: { onSuggestion: (cmd: string) => void }) {
  const rows = buildRows();
  return (
    <nav class={styles.wrapper} aria-label="Command index">
      <p class={styles.header}>── commands ──────────────────────────── {rows.length} total</p>
      <ul class={styles.list}>
        <For each={rows}>
          {(row) => (
            <li>
              <button
                type="button"
                class={styles.row}
                onClick={() => props.onSuggestion(row.name)}
              >
                <span class={styles.name}>{row.name}</span>
                <span class={styles.summary}>{row.summary}</span>
                <span class={styles.meta}>{row.count ?? ''}</span>
              </button>
            </li>
          )}
        </For>
      </ul>
    </nav>
  );
}
```

Also create an empty `apps/web/src/components/CommandIndex/CommandIndex.module.css` so the import resolves (styling comes in Task 4):

```css
/* styles filled in Task 4 */
.wrapper { }
.header { }
.list { }
.row { }
.name { }
.summary { }
.meta { }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun x vitest run apps/web/src/components/CommandIndex/CommandIndex.test.tsx`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/CommandIndex/
git commit -m "feat(web): CommandIndex component renders row per command"
```

---

## Task 2: Clicking a row calls onSuggestion

**Files:**
- Modify: `apps/web/src/components/CommandIndex/CommandIndex.test.tsx`

- [ ] **Step 1: Write the failing test**

Append inside the `describe('CommandIndex', ...)` block:

```tsx
  it('calls onSuggestion with the command name when a row is clicked', () => {
    const onSuggestion = vi.fn();
    const { getByRole } = render(() => <CommandIndex onSuggestion={onSuggestion} />);
    fireEvent.click(getByRole('button', { name: /^about\b/i }));
    expect(onSuggestion).toHaveBeenCalledWith('about');
  });

  it('calls onSuggestion with "projects" when projects row is clicked', () => {
    const onSuggestion = vi.fn();
    const { getByRole } = render(() => <CommandIndex onSuggestion={onSuggestion} />);
    fireEvent.click(getByRole('button', { name: /^projects\b/i }));
    expect(onSuggestion).toHaveBeenCalledWith('projects');
  });
```

Add the new imports at the top of the test file (replace the existing import line):

```tsx
import { cleanup, fireEvent, render } from '@solidjs/testing-library';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CommandIndex } from './CommandIndex';
```

- [ ] **Step 2: Run tests to verify they pass**

Run: `bun x vitest run apps/web/src/components/CommandIndex/CommandIndex.test.tsx`
Expected: PASS (3 tests). These tests should already pass on the Task 1 implementation — clicking each `<button>` fires its `onClick`. If one fails, verify the button's accessible name includes the command name at the start.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/CommandIndex/CommandIndex.test.tsx
git commit -m "test(web): cover onSuggestion dispatch from CommandIndex rows"
```

---

## Task 3: CommandIndex shows counts for projects / experience / skills

**Files:**
- Modify: `apps/web/src/components/CommandIndex/CommandIndex.test.tsx`

- [ ] **Step 1: Write the failing test**

Append inside the `describe('CommandIndex', ...)` block:

```tsx
  it('renders counts for projects, experience, and skills only', () => {
    const { getByRole } = render(() => <CommandIndex onSuggestion={() => {}} />);
    // rows that should have a count (meta column non-empty)
    const projectsBtn = getByRole('button', { name: /^projects\b/i });
    const experienceBtn = getByRole('button', { name: /^experience\b/i });
    const skillsBtn = getByRole('button', { name: /^skills\b/i });
    // rows that should NOT have a count
    const aboutBtn = getByRole('button', { name: /^about\b/i });
    const contactBtn = getByRole('button', { name: /^contact\b/i });
    const helpBtn = getByRole('button', { name: /^help\b/i });

    // The accessible name ends with the count for counted rows and is empty-trailing for uncounted ones.
    const metaOf = (el: HTMLElement) =>
      (el.querySelector('[data-meta]') as HTMLElement | null)?.textContent?.trim() ?? '';

    expect(metaOf(projectsBtn)).toMatch(/^\d+$/);
    expect(metaOf(experienceBtn)).toMatch(/^\d+$/);
    expect(metaOf(skillsBtn)).toMatch(/^\d+$/);
    expect(metaOf(aboutBtn)).toBe('');
    expect(metaOf(contactBtn)).toBe('');
    expect(metaOf(helpBtn)).toBe('');
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun x vitest run apps/web/src/components/CommandIndex/CommandIndex.test.tsx`
Expected: FAIL — `metaOf(...)` returns `''` for every button because the `.meta` span has no `data-meta` attribute yet.

- [ ] **Step 3: Add a `data-meta` hook to the meta span**

Edit `apps/web/src/components/CommandIndex/CommandIndex.tsx`. Replace the meta span line:

```tsx
<span class={styles.meta}>{row.count ?? ''}</span>
```

with:

```tsx
<span class={styles.meta} data-meta>{row.count ?? ''}</span>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun x vitest run apps/web/src/components/CommandIndex/CommandIndex.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/CommandIndex/
git commit -m "feat(web): surface counts on CommandIndex for content-backed rows"
```

---

## Task 4: Style CommandIndex per design system

**Files:**
- Modify: `apps/web/src/components/CommandIndex/CommandIndex.module.css`

No unit test — this is visual. Smoke-tested by the existing `data-motd-compact` assertions and the Task 9 e2e click test.

- [ ] **Step 1: Replace the placeholder CSS**

Overwrite `apps/web/src/components/CommandIndex/CommandIndex.module.css`:

```css
.wrapper {
  margin-top: var(--space-4);
  font-family: var(--font-code);
}

.header {
  color: var(--text-dim);
  font-size: var(--text-xs);
  margin: 0 0 var(--space-1);
  letter-spacing: 0.02em;
}

.list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
}

.row {
  display: grid;
  grid-template-columns: 12ch 1fr auto;
  gap: var(--space-4);
  width: 100%;
  padding: var(--space-1) var(--space-3);
  background: none;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  text-align: left;
  font: inherit;
  font-size: var(--text-sm);
  color: var(--text-primary);
  transition: background 120ms ease-out, box-shadow 120ms ease-out, color 120ms ease-out;
}

.name {
  color: var(--accent-primary);
  font-weight: 500;
}

.summary {
  color: var(--text-muted);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.meta {
  color: var(--text-dim);
  font-variant-numeric: tabular-nums;
}

.row:hover,
.row:focus-visible {
  background: var(--bg-subtle);
  box-shadow: inset 2px 0 0 var(--accent-primary);
  outline: none;
}

.row:hover .name,
.row:focus-visible .name {
  color: var(--accent-hover);
  text-shadow: 0 0 10px rgba(255, 79, 216, 0.4);
}

@media (prefers-reduced-motion: reduce), (prefers-contrast: more) {
  .row:hover .name,
  .row:focus-visible .name {
    text-shadow: none;
  }
}

@media (max-width: 480px) {
  .row {
    grid-template-columns: 10ch 1fr auto;
    gap: var(--space-3);
  }
}
```

- [ ] **Step 2: Run all tests to confirm nothing regressed**

Run: `bun run test`
Expected: all existing tests PASS.

- [ ] **Step 3: Start the dev server and visually verify**

Run: `bun run dev`
Open `http://localhost:5173/`. Expected:
- Below the role line, a new `── commands ── 6 total` header.
- Six rows, amber command names on the left, muted summaries middle, dim counts right for `projects`/`experience`/`skills`.
- Hover: row gets a faint warm subtle background, amber 2px left accent, name flips to magenta with a soft glow.
- Tab focus: same visual as hover.

Stop the dev server.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/components/CommandIndex/CommandIndex.module.css
git commit -m "style(web): warm-amber styling for CommandIndex rows"
```

---

## Task 5: Embed CommandIndex in Motd; remove hint line

**Files:**
- Modify: `apps/web/src/components/Motd/Motd.tsx`
- Modify: `apps/web/src/components/Motd/Motd.test.tsx`
- Modify: `apps/web/src/components/Motd/Motd.module.css` (remove now-unused `.hint` and `.cmd` rules)

- [ ] **Step 1: Update the failing Motd tests**

In `apps/web/src/components/Motd/Motd.test.tsx`, change the existing strict-string name matchers to regex so they still match buttons coming from `CommandIndex` (which have additional text). Replace the whole `describe('Motd (compact mode)', ...)` block with:

```tsx
describe('Motd (compact mode)', () => {
  beforeEach(() => markBooted()); // force compact path
  afterEach(() => {
    resetBooted();
    cleanup();
  });

  it('renders the name line', () => {
    const { getByText } = render(() => <Motd onSuggestion={() => {}} />);
    expect(getByText(/hoa trinh hai/i)).toBeInTheDocument();
  });

  it('renders the role and location line', () => {
    const { getByText } = render(() => <Motd onSuggestion={() => {}} />);
    expect(getByText(/senior software engineer/i)).toBeInTheDocument();
  });

  it('renders help and about as buttons via CommandIndex', () => {
    const { getByRole } = render(() => <Motd onSuggestion={() => {}} />);
    expect(getByRole('button', { name: /^help\b/i })).toBeInTheDocument();
    expect(getByRole('button', { name: /^about\b/i })).toBeInTheDocument();
  });

  it('calls onSuggestion with "help"', () => {
    const onSuggestion = vi.fn();
    const { getByRole } = render(() => <Motd onSuggestion={onSuggestion} />);
    fireEvent.click(getByRole('button', { name: /^help\b/i }));
    expect(onSuggestion).toHaveBeenCalledWith('help');
  });

  it('calls onSuggestion with "about"', () => {
    const onSuggestion = vi.fn();
    const { getByRole } = render(() => <Motd onSuggestion={onSuggestion} />);
    fireEvent.click(getByRole('button', { name: /^about\b/i }));
    expect(onSuggestion).toHaveBeenCalledWith('about');
  });

  it('renders a compact status line with a rotating subline', () => {
    const { container } = render(() => <Motd onSuggestion={() => {}} />);
    expect(container.querySelector('[data-motd-compact]')).toBeTruthy();
  });

  it('does not render the old inline "type help to see commands" hint', () => {
    const { queryByText } = render(() => <Motd onSuggestion={() => {}} />);
    expect(queryByText(/type help to see commands/i)).toBeNull();
  });

  it('renders the command index header', () => {
    const { getByText } = render(() => <Motd onSuggestion={() => {}} />);
    expect(getByText(/commands/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun x vitest run apps/web/src/components/Motd/Motd.test.tsx`
Expected: FAIL. The "does not render the old inline hint" test fails because the hint still exists; the command index test fails because `CommandIndex` isn't embedded yet.

- [ ] **Step 3: Embed CommandIndex and remove the hint**

Edit `apps/web/src/components/Motd/Motd.tsx`. Add the import near the top:

```tsx
import { CommandIndex } from '@/components/CommandIndex/CommandIndex';
```

Replace the `CompactMotd` function body with:

```tsx
function CompactMotd(props: { compactLine: string; onSuggestion: (cmd: string) => void }) {
  return (
    <section class={styles.motd} aria-label="Welcome message" data-motd-compact>
      <p class={styles.name}>hoa trinh hai</p>
      <p class={styles.role}>senior software engineer · vietnam</p>
      <CommandIndex onSuggestion={props.onSuggestion} />
      <p class={styles.compactLine}>
        <span class={styles.dot} aria-hidden="true">
          ●
        </span>
        <span class={styles.ready}>ready</span>
        <span class={styles.subline}>{props.compactLine}</span>
      </p>
    </section>
  );
}
```

Replace the `BootStatic` function body with:

```tsx
function BootStatic(props: {
  bootSet: ReturnType<typeof pickBootSet>;
  relative: string;
  uaHash: string;
  compactLine: string;
  onSuggestion: (cmd: string) => void;
}) {
  return (
    <section class={styles.motd} aria-label="Welcome message" data-motd-boot>
      <p class={styles.bootLine}>initializing session...</p>
      <p class={styles.bootLine}>{props.bootSet.greeting}</p>
      <p class={styles.bootLine}>
        last login: {props.relative} from {props.uaHash}
      </p>
      <p class={styles.bootLine}>{props.bootSet.tip}</p>
      <p class={styles.name}>hoa trinh hai</p>
      <p class={styles.role}>senior software engineer · vietnam</p>
      <CommandIndex onSuggestion={props.onSuggestion} />
      <p class={styles.compactLine}>
        <span class={styles.dot} aria-hidden="true">
          ●
        </span>
        <span class={styles.ready}>ready</span>
        <span class={styles.subline}>{props.compactLine}</span>
      </p>
    </section>
  );
}
```

In `BootAnimated`, replace the `<Show when={done()}>` block body with:

```tsx
      <Show when={done()}>
        <p class={styles.name}>hoa trinh hai</p>
        <p class={styles.role}>senior software engineer · vietnam</p>
        <CommandIndex onSuggestion={props.onSuggestion} />
        <p class={styles.compactLine}>
          <span class={styles.dot} aria-hidden="true">
            ●
          </span>
          <span class={styles.ready}>ready</span>
          <span class={styles.subline}>{props.compactLine}</span>
        </p>
      </Show>
```

(These three edits drop the `.hint` `<p>` and every `<button class={styles.cmd}>` that was inside it. They also insert the new `<CommandIndex>` call in the same position where the hint used to be.)

- [ ] **Step 4: Drop the now-unused hint styles**

Edit `apps/web/src/components/Motd/Motd.module.css`. Remove the `.hint`, `.cmd`, `.cmd:hover`, and the `@media` block that references `.cmd:hover`. Those rules are:

```css
.hint {
  font-size: var(--text-sm);
  color: var(--text-dim);
  margin: 0;
}
.cmd {
  font: inherit;
  color: var(--accent-primary);
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}
.cmd:hover {
  color: var(--accent-hover);
  text-decoration: underline;
  text-shadow: 0 0 10px rgba(255, 79, 216, 0.4);
}

@media (prefers-reduced-motion: reduce), (prefers-contrast: more) {
  .cmd:hover {
    text-shadow: none;
  }
}
```

Delete all of the above (the whole run from `.hint` through the matching `@media` block). Leave every other rule intact.

- [ ] **Step 5: Run Motd tests to verify they pass**

Run: `bun x vitest run apps/web/src/components/Motd/Motd.test.tsx`
Expected: PASS (8 tests).

- [ ] **Step 6: Run the full unit suite**

Run: `bun run test`
Expected: all workspaces green.

- [ ] **Step 7: Run typecheck**

Run: `bun run typecheck`
Expected: PASS. If TS complains about an unused `styles.hint`/`styles.cmd` reference in `Motd.tsx`, it's because the JSX still referenced them — re-verify Step 3 dropped every `<p class={styles.hint}>` and every `<button class={styles.cmd}>`.

- [ ] **Step 8: Commit**

```bash
git add apps/web/src/components/Motd/ apps/web/src/components/CommandIndex/
git commit -m "feat(web): embed CommandIndex in MOTD, retire inline hint line"
```

---

## Task 6: Live clock in the session bar

**Files:**
- Modify: `apps/web/src/routes/TerminalPage.tsx`
- Modify: `apps/web/src/routes/TerminalPage.module.css`

Because `TerminalPage` has no existing unit test file, we add one focused on the clock.

- [ ] **Step 1: Write the failing test**

Create `apps/web/src/routes/TerminalPage.test.tsx`:

```tsx
import { cleanup, render } from '@solidjs/testing-library';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { markBooted, resetBooted } from '@/lib/motd/boot-state';

// Mock useNavigate so the component does not require a Router context in tests.
vi.mock('@solidjs/router', () => ({
  useNavigate: () => () => {},
}));

// Import AFTER the mock so the module picks up the stub.
const { TerminalPage } = await import('./TerminalPage');

describe('TerminalPage session bar clock', () => {
  beforeEach(() => {
    markBooted(); // skip boot animation for determinism
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-19T14:32:30Z'));
  });
  afterEach(() => {
    vi.useRealTimers();
    resetBooted();
    cleanup();
  });

  it('renders the current HH:MM in the session bar', () => {
    const { container } = render(() => <TerminalPage />);
    const time = container.querySelector('time[data-session-time]');
    expect(time?.textContent).toMatch(/^\d{2}:\d{2}$/);
  });

  it('updates the time when a minute rolls over', async () => {
    const { container } = render(() => <TerminalPage />);
    const timeEl = container.querySelector('time[data-session-time]') as HTMLElement;
    const initial = timeEl.textContent;
    vi.setSystemTime(new Date('2026-04-19T14:33:30Z'));
    await vi.advanceTimersByTimeAsync(30_000);
    expect(timeEl.textContent).not.toBe(initial);
    expect(timeEl.textContent).toMatch(/^\d{2}:\d{2}$/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun x vitest run apps/web/src/routes/TerminalPage.test.tsx`
Expected: FAIL — no `time[data-session-time]` element exists yet.

- [ ] **Step 3: Add the live clock signal and `<time>` node**

Edit `apps/web/src/routes/TerminalPage.tsx`. Add `createSignal`, `onCleanup` to the solid-js import line:

```tsx
import { createSignal, onCleanup, onMount } from 'solid-js';
```

Below the existing `SESSION_DATE` constant, add a formatter:

```tsx
function formatClock(d: Date): string {
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}
```

Inside `TerminalPage`, after the existing `createHistory()` call, add the clock signal and tick interval:

```tsx
  const [currentTime, setCurrentTime] = createSignal(formatClock(new Date()));
  onMount(() => {
    const id = setInterval(() => setCurrentTime(formatClock(new Date())), 30_000);
    onCleanup(() => clearInterval(id));
  });
```

In the session bar JSX, replace the existing `<time>` block with a version that has both the date and the new live clock span. Replace:

```tsx
        <time class={styles.sessionDate} datetime={SESSION_DATE}>
          {SESSION_DATE}
        </time>
```

with:

```tsx
        <time class={styles.sessionDate} datetime={SESSION_DATE}>
          {SESSION_DATE}
        </time>
        <time class={styles.sessionTime} data-session-time>
          {currentTime()}
        </time>
```

- [ ] **Step 4: Add the `.sessionTime` CSS rule**

Edit `apps/web/src/routes/TerminalPage.module.css`. Below the existing `.sessionDate` rule, add:

```css
.sessionTime {
  color: var(--text-dim);
  font-variant-numeric: tabular-nums;
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `bun x vitest run apps/web/src/routes/TerminalPage.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 6: Run full test + typecheck**

Run: `bun run test && bun run typecheck`
Expected: all green.

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/routes/TerminalPage.tsx apps/web/src/routes/TerminalPage.module.css apps/web/src/routes/TerminalPage.test.tsx
git commit -m "feat(web): live HH:MM clock in session bar"
```

---

## Task 7: Heartbeat pulse on status dots

**Files:**
- Modify: `apps/web/src/routes/TerminalPage.module.css`
- Modify: `apps/web/src/components/Motd/Motd.module.css`

No unit test — this is a pure CSS animation. `prefers-reduced-motion: reduce` opt-out is mandatory per the design system.

- [ ] **Step 1: Add the keyframes + apply to the session bar dot**

Edit `apps/web/src/routes/TerminalPage.module.css`. Append at the end of the file:

```css
@keyframes session-hrt-pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.55; }
}

.sessionStatus[data-state="ok"] {
  animation: session-hrt-pulse 4s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  .sessionStatus[data-state="ok"] {
    animation: none;
  }
}
```

- [ ] **Step 2: Apply the same pulse to the MOTD `.dot`**

Edit `apps/web/src/components/Motd/Motd.module.css`. Append at the end of the file:

```css
@keyframes motd-ready-pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.55; }
}

.dot {
  animation: motd-ready-pulse 4s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  .dot {
    animation: none;
  }
}
```

(Two separate keyframe names so a future change to one doesn't silently affect the other.)

- [ ] **Step 3: Visual check**

Run: `bun run dev`
Open `http://localhost:5173/`. Expected: both the session bar `●` (right side, after the date/time) and the MOTD `● ready` dot fade gently every ~4s. No magenta, no glow. Stop the dev server.

- [ ] **Step 4: Run full unit suite**

Run: `bun run test`
Expected: all green (CSS changes should not affect unit tests; run to confirm).

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/routes/TerminalPage.module.css apps/web/src/components/Motd/Motd.module.css
git commit -m "style(web): heartbeat pulse on session + MOTD status dots"
```

---

## Task 8: First-paint reveal for compact MOTD

**Files:**
- Modify: `apps/web/src/components/Motd/Motd.module.css`

No unit test — pure CSS animation. Scope it narrowly to the compact path so boot modes keep their own entrance.

- [ ] **Step 1: Add the reveal animation**

Edit `apps/web/src/components/Motd/Motd.module.css`. Append at the end of the file:

```css
@keyframes motd-reveal {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: none; }
}

[data-motd-compact] {
  animation: motd-reveal 300ms ease-out;
}

@media (prefers-reduced-motion: reduce) {
  [data-motd-compact] {
    animation: none;
  }
}
```

- [ ] **Step 2: Visual check**

Run: `bun run dev`
Open `http://localhost:5173/` in a fresh tab (cold boot shows the boot sequence — reload once to hit compact mode). Expected: the MOTD block fades in with a tiny upward slide over ~300ms on compact-mode renders. Boot modes are unchanged. Stop the dev server.

- [ ] **Step 3: Confirm reduced-motion opt-out**

In DevTools: "Emulation → Emulate CSS prefers-reduced-motion: reduce". Reload. Expected: no fade/slide; the MOTD just appears. Stop the dev server.

- [ ] **Step 4: Run full unit suite**

Run: `bun run test`
Expected: all green.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/Motd/Motd.module.css
git commit -m "style(web): fade + slide first-paint reveal on compact MOTD"
```

---

## Task 9: E2E smoke for the command index

**Files:**
- Modify: `apps/web/tests/e2e/smoke.spec.ts`

- [ ] **Step 1: Write the failing test**

Edit `apps/web/tests/e2e/smoke.spec.ts`. Append:

```ts
test('clicking an index row runs the command and updates the URL', async ({ page }) => {
  await page.goto('/');
  // command index is inside the MOTD; on first visit, boot may be running — wait for ready
  const aboutRow = page.getByRole('button', { name: /^about\b/i });
  await expect(aboutRow).toBeVisible();
  await aboutRow.click();
  await expect(page).toHaveURL(/\/about$/);
});

test('command index shows project count', async ({ page }) => {
  await page.goto('/');
  const projectsRow = page.getByRole('button', { name: /^projects\b/i });
  await expect(projectsRow).toBeVisible();
  // visible count cell inside the projects row (data-meta attribute)
  const meta = projectsRow.locator('[data-meta]');
  await expect(meta).toHaveText(/^\d+$/);
});
```

- [ ] **Step 2: Build and run e2e**

Run: `bun run build && bun run prerender && bun run e2e`
Expected: all smoke tests PASS, including the two new ones.

If the `aboutRow.click()` times out because the boot sequence is still streaming characters, change the first `goto('/')` to `await page.goto('/'); await page.keyboard.press('Escape');` to skip the boot animation before the click.

- [ ] **Step 3: Commit**

```bash
git add apps/web/tests/e2e/smoke.spec.ts
git commit -m "test(e2e): cover CommandIndex click + count display"
```

---

## Task 10: Final verification pass

- [ ] **Step 1: Typecheck, lint, unit, build, prerender, e2e — the full CI sequence**

Run these in order (matches `.github/workflows/ci.yml`):

```bash
bun run typecheck
bun run lint
bun run test
bun run build
bun run prerender
bun run e2e
```

Expected: every step exits 0. If `bun run lint` reports formatting, run `bun run format` and re-run `bun run lint`.

- [ ] **Step 2: Manual visual walkthrough**

Run: `bun run dev`. In a fresh private window (to get cold-boot state):

1. Land on `/` — boot sequence streams, then command index + compact line render below.
2. Reload the same tab — compact MOTD fades + slides in, command index visible, both status dots (session bar and MOTD ready) pulse gently.
3. Hover a command row — amber left accent appears, name goes magenta with soft glow.
4. Tab from the skip link through the rows — focus styling matches hover.
5. Click `about` row — URL becomes `/about`, index disappears, about block renders.
6. Type `clear` at the prompt — back to home view, index returns.
7. Check the session bar — live clock shows current HH:MM and matches your system clock within a minute.
8. DevTools → emulate `prefers-reduced-motion: reduce` → reload → no fade, no pulse, clock still ticks.

Stop the dev server.

- [ ] **Step 3: Commit anything left over**

If `bun run format` or typecheck produced staged changes in earlier tasks that weren't committed:

```bash
git status
# inspect, then:
git add <files>
git commit -m "chore(web): format + lint final pass"
```

If `git status` is clean, skip.

- [ ] **Step 4: Merge back to master (if you worked on a branch)**

If you used `feat/motd-interactive`:

```bash
git checkout master
git merge --no-ff feat/motd-interactive
git branch -d feat/motd-interactive
```

If you worked directly on master, nothing to do.

---

## Spec coverage map

| Spec section | Task(s) |
|---|---|
| Layer 1 rows with name/summary/count | 1, 3 |
| Layer 1 clickable, fires onSuggestion | 2 |
| Layer 1 hover/focus styling | 4 |
| Layer 1 embedded in all three MOTD modes | 5 |
| Hint line removed | 5 |
| C1 live clock in session bar | 6 |
| C2 heartbeat on session + MOTD dots | 7 |
| C5 first-paint reveal on compact MOTD | 8 |
| Reduced-motion opt-outs | 4, 7, 8 |
| SSR/hydration safety | 6 (tests with fake timers), 10 (prerender step) |
| Unit tests for CommandIndex | 1, 2, 3 |
| Unit tests for Motd hint-removal + index-presence | 5 |
| Unit tests for live clock | 6 |
| E2E smoke for click + count | 9 |
| CI-equivalent verification | 10 |
