import { normalize } from './utils';

const ABOUT_TOPICS = new Set([
  'about',
  'bio',
  'portfolio',
  'profile',
  'name',
  'role',
  'location',
  'pronouns',
  'contact',
  'email',
  'link',
  'links',
  'github',
  'linkedin',
  'project',
  'projects',
  'experience',
  'career',
  'resume',
  'cv',
  'skill',
  'skills',
  'tech',
  'stack',
  'work',
  'works',
  'working',
  'company',
  'companies',
  'background',
]);

const IDENTITY_HINTS = new Set(['hoa', 'trinh', 'hai', 'hoatrinh']);

const SELF_INTRO_PATTERNS = [
  /\bwho are you\b/,
  /\btell me about yourself\b/,
  /\bdescribe yourself\b/,
  /\bintroduce yourself\b/,
  /\babout you\b/,
];

export type TopicScope = {
  inScope: boolean;
};

export function evaluateAboutScope(question: string, keywords: readonly string[]): TopicScope {
  const normalized = normalize(question);
  if (!normalized) return { inScope: false };

  for (const pattern of SELF_INTRO_PATTERNS) {
    if (pattern.test(normalized)) return { inScope: true };
  }

  const tokens = normalized.split(/\s+/);
  const tokenSet = new Set(tokens);

  if (hasIntersection(tokenSet, ABOUT_TOPICS)) return { inScope: true };
  if (hasIntersection(tokenSet, IDENTITY_HINTS)) return { inScope: true };
  if (hasIntersection(tokenSet, keywords)) return { inScope: true };

  return { inScope: false };
}

function hasIntersection(tokenSet: ReadonlySet<string>, candidates: Iterable<string>): boolean {
  for (const candidate of candidates) {
    if (tokenSet.has(candidate)) return true;
  }
  return false;
}
