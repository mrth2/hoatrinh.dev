import { getBlogPosts } from '@hoatrinh/content';
import { createArticle, listMyArticles, updateArticle } from './devto-client';
import { computePlan } from './plan';
import { readBodyMarkdown } from './raw-body';
import type { Action } from './types';

const RATE_LIMIT_MS = 1000;
const DRY_RUN = process.argv.includes('--dry-run');

function getEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env: ${name}`);
  return v;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function summarize(actions: Action[], failed: Set<string>): void {
  const counts = { create: 0, update: 0, 'skip:unchanged': 0, 'skip:opt-out': 0, failed: 0 };
  for (const a of actions) {
    if (a.kind === 'skip') counts[`skip:${a.reason}` as const] += 1;
    else counts[a.kind] += 1;
  }
  counts.failed = failed.size;
  console.log('crosspost-devto summary:');
  for (const [k, v] of Object.entries(counts)) {
    console.log(`  ${k.padEnd(16)} ${v}`);
  }
  for (const a of actions) {
    const tag = a.kind === 'skip' ? `skip:${a.reason}` : a.kind;
    const flag = failed.has(a.slug) ? ' [FAILED]' : '';
    console.log(`  - ${tag.padEnd(16)} ${a.slug}${flag}`);
  }
}

async function main(): Promise<number> {
  const siteUrl = getEnv('SITE_URL').replace(/\/$/, '');
  const apiKey = DRY_RUN ? '' : getEnv('DEV_TO_API_KEY');

  const posts = getBlogPosts().map((p) => ({
    ...p,
    bodyMarkdown: readBodyMarkdown(p.slug),
  }));

  const existing = DRY_RUN ? [] : await listMyArticles(apiKey);
  const actions = computePlan({ posts, existing, siteUrl });

  if (DRY_RUN) {
    console.log('[dry-run] would execute:');
    summarize(actions, new Set());
    return 0;
  }

  const failed = new Set<string>();
  for (const action of actions) {
    try {
      if (action.kind === 'create') {
        await createArticle(apiKey, action.payload);
        console.log(`created   ${action.slug}`);
      } else if (action.kind === 'update') {
        await updateArticle(apiKey, action.id, action.payload);
        console.log(`updated   ${action.slug} (id=${action.id})`);
      } else {
        console.log(`skipped   ${action.slug} (${action.reason})`);
      }
    } catch (err) {
      failed.add(action.slug);
      console.error(`FAILED    ${action.slug}: ${(err as Error).message}`);
    }
    if (action.kind === 'create' || action.kind === 'update') {
      await delay(RATE_LIMIT_MS);
    }
  }

  summarize(actions, failed);
  return failed.size === 0 ? 0 : 1;
}

main().then(
  (code) => process.exit(code),
  (err) => {
    console.error(err);
    process.exit(1);
  },
);
