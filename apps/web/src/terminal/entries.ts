import type { BlogPost, Experience, Link, Profile, Project, SkillGroup } from '@hoatrinh/content';

export type BaseEntry = { id: string; input: string };

export type ProfileEntry = BaseEntry & { kind: 'profile'; data: Profile };
export type ProjectsEntry = BaseEntry & { kind: 'projects'; data: Project[] };
export type ProjectEntry = BaseEntry & { kind: 'project'; data: Project };
export type ExperienceEntry = BaseEntry & { kind: 'experience'; data: Experience[] };
export type SkillsEntry = BaseEntry & { kind: 'skills'; data: SkillGroup[] };
export type ContactEntry = BaseEntry & { kind: 'contact'; data: Link[] };
export type BlogListEntry = BaseEntry & {
  kind: 'blog-list';
  data: {
    cadence: { targetDays: 7; postCount: number; latestDate: string; nextBy: string };
    posts: Array<{
      slug: string;
      title: string;
      date: string;
      tag: string;
      excerpt: string;
      readingTime: number;
    }>;
  };
};

export type PostEntry = BaseEntry & {
  kind: 'post';
  data: {
    post: BlogPost;
    prev?: { slug: string; title: string };
    next?: { slug: string; title: string };
  };
};
export type HelpEntry = BaseEntry & {
  kind: 'help';
  data: { commands: Array<{ name: string; usage: string; summary: string }> };
};
export type TextEntry = BaseEntry & { kind: 'text'; lines: string[]; markdown?: boolean };
export type ErrorEntry = BaseEntry & {
  kind: 'error';
  message: string;
  suggestions: string[];
  contactLink?: { label: string; href: string };
};
export type LoadingEntry = BaseEntry & { kind: 'loading' };

export type TerminalEntry =
  | ProfileEntry
  | ProjectsEntry
  | ProjectEntry
  | ExperienceEntry
  | SkillsEntry
  | ContactEntry
  | BlogListEntry
  | PostEntry
  | HelpEntry
  | TextEntry
  | ErrorEntry
  | LoadingEntry;

export type ClearAction = { action: 'clear' };

let idSeq = 0;
export function nextEntryId(): string {
  idSeq += 1;
  return `e${idSeq}`;
}

export function resetEntryIds(): void {
  idSeq = 0;
}
