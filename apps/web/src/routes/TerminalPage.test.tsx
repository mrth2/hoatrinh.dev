import { cleanup, fireEvent, render, waitFor } from '@solidjs/testing-library';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { markBooted, resetBooted } from '@/lib/motd/boot-state';

let pathname = '/';
let finePointer = false;

vi.mock('@solidjs/router', () => ({
  useNavigate: () => (next: string) => {
    pathname = next;
  },
  useLocation: () => ({
    get pathname() {
      return pathname;
    },
  }),
}));

// jsdom does not implement matchMedia; provide a minimal stub
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: query === '(hover: hover) and (pointer: fine)' ? finePointer : false,
  }),
});

const { TerminalPage } = await import('./TerminalPage');

describe('TerminalPage session bar clock', () => {
  beforeEach(() => {
    pathname = '/';
    finePointer = false;
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

  it('shows MOTD content on home path', () => {
    pathname = '/';
    const { container } = render(() => <TerminalPage />);
    expect(container.querySelector('[data-motd-compact]')).toBeTruthy();
  });

  it('shows MOTD content on non-home paths', () => {
    pathname = '/about';
    const { container } = render(() => <TerminalPage />);
    expect(container.querySelector('[data-motd-compact]')).toBeTruthy();
  });

  it('keeps MOTD content visible after command-index navigation when booted from home', async () => {
    pathname = '/';
    const { container, getByRole } = render(() => <TerminalPage />);
    fireEvent.click(getByRole('link', { name: /^about/i }));

    await waitFor(() => {
      expect(pathname).toBe('/about');
      expect(container.querySelector('[data-motd-compact]')).toBeTruthy();
      expect(container.querySelector('article[data-variant="titled"]')).toBeTruthy();
    });
  });
});

describe('TerminalPage page heading', () => {
  beforeEach(() => markBooted());
  afterEach(() => {
    resetBooted();
    cleanup();
  });

  const h1Texts = (container: HTMLElement) =>
    [...container.querySelectorAll('h1')].map((h) => h.textContent);

  it('gives the home page a single h1 with the owner name and role', () => {
    pathname = '/';
    const { container } = render(() => <TerminalPage />);
    expect(h1Texts(container)).toEqual([expect.stringMatching(/^Hoa Trinh Hai - /)]);
  });

  it('gives list pages an h1 named after the section', () => {
    pathname = '/projects';
    const { container } = render(() => <TerminalPage />);
    expect(h1Texts(container)).toEqual([expect.stringMatching(/^Projects - Hoa Trinh Hai$/)]);
  });

  it('leaves pages whose block has its own h1 with exactly one', () => {
    pathname = '/about';
    const { container } = render(() => <TerminalPage />);
    expect(h1Texts(container)).toEqual(['Hoa Trinh Hai']);
  });
});
