import { Marked } from 'marked';

const ATTR_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
};

function escapeAttr(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ATTR_ESCAPES[c] ?? c);
}

let imagesInDocument = 0;

const marked = new Marked({ async: false, gfm: true, breaks: false });
marked.use({
  renderer: {
    html() {
      return '';
    },
    image({ href, title, text }) {
      // The first image may be the LCP element, so only later ones are lazy.
      const loading = imagesInDocument++ === 0 ? '' : ' loading="lazy"';
      const titleAttr = title ? ` title="${escapeAttr(title)}"` : '';
      return `<img src="${escapeAttr(href)}" alt="${escapeAttr(text)}"${titleAttr} decoding="async"${loading}>`;
    },
  },
});

export async function renderMarkdown(source: string): Promise<string> {
  imagesInDocument = 0;
  const result = marked.parse(source);
  return typeof result === 'string' ? result : await result;
}
