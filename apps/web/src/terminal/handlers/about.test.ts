import { describe, expect, it } from 'vitest';
import { aboutHandler } from './about';

describe('aboutHandler', () => {
  it('returns a profile entry', () => {
    const entry = aboutHandler([], '', {});
    expect(entry.kind).toBe('profile');
    expect(entry.data.name).toBeTruthy();
  });
});
