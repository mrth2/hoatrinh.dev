import { type HelpEntry, nextEntryId } from '../entries';
import type { CommandSpec } from '../registry';

export function makeHelpHandler(getSpecs: () => CommandSpec[]) {
  return function helpHandler(_args: string[], _rest: string, _ctx: unknown): HelpEntry {
    const commands = getSpecs().map((s) => ({
      name: s.name,
      usage: s.argsHint ? `${s.name} ${s.argsHint}` : s.name,
      summary: s.summary,
    }));
    return { id: nextEntryId(), input: 'help', kind: 'help', data: { commands } };
  };
}
