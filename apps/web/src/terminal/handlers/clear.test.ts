import { describe, expect, it } from 'vitest';
import { clearHandler } from './clear';

describe('clearHandler', () => {
  it('returns clear action', () => {
    expect(clearHandler([], '', {})).toEqual({ action: 'clear' });
  });
});
