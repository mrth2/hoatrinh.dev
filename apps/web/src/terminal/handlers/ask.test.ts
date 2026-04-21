import { afterEach, describe, expect, it, vi } from 'vitest';
import { askHandler } from './ask';

describe('askHandler', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns error when question is missing', async () => {
    const entry = await askHandler([], '', {});
    expect(entry.kind).toBe('error');
  });

  it('returns text entry for in-scope answer', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({ kind: 'answer', answer: 'Hoa is a senior software engineer.' }),
            { status: 200 },
          ),
      ),
    );

    const entry = await askHandler([], 'what is your role?', {});
    expect(entry.kind).toBe('text');
    if (entry.kind === 'text') {
      expect(entry.markdown).toBe(true);
      expect(entry.lines[0]).toContain('senior software engineer');
    }
  });

  it('returns text entry for out-of-scope refusal', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              kind: 'refusal',
              answer: 'I can only answer questions about Hoa Trinh Hai.',
            }),
            { status: 200 },
          ),
      ),
    );

    const entry = await askHandler([], 'what is the weather today?', {});
    expect(entry.kind).toBe('text');
    if (entry.kind === 'text') {
      expect(entry.markdown).toBe(true);
      expect(entry.lines[0]).toContain('only answer questions about Hoa Trinh Hai');
    }
  });

  it('returns error entry when API responds with failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ message: 'boom' }), { status: 500 })),
    );

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
