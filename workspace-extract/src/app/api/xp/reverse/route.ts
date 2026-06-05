import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, logAudit } from '@/lib/admin-auth';
import { calculateLevel } from '@/lib/gamification';

export async function POST(request: Request) {
  try {
    const adminCheck = await requireAdmin();
    if ('error' in adminCheck) {
      return NextResponse.json({ error: adminCheck.error!.message }, { status: adminCheck.error!.status });
    }

    const body = await request.json();
    const { userId, amount, reason } = body;

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
        data: { userId, amount: -amount, reason: `[REVERSED] ${reason}`, category: 'reversal' },
      });

      const profile = await tx.profile.findUnique({ where: { userId } });
      if (!profile) throw new Error('Profile not found');

      const newXP = Math.max(0, profile.xp - amount);
      const newLevel = calculateLevel(newXP);

      const updated = await tx.profile.update({
        where: { userId },
        data: { xp: newXP, level: newLevel },
      });

      return [gain, updated] as const;
    });

    await logAudit(adminCheck.data.session.user.id, 'reverse_xp', userId, {
      amount,
      reason,
    });

    return NextResponse.json({
      success: true,
      xpGain: { id: xpGain.id, amount: xpGain.amount, reason: xpGain.reason },
      newTotal: updatedProfile.xp,
      newLevel: updatedProfile.level,
    });
  } catch (error) {
    console.error('XP reverse error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
