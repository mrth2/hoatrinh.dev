import { isObject } from './utils';

export type AskApiResult = {
  kind: 'answer' | 'refusal';
  answer: string;
};

const ASK_UNAVAILABLE_MESSAGE = 'Hmm, my AI assistant hit a snag! Please try again in a moment.';

export async function askAboutMe(question: string): Promise<AskApiResult> {
  try {
    const response = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ question }),
    });

    const payload = (await response.json()) as unknown;

    if (!response.ok) {
      const message =
        response.status >= 500
          ? ASK_UNAVAILABLE_MESSAGE
          : (readMessage(payload) ?? `Request failed with status ${response.status}`);
      throw new Error(message);
    }

    if (!isAskApiResult(payload)) {
      throw new Error(ASK_UNAVAILABLE_MESSAGE);
    }

    return payload;
  } catch (error) {
    if (error instanceof Error && error.message === ASK_UNAVAILABLE_MESSAGE) throw error;
    throw new Error(ASK_UNAVAILABLE_MESSAGE);
  }
}

function isAskApiResult(value: unknown): value is AskApiResult {
  if (!isObject(value)) return false;
  const kind = value.kind;
  const answer = value.answer;
  return (kind === 'answer' || kind === 'refusal') && typeof answer === 'string';
}

function readMessage(value: unknown): string | null {
  if (!isObject(value)) return null;
  const message = value.message;
  return typeof message === 'string' ? message : null;
}
