const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(identifier: string, limit = 250, windowMs = 60000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier) || { count: 0, resetTime: now + windowMs };

  if (now > entry.resetTime) {
    entry.count = 1;
    entry.resetTime = now + windowMs;
  } else {
    entry.count++;
  }

  rateLimitMap.set(identifier, entry);
  return entry.count <= limit;
}
