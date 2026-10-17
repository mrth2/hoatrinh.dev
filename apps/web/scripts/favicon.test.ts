import { describe, expect, it } from 'vitest';
import { buildFaviconTree, pngToIco } from './favicon';

describe('pngToIco', () => {
  it('writes a single-entry ICO header pointing at the embedded PNG', () => {
    const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 1, 2, 3]);
    const ico = pngToIco(png, 48);
    const view = new DataView(ico.buffer);

    expect(view.getUint16(0, true)).toBe(0);
    expect(view.getUint16(2, true)).toBe(1);
    expect(view.getUint16(4, true)).toBe(1);
    expect(view.getUint8(6)).toBe(48);
    expect(view.getUint8(7)).toBe(48);
    expect(view.getUint16(12, true)).toBe(32);
    expect(view.getUint32(14, true)).toBe(png.length);
    expect(view.getUint32(18, true)).toBe(22);
    expect(ico.subarray(22)).toEqual(png);
  });

  it('encodes 256px as a zero size byte', () => {
    const ico = pngToIco(new Uint8Array([0]), 256);
    expect(ico[6]).toBe(0);
    expect(ico[7]).toBe(0);
  });
});

describe('buildFaviconTree', () => {
  it('drops the corner radius for the apple-touch variant', () => {
    expect(buildFaviconTree().props.style.borderRadius).toBe(4);
    expect(buildFaviconTree(false).props.style.borderRadius).toBe(0);
  });
});
