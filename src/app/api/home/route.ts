import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserId } from '@/lib/auth-helper';
import { PHASES, PHASE_ACTIVITY_MAP } from '@/lib/gamification';
import { safeJsonParse } from '@/lib/utils';

export async function GET() {
  try {
    const userId = await getUserId();
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];

    const user = await db.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    const profile = user?.profile;

    // Get or create today's quests
    let quests = await db.userQuest.findMany({
      where: { userId, date: today },
      orderBy: { createdAt: 'desc' },
    });

    if (quests.length === 0) {
      const questTemplates = [
        { title: 'Log your day', category: 'daily_log', xpReward: 10, isUniversal: true },
        { title: 'Log a learning entry', category: 'learning', xpReward: 10 },
        { title: 'Complete a workout', category: 'fitness', xpReward: 15 },
        { title: 'Stay focused for 25 minutes', category: 'time', xpReward: 20 },
        { title: 'Create content', category: 'content', xpReward: 10 },
      ];

      quests = await Promise.all(
        questTemplates.map((q) =>
          db.userQuest.create({
            data: {
              userId,
              title: q.title,
              category: q.category,
              xpReward: q.xpReward,
              description: q.isUniversal ? 'universal' : null,
              date: today,
            },
          })
        )
      );
    }

    // Recent activity (last 5 XP gains with type info)
    const recentXPGains = await db.xPGain.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const recentActivity = recentXPGains.map((g) => {
      const categoryMap: Record<string, string> = {
        learning: 'learning',
        fitness: 'workout',
        workout: 'workout',
        content: 'content',
        time: 'focus',
        social: 'social',
        quest: 'quest',
        meal: 'meal',
      };
      const type = categoryMap[g.category || ''] || g.category || 'general';
      const title = g.reason || `${g.category || 'Activity'} +${g.amount} XP`;
      const now = Date.now();
      const created = new Date(g.createdAt).getTime();
      const diffMs = now - created;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHrs = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      let timeAgo = '';
      if (diffMins < 1) timeAgo = 'just now';
      else if (diffMins < 60) timeAgo = `${diffMins}m ago`;
      else if (diffHrs < 24) timeAgo = `${diffHrs}h ago`;
      else if (diffDays < 30) timeAgo = `${diffDays}d ago`;
      else timeAgo = `${Math.floor(diffDays / 30)}mo ago`;
      return { id: g.id, type, title, timeAgo, amount: g.amount };
    });

    // Active phases
    const activePhasesRaw = safeJsonParse<string[]>(profile?.activePhases, []);
    const phaseActivityMap = safeJsonParse<Record<string, any>>(profile?.phaseActivityMap, {});

    const activePhases = activePhasesRaw
      .filter((key: string) => key in PHASES)
      .map((key: string) => {
        const phase = PHASES[key as keyof typeof PHASES];
        return {
          key,
          name: phase.name,
          color: phase.color,
          icon: phase.icon,
          description: phase.description,
          activities: phaseActivityMap[key]?.activities || PHASE_ACTIVITY_MAP[key] || [],
        };
      });

    // Quick stats
    const [learningEntries, workouts, focusSessions, meals] = await Promise.all([
      db.learningEntry.count({
        where: { userId, date: { gte: weekAgo } },
      }),
      db.fitnessWorkoutLog.count({
        where: { userId, date: { gte: weekAgo } },
      }),
      db.focusSession.aggregate({
        where: { userId, date: { gte: weekAgo } },
        _sum: { duration: true },
      }),
      db.fitnessFoodLog.count({
        where: { userId, date: { gte: weekAgo } },
      }),
    ]);

    const focusMinutes = focusSessions._sum.duration || 0;

    // Achievement count (unlocked by user)
    const achievementCount = await db.userAchievement.count({
      where: { userId },
    });

    // Leaderboard top 5
    const topProfiles = await db.profile.findMany({
      where: {
        user: { adminRole: null },
      },
      orderBy: { xp: 'desc' },
      take: 5,
      include: { user: { select: { id: true, username: true } } },
    });

    const leaderboard = topProfiles.map((p, i) => ({
      userId: p.user.id,
      name: p.name || p.user.username,
      username: p.user.username,
      avatarUrl: p.avatarUrl,
      xp: p.xp,
      level: p.level,
      rank: i + 1,
    }));

    // Streak info
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const isActiveToday = profile?.lastActiveDate === today;

    const response = NextResponse.json({
      profile: profile
        ? {
            name: profile.name,
            xp: profile.xp,
            level: profile.level,
            currentStreak: profile.currentStreak,
            longestStreak: profile.longestStreak,
            activePhases: activePhasesRaw,
            phaseActivityMap,
            lastActiveDate: profile.lastActiveDate,
          }
        : null,
      quests,
      recentActivity,
      activePhases,
      quickStats: { learningEntries, workouts, focusMinutes, meals },
      achievementCount,
      leaderboard,
      streakInfo: {
        currentStreak: profile?.currentStreak || 0,
        longestStreak: profile?.longestStreak || 0,
        isActiveToday,
        lastActiveDate: profile?.lastActiveDate || null,
      },
    });
    // Prevent browser/CDN caching so achievement count is always fresh
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    return response;
  } catch (error) {
    console.error('Home API error:', error);
    return NextResponse.json({ error: 'Failed to load dashboard' }, { status: 500 });
  }
}
