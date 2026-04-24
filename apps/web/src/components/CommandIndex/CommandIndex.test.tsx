import { cleanup, fireEvent, render } from '@solidjs/testing-library';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CommandIndex } from './CommandIndex';

describe('CommandIndex', () => {
  afterEach(cleanup);

  it('renders one button per command, excluding clear', () => {
    const { getAllByRole } = render(() => <CommandIndex onSuggestion={() => {}} />);
    const buttons = getAllByRole('button');
    const names = buttons.map((b) => b.textContent?.split(/\s+/)[0]?.trim());
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

  it('calls onSuggestion with the command name when a row is clicked', () => {
    const onSuggestion = vi.fn();
    const { getByRole } = render(() => <CommandIndex onSuggestion={onSuggestion} />);
    fireEvent.click(getByRole('button', { name: /^about\b/i }));
    expect(onSuggestion).toHaveBeenCalledWith('about');
  });

  it('calls onSuggestion with "projects" when projects row is clicked', () => {
    const onSuggestion = vi.fn();
    const { getByRole } = render(() => <CommandIndex onSuggestion={onSuggestion} />);
    fireEvent.click(getByRole('button', { name: /^projects\b/i }));
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
    const projectsBtn = getByRole('button', { name: /^projects\b/i });
    const experienceBtn = getByRole('button', { name: /^experience\b/i });
    const skillsBtn = getByRole('button', { name: /^skills\b/i });
    const aboutBtn = getByRole('button', { name: /^about\b/i });
    const contactBtn = getByRole('button', { name: /^contact\b/i });
    const askBtn = getByRole('button', { name: /^\/ask\b/i });
    const helpBtn = getByRole('button', { name: /^help\b/i });

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
