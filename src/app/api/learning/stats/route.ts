import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserId } from '@/lib/auth-helper';

export async function GET() {
  try {
    const userId = await getUserId();
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];

    const [totalTopics, totalEntries, entriesThisWeek, recentEntries] = await Promise.all([
      db.learningTopic.count({ where: { userId } }),
      db.learningEntry.count({ where: { userId } }),
      db.learningEntry.count({ where: { userId, date: { gte: weekAgo } } }),
      db.learningEntry.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { topic: { select: { name: true } } },
      }),
    ]);

    // Calculate total study minutes
    const durationResult = await db.learningEntry.aggregate({
      where: { userId, duration: { not: null } },
      _sum: { duration: true },
    });

    const totalMinutes = durationResult._sum.duration || 0;
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

    // Calculate streak days for learning
    const allEntryDates = await db.learningEntry.findMany({
      where: { userId },
      select: { date: true },
      distinct: ['date'],
      orderBy: { date: 'desc' },
    });

    let streakDays = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (allEntryDates.length > 0) {
      let checkDate = allEntryDates[0].date;
      if (checkDate === today || checkDate === yesterday) {
        streakDays = 1;
        for (let i = 1; i < allEntryDates.length; i++) {
          const prevDate = new Date(checkDate);
          prevDate.setDate(prevDate.getDate() - 1);
          const prevDateStr = prevDate.toISOString().split('T')[0];
          if (allEntryDates[i].date === prevDateStr) {
            streakDays++;
            checkDate = prevDateStr;
          } else {
            break;
          }
        }
      }
    }

    // Weekly data for charts (last 7 days)
    const weeklyData: { day: string; date: string; minutes: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en', { weekday: 'short' });

      const dayEntries = await db.learningEntry.findMany({
        where: { userId, date: dateStr, duration: { not: null } },
        select: { duration: true },
      });

      const totalDayMinutes = dayEntries.reduce((sum, e) => sum + (e.duration || 0), 0);
      weeklyData.push({ day: dayName, date: dateStr, minutes: totalDayMinutes });
    }

    // Topic distribution for donut chart
    const topicsWithCount = await db.learningTopic.findMany({
      where: { userId },
      include: { _count: { select: { entries: true } } },
    });

    const topicDistribution = topicsWithCount.map((t) => ({
      name: t.name,
      entries: t._count.entries,
      phase: t.phase,
    }));

    return NextResponse.json({
      totalTopics,
      totalEntries,
      entriesThisWeek,
      totalStudyHours: totalHours,
      totalMinutes,
      streakDays,
      recentActivity: recentEntries,
      weeklyData,
      topicDistribution,
    });
  } catch (error) {
    console.error('Learning stats GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
