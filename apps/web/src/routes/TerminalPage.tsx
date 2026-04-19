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
