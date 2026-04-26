import type { BlogPost } from '@hoatrinh/content';

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
};

function escapeXml(s: string): string {
  return s.replace(/[&<>"]/g, (c) => HTML_ESCAPES[c] ?? c);
}

function safeCdata(html: string): string {
  return html.replace(/]]>/g, ']]]]><![CDATA[>');
}

function rfc822(dateYmd: string): string {
  return new Date(`${dateYmd}T00:00:00Z`).toUTCString();
}

function imageMime(url: string): string {
  const first = url.split('?')[0] ?? url;
  const ext = first.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  if (ext === 'png') return 'image/png';
  if (ext === 'gif') return 'image/gif';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'svg') return 'image/svg+xml';
  return 'application/octet-stream';
}

function absolutize(url: string, siteUrl: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${siteUrl}${url.startsWith('/') ? '' : '/'}${url}`;
}

function renderItem(post: BlogPost, siteUrl: string): string {
  const link = `${siteUrl}/blog/${post.slug}`;
  const enclosure = post.cover
    ? `      <enclosure url="${escapeXml(absolutize(post.cover, siteUrl))}" type="${imageMime(post.cover)}" length="0" />`
    : '';
  return [
    '    <item>',
    `      <title>${escapeXml(post.title)}</title>`,
    `      <link>${link}</link>`,
    `      <guid isPermaLink="true">${link}</guid>`,
    `      <pubDate>${rfc822(post.date)}</pubDate>`,
    `      <description>${escapeXml(post.excerpt)}</description>`,
    enclosure,
    `      <content:encoded><![CDATA[${safeCdata(post.bodyHtml)}]]></content:encoded>`,
    '    </item>',
  ]
    .filter((line) => line.length > 0)
    .join('\n');
}

export function renderRss(posts: BlogPost[], siteUrl: string): string {
  const sorted = [...posts].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  const items = sorted.map((p) => renderItem(p, siteUrl)).join('\n');
  const lastBuild = sorted[0] ? rfc822(sorted[0].date) : new Date().toUTCString();
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>hoatrinh.dev blog</title>
    <link>${siteUrl}</link>
    <description>Notes from Hoa Trinh on building, habits, and the work behind the work.</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
}
