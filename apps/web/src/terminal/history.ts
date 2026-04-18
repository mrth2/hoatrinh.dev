const STORAGE_KEY = 'hoatrinh:history';
const CAP = 50;

function loadFromSession(): string[] {
  if (typeof sessionStorage === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function persist(list: string[]): void {
  if (typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // swallow; history is best-effort
  }
}

export type History = {
  entries: () => string[];
  push: (input: string) => void;
  cursor: () => number;
  startNavigation: (draft: string) => string | null;
  navigateUp: () => string | null;
  navigateDown: () => string | null;
  reset: () => void;
};

export function createHistory(): History {
  let list = loadFromSession();
  let cursor = -1;
  let draft = '';

  return {
    entries: () => list.slice(),
    push(input) {
      if (!input) return;
      if (list[0] === input) return;
      list = [input, ...list].slice(0, CAP);
      persist(list);
    },
    cursor: () => cursor,
    startNavigation(d) {
      const head = list[0];
      if (head === undefined) return null;
      draft = d;
      cursor = 0;
      return head;
    },
    navigateUp() {
      if (!list.length) return null;
      if (cursor < 0) {
        cursor = 0;
        return list[0] ?? null;
      }
      cursor = Math.min(cursor + 1, list.length - 1);
      return list[cursor] ?? null;
    },
    navigateDown() {
      if (cursor <= 0) {
        cursor = -1;
        const d = draft;
        draft = '';
        return d;
      }
      cursor -= 1;
      return list[cursor] ?? null;
    },
    reset() {
      cursor = -1;
      draft = '';
    },
  };
}
