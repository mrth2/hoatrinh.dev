import { For } from 'solid-js';
import styles from './TextBlock.module.css';

export function TextBlock(props: { lines: string[] }) {
  return (
    <div class={styles.root}>
      <For each={props.lines}>{(l) => <p>{l}</p>}</For>
    </div>
  );
}
