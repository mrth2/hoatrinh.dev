import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, cleanup } from '@solidjs/testing-library';
import { Motd } from './Motd';
import { markBooted, resetBooted } from '@/lib/motd/boot-state';

describe('Motd (compact mode)', () => {
  beforeEach(() => markBooted());     // force compact path
  afterEach(() => { resetBooted(); cleanup(); });

  it('renders the name line', () => {
    const { getByText } = render(() => <Motd onSuggestion={() => {}} />);
    expect(getByText(/hoa trinh hai/i)).toBeInTheDocument();
  });

  it('renders the role and location line', () => {
    const { getByText } = render(() => <Motd onSuggestion={() => {}} />);
    expect(getByText(/senior software engineer/i)).toBeInTheDocument();
  });

  it('renders help and about as buttons', () => {
    const { getByRole } = render(() => <Motd onSuggestion={() => {}} />);
    expect(getByRole('button', { name: 'help' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'about' })).toBeInTheDocument();
  });

  it('calls onSuggestion with "help"', () => {
    const onSuggestion = vi.fn();
    const { getByRole } = render(() => <Motd onSuggestion={onSuggestion} />);
    fireEvent.click(getByRole('button', { name: 'help' }));
    expect(onSuggestion).toHaveBeenCalledWith('help');
  });

  it('calls onSuggestion with "about"', () => {
    const onSuggestion = vi.fn();
    const { getByRole } = render(() => <Motd onSuggestion={onSuggestion} />);
    fireEvent.click(getByRole('button', { name: 'about' }));
    expect(onSuggestion).toHaveBeenCalledWith('about');
  });

  it('renders a compact status line with a rotating subline', () => {
    const { container } = render(() => <Motd onSuggestion={() => {}} />);
    expect(container.querySelector('[data-motd-compact]')).toBeTruthy();
  });
});

describe('Motd (boot mode)', () => {
  beforeEach(() => {
    resetBooted();
    // Force prefers-reduced-motion: reduce so boot renders final state instantly
    // (we test the char-streamer path separately in char-streamer.test.ts)
    const original = window.matchMedia;
    (window as any).__origMM = original;
    window.matchMedia = (q: string) =>
      ({ matches: q.includes('prefers-reduced-motion'), media: q, addEventListener() {}, removeEventListener() {} }) as unknown as MediaQueryList;
  });
  afterEach(() => {
    window.matchMedia = (window as any).__origMM;
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
