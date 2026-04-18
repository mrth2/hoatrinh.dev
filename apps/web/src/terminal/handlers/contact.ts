import { getLinks } from '@hoatrinh/content';
import { type ContactEntry, nextEntryId } from '../entries';

export function contactHandler(_args: string[], _rest: string, _ctx: unknown): ContactEntry {
  return { id: nextEntryId(), input: 'contact', kind: 'contact', data: getLinks() };
}
