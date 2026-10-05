// Simple in-memory rate limiter
// Resets on server restart — good enough for Vercel serverless

const store = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { ok: boolean; remaining: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: maxRequests - 1 };
  }

  if (entry.count >= maxRequests) {
    return { ok: false, remaining: 0 };
  }

  entry.count++;
  return { ok: true, remaining: maxRequests - entry.count };
}

// Clean up old entries every 10 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetAt) store.delete(key);
  }
}, 10 * 60 * 1000);
