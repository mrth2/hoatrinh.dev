import type { BlogPost } from '@hoatrinh/content';

export type PlanPost = BlogPost & { bodyMarkdown: string };

export type DevtoPayload = {
  title: string;
  body_markdown: string;
  canonical_url: string;
  published: true;
  main_image: string | null;
  tags: string[];
  description: string;
};

export type DevtoArticle = {
  id: number;
  title: string;
  body_markdown: string;
  canonical_url: string | null;
  cover_image?: string | null;
  main_image?: string | null;
  tag_list: string[] | string;
  description: string;
};

export type Action =
  | { kind: 'create'; slug: string; payload: DevtoPayload }
  | { kind: 'update'; slug: string; id: number; payload: DevtoPayload }
  | { kind: 'skip'; slug: string; reason: 'unchanged' | 'opt-out' };

export type PlanInput = {
  posts: PlanPost[];
  existing: DevtoArticle[];
  siteUrl: string;
};
