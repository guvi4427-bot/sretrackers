import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { recordRequest, logRequest } from '@/lib/infra/monitor';
import { getInstanceId } from '@/lib/infra/config';
import { db } from '@/lib/db';

/**
 * Internal secret for middleware → API call recording.
 * The middleware can't use Prisma (Edge Runtime), so it fire-and-forget
 * POSTs API call info here. The secret header prevents external abuse.
 */
const INTERNAL_SECRET = process.env.INTERNAL_METRICS_SECRET || 'sre-internal-metrics-2024';

/**
 * POST /api/infra/metrics
 *
 * Dual-purpose endpoint:
 * 1. Client-side metrics: Records page navigation/heartbeat data from browsers.
 *    Requires authenticated session.
 * 2. Internal API call recording: Records API call metrics from the middleware.
 *    Requires X-Internal-Metrics-Key header (no session needed).
 */
export async function POST(req: Request) {
  try {
    // ── Check for internal middleware recording ──
    const internalKey = req.headers.get('x-internal-metrics-key');
    if (internalKey && internalKey === INTERNAL_SECRET) {
      return handleInternalRecording(req);
    }

    // ── Standard client-side metrics (requires session) ──
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { path, method, statusCode, responseMs, isGuest, type } = body;

    // Determine if this is a heartbeat (less frequent DB writes) vs navigation
    const isHeartbeat = type === 'heartbeat';

    // Record the metric (writes directly to DB now — serverless safe)
    recordRequest({
      path: path || '',
      method: method || 'GET',
      statusCode: statusCode || 200,
      responseMs: responseMs || 0,
      userId: session.user.id,
      isGuest: isGuest || false,
      type: type || 'navigation',
    }).catch(() => {});

    // Log a sample of requests (for user mapping in admin dashboard)
    // Heartbeats get sampled at lower rate to reduce DB writes
    if (!isHeartbeat || Math.random() < 0.1) {
      logRequest({
        path: path || '',
        method: method || 'GET',
        statusCode: statusCode || 200,
        responseMs: responseMs || 0,
        userId: session.user.id,
        isGuest: false,
      }).catch(() => {});
    }

    // ── Update Profile.lastActiveDate ──
    // This is CRITICAL: previously lastActiveDate was only updated when users
    // earned XP. Now we update it on every metrics report so browsing users
    // are counted as "active" in the admin dashboard.
    //
    // We only update once per day per user (same-day updates are no-ops
    // since lastActiveDate is a YYYY-MM-DD string).
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      await db.profile.updateMany({
        where: {
          userId: session.user.id,
          // Only update if not already set to today (avoid unnecessary writes)
          lastActiveDate: { not: today },
        },
        data: {
          lastActiveDate: today,
        },
      });
    } catch {
      // Non-critical — profile might not exist yet
    }

    return NextResponse.json({ recorded: true, instance: getInstanceId() });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Handle internal API call recording from the middleware.
 *
 * The middleware detects API routes and fire-and-forget POSTs here
 * because it can't use Prisma in Edge Runtime.
 * This ensures API calls are counted in the infrastructure dashboard.
 */
async function handleInternalRecording(req: Request) {
  try {
    const body = await req.json();
    const { path, method, instanceId, userId, ip, userAgent, isGuest } = body;

    // Record to ServerMetrics — this is what populates "API Calls" in the dashboard
    // The path starts with /api/ so recordRequest will set apiCalls: 1
    // Pass instanceId from the middleware so the correct instance gets credited
    recordRequest({
      path: path || '',
      method: method || 'GET',
      statusCode: 200, // Middleware records before handler runs, default to 200
      responseMs: 0,   // Timing not available at middleware stage
      userId: userId || undefined,
      ip: ip || undefined,
      userAgent: userAgent || undefined,
      isGuest: isGuest || false,
      type: 'api_call',
      instanceId: instanceId || undefined,
    }).catch(() => {});

    // Log a sample of API calls for user mapping (30% sample rate)
    if (Math.random() < 0.3 && userId) {
      logRequest({
        path: path || '',
        method: method || 'GET',
        statusCode: 200,
        responseMs: 0,
        userId: userId,
        ip: ip || undefined,
        userAgent: userAgent || undefined,
        isGuest: isGuest || false,
        instanceId: instanceId || undefined,
      }).catch(() => {});
    }

    return NextResponse.json({ recorded: true, source: 'internal', instance: instanceId || getInstanceId() });
  } catch {
    return NextResponse.json({ recorded: false }, { status: 500 });
  }
}

/**
 * GET /api/infra/metrics
 *
 * Lightweight health/metrics endpoint for monitoring.
 * Returns basic instance info (no auth required for health checks).
 */
export async function GET() {
  const instanceId = getInstanceId();

  return NextResponse.json({
    status: 'ok',
    instance: instanceId,
    timestamp: new Date().toISOString(),
    instances: ['A', 'B', 'C'],
  });
}
