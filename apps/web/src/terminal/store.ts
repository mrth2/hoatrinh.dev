import { createStore } from 'solid-js/store';
import type { TerminalEntry } from './entries';

export type TerminalState = {
  entries: TerminalEntry[];
  currentInput: string;
  isExecuting: boolean;
};

export function createTerminalStore(initialEntries: TerminalEntry[] = []) {
  return createStore<TerminalState>({
    entries: initialEntries,
    currentInput: '',
    isExecuting: false,
  });
}
