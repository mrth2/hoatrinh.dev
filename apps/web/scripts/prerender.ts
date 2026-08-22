import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getBlogPosts } from '@hoatrinh/content';
import { createServer } from 'vite';
import solid from 'vite-plugin-solid';
import type { RouteMeta, SiteIdentity } from '../src/route-meta';
import { ogImagePathForPath, ogImageUrlForPath } from '../src/route-meta';
import { pathToCommand } from '../src/terminal/path-to-command';
import { renderLlmsTxt } from './build-llms';
import { renderRobotsTxt } from './build-robots';
import { renderRss } from './build-rss';
import { renderSitemap } from './build-sitemap';
import { renderOgPng } from './render-og';
import { shellHtml } from './shell';

type RenderResult = { body: string; head: string };
type EntryServer = {
  renderUrl: (url: string) => Promise<RenderResult>;
  getRoutes: (siteUrl?: string) => RouteMeta[];
  getSiteIdentity: (siteUrl?: string) => SiteIdentity;
};

const DIST = fileURLToPath(new URL('../dist', import.meta.url));
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SITE_URL = (process.env.SITE_URL || 'https://hoatrinh.dev').replace(/\/$/, '');

const vite = await createServer({
  root: ROOT,
  configFile: false,
  server: { middlewareMode: true },
  appType: 'custom',
  plugins: [solid({ ssr: true })],
  resolve: { alias: { '@': new URL('../src', import.meta.url).pathname } },
  ssr: { noExternal: ['solid-js', '@solidjs/router', '@hoatrinh/content'] },
});
const { renderUrl, getRoutes, getSiteIdentity } = (await vite.ssrLoadModule(
  '/src/entry-server.tsx',
)) as EntryServer;

const routes = getRoutes(SITE_URL);
const site = getSiteIdentity(SITE_URL);

/** The card shows the route title without the trailing " - <name>" suffix. */
function cardTitle(title: string): string {
  const suffix = ` - ${site.authorName}`;
  return title.endsWith(suffix) ? title.slice(0, -suffix.length) : title;
}

async function renderOgImage(route: RouteMeta) {
  const png = await renderOgPng({
    command: pathToCommand(route.path) ?? 'whoami',
    title: cardTitle(route.title),
    description: route.description,
    footer: `${site.authorName} \u00b7 ${site.authorRole}`,
  });
  const outPath = join(DIST, route.ogImagePath.slice(1));
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, png);
}

async function renderRoute(route: RouteMeta) {
  const rendered = await renderUrl(route.path);
  const html = shellHtml(rendered.body, rendered.head, route, site);
  const outPath =
    route.path === '/' ? join(DIST, 'index.html') : join(DIST, route.path.slice(1), 'index.html');
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, html);
  console.log(`  prerendered ${route.path} -> ${outPath.replace(DIST, 'dist')}`);
}

const notFoundMeta: RouteMeta = {
  path: '/404',
  kind: 'page',
  title: 'Not Found',
  description: 'That route does not exist. Type `help` to see the available commands.',
  canonicalUrl: `${SITE_URL}/404`,
  ogImagePath: ogImagePathForPath('/404'),
  ogImageUrl: ogImageUrlForPath('/404', SITE_URL),
  noindex: true,
};

async function renderNotFound() {
  const notFound = await renderUrl('/__not_found__');
  await writeFile(
    join(DIST, '404.html'),
    shellHtml(notFound.body, notFound.head, notFoundMeta, site),
  );
  await renderOgImage(notFoundMeta);
}

async function writeSitemap() {
  await writeFile(join(DIST, 'sitemap.xml'), renderSitemap(routes));
}

async function writeRss() {
  const posts = getBlogPosts();
  const xml = renderRss(posts, SITE_URL);
  await writeFile(join(DIST, 'rss.xml'), xml);
}

async function writeRobots() {
  await writeFile(join(DIST, 'robots.txt'), renderRobotsTxt(SITE_URL));
}

async function writeLlms() {
  await writeFile(join(DIST, 'llms.txt'), renderLlmsTxt(routes));
}

await Promise.all([
  ...routes.map(renderRoute),
  ...routes.map(renderOgImage),
  renderNotFound(),
  writeSitemap(),
  writeRss(),
  writeRobots(),
  writeLlms(),
]);
console.log(`  rendered ${routes.length + 1} OG cards -> dist/og/`);
console.log('  wrote sitemap.xml, robots.txt, llms.txt, rss.xml, and 404.html');

await vite.close();
