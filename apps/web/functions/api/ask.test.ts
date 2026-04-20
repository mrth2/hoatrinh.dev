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

  it('maps refusal text to refusal kind', async () => {
    const aiRun = vi.fn(async () => OUT_OF_SCOPE_MESSAGE);
    const response = await onRequestPost(createContext('what is the weather?', aiRun));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      kind: 'refusal',
      answer: OUT_OF_SCOPE_MESSAGE,
    });
  });
});
