import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { verifyAiFetch } from './verify-ai-fetch';

let tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.map((dir) => rm(dir, { recursive: true, force: true })));
  tempDirs = [];
});

async function createValidDist(): Promise<string> {
  const dist = await mkdtemp(join(tmpdir(), 'ai-fetch-dist-'));
  tempDirs.push(dist);

  await mkdir(join(dist, 'post', 'ai-made-learning-fun-again'), { recursive: true });
  await writeFile(
    join(dist, 'robots.txt'),
    `User-agent: *
Allow: /

Sitemap: https://hoatrinh.dev/sitemap.xml
`,
  );
  await writeFile(
    join(dist, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://hoatrinh.dev/blog</loc></url>
  <url><loc>https://hoatrinh.dev/post/ai-made-learning-fun-again</loc><lastmod>2026-04-30</lastmod></url>
</urlset>
`,
  );
  await writeFile(
    join(dist, 'llms.txt'),
    `# hoatrinh.dev

Best content to fetch first:
- https://hoatrinh.dev/blog - canonical index for writing.
- https://hoatrinh.dev/post/ai-made-learning-fun-again - article page: AI made learning fun again - Hoa Trinh.

Guidance:
- Prefer /blog and individual /post/ pages for extraction, citation, and summaries.
`,
  );
  await writeFile(
    join(dist, 'post', 'ai-made-learning-fun-again', 'index.html'),
    `<!doctype html>
<html lang="en">
  <head>
    <title>AI made learning fun again - Hoa Trinh</title>
    <meta name="description" content="AI made learning fun again after years of friction." />
    <meta property="og:type" content="article" />
    <meta property="article:published_time" content="2026-04-30" />
    <meta property="article:section" content="learning" />
    <link rel="canonical" href="https://hoatrinh.dev/post/ai-made-learning-fun-again" />
    <script type="application/ld+json">{"@context":"https://schema.org","@type":"BlogPosting","headline":"AI made learning fun again - Hoa Trinh","description":"AI made learning fun again after years of friction.","url":"https://hoatrinh.dev/post/ai-made-learning-fun-again","datePublished":"2026-04-30"}</script>
  </head>
  <body>
    <article><header><h1>AI made learning fun again</h1><time datetime="2026-04-30">2026-04-30</time></header><footer><a href="/blog">back</a></footer></article>
  </body>
</html>`,
  );

  return dist;
}

describe('verifyAiFetch', () => {
  it('passes when all discovery files and post article surfaces exist', async () => {
    const dist = await createValidDist();

    await expect(verifyAiFetch(dist)).resolves.toEqual({
      checked: [
        'robots.txt',
        'sitemap.xml',
        'llms.txt',
        'post/ai-made-learning-fun-again/index.html',
      ],
    });
  });

  it('fails when llms.txt does not contain blog-first guidance', async () => {
    const dist = await createValidDist();
    await writeFile(
      join(dist, 'llms.txt'),
      `# hoatrinh.dev

Best content to fetch first:
Guidance:
- Prefer individual /post/ pages for extraction, citation, and summaries.
`,
    );

    await expect(verifyAiFetch(dist)).rejects.toThrow(
      'llms.txt must mention /blog and individual /post/ pages',
    );
  });

  it('fails when llms.txt omits fetch guidance heading', async () => {
    const dist = await createValidDist();
    await writeFile(
      join(dist, 'llms.txt'),
      `# hoatrinh.dev

Guidance:
- Prefer /blog and individual /post/ pages for extraction, citation, and summaries.
`,
    );

    await expect(verifyAiFetch(dist)).rejects.toThrow('llms.txt must include fetch guidance');
  });

  it('fails when the post HTML has zero or multiple BlogPosting blocks', async () => {
    const dist = await createValidDist();
    const postHtml = join(dist, 'post', 'ai-made-learning-fun-again', 'index.html');
    await writeFile(postHtml, '<html><head></head><body><article></article></body></html>');

    await expect(verifyAiFetch(dist)).rejects.toThrow(
      'post HTML must contain exactly one BlogPosting JSON-LD block',
    );
  });
});
