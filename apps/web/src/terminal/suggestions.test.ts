import { describe, expect, it } from 'vitest';
import { nearestMatches } from './suggestions';

describe('nearestMatches', () => {
  const vocab = ['about', 'projects', 'project', 'experience', 'skills', 'contact', 'help', 'ask'];

  it('finds exact prefix', () => {
    expect(nearestMatches('proj', vocab)).toContain('projects');
    expect(nearestMatches('proj', vocab)).toContain('project');
  });

  it('tolerates one typo', () => {
    expect(nearestMatches('abot', vocab)).toContain('about');
    expect(nearestMatches('hepl', vocab)).toContain('help');
    expect(nearestMatches('aks', vocab)).toContain('ask');
  });

  it('returns empty when too far', () => {
    expect(nearestMatches('xyzzy', vocab)).toEqual([]);
  });

  it('caps suggestions', () => {
    expect(nearestMatches('pro', vocab).length).toBeLessThanOrEqual(3);
  });
});
