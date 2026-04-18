import matter from 'gray-matter';
import type { z } from 'zod';
import { renderMarkdown } from './markdown-render';

export async function loadMarkdownEntity<T extends z.ZodType>(
  raw: string,
  schema: T,
  filename: string,
): Promise<z.infer<T> & { bodyHtml: string }> {
  const { data, content } = matter(raw);
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
