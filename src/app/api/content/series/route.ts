import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserId } from '@/lib/auth-helper';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('userId');

    // If userId is provided (public profile), use it; otherwise use logged-in user
    let userId: string;
    let isOwnData = true;
    if (targetUserId) {
      userId = targetUserId;
      isOwnData = false;
    } else {
      userId = await getUserId();
    }

    // Access control: check sharing settings and private account when viewing another user's data
    if (!isOwnData && targetUserId) {
      const viewerId = await getUserId();
      if (viewerId !== targetUserId) {
        const targetProfile = await db.profile.findUnique({ where: { userId: targetUserId }, select: { shareContentStatus: true, isPublic: true } });
        // If sharing is OFF, deny access
        if (!targetProfile?.shareContentStatus) {
          return NextResponse.json({ series: [] });
        }
        // If private account, check if viewer follows them
        if (targetProfile.isPublic === false) {
          const follow = await db.follow.findUnique({
            where: { followerId_followingId: { followerId: viewerId, followingId: targetUserId } },
            select: { status: true },
          });
          if (follow?.status !== 'accepted') {
            return NextResponse.json({ series: [] });
          }
        }
      }
    }

    const series = await db.contentSeries.findMany({
      where: { userId },
      include: {
        _count: { select: { entries: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ series });
  } catch (error) {
    console.error('Content series GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch series' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    const body = await request.json();
    const { name, description, category } = body;

    if (!name) {
      return NextResponse.json({ error: 'Series name required' }, { status: 400 });
    }

    const series = await db.contentSeries.create({
      data: {
        userId,
        name,
        description: description || null,
        category: category || null,
      },
    });

    return NextResponse.json({ series }, { status: 201 });
  } catch (error) {
    console.error('Content series POST error:', error);
    return NextResponse.json({ error: 'Failed to create series' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const userId = await getUserId();
    const body = await request.json();
    const { id, name, description, category } = body;

    if (!id) {
      return NextResponse.json({ error: 'Series ID required' }, { status: 400 });
    }

    const existing = await db.contentSeries.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: 'Series not found' }, { status: 404 });
    }

    const series = await db.contentSeries.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(category !== undefined && { category }),
      },
    });

    return NextResponse.json({ series });
  } catch (error) {
    console.error('Content series PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update series' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = await getUserId();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Series ID required' }, { status: 400 });
    }

    const existing = await db.contentSeries.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: 'Series not found' }, { status: 404 });
    }

    await db.contentSeries.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Content series DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete series' }, { status: 500 });
  }
}
