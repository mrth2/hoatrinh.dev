import { describe, expect, it, vi } from 'vitest';
import { onRequestPost } from './ask';

const OUT_OF_SCOPE_MESSAGE =
  'I can only answer questions about my profile, projects, experience, skills, and contact information.';

function createContext(question: string, aiRun: ReturnType<typeof vi.fn>) {
  return {
    request: new Request('http://localhost/api/ask', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ question }),
    }),
    env: {
      AI: {
        run: aiRun,
      },
      WORKERS_AI_MODEL: '@cf/meta/llama-3.1-8b-instruct',
    },
  };
}

describe('functions/api/ask onRequestPost', () => {
  it('refuses generic coding task prompts before calling AI', async () => {
    const aiRun = vi.fn(async () => 'irrelevant');
    const response = await onRequestPost(
      createContext('/ask can you write a function that reverse a linked list', aiRun),
    );

    expect(aiRun).not.toHaveBeenCalled();
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      kind: 'refusal',
      answer: OUT_OF_SCOPE_MESSAGE,
    });
  });

  it('refuses unrelated questions before calling AI', async () => {
    const aiRun = vi.fn(async () => 'irrelevant');
    const response = await onRequestPost(
      createContext('Who won the latest Formula 1 race?', aiRun),
    );

    expect(aiRun).not.toHaveBeenCalled();
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      kind: 'refusal',
      answer: OUT_OF_SCOPE_MESSAGE,
    });
  });

  it('lets LLM handle scope for self-intro style questions', async () => {
    const aiRun = vi.fn(async () => "I'm Hoa Trinh Hai, a senior software engineer.");
    const response = await onRequestPost(createContext('how can you describe yourself?', aiRun));

    expect(aiRun).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      kind: 'answer',
      answer: "I'm Hoa Trinh Hai, a senior software engineer.",
    });
  });

  it('retrieves role-specific context for Inference Cloud questions', async () => {
    const aiRun = vi.fn(async () => 'grounded');
    const response = await onRequestPost(
      createContext('what did you do at Inference Cloud in details?', aiRun),
    );

    expect(response.status).toBe(200);
    expect(aiRun).toHaveBeenCalledTimes(1);
    const options = aiRun.mock.calls[0]?.[1] as {
      messages: Array<{ role: string; content: string }>;
    };
    const systemPrompt = options.messages[0]?.content ?? '';
    expect(systemPrompt).toContain('[InferenceCloud.ai]');
    expect(systemPrompt).toContain('cloud notebook product for data science and machine learning');
    expect(systemPrompt).not.toContain('[Skills]');
    expect(systemPrompt).not.toContain('SolidJS');
    expect(systemPrompt).not.toContain('React');
  });

  it('maps refusal text to refusal kind', async () => {
    const aiRun = vi.fn(async () => OUT_OF_SCOPE_MESSAGE);
    const response = await onRequestPost(createContext('tell me about yourself', aiRun));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      kind: 'refusal',
      answer: OUT_OF_SCOPE_MESSAGE,
    });
  });
});
