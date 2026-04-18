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
        <span class={styles.sessionHost}>hoa@trinh.dev</span>
        <span class={styles.sessionSep}> · session </span>
        <time class={styles.sessionDate} datetime={SESSION_DATE}>
          {SESSION_DATE}
        </time>
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
