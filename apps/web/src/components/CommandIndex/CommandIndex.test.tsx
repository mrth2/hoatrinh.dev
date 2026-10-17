import { cleanup, fireEvent, render } from '@solidjs/testing-library';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CommandIndex } from './CommandIndex';

describe('CommandIndex', () => {
  afterEach(cleanup);

  it('renders one row per command, excluding clear', () => {
    const { container } = render(() => <CommandIndex onSuggestion={() => {}} />);
    const rows = [...container.querySelectorAll('li > a, li > button')];
    const names = rows.map((b) => b.textContent?.split(/\s+/)[0]?.trim());
    expect(names).toEqual([
      'about',
      'projects',
      'experience',
      'skills',
      'contact',
      'blog',
      '/ask',
      'help',
    ]);
  });

  it('renders routed commands as links and /ask as a button', () => {
    const { getByRole } = render(() => <CommandIndex onSuggestion={() => {}} />);
    expect(getByRole('link', { name: /^about\b/i })).toHaveAttribute('href', '/about');
    expect(getByRole('link', { name: /^blog\b/i })).toHaveAttribute('href', '/blog');
    expect(getByRole('button', { name: /^\/ask\b/i })).toBeInTheDocument();
  });

  it('leaves modified clicks to the browser so links can open in a new tab', () => {
    const onSuggestion = vi.fn();
    const { getByRole } = render(() => <CommandIndex onSuggestion={onSuggestion} />);
    const link = getByRole('link', { name: /^about\b/i });
    let preventedByRow: boolean | undefined;
    // Solid delegates to document, so a window listener sees the row's decision; then stop jsdom navigating.
    const spy = (e: Event) => {
      preventedByRow = e.defaultPrevented;
      e.preventDefault();
    };
    window.addEventListener('click', spy);
    fireEvent.click(link, { metaKey: true });
    window.removeEventListener('click', spy);
    expect(preventedByRow).toBe(false);
    expect(onSuggestion).not.toHaveBeenCalled();
  });

  it('calls onSuggestion with the command name when a row is clicked', () => {
    const onSuggestion = vi.fn();
    const { getByRole } = render(() => <CommandIndex onSuggestion={onSuggestion} />);
    fireEvent.click(getByRole('link', { name: /^about\b/i }));
    expect(onSuggestion).toHaveBeenCalledWith('about');
  });

  it('calls onSuggestion with "projects" when projects row is clicked', () => {
    const onSuggestion = vi.fn();
    const { getByRole } = render(() => <CommandIndex onSuggestion={onSuggestion} />);
    fireEvent.click(getByRole('link', { name: /^projects\b/i }));
    expect(onSuggestion).toHaveBeenCalledWith('projects');
  });

  it('calls onSuggestion with "/ask " when /ask row is clicked', () => {
    const onSuggestion = vi.fn();
    const { getByRole } = render(() => <CommandIndex onSuggestion={onSuggestion} />);
    fireEvent.click(getByRole('button', { name: /^\/ask\b/i }));
    expect(onSuggestion).toHaveBeenCalledWith('/ask ');
  });

  it('renders counts for projects, experience, and skills only', () => {
    const { getByRole } = render(() => <CommandIndex onSuggestion={() => {}} />);
    const projectsBtn = getByRole('link', { name: /^projects\b/i });
    const experienceBtn = getByRole('link', { name: /^experience\b/i });
    const skillsBtn = getByRole('link', { name: /^skills\b/i });
    const aboutBtn = getByRole('link', { name: /^about\b/i });
    const contactBtn = getByRole('link', { name: /^contact\b/i });
    const askBtn = getByRole('button', { name: /^\/ask\b/i });
    const helpBtn = getByRole('link', { name: /^help\b/i });

    const metaOf = (el: HTMLElement) =>
      (el.querySelector('[data-meta]') as HTMLElement | null)?.textContent?.trim() ?? '';

    expect(metaOf(projectsBtn)).toMatch(/^\d+$/);
    expect(metaOf(experienceBtn)).toMatch(/^\d+$/);
    expect(metaOf(skillsBtn)).toMatch(/^\d+$/);
    expect(metaOf(aboutBtn)).toBe('');
    expect(metaOf(contactBtn)).toBe('');
    expect(metaOf(askBtn)).toBe('');
    expect(metaOf(helpBtn)).toBe('');
  });
});
