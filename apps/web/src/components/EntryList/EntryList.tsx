import { For } from 'solid-js';
import type { TerminalEntry } from '@/terminal/entries';
import { EntryRenderer } from '../EntryRenderer/EntryRenderer';
import styles from './EntryList.module.css';

export function EntryList(props: { entries: TerminalEntry[]; onSuggestion?: (s: string) => void }) {
  return (
    <section
      role="log"
      aria-live="polite"
      aria-atomic="false"
      aria-label="Terminal output"
      class={styles.list}
    >
      <For each={props.entries}>
        {(entry) => <EntryRenderer entry={entry} onSuggestion={props.onSuggestion} />}
      </For>
    </section>
  );
}
