import { describe, expect, it } from 'vitest';
import { createRegistry, resolveCommand } from './registry';

const specs = [
  { name: 'about', aliases: ['whoami'], summary: 'about me', handler: () => null as never },
  { name: 'projects', aliases: ['work'], summary: 'projects', handler: () => null as never },
];

describe('resolveCommand', () => {
  const reg = createRegistry(specs);

  it('resolves by name', () => {
    expect(resolveCommand(reg, 'about')?.name).toBe('about');
  });

  it('resolves by alias', () => {
    expect(resolveCommand(reg, 'whoami')?.name).toBe('about');
    expect(resolveCommand(reg, 'work')?.name).toBe('projects');
  });

  it('is case-insensitive on name lookup', () => {
    expect(resolveCommand(reg, 'About')?.name).toBe('about');
  });

  it('returns undefined for unknown', () => {
    expect(resolveCommand(reg, 'nope')).toBeUndefined();
  });

  it('returns vocab with all names and aliases', () => {
    expect(reg.vocab).toEqual(expect.arrayContaining(['about', 'whoami', 'projects', 'work']));
  });
});
