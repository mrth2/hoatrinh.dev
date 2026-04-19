export type AutocompleteOptions = {
  commands: readonly string[];
  projectSlugs: readonly string[];
};

export type AutocompleteResult = {
  completion: string | null;
  candidates: string[];
};

export type SuggestOptions = {
  canonicalNames: readonly string[];
  allNames: readonly string[];
  projectSlugs: readonly string[];
};

export function suggest(input: string, opts: SuggestOptions): string | null {
  const leading = /^\s*/.exec(input)?.[0] ?? '';
  const trimmed = input.trimStart();
  if (!trimmed) return null;

  if (!trimmed.includes(' ')) {
    const needle = trimmed.toLowerCase();
    const canonical = opts.canonicalNames.find((n) => n.startsWith(needle) && n !== needle);
    if (canonical) return leading + canonical;
    const alias = opts.allNames.find((n) => n.startsWith(needle) && n !== needle);
    return alias != null ? leading + alias : null;
  }

  const parts = trimmed.split(/\s+/);
  const cmd = parts[0];
  if (cmd === 'project' && parts.length === 2) {
    const arg = parts[1] ?? '';
    if (!arg) return null;
    const needle = arg.toLowerCase();
    const slug = opts.projectSlugs.find((s) => s.startsWith(needle) && s !== needle);
    if (slug) return `${leading}project ${slug}`;
  }

  return null;
}

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
  const needle = prefix.toLowerCase();
  const matches = vocab.filter((v) => v.startsWith(needle));
  if (matches.length === 1) return { completion: matches[0] ?? null, candidates: [] };
  if (matches.length > 1) return { completion: null, candidates: matches };
  return { completion: null, candidates: [] };
}
