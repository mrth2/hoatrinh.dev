import { describe, expect, it } from 'vitest';
import { ExperienceFrontmatter, ProfileFrontmatter, ProjectFrontmatter } from './schema';

describe('ProjectFrontmatter', () => {
  it('accepts a valid project', () => {
    const parsed = ProjectFrontmatter.parse({
      slug: 'keepgoing',
      title: 'KeepGoing',
      tagline: 'A tool for focus',
      status: 'active',
      role: 'Creator',
      year: 2025,
      tech: ['TypeScript', 'Bun'],
      links: { live: 'https://keepgoing.dev', repo: 'https://github.com/mrth2/keepgoing' },
      featured: true,
    });
    expect(parsed.slug).toBe('keepgoing');
  });

  it('rejects an uppercase slug', () => {
    expect(() =>
      ProjectFrontmatter.parse({
        slug: 'KeepGoing',
        title: 't',
        tagline: 't',
        status: 'active',
        role: 'r',
        year: 2024,
        tech: [],
      }),
    ).toThrow();
  });

  it('rejects a tagline over 140 chars', () => {
    expect(() =>
      ProjectFrontmatter.parse({
        slug: 'x',
        title: 't',
        tagline: 'x'.repeat(141),
        status: 'active',
        role: 'r',
        year: 2024,
        tech: [],
      }),
    ).toThrow();
  });

  it('defaults featured to false and links to {}', () => {
    const parsed = ProjectFrontmatter.parse({
      slug: 'x',
      title: 't',
      tagline: 't',
      status: 'active',
      role: 'r',
      year: 2024,
      tech: [],
    });
    expect(parsed.featured).toBe(false);
    expect(parsed.links).toEqual({});
  });
});

describe('ExperienceFrontmatter', () => {
  it('accepts "present" as end', () => {
    const parsed = ExperienceFrontmatter.parse({
      slug: 'oneqode',
      company: 'OneQode',
      title: 'Engineer',
      start: '2024-01',
      end: 'present',
      highlights: ['Shipped X'],
    });
    expect(parsed.end).toBe('present');
  });

  it('rejects start in wrong format', () => {
    expect(() =>
      ExperienceFrontmatter.parse({
        slug: 'x',
        company: 'c',
        title: 't',
        start: '2024',
        end: 'present',
        highlights: [],
      }),
    ).toThrow();
  });

  it('caps highlights at 6', () => {
    expect(() =>
      ExperienceFrontmatter.parse({
        slug: 'x',
        company: 'c',
        title: 't',
        start: '2024-01',
        end: 'present',
        highlights: Array(7).fill('h'),
      }),
    ).toThrow();
  });
});

describe('ProfileFrontmatter', () => {
  it('accepts a complete profile', () => {
    const parsed = ProfileFrontmatter.parse({
      name: 'Hoa Trinh',
      role: 'Software Engineer',
      location: 'Remote',
      email: 'hoa@example.com',
      links: [{ label: 'GitHub', href: 'https://github.com/mrth2' }],
    });
    expect(parsed.name).toBe('Hoa Trinh');
  });
});
