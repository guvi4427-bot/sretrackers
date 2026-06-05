import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// AI Analytics endpoint for admin observability

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const adminRole = await db.adminRole.findUnique({
      where: { userId: session.user.id },
    });

    if (!adminRole) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Local-first provider: always available, zero latency
    const providers = [{
      name: 'local-responses',
      tier: 1,
      tierLabel: 'Local AI (Instant)',
      available: true,
      rateLimited: false,
      successRate: 1.0,
      avgLatencyMs: 0,
      totalRequests: 0,
      failCount: 0,
    }];

    return NextResponse.json({
      providers,
      recentRepetitionDetected: false,
      activeTier: 1,
      totalFallbackEvents: 0,
      lastFailedTrace: null,
    });
  } catch (error) {
    console.error('AI analytics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
