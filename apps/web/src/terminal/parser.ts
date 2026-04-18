export type ParsedInput = { cmd: string; args: string[]; rest: string };

export function parseInput(raw: string): ParsedInput | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const [head, ...tail] = trimmed.split(/\s+/);
  if (!head) return null;
  const cmd = head.toLowerCase();
  const rest = trimmed.slice(head.length).trim();
  return { cmd, args: tail, rest };
}
