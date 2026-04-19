import { describe, expect, it } from 'vitest';
import { getMotd, pickBootSet, pickCompact } from './motd';

describe('getMotd', () => {
  it('returns four tagged pools with >= 3 items each (with buildData)', () => {
    const pools = getMotd({
      latestCommitSubject: 'test commit',
      latestCommitIso: new Date().toISOString(),
      buildTimeIso: new Date().toISOString(),
    });
    expect(pools.greetings.length).toBeGreaterThanOrEqual(3);
    expect(pools.tips.length).toBeGreaterThanOrEqual(3);
    expect(pools.facts.length).toBeGreaterThanOrEqual(3);
    expect(pools.poetic.length).toBeGreaterThanOrEqual(3);
  });

  it('returns empty facts array without buildData', () => {
    const pools = getMotd();
    expect(pools.facts.length).toBe(0);
  });
});

describe('getMotd with buildData', () => {
  it('injects dynamic facts when buildData is provided', () => {
    const pools = getMotd({
      latestCommitSubject: 'feat(web): add x',
      latestCommitIso: new Date().toISOString(),
      buildTimeIso: new Date().toISOString(),
    });
    expect(pools.facts.some((f) => f.includes('last deploy'))).toBe(true);
    expect(pools.facts.some((f) => f.includes('feat(web): add x'))).toBe(true);
  });
});

describe('pickBootSet', () => {
  it('returns one item per tagged pool, deterministic with seed', () => {
    const set = pickBootSet(42);
    expect(set.greeting).toMatch(/.+/);
    expect(set.tip).toMatch(/.+/);
    expect(set.fact).toMatch(/.+/);
    expect(set.poetic).toMatch(/.+/);
    const again = pickBootSet(42);
    expect(again).toEqual(set);
  });

  it('produces a different greeting across seeds', () => {
    const seen = new Set<string>();
    for (let s = 0; s < 20; s++) seen.add(pickBootSet(s).greeting);
    expect(seen.size).toBeGreaterThan(1);
  });
});

describe('pickCompact', () => {
  it('returns one line from any pool, deterministic with seed', () => {
    const a = pickCompact(7);
    const b = pickCompact(7);
    expect(a).toBe(b);
    expect(typeof a).toBe('string');
    expect(a.length).toBeGreaterThan(0);
  });
});
