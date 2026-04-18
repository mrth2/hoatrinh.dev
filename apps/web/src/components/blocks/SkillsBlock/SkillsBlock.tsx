import type { SkillGroup } from '@hoatrinh/content';
import { For } from 'solid-js';
import styles from './SkillsBlock.module.css';

export function SkillsBlock(props: { data: SkillGroup[] }) {
  return (
    <section class={styles.root}>
      <For each={props.data}>
        {(g) => (
          <div class={styles.group}>
            <h2 class={styles.label}>{g.label}</h2>
            <ul class={styles.items}>
              <For each={g.items}>{(i) => <li>{i}</li>}</For>
            </ul>
          </div>
        )}
      </For>
    </section>
  );
}
