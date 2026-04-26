interface RateLimitRecord {
  count: number
  resetAt: number
}

// Module-level store — persists across requests in the same Node.js process
const store = new Map<string, RateLimitRecord>()

// Cleanup entries older than 1 hour every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, record] of store) {
      if (now > record.resetAt) store.delete(key)
    }
  }, 10 * 60 * 1000)
}

/**
 * Returns true if the request is allowed, false if rate limited.
 * @param key      Unique key per (route + ip)
 * @param max      Maximum allowed requests in the window
 * @param windowMs Window duration in milliseconds
 */
export function checkRateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now()
  const record = store.get(key)

  if (!record || now > record.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (record.count >= max) return false

  record.count++
  return true
}

export function getClientIp(req: { headers: { get(name: string): string | null } }): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  )
}
