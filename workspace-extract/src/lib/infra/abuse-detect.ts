/**
 * Abuse / Exploit Detection System
 *
 * Behavior-based detection of suspicious usage patterns.
 * Uses DB-backed request logs to identify anomalies.
 *
 * PRINCIPLES:
 * - Detection is behavior-based, not identity-based
 * - Gradual escalation: warn → throttle → restrict
 * - Avoid false positives — heavy users are not necessarily abusers
 * - Privacy-preserving — no tracking of message content or passwords
 */

import { db } from '@/lib/db';
import { ABUSE_THRESHOLDS } from './config';

export interface AbuseCheckResult {
  isAbusive: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  reason?: string;
  confidence: number;
  action: 'allow' | 'warn' | 'throttle' | 'block';
}

/**
 * Check if a user or IP is currently flagged for abuse.
 * Fast check — just looks at existing AbuseFlag records.
 */
export async function checkAbuseStatus(userId?: string | null, ip?: string | null): Promise<AbuseCheckResult> {
  if (!userId && !ip) return { isAbusive: false, severity: 'low', confidence: 0, action: 'allow' };

  try {
    const activeFlags = await db.abuseFlag.findMany({
      where: {
        status: 'active',
        ...(userId ? { userId } : {}),
        ...(ip && !userId ? { ip } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    if (activeFlags.length === 0) {
      return { isAbusive: false, severity: 'low', confidence: 0, action: 'allow' };
    }

    // Get highest severity flag
    const severityOrder = { low: 0, medium: 1, high: 2, critical: 3 };
    const worstFlag = activeFlags.reduce((worst, flag) => {
      return severityOrder[flag.severity as keyof typeof severityOrder] >
             severityOrder[worst.severity as keyof typeof severityOrder]
        ? flag : worst;
    });

    const severity = worstFlag.severity as AbuseCheckResult['severity'];
    const action = severity === 'critical' ? 'block'
                 : severity === 'high' ? 'throttle'
                 : severity === 'medium' ? 'warn'
                 : 'allow';

    return {
      isAbusive: true,
      severity,
      reason: worstFlag.reason,
      confidence: worstFlag.confidence,
      action,
    };
  } catch {
    return { isAbusive: false, severity: 'low', confidence: 0, action: 'allow' };
  }
}

/**
 * Analyze request patterns for potential abuse.
 * Called periodically or on suspicious activity.
 *
 * This is the CORE detection engine.
 */
export async function analyzeAbusePatterns(userId?: string | null, ip?: string | null): Promise<void> {
  const now = new Date();
  const tenSecondsAgo = new Date(now.getTime() - ABUSE_THRESHOLDS.rapidRequestWindowMs);
  const fifteenMinAgo = new Date(now.getTime() - ABUSE_THRESHOLDS.authFailWindowMs);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  try {
    // ── Check 1: Rapid-fire requests (same user) ──
    if (userId) {
      const recentRequests = await db.requestLog.count({
        where: {
          userId,
          createdAt: { gte: tenSecondsAgo },
        },
      });

      if (recentRequests >= ABUSE_THRESHOLDS.rapidRequestCount) {
        await flagAbuse({
          userId,
          severity: recentRequests >= ABUSE_THRESHOLDS.rapidRequestCount * 3 ? 'high' : 'medium',
          reason: 'Rapid-fire requests detected',
          details: { requestCount: recentRequests, window: '10s' },
          confidence: Math.min(recentRequests / (ABUSE_THRESHOLDS.rapidRequestCount * 2), 1),
        });
      }

      // ── Check 2: Excessive daily usage ──
      const dailyRequests = await db.requestLog.count({
        where: {
          userId,
          createdAt: { gte: oneDayAgo },
        },
      });

      if (dailyRequests >= ABUSE_THRESHOLDS.dailyRequestLimit) {
        await flagAbuse({
          userId,
          severity: dailyRequests >= ABUSE_THRESHOLDS.dailyRequestLimit * 2 ? 'critical' : 'high',
          reason: 'Excessive daily request volume',
          details: { requestCount: dailyRequests, limit: ABUSE_THRESHOLDS.dailyRequestLimit },
          confidence: Math.min(dailyRequests / (ABUSE_THRESHOLDS.dailyRequestLimit * 1.5), 1),
        });
      }

      // ── Check 3: AI endpoint abuse ──
      const aiRequests = await db.requestLog.count({
        where: {
          userId,
          path: { startsWith: '/api/ai/' },
          createdAt: { gte: oneDayAgo },
        },
      });

      if (aiRequests >= ABUSE_THRESHOLDS.aiDailyLimit) {
        await flagAbuse({
          userId,
          severity: aiRequests >= ABUSE_THRESHOLDS.aiDailyLimit * 2 ? 'high' : 'medium',
          reason: 'AI endpoint abuse detected',
          details: { aiCallCount: aiRequests, limit: ABUSE_THRESHOLDS.aiDailyLimit },
          confidence: Math.min(aiRequests / (ABUSE_THRESHOLDS.aiDailyLimit * 1.5), 1),
        });
      }

      // ── Check 4: Auth failure abuse ──
      const authFailures = await db.requestLog.count({
        where: {
          userId,
          path: { startsWith: '/api/auth/' },
          statusCode: { gte: 400 },
          createdAt: { gte: fifteenMinAgo },
        },
      });

      if (authFailures >= ABUSE_THRESHOLDS.authFailLimit) {
        await flagAbuse({
          userId,
          severity: 'high',
          reason: 'Repeated auth failures detected',
          details: { failureCount: authFailures, window: '15min' },
          confidence: Math.min(authFailures / (ABUSE_THRESHOLDS.authFailLimit * 2), 1),
        });
      }
    }

    // ── Check 5: IP-based burst detection ──
    if (ip) {
      const ipBurstRequests = await db.requestLog.count({
        where: {
          ip,
          createdAt: { gte: new Date(now.getTime() - ABUSE_THRESHOLDS.burstWindowMs) },
        },
      });

      if (ipBurstRequests >= ABUSE_THRESHOLDS.burstThreshold) {
        // Only flag if there's no userId (anonymous burst) or extremely high
        if (!userId || ipBurstRequests >= ABUSE_THRESHOLDS.burstThreshold * 2) {
          await flagAbuse({
            ip,
            userId,
            severity: ipBurstRequests >= ABUSE_THRESHOLDS.burstThreshold * 3 ? 'critical' : 'medium',
            reason: 'Request burst detected from IP',
            details: { requestCount: ipBurstRequests, window: '30s' },
            confidence: Math.min(ipBurstRequests / (ABUSE_THRESHOLDS.burstThreshold * 2), 1),
          });
        }
      }
    }

    // ── Check 6: Bot-like pattern detection ──
    // Suspicious: identical request intervals, no diversity in paths
    if (userId) {
      const recentLogs = await db.requestLog.findMany({
        where: { userId, createdAt: { gte: new Date(now.getTime() - 5 * 60_000) } },
        orderBy: { createdAt: 'asc' },
        take: 50,
        select: { path: true, responseMs: true, createdAt: true },
      });

      if (recentLogs.length >= 20) {
        // Check path diversity — bots tend to hit the same endpoints
        const uniquePaths = new Set(recentLogs.map(l => l.path));
        const pathDiversity = uniquePaths.size / recentLogs.length;

        // Check timing regularity — bots have very consistent intervals
        const intervals: number[] = [];
        for (let i = 1; i < recentLogs.length; i++) {
          intervals.push(new Date(recentLogs[i].createdAt).getTime() - new Date(recentLogs[i-1].createdAt).getTime());
        }
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const intervalVariance = intervals.reduce((sum, int) => sum + Math.pow(int - avgInterval, 2), 0) / intervals.length;
        const isRegular = intervalVariance < 1000 && avgInterval < 10000; // Very regular + fast

        if (pathDiversity < 0.1 && isRegular) {
          await flagAbuse({
            userId,
            severity: 'medium',
            reason: 'Bot-like request pattern detected',
            details: { pathDiversity, avgIntervalMs: avgInterval, intervalVariance, requestCount: recentLogs.length },
            confidence: Math.max(0.5, 1 - pathDiversity),
          });
        }
      }
    }
  } catch (e) {
    console.error('[Abuse] Analysis error:', e);
  }
}

/**
 * Flag a user/IP for abuse.
 * De-duplicates: if an active flag with same reason exists, updates it.
 */
async function flagAbuse(opts: {
  userId?: string | null;
  ip?: string | null;
  severity: 'low' | 'medium' | 'high' | 'critical';
  reason: string;
  details?: Record<string, unknown>;
  confidence: number;
}) {
  try {
    // Check for existing active flag with same reason
    const existing = await db.abuseFlag.findFirst({
      where: {
        status: 'active',
        reason: opts.reason,
        ...(opts.userId ? { userId: opts.userId } : {}),
        ...(opts.ip ? { ip: opts.ip } : {}),
      },
    });

    if (existing) {
      // Update severity if escalated
      const severityOrder = { low: 0, medium: 1, high: 2, critical: 3 };
      const currentSeverity = severityOrder[existing.severity as keyof typeof severityOrder];
      const newSeverity = severityOrder[opts.severity];

      if (newSeverity > currentSeverity || opts.confidence > existing.confidence) {
        await db.abuseFlag.update({
          where: { id: existing.id },
          data: {
            severity: opts.severity,
            confidence: Math.max(existing.confidence, opts.confidence),
            details: opts.details ? JSON.stringify(opts.details) : existing.details,
          },
        });
      }
    } else {
      await db.abuseFlag.create({
        data: {
          userId: opts.userId || null,
          ip: opts.ip || null,
          severity: opts.severity,
          reason: opts.reason,
          details: opts.details ? JSON.stringify(opts.details) : null,
          confidence: opts.confidence,
        },
      });
    }
  } catch (e) {
    console.error('[Abuse] Flag creation error:', e);
  }
}

/**
 * Get all flagged users for admin dashboard.
 */
export async function getAbuseFlags(status?: string, limit = 50) {
  return db.abuseFlag.findMany({
    where: status ? { status } : {},
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

/**
 * Admin action on an abuse flag.
 */
export async function resolveAbuseFlag(flagId: string, action: 'dismiss' | 'action', adminId: string, note?: string) {
  return db.abuseFlag.update({
    where: { id: flagId },
    data: {
      status: action === 'dismiss' ? 'dismissed' : 'actioned',
      reviewedBy: adminId,
      adminNote: note || null,
    },
  });
}
