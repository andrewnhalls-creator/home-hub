// Best-effort per-user rate limiting for expensive/abusable endpoints (AI
// parse/execute, export). In-memory sliding window: on serverless this is
// per-instance, which is acceptable for a private 2-person household app —
// it stops runaway loops and casual abuse, not a distributed attacker
// (documented trade-off; a shared store would be required for that).
const buckets = new Map<string, number[]>();

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): boolean {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    buckets.set(key, hits);
    return false;
  }
  hits.push(now);
  buckets.set(key, hits);
  return true;
}
