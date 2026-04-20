import { beforeEach, describe, expect, it } from 'vitest';
import { ensureSessionStorage } from '@/test-utils/session-storage';
import { registry } from './commands';
import { resetEntryIds } from './entries';
import { execute } from './execute';
import { createRegistry } from './registry';
import { createTerminalStore } from './store';

describe('execute', () => {
  beforeEach(() => {
    ensureSessionStorage().clear();
    resetEntryIds();
  });

  it('appends a profile entry for "about"', async () => {
    const [state, setState] = createTerminalStore();
    await execute('about', { state, setState, registry, navigate: () => {} });
    expect(state.entries).toHaveLength(1);
    expect(state.entries[0]?.kind).toBe('profile');
  });

  it('ignores blank input', async () => {
    const [state, setState] = createTerminalStore();
    await execute('   ', { state, setState, registry, navigate: () => {} });
    expect(state.entries).toHaveLength(0);
  });

  it('appends error entry for unknown command', async () => {
    const [state, setState] = createTerminalStore();
    await execute('xyzzy', { state, setState, registry, navigate: () => {} });
    const entry = state.entries[0];
    expect(entry?.kind).toBe('error');
  });

  it('suggests nearest match for typo', async () => {
    const [state, setState] = createTerminalStore();
    await execute('abot', { state, setState, registry, navigate: () => {} });
    const entry = state.entries[0];
    expect(entry?.kind).toBe('error');
    if (entry?.kind === 'error') expect(entry.suggestions).toContain('about');
  });

  it('clears entries on "clear"', async () => {
    const [state, setState] = createTerminalStore();
    await execute('about', { state, setState, registry, navigate: () => {} });
    await execute('clear', { state, setState, registry, navigate: () => {} });
    expect(state.entries).toHaveLength(0);
  });

  it('calls navigate for routable commands', async () => {
    const [state, setState] = createTerminalStore();
    let visited: string | null = null;
    await execute('projects', {
      state,
      setState,
      registry,
      navigate: (p) => {
        visited = p;
      },
    });
    expect(visited).toBe('/projects');
  });

  it('sets executing state while awaiting async command handlers', async () => {
    const [state, setState] = createTerminalStore();
    let resolvePending!: (value: {
      id: string;
      input: string;
      kind: 'text';
      lines: string[];
    }) => void;
    const pending = new Promise<{ id: string; input: string; kind: 'text'; lines: string[] }>(
      (resolve) => {
        resolvePending = resolve;
      },
    );

    const localRegistry = createRegistry([
      {
        name: 'slow',
        summary: 'slow command',
        handler: () => pending,
      },
    ]);

    const run = execute('slow', { state, setState, registry: localRegistry, navigate: () => {} });
    expect(state.isExecuting).toBe(true);

    resolvePending({ id: 'e-local', input: 'slow', kind: 'text', lines: ['done'] });
    await run;
    expect(state.isExecuting).toBe(false);
  });
});
