import type { Experience } from '@hoatrinh/content';
import styles from './ExperienceBlock.module.css';

function formatDates(start: string, end: string | 'present'): string {
  return `${start} – ${end}`;
}

export function ExperienceBlock(props: { data: Experience[] }) {
  return (
    <ol class={styles.list}>
      {props.data.map((e) => (
        <li class={styles.role}>
          <div class={styles.head}>
            <span class={styles.company}>{e.company}</span>
            <span class={styles.sep}>·</span>
            <span class={styles.title}>{e.title}</span>
            <span class={styles.dates}>{formatDates(e.start, e.end)}</span>
          </div>
          {e.location && <div class={styles.location}>{e.location}</div>}
          {e.highlights.length > 0 && (
            <ul class={styles.highlights}>
              {e.highlights.map((h) => <li>{h}</li>)}
            </ul>
          )}
        </li>
      ))}
    </ol>
  );
}
