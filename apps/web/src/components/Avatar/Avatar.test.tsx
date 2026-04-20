import { cleanup, fireEvent, render } from '@solidjs/testing-library';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Avatar } from './Avatar';
import { FRAME_IDLE, LOOKAROUND_SEQUENCE } from './avatar-frames';

function mockMatchMedia(matches: (q: string) => boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (q: string) => ({
      matches: matches(q),
      media: q,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
      onchange: null,
    }),
  });
}

function artText(el: HTMLElement): string {
  return el.querySelector('pre')?.textContent ?? '';
}

describe('Avatar', () => {
  const cycleLookAroundMs = LOOKAROUND_SEQUENCE.reduce((total, entry) => total + entry.ms, 0);
  const lastFrameMs = LOOKAROUND_SEQUENCE.at(-1)?.ms ?? 0;
  const mountLookAroundMs = cycleLookAroundMs * 2 - lastFrameMs;
  const firstTransitionMs = (LOOKAROUND_SEQUENCE[0]?.ms ?? 0) + 50;
  const idleText = FRAME_IDLE.map((seg) => seg.text).join('');

  beforeEach(() => {
    vi.stubGlobal('ResizeObserver', undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    cleanup();
  });

  it('renders the idle frame by default', () => {
    mockMatchMedia((q) => q.includes('reduce'));
    const { getByTestId } = render(() => <Avatar />);
    const el = getByTestId('avatar');
    expect(artText(el).length).toBeGreaterThan(100);
  });

  it('stays on idle when prefers-reduced-motion is set', () => {
    vi.useFakeTimers();
    mockMatchMedia((q) => q.includes('reduce'));
    const { getByTestId } = render(() => <Avatar />);
    const el = getByTestId('avatar');
    const first = artText(el);
    vi.advanceTimersByTime(5000);
    expect(artText(el)).toBe(first);
  });

  it('cycles through wave frames on mount without reduced motion', async () => {
    vi.useFakeTimers();
    mockMatchMedia(() => false);
    const { getByTestId } = render(() => <Avatar />);
    const el = getByTestId('avatar');
    await vi.advanceTimersByTimeAsync(firstTransitionMs);
    expect(artText(el)).not.toBe(idleText);
    await vi.advanceTimersByTimeAsync(mountLookAroundMs + 1000);
    expect(artText(el)).toBe(idleText);
  });

  it('replays the wave when clicked while idle', async () => {
    vi.useFakeTimers();
    mockMatchMedia(() => false);
    const { getByTestId } = render(() => <Avatar />);
    const el = getByTestId('avatar');
    await vi.advanceTimersByTimeAsync(mountLookAroundMs + 1000);
    expect(artText(el)).toBe(idleText);
    fireEvent.click(el);
    await vi.advanceTimersByTimeAsync(firstTransitionMs);
    expect(artText(el)).not.toBe(idleText);
  });
});
