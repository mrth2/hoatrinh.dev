import { describe, expect, it } from 'vitest';
import type { RouteMeta } from '../src/route-meta';
import { renderShellHtml } from './shell';

const template = `<!doctype html>
<html lang="en">
  <head>
    <title>hoatrinh.dev</title>
  </head>
  <body>
    <div id="app"></div>
  </body>
</html>`;

const pageMeta: RouteMeta = {
  path: '/blog',
  title: 'Blog - Hoa Trinh',
  description: 'Writing from Hoa Trinh on building, habits, and the work behind the work.',
  kind: 'page',
  canonicalUrl: 'https://hoatrinh.dev/blog',
};

const articleMeta: RouteMeta = {
  path: '/post/ai-made-learning-fun-again',
  title: 'AI made learning fun again - Hoa Trinh',
  description: 'AI made learning fun again after years of friction.',
  kind: 'article',
  canonicalUrl: 'https://hoatrinh.dev/post/ai-made-learning-fun-again',
  publishedTime: '2026-04-30',
  modifiedTime: '2026-04-30',
  section: 'learning',
};

describe('renderShellHtml', () => {
  it('renders website metadata for non-article routes', () => {
    const html = renderShellHtml(
      template,
      '<main>Blog</main>',
      '<script>hydration()</script>',
      pageMeta,
    );

    expect(html).toContain('<title>Blog - Hoa Trinh</title>');
    expect(html).toContain(
      '<meta name="description" content="Writing from Hoa Trinh on building, habits, and the work behind the work." />',
    );
    expect(html).toContain('<meta property="og:type" content="website" />');
    expect(html).toContain('<link rel="canonical" href="https://hoatrinh.dev/blog" />');
    expect(html).not.toContain('article:published_time');
    expect(html).not.toContain('BlogPosting');
    expect(html).toContain('<div id="app"><main>Blog</main></div>');
  });

  it('renders article metadata and one minimal BlogPosting JSON-LD block for post routes', () => {
    const html = renderShellHtml(template, '<article>Post</article>', '', articleMeta);

    expect(html).toContain('<meta property="og:type" content="article" />');
    expect(html).toContain('<meta property="article:published_time" content="2026-04-30" />');
    expect(html).toContain('<meta property="article:modified_time" content="2026-04-30" />');
    expect(html).toContain('<meta property="article:section" content="learning" />');
    expect(html.match(/"@type":"BlogPosting"/g)).toHaveLength(1);
    expect(html).toContain('"url":"https://hoatrinh.dev/post/ai-made-learning-fun-again"');
    expect(html).toContain('"datePublished":"2026-04-30"');
  });

  it('escapes HTML in head tags and JSON-LD script contents', () => {
    const html = renderShellHtml(template, '', '', {
      ...articleMeta,
      title: 'A & B < C',
      description: 'Use "quotes" & <tags>',
    });

    expect(html).toContain('<title>A &amp; B &lt; C</title>');
    expect(html).toContain('content="Use &quot;quotes&quot; &amp; &lt;tags&gt;"');
    expect(html).toContain('A & B \\u003c C');
    expect(html).toContain('Use \\"quotes\\" & \\u003ctags>');
  });
});
