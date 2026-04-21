import { loadMarkdownEntity } from './loaders';
import { loadRawMarkdownFallback } from './raw-markdown';
import { type Profile, ProfileFrontmatter } from './schema';

const raw =
  typeof (globalThis as { Bun?: unknown }).Bun !== 'undefined'
    ? await loadRawMarkdownFallback('../markdown/profile.md', import.meta.url)
    : import.meta.glob<string>('../markdown/profile.md', {
        eager: true,
        query: '?raw',
        import: 'default',
      });

const entries = Object.values(raw);
if (entries.length !== 1 || entries[0] === undefined) {
  throw new Error(`[content] expected exactly one profile.md, found ${entries.length}`);
}

const profile: Profile = await loadMarkdownEntity(entries[0], ProfileFrontmatter, 'profile.md');

export function getProfile(): Profile {
  return profile;
}
