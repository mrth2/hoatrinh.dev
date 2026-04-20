import { loadMarkdownEntity } from './loaders';
import { type Experience, ExperienceFrontmatter } from './schema';

const rawFiles = import.meta.glob<string>('../markdown/experience/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
});

const entries: Experience[] = await Promise.all(
  Object.entries(rawFiles).map(async ([path, raw]) => {
    const filename = path.split('/').pop() ?? path;
    const entity = await loadMarkdownEntity(raw, ExperienceFrontmatter, filename);
    const stem = filename.replace(/\.md$/, '');
    if (stem !== entity.slug) {
      throw new Error(`[content] ${filename}: filename stem "${stem}" != slug "${entity.slug}"`);
    }
    return entity;
  }),
);

entries.sort((a, b) => (b.start > a.start ? 1 : b.start < a.start ? -1 : 0));

export function getExperience(): Experience[] {
  return entries;
}
