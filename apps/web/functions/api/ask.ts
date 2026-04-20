import { evaluateAboutScope } from '../../src/lib/ai/topic-guard';
import { isObject } from '../../src/lib/ai/utils';
import {
  type ChatMessage,
  resolveModelCandidates,
  runWorkersAiWithFallback,
} from '../../src/lib/ai/workers-ai';
import { aboutKeywords, aboutPromptContext } from './about-data';

type WorkersAiBinding = {
  run: (
    model: string,
    options: {
      messages: ChatMessage[];
      temperature: number;
      max_tokens: number;
    },
  ) => Promise<unknown>;
};

type Env = {
  AI?: WorkersAiBinding;
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

  try {
    const model = context.env.WORKERS_AI_MODEL ?? DEFAULT_MODEL;
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: buildSystemPrompt(aboutPromptContext),
      },
      { role: 'user', content: question },
    ];
    const result = context.env.AI
      ? await runAiBindingWithFallback({
          ai: context.env.AI,
          primaryModel: model,
          fallbackModelsCsv: context.env.WORKERS_AI_FALLBACK_MODELS,
          messages,
          temperature: 0.2,
          maxTokens: 500,
        })
      : await runAiRestWithFallback({
          env: context.env,
          primaryModel: model,
          fallbackModelsCsv: context.env.WORKERS_AI_FALLBACK_MODELS,
          messages,
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

type AiCallOptions = {
  primaryModel: string;
  fallbackModelsCsv?: string;
  messages: ChatMessage[];
  maxTokens: number;
  temperature: number;
};

async function runAiRestWithFallback(
  options: AiCallOptions & { env: Env },
): Promise<{ answer: string; model: string }> {
  const accountId = options.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = options.env.CLOUDFLARE_API_TOKEN;
  if (!accountId || !apiToken) {
    throw new Error(
      'Workers AI is not configured. Bind AI in Cloudflare Pages (env.AI), or set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN.',
    );
  }

  return runWorkersAiWithFallback({
    accountId,
    apiToken,
    primaryModel: options.primaryModel,
    fallbackModelsCsv: options.fallbackModelsCsv,
    messages: options.messages,
    maxTokens: options.maxTokens,
    temperature: options.temperature,
  });
}

async function runAiBindingWithFallback(
  options: AiCallOptions & { ai: WorkersAiBinding },
): Promise<{ answer: string; model: string }> {
  const models = resolveModelCandidates(options.primaryModel, options.fallbackModelsCsv);
  const failures: string[] = [];

  for (const model of models) {
    try {
      const payload = await options.ai.run(model, {
        messages: options.messages,
        temperature: options.temperature,
        max_tokens: options.maxTokens,
      });
      const answer = readAiBindingText(payload);
      if (answer) return { answer, model };
      failures.push(`${model}: empty response`);
    } catch (error) {
      failures.push(`${model}: ${formatError(error)}`);
    }
  }

  throw new Error(`Workers AI request failed across models. ${failures.join(' | ')}`);
}

function readAiBindingText(payload: unknown): string | null {
  if (typeof payload === 'string') return payload.trim() || null;
  if (!isObject(payload)) return null;

  const response = payload.response;
  if (typeof response === 'string') return response.trim() || null;

  const outputText = payload.output_text;
  if (typeof outputText === 'string') return outputText.trim() || null;

  const text = payload.text;
  if (typeof text === 'string') return text.trim() || null;

  const result = payload.result;
  if (result !== undefined) {
    const nested = readAiBindingText(result);
    if (nested) return nested;
  }

  const outputs = payload.outputs;
  if (Array.isArray(outputs)) {
    for (const output of outputs) {
      const nested = readAiBindingText(output);
      if (nested) return nested;
    }
  }

  return null;
}

function formatError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'unknown error';
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}
