import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const blogDirUrl = new URL('../../../../packages/content/markdown/blog/', import.meta.url);

export function readBodyMarkdown(slug: string): string {
  const path = fileURLToPath(new URL(`${slug}.md`, blogDirUrl));
  const raw = readFileSync(path, 'utf8');
  return raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
}
