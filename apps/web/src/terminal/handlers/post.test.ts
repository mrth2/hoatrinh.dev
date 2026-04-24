import { describe, expect, it } from 'vitest';
import { postHandler } from './post';

describe('postHandler', () => {
  it('returns error when slug missing', () => {
    const entry = postHandler([], '', {});
    expect(entry.kind).toBe('error');
  });

  it('returns error with nearest matches for unknown slug', () => {
    const entry = postHandler(['does-not-exist-xyz'], '', {});
    expect(entry.kind).toBe('error');
    if (entry.kind === 'error') {
      expect(entry.suggestions).toContain('blog');
    }
  });

  it('returns a post entry for a known slug', () => {
    const entry = postHandler(['the-small-habits-i-keep-on-rails'], '', {});
    expect(entry.kind).toBe('post');
    if (entry.kind === 'post') {
      expect(entry.data.post.slug).toBe('the-small-habits-i-keep-on-rails');
      expect(entry.data.post.bodyHtml.length).toBeGreaterThan(0);
    }
  });

  it('undefined prev/next at list boundaries (single post)', () => {
    const entry = postHandler(['the-small-habits-i-keep-on-rails'], '', {});
    if (entry.kind !== 'post') throw new Error('expected post');
    expect(entry.data.prev).toBeUndefined();
    expect(entry.data.next).toBeUndefined();
  });
});
