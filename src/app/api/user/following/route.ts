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

    const following = await db.follow.findMany({
      where: { followerId: session.user.id, status: 'accepted' },
      include: {
        following: {
          include: { profile: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      following: following.map((f) => ({
        id: f.id,
        createdAt: f.createdAt,
        user: {
          id: f.following.id,
          username: f.following.username,
          name: f.following.profile?.name,
          avatarUrl: f.following.profile?.avatarUrl,
          level: f.following.profile?.level,
          xp: f.following.profile?.xp,
        },
      })),
    });
  } catch (error) {
    console.error('Following list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
