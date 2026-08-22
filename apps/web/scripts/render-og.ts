// Renders an OgCard to a 1200x630 PNG using satori (layout -> SVG) and
// @resvg/resvg-js (SVG -> raster). Fonts are loaded once and cached at
// module scope so repeated calls (e.g. one per route during prerender)
// don't re-read them from disk.

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';
import { buildOgCardTree, type OgCard } from './og-card';

const CARD_WIDTH = 1200;
const CARD_HEIGHT = 630;

const FONT_REGULAR_PATH = fileURLToPath(
  new URL(
    '../node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff',
    import.meta.url,
  ),
);
const FONT_BOLD_PATH = fileURLToPath(
  new URL(
    '../node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-700-normal.woff',
    import.meta.url,
  ),
);

let fontsPromise: Promise<
  { name: string; data: Buffer; weight: 400 | 700; style: 'normal' }[]
> | null = null;

function loadFonts() {
  if (!fontsPromise) {
    fontsPromise = Promise.all([readFile(FONT_REGULAR_PATH), readFile(FONT_BOLD_PATH)]).then(
      ([regular, bold]) => [
        { name: 'JetBrains Mono', data: regular, weight: 400 as const, style: 'normal' as const },
        { name: 'JetBrains Mono', data: bold, weight: 700 as const, style: 'normal' as const },
      ],
    );
  }
  return fontsPromise;
}

export async function renderOgPng(card: OgCard): Promise<Uint8Array> {
  const fonts = await loadFonts();

  const svg = await satori(buildOgCardTree(card), {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    fonts,
  });

  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: CARD_WIDTH },
  });
  const pngData = resvg.render();
  return pngData.asPng();
}
