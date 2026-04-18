import { describe, expect, it } from 'vitest';
import { getSkills } from './skills';

describe('getSkills', () => {
  it('returns non-empty groups', () => {
    const groups = getSkills();
    expect(groups.length).toBeGreaterThan(0);
    for (const g of groups) {
      expect(g.label).toBeTruthy();
      expect(g.items.length).toBeGreaterThan(0);
    }
  });

  it('has no duplicate group labels', () => {
    const labels = getSkills().map((g) => g.label);
    expect(new Set(labels).size).toBe(labels.length);
  });
});
