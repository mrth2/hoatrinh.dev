import { isObject } from './utils';

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type WorkersAiCallOptions = {
  accountId: string;
  apiToken: string;
  primaryModel: string;
  fallbackModelsCsv?: string;
  messages: ChatMessage[];
  maxTokens: number;
  temperature: number;
  fetchImpl?: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
};

export type WorkersAiCallResult = {
  answer: string;
  model: string;
};

export async function runWorkersAiWithFallback(
  options: WorkersAiCallOptions,
): Promise<WorkersAiCallResult> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const models = resolveModelCandidates(options.primaryModel, options.fallbackModelsCsv);
  const failures: string[] = [];

  for (const model of models) {
    const response = await fetchImpl(
      `https://api.cloudflare.com/client/v4/accounts/${options.accountId}/ai/run/${model}`,
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${options.apiToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          messages: options.messages,
          temperature: options.temperature,
          max_tokens: options.maxTokens,
        }),
      },
    );

    const payload = await parseJsonSafely(response);
    if (response.ok) {
      const answer = extractWorkersText(payload);
      if (answer) return { answer, model };
      failures.push(`${model}: empty response`);
      continue;
    }

    const errorMessage = readWorkersError(payload) ?? `HTTP ${response.status}`;
    failures.push(`${model}: ${errorMessage}`);
    if (!isRetryableStatus(response.status)) break;
  }

  throw new Error(`Workers AI request failed across models. ${failures.join(' | ')}`);
}

export function resolveModelCandidates(primaryModel: string, fallbackModelsCsv?: string): string[] {
  const raw = [primaryModel, ...(fallbackModelsCsv?.split(',') ?? [])];
  const models = raw.map((value) => value.trim()).filter((value) => value.length > 0);
  return Array.from(new Set(models));
}

function isRetryableStatus(status: number): boolean {
  return status === 429 || status >= 500;
}

async function parseJsonSafely(response: Response): Promise<unknown> {
  try {
    return (await response.json()) as unknown;
  } catch {
    return null;
  }
}

function extractWorkersText(payload: unknown): string | null {
  if (!isObject(payload)) return null;
  const result = payload.result;
  if (typeof result === 'string') return result.trim() || null;
  if (!isObject(result)) return null;

  const response = result.response;
  if (typeof response === 'string') return response.trim() || null;

  const outputText = result.output_text;
  if (typeof outputText === 'string') return outputText.trim() || null;

  const text = result.text;
  if (typeof text === 'string') return text.trim() || null;

  const outputs = result.outputs;
  if (!Array.isArray(outputs) || outputs.length === 0) return null;
  const first = outputs[0];
  if (!isObject(first)) return null;
  const firstText = first.text;
  return typeof firstText === 'string' ? firstText.trim() || null : null;
}

function readWorkersError(payload: unknown): string | null {
  if (!isObject(payload)) return null;
  const errors = payload.errors;
  if (!Array.isArray(errors) || errors.length === 0) return null;
  const first = errors[0];
  if (!isObject(first)) return null;
  const message = first.message;
  return typeof message === 'string' ? message : null;
}
