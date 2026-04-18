import type { SkillGroup } from './schema';

const skills: SkillGroup[] = [
  { label: 'Languages', items: ['TypeScript', 'JavaScript', 'Go', 'Python'] },
  { label: 'Frontend', items: ['Solid', 'React', 'Vue', 'Vite'] },
  { label: 'Backend', items: ['Node', 'Bun', 'Deno'] },
  { label: 'Infra', items: ['Cloudflare', 'Docker', 'Postgres'] },
];

export function getSkills(): SkillGroup[] {
  return skills;
}
