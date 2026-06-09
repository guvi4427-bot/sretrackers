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
      .slice(0, limit);

    // Batch-fetch like/repost counts for learning topics
    const learningIds = learningUpdates.map(t => t.id);
    const learningLikes = !isGuest && learningIds.length > 0 ? await db.liveUpdateLike.groupBy({ by: ['entityId'], where: { entityType: 'learning_topic', entityId: { in: learningIds } }, _count: true }) : [];
    const learningReposts = !isGuest && learningIds.length > 0 ? await db.liveUpdateRepost.groupBy({ by: ['entityId'], where: { entityType: 'learning_topic', entityId: { in: learningIds } }, _count: true }) : [];
    const learningUserLikes = !isGuest && learningIds.length > 0 ? await db.liveUpdateLike.findMany({ where: { entityType: 'learning_topic', entityId: { in: learningIds }, userId: myUserId }, select: { entityId: true } }) : [];
    const learningUserReposts = !isGuest && learningIds.length > 0 ? await db.liveUpdateRepost.findMany({ where: { entityType: 'learning_topic', entityId: { in: learningIds }, userId: myUserId }, select: { entityId: true } }) : [];
    const learningBookmarks = !isGuest && learningIds.length > 0 ? await db.liveUpdateBookmark.groupBy({ by: ['entityId'], where: { entityType: 'learning_topic', entityId: { in: learningIds } }, _count: true }) : [];
    const learningUserBookmarks = !isGuest && learningIds.length > 0 ? await db.liveUpdateBookmark.findMany({ where: { entityType: 'learning_topic', entityId: { in: learningIds }, userId: myUserId }, select: { entityId: true } }) : [];
    const learningComments = learningIds.length > 0 ? await db.liveUpdateComment.groupBy({ by: ['entityId'], where: { entityType: 'learning_topic', entityId: { in: learningIds } }, _count: true }) : [];
    const learningCommentCountMap = new Map(learningComments.map(c => [c.entityId, c._count]));
    const learningLikeCountMap = new Map(learningLikes.map(l => [l.entityId, l._count]));
    const learningRepostCountMap = new Map(learningReposts.map(r => [r.entityId, r._count]));
    const learningBookmarkCountMap = new Map(learningBookmarks.map(b => [b.entityId, b._count]));
    const learningUserLikeSet = new Set(learningUserLikes.map(l => l.entityId));
    const learningUserRepostSet = new Set(learningUserReposts.map(r => r.entityId));
    const learningUserBookmarkSet = new Set(learningUserBookmarks.map(b => b.entityId));

    const learningUpdatesFormatted = learningUpdates.map(t => ({
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
      likes: learningLikeCountMap.get(t.id) || 0,
      reposts: learningRepostCountMap.get(t.id) || 0,
      bookmarks: learningBookmarkCountMap.get(t.id) || 0,
      comments: learningCommentCountMap.get(t.id) || 0,
      isLiked: learningUserLikeSet.has(t.id),
      isReposted: learningUserRepostSet.has(t.id),
      isBookmarked: learningUserBookmarkSet.has(t.id),
      entityType: 'learning_topic' as const,
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

    const contentUpdatesFiltered = contentEntries
      .filter(e => isVisible(e.userId, e.user.profile?.isPublic !== false, e.user.profile?.shareContentStatus === true))
      .slice(0, limit);

    // Batch-fetch like/repost counts for content entries
    const contentIds = contentUpdatesFiltered.map(e => e.id);
    const contentLikes = !isGuest && contentIds.length > 0 ? await db.liveUpdateLike.groupBy({ by: ['entityId'], where: { entityType: 'content_entry', entityId: { in: contentIds } }, _count: true }) : [];
    const contentReposts = !isGuest && contentIds.length > 0 ? await db.liveUpdateRepost.groupBy({ by: ['entityId'], where: { entityType: 'content_entry', entityId: { in: contentIds } }, _count: true }) : [];
    const contentUserLikes = !isGuest && contentIds.length > 0 ? await db.liveUpdateLike.findMany({ where: { entityType: 'content_entry', entityId: { in: contentIds }, userId: myUserId }, select: { entityId: true } }) : [];
    const contentUserReposts = !isGuest && contentIds.length > 0 ? await db.liveUpdateRepost.findMany({ where: { entityType: 'content_entry', entityId: { in: contentIds }, userId: myUserId }, select: { entityId: true } }) : [];
    const contentBookmarks = !isGuest && contentIds.length > 0 ? await db.liveUpdateBookmark.groupBy({ by: ['entityId'], where: { entityType: 'content_entry', entityId: { in: contentIds } }, _count: true }) : [];
    const contentUserBookmarks = !isGuest && contentIds.length > 0 ? await db.liveUpdateBookmark.findMany({ where: { entityType: 'content_entry', entityId: { in: contentIds }, userId: myUserId }, select: { entityId: true } }) : [];
    const contentComments = contentIds.length > 0 ? await db.liveUpdateComment.groupBy({ by: ['entityId'], where: { entityType: 'content_entry', entityId: { in: contentIds } }, _count: true }) : [];
    const contentCommentCountMap = new Map(contentComments.map(c => [c.entityId, c._count]));
    const contentLikeCountMap = new Map(contentLikes.map(l => [l.entityId, l._count]));
    const contentRepostCountMap = new Map(contentReposts.map(r => [r.entityId, r._count]));
    const contentBookmarkCountMap = new Map(contentBookmarks.map(b => [b.entityId, b._count]));
    const contentUserLikeSet = new Set(contentUserLikes.map(l => l.entityId));
    const contentUserRepostSet = new Set(contentUserReposts.map(r => r.entityId));
    const contentUserBookmarkSet = new Set(contentUserBookmarks.map(b => b.entityId));

    const contentUpdates = contentUpdatesFiltered.map(e => ({
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
      likes: contentLikeCountMap.get(e.id) || 0,
      reposts: contentRepostCountMap.get(e.id) || 0,
      bookmarks: contentBookmarkCountMap.get(e.id) || 0,
      comments: contentCommentCountMap.get(e.id) || 0,
      isLiked: contentUserLikeSet.has(e.id),
      isReposted: contentUserRepostSet.has(e.id),
      isBookmarked: contentUserBookmarkSet.has(e.id),
      entityType: 'content_entry' as const,
    }));

    // ── Fitness Updates (Workouts — aggregated by userId + date) ──
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
      take: limit * 4, // Fetch more since we'll aggregate
    });

    const fitnessUpdatesFiltered = recentWorkouts
      .filter(w => isVisible(w.userId, w.user.profile?.isPublic !== false, w.user.profile?.shareFitnessProgress === true));

    // Aggregate workouts by userId + date → one daily summary per user per day
    const workoutAggregation = new Map<string, {
      userId: string;
      date: string;
      workoutIds: string[];
      workoutTypes: string[];
      totalDuration: number;
      totalCalories: number;
      muscleGroups: string[];
      user: any;
    }>();

    fitnessUpdatesFiltered.forEach(w => {
      const key = `${w.userId}_${w.date}`;
      if (!workoutAggregation.has(key)) {
        workoutAggregation.set(key, {
          userId: w.userId,
          date: w.date,
          workoutIds: [w.id],
          workoutTypes: [w.workoutType],
          totalDuration: w.duration || 0,
          totalCalories: w.estimatedCalories || 0,
          muscleGroups: w.muscleGroup ? [w.muscleGroup] : [],
          user: w.user,
        });
      } else {
        const agg = workoutAggregation.get(key)!;
        agg.workoutIds.push(w.id);
        agg.workoutTypes.push(w.workoutType);
        agg.totalDuration += w.duration || 0;
        agg.totalCalories += w.estimatedCalories || 0;
        if (w.muscleGroup && !agg.muscleGroups.includes(w.muscleGroup)) {
          agg.muscleGroups.push(w.muscleGroup);
        }
      }
    });

    // Take top N aggregated summaries (sorted by date desc, then createdAt)
    const aggregatedWorkouts = Array.from(workoutAggregation.values())
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, limit);

    // Batch-fetch like/repost counts for ALL workout IDs in the aggregated summaries
    const allWorkoutIds = aggregatedWorkouts.flatMap(a => a.workoutIds);
    const workoutLikes = !isGuest && allWorkoutIds.length > 0 ? await db.liveUpdateLike.groupBy({ by: ['entityId'], where: { entityType: 'fitness_workout', entityId: { in: allWorkoutIds } }, _count: true }) : [];
    const workoutReposts = !isGuest && allWorkoutIds.length > 0 ? await db.liveUpdateRepost.groupBy({ by: ['entityId'], where: { entityType: 'fitness_workout', entityId: { in: allWorkoutIds } }, _count: true }) : [];
    const workoutUserLikes = !isGuest && allWorkoutIds.length > 0 ? await db.liveUpdateLike.findMany({ where: { entityType: 'fitness_workout', entityId: { in: allWorkoutIds }, userId: myUserId }, select: { entityId: true } }) : [];
    const workoutUserReposts = !isGuest && allWorkoutIds.length > 0 ? await db.liveUpdateRepost.findMany({ where: { entityType: 'fitness_workout', entityId: { in: allWorkoutIds }, userId: myUserId }, select: { entityId: true } }) : [];
    const workoutBookmarks = !isGuest && allWorkoutIds.length > 0 ? await db.liveUpdateBookmark.groupBy({ by: ['entityId'], where: { entityType: 'fitness_workout', entityId: { in: allWorkoutIds } }, _count: true }) : [];
    const workoutUserBookmarks = !isGuest && allWorkoutIds.length > 0 ? await db.liveUpdateBookmark.findMany({ where: { entityType: 'fitness_workout', entityId: { in: allWorkoutIds }, userId: myUserId }, select: { entityId: true } }) : [];
    const workoutComments = allWorkoutIds.length > 0 ? await db.liveUpdateComment.groupBy({ by: ['entityId'], where: { entityType: 'fitness_workout', entityId: { in: allWorkoutIds } }, _count: true }) : [];
    const workoutCommentCountMap = new Map(workoutComments.map(c => [c.entityId, c._count]));
    const workoutLikeCountMap = new Map(workoutLikes.map(l => [l.entityId, l._count]));
    const workoutRepostCountMap = new Map(workoutReposts.map(r => [r.entityId, r._count]));
    const workoutBookmarkCountMap = new Map(workoutBookmarks.map(b => [b.entityId, b._count]));
    const workoutUserLikeSet = new Set(workoutUserLikes.map(l => l.entityId));
    const workoutUserRepostSet = new Set(workoutUserReposts.map(r => r.entityId));
    const workoutUserBookmarkSet = new Set(workoutUserBookmarks.map(b => b.entityId));

    const fitnessUpdates = aggregatedWorkouts.map(agg => {
        const goal = goalMap.get(agg.userId) || 'maintain';
        const isGaining = goal === 'gain';
        // Aggregate likes/reposts/comments across all workouts in this day
        const totalLikes = agg.workoutIds.reduce((sum, id) => sum + (workoutLikeCountMap.get(id)?._count || workoutLikeCountMap.get(id) || 0), 0);
        const totalReposts = agg.workoutIds.reduce((sum, id) => sum + (workoutRepostCountMap.get(id)?._count || workoutRepostCountMap.get(id) || 0), 0);
        const totalBookmarks = agg.workoutIds.reduce((sum, id) => sum + (workoutBookmarkCountMap.get(id)?._count || workoutBookmarkCountMap.get(id) || 0), 0);
        const totalComments = agg.workoutIds.reduce((sum, id) => sum + (workoutCommentCountMap.get(id)?._count || workoutCommentCountMap.get(id) || 0), 0);
        const isLiked = agg.workoutIds.some(id => workoutUserLikeSet.has(id));
        const isReposted = agg.workoutIds.some(id => workoutUserRepostSet.has(id));
        const isBookmarked = agg.workoutIds.some(id => workoutUserBookmarkSet.has(id));
        // Use the first workout ID as the primary entity ID for interactions
        const primaryId = agg.workoutIds[0];
        // Count unique workout types
        const uniqueTypes = [...new Set(agg.workoutTypes)];
        return {
          id: primaryId,
          workoutIds: agg.workoutIds,
          type: 'fitness' as const,
          subType: 'workout_summary' as const,
          workoutCount: agg.workoutIds.length,
          workoutTypes: uniqueTypes,
          totalDuration: agg.totalDuration,
          totalCalories: agg.totalCalories,
          muscleGroups: agg.muscleGroups,
          date: agg.date,
          createdAt: agg.date,
          isOwn: !isGuest && agg.userId === myUserId,
          user: {
            id: agg.user.id,
            username: agg.user.username,
            name: (agg.user as any).profile?.name || agg.user.username,
            avatarUrl: (agg.user as any).profile?.avatarUrl,
            verified: (agg.user as any).profile?.verified || false,
            fitnessGoal: goal,
          },
          hashtags: ['fitness', isGaining ? 'gains' : 'shredding'],
          likes: totalLikes,
          reposts: totalReposts,
          bookmarks: totalBookmarks,
          comments: totalComments,
          isLiked,
          isReposted,
          isBookmarked,
          entityType: 'fitness_workout' as const,
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

    // Deduplicate: only the latest weight log per user
    const latestWeightByUser = new Map<string, any>();
    visibleWeightLogs.forEach(w => {
      if (!latestWeightByUser.has(w.userId)) {
        latestWeightByUser.set(w.userId, w);
      }
      // visibleWeightLogs is already sorted by createdAt desc, so first entry is latest
    });
    const weightUpdates = Array.from(latestWeightByUser.values()).slice(0, limit);

    // Batch-fetch like/repost counts for weight entries
    const weightIds = weightUpdates.map(w => w.id);
    const weightLikes = !isGuest && weightIds.length > 0 ? await db.liveUpdateLike.groupBy({ by: ['entityId'], where: { entityType: 'fitness_weight', entityId: { in: weightIds } }, _count: true }) : [];
    const weightReposts = !isGuest && weightIds.length > 0 ? await db.liveUpdateRepost.groupBy({ by: ['entityId'], where: { entityType: 'fitness_weight', entityId: { in: weightIds } }, _count: true }) : [];
    const weightUserLikes = !isGuest && weightIds.length > 0 ? await db.liveUpdateLike.findMany({ where: { entityType: 'fitness_weight', entityId: { in: weightIds }, userId: myUserId }, select: { entityId: true } }) : [];
    const weightUserReposts = !isGuest && weightIds.length > 0 ? await db.liveUpdateRepost.findMany({ where: { entityType: 'fitness_weight', entityId: { in: weightIds }, userId: myUserId }, select: { entityId: true } }) : [];
    const weightBookmarks = !isGuest && weightIds.length > 0 ? await db.liveUpdateBookmark.groupBy({ by: ['entityId'], where: { entityType: 'fitness_weight', entityId: { in: weightIds } }, _count: true }) : [];
    const weightUserBookmarks = !isGuest && weightIds.length > 0 ? await db.liveUpdateBookmark.findMany({ where: { entityType: 'fitness_weight', entityId: { in: weightIds }, userId: myUserId }, select: { entityId: true } }) : [];
    const weightComments = weightIds.length > 0 ? await db.liveUpdateComment.groupBy({ by: ['entityId'], where: { entityType: 'fitness_weight', entityId: { in: weightIds } }, _count: true }) : [];
    const weightCommentCountMap = new Map(weightComments.map(c => [c.entityId, c._count]));
    const weightLikeCountMap = new Map(weightLikes.map(l => [l.entityId, l._count]));
    const weightRepostCountMap = new Map(weightReposts.map(r => [r.entityId, r._count]));
    const weightBookmarkCountMap = new Map(weightBookmarks.map(b => [b.entityId, b._count]));
    const weightUserLikeSet = new Set(weightUserLikes.map(l => l.entityId));
    const weightUserRepostSet = new Set(weightUserReposts.map(r => r.entityId));
    const weightUserBookmarkSet = new Set(weightUserBookmarks.map(b => b.entityId));

    const weightUpdatesFormatted = weightUpdates.map(w => {
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
        likes: weightLikeCountMap.get(w.id) || 0,
        reposts: weightRepostCountMap.get(w.id) || 0,
        bookmarks: weightBookmarkCountMap.get(w.id) || 0,
        comments: weightCommentCountMap.get(w.id) || 0,
        isLiked: weightUserLikeSet.has(w.id),
        isReposted: weightUserRepostSet.has(w.id),
        isBookmarked: weightUserBookmarkSet.has(w.id),
        entityType: 'fitness_weight' as const,
      };
    });

    const response = NextResponse.json({
      learningUpdates: learningUpdatesFormatted,
      contentUpdates,
      fitnessUpdates,
      weightUpdates: weightUpdatesFormatted,
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
