import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { safeJsonParse } from '@/lib/utils';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const isGuest = !session?.user?.id;
    const myUserId = session?.user?.id || '';

    // Get viewer's accepted following list for private profile visibility
    const myFollowing = isGuest ? [] : await db.follow.findMany({
      where: { followerId: myUserId, status: 'accepted' },
      select: { followingId: true },
    });
    const followingIds = new Set(myFollowing.map(f => f.followingId));

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'users';
    const q = (searchParams.get('q') || '').toLowerCase();

    if (type === 'posts') {
      const posts = await db.post.findMany({
        where: {
          ...(q ? { OR: [
            { content: { contains: q, mode: 'insensitive' } },
            { hashtags: { contains: q, mode: 'insensitive' } },
          ] } : {}),
        },
        take: 20, orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, username: true, profile: { select: { name: true, avatarUrl: true, verified: true } } } },
          _count: { select: { likes: true, comments: true, reposts: true } },
          ...(!isGuest ? { likes: { where: { userId: myUserId }, select: { id: true } } } : {}),
          ...(!isGuest ? { reposts: { where: { userId: myUserId }, select: { id: true } } } : {}),
        },
      });
      const formatted = posts.map(p => ({
        id: p.id, content: p.content, hashtags: safeJsonParse<string[]>(p.hashtags, []), createdAt: p.createdAt,
        user: { id: p.user.id, username: p.user.username, name: p.user.profile?.name || p.user.username, avatarUrl: p.user.profile?.avatarUrl, verified: p.user.profile?.verified || false },
        stats: { likes: p._count.likes, comments: p._count.comments, reposts: p._count.reposts },
        isLiked: !isGuest && (p as any).likes?.length > 0, isReposted: !isGuest && (p as any).reposts?.length > 0,
      }));
      return NextResponse.json({ posts: formatted });
    }

    if (type === 'users') {
      const profiles = await db.profile.findMany({
        where: {
          ...(!isGuest ? { userId: { not: myUserId } } : {}),
          ...(q ? { OR: [{ name: { contains: q, mode: 'insensitive' } }, { user: { username: { contains: q, mode: 'insensitive' } } }] } : {}),
          isPublic: true,
        },
        take: 20, orderBy: { xp: 'desc' },
        include: { user: { select: { id: true, username: true } } },
      });

      const follows = isGuest ? [] : await db.follow.findMany({ where: { followerId: myUserId }, select: { followingId: true, status: true } });
      const followMap = new Map(follows.map(f => [f.followingId, f.status]));

      const users = profiles.map(p => ({
        id: p.user.id, name: p.name || p.user.username, username: p.user.username, avatarUrl: p.avatarUrl,
        xp: p.xp, level: p.level, activePhases: safeJsonParse<string[]>(p.activePhases, []), verified: p.verified,
        isFollowing: !isGuest && followMap.get(p.user.id) === 'accepted', followRequestStatus: isGuest ? 'none' : (followMap.get(p.user.id) || 'none'), isPublic: p.isPublic,
      }));
      return NextResponse.json({ users });
    }

    if (type === 'groups') {
      const groups = await db.groupChat.findMany({
        where: { isPublic: true, ...(q ? { name: { contains: q, mode: 'insensitive' } } : {}) },
        take: 20, orderBy: { createdAt: 'desc' },
        include: { _count: { select: { members: true } } },
      });
      return NextResponse.json({ groups: groups.map(g => ({ id: g.id, name: g.name, description: g.description, memberCount: g._count.members, isPublic: g.isPublic })) });
    }

    if (type === 'topics') {
      const topics = await db.learningTopic.findMany({
        where: { isSharedCollection: true, ...(q ? { name: { contains: q, mode: 'insensitive' } } : {}) },
        take: 20, orderBy: { sharedAt: 'desc' },
        include: {
          _count: { select: { entries: true } },
          user: { select: { id: true, username: true, profile: { select: { name: true, avatarUrl: true, verified: true, isPublic: true, shareLearningProgress: true } } } },
        },
      });
      // Filter: only show topics from users who have shareLearningProgress ON
      // Private profiles: only show to followers
      const visibleTopics = topics.filter(t => {
        const isPublic = t.user.profile?.isPublic !== false;
        const shareLearning = t.user.profile?.shareLearningProgress === true;
        if (!shareLearning) return false;
        if (isPublic) return true;
        return followingIds.has(t.userId);
      });
      return NextResponse.json({ topics: visibleTopics.map(t => ({
        id: t.id, name: t.name, phase: t.phase, entryCount: t._count.entries,
        isSharedCollection: t.isSharedCollection, collectionVisibility: t.collectionVisibility,
        sharedAt: t.sharedAt,
        author: t.user ? { id: t.user.id, username: t.user.username, name: t.user.profile?.name || t.user.username, avatarUrl: t.user.profile?.avatarUrl, verified: t.user.profile?.verified || false } : null,
      })) });
    }

    // ── Live Updates search (content + fitness updates) ──
    if (type === 'liveupdates') {
      const cleanQ = q.replace(/^#/, ''); // strip leading #
      const matchTag = cleanQ ? cleanQ.toLowerCase() : null;

      // Fetch fitness profiles for goal lookup
      const fitnessProfiles = await db.fitnessProfile.findMany({
        select: { userId: true, goal: true, weight: true },
      });
      const goalMap = new Map(fitnessProfiles.map(fp => [fp.userId, fp.goal || 'maintain']));
      const currentWeightMap = new Map(fitnessProfiles.map(fp => [fp.userId, fp.weight]));

      // Helper: check visibility for a user's update
      function isVisible(userId: string, isPublic: boolean, shareSetting: boolean): boolean {
        if (!isGuest && userId === myUserId) return shareSetting;
        if (!shareSetting) return false;
        if (isPublic) return true;
        // Guests can't follow, so private profiles are invisible to them
        if (isGuest) return false;
        return followingIds.has(userId);
      }

      const results: any[] = [];

      // Learning updates — shared learning topics
      if (!matchTag || matchTag === 'learning' || matchTag === 'study') {
        const sharedTopics = await db.learningTopic.findMany({
          where: { isSharedCollection: true },
          include: {
            user: { select: { id: true, username: true, profile: { select: { name: true, avatarUrl: true, verified: true, isPublic: true, shareLearningProgress: true } } } },
            _count: { select: { entries: true } },
          },
          orderBy: { sharedAt: 'desc' },
          take: 30,
        });
        sharedTopics.filter(t => isVisible(t.userId, t.user.profile?.isPublic !== false, t.user.profile?.shareLearningProgress === true)).forEach(t => {
          results.push({
            id: t.id, type: 'learning_update', name: t.name, phase: t.phase, entryCount: t._count.entries,
            sharedAt: t.sharedAt, updatedAt: t.updatedAt, createdAt: t.createdAt, isOwn: !isGuest && t.userId === myUserId,
            user: { id: t.user.id, username: t.user.username, name: t.user.profile?.name || t.user.username, avatarUrl: t.user.profile?.avatarUrl, verified: t.user.profile?.verified || false },
            hashtags: ['learning', t.phase || 'study'],
          });
        });
      }

      // Content updates
      if (!matchTag || matchTag === 'content' || matchTag === 'progress') {
        const contentEntries = await db.contentEntry.findMany({
          include: {
            user: { select: { id: true, username: true, profile: { select: { name: true, avatarUrl: true, verified: true, isPublic: true, shareContentStatus: true } } } },
            series: { select: { name: true } },
          },
          orderBy: { updatedAt: 'desc' },
          take: 30,
        });
        contentEntries.filter(e => isVisible(e.userId, e.user.profile?.isPublic !== false, e.user.profile?.shareContentStatus === true)).forEach(e => {
          results.push({
            id: e.id, type: 'content_update', title: e.title, contentType: e.contentType, liveStatus: e.liveStatus,
            status: e.status, updatedAt: e.updatedAt, createdAt: e.createdAt, seriesName: e.series?.name || null, isOwn: !isGuest && e.userId === myUserId,
            user: { id: e.user.id, username: e.user.username, name: e.user.profile?.name || e.user.username, avatarUrl: e.user.profile?.avatarUrl, verified: e.user.profile?.verified || false },
            hashtags: ['content', 'progress'],
          });
        });
      }

      // Fitness updates
      if (!matchTag || matchTag === 'fitness' || matchTag === 'gains' || matchTag === 'shredding') {
        const workouts = await db.fitnessWorkoutLog.findMany({
          where: { createdAt: { gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) } },
          include: {
            user: { select: { id: true, username: true, profile: { select: { name: true, avatarUrl: true, verified: true, isPublic: true, shareFitnessProgress: true } } } },
          },
          orderBy: { createdAt: 'desc' },
          take: 30,
        });
        workouts.filter(w => isVisible(w.userId, w.user.profile?.isPublic !== false, w.user.profile?.shareFitnessProgress === true)).forEach(w => {
          const goal = goalMap.get(w.userId) || 'maintain';
          const isGaining = goal === 'gain';
          const tags = ['fitness', isGaining ? 'gains' : 'shredding'];
          if (matchTag && matchTag !== 'fitness' && !tags.includes(matchTag)) return;
          results.push({
            id: w.id, type: 'fitness_update', subType: 'workout', workoutType: w.workoutType, duration: w.duration,
            estimatedCalories: w.estimatedCalories, muscleGroup: w.muscleGroup, sets: w.sets, reps: w.reps, loadKg: w.loadKg,
            date: w.date, createdAt: w.createdAt, isOwn: !isGuest && w.userId === myUserId,
            user: { id: w.user.id, username: w.user.username, name: (w.user as any).profile?.name || w.user.username, avatarUrl: (w.user as any).profile?.avatarUrl, verified: (w.user as any).profile?.verified || false, fitnessGoal: goal },
            hashtags: tags,
          });
        });

        const weightLogs = await db.fitnessWeightLog.findMany({
          where: { createdAt: { gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) } },
          include: {
            user: { select: { id: true, username: true, profile: { select: { name: true, avatarUrl: true, verified: true, isPublic: true, shareFitnessProgress: true } } } },
          },
          orderBy: { createdAt: 'desc' },
          take: 30,
        });

        // Weight trend sparkline data per user
        const visibleWeightLogs = weightLogs.filter(w => isVisible(w.userId, w.user.profile?.isPublic !== false, w.user.profile?.shareFitnessProgress === true));
        const weightUserIds = [...new Set(visibleWeightLogs.map(w => w.userId))];
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

        visibleWeightLogs.forEach(w => {
          const goal = goalMap.get(w.userId) || 'maintain';
          const isGaining = goal === 'gain';
          const tags = ['fitness', isGaining ? 'gains' : 'shredding'];
          if (matchTag && matchTag !== 'fitness' && !tags.includes(matchTag)) return;

          const trend = weightTrendMap.get(w.userId) || [];
          let trendDirection: 'up' | 'down' | 'stable' | 'none' = 'none';
          if (trend.length >= 2) {
            const diff = trend[trend.length - 1].weight - trend[0].weight;
            if (diff > 0.3) trendDirection = 'up';
            else if (diff < -0.3) trendDirection = 'down';
            else trendDirection = 'stable';
          }

          const currentWeight = currentWeightMap.get(w.userId) || null;
          results.push({
            id: w.id, type: 'fitness_update', subType: 'weight', weight: w.weight, date: w.date,
            createdAt: w.createdAt, isOwn: !isGuest && w.userId === myUserId, trendData: trend, trendDirection, currentWeight,
            user: { id: w.user.id, username: w.user.username, name: (w.user as any).profile?.name || w.user.username, avatarUrl: (w.user as any).profile?.avatarUrl, verified: (w.user as any).profile?.verified || false, fitnessGoal: goal },
            hashtags: tags,
          });
        });
      }

      // Sort all results by time
      results.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());

      return NextResponse.json({ liveupdates: results });
    }

    return NextResponse.json({ users: [], groups: [], topics: [] });
  } catch (error) {
    console.error('Discover error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
