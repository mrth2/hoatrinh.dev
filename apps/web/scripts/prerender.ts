import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getBlogPosts } from '@hoatrinh/content';
import { createServer } from 'vite';
import solid from 'vite-plugin-solid';
import type { RouteMeta } from '../src/route-meta';
import { renderLlmsTxt } from './build-llms';
import { renderRobotsTxt } from './build-robots';
import { renderRss } from './build-rss';
import { renderSitemap } from './build-sitemap';
import { shellHtml } from './shell';

type RenderResult = { body: string; head: string };
type EntryServer = {
  renderUrl: (url: string) => Promise<RenderResult>;
  getRoutes: (siteUrl?: string) => RouteMeta[];
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
const { renderUrl, getRoutes } = (await vite.ssrLoadModule('/src/entry-server.tsx')) as EntryServer;

const routes = getRoutes(SITE_URL);

async function renderRoute(route: RouteMeta) {
  const rendered = await renderUrl(route.path);
  const html = shellHtml(rendered.body, rendered.head, route);
  const outPath =
    route.path === '/' ? join(DIST, 'index.html') : join(DIST, route.path.slice(1), 'index.html');
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, html);
  console.log(`  prerendered ${route.path} -> ${outPath.replace(DIST, 'dist')}`);
}

async function renderNotFound() {
  const notFound = await renderUrl('/__not_found__');
  await writeFile(
    join(DIST, '404.html'),
    shellHtml(notFound.body, notFound.head, {
      path: '/404',
      kind: 'page',
      title: 'Not Found',
      description: 'Route not found.',
      canonicalUrl: `${SITE_URL}/404`,
    }),
  );
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
  renderNotFound(),
  writeSitemap(),
  writeRss(),
  writeRobots(),
  writeLlms(),
]);
console.log('  wrote sitemap.xml, robots.txt, llms.txt, rss.xml, and 404.html');

await vite.close();
