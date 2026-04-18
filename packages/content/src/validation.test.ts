import { describe, expect, it } from 'vitest';
import { getLinks } from './links';
import { getProjects } from './projects';
import { getSkills } from './skills';

describe('content cross-validation', () => {
  it('project slugs are unique', () => {
    const slugs = getProjects().map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('skill group labels are unique', () => {
    const labels = getSkills().map((g) => g.label);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it('link hrefs are unique', () => {
    const hrefs = getLinks().map((l) => l.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });
});
