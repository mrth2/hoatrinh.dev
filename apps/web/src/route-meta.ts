export const DEFAULT_SITE_URL = 'https://hoatrinh.dev';

export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

export type RouteKind = 'page' | 'article';

/**
 * Content-derived identity for the site owner. Built by `getSiteIdentity` so
 * that `scripts/shell.ts` can stay a pure template renderer.
 */
export type SiteIdentity = {
  siteUrl: string;
  siteName: string;
  locale: string;
  authorName: string;
  authorRole: string;
  authorUrl: string;
  sameAs: string[];
};

export type RouteMeta = {
  path: string;
  title: string;
  description: string;
  kind: RouteKind;
  canonicalUrl: string;
  /** Site-relative path the OG card is written to during prerender. */
  ogImagePath: string;
  /** Absolute URL crawlers fetch the OG card from. */
  ogImageUrl: string;
  /** Keep the route out of search indexes and the sitemap. */
  noindex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
};

export function normalizeSiteUrl(siteUrl: string = DEFAULT_SITE_URL): string {
  return siteUrl.replace(/\/+$/, '');
}

export function canonicalUrlForPath(path: string, siteUrl: string = DEFAULT_SITE_URL): string {
  const normalizedSiteUrl = normalizeSiteUrl(siteUrl);
  const normalizedPath = normalizeRoutePath(path);
  return `${normalizedSiteUrl}${normalizedPath}`;
}

export function ogImagePathForPath(path: string): string {
  const normalizedPath = normalizeRoutePath(path);
  return normalizedPath === '' ? '/og/index.png' : `/og${normalizedPath}.png`;
}

export function ogImageUrlForPath(path: string, siteUrl: string = DEFAULT_SITE_URL): string {
  return `${normalizeSiteUrl(siteUrl)}${ogImagePathForPath(path)}`;
}

function normalizeRoutePath(path: string): string {
  if (path === '/') return '';

  const trimmedPath = path.replace(/\/+$/, '');
  return trimmedPath.startsWith('/') ? trimmedPath : `/${trimmedPath}`;
}
