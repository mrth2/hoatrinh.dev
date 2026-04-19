import { getExperience, getProjects, getSkills } from '@hoatrinh/content';
import { For } from 'solid-js';
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
  // Exclude `clear` (terminal-only action) and any command that needs positional
  // args (argsHint set) — those can't be invoked from a zero-arg click.
  return commandSpecs
    .filter((s) => s.name !== 'clear' && s.argsHint === undefined)
    .map((s) => {
      const count = counts[s.name];
      return count !== undefined
        ? { name: s.name, summary: s.summary, count }
        : { name: s.name, summary: s.summary };
    });
}

export function CommandIndex(props: { onSuggestion: (cmd: string) => void }) {
  const rows = buildRows();
  return (
    <nav class={styles.wrapper} aria-label="Command index">
      <div class={styles.header}>
        <span class={styles.headerLabel}>── commands</span>
        <span class={styles.headerLine} aria-hidden="true" />
        <span class={styles.headerCount}>{rows.length} total</span>
      </div>
      <ul class={styles.list}>
        <For each={rows}>
          {(row) => (
            <li>
              <button type="button" class={styles.row} onClick={() => props.onSuggestion(row.name)}>
                <span class={styles.name}>{row.name}</span>{' '}
                <span class={styles.summary}>{row.summary}</span>
                <span class={styles.meta} data-meta>
                  {row.count ?? ''}
                </span>
              </button>
            </li>
          )}
        </For>
      </ul>
    </nav>
  );
}
