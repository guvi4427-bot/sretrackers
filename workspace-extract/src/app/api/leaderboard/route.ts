import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter') || 'global';

    let whereClause: any = {};
    if (filter === 'friends') {
      const follows = await db.follow.findMany({
        where: { followerId: session.user.id, status: 'accepted' },
        select: { followingId: true },
      });
      const friendIds = follows.map((f) => f.followingId);
      friendIds.push(session.user.id);
      whereClause = { id: { in: friendIds } };
    }

    const users = await db.profile.findMany({
      where: {
        ...whereClause,
        user: { adminRole: null },
      },
      orderBy: { xp: 'desc' },
      take: 50,
      include: { user: { select: { id: true, username: true } } },
    });

    const entries = users.map((p, i) => ({
      id: p.user.id,
      name: p.name || p.user.username,
      username: p.user.username,
      avatarUrl: p.avatarUrl,
      xp: p.xp,
      level: p.level,
      rank: i + 1,
    }));

    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
