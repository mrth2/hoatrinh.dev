import { getBlogPost, getBlogPosts } from '@hoatrinh/content';
import { type ErrorEntry, nextEntryId, type PostEntry } from '../entries';

export function postHandler(args: string[], _rest: string, _ctx: unknown): PostEntry | ErrorEntry {
  const slug = args[0]?.toLowerCase();
  if (!slug) {
    return {
      id: nextEntryId(),
      input: 'post',
      kind: 'error',
      message: 'post requires a slug. Try: post <slug>',
      suggestions: ['blog'],
    };
  }

  const post = getBlogPost(slug);
  if (!post) {
    const known = getBlogPosts().map((p) => p.slug);
    return {
      id: nextEntryId(),
      input: `post ${slug}`,
      kind: 'error',
      message: `No post "${slug}" found.`,
      suggestions: ['blog', ...known.slice(0, 3)],
    };
  }

  const posts = getBlogPosts();
  const idx = posts.findIndex((p) => p.slug === post.slug);
  const newer = idx > 0 ? posts[idx - 1] : undefined;
  const older = idx >= 0 && idx < posts.length - 1 ? posts[idx + 1] : undefined;
  const data: PostEntry['data'] = { post };

  if (older) data.prev = { slug: older.slug, title: older.title };
  if (newer) data.next = { slug: newer.slug, title: newer.title };

  return { id: nextEntryId(), input: `post ${slug}`, kind: 'post', data };
}
