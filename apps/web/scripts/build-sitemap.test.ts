import { describe, expect, it } from 'vitest';
import type { RouteMeta } from '../src/route-meta';
import { renderSitemap } from './build-sitemap';

function fixturePage(over: Partial<RouteMeta> = {}): RouteMeta {
  return {
    path: '/',
    title: 'Home',
    description: 'Home page',
    kind: 'page',
    canonicalUrl: 'https://hoatrinh.dev',
    ...over,
  };
}

function fixtureArticle(over: Partial<RouteMeta> = {}): RouteMeta {
  return {
    path: '/blog/hello',
    title: 'Hello World',
    description: 'An article',
    kind: 'article',
    canonicalUrl: 'https://hoatrinh.dev/blog/hello',
    publishedTime: '2026-04-20',
    ...over,
  };
}

describe('renderSitemap', () => {
  it('emits a valid XML sitemap header', () => {
    const xml = renderSitemap([fixturePage()]);
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml.trimEnd().endsWith('</urlset>')).toBe(true);
  });

  it('includes <loc> for each route using canonicalUrl', () => {
    const xml = renderSitemap([fixturePage(), fixtureArticle()]);
    expect(xml).toContain('<loc>https://hoatrinh.dev</loc>');
    expect(xml).toContain('<loc>https://hoatrinh.dev/blog/hello</loc>');
  });

  it('includes <lastmod> for article routes with publishedTime', () => {
    const xml = renderSitemap([fixtureArticle()]);
    expect(xml).toContain('<lastmod>2026-04-20</lastmod>');
  });

  it('uses modifiedTime as <lastmod> when both publishedTime and modifiedTime are present', () => {
    const xml = renderSitemap([fixtureArticle({ modifiedTime: '2026-04-25' })]);
    expect(xml).toContain('<lastmod>2026-04-25</lastmod>');
    expect(xml).not.toContain('<lastmod>2026-04-20</lastmod>');
  });

  it('omits <lastmod> for page routes even with publishedTime', () => {
    const xml = renderSitemap([fixturePage({ publishedTime: '2026-04-20' })]);
    expect(xml).not.toContain('<lastmod>');
  });

  it('omits <lastmod> for article routes without publishedTime', () => {
    const base = fixtureArticle();
    const { publishedTime: _p, modifiedTime: _m, ...noPublish } = base;
    const xml = renderSitemap([noPublish as RouteMeta]);
    expect(xml).not.toContain('<lastmod>');
  });

  it('escapes XML-sensitive characters in canonicalUrl', () => {
    const xml = renderSitemap([
      fixturePage({ canonicalUrl: 'https://hoatrinh.dev/search?q=a&b=c' }),
    ]);
    expect(xml).toContain('<loc>https://hoatrinh.dev/search?q=a&amp;b=c</loc>');
    expect(xml).not.toContain('&b=c<');
  });

  it('renders one <url> block per route', () => {
    const routes = [
      fixturePage(),
      fixtureArticle(),
      fixtureArticle({ path: '/blog/second', canonicalUrl: 'https://hoatrinh.dev/blog/second' }),
    ];
    const xml = renderSitemap(routes);
    const urlCount = (xml.match(/<url>/g) ?? []).length;
    expect(urlCount).toBe(3);
  });
});
