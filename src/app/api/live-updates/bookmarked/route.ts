import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

/**
 * GET /api/live-updates/bookmarked
 *
 * Fetches all live updates bookmarked by the authenticated user.
 * Covers: content_entry, fitness_workout, fitness_weight, learning_topic
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const myUserId = session.user.id;

    // Fetch all bookmarked live update IDs for this user, grouped by type
    const bookmarks = await db.liveUpdateBookmark.findMany({
      where: { userId: myUserId },
      orderBy: { createdAt: 'desc' },
    });

    if (bookmarks.length === 0) {
      return NextResponse.json({ updates: [] });
    }

    // Group by entity type
    const byType: Record<string, string[]> = {};
    for (const b of bookmarks) {
      if (!byType[b.entityType]) byType[b.entityType] = [];
      byType[b.entityType].push(b.entityId);
    }

    // Fetch fitness profiles for goal lookup
    const fitnessProfiles = await db.fitnessProfile.findMany({
      select: { userId: true, goal: true, weight: true },
    });
    const goalMap = new Map(fitnessProfiles.map(fp => [fp.userId, fp.goal || 'maintain']));
    const currentWeightMap = new Map(fitnessProfiles.map(fp => [fp.userId, fp.weight]));

    const updates: any[] = [];

    // ── Content Entries ──
    if (byType['content_entry']?.length) {
      const entries = await db.contentEntry.findMany({
        where: { id: { in: byType['content_entry'] } },
        include: {
          user: {
            select: { id: true, username: true, profile: { select: { name: true, avatarUrl: true, verified: true } } },
          },
          series: { select: { name: true, category: true } },
        },
      });

      // Batch interaction counts
      const ids = entries.map(e => e.id);
      const [likes, reposts, likeUser, repostUser] = await Promise.all([
        db.liveUpdateLike.groupBy({ by: ['entityId'], where: { entityType: 'content_entry', entityId: { in: ids } }, _count: true }),
        db.liveUpdateRepost.groupBy({ by: ['entityId'], where: { entityType: 'content_entry', entityId: { in: ids } }, _count: true }),
        db.liveUpdateLike.findMany({ where: { entityType: 'content_entry', entityId: { in: ids }, userId: myUserId }, select: { entityId: true } }),
        db.liveUpdateRepost.findMany({ where: { entityType: 'content_entry', entityId: { in: ids }, userId: myUserId }, select: { entityId: true } }),
      ]);
      const likeMap = new Map(likes.map(l => [l.entityId, l._count]));
      const repostMap = new Map(reposts.map(r => [r.entityId, r._count]));
      const userLikeSet = new Set(likeUser.map(l => l.entityId));
      const userRepostSet = new Set(repostUser.map(r => r.entityId));

      for (const e of entries) {
        const bookmarkEntry = bookmarks.find(b => b.entityType === 'content_entry' && b.entityId === e.id);
        updates.push({
          id: e.id,
          type: 'content',
          entityType: 'content_entry',
          title: e.title,
          contentType: e.contentType,
          liveStatus: e.liveStatus,
          status: e.status,
          platform: e.platform,
          createdAt: e.createdAt,
          updatedAt: e.updatedAt,
          bookmarkedAt: bookmarkEntry?.createdAt || e.createdAt,
          seriesName: e.series?.name || null,
          seriesCategory: e.series?.category || null,
          isOwn: e.userId === myUserId,
          user: {
            id: e.user.id,
            username: e.user.username,
            name: e.user.profile?.name || e.user.username,
            avatarUrl: e.user.profile?.avatarUrl,
            verified: e.user.profile?.verified || false,
          },
          hashtags: ['content', 'progress'],
          likes: likeMap.get(e.id) || 0,
          reposts: repostMap.get(e.id) || 0,
          comments: 0,
          isLiked: userLikeSet.has(e.id),
          isReposted: userRepostSet.has(e.id),
          isBookmarked: true,
        });
      }
    }

    // ── Fitness Workouts ──
    if (byType['fitness_workout']?.length) {
      const workouts = await db.fitnessWorkoutLog.findMany({
        where: { id: { in: byType['fitness_workout'] } },
        include: {
          user: {
            select: { id: true, username: true, profile: { select: { name: true, avatarUrl: true, verified: true } } },
          },
        },
      });

      const ids = workouts.map(w => w.id);
      const [likes, reposts, likeUser, repostUser] = await Promise.all([
        db.liveUpdateLike.groupBy({ by: ['entityId'], where: { entityType: 'fitness_workout', entityId: { in: ids } }, _count: true }),
        db.liveUpdateRepost.groupBy({ by: ['entityId'], where: { entityType: 'fitness_workout', entityId: { in: ids } }, _count: true }),
        db.liveUpdateLike.findMany({ where: { entityType: 'fitness_workout', entityId: { in: ids }, userId: myUserId }, select: { entityId: true } }),
        db.liveUpdateRepost.findMany({ where: { entityType: 'fitness_workout', entityId: { in: ids }, userId: myUserId }, select: { entityId: true } }),
      ]);
      const likeMap = new Map(likes.map(l => [l.entityId, l._count]));
      const repostMap = new Map(reposts.map(r => [r.entityId, r._count]));
      const userLikeSet = new Set(likeUser.map(l => l.entityId));
      const userRepostSet = new Set(repostUser.map(r => r.entityId));

      for (const w of workouts) {
        const goal = goalMap.get(w.userId) || 'maintain';
        const isGaining = goal === 'gain';
        const bookmarkEntry = bookmarks.find(b => b.entityType === 'fitness_workout' && b.entityId === w.id);
        updates.push({
          id: w.id,
          type: 'fitness',
          subType: 'workout',
          entityType: 'fitness_workout',
          workoutType: w.workoutType,
          duration: w.duration,
          estimatedCalories: w.estimatedCalories,
          muscleGroup: w.muscleGroup,
          sets: w.sets,
          reps: w.reps,
          loadKg: w.loadKg,
          date: w.date,
          createdAt: w.createdAt,
          bookmarkedAt: bookmarkEntry?.createdAt || w.createdAt,
          isOwn: w.userId === myUserId,
          user: {
            id: w.user.id,
            username: w.user.username,
            name: (w.user as any).profile?.name || w.user.username,
            avatarUrl: (w.user as any).profile?.avatarUrl,
            verified: (w.user as any).profile?.verified || false,
            fitnessGoal: goal,
          },
          hashtags: ['fitness', isGaining ? 'gains' : 'shredding'],
          likes: likeMap.get(w.id) || 0,
          reposts: repostMap.get(w.id) || 0,
          comments: 0,
          isLiked: userLikeSet.has(w.id),
          isReposted: userRepostSet.has(w.id),
          isBookmarked: true,
        });
      }
    }

    // ── Weight Logs ──
    if (byType['fitness_weight']?.length) {
      const weightLogs = await db.fitnessWeightLog.findMany({
        where: { id: { in: byType['fitness_weight'] } },
        include: {
          user: {
            select: { id: true, username: true, profile: { select: { name: true, avatarUrl: true, verified: true } } },
          },
        },
      });

      // Weight trend data
      const weightUserIds = [...new Set(weightLogs.map(w => w.userId))];
      const weightTrendMap = new Map<string, { date: string; weight: number }[]>();
      if (weightUserIds.length > 0) {
        const trendData = await db.fitnessWeightLog.findMany({
          where: { userId: { in: weightUserIds } },
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

      const ids = weightLogs.map(w => w.id);
      const [likes, reposts, likeUser, repostUser] = await Promise.all([
        db.liveUpdateLike.groupBy({ by: ['entityId'], where: { entityType: 'fitness_weight', entityId: { in: ids } }, _count: true }),
        db.liveUpdateRepost.groupBy({ by: ['entityId'], where: { entityType: 'fitness_weight', entityId: { in: ids } }, _count: true }),
        db.liveUpdateLike.findMany({ where: { entityType: 'fitness_weight', entityId: { in: ids }, userId: myUserId }, select: { entityId: true } }),
        db.liveUpdateRepost.findMany({ where: { entityType: 'fitness_weight', entityId: { in: ids }, userId: myUserId }, select: { entityId: true } }),
      ]);
      const likeMap = new Map(likes.map(l => [l.entityId, l._count]));
      const repostMap = new Map(reposts.map(r => [r.entityId, r._count]));
      const userLikeSet = new Set(likeUser.map(l => l.entityId));
      const userRepostSet = new Set(repostUser.map(r => r.entityId));

      for (const w of weightLogs) {
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
        const bookmarkEntry = bookmarks.find(b => b.entityType === 'fitness_weight' && b.entityId === w.id);
        updates.push({
          id: w.id,
          type: 'fitness',
          subType: 'weight',
          entityType: 'fitness_weight',
          weight: w.weight,
          date: w.date,
          createdAt: w.createdAt,
          bookmarkedAt: bookmarkEntry?.createdAt || w.createdAt,
          trendData: trend,
          trendDirection,
          currentWeight: currentWeightMap.get(w.userId) || null,
          isOwn: w.userId === myUserId,
          user: {
            id: w.user.id,
            username: w.user.username,
            name: (w.user as any).profile?.name || w.user.username,
            avatarUrl: (w.user as any).profile?.avatarUrl,
            verified: (w.user as any).profile?.verified || false,
            fitnessGoal: goal,
          },
          hashtags: ['fitness', isGaining ? 'gains' : 'shredding'],
          likes: likeMap.get(w.id) || 0,
          reposts: repostMap.get(w.id) || 0,
          comments: 0,
          isLiked: userLikeSet.has(w.id),
          isReposted: userRepostSet.has(w.id),
          isBookmarked: true,
        });
      }
    }

    // ── Learning Topics ──
    if (byType['learning_topic']?.length) {
      const topics = await db.learningTopic.findMany({
        where: { id: { in: byType['learning_topic'] } },
        include: {
          user: {
            select: { id: true, username: true, profile: { select: { name: true, avatarUrl: true, verified: true } } },
          },
          _count: { select: { entries: true } },
        },
      });

      const ids = topics.map(t => t.id);
      const [likes, reposts, likeUser, repostUser] = await Promise.all([
        db.liveUpdateLike.groupBy({ by: ['entityId'], where: { entityType: 'learning_topic', entityId: { in: ids } }, _count: true }),
        db.liveUpdateRepost.groupBy({ by: ['entityId'], where: { entityType: 'learning_topic', entityId: { in: ids } }, _count: true }),
        db.liveUpdateLike.findMany({ where: { entityType: 'learning_topic', entityId: { in: ids }, userId: myUserId }, select: { entityId: true } }),
        db.liveUpdateRepost.findMany({ where: { entityType: 'learning_topic', entityId: { in: ids }, userId: myUserId }, select: { entityId: true } }),
      ]);
      const likeMap = new Map(likes.map(l => [l.entityId, l._count]));
      const repostMap = new Map(reposts.map(r => [r.entityId, r._count]));
      const userLikeSet = new Set(likeUser.map(l => l.entityId));
      const userRepostSet = new Set(repostUser.map(r => r.entityId));

      for (const t of topics) {
        const bookmarkEntry = bookmarks.find(b => b.entityType === 'learning_topic' && b.entityId === t.id);
        updates.push({
          id: t.id,
          type: 'learning',
          entityType: 'learning_topic',
          name: t.name,
          phase: t.phase,
          entryCount: t._count.entries,
          sharedAt: t.sharedAt,
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
          bookmarkedAt: bookmarkEntry?.createdAt || t.createdAt,
          isOwn: t.userId === myUserId,
          user: {
            id: t.user.id,
            username: t.user.username,
            name: t.user.profile?.name || t.user.username,
            avatarUrl: t.user.profile?.avatarUrl,
            verified: t.user.profile?.verified || false,
          },
          hashtags: ['learning', t.phase || 'study'],
          likes: likeMap.get(t.id) || 0,
          reposts: repostMap.get(t.id) || 0,
          comments: 0,
          isLiked: userLikeSet.has(t.id),
          isReposted: userRepostSet.has(t.id),
          isBookmarked: true,
        });
      }
    }

    // Sort by most recently bookmarked
    updates.sort((a, b) => new Date(b.bookmarkedAt).getTime() - new Date(a.bookmarkedAt).getTime());

    const response = NextResponse.json({ updates });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  } catch (error) {
    console.error('GET /api/live-updates/bookmarked error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
