import { onMount } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { createHistory } from '@/terminal/history';
import { execute } from '@/terminal/execute';
import { registry } from '@/terminal/commands';
import { autocomplete } from '@/terminal/autocomplete';
import { createTerminalStore } from '@/terminal/store';
import { EntryList } from '@/components/EntryList/EntryList';
import { Prompt } from '@/components/Prompt/Prompt';
import { getProjects } from '@hoatrinh/content';
import styles from './TerminalPage.module.css';

export function TerminalPage(props: { initialCommand?: string }) {
  const [state, setState] = createTerminalStore();
  const navigate = useNavigate();
  const history = createHistory();

  onMount(async () => {
    if (props.initialCommand) {
      await execute(props.initialCommand, { state, setState, registry, navigate: () => {} });
    }
    if (matchMedia('(pointer: fine)').matches) {
      document.getElementById('terminal-input')?.focus();
    }
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
      projectSlugs: getProjects().map((p) => p.slug),
    });
  }

  function onSuggestion(s: string) {
    setState('currentInput', s);
    submit(s);
  }

  function onListClick(e: MouseEvent) {
    const selection = window.getSelection();
    if (selection && selection.toString()) return;
    if ((e.target as HTMLElement).closest('a, button')) return;
    document.getElementById('terminal-input')?.focus();
  }

  return (
    <main class={styles.page}>
      <a class="skip-link" href="#terminal-input">Skip to prompt</a>
      <div class={styles.scroll} onClick={onListClick}>
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
