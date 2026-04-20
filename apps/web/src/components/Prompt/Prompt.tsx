import { createSignal } from 'solid-js';
import styles from './Prompt.module.css';

export type HistoryDirection = 'up' | 'down';
export type TabAction = { completion: string | null; candidates: string[] };

export function Prompt(props: {
  value: string;
  ghost?: string;
  sigil?: string;
  errored?: boolean;
  executing?: boolean;
  onInput: (v: string) => void;
  onSubmit: (raw: string) => void;
  onHistory: (dir: HistoryDirection) => string | null;
  onTab: (raw: string) => TabAction | null;
}) {
  const [announce, setAnnounce] = createSignal<string>('');
  const [focused, setFocused] = createSignal(false);
  const [suppressGhost, setSuppressGhost] = createSignal(false);

  const ghostSuffix = () => {
    const g = props.ghost;
    if (!g || suppressGhost()) return null;
    const suffix = g.slice(props.value.length);
    return suffix.length > 0 ? suffix : null;
  };

  function acceptGhost() {
    const g = props.ghost;
    if (g) {
      setSuppressGhost(false);
      props.onInput(g);
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const next = props.onHistory('up');
      if (next !== null) props.onInput(next);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = props.onHistory('down');
      if (next !== null) props.onInput(next);
    } else if (e.key === 'ArrowRight') {
      const input = e.currentTarget as HTMLInputElement;
      if (ghostSuffix() !== null && input.selectionStart === props.value.length) {
        e.preventDefault();
        acceptGhost();
      }
    } else if (e.key === 'Escape') {
      if (ghostSuffix() !== null) {
        e.preventDefault();
        setSuppressGhost(true);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (ghostSuffix() !== null) {
        acceptGhost();
        return;
      }
      const result = props.onTab(props.value);
      if (!result) return;
      if (result.completion) {
        props.onInput(result.completion);
      } else if (result.candidates.length > 0) {
        setAnnounce(`Matches: ${result.candidates.join(', ')}`);
      }
    } else if (e.key === 'Enter' && !e.isComposing) {
      e.preventDefault();
      if (props.executing) return;
      props.onSubmit(props.value);
    }
  }

  const showHint = () => focused() && props.value === '' && !props.executing;

  return (
    <div
      class={styles.prompt}
      data-testid="prompt-shell"
      {...(props.errored ? { 'data-errored': 'true' } : {})}
    >
      <label for="terminal-input" class="sr-only">
        Terminal prompt, type a command
      </label>
      <span class={styles.sigil} aria-hidden="true">
        {props.sigil ?? 'hi@hoatrinh.dev ~ %'}
      </span>
      <div class={styles.inputWrap}>
        {ghostSuffix() !== null && (
          <span class={styles.ghost} aria-hidden="true">
            <span class={styles.ghostTyped}>{props.value}</span>
            <span class={styles.ghostSuffix}>{ghostSuffix()}</span>
          </span>
        )}
        <input
          id="terminal-input"
          class={styles.input}
          type="text"
          value={props.value}
          autocomplete="off"
          autocorrect="off"
          autocapitalize="none"
          spellcheck={false}
          disabled={props.executing}
          enterkeyhint="go"
          inputmode="text"
          aria-describedby="prompt-announce"
          onInput={(e) => {
            setSuppressGhost(false);
            props.onInput(e.currentTarget.value);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </div>
      {showHint() && (
        <span class={styles.hint} aria-hidden="true">
          ↵ run · ↑↓ history · ⇥ complete
        </span>
      )}
      {props.executing && (
        <span class={styles.hint} aria-hidden="true">
          waiting for response…
        </span>
      )}
      <span id="prompt-announce" class="sr-only" aria-live="polite">
        {announce()}
      </span>
    </div>
  );
}
