import styles from './Motd.module.css';

export function Motd(props: { onSuggestion: (cmd: string) => void }) {
  return (
    <section class={styles.motd} aria-label="Welcome message">
      <p class={styles.name}>hoa trinh hai</p>
      <p class={styles.role}>senior software engineer · vietnam</p>
      <p class={styles.hint}>
        type{' '}
        <button type="button" class={styles.cmd} onClick={() => props.onSuggestion('help')}>
          help
        </button>{' '}
        to see commands, or try{' '}
        <button type="button" class={styles.cmd} onClick={() => props.onSuggestion('about')}>
          about
        </button>
      </p>
    </section>
  );
}
