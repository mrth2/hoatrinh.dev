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
      <label for="terminal-input" class="sr-only">
        Terminal prompt, type a command
      </label>
      <span class={styles.sigil} aria-hidden="true">
        {props.sigil ?? 'hi@hoatrinh.dev ~ %'}
      </span>
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
        <span class={styles.hint} aria-hidden="true">
          ↵ run · ↑↓ history · ⇥ complete
        </span>
      )}
      <span id="prompt-announce" class="sr-only" aria-live="polite">
        {announce()}
      </span>
    </form>
  );
}
