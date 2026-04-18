import { getProfile } from '@hoatrinh/content';
import { nextEntryId, type ProfileEntry } from '../entries';

export function aboutHandler(_args: string[], _rest: string, _ctx: unknown): ProfileEntry {
  return { id: nextEntryId(), input: 'about', kind: 'profile', data: getProfile() };
}
