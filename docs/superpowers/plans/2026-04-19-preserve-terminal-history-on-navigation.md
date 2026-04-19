# Preserve Terminal History on Navigation - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Navigating between terminal routes (clicking command links, typing commands that change the URL) appends new entries to the existing terminal session instead of wiping and remounting.

**Architecture:** Replace the per-route `<Route>` entries in App.tsx with one `<Route path="/*" component={TerminalPage} />` so Solid Router never remounts TerminalPage on client navigation. TerminalPage drops its `initialCommand` prop and instead uses `useLocation()` to derive the command from the current path, with a `lastPath` ref to prevent double-execution when the user types a command (which also calls `navigate()`).

**Tech Stack:** SolidJS, `@solidjs/router` (`useLocation`, `useNavigate`), Vite SSR, Vitest, Playwright

---

## File Map

| File | Change |
|------|--------|
| `apps/web/src/terminal/path-to-command.ts` | **Create** - pure function mapping URL pathname to terminal command string |
| `apps/web/src/terminal/path-to-command.test.ts` | **Create** - unit tests for pathToCommand |
| `apps/web/src/routes/TerminalPage.tsx` | **Modify** - remove `initialCommand` prop; add `useLocation`, `createEffect`, `navigateAndTrack` |
| `apps/web/src/routes/TerminalPage.test.tsx` | **Modify** - add `useLocation` to the router mock |
| `apps/web/src/App.tsx` | **Modify** - single wildcard route, remove per-route entries and NotFoundPage import |
| `apps/web/tests/e2e/smoke.spec.ts` | **Modify** - add test asserting history survives navigation |

---

## Task 1: `pathToCommand` - pure utility + tests

**Files:**
- Create: `apps/web/src/terminal/path-to-command.ts`
- Create: `apps/web/src/terminal/path-to-command.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `apps/web/src/terminal/path-to-command.test.ts`:

```typescript
import { describe, expect, it } from 'vitest';
import { pathToCommand } from './path-to-command';

describe('pathToCommand', () => {
  it('returns null for root path', () => {
    expect(pathToCommand('/')).toBeNull();
  });

  it('maps /about to "about"', () => {
    expect(pathToCommand('/about')).toBe('about');
  });

  it('maps /projects to "projects"', () => {
    expect(pathToCommand('/projects')).toBe('projects');
  });

  it('maps /project/my-app to "project my-app"', () => {
    expect(pathToCommand('/project/my-app')).toBe('project my-app');
  });

  it('maps unknown /foo to "foo" (execute handles the error)', () => {
    expect(pathToCommand('/foo')).toBe('foo');
  });

  it('maps /experience to "experience"', () => {
    expect(pathToCommand('/experience')).toBe('experience');
  });

  it('maps /skills to "skills"', () => {
    expect(pathToCommand('/skills')).toBe('skills');
  });

  it('maps /contact to "contact"', () => {
    expect(pathToCommand('/contact')).toBe('contact');
  });

  it('maps /help to "help"', () => {
    expect(pathToCommand('/help')).toBe('help');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd apps/web && bun x vitest run src/terminal/path-to-command.test.ts
```

Expected: FAIL with "Cannot find module './path-to-command'"

- [ ] **Step 3: Implement pathToCommand**

Create `apps/web/src/terminal/path-to-command.ts`:

```typescript
export function pathToCommand(pathname: string): string | null {
  if (pathname === '/') return null;
  const stripped = pathname.replace(/^\//, '').replace(/\//g, ' ');
  return stripped || null;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd apps/web && bun x vitest run src/terminal/path-to-command.test.ts
```

Expected: all 9 tests PASS

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/terminal/path-to-command.ts apps/web/src/terminal/path-to-command.test.ts
git commit -m "feat(terminal): add pathToCommand utility"
```

---

## Task 2: Refactor TerminalPage - location-driven execution

**Files:**
- Modify: `apps/web/src/routes/TerminalPage.tsx`
- Modify: `apps/web/src/routes/TerminalPage.test.tsx`

### Background

Currently `TerminalPage` accepts `initialCommand?: string` and runs it synchronously at component setup. We're replacing this with:
1. `useLocation()` to get the current pathname
2. A `lastPath` mutable ref (plain object, not a signal) to track which path we've already executed
3. Synchronous initial execution derived from `pathToCommand(location.pathname)` (keeps SSR working)
4. A `createEffect` that executes the command for new paths (client-side navigation)
5. A `navigateAndTrack` wrapper that updates `lastPath.current` BEFORE calling `navigate()`, so the effect skips execution when we caused the navigation ourselves (i.e. from typed commands)

`lastPath` must be updated BEFORE `navigate()` is called because `@solidjs/router`'s `navigate()` synchronously updates an internal location signal, which immediately schedules the `createEffect` to re-run. If `lastPath` isn't already updated, the effect would execute the command a second time.

- [ ] **Step 1: Update the router mock in TerminalPage.test.tsx**

Open `apps/web/src/routes/TerminalPage.test.tsx` and change the mock at the top from:

```typescript
vi.mock('@solidjs/router', () => ({
  useNavigate: () => () => {},
}));
```

to:

```typescript
vi.mock('@solidjs/router', () => ({
  useNavigate: () => () => {},
  useLocation: () => ({ pathname: '/' }),
}));
```

- [ ] **Step 2: Run existing TerminalPage tests to confirm they still pass with updated mock**

```bash
cd apps/web && bun x vitest run src/routes/TerminalPage.test.tsx
```

Expected: 2 tests PASS (the existing clock tests)

- [ ] **Step 3: Rewrite TerminalPage.tsx**

Replace the entire contents of `apps/web/src/routes/TerminalPage.tsx` with:

```typescript
import { getProjects } from '@hoatrinh/content';
import { useLocation, useNavigate } from '@solidjs/router';
import { createEffect, createSignal, onCleanup, onMount } from 'solid-js';
import { EntryList } from '@/components/EntryList/EntryList';
import { Motd } from '@/components/Motd/Motd';
import { Prompt } from '@/components/Prompt/Prompt';
import { autocomplete } from '@/terminal/autocomplete';
import { registry } from '@/terminal/commands';
import { execute } from '@/terminal/execute';
import { createHistory } from '@/terminal/history';
import { pathToCommand } from '@/terminal/path-to-command';
import { createTerminalStore } from '@/terminal/store';
import styles from './TerminalPage.module.css';

const PROJECT_SLUGS = getProjects().map((p) => p.slug);
const NOOP_NAVIGATE = () => {};
const SESSION_DATE = new Date().toISOString().slice(0, 10);

function formatClock(d: Date): string {
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export function TerminalPage() {
  const [state, setState] = createTerminalStore();
  const navigate = useNavigate();
  const location = useLocation();
  const history = createHistory();

  const [currentTime, setCurrentTime] = createSignal(formatClock(new Date()));
  onMount(() => {
    const id = setInterval(() => setCurrentTime(formatClock(new Date())), 30_000);
    onCleanup(() => clearInterval(id));
  });

  // Run synchronously at setup (not onMount) so SSR includes the rendered entries
  // and client hydration matches. We are already at this URL, so suppress
  // execute's navigate side effect.
  const initialCmd = pathToCommand(location.pathname);
  if (initialCmd) {
    void execute(initialCmd, { state, setState, registry, navigate: NOOP_NAVIGATE });
  }

  // lastPath tracks the pathname we most recently executed a command for.
  // Initialized to current pathname so the initial createEffect run is skipped
  // (initial execution already happened above, synchronously).
  const lastPath = { current: location.pathname };

  // React to client-side navigation. When the URL changes (e.g. user clicks a
  // link), derive and execute the corresponding command, appending to existing
  // entries. Skip when we caused the navigation ourselves (submit calls
  // navigateAndTrack which updates lastPath.current before calling navigate).
  createEffect(() => {
    const path = location.pathname;
    if (path === lastPath.current) return;
    lastPath.current = path;
    const cmd = pathToCommand(path);
    if (cmd) void execute(cmd, { state, setState, registry, navigate: NOOP_NAVIGATE });
  });

  function focusInput() {
    document.getElementById('terminal-input')?.focus();
  }

  onMount(() => {
    if (matchMedia('(pointer: fine)').matches) focusInput();
  });

  // Update lastPath before navigating so the createEffect skips the navigation
  // we just caused (the typed command already ran; we don't want it to run again
  // from the URL change).
  function navigateAndTrack(path: string) {
    lastPath.current = path;
    navigate(path);
  }

  async function submit(raw: string) {
    const trimmed = raw.trim();
    if (trimmed) history.push(trimmed);
    setState('currentInput', '');
    history.reset();
    await execute(raw, { state, setState, registry, navigate: navigateAndTrack });
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

  const isErrored = () => {
    if (state.currentInput !== '') return false;
    const last = state.entries[state.entries.length - 1];
    return last?.kind === 'error';
  };

  return (
    <main class={styles.page}>
      <a class="skip-link" href="#terminal-input">
        Skip to prompt
      </a>
      <section class={styles.sessionBar} aria-label="Session">
        <a href="/" class={styles.sessionHost}>
          hi@hoatrinh.dev
        </a>
        <span class={styles.sessionSep}> · session </span>
        <time class={styles.sessionDate} datetime={SESSION_DATE}>
          {SESSION_DATE}
        </time>
        <time class={styles.sessionTime} data-session-time="">
          {currentTime()}
        </time>
        <span
          role="img"
          class={styles.sessionStatus}
          data-state={isErrored() ? 'error' : state.isExecuting ? 'pending' : 'ok'}
          aria-label={
            isErrored() ? 'last command errored' : state.isExecuting ? 'executing' : 'ready'
          }
        >
          ●
        </span>
        <span class={styles.sessionHelp}>type 'help' for commands</span>
      </section>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: click-to-focus is a pointer-only enhancement; keyboard users tab to #terminal-input directly */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: keyboard users reach the input via Tab; this click handler is an enhancement */}
      <div class={styles.scroll} onClick={onListClick}>
        {state.entries.length === 0 && <Motd onSuggestion={onSuggestion} />}
        <EntryList entries={state.entries} onSuggestion={onSuggestion} />
      </div>
      <Prompt
        value={state.currentInput}
        errored={isErrored()}
        onInput={(v) => setState('currentInput', v)}
        onSubmit={submit}
        onHistory={onHistory}
        onTab={onTab}
      />
    </main>
  );
}
```

- [ ] **Step 4: Run typecheck to catch any type errors**

```bash
cd /path/to/repo && bun run typecheck
```

Expected: no errors

- [ ] **Step 5: Run unit tests**

```bash
cd apps/web && bun x vitest run src/routes/TerminalPage.test.tsx
```

Expected: 2 tests PASS

- [ ] **Step 6: Run full unit test suite**

```bash
bun run test:unit
```

Expected: all tests PASS

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/routes/TerminalPage.tsx apps/web/src/routes/TerminalPage.test.tsx
git commit -m "feat(web): drive TerminalPage from URL location instead of initialCommand prop"
```

---

## Task 3: Simplify App.tsx to single wildcard route

**Files:**
- Modify: `apps/web/src/App.tsx`

### Background

With TerminalPage no longer accepting `initialCommand`, all routes can be collapsed to one wildcard. Solid Router will keep the same TerminalPage instance alive across all client-side navigations because the route pattern `/*` always matches. The `NotFoundPage` route is removed; unknown paths map to unknown commands which produce a "Command not found" error entry (correct terminal UX).

- [ ] **Step 1: Rewrite App.tsx**

Replace the entire contents of `apps/web/src/App.tsx` with:

```typescript
import { Route, Router } from '@solidjs/router';
import { TerminalPage } from './routes/TerminalPage';

export function App(props: { url?: string }) {
  return (
    <Router {...(props.url !== undefined ? { url: props.url } : {})}>
      <Route path="/*" component={TerminalPage} />
    </Router>
  );
}
```

- [ ] **Step 2: Run typecheck**

```bash
bun run typecheck
```

Expected: no errors

- [ ] **Step 3: Run unit tests**

```bash
bun run test:unit
```

Expected: all tests PASS

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/App.tsx
git commit -m "refactor(web): collapse routes to single wildcard - TerminalPage never remounts"
```

---

## Task 4: E2E test for history preservation + verify full pipeline

**Files:**
- Modify: `apps/web/tests/e2e/smoke.spec.ts`

### Background

Add a Playwright test that catches the regression: before this change, typing `help` then `about` would show only 1 entry (the about entry from the remounted page). After this change, both entries are present, so `[data-variant]` count is 2.

- [ ] **Step 1: Write the failing e2e test**

Add the following test to `apps/web/tests/e2e/smoke.spec.ts` (append after the last test):

```typescript
test('navigation preserves previous terminal entries', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Escape'); // skip boot animation

  const input = page.locator('#terminal-input');

  // Run first command - this navigates URL to /help
  await input.fill('help');
  await input.press('Enter');
  await expect(page).toHaveURL(/\/help$/);

  // Run second command - this navigates URL to /about
  await input.fill('about');
  await input.press('Enter');
  await expect(page).toHaveURL(/\/about$/);

  // Both entries must be in the DOM - history was preserved across navigation
  await expect(page.locator('[data-variant]')).toHaveCount(2);
});
```

- [ ] **Step 2: Build and prerender (required before e2e)**

```bash
bun run build && bun run prerender
```

Expected: build completes, `apps/web/dist/` populated with static HTML for each route

- [ ] **Step 3: Run only the new e2e test to verify it fails before fix**

Skip this step if you are implementing tasks in order (the fix is already applied). If you want to confirm the test catches the regression, temporarily revert App.tsx and TerminalPage.tsx, run the test, then re-apply.

- [ ] **Step 4: Run full e2e suite**

```bash
bun run e2e
```

Expected: all tests PASS, including the new `navigation preserves previous terminal entries` test

- [ ] **Step 5: Commit**

```bash
git add apps/web/tests/e2e/smoke.spec.ts
git commit -m "test(e2e): assert terminal history survives client-side navigation"
```

---

## Self-Review

**Spec coverage:**

| Spec requirement | Covered by |
|-----------------|------------|
| Terminal entries accumulate across navigation | Task 2 (createEffect appends, no remount) |
| URL updates in address bar | Task 2 (navigateAndTrack calls navigate()) |
| Single wildcard route | Task 3 |
| pathToCommand mapping | Task 1 |
| SSR/hydration not broken | Task 2 (synchronous initial execution preserved) |
| Double-run prevention (typed commands) | Task 2 (navigateAndTrack updates lastPath first) |
| Hydration skip (no double-run on mount) | Task 2 (lastPath initialized to current pathname) |
| E2E regression test | Task 4 |

All spec requirements covered. No gaps.

**Placeholder scan:** None found. All steps contain complete code.

**Type consistency:**
- `pathToCommand` returns `string | null` and is called with `null` check before passing to `execute` in both initial setup and `createEffect` - consistent.
- `navigateAndTrack` has signature `(path: string) => void` matching `ExecuteContext.navigate` type.
- `lastPath` is `{ current: string }` throughout - consistent.
