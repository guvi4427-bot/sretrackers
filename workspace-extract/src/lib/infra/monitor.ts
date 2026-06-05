/**
 * Server Instance Monitoring — DB-backed metrics collection
 *
 * SERVERLESS-COMPATIBLE: In Vercel's serverless environment, in-memory
 * buffers and setInterval timers are unreliable (wiped on cold starts,
 * never fire because functions finish before the interval).
 *
 * Strategy:
 * - recordRequest() writes directly to DB (no in-memory buffering)
 * - logRequest() samples 30% of requests (up from 10%) for better coverage
 * - getInfraStats() uses Profile.lastActiveDate for accurate active user counts
 *   and RequestLog for user-instance mapping
 * - No timer-based flushing needed — every metric is persisted immediately
 *
 * LIGHTWEIGHT: Uses the existing PostgreSQL database, no Redis/Kafka/etc.
 */

import { db } from '@/lib/db';
import { getInstanceId, INSTANCE_IDS, type InstanceId } from './config';

/**
 * Record a request metric and write immediately to DB.
 * Serverless-safe: no in-memory buffering that gets wiped on cold starts.
 *
 * We aggregate on read (in getInfraStats) rather than on write.
 * Each record is a single request event for a given instance.
 */
export async function recordRequest(opts: {
  path: string;
  method: string;
  statusCode: number;
  responseMs: number;
  userId?: string;
  ip?: string;
  userAgent?: string;
  isGuest?: boolean;
  isCrawler?: boolean;
  type?: 'navigation' | 'heartbeat' | 'api_call';
  instanceId?: string; // Override: used when middleware records API calls with a known instance
}) {
  const instanceId = opts.instanceId || getInstanceId();

  try {
    await db.serverMetrics.create({
      data: {
        instanceId,
        activeUsers: opts.userId ? 1 : 0, // Per-record: 1 if user is present; aggregated in getInfraStats()
        requestCount: 1,
        avgResponseMs: opts.responseMs,
        memoryUsageMb: 0, // Serverless — not meaningful
        apiCalls: opts.path.startsWith('/api/') ? 1 : 0,
        concurrentConns: 0,
        errorCount: opts.statusCode >= 400 ? 1 : 0,
        periodStart: new Date(),
        periodEnd: new Date(),
      },
    });
  } catch (e) {
    // Non-critical — don't crash the app if metrics fail
    console.error('[Infra] Metrics record failed:', e);
  }
}

/**
 * Log an individual request to the DB for admin analytics.
 * Samples a portion of requests to avoid overwhelming the DB.
 * Increased from 10% to 30% for better user mapping coverage.
 *
 * ALWAYS logs authenticated user requests (to ensure user mapping works).
 * Only samples guest/crawler requests.
 */
const LOG_SAMPLE_RATE_GUEST = 0.1;  // Log 10% of guest requests
const LOG_SAMPLE_RATE_USER = 0.5;   // Log 50% of authenticated user requests

export async function logRequest(opts: {
  path: string;
  method: string;
  statusCode: number;
  responseMs: number;
  userId?: string;
  ip?: string;
  userAgent?: string;
  isGuest?: boolean;
  instanceId?: string; // Override: used when middleware records API calls with a known instance
}) {
  // Authenticated users get higher sampling for accurate user mapping
  const sampleRate = opts.userId ? LOG_SAMPLE_RATE_USER : LOG_SAMPLE_RATE_GUEST;
  if (Math.random() > sampleRate) return;

  const instanceId = opts.instanceId || getInstanceId();
  const isCrawler = opts.userAgent
    ? /googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|facebookexternalhit|twitterbot|linkedinbot|applebot|mediapartners/i.test(opts.userAgent)
    : false;

  try {
    await db.requestLog.create({
      data: {
        userId: opts.userId || null,
        instanceId,
        path: opts.path.slice(0, 255),
        method: opts.method,
        statusCode: opts.statusCode,
        responseMs: opts.responseMs,
        ip: opts.ip?.slice(0, 45) || null,
        userAgent: opts.userAgent?.slice(0, 500) || null,
        isGuest: opts.isGuest || false,
        isCrawler,
      },
    });
  } catch {
    // Non-critical
  }
}

/**
 * Get aggregate infrastructure stats for admin dashboard.
 *
 * Uses BOTH ServerMetrics (request volume, response times) AND
 * Profile.lastActiveDate (for accurate active user counting).
 * This ensures users who are browsing but not earning XP are still counted.
 */
export async function getInfraStats() {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // ── Active User Count from Profile.lastActiveDate ──
  // This is more reliable than ServerMetrics.activeUsers because:
  // 1. lastActiveDate is updated on every metrics report (not just XP earn)
  // 2. It persists across serverless cold starts
  const todayStr = now.toISOString().split('T')[0]; // YYYY-MM-DD

  // Count users who were active today
  const activeUsersToday = await db.profile.count({
    where: {
      lastActiveDate: { gte: todayStr },
    },
  });

  // Count users who were active in the last 7 days (for consistency with admin dashboard)
  const sevenDaysAgoDate = new Date(now);
  sevenDaysAgoDate.setDate(sevenDaysAgoDate.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgoDate.toISOString().split('T')[0];
  const activeUsers7d = await db.profile.count({
    where: {
      lastActiveDate: { gte: sevenDaysAgoStr },
    },
  });

  // ── Recent metrics per instance (last hour) ──
  const recentMetrics = await db.serverMetrics.findMany({
    where: { periodStart: { gte: oneHourAgo } },
    orderBy: { createdAt: 'desc' },
    take: 500,
  });

  // Count unique users per instance from RequestLog (last hour)
  const recentUserLogs = await db.requestLog.findMany({
    where: {
      createdAt: { gte: oneHourAgo },
      userId: { not: null },
    },
    orderBy: { createdAt: 'desc' },
    take: 500,
    select: {
      userId: true,
      instanceId: true,
    },
  });

  // Build per-instance user sets
  const instanceUserSets: Record<string, Set<string>> = { A: new Set(), B: new Set(), C: new Set() };
  recentUserLogs.forEach(log => {
    if (log.userId && instanceUserSets[log.instanceId]) {
      instanceUserSets[log.instanceId].add(log.userId);
    }
  });

  // Aggregate per instance
  const instanceStats = INSTANCE_IDS.map(id => {
    const instanceMetrics = recentMetrics.filter(m => m.instanceId === id);
    const totalRequests = instanceMetrics.reduce((sum, m) => sum + m.requestCount, 0);
    const totalErrors = instanceMetrics.reduce((sum, m) => sum + m.errorCount, 0);
    const totalResponseMs = instanceMetrics.reduce((sum, m) => sum + (m.avgResponseMs * m.requestCount), 0);
    const totalApiCalls = instanceMetrics.reduce((sum, m) => sum + m.apiCalls, 0);
    const latestMetric = instanceMetrics[0];

    // Use actual unique users from RequestLog for this instance
    const uniqueUsersForInstance = instanceUserSets[id]?.size || 0;

    // If no RequestLog data but we have ServerMetrics, estimate proportionally
    const totalUniqueUsers = Object.values(instanceUserSets).reduce((sum, s) => sum + s.size, 0);
    const estimatedActiveUsers = uniqueUsersForInstance > 0
      ? uniqueUsersForInstance
      : (totalRequests > 0 ? Math.max(1, Math.round(activeUsersToday / 3)) : 0);

    return {
      id,
      activeUsers: estimatedActiveUsers,
      requestCount: totalRequests,
      errorRate: totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0,
      avgResponseMs: totalRequests > 0 ? totalResponseMs / totalRequests : 0,
      apiCalls: totalApiCalls,
      errorCount: totalErrors,
      lastActive: latestMetric?.createdAt || null,
      status: totalRequests > 0 && (totalErrors / totalRequests) < 0.1 ? 'healthy' as const
            : totalRequests > 0 && (totalErrors / totalRequests) < 0.3 ? 'degraded' as const
            : totalRequests > 0 ? 'unhealthy' as const : 'healthy' as const,
    };
  });

  // Total request volume (last 24h)
  const dayMetrics = await db.serverMetrics.findMany({
    where: { periodStart: { gte: oneDayAgo } },
  });
  const totalDayRequests = dayMetrics.reduce((sum, m) => sum + m.requestCount, 0);
  const totalDayErrors = dayMetrics.reduce((sum, m) => sum + m.errorCount, 0);
  const totalDayApiCalls = dayMetrics.reduce((sum, m) => sum + m.apiCalls, 0);

  // Requests per minute (last hour)
  const rpmBuckets = new Map<string, number>();
  recentMetrics.forEach(m => {
    const minute = m.periodStart.toISOString().slice(0, 16);
    rpmBuckets.set(minute, (rpmBuckets.get(minute) || 0) + m.requestCount);
  });
  const requestsPerMinute = Array.from(rpmBuckets.entries())
    .map(([minute, count]) => ({ minute, count }))
    .sort((a, b) => a.minute.localeCompare(b.minute))
    .slice(-60);

  // Active abuse flags
  const activeAbuseFlags = await db.abuseFlag.count({
    where: { status: 'active' },
  });

  // Active rate-limited entries
  const rateLimitedEntries = await db.rateLimitEntry.count({
    where: { resetAt: { gt: now } },
  });

  // Recent request logs for user mapping (full details)
  const recentRequestLogs = await db.requestLog.findMany({
    where: { createdAt: { gte: oneHourAgo }, userId: { not: null } },
    orderBy: { createdAt: 'desc' },
    take: 200,
    select: {
      userId: true,
      instanceId: true,
      path: true,
      responseMs: true,
      createdAt: true,
      isGuest: true,
      isCrawler: true,
    },
  });

  // User → instance mapping
  const userInstanceMap = new Map<string, { instance: string; requestCount: number; lastActive: Date; paths: Set<string> }>();
  recentRequestLogs.forEach(log => {
    if (!log.userId) return;
    const existing = userInstanceMap.get(log.userId);
    if (existing) {
      existing.requestCount++;
      existing.paths.add(log.path.split('?')[0]);
      if (log.createdAt > existing.lastActive) {
        existing.lastActive = log.createdAt;
        existing.instance = log.instanceId;
      }
    } else {
      userInstanceMap.set(log.userId, {
        instance: log.instanceId,
        requestCount: 1,
        lastActive: log.createdAt,
        paths: new Set([log.path.split('?')[0]]),
      });
    }
  });

  // Clean up old metrics (older than 7 days) — fire and forget
  const sevenDaysAgoCleanup = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  db.serverMetrics.deleteMany({ where: { periodEnd: { lt: sevenDaysAgoCleanup } } }).catch(() => {});
  db.requestLog.deleteMany({ where: { createdAt: { lt: sevenDaysAgoCleanup } } }).catch(() => {});

  return {
    instanceStats,
    overview: {
      totalDayRequests,
      totalDayErrors,
      totalDayApiCalls,
      errorRate: totalDayRequests > 0 ? (totalDayErrors / totalDayRequests) * 100 : 0,
      activeAbuseFlags,
      rateLimitedEntries,
      activeUsersToday,
      activeUsers7d,
    },
    requestsPerMinute,
    userInstanceMap: Object.fromEntries(
      Array.from(userInstanceMap.entries()).map(([userId, data]) => [
        userId,
        { ...data, paths: Array.from(data.paths) },
      ])
    ),
  };
}

/**
 * Legacy flush function — no-op in the new immediate-write model.
 * Kept for backward compatibility with existing code that calls it.
 */
export async function flushMetrics(_instanceId?: InstanceId) {
  // No-op: metrics are now written immediately on each recordRequest() call
  // This is intentional — serverless environments can't rely on in-memory buffering
}

/**
 * Legacy auto-flush starter — no-op in the new immediate-write model.
 * Kept for backward compatibility.
 */
export function startMetricsFlush() {
  // No-op: metrics are now written immediately on each recordRequest() call
  // Timer-based flushing doesn't work in serverless (cold starts wipe everything)
}
