const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 5;

const hits = new Map<string, number[]>();

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

/**
 * Rate limit in-memory sederhana (per instance server). Cukup untuk menahan spam
 * dasar pada demo; pada produksi gunakan penyimpanan bersama (mis. Redis/Upstash).
 */
export function checkRateLimit(key: string, now = Date.now()): RateLimitResult {
  const recent = (hits.get(key) ?? []).filter((time) => now - time < WINDOW_MS);
  if (recent.length >= MAX_HITS) {
    hits.set(key, recent);
    const retryAfterMs = recent[0] + WINDOW_MS - now;
    return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)) };
  }
  recent.push(now);
  hits.set(key, recent);
  return { allowed: true, retryAfterSeconds: 0 };
}

export function resetRateLimitForTests(): void {
  hits.clear();
}
