import { describe, expect, it } from 'vitest';
import { computeFit } from './useArtFit';

describe('computeFit', () => {
  it('returns null-ish when container has zero size', () => {
    expect(computeFit({ width: 0, height: 0, rows: 55, cols: 85, charAspect: 0.6, minPx: 6, maxPx: 16, hideBelowHeight: 300 })).toEqual({ fontSize: null, hidden: true });
  });

  it('chooses width-binding when width is the constraint', () => {
    // width=510 -> fsByWidth = 510/(85*0.6) = 10; height=800 -> fsByHeight = 800/55 ≈ 14.5
    const fit = computeFit({ width: 510, height: 800, rows: 55, cols: 85, charAspect: 0.6, minPx: 6, maxPx: 16, hideBelowHeight: 300 });
    expect(fit).toEqual({ fontSize: 10, hidden: false });
  });

  it('chooses height-binding when height is the constraint', () => {
    // width=900 -> fsByWidth = 900/51 ≈ 17.6; height=440 -> fsByHeight = 440/55 = 8
    const fit = computeFit({ width: 900, height: 440, rows: 55, cols: 85, charAspect: 0.6, minPx: 6, maxPx: 16, hideBelowHeight: 300 });
    expect(fit).toEqual({ fontSize: 8, hidden: false });
  });

  it('clamps to minPx', () => {
    const fit = computeFit({ width: 100, height: 400, rows: 55, cols: 85, charAspect: 0.6, minPx: 6, maxPx: 16, hideBelowHeight: 300 });
    expect(fit.fontSize).toBe(6);
    expect(fit.hidden).toBe(false);
  });

  it('clamps to maxPx', () => {
    const fit = computeFit({ width: 5000, height: 5000, rows: 55, cols: 85, charAspect: 0.6, minPx: 6, maxPx: 16, hideBelowHeight: 300 });
    expect(fit.fontSize).toBe(16);
  });

  it('hides when height is below threshold', () => {
    const fit = computeFit({ width: 900, height: 250, rows: 55, cols: 85, charAspect: 0.6, minPx: 6, maxPx: 16, hideBelowHeight: 300 });
    expect(fit.hidden).toBe(true);
  });
});
