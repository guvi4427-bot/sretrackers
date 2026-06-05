import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

    // Check if already blocked
    const existing = await db.block.findUnique({
      where: { blockerId_blockedId: { blockerId: session.user.id, blockedId: userId } },
    });

    if (existing) {
      // Unblock
      await db.block.delete({ where: { id: existing.id } });
      // Also remove follow relationships
      await db.follow.deleteMany({
        where: {
          OR: [
            { followerId: session.user.id, followingId: userId },
            { followerId: userId, followingId: session.user.id },
          ],
        },
      });
      return NextResponse.json({ status: 'unblocked' });
    }

    // Block
    await db.block.create({
      data: { blockerId: session.user.id, blockedId: userId },
    });

    // Remove follow relationships
    await db.follow.deleteMany({
      where: {
        OR: [
          { followerId: session.user.id, followingId: userId },
          { followerId: userId, followingId: session.user.id },
        ],
      },
    });

    return NextResponse.json({ status: 'blocked' });
  } catch (error) {
    console.error('Block error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
