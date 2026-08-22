import { getBlogPosts } from '@hoatrinh/content';
import { describe, expect, it } from 'vitest';
import { getRoutes, getSiteIdentity } from './entry-server';

const SITE = 'https://example.test';

/** Routes whose copy is written in getRoutes rather than derived from markdown. */
function isSiteAuthoredPage(route: { path: string }): boolean {
  return !route.path.startsWith('/post/') && !route.path.startsWith('/project/');
}

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

  it('gives every route a non-empty title, description, and well-formed OG image URLs', () => {
    for (const route of getRoutes(SITE)) {
      expect(route.title.length, `title for ${route.path}`).toBeGreaterThan(0);
      expect(route.description.length, `description for ${route.path}`).toBeGreaterThan(0);
      expect(route.ogImageUrl.startsWith(SITE), `ogImageUrl for ${route.path}`).toBe(true);
      expect(route.ogImageUrl.endsWith('.png'), `ogImageUrl for ${route.path}`).toBe(true);
      expect(route.ogImagePath.startsWith('/og/'), `ogImagePath for ${route.path}`).toBe(true);
    }
  });

  // Site-authored page copy lives in getRoutes, so it is held to a real
  // meta-description floor. Post and project descriptions come from the
  // author's own excerpt/tagline frontmatter and stay their editorial call.
  it('never falls back to thin stub descriptions on site-authored pages', () => {
    for (const route of getRoutes(SITE).filter(isSiteAuthoredPage)) {
      expect(route.description.length, `description for ${route.path}`).toBeGreaterThanOrEqual(60);
      expect(
        route.description.trim().split(/\s+/).length,
        `word count for ${route.path}`,
      ).toBeGreaterThanOrEqual(8);
    }
  });

  it('gives content-derived routes a usable description', () => {
    for (const route of getRoutes(SITE).filter((route) => !isSiteAuthoredPage(route))) {
      expect(route.description.trim().length, `description for ${route.path}`).toBeGreaterThan(20);
    }
  });

  it('keeps descriptions within a sane meta-description budget', () => {
    for (const route of getRoutes(SITE)) {
      expect(route.description.length, `description for ${route.path}`).toBeLessThanOrEqual(200);
    }
  });

  it('derives the og image path from the route path', () => {
    const home = getRoutes(SITE).find((route) => route.path === '/');
    const post = getRoutes(SITE).find((route) => route.path === '/post/ai-made-learning-fun-again');

    expect(home?.ogImagePath).toBe('/og/index.png');
    expect(post?.ogImagePath).toBe('/og/post/ai-made-learning-fun-again.png');
  });

  it('marks only /help as noindex', () => {
    const routes = getRoutes(SITE);
    const help = routes.find((route) => route.path === '/help');
    const others = routes.filter((route) => route.path !== '/help');

    expect(help?.noindex).toBe(true);
    for (const route of others) {
      expect(route.noindex, `noindex for ${route.path}`).not.toBe(true);
    }
  });

  it('sets /blog modifiedTime to the newest blog post date', () => {
    const posts = getBlogPosts();
    const newestPostDate = posts.reduce(
      (newest, post) => (post.date > newest ? post.date : newest),
      '',
    );
    const blog = getRoutes(SITE).find((route) => route.path === '/blog');

    expect(blog?.modifiedTime).toBe(newestPostDate);
  });
});

describe('getSiteIdentity', () => {
  it('builds identity from the site URL and profile content', () => {
    const identity = getSiteIdentity(SITE);

    expect(identity.siteUrl).toBe(SITE);
    expect(identity.authorName.length).toBeGreaterThan(0);
    expect(identity.authorRole.length).toBeGreaterThan(0);
    expect(identity.sameAs).toContain('https://github.com/mrth2');
    expect(identity.sameAs).toContain('https://www.linkedin.com/in/hoa-trinh-dev/');
  });
});
