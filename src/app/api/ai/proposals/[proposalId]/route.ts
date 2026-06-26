import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { applyProposal, rejectProposal } from '@/lib/ai-action-proposals';

/**
 * POST /api/ai/proposals/[proposalId]/apply
 * Applies an approved proposal to the actual module data.
 * This is the ONLY way AI-proposed changes touch real user data —
 * and it requires an explicit POST from the user clicking "Approve".
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ proposalId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { proposalId } = await params;
    if (!proposalId) return NextResponse.json({ error: 'Proposal ID required' }, { status: 400 });

    const result = await applyProposal(proposalId, session.user.id);

    if (result.success) {
      return NextResponse.json({ success: true, message: result.message, entityId: result.entityId });
    }
    return NextResponse.json({ success: false, error: result.message }, { status: 400 });
  } catch (error) {
    console.error('Proposal apply error:', error);
    return NextResponse.json({ error: 'Failed to apply proposal' }, { status: 500 });
  }
}

/**
 * DELETE /api/ai/proposals/[proposalId]
 * Rejects (cancels) a pending proposal.
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ proposalId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { proposalId } = await params;
    if (!proposalId) return NextResponse.json({ error: 'Proposal ID required' }, { status: 400 });

    const success = await rejectProposal(proposalId, session.user.id);
    if (success) {
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: 'Proposal not found or not in pending state' }, { status: 404 });
  } catch (error) {
    console.error('Proposal reject error:', error);
    return NextResponse.json({ error: 'Failed to reject proposal' }, { status: 500 });
  }
}
