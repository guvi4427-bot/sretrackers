import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getTelemetryStats, getTelemetry } from '@/lib/ai-provider';

// GET /api/ai/telemetry — AI telemetry stats (admin only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Check admin role
    const { db } = await import('@/lib/db');
    const adminRole = await db.adminRole.findUnique({ where: { userId: session.user.id } });
    if (!adminRole) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

    const stats = getTelemetryStats();
    const recentTelemetry = getTelemetry().slice(-50);

    return NextResponse.json({ stats, recentTelemetry });
  } catch (error) {
    console.error('Telemetry error:', error);
    return NextResponse.json({ error: 'Failed to fetch telemetry' }, { status: 500 });
  }
}
