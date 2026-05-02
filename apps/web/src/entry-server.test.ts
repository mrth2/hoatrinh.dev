import { describe, expect, it } from 'vitest';
import { getRoutes } from './entry-server';

const SITE = 'https://example.test';

describe('getRoutes', () => {
  it('adds canonical URLs and page kind to the home route', () => {
    const home = getRoutes(SITE).find((route) => route.path === '/');

    expect(home).toMatchObject({
      path: '/',
      kind: 'page',
      canonicalUrl: SITE,
    });
    expect(home?.title).toContain('Hoa Trinh');
    expect(home?.description).toContain('Hoa Trinh');
  });

  it('describes /blog as the canonical writing index, not an article', () => {
    const blog = getRoutes(SITE).find((route) => route.path === '/blog');
    const profile = blog?.title.replace('Blog - ', '') ?? '';

    expect(blog).toMatchObject({
      path: '/blog',
      kind: 'page',
      canonicalUrl: `${SITE}/blog`,
    });
    expect(blog?.title).toContain('Blog -');
    expect(blog?.description).toContain('building, habits, and the work behind the work');
    expect(blog?.description).toContain(profile);
  });

  it('classifies post routes as articles with publish metadata and section', () => {
    const post = getRoutes(SITE).find((route) => route.path === '/post/ai-made-learning-fun-again');

    expect(post).toMatchObject({
      path: '/post/ai-made-learning-fun-again',
      kind: 'article',
      canonicalUrl: `${SITE}/post/ai-made-learning-fun-again`,
    });
    expect(post?.title).toContain('AI made learning fun again');
    expect(post?.publishedTime).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(post?.modifiedTime).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(post?.section).toBeTruthy();
    expect(post?.description).toBeTruthy();
  });
});
