export const DEFAULT_SITE_URL = 'https://hoatrinh.dev';

export type RouteKind = 'page' | 'article';

export type RouteMeta = {
  path: string;
  title: string;
  description: string;
  kind: RouteKind;
  canonicalUrl: string;
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

function normalizeRoutePath(path: string): string {
  if (path === '/') return '';

  const trimmedPath = path.replace(/\/+$/, '');
  return trimmedPath.startsWith('/') ? trimmedPath : `/${trimmedPath}`;
}
