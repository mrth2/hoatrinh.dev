import styles from './LoadingBlock.module.css';

export function LoadingBlock() {
  return (
    <div class={styles.line} role="status" aria-live="polite">
      <span class={styles.text}>Thinking</span>
      <span class={styles.dots} aria-hidden="true">
        <span>.</span>
        <span>.</span>
        <span>.</span>
      </span>
    </div>
  );
}
