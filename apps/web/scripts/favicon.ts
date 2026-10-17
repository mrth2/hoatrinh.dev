// Pure satori tree and ICO packer for the `>_` favicon. Rasterized by render-og.ts.

export const FAVICON_VIEWBOX = 32;

// Mirrors --bg-base and --accent-primary from src/styles/tokens.css, as og-card.ts does.
const COLOR_BG = '#0a0806';
const COLOR_FG = '#ffb347';

/** `rounded: false` for apple-touch-icon, which iOS masks itself. */
// biome-ignore lint/suspicious/noExplicitAny: satori's element tree type isn't exported for standalone use
export function buildFaviconTree(rounded = true): any {
  return {
    type: 'div',
    props: {
      style: {
        width: FAVICON_VIEWBOX,
        height: FAVICON_VIEWBOX,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: COLOR_BG,
        borderRadius: rounded ? 4 : 0,
        color: COLOR_FG,
        fontFamily: 'JetBrains Mono',
        fontSize: 18,
        fontWeight: 700,
      },
      children: '>_',
    },
  };
}

/** Wrap one square PNG in a single-image ICO container (PNG-in-ICO, Vista+). */
export function pngToIco(png: Uint8Array, size: number): Uint8Array {
  const HEADER = 6;
  const ENTRY = 16;
  const out = new Uint8Array(HEADER + ENTRY + png.length);
  const view = new DataView(out.buffer);
  view.setUint16(2, 1, true);
  view.setUint16(4, 1, true);
  // A width/height byte of 0 means 256px.
  view.setUint8(HEADER, size >= 256 ? 0 : size);
  view.setUint8(HEADER + 1, size >= 256 ? 0 : size);
  view.setUint16(HEADER + 4, 1, true);
  view.setUint16(HEADER + 6, 32, true);
  view.setUint32(HEADER + 8, png.length, true);
  view.setUint32(HEADER + 12, HEADER + ENTRY, true);
  out.set(png, HEADER + ENTRY);
  return out;
}
