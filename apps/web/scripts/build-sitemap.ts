import type { RouteMeta } from '../src/route-meta';

const XML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
};

function escapeXml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => XML_ESCAPES[c] ?? c);
}

function renderUrl(route: RouteMeta): string {
  const lines = ['  <url>', `    <loc>${escapeXml(route.canonicalUrl)}</loc>`];

  if (route.kind === 'article' && route.publishedTime !== undefined) {
    const lastmod = route.modifiedTime ?? route.publishedTime;
    lines.push(`    <lastmod>${escapeXml(lastmod)}</lastmod>`);
  }

  lines.push('  </url>');
  return lines.join('\n');
}

export function renderSitemap(routes: RouteMeta[]): string {
  const urls = routes.map(renderUrl).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}
