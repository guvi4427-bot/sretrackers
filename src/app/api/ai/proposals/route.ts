import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { listPendingProposals, expireOldProposals } from '@/lib/ai-action-proposals';

/**
 * GET /api/ai/proposals?module=productivity
 * Returns all pending proposals for the user (optionally filtered by module).
 * Also runs auto-expiry for proposals older than 24h before returning.
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const moduleName = searchParams.get('module') || undefined;

    // Auto-expire old proposals (non-blocking)
    expireOldProposals(session.user.id).catch(() => {});

    const proposals = await listPendingProposals(session.user.id, moduleName);
    return NextResponse.json({ proposals });
  } catch (error) {
    console.error('Proposals GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch proposals' }, { status: 500 });
  }
}
