import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = fileURLToPath(new URL('../dist', import.meta.url));
const PORT = Number(process.env.PORT ?? 4173);

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

function resolve(pathname: string): string | null {
  const clean = pathname.replace(/\/+$/, '');
  const relative = clean.replace(/^\/+/, '');
  const candidates =
    relative === ''
      ? [join(DIST, 'index.html')]
      : [join(DIST, relative), join(DIST, relative, 'index.html'), join(DIST, `${relative}.html`)];
  for (const c of candidates) {
    if (existsSync(c) && statSync(c).isFile()) return c;
  }
  return null;
}

Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const file = resolve(url.pathname);
    if (file) {
      const ext = file.slice(file.lastIndexOf('.'));
      return new Response(Bun.file(file), {
        headers: { 'content-type': MIME[ext] ?? 'application/octet-stream' },
      });
    }
    const notFound = join(DIST, '404.html');
    if (existsSync(notFound)) {
      return new Response(Bun.file(notFound), {
        status: 404,
        headers: { 'content-type': 'text/html; charset=utf-8' },
      });
    }
    return new Response('Not found', { status: 404 });
  },
});

console.log(`preview: http://localhost:${PORT}`);
