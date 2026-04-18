import { z } from 'zod';

export const ProjectFrontmatter = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string(),
  tagline: z.string().max(140),
  status: z.enum(['active', 'archived', 'experimental']),
  role: z.string(),
  year: z.number().int(),
  tech: z.array(z.string()),
  links: z
    .object({
      live: z.url().optional(),
      repo: z.url().optional(),
    })
    .default({}),
  featured: z.boolean().default(false),
});
export type ProjectMeta = z.infer<typeof ProjectFrontmatter>;
export type Project = ProjectMeta & { bodyHtml: string };

export const ExperienceFrontmatter = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  company: z.string(),
  title: z.string(),
  start: z.string().regex(/^\d{4}-\d{2}$/),
  end: z.union([z.string().regex(/^\d{4}-\d{2}$/), z.literal('present')]),
  location: z.string().optional(),
  tech: z.array(z.string()).default([]),
  highlights: z.array(z.string()).max(6),
});
export type ExperienceMeta = z.infer<typeof ExperienceFrontmatter>;
export type Experience = ExperienceMeta & { bodyHtml: string };

export const ProfileFrontmatter = z.object({
  name: z.string(),
  role: z.string(),
  location: z.string(),
  pronouns: z.string().optional(),
  email: z.email().optional(),
  links: z.array(z.object({ label: z.string(), href: z.url() })),
});
export type ProfileMeta = z.infer<typeof ProfileFrontmatter>;
export type Profile = ProfileMeta & { bodyHtml: string };

export type SkillGroup = { label: string; items: string[] };
export type Link = { label: string; href: string; kind: 'email' | 'social' | 'code' | 'other' };
