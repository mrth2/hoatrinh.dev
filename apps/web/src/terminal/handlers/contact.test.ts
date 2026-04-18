import { describe, expect, it } from 'vitest';
import { contactHandler } from './contact';

describe('contactHandler', () => {
  it('returns a non-empty list of links', () => {
    const entry = contactHandler([], '', {});
    expect(entry.kind).toBe('contact');
    expect(entry.data.length).toBeGreaterThan(0);
  });
});
