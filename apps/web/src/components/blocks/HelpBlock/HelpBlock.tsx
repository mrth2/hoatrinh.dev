import { For } from 'solid-js';
import styles from './HelpBlock.module.css';
import type { HelpEntry } from '@/terminal/entries';

export function HelpBlock(props: { data: HelpEntry['data'] }) {
  return (
    <section class={styles.root}>
      <p class={styles.hint}>Type a command and press Enter. Tab completes. Up/Down scroll history.</p>
      <table class={styles.table}>
        <tbody>
          <For each={props.data.commands}>
            {(c) => (
              <tr>
                <td class={styles.usage}>{c.usage}</td>
                <td class={styles.summary}>{c.summary}</td>
              </tr>
            )}
          </For>
        </tbody>
      </table>
      <p class={styles.footer}>built with solid, vite, bun, typescript</p>
    </section>
  );
}
