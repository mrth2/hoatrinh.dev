import { cleanup, fireEvent, render } from '@solidjs/testing-library';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CommandIndex } from './CommandIndex';

describe('CommandIndex', () => {
  afterEach(cleanup);

  it('renders one button per command, excluding clear', () => {
    const { getAllByRole } = render(() => <CommandIndex onSuggestion={() => {}} />);
    const buttons = getAllByRole('button');
    const names = buttons.map((b) => b.textContent?.split(/\s+/)[0]?.trim());
    expect(names).toEqual(['about', 'projects', 'experience', 'skills', 'contact', 'help']);
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
});
