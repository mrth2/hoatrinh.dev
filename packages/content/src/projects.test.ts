import { describe, expect, it } from 'vitest';
import { getProject, getProjects } from './projects';

describe('getProjects', () => {
  it('returns listed projects by default', () => {
    const projects = getProjects();
    expect(projects.length).toBeGreaterThan(0);
    expect(projects.find((p) => p.slug === 'keepgoing')).toBeDefined();
    expect(projects.find((p) => p.slug === 'social-scout')).toBeUndefined();
  });

  it('sorts featured first, then year desc', () => {
    const projects = getProjects();
    for (let i = 1; i < projects.length; i++) {
      const prev = projects[i - 1];
      const curr = projects[i];
      if (!prev || !curr) continue;
      if (prev.featured && !curr.featured) continue;
      if (!prev.featured && curr.featured) throw new Error('non-featured before featured');
      expect(prev.year).toBeGreaterThanOrEqual(curr.year);
    }
  });

  it('includes hidden projects when requested', () => {
    const projects = getProjects({ includeUnlisted: true });
    expect(projects.find((p) => p.slug === 'social-scout')?.listed).toBe(false);
  });
});

describe('getProject', () => {
  it('returns a project by slug', () => {
    expect(getProject('keepgoing')?.title).toBe('KeepGoing');
  });

  it('can resolve hidden projects by slug', () => {
    expect(getProject('social-scout')?.listed).toBe(false);
  });

  it('returns undefined for unknown slug', () => {
    expect(getProject('nope')).toBeUndefined();
  });
});
