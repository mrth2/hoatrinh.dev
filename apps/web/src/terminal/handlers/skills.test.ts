import { describe, expect, it } from 'vitest';
import { skillsHandler } from './skills';

describe('skillsHandler', () => {
  it('returns non-empty skill groups', () => {
    const entry = skillsHandler([], '', {});
    expect(entry.kind).toBe('skills');
    expect(entry.data.length).toBeGreaterThan(0);
  });
});
