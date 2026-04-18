import { describe, expect, it } from 'vitest';
import { projectsHandler } from './projects';

describe('projectsHandler', () => {
  it('returns a non-empty list', () => {
    const entry = projectsHandler([], '', {});
    expect(entry.kind).toBe('projects');
    expect(entry.data.length).toBeGreaterThan(0);
  });
});
