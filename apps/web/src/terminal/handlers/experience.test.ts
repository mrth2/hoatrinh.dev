import { describe, expect, it } from 'vitest';
import { experienceHandler } from './experience';

describe('experienceHandler', () => {
  it('returns a non-empty list', () => {
    const entry = experienceHandler([], '', {});
    expect(entry.kind).toBe('experience');
    expect(entry.data.length).toBeGreaterThan(0);
  });
});
