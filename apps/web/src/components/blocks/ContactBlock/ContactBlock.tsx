import type { Link } from '@hoatrinh/content';
import { For } from 'solid-js';
import styles from './ContactBlock.module.css';

export function ContactBlock(props: { data: Link[] }) {
  return (
    <ul class={styles.list}>
      <For each={props.data}>
        {(l) => (
          <li class={styles.row}>
            <span class={styles.label}>{l.label}</span>
            <a class={styles.link} href={l.href}>
              {l.href}
            </a>
          </li>
        )}
      </For>
    </ul>
  );
}
