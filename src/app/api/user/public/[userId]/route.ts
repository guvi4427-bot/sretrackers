import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    // Check if requester is admin
    const session = await getServerSession(authOptions);
    const isAdmin = !!(session?.user && (session.user as any).isAdmin);

    // Handle followers/following list requests
    if (type === 'followers') {
      const followers = await db.follow.findMany({
        where: { followingId: userId, status: 'accepted' },
        include: { follower: { select: { id: true, username: true, profile: { select: { name: true, avatarUrl: true, verified: true } } } } },
      });
      return NextResponse.json({
        followers: followers.map((f) => ({
          id: f.follower.id,
          username: f.follower.username,
          name: f.follower.profile?.name || f.follower.username,
          avatarUrl: f.follower.profile?.avatarUrl,
          verified: f.follower.profile?.verified || false,
        })),
      });
    }

    if (type === 'following') {
      const following = await db.follow.findMany({
        where: { followerId: userId, status: 'accepted' },
        include: { following: { select: { id: true, username: true, profile: { select: { name: true, avatarUrl: true, verified: true } } } } },
      });
      return NextResponse.json({
        following: following.map((f) => ({
          id: f.following.id,
          username: f.following.username,
          name: f.following.profile?.name || f.following.username,
          avatarUrl: f.following.profile?.avatarUrl,
          verified: f.following.profile?.verified || false,
        })),
      });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        achievements: {
          include: { achievement: true },
          orderBy: { unlockedAt: 'desc' },
        },
        learningTopics: {
          select: { id: true, name: true, phase: true },
        },
      },
    });

    if (!user || !user.profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const followerCount = await db.follow.count({ where: { followingId: user.id, status: 'accepted' } });
    const followingCount = await db.follow.count({ where: { followerId: user.id, status: 'accepted' } });

    const isPublic = user.profile.isPublic;

    // For private profiles, only show limited data
    if (!isPublic) {
      const response = NextResponse.json({
        id: user.id,
        username: user.username,
        phone: isAdmin ? user.phone : undefined,
        profile: {
          name: user.profile.name,
          avatarUrl: user.profile.avatarUrl,
          bio: user.profile.bio,
          verified: user.profile.verified,
          isPublic: false,
          shareAchievements: user.profile.shareAchievements,
          shareLearningProgress: user.profile.shareLearningProgress,
          shareFitnessProgress: user.profile.shareFitnessProgress,
          shareContentStatus: user.profile.shareContentStatus,
        },
        followersCount: followerCount,
        followingCount: followingCount,
      });
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      return response;
    }

    // Public profile - return full data
    const response = NextResponse.json({
      id: user.id,
      username: user.username,
      phone: isAdmin ? user.phone : undefined,
      profile: {
        name: user.profile.name,
        username: user.username,
        avatarUrl: user.profile.avatarUrl,
        bio: user.profile.bio,
        xp: user.profile.xp,
        level: user.profile.level,
        currentStreak: user.profile.currentStreak,
        verified: user.profile.verified,
        activePhases: user.profile.activePhases,
        phaseActivityMap: user.profile.phaseActivityMap,
        isPublic: true,
        shareAchievements: user.profile.shareAchievements,
        shareLearningProgress: user.profile.shareLearningProgress,
        shareFitnessProgress: user.profile.shareFitnessProgress,
        shareContentStatus: user.profile.shareContentStatus,
      },
      achievements: user.profile.shareAchievements
        ? user.achievements.map((a) => ({
            id: a.id,
            achievement: {
              key: a.achievement.key,
              name: a.achievement.name,
              iconEmoji: a.achievement.iconEmoji,
              tier: a.achievement.tier,
              description: a.achievement.description,
            },
            unlockedAt: a.unlockedAt,
          }))
        : [],
      learningTopics: user.profile.shareAchievements
        ? user.learningTopics.map((t) => ({ id: t.id, name: t.name, phase: t.phase }))
        : [],
      followersCount: followerCount,
      followingCount: followingCount,
    });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    return response;
  } catch (error) {
    console.error('Public profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
