import { getExperience } from '@hoatrinh/content';
import { type ExperienceEntry, nextEntryId } from '../entries';

export function experienceHandler(_args: string[], _rest: string, _ctx: unknown): ExperienceEntry {
  return { id: nextEntryId(), input: 'experience', kind: 'experience', data: getExperience() };
}
