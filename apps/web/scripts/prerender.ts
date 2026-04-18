import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import solid from 'vite-plugin-solid';
import { shellHtml } from './shell';

type RenderResult = { body: string; head: string };
type RouteDef = { path: string; title: string; description: string };
type EntryServer = {
  renderUrl: (url: string) => Promise<RenderResult>;
  getRoutes: () => RouteDef[];
};

const DIST = fileURLToPath(new URL('../dist', import.meta.url));
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SITE_URL = process.env.SITE_URL || 'https://hoatrinh.dev';

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

const routes = getRoutes();

for (const route of routes) {
  const rendered = await renderUrl(route.path);
  const html = shellHtml(rendered.body, rendered.head, {
    title: route.title,
    description: route.description,
    url: `${SITE_URL}${route.path === '/' ? '' : route.path}`,
  });
  const outPath = route.path === '/' ? join(DIST, 'index.html') : join(DIST, route.path.slice(1), 'index.html');
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, html);
  console.log(`  prerendered ${route.path} -> ${outPath.replace(DIST, 'dist')}`);
}

const notFound = await renderUrl('/__not_found__');
await writeFile(
  join(DIST, '404.html'),
  shellHtml(notFound.body, notFound.head, {
    title: 'Not Found',
    description: 'Route not found.',
    url: `${SITE_URL}/404`,
  }),
);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map((r) => `  <url><loc>${SITE_URL}${r.path === '/' ? '' : r.path}</loc></url>`).join('\n')}
</urlset>
`;
await writeFile(join(DIST, 'sitemap.xml'), sitemap);
console.log('  wrote sitemap.xml and 404.html');

await vite.close();
