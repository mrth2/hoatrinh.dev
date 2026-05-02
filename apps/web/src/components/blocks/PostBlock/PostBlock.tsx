import type { PostEntry } from '@/terminal/entries';
import styles from './PostBlock.module.css';

export function PostBlock(props: { data: PostEntry['data'] }) {
  const filename = () => `post/${props.data.post.slug}.md`;
  return (
    <article class={styles.frame}>
      <div class={styles.headerBar}>
        <span class={styles.headerPrompt}>$ </span>
        <span class={styles.headerCmd}>open </span>
        <span class={styles.headerPath}>{filename()}</span>
      </div>
      <div class={styles.body}>
        <header>
          <h1 class={styles.title}>{props.data.post.title}</h1>
          <p class={styles.meta}>
            <time datetime={props.data.post.date}>{props.data.post.date}</time> ·{' '}
            {props.data.post.readingTime} min · {props.data.post.tag}
          </p>
        </header>
        <hr class={styles.rule} />
        <div class={styles.content} innerHTML={props.data.post.bodyHtml} />
      </div>
      <footer class={styles.footer}>
        <a href="/blog">← back to /blog</a>
      </footer>
    </article>
  );
}
