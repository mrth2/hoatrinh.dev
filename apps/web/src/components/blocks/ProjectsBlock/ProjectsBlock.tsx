import type { Project } from '@hoatrinh/content';
import styles from './ProjectsBlock.module.css';

export function ProjectsBlock(props: { data: Project[] }) {
  return (
    <section class={styles.root}>
      <p class={styles.count}>{props.data.length} project{props.data.length === 1 ? '' : 's'} found.</p>
      <ul class={styles.list}>
        {props.data.map((p) => (
          <li class={styles.row}>
            <a class={styles.slug} href={`/project/${p.slug}`}>{p.slug}</a>
            <span class={styles.title}>{p.title}</span>
            <span class={styles.year}>{p.year}</span>
            <span class={styles.tagline}>{p.tagline}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
