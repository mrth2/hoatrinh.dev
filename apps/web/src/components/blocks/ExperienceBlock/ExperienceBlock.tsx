import type { Experience } from '@hoatrinh/content';
import { For } from 'solid-js';
import styles from './ExperienceBlock.module.css';

export function ExperienceBlock(props: { data: Experience[] }) {
  return (
    <ol class={styles.list}>
      <For each={props.data}>
        {(e) => (
          <li class={styles.role}>
            <div class={styles.head}>
              <span class={styles.company}>{e.company}</span>
              <span class={styles.sep}>·</span>
              <span class={styles.title}>{e.title}</span>
              <span class={styles.dates}>
                {e.start} - {e.end}
              </span>
            </div>
            {e.location && <div class={styles.location}>{e.location}</div>}
            {e.highlights.length > 0 && (
              <ul class={styles.highlights}>
                <For each={e.highlights}>{(h) => <li>{h}</li>}</For>
              </ul>
            )}
          </li>
        )}
      </For>
    </ol>
  );
}
