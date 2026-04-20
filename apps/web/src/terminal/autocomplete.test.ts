import { describe, expect, it } from 'vitest';
import { autocomplete, suggest } from './autocomplete';

const commands = [
  'about',
  'projects',
  'project',
  'experience',
  'skills',
  'contact',
  'help',
  'ask',
  'clear',
];
const projectSlugs = ['keepgoing', 'win95-fun'];

const canonicalNames = [
  'about',
  'projects',
  'project',
  'experience',
  'skills',
  'contact',
  'help',
  'ask',
  'clear',
];
const allNames = [...canonicalNames, 'whoami', 'me', 'a', 'work', 'ls', 'open', 'show'];

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

describe('suggest', () => {
  const opts = { canonicalNames, allNames, projectSlugs };

  it('returns the canonical match for an unambiguous prefix', () => {
    expect(suggest('abo', opts)).toBe('about');
  });

  it('prefers canonical name over alias when both match', () => {
    expect(suggest('a', opts)).toBe('about');
  });

  it('falls back to alias when no canonical matches', () => {
    expect(suggest('who', opts)).toBe('whoami');
  });

  it('returns null for empty input', () => {
    expect(suggest('', opts)).toBeNull();
  });

  it('returns null for whitespace-only input', () => {
    expect(suggest('   ', opts)).toBeNull();
  });

  it('returns null when input is an exact match', () => {
    expect(suggest('about', opts)).toBeNull();
  });

  it('returns null for unknown prefix', () => {
    expect(suggest('xyz', opts)).toBeNull();
  });

  it('preserves leading whitespace in the suggestion', () => {
    expect(suggest(' abo', opts)).toBe(' about');
  });

  it('suggests a project slug after "project "', () => {
    expect(suggest('project keep', opts)).toBe('project keepgoing');
  });

  it('returns null when project arg already exactly matches a slug', () => {
    expect(suggest('project keepgoing', opts)).toBeNull();
  });
});
