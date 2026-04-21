import { loadMarkdownEntity } from './loaders';
import { loadRawMarkdownFallback } from './raw-markdown';
import { type Project, ProjectFrontmatter } from './schema';

const rawFiles =
  typeof import.meta.glob === 'function'
    ? import.meta.glob<string>('../markdown/projects/*.md', {
        eager: true,
        query: '?raw',
        import: 'default',
      })
    : await loadRawMarkdownFallback('../markdown/projects/*.md', import.meta.url);

const projects: Project[] = await Promise.all(
  Object.entries(rawFiles).map(async ([path, raw]) => {
    const filename = path.split('/').pop() ?? path;
    const entity = await loadMarkdownEntity(raw, ProjectFrontmatter, filename);
    const stem = filename.replace(/\.md$/, '');
    if (stem !== entity.slug) {
      throw new Error(`[content] ${filename}: filename stem "${stem}" != slug "${entity.slug}"`);
    }
    return entity;
  }),
);

projects.sort((a, b) => {
  if (a.featured !== b.featured) return a.featured ? -1 : 1;
  return b.year - a.year;
});

export function getProjects(
  opts: { featured?: boolean; includeUnlisted?: boolean } = {},
): Project[] {
  const filtered = opts.includeUnlisted ? projects : projects.filter((p) => p.listed);
  if (opts.featured === undefined) return filtered;
  return filtered.filter((p) => p.featured === opts.featured);
}

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug.toLowerCase());
}
