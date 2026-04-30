// ============================================
// Rate Limiter — AI Recipe Generation
// Max 3 requests per IP per 24-hour window
// ============================================

const MAX_REQUESTS = 3;
const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

// In-memory store (resets on server restart — acceptable for a prototype)
const store = new Map<string, RateLimitEntry>();

/**
 * Returns the current rate limit status for an IP.
 * Mutates the store (increments count) if `consume` is true.
 */
export function checkRateLimit(ip: string, consume = true): {
  allowed: boolean;
  remaining: number;
  resetAt: number; // epoch ms when the window resets
} {
  const now = Date.now();
  let entry = store.get(ip);

  // Start a fresh window if none exists or the old one has expired
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    entry = { count: 0, windowStart: now };
  }

  const resetAt = entry.windowStart + WINDOW_MS;

  if (entry.count >= MAX_REQUESTS) {
    store.set(ip, entry);
    return { allowed: false, remaining: 0, resetAt };
  }

  if (consume) {
    entry.count += 1;
    store.set(ip, entry);
  }

  return {
    allowed: true,
    remaining: MAX_REQUESTS - entry.count,
    resetAt,
  };
}

export { MAX_REQUESTS };
