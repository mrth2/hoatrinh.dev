import type { ClearAction } from '../entries';

export function clearHandler(_args: string[], _rest: string, _ctx: unknown): ClearAction {
  return { action: 'clear' };
}
