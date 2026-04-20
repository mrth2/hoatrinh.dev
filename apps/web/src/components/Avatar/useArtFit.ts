import { createSignal, onCleanup } from 'solid-js';

export type Fit = { fontSize: number | null; hidden: boolean };

export type ComputeFitInput = {
  width: number;
  height: number;
  rows: number;
  cols: number;
  charAspect: number;
  minPx: number;
  maxPx: number;
  hideBelowHeight: number;
};

export function computeFit(i: ComputeFitInput): Fit {
  if (i.width <= 0 || i.height <= 0) return { fontSize: null, hidden: true };
  if (i.height < i.hideBelowHeight) return { fontSize: null, hidden: true };
  const fsByWidth = i.width / (i.cols * i.charAspect);
  const fsByHeight = i.height / i.rows;
  const raw = Math.floor(Math.min(fsByWidth, fsByHeight));
  const fontSize = Math.max(i.minPx, Math.min(i.maxPx, raw));
  return { fontSize, hidden: false };
}

export type UseArtFitOpts = {
  container: () => HTMLElement | undefined;
  rows?: number;
  cols?: number;
  charAspect?: number;
  hideBelowHeight?: number;
  minPx?: number;
  maxPx?: number;
};

export function useArtFit(opts: UseArtFitOpts): () => Fit {
  const rows = opts.rows ?? 55;
  const cols = opts.cols ?? 85;
  const charAspect = opts.charAspect ?? 0.6;
  const hideBelowHeight = opts.hideBelowHeight ?? 220;
  const minPx = opts.minPx ?? 6;
  const maxPx = opts.maxPx ?? 16;
  const [fit, setFit] = createSignal<Fit>({ fontSize: null, hidden: false });

  const measure = () => {
    const el = opts.container();
    if (!el) return;
    setFit(
      computeFit({
        width: el.clientWidth,
        height: el.clientHeight,
        rows,
        cols,
        charAspect,
        minPx,
        maxPx,
        hideBelowHeight,
      }),
    );
  };

  if (typeof ResizeObserver !== 'undefined') {
    const ro = new ResizeObserver(() => measure());
    queueMicrotask(() => {
      const el = opts.container();
      if (el) ro.observe(el);
      measure();
    });
    onCleanup(() => ro.disconnect());
  }

  return fit;
}
