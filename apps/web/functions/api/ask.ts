import { evaluateAboutScope } from '../../src/lib/ai/topic-guard';
import { isObject } from '../../src/lib/ai/utils';
import { runWorkersAiWithFallback } from '../../src/lib/ai/workers-ai';
import { aboutKeywords, aboutPromptContext } from './about-data';

type Env = {
  CLOUDFLARE_ACCOUNT_ID?: string;
  CLOUDFLARE_API_TOKEN?: string;
  WORKERS_AI_MODEL?: string;
  WORKERS_AI_FALLBACK_MODELS?: string;
};

type PagesFunctionContext<TEnv = unknown> = {
  request: Request;
  env: TEnv;
};

const DEFAULT_MODEL = '@cf/meta/llama-3.1-8b-instruct';
const OUT_OF_SCOPE_MESSAGE =
  "I can only answer questions about Hoa Trinh Hai's profile, projects, experience, skills, and contact information.";

export async function onRequestPost(context: PagesFunctionContext<Env>): Promise<Response> {
  const body = (await context.request.json()) as unknown;
  const question = readQuestion(body);
  if (!question) return json({ message: 'question is required' }, 400);
  if (question.length > 500) return json({ message: 'question is too long (max 500 chars)' }, 400);

  const scope = evaluateAboutScope(question, aboutKeywords);
  if (!scope.inScope) return json({ kind: 'refusal', answer: OUT_OF_SCOPE_MESSAGE }, 200);

  const accountId = context.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = context.env.CLOUDFLARE_API_TOKEN;
  if (!accountId || !apiToken) {
    return json(
      {
        message:
          'Workers AI is not configured. Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN.',
      },
      500,
    );
  }

  try {
    const model = context.env.WORKERS_AI_MODEL ?? DEFAULT_MODEL;
    const result = await runWorkersAiWithFallback({
      accountId,
      apiToken,
      primaryModel: model,
      fallbackModelsCsv: context.env.WORKERS_AI_FALLBACK_MODELS,
      messages: [
        {
          role: 'system',
          content: buildSystemPrompt(aboutPromptContext),
        },
        { role: 'user', content: question },
      ],
      temperature: 0.2,
      maxTokens: 500,
    });
    return json({ kind: 'answer', answer: result.answer }, 200);
  } catch (error) {
    if (error instanceof Error) return json({ message: error.message }, 502);
    throw error;
  }
}

function readQuestion(value: unknown): string | null {
  if (!isObject(value)) return null;
  const question = value.question;
  if (typeof question !== 'string') return null;
  const trimmed = question.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function buildSystemPrompt(context: string): string {
  return [
    'You are a portfolio assistant for Hoa Trinh Hai.',
    'You must answer ONLY from the provided context.',
    'If the question is outside the context or asks for unrelated topics, refuse briefly.',
    'Do not invent facts. Do not provide generic world knowledge unless directly tied to Hoa Trinh Hai.',
    '',
    'Context:',
    context,
  ].join('\n');
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}
