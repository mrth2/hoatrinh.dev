import { getBlogPosts, getProfile, getProjects } from '@hoatrinh/content';
import { generateHydrationScript, renderToString } from 'solid-js/web';
import { App } from './App';

export type RenderResult = { body: string; head: string };
export type RouteDef = { path: string; title: string; description: string };

export async function renderUrl(url: string): Promise<RenderResult> {
  const body = renderToString(() => <App url={url} />);
  const head = generateHydrationScript();
  return { body, head };
}

export function getRoutes(): RouteDef[] {
  const profile = getProfile();
  return [
    {
      path: '/',
      title: `${profile.name} - ${profile.role}`,
      description: `${profile.name}. ${profile.role}. ${profile.location}.`,
    },
    { path: '/about', title: `About - ${profile.name}`, description: profile.role },
    { path: '/projects', title: `Projects - ${profile.name}`, description: 'Things I have built.' },
    { path: '/experience', title: `Experience - ${profile.name}`, description: 'Past roles.' },
    {
      path: '/skills',
      title: `Skills - ${profile.name}`,
      description: 'Tech and tools I work with.',
    },
    { path: '/contact', title: `Contact - ${profile.name}`, description: 'Ways to reach me.' },
    { path: '/help', title: `Help - ${profile.name}`, description: 'Commands available.' },
    { path: '/blog', title: `Blog - ${profile.name}`, description: 'Things I write.' },
    ...getProjects().map((p) => ({
      path: `/project/${p.slug}`,
      title: `${p.title} - ${profile.name}`,
      description: p.tagline,
    })),
    ...getBlogPosts().map((p) => ({
      path: `/post/${p.slug}`,
      title: `${p.title} - ${profile.name}`,
      description: p.excerpt,
    })),
  ];
}
