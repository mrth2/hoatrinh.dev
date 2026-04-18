import { getProject } from '@hoatrinh/content';
import { type ErrorEntry, nextEntryId, type ProjectEntry } from '../entries';

export function projectHandler(
  args: string[],
  _rest: string,
  _ctx: unknown,
): ProjectEntry | ErrorEntry {
  const slug = args[0]?.toLowerCase();
  if (!slug) {
    return {
      id: nextEntryId(),
      input: 'project',
      kind: 'error',
      message: 'project requires a slug. Try: project <slug>',
      suggestions: ['projects'],
    };
  }
  const project = getProject(slug);
  if (!project) {
    return {
      id: nextEntryId(),
      input: `project ${slug}`,
      kind: 'error',
      message: `No project "${slug}" found.`,
      suggestions: ['projects'],
    };
  }
  return { id: nextEntryId(), input: `project ${slug}`, kind: 'project', data: project };
}
