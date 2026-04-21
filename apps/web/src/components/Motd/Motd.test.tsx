import { cleanup, fireEvent, render } from '@solidjs/testing-library';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { markBooted, resetBooted } from '@/lib/motd/boot-state';
import { Motd } from './Motd';

describe('Motd (compact mode)', () => {
  beforeEach(() => markBooted()); // force compact path
  afterEach(() => {
    resetBooted();
    cleanup();
  });

  it('renders avatar and command index in compact mode', () => {
    const { getByTestId, getByRole } = render(() => <Motd onSuggestion={() => {}} />);
    expect(getByTestId('avatar')).toBeInTheDocument();
    expect(getByRole('navigation', { name: /command index/i })).toBeInTheDocument();
  });

  it('renders help and about as buttons via CommandIndex', () => {
    const { getByRole } = render(() => <Motd onSuggestion={() => {}} />);
    expect(getByRole('button', { name: /^help\b/i })).toBeInTheDocument();
    expect(getByRole('button', { name: /^about\b/i })).toBeInTheDocument();
  });

  it('calls onSuggestion with "help"', () => {
    const onSuggestion = vi.fn();
    const { getByRole } = render(() => <Motd onSuggestion={onSuggestion} />);
    fireEvent.click(getByRole('button', { name: /^help\b/i }));
    expect(onSuggestion).toHaveBeenCalledWith('help');
  });

  it('calls onSuggestion with "about"', () => {
    const onSuggestion = vi.fn();
    const { getByRole } = render(() => <Motd onSuggestion={onSuggestion} />);
    fireEvent.click(getByRole('button', { name: /^about\b/i }));
    expect(onSuggestion).toHaveBeenCalledWith('about');
  });

  it('renders compact mode container', () => {
    const { container } = render(() => <Motd onSuggestion={() => {}} />);
    expect(container.querySelector('[data-motd-compact]')).toBeTruthy();
  });

  it('does not render the old inline "type help to see commands" hint', () => {
    const { queryByText } = render(() => <Motd onSuggestion={() => {}} />);
    expect(queryByText(/type help to see commands/i)).toBeNull();
  });

  it('renders the command index header', () => {
    const { getByRole } = render(() => <Motd onSuggestion={() => {}} />);
    expect(getByRole('navigation', { name: /command index/i })).toBeInTheDocument();
  });
});

describe('Motd (boot mode)', () => {
  let origMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    resetBooted();
    // Force prefers-reduced-motion: reduce so boot renders final state instantly
    // (we test the char-streamer path separately in char-streamer.test.ts)
    origMatchMedia = window.matchMedia;
    window.matchMedia = (q: string) =>
      ({
        matches: q.includes('prefers-reduced-motion'),
        media: q,
        addEventListener() {},
        removeEventListener() {},
      }) as unknown as MediaQueryList;
  });
  afterEach(() => {
    window.matchMedia = origMatchMedia;
    resetBooted();
    cleanup();
  });

  it('renders the boot lines (initializing, greeting, last login, tip) when no booted key and motion is reduced', () => {
    const { container, getByText } = render(() => <Motd onSuggestion={() => {}} />);
    expect(getByText(/initializing session/i)).toBeInTheDocument();
    expect(container.querySelector('[data-motd-boot]')).toBeTruthy();
  });

  it('sets the booted key after rendering', () => {
    render(() => <Motd onSuggestion={() => {}} />);
    expect(sessionStorage.getItem('hoa:booted')).toBe('1');
  });
});
