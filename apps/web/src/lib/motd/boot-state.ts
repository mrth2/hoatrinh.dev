const KEY = 'hoa:booted';

export function hasBooted(): boolean {
  if (typeof sessionStorage === 'undefined') return true;
  return sessionStorage.getItem(KEY) === '1';
}

export function markBooted(): void {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.setItem(KEY, '1');
}

export function resetBooted(): void {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.removeItem(KEY);
}

export function shouldAnimateBoot(): boolean {
  if (hasBooted()) return false;
  if (typeof window === 'undefined') return false;
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  return !reduce;
}
