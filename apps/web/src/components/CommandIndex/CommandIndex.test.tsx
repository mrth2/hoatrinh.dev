import { cleanup, render } from '@solidjs/testing-library';
import { afterEach, describe, expect, it } from 'vitest';
import { CommandIndex } from './CommandIndex';

describe('CommandIndex', () => {
  afterEach(cleanup);

  it('renders one button per command, excluding clear', () => {
    const { getAllByRole } = render(() => <CommandIndex onSuggestion={() => {}} />);
    const buttons = getAllByRole('button');
    const names = buttons.map((b) => b.textContent?.split(/\s+/)[0]?.trim());
    expect(names).toEqual(['about', 'projects', 'experience', 'skills', 'contact', 'help']);
  });
});
