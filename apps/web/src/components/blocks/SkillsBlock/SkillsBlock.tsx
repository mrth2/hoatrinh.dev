import type { SkillGroup } from '@hoatrinh/content';
import styles from './SkillsBlock.module.css';

export function SkillsBlock(props: { data: SkillGroup[] }) {
  return (
    <section class={styles.root}>
      {props.data.map((g) => (
        <div class={styles.group}>
          <h2 class={styles.label}>{g.label}</h2>
          <ul class={styles.items}>
            {g.items.map((i) => <li>{i}</li>)}
          </ul>
        </div>
      ))}
    </section>
  );
}
