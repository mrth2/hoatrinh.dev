import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const indexHtml = readFileSync(
  fileURLToPath(new URL('../dist/index.html', import.meta.url)),
  'utf8',
);

if (indexHtml.includes('og:title')) {
  throw new Error(
    'dist/index.html already contains injected meta tags. Run `bun run build` to restore the pristine template before prerendering.',
  );
}

export function shellHtml(
  body: string,
  head: string,
  meta: { title: string; description: string; url: string },
) {
  let out = indexHtml;
  out = out.replace(
    /<title>.*<\/title>/,
    `<title>${escapeHtml(meta.title)}</title>\n    <meta name="description" content="${escapeHtml(meta.description)}" />\n    <meta property="og:title" content="${escapeHtml(meta.title)}" />\n    <meta property="og:description" content="${escapeHtml(meta.description)}" />\n    <meta property="og:url" content="${escapeHtml(meta.url)}" />\n    <meta property="og:type" content="website" />\n    <link rel="canonical" href="${escapeHtml(meta.url)}" />\n    ${head}`,
  );
  out = out.replace('<div id="app"></div>', `<div id="app">${body}</div>`);
  return out;
}

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
};

function escapeHtml(s: string): string {
  return s.replace(/[&<>"]/g, (c) => HTML_ESCAPES[c] ?? c);
}
