import { describe, expect, it } from 'vitest';
import { buildAboutContext } from './about-context';
import { evaluateAboutScope } from './topic-guard';

describe('evaluateAboutScope', () => {
  const context = buildAboutContext();

  it('allows profile questions', () => {
    const result = evaluateAboutScope('What is your role and location?', context.keywords);
    expect(result.inScope).toBe(true);
  });

  it('allows project questions', () => {
    const result = evaluateAboutScope('Tell me about your projects', context.keywords);
    expect(result.inScope).toBe(true);
  });

  it('blocks unrelated questions', () => {
    const result = evaluateAboutScope('Who won the latest Formula 1 race?', context.keywords);
    expect(result.inScope).toBe(false);
  });
});
