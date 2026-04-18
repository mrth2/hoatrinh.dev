import { Marked } from 'marked';

const marked = new Marked({ async: false, gfm: true, breaks: false });
marked.use({
  renderer: {
    html() {
      return '';
    },
  },
});

export async function renderMarkdown(source: string): Promise<string> {
  const result = await marked.parse(source);
  return typeof result === 'string' ? result : await result;
}
