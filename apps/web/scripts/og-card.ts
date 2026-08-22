// Pure satori element tree for the Open Graph card. No fs, no fonts, no
// native modules - this is the part unit tests exercise directly.

export type OgCard = {
  command: string;
  title: string;
  description: string;
  footer: string;
};

// Design tokens, mirrored from src/styles/tokens.css. Kept as literals
// (rather than parsed at runtime) so this file stays pure and testable.
const COLOR_BG = '#0a0806';
const COLOR_BORDER = '#2a1f10';
const COLOR_TEXT_PRIMARY = '#ecdfc2';
const COLOR_TEXT_MUTED = '#a08a64';
const COLOR_ACCENT = '#ffb347';

const CARD_WIDTH = 1200;
const CARD_HEIGHT = 630;
const PADDING = 72;

const TITLE_MAX_CHARS = 60;
const DESCRIPTION_MAX_CHARS = 190;

/**
 * Truncate text to a character budget, breaking on the last whole word and
 * appending an ellipsis. Text within the budget is returned unchanged.
 */
export function truncateText(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;

  const sliced = text.slice(0, maxChars);
  const lastSpace = sliced.lastIndexOf(' ');
  const base = lastSpace > 0 ? sliced.slice(0, lastSpace) : sliced;
  return `${base.trimEnd()}…`;
}

export function truncateTitle(title: string): string {
  return truncateText(title, TITLE_MAX_CHARS);
}

export function truncateDescription(description: string): string {
  return truncateText(description, DESCRIPTION_MAX_CHARS);
}

// biome-ignore lint/suspicious/noExplicitAny: satori's element tree type isn't exported for standalone use
export function buildOgCardTree(card: OgCard): any {
  const title = truncateTitle(card.title);
  const description = truncateDescription(card.description);

  // A 2-line clamp on the title and description is a hard safety net on
  // top of the character-budget truncation above: it guarantees the card
  // never overflows into the footer even if font metrics shift.
  const lineClamp = (lines: number) => ({
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: lines,
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  });

  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        padding: PADDING,
        backgroundColor: COLOR_BG,
        fontFamily: 'JetBrains Mono',
        color: COLOR_TEXT_PRIMARY,
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              border: `1px solid ${COLOR_BORDER}`,
              padding: 48,
              overflow: 'hidden',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    minHeight: 0,
                    overflow: 'hidden',
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          fontSize: 20,
                          color: COLOR_TEXT_MUTED,
                          marginBottom: 20,
                        },
                        children: 'hoatrinh.dev',
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          fontSize: 24,
                          marginBottom: 32,
                        },
                        children: [
                          {
                            type: 'span',
                            props: {
                              style: { color: COLOR_ACCENT, marginRight: 16 },
                              children: '>',
                            },
                          },
                          {
                            type: 'span',
                            props: {
                              style: { color: COLOR_ACCENT },
                              children: card.command,
                            },
                          },
                        ],
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontSize: 48,
                          fontWeight: 700,
                          color: COLOR_TEXT_PRIMARY,
                          marginBottom: 16,
                          lineHeight: 1.2,
                          ...lineClamp(2),
                        },
                        children: title,
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontSize: 24,
                          color: COLOR_TEXT_MUTED,
                          lineHeight: 1.5,
                          ...lineClamp(3),
                        },
                        children: description,
                      },
                    },
                  ],
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexShrink: 0,
                    fontSize: 20,
                    color: COLOR_TEXT_MUTED,
                    marginTop: 24,
                  },
                  children: card.footer,
                },
              },
            ],
          },
        },
      ],
    },
  };
}
