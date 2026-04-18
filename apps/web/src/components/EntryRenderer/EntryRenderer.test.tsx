import { describe, expect, it } from 'vitest';
import { render } from '@solidjs/testing-library';
import { EntryRenderer } from './EntryRenderer';
import { resetEntryIds, nextEntryId } from '@/terminal/entries';
import type { TerminalEntry } from '@/terminal/entries';

function textEntry(input: string, lines: string[]): TerminalEntry {
  resetEntryIds();
  return { id: nextEntryId(), input, kind: 'text', lines };
}

describe('EntryRenderer', () => {
  it('renders the input echo', () => {
    const { getByText } = render(() => <EntryRenderer entry={textEntry('help', ['hi'])} />);
    expect(getByText('help')).toBeInTheDocument();
  });

  it('renders the text body', () => {
    const { getByText } = render(() => <EntryRenderer entry={textEntry('x', ['hello world'])} />);
    expect(getByText('hello world')).toBeInTheDocument();
  });
});
