import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { hasBooted, markBooted, resetBooted, shouldAnimateBoot } from './boot-state';

describe('boot-state', () => {
  beforeEach(() => sessionStorage.clear());
  afterEach(() => sessionStorage.clear());

  it('hasBooted returns false when key absent', () => {
    expect(hasBooted()).toBe(false);
  });

  it('markBooted sets the key and hasBooted returns true', () => {
    markBooted();
    expect(hasBooted()).toBe(true);
  });

  it('resetBooted clears the key', () => {
    markBooted();
    resetBooted();
    expect(hasBooted()).toBe(false);
  });

  it('shouldAnimateBoot is false when already booted', () => {
    markBooted();
    expect(shouldAnimateBoot()).toBe(false);
  });

  it('shouldAnimateBoot is false under prefers-reduced-motion', () => {
    // jsdom: override matchMedia for the test
    const original = window.matchMedia;
    window.matchMedia = (q: string) =>
      ({ matches: q.includes('prefers-reduced-motion'), media: q, addEventListener() {}, removeEventListener() {} }) as unknown as MediaQueryList;
    try {
      expect(shouldAnimateBoot()).toBe(false);
    } finally {
      window.matchMedia = original;
    }
  });

  it('shouldAnimateBoot is true when fresh and motion allowed', () => {
    const original = window.matchMedia;
    window.matchMedia = (q: string) =>
      ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} }) as unknown as MediaQueryList;
    try {
      expect(shouldAnimateBoot()).toBe(true);
    } finally {
      window.matchMedia = original;
    }
  });
});
