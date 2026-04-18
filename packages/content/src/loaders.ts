import { load } from 'js-yaml';
import type { z } from 'zod';
import { renderMarkdown } from './markdown-render';

function parseFrontmatter(raw: string): { data: Record<string, unknown>; content: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, content: raw };
  return {
    data: (load(match[1] ?? '') ?? {}) as Record<string, unknown>,
    content: match[2] ?? '',
  };
}

export async function loadMarkdownEntity<T extends z.ZodType>(
  raw: string,
  schema: T,
  filename: string,
): Promise<z.infer<T> & { bodyHtml: string }> {
  const { data, content } = parseFrontmatter(raw);
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    throw new Error(
      `[content] ${filename}: frontmatter validation failed - ${parsed.error.message}`,
    );
  }
  const bodyHtml = await renderMarkdown(content);
  return Object.assign({}, parsed.data as z.infer<T>, { bodyHtml }) as z.infer<T> & {
    bodyHtml: string;
  };
}
