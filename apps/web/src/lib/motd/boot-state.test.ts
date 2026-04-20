import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ensureSessionStorage } from '@/test-utils/session-storage';
import { hasBooted, markBooted, resetBooted, shouldAnimateBoot } from './boot-state';

function ensureWindowWithMatchMedia(): Window {
  if (typeof window !== 'undefined') {
    if (typeof window.matchMedia !== 'function') {
      window.matchMedia = ((q: string) =>
        ({
          matches: false,
          media: q,
          addEventListener() {},
          removeEventListener() {},
        }) as MediaQueryList) as typeof window.matchMedia;
    }
    return window;
  }

  const fakeWindow = {
    matchMedia: (q: string) =>
      ({
        matches: false,
        media: q,
        addEventListener() {},
        removeEventListener() {},
      }) as MediaQueryList,
  } as unknown as Window;

  Object.defineProperty(globalThis, 'window', {
    value: fakeWindow,
    configurable: true,
    writable: true,
  });

  return fakeWindow;
}

describe('boot-state', () => {
  beforeEach(() => {
    ensureSessionStorage().clear();
    ensureWindowWithMatchMedia();
  });
  afterEach(() => ensureSessionStorage().clear());

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
    const win = ensureWindowWithMatchMedia();
    const original = win.matchMedia;
    win.matchMedia = (q: string) =>
      ({
        matches: q.includes('prefers-reduced-motion'),
        media: q,
        addEventListener() {},
        removeEventListener() {},
      }) as unknown as MediaQueryList;
    try {
      expect(shouldAnimateBoot()).toBe(false);
    } finally {
      win.matchMedia = original;
    }
  });

  it('shouldAnimateBoot is true when fresh and motion allowed', () => {
    const win = ensureWindowWithMatchMedia();
    const original = win.matchMedia;
    win.matchMedia = (q: string) =>
      ({
        matches: false,
        media: q,
        addEventListener() {},
        removeEventListener() {},
      }) as unknown as MediaQueryList;
    try {
      expect(shouldAnimateBoot()).toBe(true);
    } finally {
      win.matchMedia = original;
    }
  });
});
