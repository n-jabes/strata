type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateLimitBucket>();

function nowMs() {
  return Date.now();
}

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();
  return "unknown";
}

export function checkRateLimit(params: {
  key: string;
  limit: number;
  windowMs: number;
}): { allowed: boolean; retryAfterSeconds: number } {
  const { key, limit, windowMs } = params;
  const current = nowMs();

  const existing = buckets.get(key);
  if (!existing || current >= existing.resetAt) {
    buckets.set(key, { count: 1, resetAt: current + windowMs });
    return { allowed: true, retryAfterSeconds: Math.ceil(windowMs / 1000) };
  }

  if (existing.count >= limit) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((existing.resetAt - current) / 1000)
    );
    return { allowed: false, retryAfterSeconds };
  }

  existing.count += 1;
  buckets.set(key, existing);
  return {
    allowed: true,
    retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - current) / 1000)),
  };
}
