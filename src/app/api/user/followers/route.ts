import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const followers = await db.follow.findMany({
      where: { followingId: session.user.id, status: 'accepted' },
      include: {
        follower: {
          include: { profile: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      followers: followers.map((f) => ({
        id: f.id,
        createdAt: f.createdAt,
        user: {
          id: f.follower.id,
          username: f.follower.username,
          name: f.follower.profile?.name,
          avatarUrl: f.follower.profile?.avatarUrl,
          level: f.follower.profile?.level,
          xp: f.follower.profile?.xp,
        },
      })),
    });
  } catch (error) {
    console.error('Followers list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
