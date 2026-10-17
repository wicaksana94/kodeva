const CHECKOUT_STARTED_KEY = 'kodeva:checkout-started';
const CHECKOUT_WINDOW_MS = 30 * 60 * 1000;

export function markCheckoutStarted(now = Date.now()): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(CHECKOUT_STARTED_KEY, JSON.stringify({ at: now }));
  } catch {
    // sessionStorage bisa tidak tersedia (mode privat tertentu); abaikan.
  }
}

export function hasRecentCheckoutStart(now = Date.now()): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = window.sessionStorage.getItem(CHECKOUT_STARTED_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { at?: number };
    if (typeof parsed?.at !== 'number') return false;
    return now - parsed.at < CHECKOUT_WINDOW_MS;
  } catch {
    return false;
  }
}
