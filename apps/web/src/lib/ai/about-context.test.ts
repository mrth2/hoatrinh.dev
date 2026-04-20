import { describe, expect, it } from 'vitest';
import { buildAboutContext } from './about-context';

describe('buildAboutContext', () => {
  it('includes core profile details in prompt context', () => {
    const context = buildAboutContext();
    expect(context.promptContext).toContain('Profile:');
    expect(context.promptContext).toContain('Name:');
    expect(context.promptContext).toContain('Projects:');
    expect(context.promptContext).toContain('Experience:');
    expect(context.promptContext).toContain('Skills:');
    expect(context.promptContext).toContain('Context:');
    expect(context.promptContext).toContain('RecruitMate');
    expect(context.promptContext).toContain('Cloud Firestore');
    expect(context.promptContext).toContain('Social Scout');
  });

  it('produces keyword tokens from profile and content', () => {
    const context = buildAboutContext();
    expect(context.keywords.length).toBeGreaterThan(0);
    expect(context.keywords).toContain('hoa');
    expect(context.keywords).toContain('github');
  });
});
