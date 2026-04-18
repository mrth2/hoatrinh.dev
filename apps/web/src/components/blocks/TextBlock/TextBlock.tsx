import { For } from 'solid-js';
import styles from './TextBlock.module.css';

export function TextBlock(props: { lines: string[] }) {
  return <For each={props.lines}>{(l) => <p class={styles.line}>{l}</p>}</For>;
}
