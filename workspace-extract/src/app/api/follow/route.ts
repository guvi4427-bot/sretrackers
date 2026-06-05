import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkAndNotifyEligibleAchievements } from '@/lib/achievements';
import { rejectGuest } from '@/lib/auth-helper';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'all';

    if (type === 'count') {
      const [followersCount, followingCount] = await Promise.all([
        db.follow.count({ where: { followingId: session.user.id, status: 'accepted' } }),
        db.follow.count({ where: { followerId: session.user.id, status: 'accepted' } }),
      ]);
      return NextResponse.json({ followersCount, followingCount });
    }

    if (type === 'requests') {
      const requests = await db.follow.findMany({
        where: { followingId: session.user.id, status: 'pending' },
        include: { follower: { select: { id: true, username: true, profile: { select: { name: true, avatarUrl: true, verified: true } } } } },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json(requests.map((r) => ({
        id: r.id,
        followerId: r.follower.id,
        follower: { id: r.follower.id, username: r.follower.username, ...r.follower.profile, verified: r.follower.profile?.verified },
        createdAt: r.createdAt,
      })));
    }

    if (type === 'sent-requests') {
      const sentRequests = await db.follow.findMany({
        where: { followerId: session.user.id, status: 'pending' },
        include: { following: { select: { id: true, username: true, profile: { select: { name: true, avatarUrl: true, verified: true } } } } },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json(sentRequests.map((r) => ({
        id: r.id,
        followingId: r.following.id,
        following: { id: r.following.id, username: r.following.username, ...r.following.profile, verified: r.following.profile?.verified },
        createdAt: r.createdAt,
      })));
    }

    if (type === 'followers') {
      const followers = await db.follow.findMany({
        where: { followingId: session.user.id, status: 'accepted' },
        include: { follower: { select: { id: true, username: true, profile: { select: { name: true, avatarUrl: true, verified: true } } } } },
      });
      return NextResponse.json(followers.map((f) => ({ id: f.follower.id, username: f.follower.username, ...f.follower.profile, verified: f.follower.profile?.verified })));
    }

    if (type === 'following') {
      const following = await db.follow.findMany({
        where: { followerId: session.user.id, status: 'accepted' },
        include: { following: { select: { id: true, username: true, profile: { select: { name: true, avatarUrl: true, verified: true } } } } },
      });
      return NextResponse.json(following.map((f) => ({ id: f.following.id, username: f.following.username, ...f.following.profile, verified: f.following.profile?.verified })));
    }

    const [followersCount, followingCount] = await Promise.all([
      db.follow.count({ where: { followingId: session.user.id, status: 'accepted' } }),
      db.follow.count({ where: { followerId: session.user.id, status: 'accepted' } }),
    ]);
    return NextResponse.json({ followersCount, followingCount });
  } catch (error) {
    console.error('Follow list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const guestRejected = rejectGuest(req); if (guestRejected) return guestRejected;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { userId } = await req.json();
    if (!userId || userId === session.user.id) return NextResponse.json({ error: 'Invalid target user' }, { status: 400 });

    const existing = await db.follow.findUnique({
      where: { followerId_followingId: { followerId: session.user.id, followingId: userId } },
    });

    if (existing) {
      if (existing.status === 'accepted') {
        await db.follow.delete({ where: { id: existing.id } });
        // Re-check follower-based achievements for both users after unfollow
        try { await checkAndNotifyEligibleAchievements(userId); } catch {}
        try { await checkAndNotifyEligibleAchievements(session.user.id); } catch {}
        // Return updated counts for both users
        const [targetFollowersCount, myFollowingCount] = await Promise.all([
          db.follow.count({ where: { followingId: userId, status: 'accepted' } }),
          db.follow.count({ where: { followerId: session.user.id, status: 'accepted' } }),
        ]);
        return NextResponse.json({ status: 'unfollowed', targetFollowersCount, myFollowingCount });
      }
      // Already pending - withdraw
      await db.follow.delete({ where: { id: existing.id } });
      return NextResponse.json({ status: 'withdrawn' });
    }

    // Check if target profile is public
    const targetProfile = await db.profile.findUnique({ where: { userId } });
    const isTargetPublic = targetProfile?.isPublic !== false; // default true

    const follow = await db.follow.create({
      data: {
        followerId: session.user.id,
        followingId: userId,
        status: isTargetPublic ? 'accepted' : 'pending',
      },
    });

    if (isTargetPublic) {
      await db.notification.create({
        data: { userId, type: 'follow', fromUserId: session.user.id, message: `${(await db.profile.findUnique({ where: { userId: session.user.id } }))?.name || 'Someone'} started following you`, data: JSON.stringify({ fromUserId: session.user.id }) },
      });
    } else {
      await db.notification.create({
        data: { userId, type: 'follow_request', fromUserId: session.user.id, message: `${(await db.profile.findUnique({ where: { userId: session.user.id } }))?.name || 'Someone'} sent you a follow request` },
      });
    }

    // Check auto-verification
    if (isTargetPublic) {
      await checkAutoVerification(userId);
    }

    // Check follower-based achievement eligibility for BOTH users
    // The target user's follower count changed, and the follower's following count changed
    try { await checkAndNotifyEligibleAchievements(userId); } catch {}
    try { await checkAndNotifyEligibleAchievements(session.user.id); } catch {}

    // Return updated counts for both users so client can update UI accurately
    const [targetFollowersCount, myFollowingCount] = await Promise.all([
      db.follow.count({ where: { followingId: userId, status: 'accepted' } }),
      db.follow.count({ where: { followerId: session.user.id, status: 'accepted' } }),
    ]);
    return NextResponse.json({ status: follow.status, follow, targetFollowersCount, myFollowingCount });
  } catch (error) {
    console.error('Follow error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { followerId, action } = await req.json();
    const follow = await db.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId: session.user.id } },
    });

    if (!follow) return NextResponse.json({ error: 'Follow request not found' }, { status: 404 });

    if (action === 'accept') {
      await db.follow.update({ where: { id: follow.id }, data: { status: 'accepted' } });
      await db.notification.create({
        data: { userId: followerId, type: 'follow_accepted', fromUserId: session.user.id, message: `${(await db.profile.findUnique({ where: { userId: session.user.id } }))?.name || 'Someone'} accepted your follow request`, data: JSON.stringify({ fromUserId: session.user.id }) },
      });
      // Check auto-verification for the follower
      await checkAutoVerification(followerId);
      // Re-check follower-based achievements for both users after accept
      try { await checkAndNotifyEligibleAchievements(followerId); } catch {}
      try { await checkAndNotifyEligibleAchievements(session.user.id); } catch {}
      return NextResponse.json({ status: 'accepted' });
    } else {
      await db.follow.delete({ where: { id: follow.id } });
      return NextResponse.json({ status: 'rejected' });
    }
  } catch (error) {
    console.error('Follow action error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    const follow = await db.follow.findUnique({
      where: { followerId_followingId: { followerId: session.user.id, followingId: userId } },
    });

    if (!follow) return NextResponse.json({ error: 'Follow request not found' }, { status: 404 });

    await db.follow.delete({ where: { id: follow.id } });
    return NextResponse.json({ status: 'withdrawn' });
  } catch (error) {
    console.error('Follow delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function checkAutoVerification(userId: string) {
  try {
    const profile = await db.profile.findUnique({ where: { userId } });
    if (!profile || profile.verified) return;

    if (profile.level >= 5) {
      const followerCount = await db.follow.count({ where: { followingId: userId, status: 'accepted' } });
      if (followerCount >= 1500) {
        await db.profile.update({ where: { userId }, data: { verified: true } });
      }
    }
  } catch {}
}
