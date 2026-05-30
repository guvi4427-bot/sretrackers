import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = session.user.id;

    // Get all XP gains for calculations
    const allXpGains = await db.xPGain.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } });

    // XP Trend (last 30 days)
    const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentXpGains = allXpGains.filter(g => new Date(g.createdAt) >= thirtyDaysAgo);
    const xpByDate = new Map<string, number>();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      xpByDate.set(key, 0);
    }
    recentXpGains.forEach(g => {
      const key = new Date(g.createdAt).toISOString().split('T')[0];
      if (xpByDate.has(key)) xpByDate.set(key, (xpByDate.get(key) || 0) + g.amount);
    });
    const xpTrend = Array.from(xpByDate.entries()).map(([date, xp]) => ({ date: date.slice(5), xp }));

    // Activity counts
    const learningCount = await db.learningEntry.count({ where: { userId } });
    const fitnessCount = await db.fitnessWorkoutLog.count({ where: { userId } });
    const fitnessFoodCount = await db.fitnessFoodLog.count({ where: { userId } });
    const contentCount = await db.contentEntry.count({ where: { userId } });
    const focusCount = await db.focusSession.count({ where: { userId, completed: true } });
    const postCount = await db.post.count({ where: { userId } });

    const activityDistribution = [
      { name: 'Learning', value: learningCount },
      { name: 'Fitness', value: fitnessCount + fitnessFoodCount },
      { name: 'Content', value: contentCount },
      { name: 'Focus', value: focusCount },
      { name: 'Social', value: postCount },
    ].filter(d => d.value > 0);
    if (activityDistribution.length === 0) activityDistribution.push({ name: 'No Activity', value: 1 });

    // Module XP
    const learningXP = allXpGains.filter(g => g.category === 'learning').reduce((s, g) => s + g.amount, 0);
    const fitnessXP = allXpGains.filter(g => g.category === 'fitness').reduce((s, g) => s + g.amount, 0);
    const contentXP = allXpGains.filter(g => g.category === 'content').reduce((s, g) => s + g.amount, 0);
    const timeXP = allXpGains.filter(g => g.category === 'time').reduce((s, g) => s + g.amount, 0);
    const socialXP = allXpGains.filter(g => g.category === 'social').reduce((s, g) => s + g.amount, 0);

    const moduleComparison = [
      { module: 'Learn', entries: learningCount, xp: learningXP },
      { module: 'Fitness', entries: fitnessCount + fitnessFoodCount, xp: fitnessXP },
      { module: 'Content', entries: contentCount, xp: contentXP },
      { module: 'Time', entries: focusCount, xp: timeXP },
      { module: 'Social', entries: postCount, xp: socialXP },
    ];

    // Streak history
    const streakHistory = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (29 - i));
      return { date: d.toISOString().split('T')[0].slice(5), streak: 0 };
    });

    const profile = await db.profile.findUnique({ where: { userId } });
    const totalActivities = learningCount + fitnessCount + fitnessFoodCount + contentCount + focusCount + postCount;

    return NextResponse.json({
      xpTrend,
      activityDistribution,
      moduleComparison,
      streakHistory,
      summary: { totalXP: profile?.xp || 0, totalActivities, avgDailyXP: Math.round((profile?.xp || 0) / 30), bestStreak: profile?.longestStreak || 0 },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
