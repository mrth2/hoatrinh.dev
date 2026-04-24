import { describe, expect, it } from 'vitest';
import { __loadBlogFromRawFiles, getBlogPost, getBlogPosts } from './blog';

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
});

describe('getBlogPost', () => {
  it('returns undefined for an unknown slug', () => {
    expect(getBlogPost('does-not-exist-xyz')).toBeUndefined();
  });
});

// Internal loader helper tested against fixtures to cover edge cases that
// the production markdown folder cannot reliably exercise.
describe('__loadBlogFromRawFiles (fixture-driven)', () => {
  it('parses a valid post and auto-computes reading time >= 1', async () => {
    const raw =
      `---\nslug: valid-post\ntitle: A valid test post\ndate: "2026-04-01"\nexcerpt: One line.\ntag: test\n---\n\nWord. `.repeat(
        1,
      );
    const posts = await __loadBlogFromRawFiles({ 'valid-post.md': raw });
    expect(posts).toHaveLength(1);
    expect(posts[0]?.slug).toBe('valid-post');
    expect(posts[0]?.readingTime).toBeGreaterThanOrEqual(1);
  });

  it('throws when filename stem does not match slug', async () => {
    const raw = `---\nslug: mismatched\ntitle: x\ndate: "2026-04-02"\nexcerpt: x\ntag: test\n---\nBody.`;
    await expect(__loadBlogFromRawFiles({ 'wrong-name.md': raw })).rejects.toThrow(
      /filename stem .* != slug/,
    );
  });

  it('excludes drafts', async () => {
    const raw = `---\nslug: draft\ntitle: x\ndate: "2026-04-03"\nexcerpt: x\ntag: test\ndraft: true\n---\nBody.`;
    const posts = await __loadBlogFromRawFiles({ 'draft.md': raw });
    expect(posts).toHaveLength(0);
  });

  it('respects explicit readingTime over auto-computed value', async () => {
    const body = 'word '.repeat(5000); // would auto-compute ~23 min
    const raw = `---\nslug: explicit-reading-time\ntitle: x\ndate: "2026-04-04"\nexcerpt: x\ntag: test\nreadingTime: 7\n---\n${body}`;
    const posts = await __loadBlogFromRawFiles({ 'explicit-reading-time.md': raw });
    expect(posts[0]?.readingTime).toBe(7);
  });
});
