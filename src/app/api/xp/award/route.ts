import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { requireAdmin, logAudit } from '@/lib/admin-auth';
import { calculateLevel } from '@/lib/gamification';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin role
    const adminCheck = await requireAdmin();
    const isAdmin = !('error' in adminCheck);

    const body = await request.json();
    const { userId, amount, reason, category } = body;

    if (!userId || !amount || !reason) {
      return NextResponse.json({ error: 'userId, amount, and reason are required' }, { status: 400 });
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'amount must be a positive number' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const [xpGain, updatedProfile] = await db.$transaction(async (tx) => {
      const gain = await tx.xPGain.create({
        data: { userId, amount, reason, category: category || null },
      });

      const profile = await tx.profile.findUnique({ where: { userId } });
      if (!profile) throw new Error('Profile not found');

      const newXP = profile.xp + amount;
      const newLevel = calculateLevel(newXP);

      const updated = await tx.profile.update({
        where: { userId },
        data: { xp: newXP, level: newLevel },
      });

      return [gain, updated] as const;
    });

    if (isAdmin) {
      await logAudit(session.user.id, 'award_xp', userId, {
        amount,
        reason,
        category,
      });
    }

    return NextResponse.json({
      success: true,
      xpGain: { id: xpGain.id, amount: xpGain.amount, reason: xpGain.reason },
      newTotal: updatedProfile.xp,
      newLevel: updatedProfile.level,
    });
  } catch (error) {
    console.error('XP award error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
