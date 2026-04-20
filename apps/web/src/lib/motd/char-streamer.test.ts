import { describe, expect, it, vi } from 'vitest';
import { streamChars } from './char-streamer';

async function advanceBy(ms: number): Promise<void> {
  const advanceTimersByTimeAsync = (
    vi as typeof vi & {
      advanceTimersByTimeAsync?: (time: number) => Promise<void>;
    }
  ).advanceTimersByTimeAsync;

  if (advanceTimersByTimeAsync !== undefined) {
    await advanceTimersByTimeAsync(ms);
    return;
  }

  vi.advanceTimersByTime(ms);
  await Promise.resolve();
}

describe('streamChars', () => {
  it('emits each character in order, then calls onDone', async () => {
    vi.useFakeTimers();
    const chars: string[] = [];
    const done = vi.fn();
    const promise = streamChars('abc', {
      perCharMin: 10,
      perCharMax: 10,
      onChar: (c) => chars.push(c),
      onDone: done,
    });
    // Advance timers in steps of 10ms until complete
    for (let i = 0; i < 5; i++) {
      await advanceBy(10);
    }
    await promise;
    expect(chars.join('')).toBe('abc');
    expect(done).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });

  it('aborts mid-stream when signal is aborted, does not call onDone', async () => {
    vi.useFakeTimers();
    const ctrl = new AbortController();
    const chars: string[] = [];
    const done = vi.fn();
    const promise = streamChars('abcdefghij', {
      perCharMin: 10,
      perCharMax: 10,
      onChar: (c) => chars.push(c),
      onDone: done,
      signal: ctrl.signal,
    });
    await advanceBy(30);
    ctrl.abort();
    await advanceBy(200);
    await promise;
    expect(chars.length).toBeLessThan(10);
    expect(done).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});
