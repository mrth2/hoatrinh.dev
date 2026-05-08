import { For, Show } from 'solid-js';
import type { BlogListEntry } from '@/terminal/entries';
import styles from './BlogListBlock.module.css';

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function BlogListBlock(props: { data: BlogListEntry['data'] }) {
  const isStale = () => todayISO() > props.data.cadence.nextBy;
  return (
    <div class={styles.root}>
      <div class={styles.cadence}>
        <span class={styles.cadenceItem}>
          <span class={styles.cadenceLabel}>cadence:</span>
          <span class={styles.cadenceValue}>weekly</span>
        </span>
        <span class={styles.cadenceItem}>
          <span class={styles.cadenceLabel}>posts:</span>
          <span class={styles.cadenceValue}>{props.data.cadence.postCount}</span>
        </span>
        <Show when={props.data.cadence.latestDate !== ''}>
          <span class={styles.cadenceItem}>
            <span class={styles.cadenceLabel}>last:</span>
            <span class={styles.cadenceValue}>{props.data.cadence.latestDate}</span>
          </span>
        </Show>
        <span class={styles.cadenceItem}>
          <span class={styles.cadenceLabel}>next by:</span>
          <span class={isStale() ? styles.cadenceValueStale : styles.cadenceValue}>
            {props.data.cadence.nextBy}
          </span>
        </span>
      </div>
      <Show
        when={props.data.posts.length > 0}
        fallback={<p class={styles.empty}>no posts yet - check back soon.</p>}
      >
        <ul class={styles.list}>
          <For each={props.data.posts}>
            {(p) => (
              <li class={styles.row}>
                <span class={styles.rowMeta}>
                  {p.date} · {p.readingTime} min · {p.tag}
                </span>
                <a class={styles.rowTitle} href={`/post/${p.slug}`}>
                  {p.title}
                </a>
                <span class={styles.rowExcerpt}>{p.excerpt}</span>
              </li>
            )}
          </For>
        </ul>
      </Show>
    </div>
  );
}
