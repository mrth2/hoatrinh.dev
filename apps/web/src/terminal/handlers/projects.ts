import { getProjects } from '@hoatrinh/content';
import { nextEntryId, type ProjectsEntry } from '../entries';

export function projectsHandler(_args: string[], _rest: string, _ctx: unknown): ProjectsEntry {
  return { id: nextEntryId(), input: 'projects', kind: 'projects', data: getProjects() };
}
