import { describe, expect, it } from 'vitest';
import { autocomplete, suggest } from './autocomplete';

const commands = [
  'about',
  'projects',
  'project',
  'blog',
  'post',
  'experience',
  'skills',
  'contact',
  'help',
  'ask',
  'clear',
];
const projectSlugs = ['keepgoing', 'win95-fun'];
const postSlugs = ['the-small-habits-i-keep-on-rails', 'debugging-with-notes'];

const canonicalNames = [
  'about',
  'projects',
  'project',
  'blog',
  'post',
  'experience',
  'skills',
  'contact',
  'help',
  'ask',
  'clear',
];
const allNames = [...canonicalNames, 'whoami', 'me', 'a', 'work', 'ls', 'open', 'show', 'read'];

describe('autocomplete', () => {
  it('completes an unambiguous command prefix', () => {
    expect(autocomplete('abo', { commands, projectSlugs, postSlugs })).toEqual({
      completion: 'about',
      candidates: [],
    });
  });

  it('returns candidates for ambiguous prefix', () => {
    const res = autocomplete('proj', { commands, projectSlugs, postSlugs });
    expect(res.completion).toBeNull();
    expect(res.candidates).toEqual(expect.arrayContaining(['projects', 'project']));
  });

  it('completes a project slug after "project "', () => {
    expect(autocomplete('project keep', { commands, projectSlugs, postSlugs })).toEqual({
      completion: 'project keepgoing',
      candidates: [],
    });
  });

  it('completes a post slug after "post "', () => {
    expect(autocomplete('post the-small', { commands, projectSlugs, postSlugs })).toEqual({
      completion: 'post the-small-habits-i-keep-on-rails',
      candidates: [],
    });
  });

  it('does not suggest post slugs for the project command', () => {
    expect(autocomplete('project the-small', { commands, projectSlugs, postSlugs })).toEqual({
      completion: null,
      candidates: [],
    });
  });

  it('returns empty on unknown prefix', () => {
    expect(autocomplete('xyz', { commands, projectSlugs, postSlugs })).toEqual({
      completion: null,
      candidates: [],
    });
  });
});

describe('suggest', () => {
  const opts = { canonicalNames, allNames, projectSlugs, postSlugs };

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

  it('suggests a post slug after "post "', () => {
    expect(suggest('post the-small', opts)).toBe('post the-small-habits-i-keep-on-rails');
  });

  it('returns null when post arg already exactly matches a slug', () => {
    expect(suggest('post the-small-habits-i-keep-on-rails', opts)).toBeNull();
  });

  it('does not suggest post slugs when using project command', () => {
    expect(suggest('project the-small', opts)).toBeNull();
  });
});
