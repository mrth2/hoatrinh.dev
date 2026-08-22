import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { RouteMeta, SiteIdentity } from '../src/route-meta';
import { OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH } from '../src/route-meta';

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

export function shellHtml(body: string, head: string, meta: RouteMeta, site: SiteIdentity) {
  return renderShellHtml(getIndexHtml(), body, head, meta, site);
}

export function renderShellHtml(
  template: string,
  body: string,
  head: string,
  meta: RouteMeta,
  site: SiteIdentity,
): string {
  let out = template;
  out = out.replace(/<title>.*<\/title>/, renderHead(meta, site, head));
  out = out.replace('<div id="app"></div>', `<div id="app">${body}</div>`);
  return out;
}

function renderHead(meta: RouteMeta, site: SiteIdentity, hydrationHead: string): string {
  const isArticle = meta.kind === 'article';

  const lines: string[] = [
    `<title>${escapeHtml(meta.title)}</title>`,
    `    <meta name="description" content="${escapeHtml(meta.description)}" />`,
    ...renderOpenGraphMeta(meta, site),
    `    <link rel="canonical" href="${escapeHtml(meta.canonicalUrl)}" />`,
    ...renderTwitterMeta(meta),
    ...renderRobotsMeta(meta),
  ];

  if (isArticle) {
    lines.push(...renderArticleMeta(meta, site));
    lines.push(`    ${renderBlogPostingJsonLd(meta, site)}`);
  }

  if (meta.path === '/') {
    lines.push(`    ${renderWebSiteJsonLd(meta, site)}`);
  }

  const breadcrumbJsonLd = renderBreadcrumbJsonLd(meta, site);
  if (breadcrumbJsonLd) {
    lines.push(`    ${breadcrumbJsonLd}`);
  }

  if (hydrationHead) {
    lines.push(`    ${hydrationHead}`);
  }

  return lines.join('\n');
}

function renderOpenGraphMeta(meta: RouteMeta, site: SiteIdentity): string[] {
  const ogType = meta.kind === 'article' ? 'article' : 'website';
  return [
    `    <meta property="og:title" content="${escapeHtml(meta.title)}" />`,
    `    <meta property="og:description" content="${escapeHtml(meta.description)}" />`,
    `    <meta property="og:url" content="${escapeHtml(meta.canonicalUrl)}" />`,
    `    <meta property="og:type" content="${ogType}" />`,
    `    <meta property="og:site_name" content="${escapeHtml(site.siteName)}" />`,
    `    <meta property="og:locale" content="${escapeHtml(site.locale)}" />`,
    `    <meta property="og:image" content="${escapeHtml(meta.ogImageUrl)}" />`,
    `    <meta property="og:image:width" content="${OG_IMAGE_WIDTH}" />`,
    `    <meta property="og:image:height" content="${OG_IMAGE_HEIGHT}" />`,
    `    <meta property="og:image:alt" content="${escapeHtml(ogImageAlt(meta.title))}" />`,
  ];
}

function ogImageAlt(title: string): string {
  return `Open Graph card for ${title}`;
}

function renderTwitterMeta(meta: RouteMeta): string[] {
  return [
    '    <meta name="twitter:card" content="summary_large_image" />',
    `    <meta name="twitter:title" content="${escapeHtml(meta.title)}" />`,
    `    <meta name="twitter:description" content="${escapeHtml(meta.description)}" />`,
    `    <meta name="twitter:image" content="${escapeHtml(meta.ogImageUrl)}" />`,
  ];
}

function renderRobotsMeta(meta: RouteMeta): string[] {
  if (!meta.noindex) return [];
  return ['    <meta name="robots" content="noindex,follow" />'];
}

function renderArticleMeta(meta: RouteMeta, site: SiteIdentity): string[] {
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
  lines.push(`    <meta property="article:author" content="${escapeHtml(site.authorName)}" />`);
  return lines;
}

/**
 * schema.org wants a BCP-47 tag ("en-US"); og:locale wants the underscore form
 * ("en_US"). SiteIdentity stores the OG form, so convert for JSON-LD.
 */
function bcp47(locale: string): string {
  return locale.replace('_', '-');
}

function authorPerson(site: SiteIdentity): Record<string, unknown> {
  return {
    '@type': 'Person',
    name: site.authorName,
    url: site.authorUrl,
  };
}

function renderWebSiteJsonLd(meta: RouteMeta, site: SiteIdentity): string {
  const website: Record<string, unknown> = {
    '@type': 'WebSite',
    name: site.siteName,
    url: site.siteUrl,
    description: meta.description,
    inLanguage: bcp47(site.locale),
  };
  const person: Record<string, unknown> = {
    '@type': 'Person',
    name: site.authorName,
    jobTitle: site.authorRole,
    url: site.authorUrl,
    sameAs: site.sameAs,
  };

  return jsonLdScript({
    '@context': 'https://schema.org',
    '@graph': [website, person],
  });
}

function renderBlogPostingJsonLd(meta: RouteMeta, site: SiteIdentity): string {
  const person = authorPerson(site);

  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: meta.title,
    description: meta.description,
    url: meta.canonicalUrl,
    author: person,
    publisher: person,
    image: meta.ogImageUrl,
    mainEntityOfPage: { '@type': 'WebPage', '@id': meta.canonicalUrl },
    inLanguage: bcp47(site.locale),
  };
  if (meta.publishedTime) data.datePublished = meta.publishedTime;
  if (meta.modifiedTime) data.dateModified = meta.modifiedTime;
  if (meta.section) data.articleSection = meta.section;

  return jsonLdScript(data);
}

type BreadcrumbSection = {
  indexPath: string;
  indexLabel: string;
};

function breadcrumbSectionForPath(path: string): BreadcrumbSection | undefined {
  if (path.startsWith('/post/')) return { indexPath: '/blog', indexLabel: 'Blog' };
  if (path.startsWith('/project/')) return { indexPath: '/projects', indexLabel: 'Projects' };
  return undefined;
}

function renderBreadcrumbJsonLd(meta: RouteMeta, site: SiteIdentity): string | undefined {
  const section = breadcrumbSectionForPath(meta.path);
  if (!section) return undefined;

  const siteUrl = site.siteUrl.replace(/\/+$/, '');
  const items = [
    { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
    {
      '@type': 'ListItem',
      position: 2,
      name: section.indexLabel,
      item: `${siteUrl}${section.indexPath}`,
    },
    { '@type': 'ListItem', position: 3, name: meta.title, item: meta.canonicalUrl },
  ];

  return jsonLdScript({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  });
}

function jsonLdScript(data: unknown): string {
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
