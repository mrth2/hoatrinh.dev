import { JSON_SCHEMA } from 'js-yaml';
import { loadMarkdownEntity } from './loaders';
import { loadRawMarkdownFallback } from './raw-markdown';
import { type BlogPost, BlogPostFrontmatter } from './schema';

const WORDS_PER_MINUTE = 220;

function computeReadingTime(raw: string): number {
  const words = raw.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

export async function __loadBlogFromRawFiles(
  rawFiles: Record<string, string>,
): Promise<BlogPost[]> {
  const resolved: BlogPost[] = [];

  for (const [path, raw] of Object.entries(rawFiles)) {
    const filename = path.split('/').pop() ?? path;
    const entity = await loadMarkdownEntity(raw, BlogPostFrontmatter, filename, {
      frontmatter: {
        yamlLoadOptions: {
          schema: JSON_SCHEMA,
        },
      },
    });
    const stem = filename.replace(/\.md$/, '');
    if (stem !== entity.slug) {
      throw new Error(`[content] ${filename}: filename stem "${stem}" != slug "${entity.slug}"`);
    }
    if (entity.draft === true) continue;

    const body = raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
    const readingTime = entity.readingTime ?? computeReadingTime(body);
    resolved.push({ ...entity, readingTime, bodyHtml: entity.bodyHtml });
  }

  resolved.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return resolved;
}

const rawFiles =
  typeof (globalThis as { Bun?: unknown }).Bun !== 'undefined'
    ? await loadRawMarkdownFallback('../markdown/blog/*.md', import.meta.url)
    : import.meta.glob<string>('../markdown/blog/*.md', {
        eager: true,
        query: '?raw',
        import: 'default',
      });

const posts: BlogPost[] = await __loadBlogFromRawFiles(rawFiles);

export function getBlogPosts(): BlogPost[] {
  return [...posts];
}

export function getBlogPost(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug.toLowerCase());
}
