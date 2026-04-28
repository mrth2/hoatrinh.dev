import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { onRequestPost } from './signup';
import { _resetRateLimiterForTests } from './_lib/rate-limit';

function makeContext(body: unknown, ip = '1.2.3.4', env = {}) {
  return {
    request: new Request('https://example.com/api/signup', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'cf-connecting-ip': ip,
      },
      body: JSON.stringify(body),
    }),
    env,
  };
}

beforeEach(() => {
  _resetRateLimiterForTests();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('onRequestPost', () => {
  it('returns 400 for missing email', async () => {
    const ctx = makeContext({});
    const res = await onRequestPost(ctx);
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid email', async () => {
    const ctx = makeContext({ email: 'not-an-email' });
    const res = await onRequestPost(ctx);
    expect(res.status).toBe(400);
  });

  it('returns 200 silently when honeypot company field is non-empty and does not call fetch', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    const ctx = makeContext({ email: 'user@example.com', company: 'Bots Inc' });
    const res = await onRequestPost(ctx);

    expect(res.status).toBe(200);
    const body = await res.json() as { message: string };
    expect(body.message).toBe('Saved. You will get first access updates.');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('returns 200 on valid submission', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 200 })));

    const ctx = makeContext(
      { email: 'user@example.com' },
      '1.2.3.4',
      { RESEND_API_KEY: 'key', RESEND_SEGMENT_ID: 'seg' },
    );
    const res = await onRequestPost(ctx);
    expect(res.status).toBe(200);
  });

  it('returns 400 for malformed JSON body', async () => {
    const req = new Request('https://recto.hoatrinh.dev/api/signup', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'cf-connecting-ip': '1.2.3.4' },
      body: 'not-json',
    });
    const res = await onRequestPost({ request: req, env: { RESEND_API_KEY: 'k', RESEND_SEGMENT_ID: 's' } });
    expect(res.status).toBe(400);
  });

  it('returns 429 after 5 requests from same IP', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 200 })));

    const env = { RESEND_API_KEY: 'key', RESEND_SEGMENT_ID: 'seg' };
    for (let i = 0; i < 5; i++) {
      await onRequestPost(makeContext({ email: 'user@example.com' }, '5.5.5.5', env));
    }

    const res = await onRequestPost(makeContext({ email: 'user@example.com' }, '5.5.5.5', env));
    expect(res.status).toBe(429);
  });
});
