import { cleanup, render } from '@solidjs/testing-library';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { markBooted, resetBooted } from '@/lib/motd/boot-state';

vi.mock('@solidjs/router', () => ({
  useNavigate: () => () => {},
  useLocation: () => ({ pathname: '/' }),
}));

// jsdom does not implement matchMedia; provide a minimal stub
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (_query: string) => ({ matches: false }),
});

const { TerminalPage } = await import('./TerminalPage');

describe('TerminalPage session bar clock', () => {
  beforeEach(() => {
    markBooted();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-19T14:32:30Z'));
  });
  afterEach(() => {
    vi.useRealTimers();
    resetBooted();
    cleanup();
  });

  it('renders the current HH:MM in the session bar', () => {
    const { container } = render(() => <TerminalPage />);
    const time = container.querySelector('time[data-session-time]');
    expect(time?.textContent).toMatch(/^\d{2}:\d{2}$/);
  });

  it('updates the time when a minute rolls over', async () => {
    const { container } = render(() => <TerminalPage />);
    const timeEl = container.querySelector('time[data-session-time]') as HTMLElement;
    const initial = timeEl.textContent;
    vi.setSystemTime(new Date('2026-04-19T14:33:30Z'));
    await vi.advanceTimersByTimeAsync(30_000);
    expect(timeEl.textContent).not.toBe(initial);
    expect(timeEl.textContent).toMatch(/^\d{2}:\d{2}$/);
  });
});
