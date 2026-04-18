import { For } from 'solid-js';
import type { Project } from '@hoatrinh/content';
import styles from './ProjectsBlock.module.css';

export function ProjectsBlock(props: { data: Project[] }) {
  return (
    <ul class={styles.list}>
      <For each={props.data}>
        {(p) => (
          <li class={styles.row}>
            <a class={styles.slug} href={`/project/${p.slug}`}>{p.slug}</a>
            <span class={styles.title}>{p.title}</span>
            <span class={styles.year}>{p.year}</span>
            <span class={styles.tagline}>{p.tagline}</span>
          </li>
        )}
      </For>
    </ul>
  );
}
