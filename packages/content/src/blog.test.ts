import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { __loadBlogFromRawFiles, getBlogPost, getBlogPosts } from './blog';

const fixturesBaseUrl = new URL('../markdown/__fixtures__/blog/', import.meta.url);

async function loadBlogFixture(filename: string): Promise<string> {
  const fixturePath = fileURLToPath(new URL(filename, fixturesBaseUrl));
  return readFile(fixturePath, 'utf8');
}

describe('getBlogPosts', () => {
  it('returns non-draft posts newest-first', () => {
    const posts = getBlogPosts();
    for (let i = 1; i < posts.length; i++) {
      const prev = posts[i - 1];
      const curr = posts[i];
      if (!prev || !curr) continue;
      expect(prev.date >= curr.date).toBe(true);
    }
    expect(posts.find((p) => (p as { draft?: boolean }).draft === true)).toBeUndefined();
  });

  it('returns a shallow copy so callers cannot mutate the source array', () => {
    const first = getBlogPosts();
    const originalLength = first.length;
    const injected = { slug: '__injected__' } as (typeof first)[number];
    first.push(injected);
    const second = getBlogPosts();
    expect(first.length).toBe(originalLength + 1);
    expect(second.length).toBe(originalLength);
    expect(second.some((post) => post.slug === '__injected__')).toBe(false);
  });
});

describe('getBlogPost', () => {
  it('returns undefined for an unknown slug', () => {
    expect(getBlogPost('does-not-exist-xyz')).toBeUndefined();
  });
});

// Internal loader helper tested against fixtures to cover edge cases that
// the production markdown folder cannot reliably exercise.
describe('__loadBlogFromRawFiles (fixture-driven)', () => {
  it('parses a valid post fixture and normalizes date to YYYY-MM-DD string', async () => {
    const raw = await loadBlogFixture('valid-post.md');
    const posts = await __loadBlogFromRawFiles({ 'valid-post.md': raw });
    expect(posts).toHaveLength(1);
    expect(posts[0]?.slug).toBe('valid-post');
    expect(posts[0]?.date).toBe('2026-04-01');
    expect(typeof posts[0]?.date).toBe('string');
    expect(posts[0]?.readingTime).toBeGreaterThanOrEqual(1);
  });

  it('throws when filename stem does not match slug', async () => {
    const raw = await loadBlogFixture('wrong-name.md');
    await expect(__loadBlogFromRawFiles({ 'wrong-name.md': raw })).rejects.toThrow(
      /filename stem .* != slug/,
    );
  });

  it('excludes drafts', async () => {
    const raw = await loadBlogFixture('draft.md');
    const posts = await __loadBlogFromRawFiles({ 'draft.md': raw });
    expect(posts).toHaveLength(0);
  });

  it('respects explicit readingTime over auto-computed value', async () => {
    const raw = await loadBlogFixture('explicit-reading-time.md');
    const posts = await __loadBlogFromRawFiles({ 'explicit-reading-time.md': raw });
    expect(posts[0]?.readingTime).toBe(7);
  });

  it('rejects timestamp-like dates in frontmatter', async () => {
    const raw = await loadBlogFixture('timestamp-date.md');
    await expect(__loadBlogFromRawFiles({ 'timestamp-date.md': raw })).rejects.toThrow(
      /frontmatter validation failed/,
    );
  });
});
