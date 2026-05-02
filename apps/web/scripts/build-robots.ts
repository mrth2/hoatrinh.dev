import { normalizeSiteUrl } from '../src/route-meta';

export function renderRobotsTxt(siteUrl: string): string {
  const normalizedSiteUrl = normalizeSiteUrl(siteUrl);
  return `User-agent: *
Allow: /

Sitemap: ${normalizedSiteUrl}/sitemap.xml
`;
}
