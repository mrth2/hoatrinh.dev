import styles from './InputEcho.module.css';

export function InputEcho(props: { text: string }) {
  return (
    <div class={styles.echo}>
      <span class={styles.sigil} aria-hidden="true">&gt;</span>
      <span class={styles.text}>{props.text}</span>
    </div>
  );
}
