import { getBlogPosts, getProfile, getProjects } from '@hoatrinh/content';
import { generateHydrationScript, renderToString } from 'solid-js/web';
import { App } from './App';
import { canonicalUrlForPath, type RouteMeta } from './route-meta';

export type RenderResult = { body: string; head: string };
export type { RouteMeta };

export async function renderUrl(url: string): Promise<RenderResult> {
  const body = renderToString(() => <App url={url} />);
  const head = generateHydrationScript();
  return { body, head };
}

export function getRoutes(siteUrl?: string): RouteMeta[] {
  const profile = getProfile();
  const canonical = (path: string) => canonicalUrlForPath(path, siteUrl);
  return [
    {
      path: '/',
      title: `${profile.name} - ${profile.role}`,
      description: `${profile.name}. ${profile.role}. ${profile.location}.`,
      kind: 'page',
      canonicalUrl: canonical('/'),
    },
    {
      path: '/about',
      title: `About - ${profile.name}`,
      description: profile.role,
      kind: 'page',
      canonicalUrl: canonical('/about'),
    },
    {
      path: '/projects',
      title: `Projects - ${profile.name}`,
      description: 'Things I have built.',
      kind: 'page',
      canonicalUrl: canonical('/projects'),
    },
    {
      path: '/experience',
      title: `Experience - ${profile.name}`,
      description: 'Past roles.',
      kind: 'page',
      canonicalUrl: canonical('/experience'),
    },
    {
      path: '/skills',
      title: `Skills - ${profile.name}`,
      description: 'Tech and tools I work with.',
      kind: 'page',
      canonicalUrl: canonical('/skills'),
    },
    {
      path: '/contact',
      title: `Contact - ${profile.name}`,
      description: 'Ways to reach me.',
      kind: 'page',
      canonicalUrl: canonical('/contact'),
    },
    {
      path: '/help',
      title: `Help - ${profile.name}`,
      description: 'Commands available.',
      kind: 'page',
      canonicalUrl: canonical('/help'),
    },
    {
      path: '/blog',
      title: `Blog - ${profile.name}`,
      description: `Writing from ${profile.name} on building, habits, and the work behind the work.`,
      kind: 'page',
      canonicalUrl: canonical('/blog'),
    },
    ...getProjects().map((p) => ({
      path: `/project/${p.slug}`,
      title: `${p.title} - ${profile.name}`,
      description: p.tagline,
      kind: 'page' as const,
      canonicalUrl: canonical(`/project/${p.slug}`),
    })),
    ...getBlogPosts().map((p) => ({
      path: `/post/${p.slug}`,
      title: `${p.title} - ${profile.name}`,
      description: p.excerpt,
      kind: 'article' as const,
      canonicalUrl: canonical(`/post/${p.slug}`),
      publishedTime: p.date,
      modifiedTime: p.date,
      section: p.tag,
    })),
  ];
}
