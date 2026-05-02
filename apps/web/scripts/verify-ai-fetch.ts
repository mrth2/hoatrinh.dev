import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEFAULT_SITE_URL, normalizeSiteUrl } from '../src/route-meta';

export type VerifyAiFetchResult = {
  checked: string[];
};

export async function verifyAiFetch(
  distDir = fileURLToPath(new URL('../dist', import.meta.url)),
  siteUrl = process.env.SITE_URL ?? DEFAULT_SITE_URL,
): Promise<VerifyAiFetchResult> {
  const baseUrl = normalizeSiteUrl(siteUrl);

  const robots = await readText(distDir, 'robots.txt');
  assertIncludes(
    robots,
    `Sitemap: ${baseUrl}/sitemap.xml`,
    'robots.txt must reference sitemap.xml',
  );

  const sitemap = await readText(distDir, 'sitemap.xml');
  assertIncludes(sitemap, `${baseUrl}/blog`, 'sitemap.xml must include /blog');
  assertIncludes(sitemap, `${baseUrl}/post/`, 'sitemap.xml must include at least one /post/ URL');

  const llms = await readText(distDir, 'llms.txt');
  assertIncludes(llms, 'Best content to fetch first:', 'llms.txt must include fetch guidance');
  assertIncludes(
    llms,
    'Prefer /blog and individual /post/ pages',
    'llms.txt must mention /blog and individual /post/ pages',
  );

  const postHtmlPath = await firstPostHtmlPath(distDir);
  const postHtml = await readFile(postHtmlPath.absolute, 'utf8');

  const blogPostingMatches = postHtml.match(/"@type":"BlogPosting"/g) ?? [];
  if (blogPostingMatches.length !== 1) {
    throw new Error('post HTML must contain exactly one BlogPosting JSON-LD block');
  }

  assertIncludes(postHtml, '<link rel="canonical"', 'post HTML must contain a canonical link');
  assertIncludes(
    postHtml,
    '<meta name="description"',
    'post HTML must contain a description meta tag',
  );
  assertIncludes(
    postHtml,
    '<meta property="og:type" content="article"',
    'post HTML must use og:type article',
  );
  assertIncludes(
    postHtml,
    '<meta property="article:published_time"',
    'post HTML must contain article publish metadata',
  );
  assertIncludes(postHtml, '<article', 'post HTML must contain article markup');
  assertIncludes(postHtml, '<time datetime="', 'post HTML must contain a datetime time element');

  return {
    checked: ['robots.txt', 'sitemap.xml', 'llms.txt', postHtmlPath.relative],
  };
}

async function readText(distDir: string, relativePath: string): Promise<string> {
  return readFile(join(distDir, relativePath), 'utf8');
}

async function firstPostHtmlPath(distDir: string): Promise<{ absolute: string; relative: string }> {
  const postDir = join(distDir, 'post');
  const entries = await readdir(postDir, { withFileTypes: true });
  const firstPost = entries
    .filter((entry) => entry.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name))[0];
  if (!firstPost) {
    throw new Error('dist/post must contain at least one prerendered post directory');
  }

  const relative = `post/${firstPost.name}/index.html`;
  return { absolute: join(distDir, relative), relative };
}

function assertIncludes(haystack: string, needle: string, message: string): void {
  if (!haystack.includes(needle)) {
    throw new Error(message);
  }
}

if (import.meta.main) {
  const result = await verifyAiFetch(undefined, process.env.SITE_URL);
  console.log(`AI fetch verification passed: ${result.checked.join(', ')}`);
}
