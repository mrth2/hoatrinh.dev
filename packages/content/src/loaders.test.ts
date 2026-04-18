import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { loadMarkdownEntity } from './loaders';
import { ProjectFrontmatter } from './schema';

const goodPath = fileURLToPath(new URL('../markdown/__fixtures__/good.md', import.meta.url));
const badPath = fileURLToPath(new URL('../markdown/__fixtures__/bad.md', import.meta.url));

describe('loadMarkdownEntity', () => {
  it('parses and validates a good file', async () => {
    const raw = await readFile(goodPath, 'utf8');
    const result = await loadMarkdownEntity(raw, ProjectFrontmatter, 'good.md');
    expect(result.slug).toBe('good');
    expect(result.bodyHtml).toContain('<p>Body goes here.</p>');
  });

  it('throws on schema failure with filename in error', async () => {
    const raw = await readFile(badPath, 'utf8');
    await expect(loadMarkdownEntity(raw, ProjectFrontmatter, 'bad.md')).rejects.toThrow(/bad\.md/);
  });
});
