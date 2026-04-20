import type { SetStoreFunction } from 'solid-js/store';
import { nextEntryId, type TerminalEntry } from './entries';
import { parseInput } from './parser';
import { type Registry, resolveCommand } from './registry';
import type { TerminalState } from './store';
import { nearestMatches } from './suggestions';

export type ExecuteContext = {
  state: TerminalState;
  setState: SetStoreFunction<TerminalState>;
  registry: Registry;
  navigate: (path: string) => void;
};

export async function execute(raw: string, ctx: ExecuteContext): Promise<void> {
  const parsed = parseInput(raw);
  if (!parsed) return;

  const spec = resolveCommand(ctx.registry, parsed.cmd);
  if (!spec) {
    const entry: TerminalEntry = {
      id: nextEntryId(),
      input: raw.trim(),
      kind: 'error',
      message: `Command not found: ${parsed.cmd}`,
      suggestions: nearestMatches(parsed.cmd, ctx.registry.vocab),
    };
    ctx.setState('entries', (list) => [...list, entry]);
    return;
  }

  const handled = spec.handler(parsed.args, parsed.rest, {});
  const isAsync = handled instanceof Promise;

  let loadingId: string | null = null;
  if (isAsync) {
    loadingId = nextEntryId();
    ctx.setState('entries', (list) => [
      ...list,
      { id: loadingId as string, input: raw.trim(), kind: 'loading' },
    ]);
    ctx.setState('isExecuting', true);
  }

  let result: Awaited<typeof handled>;
  try {
    result = isAsync ? await handled : handled;
  } finally {
    if (isAsync) ctx.setState('isExecuting', false);
  }

  if ('action' in result && result.action === 'clear') {
    ctx.setState('entries', []);
    return;
  }

  const entry = result as TerminalEntry;
  if (loadingId !== null) {
    ctx.setState('entries', (list) => list.map((e) => (e.id === loadingId ? entry : e)));
  } else {
    ctx.setState('entries', (list) => [...list, entry]);
  }

  const routeVal =
    typeof spec.route === 'function' ? spec.route(parsed.args, parsed.rest) : spec.route;
  if (routeVal) ctx.navigate(routeVal);
}
