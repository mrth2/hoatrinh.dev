import styles from './TextBlock.module.css';

export function TextBlock(props: { lines: string[] }) {
  return (
    <div class={styles.root}>
      {props.lines.map((l) => <p>{l}</p>)}
    </div>
  );
}
