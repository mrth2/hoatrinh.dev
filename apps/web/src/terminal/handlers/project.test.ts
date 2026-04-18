import { describe, expect, it } from 'vitest';
import { projectHandler } from './project';

describe('projectHandler', () => {
  it('returns error when slug missing', () => {
    const entry = projectHandler([], '', {});
    expect(entry.kind).toBe('error');
  });

  it('returns error for unknown slug', () => {
    const entry = projectHandler(['nope'], '', {});
    expect(entry.kind).toBe('error');
    if (entry.kind === 'error') expect(entry.suggestions).toContain('projects');
  });

  it('returns project entry when slug matches', () => {
    const entry = projectHandler(['keepgoing'], '', {});
    expect(entry.kind).toBe('project');
    if (entry.kind === 'project') expect(entry.data.slug).toBe('keepgoing');
  });
});
