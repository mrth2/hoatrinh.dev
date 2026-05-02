import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { RouteMeta } from '../src/route-meta';

let _indexHtml: string | undefined;

function getIndexHtml(): string {
  if (_indexHtml !== undefined) return _indexHtml;
  const html = readFileSync(fileURLToPath(new URL('../dist/index.html', import.meta.url)), 'utf8');
  if (html.includes('og:title')) {
    throw new Error(
      'dist/index.html already contains injected meta tags. Run `bun run build` to restore the pristine template before prerendering.',
    );
  }
  _indexHtml = html;
  return html;
}

export function shellHtml(body: string, head: string, meta: RouteMeta) {
  return renderShellHtml(getIndexHtml(), body, head, meta);
}

export function renderShellHtml(
  template: string,
  body: string,
  head: string,
  meta: RouteMeta,
): string {
  let out = template;
  out = out.replace(/<title>.*<\/title>/, renderHead(meta, head));
  out = out.replace('<div id="app"></div>', `<div id="app">${body}</div>`);
  return out;
}

function renderHead(meta: RouteMeta, hydrationHead: string): string {
  const isArticle = meta.kind === 'article';
  const ogType = isArticle ? 'article' : 'website';

  const lines: string[] = [
    `<title>${escapeHtml(meta.title)}</title>`,
    `    <meta name="description" content="${escapeHtml(meta.description)}" />`,
    `    <meta property="og:title" content="${escapeHtml(meta.title)}" />`,
    `    <meta property="og:description" content="${escapeHtml(meta.description)}" />`,
    `    <meta property="og:url" content="${escapeHtml(meta.canonicalUrl)}" />`,
    `    <meta property="og:type" content="${ogType}" />`,
    `    <link rel="canonical" href="${escapeHtml(meta.canonicalUrl)}" />`,
  ];

  if (isArticle) {
    lines.push(...renderArticleMeta(meta));
    lines.push(`    ${renderBlogPostingJsonLd(meta)}`);
  }

  if (hydrationHead) {
    lines.push(`    ${hydrationHead}`);
  }

  return lines.join('\n');
}

function renderArticleMeta(meta: RouteMeta): string[] {
  const lines: string[] = [];
  if (meta.publishedTime) {
    lines.push(
      `    <meta property="article:published_time" content="${escapeHtml(meta.publishedTime)}" />`,
    );
  }
  if (meta.modifiedTime) {
    lines.push(
      `    <meta property="article:modified_time" content="${escapeHtml(meta.modifiedTime)}" />`,
    );
  }
  if (meta.section) {
    lines.push(`    <meta property="article:section" content="${escapeHtml(meta.section)}" />`);
  }
  return lines;
}

function renderBlogPostingJsonLd(meta: RouteMeta): string {
  const data: Record<string, string> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: meta.title,
    description: meta.description,
    url: meta.canonicalUrl,
  };
  if (meta.publishedTime) data.datePublished = meta.publishedTime;
  if (meta.modifiedTime) data.dateModified = meta.modifiedTime;

  return `<script type="application/ld+json">${escapeScriptJson(JSON.stringify(data))}</script>`;
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

// Escape for inline <script> JSON: prevent </script> injection.
// JSON.stringify already escapes " within string values.
// We only need to additionally escape < as \u003c.
function escapeScriptJson(s: string): string {
  return s.replace(/</g, '\\u003c');
}
