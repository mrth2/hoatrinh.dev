import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const tokens = readFileSync(resolve(__dirname, 'tokens.css'), 'utf8');

function getVar(name: string) {
  const match = tokens.match(new RegExp(`--${name}:\\s*([^;]+);`));
  return match ? match[1]!.trim() : null;
}

describe('design tokens (D+ palette)', () => {
  it('surfaces use warm-black values', () => {
    expect(getVar('bg-base')).toBe('#0a0806');
    expect(getVar('bg-elevated')).toBe('#14100a');
    expect(getVar('bg-subtle')).toBe('#1a140c');
  });

  it('text uses warm cream palette', () => {
    expect(getVar('text-primary')).toBe('#ecdfc2');
    expect(getVar('text-muted')).toBe('#a08a64');
    expect(getVar('text-dim')).toBe('#5a4a30');
  });

  it('accent-primary is amber, accent-secondary is muted green', () => {
    expect(getVar('accent-primary')).toBe('#ffb347');
    expect(getVar('accent-secondary')).toBe('#7dc69a');
  });

  it('accent-hover (new) is neon magenta', () => {
    expect(getVar('accent-hover')).toBe('#ff4fd8');
  });

  it('state-error is warm coral', () => {
    expect(getVar('state-error')).toBe('#ff8a5c');
  });
});
