import { beforeEach, describe, expect, it } from 'vitest';
import { _resetRateLimiterForTests, checkRateLimit } from './rate-limit';

beforeEach(() => {
  _resetRateLimiterForTests();
});

describe('checkRateLimit', () => {
  it('allows requests under the limit', () => {
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit('1.2.3.4')).toBe(true);
    }
  });

  it('blocks the 6th request within the window', () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit('1.2.3.4');
    }
    expect(checkRateLimit('1.2.3.4')).toBe(false);
  });

  it('allows requests again after the window passes', () => {
    const now = Date.now();
    for (let i = 0; i < 5; i++) {
      checkRateLimit('1.2.3.4', now);
    }
    // Still blocked within window
    expect(checkRateLimit('1.2.3.4', now + 59_000)).toBe(false);
    // Allowed after 60 seconds
    expect(checkRateLimit('1.2.3.4', now + 60_001)).toBe(true);
  });

  it('tracks IPs independently', () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit('1.1.1.1');
    }
    // 1.1.1.1 is exhausted, but 2.2.2.2 should still be allowed
    expect(checkRateLimit('1.1.1.1')).toBe(false);
    expect(checkRateLimit('2.2.2.2')).toBe(true);
  });
});
