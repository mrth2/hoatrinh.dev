import { getSkills } from '@hoatrinh/content';
import { nextEntryId, type SkillsEntry } from '../entries';

export function skillsHandler(_args: string[], _rest: string, _ctx: unknown): SkillsEntry {
  return { id: nextEntryId(), input: 'skills', kind: 'skills', data: getSkills() };
}
