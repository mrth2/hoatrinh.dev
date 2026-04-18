import { describe, expect, it } from 'vitest';
import { autocomplete } from './autocomplete';

const commands = [
  'about',
  'projects',
  'project',
  'experience',
  'skills',
  'contact',
  'help',
  'clear',
];
const projectSlugs = ['keepgoing', 'win95-fun'];

describe('autocomplete', () => {
  it('completes an unambiguous command prefix', () => {
    expect(autocomplete('abo', { commands, projectSlugs })).toEqual({
      completion: 'about',
      candidates: [],
    });
  });

  it('returns candidates for ambiguous prefix', () => {
    const res = autocomplete('proj', { commands, projectSlugs });
    expect(res.completion).toBeNull();
    expect(res.candidates).toEqual(expect.arrayContaining(['projects', 'project']));
  });

  it('completes a project slug after "project "', () => {
    expect(autocomplete('project keep', { commands, projectSlugs })).toEqual({
      completion: 'project keepgoing',
      candidates: [],
    });
  });

  it('returns empty on unknown prefix', () => {
    expect(autocomplete('xyz', { commands, projectSlugs })).toEqual({
      completion: null,
      candidates: [],
    });
  });
});
