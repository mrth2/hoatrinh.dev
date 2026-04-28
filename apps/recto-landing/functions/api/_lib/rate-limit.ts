const WINDOW_MS = 60_000;
const MAX_REQUESTS = 5;

// Map from key to list of timestamps within the current window
const store = new Map<string, number[]>();

export function checkRateLimit(key: string, nowMs?: number): boolean {
  const now = nowMs ?? Date.now();
  const windowStart = now - WINDOW_MS;

  const timestamps = (store.get(key) ?? []).filter((t) => t > windowStart);

  if (timestamps.length >= MAX_REQUESTS) {
    store.set(key, timestamps);
    return false;
  }

  timestamps.push(now);
  store.set(key, timestamps);
  return true;
}

export function _resetRateLimiterForTests(): void {
  store.clear();
}
