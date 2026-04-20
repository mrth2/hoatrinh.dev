import { Marked } from 'marked';
import { For } from 'solid-js';
import styles from './TextBlock.module.css';

const marked = new Marked({ async: false, gfm: true, breaks: false });
marked.use({
  renderer: {
    html() {
      return '';
    },
  },
});

function markdownToHtml(lines: string[]): string {
  return marked.parse(lines.join('\n').trim()) as string;
}

export function TextBlock(props: { lines: string[]; markdown?: boolean }) {
  if (props.markdown) {
    return <div class={styles.markdown} innerHTML={markdownToHtml(props.lines)} />;
  }
  return <For each={props.lines}>{(l) => <p class={styles.line}>{l}</p>}</For>;
}
