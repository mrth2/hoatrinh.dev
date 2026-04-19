import { cleanup, fireEvent, render } from '@solidjs/testing-library';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Avatar } from './Avatar';

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

describe('Avatar', () => {
  afterEach(() => cleanup());

  it('renders the idle frame by default', () => {
    mockMatchMedia((q) => q.includes('reduce'));
    const { getByTestId } = render(() => <Avatar />);
    const el = getByTestId('avatar');
    expect(el.textContent?.length ?? 0).toBeGreaterThan(100);
  });

  it('stays on idle when prefers-reduced-motion is set', () => {
    vi.useFakeTimers();
    mockMatchMedia((q) => q.includes('reduce'));
    const { getByTestId } = render(() => <Avatar />);
    const el = getByTestId('avatar');
    const first = el.textContent ?? '';
    vi.advanceTimersByTime(5000);
    expect(el.textContent).toBe(first);
    vi.useRealTimers();
  });

  it('cycles through wave frames on mount without reduced motion', async () => {
    vi.useFakeTimers();
    mockMatchMedia(() => false);
    const { getByTestId } = render(() => <Avatar />);
    const el = getByTestId('avatar');
    const idle = el.textContent ?? '';
    await vi.advanceTimersByTimeAsync(250);
    expect(el.textContent).not.toBe(idle);
    // Run out the cycle (6 frames x 250ms)
    await vi.advanceTimersByTimeAsync(6 * 250 + 50);
    expect(el.textContent).toBe(idle);
    vi.useRealTimers();
  });

  it('replays the wave when clicked while idle', async () => {
    vi.useFakeTimers();
    mockMatchMedia(() => false);
    const { getByTestId } = render(() => <Avatar />);
    const el = getByTestId('avatar');
    // Let initial cycle finish.
    await vi.advanceTimersByTimeAsync(6 * 250 + 100);
    const idle = el.textContent ?? '';
    fireEvent.click(el);
    await vi.advanceTimersByTimeAsync(250);
    expect(el.textContent).not.toBe(idle);
    vi.useRealTimers();
  });
});
