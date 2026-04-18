export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev: number[] = Array.from({ length: b.length + 1 }, (_, i) => i);
  let curr: number[] = new Array(b.length + 1).fill(0);
  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min((curr[j - 1] ?? 0) + 1, (prev[j] ?? 0) + 1, (prev[j - 1] ?? 0) + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[b.length] ?? 0;
}

export function nearestMatches(input: string, vocab: readonly string[], limit = 3): string[] {
  const needle = input.toLowerCase();
  const scored = vocab
    .map((v) => ({ v, score: v.startsWith(needle) ? -1 : levenshtein(needle, v) }))
    .filter((x) => x.score <= 2)
    .sort((a, b) => a.score - b.score)
    .slice(0, limit);
  return scored.map((x) => x.v);
}
