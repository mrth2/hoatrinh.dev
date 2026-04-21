import { askAboutMe } from '@/lib/ai/client';
import { type ErrorEntry, nextEntryId, type TextEntry } from '../entries';

export async function askHandler(
  _args: string[],
  rest: string,
  _ctx: unknown,
): Promise<TextEntry | ErrorEntry> {
  const question = rest.trim();
  if (!question) {
    return {
      id: nextEntryId(),
      input: '/ask',
      kind: 'error',
      message: '/ask requires a question. Try: /ask <question>',
      suggestions: ['about', 'projects', 'experience', 'skills', 'contact'],
    };
  }

  try {
    const result = await askAboutMe(question);
    const lines = result.answer.split('\n').map((line) => line.trimEnd());
    const hasContent = lines.some((line) => line.trim().length > 0);

    return {
      id: nextEntryId(),
      input: `/ask ${question}`,
      kind: 'text',
      markdown: true,
      lines: hasContent ? lines : ['No response.'],
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        id: nextEntryId(),
        input: `/ask ${question}`,
        kind: 'error',
        message: error.message,
        suggestions: ['about', 'projects', 'experience', 'skills', 'contact', 'help'],
        contactLink: { label: 'contact me', href: 'mailto:hoatrinhdev@gmail.com' },
      };
    }
    throw error;
  }
}
