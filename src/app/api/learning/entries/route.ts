import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserId } from '@/lib/auth-helper';
import { awardXP, reverseXP, updateStreak } from '@/lib/xp';

export async function GET(request: Request) {
  try {
    const userId = await getUserId();
    const { searchParams } = new URL(request.url);
    const topicId = searchParams.get('topicId');

    const where: any = { userId };
    if (topicId) where.topicId = topicId;

    const entries = await db.learningEntry.findMany({
      where,
      include: { topic: { select: { name: true } } },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Learning entries GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    const body = await request.json();
    const { title, content, duration, date, topicId } = body;

    if (!title || !topicId || !date) {
      return NextResponse.json({ error: 'Title, topicId, and date required' }, { status: 400 });
    }

    // Verify topic belongs to user
    const topic = await db.learningTopic.findUnique({ where: { id: topicId } });
    if (!topic || topic.userId !== userId) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    const entry = await db.learningEntry.create({
      data: {
        userId,
        title,
        content: content || null,
        duration: duration || null,
        date,
        topicId,
      },
    });

    // Award XP for learning entry (non-blocking — entry is already saved)
    let xpAwarded = 0;
    let newXP = 0;
    let newLevel = 0;
    try {
      const xpResult = await awardXP(userId, 'learning', `Learning: ${title}`);
      xpAwarded = xpResult.amount;
      newXP = xpResult.updated.xp;
      newLevel = xpResult.updated.level;
    } catch (xpError) {
      console.error('XP award error (entry still saved):', xpError);
    }

    // Notify users who bookmarked this shared topic about the new entry
    try {
      if (topic.isSharedCollection && topic.collectionVisibility === 'public') {
        const bookmarkers = await db.topicBookmark.findMany({
          where: { topicId },
          select: { userId: true },
        });
        const entryOwnerProfile = await db.profile.findUnique({ where: { userId }, select: { name: true } });
        const ownerName = entryOwnerProfile?.name || 'Someone';
        for (const bookmarker of bookmarkers) {
          if (bookmarker.userId !== userId) {
            await db.notification.create({
              data: {
                userId: bookmarker.userId,
                type: 'bookmarked_topic_update',
                fromUserId: userId,
                message: `${ownerName} added a new entry "${title}" to "${topic.name}"`,
                data: JSON.stringify({ topicId, entryId: entry.id }),
              },
            });
          }
        }
      }
    } catch (notifError) {
      console.error('Bookmarked topic update notification error (non-blocking):', notifError);
    }

    return NextResponse.json({
      entry,
      xpAwarded,
      newXP,
      newLevel,
    }, { status: 201 });
  } catch (error) {
    console.error('Learning entry POST error:', error);
    return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = await getUserId();
    const { searchParams } = new URL(request.url);
    const entryId = searchParams.get('entryId');
    const resetAll = searchParams.get('resetAll');

    if (resetAll === 'true') {
      // Delete all entries and reverse XP
      const entries = await db.learningEntry.findMany({
        where: { userId },
        select: { id: true },
      });

      if (entries.length === 0) {
        return NextResponse.json({ message: 'No entries to delete' });
      }

      // Calculate total XP to reverse (10 XP per entry)
      const totalXPToReverse = entries.length * 10;
      await reverseXP(userId, totalXPToReverse, `Reset all learning entries (-${entries.length})`);

      // Delete all entries
      await db.learningEntry.deleteMany({
        where: { userId },
      });

      return NextResponse.json({
        deletedCount: entries.length,
        xpReversed: totalXPToReverse,
      });
    }

    // Delete individual entry
    if (!entryId) {
      return NextResponse.json({ error: 'entryId or resetAll required' }, { status: 400 });
    }

    const entry = await db.learningEntry.findUnique({
      where: { id: entryId },
    });

    if (!entry || entry.userId !== userId) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    await db.learningEntry.delete({
      where: { id: entryId },
    });

    // Reverse XP for the deleted entry
    await reverseXP(userId, 10, `Deleted learning entry: ${entry.title}`);

    return NextResponse.json({
      deleted: true,
      xpReversed: 10,
    });
  } catch (error) {
    console.error('Learning entry DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 });
  }
}
