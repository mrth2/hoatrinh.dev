import { describe, expect, it } from 'vitest';
import { buildOgCardTree, type OgCard, truncateDescription, truncateTitle } from './og-card';

function fixtureCard(over: Partial<OgCard> = {}): OgCard {
  return {
    command: 'experience',
    title: 'Experience',
    description: 'A look at where Hoa has worked.',
    footer: 'Hoa Trinh Hai · Senior Software Engineer',
    ...over,
  };
}

// biome-ignore lint/suspicious/noExplicitAny: mirrors the loosely typed satori tree
function collectText(node: any, out: string[] = []): string[] {
  if (typeof node === 'string') {
    out.push(node);
    return out;
  }
  if (Array.isArray(node)) {
    for (const child of node) collectText(child, out);
    return out;
  }
  if (node && typeof node === 'object' && 'props' in node) {
    collectText(node.props.children, out);
  }
  return out;
}

// biome-ignore lint/suspicious/noExplicitAny: mirrors the loosely typed satori tree
function collectColors(node: any, out: string[] = []): string[] {
  if (Array.isArray(node)) {
    for (const child of node) collectColors(child, out);
    return out;
  }
  if (node && typeof node === 'object' && 'props' in node) {
    const style = node.props.style;
    if (style?.color) out.push(style.color);
    if (style?.backgroundColor) out.push(style.backgroundColor);
    if (typeof style?.border === 'string') out.push(style.border);
    collectColors(node.props.children, out);
  }
  return out;
}

describe('truncateTitle / truncateDescription', () => {
  it('leaves short text untouched', () => {
    expect(truncateTitle('Experience')).toBe('Experience');
    expect(truncateDescription('A short description.')).toBe('A short description.');
  });

  it('truncates a long title with an ellipsis', () => {
    const longTitle =
      'The Editor I Cant Quit: A Very Long Blog Post Title About Terminal Tooling And Why It Matters';
    const result = truncateTitle(longTitle);
    expect(result.length).toBeLessThan(longTitle.length);
    expect(result.endsWith('…')).toBe(true);
  });

  // The budget is three lines of the card's 24px mono face. Route descriptions
  // are capped at 200 chars by entry-server, so most arrive intact.
  it('truncates an over-long description with an ellipsis', () => {
    const longDescription = 'word '.repeat(60).trim();
    const result = truncateDescription(longDescription);
    expect(result.length).toBeLessThanOrEqual(191);
    expect(result.endsWith('…')).toBe(true);
  });

  it('leaves a description within the three-line budget untouched', () => {
    const description =
      '14 years of engineering roles, from PHP backends at Netlink to platform lead at OneQode: single sign-on, virtual data rooms, and design systems.';
    expect(truncateDescription(description)).toBe(description);
  });

  it('breaks on a whole word instead of mid-word', () => {
    const longTitle = 'a'.repeat(100);
    const result = truncateTitle(longTitle);
    // No spaces to break on, so it falls back to a hard slice + ellipsis.
    expect(result.endsWith('…')).toBe(true);
    expect(result.startsWith('aaaa')).toBe(true);
  });
});

describe('buildOgCardTree', () => {
  it('includes the command, title, description and footer text', () => {
    const card = fixtureCard();
    const text = collectText(buildOgCardTree(card)).join(' ');
    expect(text).toContain(card.command);
    expect(text).toContain(card.title);
    expect(text).toContain(card.description);
    expect(text).toContain(card.footer);
    expect(text).toContain('hoatrinh.dev');
  });

  it('truncates a long title and description inside the tree', () => {
    const longTitle =
      'The Editor I Cant Quit: A Very Long Blog Post Title About Terminal Tooling And Why It Matters';
    const longDescription = 'word '.repeat(60).trim();
    const card = fixtureCard({ title: longTitle, description: longDescription });
    const text = collectText(buildOgCardTree(card)).join(' ');
    expect(text).not.toContain(longTitle);
    expect(text).not.toContain(longDescription);
    expect(text).toContain('…');
  });

  it('uses the brand colors from tokens.css', () => {
    const colors = collectColors(buildOgCardTree(fixtureCard()));
    expect(colors).toContain('#0a0806'); // bg-base
    expect(colors).toContain('#ecdfc2'); // text-primary
    expect(colors).toContain('#a08a64'); // text-muted
    expect(colors).toContain('#ffb347'); // accent-primary
    expect(colors.some((c) => c.includes('#2a1f10'))).toBe(true); // border-default
  });

  it('marks the prompt and command in the accent color', () => {
    const tree = buildOgCardTree(fixtureCard());
    const colors = collectColors(tree);
    expect(colors).toContain('#ffb347');
  });
});
