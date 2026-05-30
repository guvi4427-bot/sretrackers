import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserId } from '@/lib/auth-helper';

/**
 * Cron endpoint + Client-triggered endpoint:
 * Check for learning topics with 21+ days of inactivity
 * and send topic-switch recommendation notifications.
 *
 * Two modes:
 * 1. Cron mode (Vercel Cron): Checks ALL users. Requires CRON_SECRET.
 * 2. Client mode (logged-in user): Checks only the calling user's topics.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  const providedSecret = searchParams.get('secret') || authHeader?.replace('Bearer ', '');

  // Determine mode: cron (all users) vs client (single user)
  const isCronCall = !!providedSecret && (!cronSecret || providedSecret === cronSecret);

  let targetUserId: string | null = null;

  if (!isCronCall) {
    // Client-mode: only check the logged-in user's topics
    try {
      targetUserId = await getUserId();
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const now = new Date();
    const twentyOneDaysAgoStr = new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const where: any = {};
    if (targetUserId) where.userId = targetUserId;

    // Find relevant learning topics
    const topics = await db.learningTopic.findMany({
      where,
      select: {
        id: true,
        name: true,
        userId: true,
        createdAt: true,
        entries: {
          select: { date: true },
          orderBy: { date: 'desc' },
          take: 1,
        },
      },
    });

    let notificationsSent = 0;

    for (const topic of topics) {
      const startDate = topic.createdAt.toISOString().split('T')[0];
      const lastEntryDate = topic.entries.length > 0 ? topic.entries[0].date : null;

      let shouldNotify = false;
      let daysInactive = 0;

      if (!lastEntryDate) {
        // No entries ever — check if topic was created 21+ days ago
        if (startDate <= twentyOneDaysAgoStr) {
          shouldNotify = true;
          daysInactive = Math.floor((now.getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
        }
      } else {
        // Has entries — check if last entry was 21+ days ago
        const lastEntry = new Date(lastEntryDate);
        daysInactive = Math.floor((now.getTime() - lastEntry.getTime()) / (1000 * 60 * 60 * 24));
        if (daysInactive >= 21) {
          shouldNotify = true;
        }
      }

      if (shouldNotify) {
        // Check if we already sent a notification for this topic recently (within last 7 days)
        const recentNotif = await db.notification.findFirst({
          where: {
            userId: topic.userId,
            type: 'topic_switch_recommendation',
            data: { contains: topic.id },
            createdAt: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
          },
        });

        if (!recentNotif) {
          await db.notification.create({
            data: {
              userId: topic.userId,
              type: 'topic_switch_recommendation',
              title: 'Topic Switch Recommended',
              message: `No progress on "${topic.name}" for ${daysInactive} days. Consider switching to a fresh topic to keep learning!`,
              data: JSON.stringify({ topicId: topic.id, reason: !lastEntryDate ? 'no_entries' : 'inactive', daysInactive }),
            },
          });
          notificationsSent++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      mode: isCronCall ? 'cron' : 'client',
      topicsChecked: topics.length,
      notificationsSent,
      checkedAt: now.toISOString(),
    });
  } catch (error) {
    console.error('Learning inactivity check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
