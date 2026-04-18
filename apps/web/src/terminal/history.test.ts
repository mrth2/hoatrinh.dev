import { beforeEach, describe, expect, it } from 'vitest';
import { createHistory } from './history';

describe('createHistory', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('pushes entries and persists', () => {
    const h = createHistory();
    h.push('about');
    h.push('projects');
    expect(h.entries()).toEqual(['projects', 'about']);
    const loaded = createHistory();
    expect(loaded.entries()).toEqual(['projects', 'about']);
  });

  it('dedupes consecutive duplicates', () => {
    const h = createHistory();
    h.push('about');
    h.push('about');
    h.push('help');
    expect(h.entries()).toEqual(['help', 'about']);
  });

  it('caps at 50', () => {
    const h = createHistory();
    for (let i = 0; i < 60; i++) h.push(`cmd${i}`);
    expect(h.entries().length).toBe(50);
    expect(h.entries()[0]).toBe('cmd59');
  });

  it('cursor navigates Up/Down with draft restore', () => {
    const h = createHistory();
    h.push('about');
    h.push('projects');
    expect(h.startNavigation('typing...')).toBe('projects');
    expect(h.navigateUp()).toBe('about');
    expect(h.navigateUp()).toBe('about');
    expect(h.navigateDown()).toBe('projects');
    expect(h.navigateDown()).toBe('typing...');
    expect(h.cursor()).toBe(-1);
  });

  it('reset() clears cursor and draft', () => {
    const h = createHistory();
    h.push('a');
    h.startNavigation('');
    h.navigateUp();
    h.reset();
    expect(h.cursor()).toBe(-1);
  });
});
