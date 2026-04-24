import { describe, expect, it, vi } from 'vitest';

const mockPosts = [
  {
    slug: 'async-systems',
    title: 'Async Systems',
    date: '2026-04-23',
    excerpt: 'Build async systems without chaos.',
    tag: 'engineering',
    readingTime: 4,
    bodyHtml: '<p>Async systems post</p>',
  },
  {
    slug: 'deterministic-tests',
    title: 'Deterministic Tests',
    date: '2026-04-19',
    excerpt: 'Determinism beats flakiness.',
    tag: 'testing',
    readingTime: 5,
    bodyHtml: '<p>Deterministic tests post</p>',
  },
  {
    slug: 'deep-work',
    title: 'Deep Work',
    date: '2026-04-01',
    excerpt: 'Protect focus to ship better work.',
    tag: 'productivity',
    readingTime: 3,
    bodyHtml: '<p>Deep work post</p>',
  },
];

vi.mock('@hoatrinh/content', () => ({
  getBlogPosts: () => mockPosts,
  getBlogPost: (slug: string) => mockPosts.find((post) => post.slug === slug),
}));

const { postHandler } = await import('./post');

describe('postHandler', () => {
  it('returns error when slug missing', () => {
    const entry = postHandler([], '', {});
    expect(entry.kind).toBe('error');
    if (entry.kind === 'error') {
      expect(entry.message).toBe('post requires a slug. Try: post <slug>');
      expect(entry.suggestions).toEqual(['blog']);
    }
  });

  it('returns error with nearest matches for unknown slug', () => {
    const entry = postHandler(['deterministik-tests'], '', {});
    expect(entry.kind).toBe('error');
    if (entry.kind === 'error') {
      expect(entry.suggestions).toEqual(['blog', 'deterministic-tests']);
    }
  });

  it('returns a post entry for a known slug', () => {
    const entry = postHandler(['deterministic-tests'], '', {});
    expect(entry.kind).toBe('post');
    if (entry.kind === 'post') {
      expect(entry.data.post.slug).toBe('deterministic-tests');
      expect(entry.data.post.bodyHtml.length).toBeGreaterThan(0);
    }
  });

  it('sets neighbor links for newest, middle, and oldest posts', () => {
    const newestEntry = postHandler(['async-systems'], '', {});
    if (newestEntry.kind !== 'post') throw new Error('expected post');
    expect(newestEntry.data.prev).toEqual({
      slug: 'deterministic-tests',
      title: 'Deterministic Tests',
    });
    expect(newestEntry.data.next).toBeUndefined();

    const middleEntry = postHandler(['deterministic-tests'], '', {});
    if (middleEntry.kind !== 'post') throw new Error('expected post');
    expect(middleEntry.data.prev).toEqual({ slug: 'deep-work', title: 'Deep Work' });
    expect(middleEntry.data.next).toEqual({ slug: 'async-systems', title: 'Async Systems' });

    const oldestEntry = postHandler(['deep-work'], '', {});
    if (oldestEntry.kind !== 'post') throw new Error('expected post');
    expect(oldestEntry.data.prev).toBeUndefined();
    expect(oldestEntry.data.next).toEqual({
      slug: 'deterministic-tests',
      title: 'Deterministic Tests',
    });
  });
});
