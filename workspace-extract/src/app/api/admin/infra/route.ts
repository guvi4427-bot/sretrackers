import { NextResponse } from 'next/server';
import { requireAdmin, logAudit } from '@/lib/admin-auth';
import { getInfraStats } from '@/lib/infra/monitor';
import { getAbuseFlags, resolveAbuseFlag } from '@/lib/infra/abuse-detect';
import { db } from '@/lib/db';

/**
 * GET /api/admin/infra
 *
 * Returns infrastructure analytics for the admin dashboard.
 * Includes instance stats, request volume, abuse flags, and user mappings.
 */
export async function GET(req: Request) {
  try {
    const adminCheck = await requireAdmin();
    if ('error' in adminCheck) {
      return NextResponse.json({ error: adminCheck.error!.message }, { status: adminCheck.error!.status });
    }

    const { searchParams } = new URL(req.url);
    const section = searchParams.get('section') || 'overview';

    if (section === 'overview') {
      const stats = await getInfraStats();
      await logAudit(adminCheck.data.session.user.id, 'view_infra_dashboard');
      return NextResponse.json(stats);
    }

    if (section === 'abuse') {
      const status = searchParams.get('status') || 'active';
      const limit = parseInt(searchParams.get('limit') || '50');
      const flags = await getAbuseFlags(status, limit);

      // Enrich with user data
      const enrichedFlags = await Promise.all(flags.map(async (flag) => {
        if (flag.userId) {
          const user = await db.user.findUnique({
            where: { id: flag.userId },
            include: { profile: { select: { name: true, avatarUrl: true, level: true, currentStreak: true } } },
          });
          return { ...flag, user: user ? { id: user.id, username: user.username, name: user.profile?.name, avatarUrl: user.profile?.avatarUrl, level: user.profile?.level } : null };
        }
        return flag;
      }));

      return NextResponse.json({ flags: enrichedFlags });
    }

    if (section === 'users') {
      const stats = await getInfraStats();
      const userEntries = Object.entries(stats.userInstanceMap);

      // Enrich with user profiles
      const enrichedUsers = await Promise.all(
        userEntries.slice(0, 100).map(async ([userId, data]) => {
          const user = await db.user.findUnique({
            where: { id: userId },
            include: { profile: { select: { name: true, avatarUrl: true, level: true, currentStreak: true, xp: true } } },
          });
          return {
            userId,
            username: user?.username || 'unknown',
            name: user?.profile?.name || user?.username || 'Unknown',
            avatarUrl: user?.profile?.avatarUrl || null,
            level: user?.profile?.level || 0,
            xp: user?.profile?.xp || 0,
            instance: data.instance,
            requestCount: data.requestCount,
            lastActive: data.lastActive,
            paths: data.paths,
            intensity: data.requestCount > 100 ? 'high' : data.requestCount > 30 ? 'medium' : 'low',
          };
        })
      );

      return NextResponse.json({ users: enrichedUsers });
    }

    return NextResponse.json({ error: 'Invalid section' }, { status: 400 });
  } catch (error) {
    console.error('Admin infra API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/admin/infra
 *
 * Admin actions on infrastructure: resolve abuse flags, etc.
 */
export async function POST(req: Request) {
  try {
    const adminCheck = await requireAdmin();
    if ('error' in adminCheck) {
      return NextResponse.json({ error: adminCheck.error!.message }, { status: adminCheck.error!.status });
    }

    const body = await req.json();
    const { action } = body;

    if (action === 'resolve_abuse') {
      const { flagId, resolution, note } = body;
      if (!flagId || !resolution) {
        return NextResponse.json({ error: 'flagId and resolution required' }, { status: 400 });
      }
      const result = await resolveAbuseFlag(flagId, resolution, adminCheck.data.session.user.id, note);
      await logAudit(adminCheck.data.session.user.id, 'resolve_abuse_flag', flagId, { resolution, note });
      return NextResponse.json({ success: true, flag: result });
    }

    if (action === 'cleanup') {
      // Manual cleanup of expired entries
      const { cleanupExpiredOtps } = await import('@/lib/otp-store');
      const { cleanupExpiredRateLimits } = await import('@/lib/infra/rate-limit');
      await Promise.all([cleanupExpiredOtps(), cleanupExpiredRateLimits()]);
      await logAudit(adminCheck.data.session.user.id, 'infra_cleanup');
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Admin infra action error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
