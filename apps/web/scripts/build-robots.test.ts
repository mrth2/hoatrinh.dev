import { describe, expect, it } from 'vitest';
import { renderRobotsTxt } from './build-robots';

describe('renderRobotsTxt', () => {
  it('allows all crawlers', () => {
    const txt = renderRobotsTxt('https://hoatrinh.dev');
    expect(txt).toContain('User-agent: *');
    expect(txt).toContain('Allow: /');
  });

  it('points to sitemap.xml', () => {
    const txt = renderRobotsTxt('https://hoatrinh.dev');
    expect(txt).toContain('Sitemap: https://hoatrinh.dev/sitemap.xml');
  });

  it('normalizes trailing slash in siteUrl', () => {
    const txt = renderRobotsTxt('https://hoatrinh.dev/');
    expect(txt).toContain('Sitemap: https://hoatrinh.dev/sitemap.xml');
  });
});
