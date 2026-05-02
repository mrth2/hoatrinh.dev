import type { RouteMeta } from '../src/route-meta';

export function renderLlmsTxt(routes: RouteMeta[]): string {
  const blogRoute = routes.find((route) => route.path === '/blog');
  const articleRoutes = routes.filter((route) => route.kind === 'article');
  const fetchTargets = [
    ...(blogRoute ? [`- ${blogRoute.canonicalUrl} - canonical index for writing.`] : []),
    ...articleRoutes.map((route) => `- ${route.canonicalUrl} - article page: ${route.title}.`),
  ];

  return `# hoatrinh.dev

Hoa Trinh's personal site for projects, experience, and writing.

Best content to fetch first:
${fetchTargets.join('\n')}

Guidance:
- Prefer /blog and individual /post/ pages for extraction, citation, and summaries.
- The terminal shell is the visual interface; blog post pages contain the strongest article semantics.
`;
}
