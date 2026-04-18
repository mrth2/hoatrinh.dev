import type { Link } from '@hoatrinh/content';
import styles from './ContactBlock.module.css';

export function ContactBlock(props: { data: Link[] }) {
  return (
    <ul class={styles.list}>
      {props.data.map((l) => (
        <li class={styles.row}>
          <span class={styles.label}>{l.label}</span>
          <a class={styles.link} href={l.href}>{l.href}</a>
        </li>
      ))}
    </ul>
  );
}
