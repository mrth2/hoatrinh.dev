import type { Experience, Link, Profile, Project, SkillGroup } from '@hoatrinh/content';

export type BaseEntry = { id: string; input: string };

export type ProfileEntry = BaseEntry & { kind: 'profile'; data: Profile };
export type ProjectsEntry = BaseEntry & { kind: 'projects'; data: Project[] };
export type ProjectEntry = BaseEntry & { kind: 'project'; data: Project };
export type ExperienceEntry = BaseEntry & { kind: 'experience'; data: Experience[] };
export type SkillsEntry = BaseEntry & { kind: 'skills'; data: SkillGroup[] };
export type ContactEntry = BaseEntry & { kind: 'contact'; data: Link[] };
export type HelpEntry = BaseEntry & {
  kind: 'help';
  data: { commands: Array<{ name: string; usage: string; summary: string }> };
};
export type TextEntry = BaseEntry & { kind: 'text'; lines: string[] };
export type ErrorEntry = BaseEntry & {
  kind: 'error';
  message: string;
  suggestions: string[];
};

export type TerminalEntry =
  | ProfileEntry
  | ProjectsEntry
  | ProjectEntry
  | ExperienceEntry
  | SkillsEntry
  | ContactEntry
  | HelpEntry
  | TextEntry
  | ErrorEntry;

export type ClearAction = { action: 'clear' };

let idSeq = 0;
export function nextEntryId(): string {
  idSeq += 1;
  return `e${idSeq}`;
}

export function resetEntryIds(): void {
  idSeq = 0;
}
