import { getBlogPosts, getProfile, getProjects } from '@hoatrinh/content';
import { generateHydrationScript, renderToString } from 'solid-js/web';
import { App } from './App';
import type { RouteMeta, SiteIdentity } from './route-meta';
import {
  canonicalUrlForPath,
  normalizeSiteUrl,
  ogImagePathForPath,
  ogImageUrlForPath,
} from './route-meta';

export type RenderResult = { body: string; head: string };
export type { RouteMeta, SiteIdentity };

export async function renderUrl(url: string): Promise<RenderResult> {
  const body = renderToString(() => <App url={url} />);
  const head = generateHydrationScript();
  return { body, head };
}

export function getSiteIdentity(siteUrl?: string): SiteIdentity {
  const profile = getProfile();
  const normalizedSiteUrl = normalizeSiteUrl(siteUrl);
  return {
    siteUrl: normalizedSiteUrl,
    siteName: 'hoatrinh.dev',
    locale: 'en_US',
    authorName: profile.name,
    authorRole: profile.role,
    authorUrl: normalizedSiteUrl,
    sameAs: profile.links.map((link) => link.href),
  };
}

type RouteInput = Omit<RouteMeta, 'canonicalUrl' | 'ogImagePath' | 'ogImageUrl'>;

function withUrls(route: RouteInput, siteUrl?: string): RouteMeta {
  return {
    ...route,
    canonicalUrl: canonicalUrlForPath(route.path, siteUrl),
    ogImagePath: ogImagePathForPath(route.path),
    ogImageUrl: ogImageUrlForPath(route.path, siteUrl),
  };
}

export function getRoutes(siteUrl?: string): RouteMeta[] {
  const profile = getProfile();
  const posts = getBlogPosts();
  const newestPostDate = posts.reduce(
    (newest, post) => (post.date > newest ? post.date : newest),
    '',
  );
  const routes: RouteInput[] = [
    {
      path: '/',
      title: `${profile.name} - ${profile.role}`,
      description: `${profile.name} (Kyle), a senior software engineer in ${profile.location} with 14 years across frontend, full-stack, and AI-assisted systems.`,
      kind: 'page',
    },
    {
      path: '/about',
      title: `About - ${profile.name}`,
      description:
        'The long version: 14 years of engineering, the platform work behind OneQode, and the side products that keep the practice sharp.',
      kind: 'page',
    },
    {
      path: '/projects',
      title: `Projects - ${profile.name}`,
      description:
        'Products and experiments shipped solo: KeepGoing for developer momentum, Win95.fun for browser-native retro games, and PaceLingo for voice-first English practice.',
      kind: 'page',
    },
    {
      path: '/experience',
      title: `Experience - ${profile.name}`,
      description:
        '14 years of engineering roles, from PHP backends at Netlink to platform lead at OneQode: single sign-on, virtual data rooms, and design systems.',
      kind: 'page',
    },
    {
      path: '/skills',
      title: `Skills - ${profile.name}`,
      description:
        'The working stack: TypeScript, SolidJS, Vue and Nuxt, Astro, Bun, Cloudflare Workers, and agentic AI tooling like Claude Code and MCP.',
      kind: 'page',
    },
    {
      path: '/contact',
      title: `Contact - ${profile.name}`,
      description: `Reach ${profile.name} by email, GitHub, or LinkedIn about contract work, platform engineering, and AI-assisted delivery.`,
      kind: 'page',
    },
    {
      path: '/help',
      title: `Help - ${profile.name}`,
      description:
        'Every command the hoatrinh.dev terminal understands, from about and projects to post and ask, plus the aliases for each one.',
      kind: 'page',
      noindex: true,
    },
    {
      path: '/blog',
      title: `Blog - ${profile.name}`,
      description: `Writing from ${profile.name} on building, habits, and the work behind the work.`,
      kind: 'page',
      ...(newestPostDate === '' ? {} : { modifiedTime: newestPostDate }),
    },
    ...getProjects().map(
      (p): RouteInput => ({
        path: `/project/${p.slug}`,
        title: `${p.title} - ${profile.name}`,
        description: p.tagline,
        kind: 'page',
      }),
    ),
    ...posts.map(
      (p): RouteInput => ({
        path: `/post/${p.slug}`,
        title: `${p.title} - ${profile.name}`,
        description: p.excerpt,
        kind: 'article',
        publishedTime: p.date,
        modifiedTime: p.date,
        section: p.tag,
      }),
    ),
  ];

  return routes.map((route) => withUrls(route, siteUrl));
}
