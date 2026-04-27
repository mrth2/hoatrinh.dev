import { describe, expect, it } from 'vitest';
import { normalizeBodyForDevto } from './normalize';

const SITE = 'https://hoatrinh.dev';

describe('normalizeBodyForDevto', () => {
  it('joins soft-wrapped paragraph lines with spaces', () => {
    const input = [
      'Willpower is a bad scheduler.',
      'If a habit has to be decided',
      'every morning, I skip it.',
    ].join('\n');
    expect(normalizeBodyForDevto(input, SITE)).toBe(
      'Willpower is a bad scheduler. If a habit has to be decided every morning, I skip it.',
    );
  });

  it('preserves paragraph boundaries (blank lines)', () => {
    const input = ['First paragraph', 'still going.', '', 'Second paragraph', 'still going.'].join(
      '\n',
    );
    expect(normalizeBodyForDevto(input, SITE)).toBe(
      ['First paragraph still going.', '', 'Second paragraph still going.'].join('\n'),
    );
  });

  it('preserves headings on their own line', () => {
    const input = ['Intro line.', '', '## A heading', '', 'Body line one', 'body line two.'].join(
      '\n',
    );
    expect(normalizeBodyForDevto(input, SITE)).toBe(
      ['Intro line.', '', '## A heading', '', 'Body line one body line two.'].join('\n'),
    );
  });

  it('keeps each unordered list item on its own line', () => {
    const input = ['- item one', '- item two', '- item three'].join('\n');
    expect(normalizeBodyForDevto(input, SITE)).toBe(
      ['- item one', '- item two', '- item three'].join('\n'),
    );
  });

  it('merges indented continuation lines into the parent list item', () => {
    const input = [
      '1. **Keep.** The block. Biggest mood and energy',
      '   lift of the day, and the only one that pays back into everything',
      '   else.',
      '2. **Cut.** Other thing.',
    ].join('\n');
    expect(normalizeBodyForDevto(input, SITE)).toBe(
      [
        '1. **Keep.** The block. Biggest mood and energy lift of the day, and the only one that pays back into everything else.',
        '2. **Cut.** Other thing.',
      ].join('\n'),
    );
  });

  it('does not unwrap inside fenced code blocks', () => {
    const input = [
      'Some prose',
      'wrapped.',
      '',
      '```ts',
      'const x = 1;',
      'const y = 2;',
      '```',
      '',
      'After.',
    ].join('\n');
    expect(normalizeBodyForDevto(input, SITE)).toBe(
      [
        'Some prose wrapped.',
        '',
        '```ts',
        'const x = 1;',
        'const y = 2;',
        '```',
        '',
        'After.',
      ].join('\n'),
    );
  });

  it('absolutizes site-relative image URLs', () => {
    const input = '![alt text](/blog/foo.png)';
    expect(normalizeBodyForDevto(input, SITE)).toBe(
      '![alt text](https://hoatrinh.dev/blog/foo.png)',
    );
  });

  it('absolutizes site-relative link URLs but leaves absolute ones alone', () => {
    const input = ['See [this](/blog/other) and', '[that](https://example.com/x).'].join('\n');
    expect(normalizeBodyForDevto(input, SITE)).toBe(
      'See [this](https://hoatrinh.dev/blog/other) and [that](https://example.com/x).',
    );
  });

  it('is idempotent: running twice yields the same result', () => {
    const input = [
      'Para line one',
      'continued.',
      '',
      '## Heading',
      '',
      '- one',
      '- two',
      '  with continuation.',
    ].join('\n');
    const once = normalizeBodyForDevto(input, SITE);
    const twice = normalizeBodyForDevto(once, SITE);
    expect(twice).toBe(once);
  });

  it('preserves a trailing newline if the source has one', () => {
    expect(normalizeBodyForDevto('A line.\n', SITE)).toBe('A line.\n');
    expect(normalizeBodyForDevto('A line.', SITE)).toBe('A line.');
  });
});
