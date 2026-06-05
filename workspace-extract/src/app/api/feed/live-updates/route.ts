import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

/**
 * GET /api/feed/live-updates
 *
 * Fetches live content, fitness & learning updates from users.
 *
 * Visibility rules:
 *  - Own data: included only if share setting is ON
 *  - Public profiles: included if their respective share setting is ON
 *  - Private profiles: included ONLY if the viewer follows them AND their share setting is ON
 *  - If share setting is OFF, data is NEVER visible to others
 *  - Private account: shared data is only visible to accepted followers
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const isGuest = !session?.user?.id;
    const myUserId = session?.user?.id || '';
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '30'), 50);
    const includeOwn = searchParams.get('includeOwn') !== 'false'; // default true

    // ── Get the viewer's accepted following list (for private profile visibility) ──
    const myFollowing = isGuest ? [] : await db.follow.findMany({
      where: { followerId: myUserId, status: 'accepted' },
      select: { followingId: true },
    });
    const followingIds = new Set(myFollowing.map(f => f.followingId));

    // ── Fetch all fitness profiles for goal lookup ──
    const fitnessProfiles = await db.fitnessProfile.findMany({
      select: { userId: true, goal: true, weight: true },
    });
    const goalMap = new Map(fitnessProfiles.map(fp => [fp.userId, fp.goal || 'maintain']));
    const currentWeightMap = new Map(fitnessProfiles.map(fp => [fp.userId, fp.weight]));

    // ── Helper: is this user's update visible to the viewer? ──
    // A user's update is visible if:
    //   - It's the viewer's own data, OR
    //   - The user is public AND has the relevant share setting ON, OR
    //   - The user is private AND the viewer follows them AND has the relevant share setting ON
    function isVisible(userId: string, isPublic: boolean, shareSetting: boolean): boolean {
      if (!isGuest && userId === myUserId && includeOwn) return shareSetting;
      if (!shareSetting) return false;
      if (isPublic) return true;
      // Private profile: only visible to followers (guests can't follow anyone)
      if (isGuest) return false;
      return followingIds.has(userId);
    }

    // ── Learning Updates (shared learning topics) ──
    // Need to check shareLearningProgress + isPublic/follower status
    const sharedTopics = await db.learningTopic.findMany({
      where: {
        isSharedCollection: true,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profile: { select: { name: true, avatarUrl: true, verified: true, isPublic: true, shareLearningProgress: true } },
          },
        },
        _count: { select: { entries: true } },
      },
      orderBy: { sharedAt: 'desc' },
      take: limit * 2, // fetch extra then filter
    }) as any[];

    const learningUpdates = sharedTopics
      .filter(t => {
        // Check profile-level share setting first
        if (!isVisible(t.userId, t.user.profile?.isPublic !== false, t.user.profile?.shareLearningProgress === true)) {
          return false;
        }
        // Also respect topic-level collectionVisibility if set
        const vis = (t as any).collectionVisibility;
        if (vis === 'private') return false; // topic explicitly private
        if (vis === 'followers') {
          // Only visible to followers (same as private profile logic)
          return t.userId === myUserId || followingIds.has(t.userId);
        }
        return true; // 'public' or not set
      })
      .slice(0, limit)
      .map(t => ({
        id: t.id,
        type: 'learning' as const,
        name: t.name,
        phase: t.phase,
        entryCount: t._count.entries,
        sharedAt: t.sharedAt,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        isOwn: !isGuest && t.userId === myUserId,
        user: {
          id: t.user.id,
          username: t.user.username,
          name: t.user.profile?.name || t.user.username,
          avatarUrl: t.user.profile?.avatarUrl,
          verified: t.user.profile?.verified || false,
        },
        hashtags: ['learning', t.phase || 'study'],
      }));

    // ── Content Updates ──
    // Need to check shareContentStatus + isPublic/follower status
    // Only show entries that have progressed past "not_started" to avoid cluttering the feed
    const contentEntries = await db.contentEntry.findMany({
      where: {
        liveStatus: { not: 'not_started' },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profile: { select: { name: true, avatarUrl: true, verified: true, isPublic: true, shareContentStatus: true } },
          },
        },
        series: { select: { name: true, category: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: limit * 2,
    });

    const contentUpdates = contentEntries
      .filter(e => isVisible(e.userId, e.user.profile?.isPublic !== false, e.user.profile?.shareContentStatus === true))
      .slice(0, limit)
      .map(e => ({
        id: e.id,
        type: 'content' as const,
        title: e.title,
        contentType: e.contentType,
        liveStatus: e.liveStatus,
        status: e.status,
        platform: e.platform,
        updatedAt: e.updatedAt,
        createdAt: e.createdAt,
        seriesName: e.series?.name || null,
        seriesCategory: e.series?.category || null,
        isOwn: !isGuest && e.userId === myUserId,
        user: {
          id: e.user.id,
          username: e.user.username,
          name: e.user.profile?.name || e.user.username,
          avatarUrl: e.user.profile?.avatarUrl,
          verified: e.user.profile?.verified || false,
        },
        hashtags: ['content', 'progress'],
      }));

    // ── Fitness Updates (Workouts) ──
    // Need to check shareFitnessProgress + isPublic/follower status
    const recentWorkouts = await db.fitnessWorkoutLog.findMany({
      where: {
        createdAt: { gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profile: { select: { name: true, avatarUrl: true, verified: true, isPublic: true, shareFitnessProgress: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit * 2,
    });

    const fitnessUpdates = recentWorkouts
      .filter(w => isVisible(w.userId, w.user.profile?.isPublic !== false, w.user.profile?.shareFitnessProgress === true))
      .slice(0, limit)
      .map(w => {
        const goal = goalMap.get(w.userId) || 'maintain';
        const isGaining = goal === 'gain';
        return {
          id: w.id,
          type: 'fitness' as const,
          subType: 'workout' as const,
          workoutType: w.workoutType,
          duration: w.duration,
          estimatedCalories: w.estimatedCalories,
          muscleGroup: w.muscleGroup,
          sets: w.sets,
          reps: w.reps,
          loadKg: w.loadKg,
          date: w.date,
          createdAt: w.createdAt,
          isOwn: !isGuest && w.userId === myUserId,
          user: {
            id: w.user.id,
            username: w.user.username,
            name: (w.user as any).profile?.name || w.user.username,
            avatarUrl: (w.user as any).profile?.avatarUrl,
            verified: (w.user as any).profile?.verified || false,
            fitnessGoal: goal,
          },
          hashtags: ['fitness', isGaining ? 'gains' : 'shredding'],
        };
      });

    // ── Weight Updates ──
    const recentWeightLogs = await db.fitnessWeightLog.findMany({
      where: {
        createdAt: { gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profile: { select: { name: true, avatarUrl: true, verified: true, isPublic: true, shareFitnessProgress: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit * 2,
    });

    // Filter by visibility
    const visibleWeightLogs = recentWeightLogs
      .filter(w => isVisible(w.userId, w.user.profile?.isPublic !== false, w.user.profile?.shareFitnessProgress === true));

    // ── Weight trend sparkline data per user ──
    const weightUserIds = [...new Set(visibleWeightLogs.map(w => w.userId))];
    const weightTrendMap = new Map<string, { date: string; weight: number }[]>();

    if (weightUserIds.length > 0) {
      const trendData = await db.fitnessWeightLog.findMany({
        where: {
          userId: { in: weightUserIds },
        },
        select: { userId: true, date: true, weight: true },
        orderBy: { date: 'asc' },
      });

      const byUser: Record<string, { date: string; weight: number }[]> = {};
      trendData.forEach(t => {
        if (!byUser[t.userId]) byUser[t.userId] = [];
        byUser[t.userId].push({ date: t.date, weight: t.weight });
      });
      Object.entries(byUser).forEach(([uid, entries]) => {
        weightTrendMap.set(uid, entries.slice(-7));
      });
    }

    const weightUpdates = visibleWeightLogs.slice(0, limit).map(w => {
      const goal = goalMap.get(w.userId) || 'maintain';
      const isGaining = goal === 'gain';
      const trend = weightTrendMap.get(w.userId) || [];

      let trendDirection: 'up' | 'down' | 'stable' | 'none' = 'none';
      if (trend.length >= 2) {
        const diff = trend[trend.length - 1].weight - trend[0].weight;
        if (diff > 0.3) trendDirection = 'up';
        else if (diff < -0.3) trendDirection = 'down';
        else trendDirection = 'stable';
      }

      const currentWeight = currentWeightMap.get(w.userId) || null;

      return {
        id: w.id,
        type: 'fitness' as const,
        subType: 'weight' as const,
        weight: w.weight,
        date: w.date,
        createdAt: w.createdAt,
        isOwn: !isGuest && w.userId === myUserId,
        trendData: trend,
        trendDirection,
        currentWeight,
        user: {
          id: w.user.id,
          username: w.user.username,
          name: (w.user as any).profile?.name || w.user.username,
          avatarUrl: (w.user as any).profile?.avatarUrl,
          verified: (w.user as any).profile?.verified || false,
          fitnessGoal: goal,
        },
        hashtags: ['fitness', isGaining ? 'gains' : 'shredding'],
      };
    });

    const response = NextResponse.json({
      learningUpdates,
      contentUpdates,
      fitnessUpdates,
      weightUpdates,
    });
    // Ensure no caching so toggle changes are reflected immediately
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  } catch (error) {
    console.error('Live updates GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch live updates' }, { status: 500 });
  }
}
