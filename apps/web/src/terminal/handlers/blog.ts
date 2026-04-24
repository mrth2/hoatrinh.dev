import { getBlogPosts } from '@hoatrinh/content';
import { type BlogListEntry, nextEntryId } from '../entries';

const WEEKLY_TARGET_DAYS = 7 as const;

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function blogHandler(_args: string[], _rest: string, _ctx: unknown): BlogListEntry {
  const posts = getBlogPosts();
  const latestDate = posts[0]?.date ?? '';
  const nextBy = latestDate === '' ? todayISO() : addDays(latestDate, WEEKLY_TARGET_DAYS);
  return {
    id: nextEntryId(),
    input: 'blog',
    kind: 'blog-list',
    data: {
      cadence: {
        targetDays: WEEKLY_TARGET_DAYS,
        postCount: posts.length,
        latestDate,
        nextBy,
      },
      posts: posts.map((p) => ({
        slug: p.slug,
        title: p.title,
        date: p.date,
        tag: p.tag,
        excerpt: p.excerpt,
        readingTime: p.readingTime,
      })),
    },
  };
}
