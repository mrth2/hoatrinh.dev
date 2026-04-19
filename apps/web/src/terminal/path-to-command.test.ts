import { describe, expect, it } from 'vitest';
import { pathToCommand } from './path-to-command';

describe('pathToCommand', () => {
  it('returns null for root path', () => {
    expect(pathToCommand('/')).toBeNull();
  });

  it('maps /about to "about"', () => {
    expect(pathToCommand('/about')).toBe('about');
  });

  it('maps /projects to "projects"', () => {
    expect(pathToCommand('/projects')).toBe('projects');
  });

  it('maps /project/my-app to "project my-app"', () => {
    expect(pathToCommand('/project/my-app')).toBe('project my-app');
  });

  it('maps unknown /foo to "foo" (execute handles the error)', () => {
    expect(pathToCommand('/foo')).toBe('foo');
  });

  it('maps /experience to "experience"', () => {
    expect(pathToCommand('/experience')).toBe('experience');
  });

  it('maps /skills to "skills"', () => {
    expect(pathToCommand('/skills')).toBe('skills');
  });

  it('maps /contact to "contact"', () => {
    expect(pathToCommand('/contact')).toBe('contact');
  });

  it('maps /help to "help"', () => {
    expect(pathToCommand('/help')).toBe('help');
  });
});
