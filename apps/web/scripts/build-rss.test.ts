import type { BlogPost } from '@hoatrinh/content';
import { describe, expect, it } from 'vitest';
import { renderRss } from './build-rss';

const SITE = 'https://hoatrinh.dev';

function fixturePost(over: Partial<BlogPost> = {}): BlogPost {
  return {
    slug: 'sample',
    title: 'A sample post',
    date: '2026-04-20',
    excerpt: 'Excerpt.',
    tag: 'test',
    bodyHtml: '<p>Hello & welcome.</p>',
    readingTime: 1,
    ...over,
  } as BlogPost;
}

describe('renderRss', () => {
  it('renders an RSS 2.0 feed with channel metadata', () => {
    const xml = renderRss([fixturePost()], SITE);
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('<rss version="2.0"');
    expect(xml).toContain('xmlns:content="http://purl.org/rss/1.0/modules/content/"');
    expect(xml).toContain('xmlns:atom="http://www.w3.org/2005/Atom"');
    expect(xml).toContain(
      `<atom:link href="${SITE}/rss.xml" rel="self" type="application/rss+xml" />`,
    );
    expect(xml).toContain('<title>hoatrinh.dev blog</title>');
  });

  it('emits one <item> per post with link, guid, pubDate, description, content:encoded', () => {
    const xml = renderRss([fixturePost()], SITE);
    expect(xml).toContain(`<link>${SITE}/blog/sample</link>`);
    expect(xml).toContain(`<guid isPermaLink="true">${SITE}/blog/sample</guid>`);
    expect(xml).toMatch(/<pubDate>Mon, 20 Apr 2026 00:00:00 GMT<\/pubDate>/);
    expect(xml).toContain('<description>Excerpt.</description>');
    expect(xml).toContain('<content:encoded><![CDATA[<p>Hello & welcome.</p>]]></content:encoded>');
  });

  it('emits <enclosure> when cover is set, absolutizing site-relative paths', () => {
    const xml = renderRss([fixturePost({ cover: '/images/blog/cover.png' })], SITE);
    expect(xml).toContain(
      `<enclosure url="${SITE}/images/blog/cover.png" type="image/png" length="0" />`,
    );
  });

  it('passes absolute cover URLs through unchanged', () => {
    const xml = renderRss([fixturePost({ cover: 'https://cdn.example.com/x.jpg' })], SITE);
    expect(xml).toContain(
      '<enclosure url="https://cdn.example.com/x.jpg" type="image/jpeg" length="0" />',
    );
  });

  it('escapes special chars in title, excerpt, and link', () => {
    const xml = renderRss([fixturePost({ title: 'A & B < C', excerpt: 'x > y "z"' })], SITE);
    expect(xml).toContain('<title>A &amp; B &lt; C</title>');
    expect(xml).toContain('<description>x &gt; y &quot;z&quot;</description>');
  });

  it('orders items by date descending', () => {
    const xml = renderRss(
      [
        fixturePost({ slug: 'older', date: '2026-04-01' }),
        fixturePost({ slug: 'newer', date: '2026-04-25' }),
      ],
      SITE,
    );
    const olderIdx = xml.indexOf('/blog/older');
    const newerIdx = xml.indexOf('/blog/newer');
    expect(newerIdx).toBeLessThan(olderIdx);
  });

  it('escapes CDATA terminator in bodyHtml so the section cannot close early', () => {
    const xml = renderRss([fixturePost({ bodyHtml: '<p>before ]]> after</p>' })], SITE);
    expect(xml).toContain(']]]]><![CDATA[>');
    const cdataStart = xml.indexOf('<![CDATA[');
    const cdataEnd = xml.indexOf(']]></content:encoded>');
    expect(cdataStart).toBeGreaterThan(-1);
    expect(cdataEnd).toBeGreaterThan(cdataStart);
    const contentWithoutCdata = xml.slice(cdataStart + '<![CDATA['.length, cdataEnd);
    expect(contentWithoutCdata).toContain(']]]]><![CDATA[>');
  });
});
