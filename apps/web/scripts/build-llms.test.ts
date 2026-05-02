import { describe, expect, it } from 'vitest';
import type { RouteMeta } from '../src/route-meta';
import { renderLlmsTxt } from './build-llms';

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

function fixtureBlog(over: Partial<RouteMeta> = {}): RouteMeta {
  return {
    path: '/blog',
    title: 'Blog',
    description: 'Writing',
    kind: 'page',
    canonicalUrl: 'https://hoatrinh.dev/blog',
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

describe('renderLlmsTxt', () => {
  it('includes a top-level heading', () => {
    const txt = renderLlmsTxt([fixturePage()]);
    expect(txt).toContain('# hoatrinh.dev');
  });

  it('includes AI usage guidance', () => {
    const txt = renderLlmsTxt([fixturePage(), fixtureBlog()]);
    expect(txt).toContain('Best content to fetch first:');
    expect(txt).toContain('Prefer /blog and individual /post/ pages');
  });

  it('lists the blog index and article routes', () => {
    const txt = renderLlmsTxt([fixturePage(), fixtureBlog(), fixtureArticle()]);
    expect(txt).toContain('- https://hoatrinh.dev/blog - canonical index for writing.');
    expect(txt).toContain('- https://hoatrinh.dev/blog/hello - article page: Hello World.');
  });

  it('omits page-kind routes from the listing', () => {
    const txt = renderLlmsTxt([fixturePage(), fixtureBlog(), fixtureArticle()]);
    expect(txt).not.toContain('- https://hoatrinh.dev -');
    expect(txt).not.toContain('Home page');
  });

  it('produces stable output for the same input', () => {
    const routes = [fixturePage(), fixtureBlog(), fixtureArticle()];
    expect(renderLlmsTxt(routes)).toBe(renderLlmsTxt(routes));
  });

  it('handles an empty route list gracefully', () => {
    const txt = renderLlmsTxt([]);
    expect(txt).toContain('# hoatrinh.dev');
    expect(txt).not.toContain('canonical index for writing');
  });

  it('handles multiple articles', () => {
    const routes = [
      fixtureBlog(),
      fixtureArticle({ title: 'First Post', canonicalUrl: 'https://hoatrinh.dev/blog/first' }),
      fixtureArticle({
        title: 'Second Post',
        path: '/blog/second',
        canonicalUrl: 'https://hoatrinh.dev/blog/second',
      }),
    ];
    const txt = renderLlmsTxt(routes);
    expect(txt).toContain('- https://hoatrinh.dev/blog/first - article page: First Post.');
    expect(txt).toContain('- https://hoatrinh.dev/blog/second - article page: Second Post.');
  });
});
