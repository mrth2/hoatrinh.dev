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

  const result = await Promise.resolve(spec.handler(parsed.args, parsed.rest, {}));

  if ('action' in result && result.action === 'clear') {
    ctx.setState('entries', []);
    return;
  }

  const entry = result as TerminalEntry;
  ctx.setState('entries', (list) => [...list, entry]);

  const routeVal =
    typeof spec.route === 'function' ? spec.route(parsed.args, parsed.rest) : spec.route;
  if (routeVal) ctx.navigate(routeVal);
}
