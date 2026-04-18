import { describe, expect, it } from 'vitest';
import { getProject, getProjects } from './projects';

describe('getProjects', () => {
  it('returns at least the seed project', () => {
    const projects = getProjects();
    expect(projects.length).toBeGreaterThan(0);
    expect(projects.find((p) => p.slug === 'keepgoing')).toBeDefined();
  });

  it('sorts featured first, then year desc', () => {
    const projects = getProjects();
    for (let i = 1; i < projects.length; i++) {
      const prev = projects[i - 1]!;
      const curr = projects[i]!;
      if (prev.featured && !curr.featured) continue;
      if (!prev.featured && curr.featured) throw new Error('non-featured before featured');
      expect(prev.year).toBeGreaterThanOrEqual(curr.year);
    }
  });
});

describe('getProject', () => {
  it('returns a project by slug', () => {
    expect(getProject('keepgoing')?.title).toBe('KeepGoing');
  });

  it('returns undefined for unknown slug', () => {
    expect(getProject('nope')).toBeUndefined();
  });
});
