import { describe, expect, it } from 'vitest';
import { parseInput } from './parser';

describe('parseInput', () => {
  it('returns null for empty input', () => {
    expect(parseInput('')).toBeNull();
    expect(parseInput('   ')).toBeNull();
  });

  it('parses a bare command', () => {
    expect(parseInput('about')).toEqual({ cmd: 'about', args: [], rest: '' });
  });

  it('lowercases command but preserves arg case', () => {
    expect(parseInput('Project KeepGoing')).toEqual({
      cmd: 'project',
      args: ['KeepGoing'],
      rest: 'KeepGoing',
    });
  });

  it('preserves whitespace in rest', () => {
    expect(parseInput('ask what is typescript')).toEqual({
      cmd: 'ask',
      args: ['what', 'is', 'typescript'],
      rest: 'what is typescript',
    });
  });

  it('trims leading and trailing whitespace', () => {
    expect(parseInput('  help  ')).toEqual({ cmd: 'help', args: [], rest: '' });
  });

  it('collapses internal whitespace for args', () => {
    expect(parseInput('project    foo')).toEqual({
      cmd: 'project',
      args: ['foo'],
      rest: 'foo',
    });
  });
});
