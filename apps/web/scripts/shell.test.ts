import { describe, expect, it } from 'vitest';
import type { RouteMeta, SiteIdentity } from '../src/route-meta';
import { OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH } from '../src/route-meta';
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

const site: SiteIdentity = {
  siteUrl: 'https://hoatrinh.dev',
  siteName: 'Hoa Trinh',
  locale: 'en_US',
  authorName: 'Hoa Trinh',
  authorRole: 'Software Engineer',
  authorUrl: 'https://hoatrinh.dev/about',
  sameAs: ['https://github.com/mrth2', 'https://linkedin.com/in/hoatrinh'],
};

const homeMeta: RouteMeta = {
  path: '/',
  title: 'Hoa Trinh',
  description: 'Terminal-style personal portfolio for Hoa Trinh.',
  kind: 'page',
  canonicalUrl: 'https://hoatrinh.dev/',
  ogImagePath: '/og/index.png',
  ogImageUrl: 'https://hoatrinh.dev/og/index.png',
};

const pageMeta: RouteMeta = {
  path: '/blog',
  title: 'Blog - Hoa Trinh',
  description: 'Writing from Hoa Trinh on building, habits, and the work behind the work.',
  kind: 'page',
  canonicalUrl: 'https://hoatrinh.dev/blog',
  ogImagePath: '/og/blog.png',
  ogImageUrl: 'https://hoatrinh.dev/og/blog.png',
};

const articleMeta: RouteMeta = {
  path: '/post/ai-made-learning-fun-again',
  title: 'AI made learning fun again - Hoa Trinh',
  description: 'AI made learning fun again after years of friction.',
  kind: 'article',
  canonicalUrl: 'https://hoatrinh.dev/post/ai-made-learning-fun-again',
  ogImagePath: '/og/post/ai-made-learning-fun-again.png',
  ogImageUrl: 'https://hoatrinh.dev/og/post/ai-made-learning-fun-again.png',
  publishedTime: '2026-04-30',
  modifiedTime: '2026-04-30',
  section: 'learning',
};

const projectMeta: RouteMeta = {
  path: '/project/hoatrinh-dev',
  title: 'hoatrinh.dev - Hoa Trinh',
  description: 'The terminal-style portfolio you are reading right now.',
  kind: 'page',
  canonicalUrl: 'https://hoatrinh.dev/project/hoatrinh-dev',
  ogImagePath: '/og/project/hoatrinh-dev.png',
  ogImageUrl: 'https://hoatrinh.dev/og/project/hoatrinh-dev.png',
};

function extractJsonLd(html: string): unknown[] {
  const matches = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)];
  return matches.map((m) => JSON.parse(m[1] as string));
}

describe('renderShellHtml', () => {
  it('renders website metadata for non-article routes', () => {
    const html = renderShellHtml(
      template,
      '<main>Blog</main>',
      '<script>hydration()</script>',
      pageMeta,
      site,
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
    const html = renderShellHtml(template, '<article>Post</article>', '', articleMeta, site);

    expect(html).toContain('<meta property="og:type" content="article" />');
    expect(html).toContain('<meta property="article:published_time" content="2026-04-30" />');
    expect(html).toContain('<meta property="article:modified_time" content="2026-04-30" />');
    expect(html).toContain('<meta property="article:section" content="learning" />');
    expect(html).toContain('<meta property="article:author" content="Hoa Trinh" />');

    const jsonLd = extractJsonLd(html);
    const blogPosting = jsonLd.find(
      (node): node is Record<string, unknown> =>
        typeof node === 'object' &&
        node !== null &&
        (node as { '@type'?: unknown })['@type'] === 'BlogPosting',
    );
    expect(blogPosting).toBeDefined();
    expect(blogPosting?.url).toBe('https://hoatrinh.dev/post/ai-made-learning-fun-again');
    expect(blogPosting?.datePublished).toBe('2026-04-30');
  });

  it('escapes HTML in head tags and JSON-LD script contents', () => {
    const html = renderShellHtml(
      template,
      '',
      '',
      {
        ...articleMeta,
        title: 'A & B < C',
        description: 'Use "quotes" & <tags>',
      },
      site,
    );

    expect(html).toContain('<title>A &amp; B &lt; C</title>');
    expect(html).toContain('content="Use &quot;quotes&quot; &amp; &lt;tags&gt;"');
    expect(html).toContain('A & B \\u003c C');
    expect(html).toContain('Use \\"quotes\\" & \\u003ctags>');
  });

  it('renders Open Graph and Twitter tags on a page route', () => {
    const html = renderShellHtml(template, '', '', pageMeta, site);

    expect(html).toContain('<meta property="og:site_name" content="Hoa Trinh" />');
    expect(html).toContain('<meta property="og:locale" content="en_US" />');
    expect(html).toContain(
      '<meta property="og:image" content="https://hoatrinh.dev/og/blog.png" />',
    );
    expect(html).toContain(`<meta property="og:image:width" content="${OG_IMAGE_WIDTH}" />`);
    expect(html).toContain(`<meta property="og:image:height" content="${OG_IMAGE_HEIGHT}" />`);
    expect(html).toContain(
      '<meta property="og:image:alt" content="Open Graph card for Blog - Hoa Trinh" />',
    );

    expect(html).toContain('<meta name="twitter:card" content="summary_large_image" />');
    expect(html).toContain('<meta name="twitter:title" content="Blog - Hoa Trinh" />');
    expect(html).toContain(
      '<meta name="twitter:description" content="Writing from Hoa Trinh on building, habits, and the work behind the work." />',
    );
    expect(html).toContain(
      '<meta name="twitter:image" content="https://hoatrinh.dev/og/blog.png" />',
    );
    expect(html).not.toContain('twitter:site');
    expect(html).not.toContain('twitter:creator');
  });

  it('emits robots noindex only when meta.noindex is true', () => {
    const noindexHtml = renderShellHtml(template, '', '', { ...pageMeta, noindex: true }, site);
    expect(noindexHtml).toContain('<meta name="robots" content="noindex,follow" />');

    const indexableHtml = renderShellHtml(template, '', '', pageMeta, site);
    expect(indexableHtml).not.toContain('name="robots"');
  });

  it('renders WebSite and Person JSON-LD on the home route only', () => {
    const homeHtml = renderShellHtml(template, '', '', homeMeta, site);
    const homeJsonLd = extractJsonLd(homeHtml);
    const graphNode = homeJsonLd.find(
      (node): node is Record<string, unknown> =>
        typeof node === 'object' && node !== null && '@graph' in (node as Record<string, unknown>),
    );
    expect(graphNode).toBeDefined();
    const graph = graphNode?.['@graph'] as Record<string, unknown>[];
    const website = graph.find((n) => n['@type'] === 'WebSite');
    const person = graph.find((n) => n['@type'] === 'Person');

    expect(website?.name).toBe('Hoa Trinh');
    expect(website?.url).toBe('https://hoatrinh.dev');
    expect(website?.inLanguage).toBe('en-US');
    expect(person?.name).toBe('Hoa Trinh');
    expect(person?.jobTitle).toBe('Software Engineer');
    expect(person?.url).toBe('https://hoatrinh.dev/about');
    expect(person?.sameAs).toEqual(site.sameAs);

    const pageHtml = renderShellHtml(template, '', '', pageMeta, site);
    expect(pageHtml).not.toContain('WebSite');
    expect(pageHtml).not.toContain('"@graph"');
  });

  it('enriches the BlogPosting JSON-LD with author, publisher, image, and mainEntityOfPage', () => {
    const html = renderShellHtml(template, '', '', articleMeta, site);
    const jsonLd = extractJsonLd(html);
    const blogPosting = jsonLd.find(
      (node): node is Record<string, unknown> =>
        typeof node === 'object' &&
        node !== null &&
        (node as { '@type'?: unknown })['@type'] === 'BlogPosting',
    );
    expect(blogPosting).toBeDefined();
    expect(blogPosting?.author).toEqual({
      '@type': 'Person',
      name: 'Hoa Trinh',
      url: 'https://hoatrinh.dev/about',
    });
    expect(blogPosting?.publisher).toEqual({
      '@type': 'Person',
      name: 'Hoa Trinh',
      url: 'https://hoatrinh.dev/about',
    });
    expect(blogPosting?.image).toBe('https://hoatrinh.dev/og/post/ai-made-learning-fun-again.png');
    expect(blogPosting?.mainEntityOfPage).toEqual({
      '@type': 'WebPage',
      '@id': 'https://hoatrinh.dev/post/ai-made-learning-fun-again',
    });
    expect(blogPosting?.inLanguage).toBe('en-US');
    expect(blogPosting?.articleSection).toBe('learning');
  });

  it('renders a BreadcrumbList on post routes back to Home > Blog', () => {
    const html = renderShellHtml(template, '', '', articleMeta, site);
    const jsonLd = extractJsonLd(html);
    const breadcrumb = jsonLd.find(
      (node): node is Record<string, unknown> =>
        typeof node === 'object' &&
        node !== null &&
        (node as { '@type'?: unknown })['@type'] === 'BreadcrumbList',
    );
    expect(breadcrumb).toBeDefined();
    const items = breadcrumb?.itemListElement as Record<string, unknown>[];
    expect(items).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://hoatrinh.dev' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://hoatrinh.dev/blog' },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'AI made learning fun again - Hoa Trinh',
        item: 'https://hoatrinh.dev/post/ai-made-learning-fun-again',
      },
    ]);
  });

  it('renders a BreadcrumbList on project routes back to Home > Projects', () => {
    const html = renderShellHtml(template, '', '', projectMeta, site);
    const jsonLd = extractJsonLd(html);
    const breadcrumb = jsonLd.find(
      (node): node is Record<string, unknown> =>
        typeof node === 'object' &&
        node !== null &&
        (node as { '@type'?: unknown })['@type'] === 'BreadcrumbList',
    );
    expect(breadcrumb).toBeDefined();
    const items = breadcrumb?.itemListElement as Record<string, unknown>[];
    expect(items).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://hoatrinh.dev' },
      { '@type': 'ListItem', position: 2, name: 'Projects', item: 'https://hoatrinh.dev/projects' },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'hoatrinh.dev - Hoa Trinh',
        item: 'https://hoatrinh.dev/project/hoatrinh-dev',
      },
    ]);
  });

  it('does not render a BreadcrumbList on plain page routes', () => {
    const html = renderShellHtml(template, '', '', pageMeta, site);
    expect(html).not.toContain('BreadcrumbList');
  });

  it('prevents </script> injection from breaking out of JSON-LD via title or description', () => {
    const html = renderShellHtml(
      template,
      '',
      '',
      {
        ...articleMeta,
        title: 'Escape</script><script>alert(1)</script>',
        description: 'Also </script> here',
      },
      site,
    );

    expect(html).not.toContain('</script><script>alert(1)</script>');
    const jsonLd = extractJsonLd(html);
    const blogPosting = jsonLd.find(
      (node): node is Record<string, unknown> =>
        typeof node === 'object' &&
        node !== null &&
        (node as { '@type'?: unknown })['@type'] === 'BlogPosting',
    );
    expect(blogPosting?.headline).toBe('Escape</script><script>alert(1)</script>');
    expect(blogPosting?.description).toBe('Also </script> here');
  });
});
