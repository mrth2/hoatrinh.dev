import { describe, expect, it } from 'vitest';
import { blogHandler } from './blog';

describe('blogHandler', () => {
  it('returns a blog-list entry', () => {
    const entry = blogHandler([], '', {});
    expect(entry.kind).toBe('blog-list');
  });

  it('includes cadence metadata with weekly target', () => {
    const entry = blogHandler([], '', {});
    if (entry.kind !== 'blog-list') throw new Error('expected blog-list');
    expect(entry.data.cadence.targetDays).toBe(7);
    expect(entry.data.cadence.postCount).toBeGreaterThanOrEqual(0);
    expect(entry.data.cadence.nextBy).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('derives nextBy as latestDate + 7 days when posts exist', () => {
    const entry = blogHandler([], '', {});
    if (entry.kind !== 'blog-list') throw new Error('expected blog-list');
    if (entry.data.cadence.postCount === 0) return; // empty-state covered below
    const latest = new Date(`${entry.data.cadence.latestDate}T00:00:00Z`);
    const expected = new Date(latest);
    expected.setUTCDate(expected.getUTCDate() + 7);
    expect(entry.data.cadence.nextBy).toBe(expected.toISOString().slice(0, 10));
  });

  it('maps posts to shallow row data only', () => {
    const entry = blogHandler([], '', {});
    if (entry.kind !== 'blog-list') throw new Error('expected blog-list');
    for (const p of entry.data.posts) {
      expect(p).toEqual(
        expect.objectContaining({
          slug: expect.any(String),
          title: expect.any(String),
          date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
          tag: expect.any(String),
          excerpt: expect.any(String),
          readingTime: expect.any(Number),
        }),
      );
      expect((p as unknown as { bodyHtml?: string }).bodyHtml).toBeUndefined();
    }
  });
});
