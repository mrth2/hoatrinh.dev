import type { SkillGroup } from './schema';

const skills: SkillGroup[] = [
  {
    label: 'Focus',
    items: [
      'Product-minded engineering',
      'System design',
      'Agentic workflows',
      'Technical leadership',
      'AI-assisted delivery',
    ],
  },
  {
    label: 'Languages',
    items: ['TypeScript', 'JavaScript', 'Kotlin', 'Dart', 'Python', 'PHP'],
  },
  {
    label: 'Frontend',
    items: [
      'SolidJS',
      'Vue / Nuxt',
      'Svelte / SvelteKit',
      'Astro',
      'React',
      'Flutter',
      'Tailwind CSS',
      'D3.js',
    ],
  },
  {
    label: 'Backend',
    items: ['Bun', 'Node.js', 'Firebase', 'Cloud Functions', 'Laravel', 'REST APIs'],
  },
  {
    label: 'Platform',
    items: [
      'Cloudflare Pages / D1 / Workers',
      'AWS Amplify',
      'Docker',
      'Turborepo',
      'Monorepos',
      'CI/CD',
    ],
  },
  {
    label: 'AI tooling',
    items: ['Claude Code', 'MCP', 'Cursor', 'Gemini', 'OpenAI'],
  },
];

export function getSkills(): SkillGroup[] {
  return skills;
}
