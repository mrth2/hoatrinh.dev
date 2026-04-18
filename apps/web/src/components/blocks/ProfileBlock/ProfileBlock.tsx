import type { Profile } from '@hoatrinh/content';
import { For } from 'solid-js';
import styles from './ProfileBlock.module.css';

export function ProfileBlock(props: { data: Profile }) {
  return (
    <>
      <h1 class={styles.name}>{props.data.name}</h1>
      <p class={styles.role}>
        {props.data.role} · {props.data.location}
      </p>
      <div class={styles.body} innerHTML={props.data.bodyHtml} />
      <ul class={styles.links}>
        <For each={props.data.links}>
          {(l) => (
            <li>
              <a href={l.href}>{l.label}</a>
            </li>
          )}
        </For>
      </ul>
    </>
  );
}
