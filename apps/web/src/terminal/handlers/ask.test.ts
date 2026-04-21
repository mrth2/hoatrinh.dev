import { afterEach, describe, expect, it } from 'vitest';
import { askHandler } from './ask';

describe('askHandler', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    if (originalFetch === undefined) {
      delete (globalThis as { fetch?: typeof fetch }).fetch;
      return;
    }
    Object.defineProperty(globalThis, 'fetch', {
      value: originalFetch,
      configurable: true,
      writable: true,
    });
  });

  it('returns error when question is missing', async () => {
    const entry = await askHandler([], '', {});
    expect(entry.kind).toBe('error');
  });

  it('returns text entry for in-scope answer', async () => {
    Object.defineProperty(globalThis, 'fetch', {
      value: async () =>
        new Response(
          JSON.stringify({ kind: 'answer', answer: 'Hoa is a senior software engineer.' }),
          {
            status: 200,
          },
        ),
      configurable: true,
      writable: true,
    });

    const entry = await askHandler([], 'what is your role?', {});
    expect(entry.kind).toBe('text');
    if (entry.kind === 'text') {
      expect(entry.markdown).toBe(true);
      expect(entry.lines[0]).toContain('senior software engineer');
    }
  });

  it('returns text entry for out-of-scope refusal', async () => {
    Object.defineProperty(globalThis, 'fetch', {
      value: async () =>
        new Response(
          JSON.stringify({
            kind: 'refusal',
            answer: 'I can only answer questions about Hoa Trinh Hai.',
          }),
          { status: 200 },
        ),
      configurable: true,
      writable: true,
    });

    const entry = await askHandler([], 'what is the weather today?', {});
    expect(entry.kind).toBe('text');
    if (entry.kind === 'text') {
      expect(entry.markdown).toBe(true);
      expect(entry.lines[0]).toContain('only answer questions about Hoa Trinh Hai');
    }
  });

  it('returns error entry when API responds with failure', async () => {
    Object.defineProperty(globalThis, 'fetch', {
      value: async () => new Response(JSON.stringify({ message: 'boom' }), { status: 500 }),
      configurable: true,
      writable: true,
    });

    const entry = await askHandler([], 'what is your role?', {});
    expect(entry.kind).toBe('error');
    if (entry.kind === 'error') {
      expect(entry.message).toBe('Hmm, my AI assistant hit a snag! Please try again in a moment.');
      expect(entry.contactLink).toEqual({
        label: 'contact me',
        href: 'mailto:hoatrinhdev@gmail.com',
      });
    }
  });
});
