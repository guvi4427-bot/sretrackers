/**
 * Lightweight Rate Limiting — DB-backed for multi-instance consistency
 *
 * Since Vercel serverless functions can run on different instances,
 * in-memory rate limiting won't work. This uses the PostgreSQL database
 * for consistent rate limiting across all instances.
 *
 * TRADE-OFF: DB writes on every request are expensive, so we use a
 * probabilistic approach — only check the DB on a percentage of requests,
 * and use in-memory counters as a fast path.
 */

import { db } from '@/lib/db';
import { RATE_LIMITS, TRUSTED_CRAWLERS, type InstanceId } from './config';
import { getInstanceId } from './config';

// In-memory fast-path rate limit cache
// This reduces DB writes by ~90% for well-behaved users
const memoryCache = new Map<string, { count: number; resetAt: number }>();
const MEMORY_CACHE_TTL = 60_000; // 1 minute TTL for memory cache

// Clean up stale entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of memoryCache.entries()) {
    if (now > val.resetAt) memoryCache.delete(key);
  }
}, 30_000).unref?.();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  retryAfter?: number; // seconds
}

/**
 * Check rate limit for a given key.
 * Uses in-memory cache as fast path, DB as source of truth.
 */
export async function checkRateLimit(
  key: string,
  category: keyof typeof RATE_LIMITS,
): Promise<RateLimitResult> {
  const config = RATE_LIMITS[category];
  const now = Date.now();
  const resetAt = new Date(now + config.windowMs);

  // Fast path: check in-memory cache first
  const cached = memoryCache.get(key);
  if (cached && now < cached.resetAt) {
    if (cached.count >= config.max) {
      const retryAfter = Math.ceil((cached.resetAt - now) / 1000);
      return { allowed: false, remaining: 0, resetAt: new Date(cached.resetAt), retryAfter };
    }
    cached.count++;
    return { allowed: true, remaining: config.max - cached.count, resetAt };
  }

  // Slow path: check DB (sampled — only 20% of the time to reduce DB load)
  if (Math.random() < 0.2) {
    try {
      const entry = await db.rateLimitEntry.findUnique({ where: { key } });

      if (entry && entry.resetAt > new Date(now)) {
        // Existing entry within window
        if (entry.count >= config.max) {
          // Update memory cache
          memoryCache.set(key, { count: entry.count, resetAt: entry.resetAt.getTime() });
          const retryAfter = Math.ceil((entry.resetAt.getTime() - now) / 1000);
          return { allowed: false, remaining: 0, resetAt: entry.resetAt, retryAfter };
        }

        // Increment count
        const updated = await db.rateLimitEntry.update({
          where: { key },
          data: { count: { increment: 1 } },
        });

        memoryCache.set(key, { count: updated.count, resetAt: entry.resetAt.getTime() });
        return { allowed: true, remaining: Math.max(0, config.max - updated.count), resetAt };
      }

      // No entry or expired — create or reset
      await db.rateLimitEntry.upsert({
        where: { key },
        update: { count: 1, resetAt },
        create: { key, count: 1, resetAt },
      });

      memoryCache.set(key, { count: 1, resetAt: resetAt.getTime() });
      return { allowed: true, remaining: config.max - 1, resetAt };
    } catch {
      // DB error — allow request through (fail open)
      memoryCache.set(key, { count: 1, resetAt: resetAt.getTime() });
      return { allowed: true, remaining: config.max - 1, resetAt };
    }
  }

  // Memory-only path (80% of requests)
  const newCount = (cached?.count || 0) + 1;
  memoryCache.set(key, { count: newCount, resetAt: now + config.windowMs });

  if (newCount > config.max) {
    const retryAfter = Math.ceil(config.windowMs / 1000);
    return { allowed: false, remaining: 0, resetAt, retryAfter };
  }

  return { allowed: true, remaining: config.max - newCount, resetAt };
}

/**
 * Determine rate limit category from request path and method.
 */
export function getRateLimitCategory(path: string, method: string, isGuest: boolean): keyof typeof RATE_LIMITS {
  // Auth endpoints
  if (path.startsWith('/api/auth/')) return 'auth_endpoint';

  // AI endpoints
  if (path.startsWith('/api/ai/')) return 'ai_endpoint';

  // Admin endpoints
  if (path.startsWith('/api/admin/') || path.startsWith('/admin/')) return 'admin_endpoint';

  // Search
  if (path.includes('/discover') || path.includes('search') || path.includes('?q=')) return 'search_endpoint';

  // Write operations
  if (method !== 'GET') return 'api_write';

  // Guest mode
  if (isGuest) return 'guest_read';

  // Public pages
  if (!path.startsWith('/api/')) return 'public_read';

  // General API
  return 'api_general';
}

/**
 * Check if user agent is a trusted crawler (exempt from rate limiting).
 */
export function isTrustedCrawler(userAgent: string | null): boolean {
  if (!userAgent) return false;
  return TRUSTED_CRAWLERS.some(crawler =>
    userAgent.toLowerCase().includes(crawler.toLowerCase())
  );
}

/**
 * Generate rate limit key from request properties.
 */
export function getRateLimitKey(
  ip: string | null,
  userId: string | null,
  path: string,
  isGuest: boolean,
): string {
  // Authenticated users: key by userId
  if (userId) return `u:${userId}:${getRateLimitCategory(path, 'GET', isGuest)}`;

  // Guests: key by IP
  if (ip) return `ip:${ip}:${getRateLimitCategory(path, 'GET', isGuest)}`;

  // Fallback: path-based
  return `p:${path}`;
}

/**
 * Clean up expired rate limit entries (call periodically).
 */
export async function cleanupExpiredRateLimits() {
  try {
    await db.rateLimitEntry.deleteMany({
      where: { resetAt: { lt: new Date() } },
    });
  } catch {
    // Non-critical
  }
}
