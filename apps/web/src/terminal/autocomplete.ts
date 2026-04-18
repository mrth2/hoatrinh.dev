export type AutocompleteOptions = {
  commands: readonly string[];
  projectSlugs: readonly string[];
};

export type AutocompleteResult = {
  completion: string | null;
  candidates: string[];
};

export function autocomplete(input: string, opts: AutocompleteOptions): AutocompleteResult {
  const trimmed = input.trimStart();
  if (!trimmed.includes(' ')) {
    return completeAgainst(trimmed, opts.commands);
  }
  const [cmd, ...rest] = trimmed.split(/\s+/);
  if (cmd === 'project' && rest.length === 1) {
    const arg = rest[0] ?? '';
    const sub = completeAgainst(arg, opts.projectSlugs);
    if (sub.completion) return { completion: `project ${sub.completion}`, candidates: [] };
    return { completion: null, candidates: sub.candidates.map((c) => `project ${c}`) };
  }
  return { completion: null, candidates: [] };
}

function completeAgainst(prefix: string, vocab: readonly string[]): AutocompleteResult {
  if (!prefix) return { completion: null, candidates: [] };
  const matches = vocab.filter((v) => v.startsWith(prefix.toLowerCase()));
  if (matches.length === 1) return { completion: matches[0] ?? null, candidates: [] };
  if (matches.length > 1) return { completion: null, candidates: matches };
  return { completion: null, candidates: [] };
}
