export type StreamOptions = {
  perCharMin: number;
  perCharMax: number;
  onChar: (c: string, index: number) => void;
  onDone?: () => void;
  signal?: AbortSignal;
};

export async function streamChars(text: string, opts: StreamOptions): Promise<void> {
  const { perCharMin, perCharMax, onChar, onDone, signal } = opts;
  for (let i = 0; i < text.length; i++) {
    if (signal?.aborted) return;
    const delay = perCharMin + Math.random() * (perCharMax - perCharMin);
    await sleep(delay, signal);
    if (signal?.aborted) return;
    onChar(text[i] as string, i);
  }
  onDone?.();
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const id = setTimeout(resolve, ms);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(id);
        resolve();
      },
      { once: true },
    );
  });
}
