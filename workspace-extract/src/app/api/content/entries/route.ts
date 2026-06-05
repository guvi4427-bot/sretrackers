import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserId } from '@/lib/auth-helper';
import { awardXP, updateStreak, reverseXP } from '@/lib/xp';
import { checkAndNotifyEligibleAchievements } from '@/lib/achievements';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const seriesId = searchParams.get('seriesId');
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
          return NextResponse.json({ entries: [] });
        }
        // If private account, check if viewer follows them
        if (targetProfile.isPublic === false) {
          const follow = await db.follow.findUnique({
            where: { followerId_followingId: { followerId: viewerId, followingId: targetUserId } },
            select: { status: true },
          });
          if (follow?.status !== 'accepted') {
            return NextResponse.json({ entries: [] });
          }
        }
      }
    }

    const where: any = { userId };
    if (seriesId) where.seriesId = seriesId;

    const entries = await db.contentEntry.findMany({
      where,
      include: { series: { select: { name: true } } },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Content entries GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    const body = await request.json();
    const { title, content, status, contentType, liveStatus, platform, editTime, seriesId, shootDate, postDate } = body;

    if (!title || !seriesId) {
      return NextResponse.json({ error: 'Title and seriesId required' }, { status: 400 });
    }

    // Verify series belongs to user
    const series = await db.contentSeries.findUnique({ where: { id: seriesId } });
    if (!series || series.userId !== userId) {
      return NextResponse.json({ error: 'Series not found' }, { status: 404 });
    }

    const entry = await db.contentEntry.create({
      data: {
        userId,
        title,
        content: content || null,
        status: status || 'idea',
        contentType: contentType || 'post',
        liveStatus: liveStatus || 'not_started',
        platform: platform || null,
        editTime: editTime ? parseInt(editTime) : null,
        shootDate: shootDate || null,
        postDate: postDate || null,
        seriesId,
        publishedAt: status === 'published' ? new Date() : null,
      },
    });

    // Award XP for content creation
    const xpResult = await awardXP(userId, 'content', `Content: ${title}`);
    await updateStreak(userId);

    return NextResponse.json({
      entry,
      xpAwarded: xpResult.amount,
      newXP: xpResult.updated.xp,
      newLevel: xpResult.updated.level,
    }, { status: 201 });
  } catch (error) {
    console.error('Content entry POST error:', error);
    return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const userId = await getUserId();
    const body = await request.json();
    const { id, title, content, status, contentType, liveStatus, platform, editTime, shootDate, postDate } = body;

    if (!id) {
      return NextResponse.json({ error: 'Entry ID required' }, { status: 400 });
    }

    const existing = await db.contentEntry.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    const entry = await db.contentEntry.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(status !== undefined && {
          status,
          publishedAt: status === 'published' && !existing.publishedAt ? new Date() : existing.publishedAt,
        }),
        ...(contentType !== undefined && { contentType }),
        ...(liveStatus !== undefined && { liveStatus }),
        ...(platform !== undefined && { platform }),
        ...(editTime !== undefined && { editTime: parseInt(editTime) }),
        ...(shootDate !== undefined && { shootDate }),
        ...(postDate !== undefined && { postDate }),
      },
    });

    // Trigger achievement eligibility check when liveStatus changes
    if (liveStatus !== undefined && liveStatus !== existing.liveStatus) {
      try { await checkAndNotifyEligibleAchievements(userId); } catch {}
    }

    return NextResponse.json({ entry });
  } catch (error) {
    console.error('Content entry PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = await getUserId();
    let id: string | null = null;

    // Client sends id in JSON body
    try {
      const body = await request.json();
      id = body.id || null;
    } catch {
      // Fallback: try query param
      const { searchParams } = new URL(request.url);
      id = searchParams.get('id');
    }

    if (!id) {
      return NextResponse.json({ error: 'Entry ID required' }, { status: 400 });
    }

    const existing = await db.contentEntry.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    // Reverse XP awarded for content creation
    await reverseXP(userId, 10, `Deleted content: ${existing.title}`);

    await db.contentEntry.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Content entry DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 });
  }
}
