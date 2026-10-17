import { getExperience, getProjects, getSkills } from '@hoatrinh/content';
import { For } from 'solid-js';
import { specs as commandSpecs } from '@/terminal/commands';
import styles from './CommandIndex.module.css';

type Row = {
  name: string;
  command: string;
  summary: string;
  count?: number;
  href?: string;
};

function buildRows(): Row[] {
  const counts: Record<string, number | undefined> = {
    projects: getProjects().length,
    experience: getExperience().length,
    skills: getSkills().reduce((n, g) => n + g.items.length, 0),
  };
  // Exclude `clear` (terminal-only action). Include `/ask` as a draft-only entry.
  return commandSpecs
    .filter((s) => s.name !== 'clear' && (s.argsHint === undefined || s.name === '/ask'))
    .map((s) => {
      const count = counts[s.name];
      const command = s.name === '/ask' ? '/ask ' : s.name;
      const name = s.name === '/ask' ? '/ask <question>' : s.name;
      return {
        name,
        command,
        summary: s.summary,
        ...(count !== undefined ? { count } : {}),
        ...(typeof s.route === 'string' ? { href: s.route } : {}),
      };
    });
}

function isPlainClick(e: MouseEvent): boolean {
  return e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
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
          {(row) => {
            const content = (
              <>
                <span class={styles.name}>{row.name}</span>{' '}
                <span class={styles.summary}>{row.summary}</span>
                <span class={styles.meta} data-meta>
                  {row.count ?? ''}
                </span>
              </>
            );
            return (
              <li>
                {row.href !== undefined ? (
                  // Real hrefs keep the pages crawlable; a plain click still runs the command in place.
                  <a
                    class={styles.row}
                    href={row.href}
                    onClick={(e) => {
                      if (!isPlainClick(e)) return;
                      e.preventDefault();
                      props.onSuggestion(row.command);
                    }}
                  >
                    {content}
                  </a>
                ) : (
                  <button
                    type="button"
                    class={styles.row}
                    onClick={() => props.onSuggestion(row.command)}
                  >
                    {content}
                  </button>
                )}
              </li>
            );
          }}
        </For>
      </ul>
    </nav>
  );
}
