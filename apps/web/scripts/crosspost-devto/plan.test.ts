import { describe, expect, it } from 'vitest';
import { buildPayload, computePlan, normalizeExisting, payloadHash } from './plan';
import type { DevtoArticle, PlanPost } from './types';

const SITE = 'https://hoatrinh.dev';

function post(over: Partial<PlanPost> = {}): PlanPost {
  return {
    slug: 'sample',
    title: 'A sample post',
    date: '2026-04-20',
    excerpt: 'Excerpt.',
    tag: 'test',
    bodyHtml: '<p>Body.</p>',
    readingTime: 1,
    bodyMarkdown: 'Body.',
    ...over,
  } as PlanPost;
}

describe('buildPayload', () => {
  it('uses tag as default when tags is absent', () => {
    const payload = buildPayload(post(), SITE);
    expect(payload.tags).toEqual(['test']);
    expect(payload.canonical_url).toBe(`${SITE}/blog/sample`);
    expect(payload.main_image).toBeNull();
    expect(payload.published).toBe(true);
    expect(payload.body_markdown).toBe('Body.');
  });

  it('caps tags at 4 and absolutizes site-relative cover', () => {
    const payload = buildPayload(
      post({ tags: ['a', 'b', 'c', 'd'], cover: '/images/x.png' }),
      SITE,
    );
    expect(payload.tags).toEqual(['a', 'b', 'c', 'd']);
    expect(payload.main_image).toBe(`${SITE}/images/x.png`);
  });

  it('passes absolute cover URLs through', () => {
    const payload = buildPayload(post({ cover: 'https://cdn.example.com/x.jpg' }), SITE);
    expect(payload.main_image).toBe('https://cdn.example.com/x.jpg');
  });
});

describe('payloadHash', () => {
  it('is stable regardless of tag order', () => {
    const a = buildPayload(post({ tags: ['a', 'b', 'c'] }), SITE);
    const b = buildPayload(post({ tags: ['c', 'a', 'b'] }), SITE);
    expect(payloadHash(a)).toBe(payloadHash(b));
  });

  it('differs when body changes', () => {
    const a = buildPayload(post({ bodyMarkdown: 'Body one.' }), SITE);
    const b = buildPayload(post({ bodyMarkdown: 'Body two.' }), SITE);
    expect(payloadHash(a)).not.toBe(payloadHash(b));
  });
});

describe('normalizeExisting', () => {
  it('builds a payload-shaped object from a dev.to article', () => {
    const article: DevtoArticle = {
      id: 1,
      title: 'A sample post',
      body_markdown: 'Body.',
      canonical_url: `${SITE}/blog/sample`,
      main_image: null,
      tag_list: ['test'],
      description: 'Excerpt.',
    };
    const norm = normalizeExisting(article);
    expect(norm.title).toBe('A sample post');
    expect(norm.tags).toEqual(['test']);
    expect(norm.canonical_url).toBe(`${SITE}/blog/sample`);
  });

  it('handles tag_list returned as a comma-separated string', () => {
    const article: DevtoArticle = {
      id: 2,
      title: 't',
      body_markdown: 'b',
      canonical_url: 'x',
      tag_list: 'a, b ,c',
      description: 'd',
    };
    expect(normalizeExisting(article).tags).toEqual(['a', 'b', 'c']);
  });
});

describe('computePlan', () => {
  it('emits create when canonical_url is unknown to dev.to', () => {
    const plan = computePlan({
      posts: [post()],
      existing: [],
      siteUrl: SITE,
    });
    expect(plan).toHaveLength(1);
    expect(plan[0]).toMatchObject({ kind: 'create', slug: 'sample' });
  });

  it('emits skip:unchanged when payloads round-trip identically', () => {
    const p = post();
    const payload = buildPayload(p, SITE);
    const article: DevtoArticle = {
      id: 7,
      title: payload.title,
      body_markdown: payload.body_markdown,
      canonical_url: payload.canonical_url,
      main_image: payload.main_image,
      tag_list: payload.tags,
      description: payload.description,
    };
    const plan = computePlan({ posts: [p], existing: [article], siteUrl: SITE });
    expect(plan[0]).toMatchObject({ kind: 'skip', slug: 'sample', reason: 'unchanged' });
  });

  it('emits update when the body markdown differs', () => {
    const p = post();
    const article: DevtoArticle = {
      id: 7,
      title: 'A sample post',
      body_markdown: 'OLD body.',
      canonical_url: `${SITE}/blog/sample`,
      main_image: null,
      tag_list: ['test'],
      description: 'Excerpt.',
    };
    const plan = computePlan({ posts: [p], existing: [article], siteUrl: SITE });
    expect(plan[0]).toMatchObject({ kind: 'update', slug: 'sample', id: 7 });
  });

  it('emits skip:opt-out when crosspost is false', () => {
    const plan = computePlan({
      posts: [post({ crosspost: false })],
      existing: [],
      siteUrl: SITE,
    });
    expect(plan[0]).toMatchObject({ kind: 'skip', slug: 'sample', reason: 'opt-out' });
  });
});
