import { createHash } from 'node:crypto';
import { absolutize } from '../url-utils';
import { normalizeBodyForDevto } from './normalize';
import type { Action, DevtoArticle, DevtoPayload, PlanInput, PlanPost } from './types';

export function buildPayload(post: PlanPost, siteUrl: string): DevtoPayload {
  const tags = (post.tags ?? [post.tag]).slice(0, 4);
  return {
    title: post.title,
    body_markdown: normalizeBodyForDevto(post.bodyMarkdown, siteUrl),
    canonical_url: `${siteUrl}/blog/${post.slug}`,
    published: true,
    main_image: post.cover ? absolutize(post.cover, siteUrl) : null,
    tags,
    description: post.excerpt,
  };
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj).sort();
    return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(',')}}`;
  }
  return JSON.stringify(value ?? null);
}

export function payloadHash(payload: DevtoPayload): string {
  const normalized = { ...payload, tags: [...payload.tags].sort() };
  return createHash('sha256').update(stableStringify(normalized)).digest('hex');
}

export function normalizeExisting(article: DevtoArticle): DevtoPayload {
  const tags = Array.isArray(article.tag_list)
    ? article.tag_list
    : article.tag_list
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
  return {
    title: article.title,
    body_markdown: article.body_markdown,
    canonical_url: article.canonical_url ?? '',
    published: article.published !== false,
    main_image: article.main_image ?? article.cover_image ?? null,
    tags,
    description: article.description,
  };
}

export function computePlan(input: PlanInput): Action[] {
  const { posts, existing, siteUrl } = input;
  const byCanonical = new Map<string, DevtoArticle>();
  for (const a of existing) {
    if (a.canonical_url) byCanonical.set(a.canonical_url, a);
  }

  const actions: Action[] = [];
  for (const post of posts) {
    if (post.crosspost === false) {
      actions.push({ kind: 'skip', slug: post.slug, reason: 'opt-out' });
      continue;
    }
    const payload = buildPayload(post, siteUrl);
    const match = byCanonical.get(payload.canonical_url);
    if (!match) {
      actions.push({ kind: 'create', slug: post.slug, payload });
      continue;
    }
    if (payloadHash(payload) === payloadHash(normalizeExisting(match))) {
      actions.push({ kind: 'skip', slug: post.slug, reason: 'unchanged' });
    } else {
      actions.push({ kind: 'update', slug: post.slug, id: match.id, payload });
    }
  }
  return actions;
}
