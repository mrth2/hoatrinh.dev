import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ensureSessionStorage } from '@/test-utils/session-storage';
import { hasBooted, markBooted, resetBooted, shouldAnimateBoot } from './boot-state';

function createMediaQueryList(media: string, matches = false): MediaQueryList {
  return {
    matches,
    media,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() {
      return true;
    },
    addListener() {},
    removeListener() {},
  };
}

function ensureWindowWithMatchMedia(): Window {
  if (typeof window !== 'undefined') {
    if (typeof window.matchMedia !== 'function') {
      window.matchMedia = ((q: string) => createMediaQueryList(q)) as typeof window.matchMedia;
    }
    return window;
  }

  const fakeWindow = {
    matchMedia: (q: string) => createMediaQueryList(q),
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
    win.matchMedia = (q: string) => createMediaQueryList(q, q.includes('prefers-reduced-motion'));
    try {
      expect(shouldAnimateBoot()).toBe(false);
    } finally {
      win.matchMedia = original;
    }
  });

  it('shouldAnimateBoot is true when fresh and motion allowed', () => {
    const win = ensureWindowWithMatchMedia();
    const original = win.matchMedia;
    win.matchMedia = (q: string) => createMediaQueryList(q);
    try {
      expect(shouldAnimateBoot()).toBe(true);
    } finally {
      win.matchMedia = original;
    }
  });
});
