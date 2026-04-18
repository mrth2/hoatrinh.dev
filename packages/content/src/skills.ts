import type { SkillGroup } from './schema';

const skills: SkillGroup[] = [
  {
    label: 'Practice',
    items: ['Agentic Engineering', 'System Design', 'Product Thinking', 'AI Orchestration'],
  },
  {
    label: 'Languages',
    items: ['TypeScript', 'JavaScript', 'Dart', 'Kotlin', 'Python', 'PHP'],
  },
  {
    label: 'Frontend',
    items: [
      'Solid',
      'Svelte / SvelteKit',
      'Astro',
      'Nuxt',
      'Vue',
      'React',
      'Flutter',
      'Tailwind CSS',
    ],
  },
  {
    label: 'Backend',
    items: ['Node', 'Bun', 'Firebase', 'Laravel', 'Phaser'],
  },
  {
    label: 'Infra',
    items: ['Cloudflare Pages / D1 / Workers', 'AWS Amplify', 'Vercel', 'Docker', 'Turborepo'],
  },
  {
    label: 'AI tools',
    items: ['Claude Code', 'MCP', 'Cursor', 'Gemini', 'OpenAI'],
  },
];

export function getSkills(): SkillGroup[] {
  return skills;
}
