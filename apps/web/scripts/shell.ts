import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const indexHtml = readFileSync(
  fileURLToPath(new URL('../dist/index.html', import.meta.url)),
  'utf8',
);

export function shellHtml(body: string, head: string, meta: { title: string; description: string; url: string }) {
  let out = indexHtml;
  out = out.replace(
    /<title>.*<\/title>/,
    `<title>${escape(meta.title)}</title>\n    <meta name="description" content="${escape(meta.description)}" />\n    <meta property="og:title" content="${escape(meta.title)}" />\n    <meta property="og:description" content="${escape(meta.description)}" />\n    <meta property="og:url" content="${escape(meta.url)}" />\n    <meta property="og:type" content="website" />\n    <link rel="canonical" href="${escape(meta.url)}" />\n    ${head}`,
  );
  out = out.replace(
    '<div id="app"></div>',
    `<div id="app">${body}</div>`,
  );
  return out;
}

function escape(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
}
