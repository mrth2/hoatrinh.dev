import { getExperience, getLinks, getProfile, getProjects, getSkills } from '@hoatrinh/content';
import { normalize } from './utils';

export type AboutContext = {
  promptContext: string;
  keywords: string[];
};

let cached: AboutContext | undefined;

export function buildAboutContext(): AboutContext {
  if (cached) return cached;
  const profile = getProfile();
  const projects = getProjects();
  const experience = getExperience();
  const skills = getSkills();
  const links = getLinks();

  const skillItems = skills.flatMap((group) => group.items);
  const projectSummaries = projects.map(
    (project) =>
      `- ${project.title} (${project.slug}): ${project.tagline}. Role: ${project.role}. Year: ${project.year}.`,
  );
  const roleSummaries = experience.flatMap((role) => [
    `- ${role.title} at ${role.company} (${role.start} to ${role.end})${role.location ? `, ${role.location}` : ''}.`,
    ...role.highlights.map((highlight) => `  - Highlight: ${highlight}`),
    ...role.askContext.map((detail) => `  - Context: ${detail}`),
  ]);
  const linkSummaries = links.map((link) => `- ${link.label}: ${link.href}`);

  const promptContext = [
    'Profile:',
    `- Name: ${profile.name}`,
    `- Role: ${profile.role}`,
    `- Location: ${profile.location}`,
    profile.pronouns ? `- Pronouns: ${profile.pronouns}` : null,
    profile.email ? `- Email: ${profile.email}` : null,
    '',
    'Projects:',
    ...projectSummaries,
    '',
    'Experience:',
    ...roleSummaries,
    '',
    'Skills:',
    `- ${skillItems.join(', ')}`,
    '',
    'Links:',
    ...linkSummaries,
  ]
    .filter((line): line is string => line !== null)
    .join('\n');

  const keywordParts = [
    profile.name,
    profile.role,
    profile.location,
    profile.pronouns ?? '',
    profile.email ?? '',
    ...profile.links.map((link) => link.label),
    ...projects.flatMap((project) => [project.slug, project.title, project.role, ...project.tech]),
    ...experience.flatMap((role) => [role.company, role.title, role.location ?? '', ...role.tech]),
    ...skillItems,
    ...links.flatMap((link) => [link.label, link.href]),
  ];

  const keywordTokens = new Set<string>();
  for (const part of keywordParts) {
    for (const token of tokenize(part)) keywordTokens.add(token);
  }

  cached = { promptContext, keywords: Array.from(keywordTokens) };
  return cached;
}

function tokenize(input: string): string[] {
  return normalize(input)
    .split(/\s+/)
    .filter((token) => token.length >= 2);
}
