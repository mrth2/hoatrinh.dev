import { describe, expect, it } from 'vitest';
import { resolveModelCandidates, runWorkersAiWithFallback } from './workers-ai';

describe('resolveModelCandidates', () => {
  it('returns primary plus deduped fallbacks', () => {
    const models = resolveModelCandidates('a', ' b, c ,a,b ');
    expect(models).toEqual(['a', 'b', 'c']);
  });
});

describe('runWorkersAiWithFallback', () => {
  it('uses fallback model after retryable error', async () => {
    const fetchImpl = async (input: RequestInfo | URL): Promise<Response> => {
      const url = String(input);
      if (url.endsWith('/model-a')) {
        return new Response(JSON.stringify({ errors: [{ message: 'rate limited' }] }), {
          status: 429,
        });
      }
      return new Response(JSON.stringify({ result: { response: 'answer from fallback' } }), {
        status: 200,
      });
    };

    const result = await runWorkersAiWithFallback({
      accountId: 'acc',
      apiToken: 'token',
      primaryModel: 'model-a',
      fallbackModelsCsv: 'model-b',
      messages: [{ role: 'user', content: 'hello' }],
      maxTokens: 64,
      temperature: 0.2,
      fetchImpl,
    });

    expect(result.model).toBe('model-b');
    expect(result.answer).toBe('answer from fallback');
  });

  it('does not fallback on non-retryable errors', async () => {
    const fetchImpl = async (): Promise<Response> =>
      new Response(JSON.stringify({ errors: [{ message: 'bad request' }] }), { status: 400 });

    await expect(
      runWorkersAiWithFallback({
        accountId: 'acc',
        apiToken: 'token',
        primaryModel: 'model-a',
        fallbackModelsCsv: 'model-b',
        messages: [{ role: 'user', content: 'hello' }],
        maxTokens: 64,
        temperature: 0.2,
        fetchImpl,
      }),
    ).rejects.toThrow(/model-a: bad request/);
  });
});
