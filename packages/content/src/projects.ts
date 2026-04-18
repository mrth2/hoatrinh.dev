import { loadMarkdownEntity } from './loaders';
import { type Project, ProjectFrontmatter } from './schema';

const rawFiles = import.meta.glob<string>('../markdown/projects/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
});

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

export function getProjects(opts: { featured?: boolean } = {}): Project[] {
  if (opts.featured === undefined) return projects;
  return projects.filter((p) => p.featured === opts.featured);
}

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug.toLowerCase());
}
