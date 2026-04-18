import type { ClearAction, TerminalEntry } from './entries';

export type CommandContext = {
  navigate?: (path: string) => void;
};

export type CommandResult = TerminalEntry | Promise<TerminalEntry> | ClearAction;

export type CommandSpec = {
  name: string;
  aliases?: string[];
  summary: string;
  argsHint?: string;
  route?: string | ((args: string[], rest: string) => string | null);
  handler: (args: string[], rest: string, ctx: CommandContext) => CommandResult;
};

export type Registry = {
  specs: CommandSpec[];
  byName: Map<string, CommandSpec>;
  vocab: string[];
};

export function createRegistry(specs: CommandSpec[]): Registry {
  const byName = new Map<string, CommandSpec>();
  for (const spec of specs) {
    byName.set(spec.name, spec);
    for (const alias of spec.aliases ?? []) byName.set(alias, spec);
  }
  const vocab = Array.from(byName.keys());
  return { specs, byName, vocab };
}

export function resolveCommand(registry: Registry, input: string): CommandSpec | undefined {
  return registry.byName.get(input.toLowerCase());
}
