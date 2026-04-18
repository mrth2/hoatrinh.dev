import type { Profile } from '@hoatrinh/content';
import styles from './ProfileBlock.module.css';

export function ProfileBlock(props: { data: Profile }) {
  return (
    <section class={styles.root}>
      <header class={styles.header}>
        <h1 class={styles.name}>{props.data.name}</h1>
        <p class={styles.role}>{props.data.role} · {props.data.location}</p>
      </header>
      <div class={styles.body} innerHTML={props.data.bodyHtml} />
      <ul class={styles.links}>
        {props.data.links.map((l) => (
          <li><a href={l.href}>{l.label}</a></li>
        ))}
      </ul>
    </section>
  );
}
