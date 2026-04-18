import { describe, expect, it } from 'vitest';
import { render } from '@solidjs/testing-library';
import { EntryRenderer } from './EntryRenderer';
import { resetEntryIds, nextEntryId } from '@/terminal/entries';
import type { TerminalEntry } from '@/terminal/entries';

function textEntry(input: string, lines: string[]): TerminalEntry {
  resetEntryIds();
  return { id: nextEntryId(), input, kind: 'text', lines };
}

function projectsEntry(count: number): TerminalEntry {
  resetEntryIds();
  const data = Array.from({ length: count }, (_, i) => ({
    slug: `p${i}`, title: `Project ${i}`, year: 2024, role: 'r',
    status: 'shipped', tech: [], links: {}, bodyHtml: '', tagline: 't',
  })) as unknown as Extract<TerminalEntry, { kind: 'projects' }>['data'];
  return { id: nextEntryId(), input: 'projects', kind: 'projects', data };
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

  it('wraps text entries in a plain OutputPanel', () => {
    const { container } = render(() => <EntryRenderer entry={textEntry('x', ['y'])} />);
    expect(container.querySelector('[data-variant="plain"]')).not.toBeNull();
  });

  it('wraps projects entries in a titled OutputPanel with count meta', () => {
    const { container, getByText } = render(() => <EntryRenderer entry={projectsEntry(3)} />);
    expect(container.querySelector('[data-variant="titled"]')).not.toBeNull();
    expect(getByText('3 projects')).toBeInTheDocument();
  });

  it('pluralises meta for exactly one project', () => {
    const { getByText } = render(() => <EntryRenderer entry={projectsEntry(1)} />);
    expect(getByText('1 project')).toBeInTheDocument();
  });
});
