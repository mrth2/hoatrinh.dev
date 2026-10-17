import { getBlogPosts, getProfile, getProjects } from '@hoatrinh/content';
import { useLocation, useNavigate } from '@solidjs/router';
import { createEffect, createMemo, createSignal, onCleanup, onMount, Show } from 'solid-js';
import { EntryList } from '@/components/EntryList/EntryList';
import { Motd } from '@/components/Motd/Motd';
import { Prompt } from '@/components/Prompt/Prompt';
import { autocomplete, suggest } from '@/terminal/autocomplete';
import { registry } from '@/terminal/commands';
import { execute } from '@/terminal/execute';
import { createHistory } from '@/terminal/history';
import { pathToCommand } from '@/terminal/path-to-command';
import { createTerminalStore } from '@/terminal/store';
import styles from './TerminalPage.module.css';

const PROJECT_SLUGS = getProjects().map((p) => p.slug);
const BLOG_SLUGS = getBlogPosts().map((p) => p.slug);
const CANONICAL_NAMES = registry.specs.map((s) => s.name);
const NOOP_NAVIGATE = () => {};
const PROFILE = getProfile();
// These blocks render their own h1.
const SELF_TITLED_COMMANDS = new Set(['about', 'project', 'post']);
const SESSION_DATE = new Date().toISOString().slice(0, 10);
const CAN_AUTO_FOCUS =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(hover: hover) and (pointer: fine)').matches === true;

function pageHeading(pathname: string): string | undefined {
  if (pathname === '/') return `${PROFILE.name} - ${PROFILE.role}`;
  const name = pathToCommand(pathname)?.split(' ')[0];
  if (!name || SELF_TITLED_COMMANDS.has(name) || !CANONICAL_NAMES.includes(name)) return undefined;
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} - ${PROFILE.name}`;
}

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
  let scrollEl: HTMLDivElement | undefined;

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

  // After each new entry, scroll it into view. requestAnimationFrame ensures
  // this runs after the router's own scroll restoration so we always win.
  createEffect(() => {
    const len = state.entries.length;
    if (len === 0) return;
    requestAnimationFrame(() => {
      const panels = scrollEl?.querySelectorAll('[data-variant]');
      const last = panels?.[panels.length - 1] as HTMLElement | undefined;
      last?.scrollIntoView({ block: 'start', behavior: 'instant' });
    });
  });

  function focusInput() {
    document.getElementById('terminal-input')?.focus();
  }

  onMount(() => {
    if (CAN_AUTO_FOCUS) focusInput();
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
    requestAnimationFrame(focusInput);
  }

  function onHistory(dir: 'up' | 'down') {
    if (history.cursor() < 0 && dir === 'up') return history.startNavigation(state.currentInput);
    return dir === 'up' ? history.navigateUp() : history.navigateDown();
  }

  function onTab(raw: string) {
    return autocomplete(raw, {
      commands: registry.vocab,
      projectSlugs: PROJECT_SLUGS,
      postSlugs: BLOG_SLUGS,
    });
  }

  const ghostSuggestion = createMemo(
    () =>
      suggest(state.currentInput, {
        canonicalNames: CANONICAL_NAMES,
        allNames: registry.vocab,
        projectSlugs: PROJECT_SLUGS,
        postSlugs: BLOG_SLUGS,
      }) ?? undefined,
  );

  function onSuggestion(s: string) {
    setState('currentInput', s);
    if (!s.endsWith(' ')) submit(s);
  }

  function onListClick(e: MouseEvent) {
    if (!CAN_AUTO_FOCUS) return;
    const selection = window.getSelection();
    if (selection?.toString()) return;
    if ((e.target as HTMLElement).closest('a, button')) return;
    focusInput();
  }

  const heading = createMemo(() => pageHeading(location.pathname));

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
      <Show when={heading()}>{(text) => <h1 class="sr-only">{text()}</h1>}</Show>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: click-to-focus is a pointer-only enhancement; keyboard users tab to #terminal-input directly */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: keyboard users reach the input via Tab; this click handler is an enhancement */}
      <div ref={scrollEl} class={styles.scroll} onClick={onListClick}>
        <Motd onSuggestion={onSuggestion} />
        <EntryList entries={state.entries} onSuggestion={onSuggestion} />
      </div>
      <Prompt
        value={state.currentInput}
        {...(ghostSuggestion() !== undefined ? { ghost: ghostSuggestion() as string } : {})}
        errored={isErrored()}
        onInput={(v) => setState('currentInput', v)}
        executing={state.isExecuting}
        onSubmit={submit}
        onHistory={onHistory}
        onTab={onTab}
      />
    </main>
  );
}
