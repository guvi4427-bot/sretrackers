import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { awardXP, updateStreak } from '@/lib/xp';
import { safeJsonParse } from '@/lib/utils';
import { rejectGuest } from '@/lib/auth-helper';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const isGuest = !session?.user?.id;

    // Guest access: allow read-only browsing of public posts
    if (isGuest) {
      const { searchParams } = new URL(req.url);
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '50');
      const skip = (page - 1) * limit;

      const [posts, total] = await Promise.all([
        db.post.findMany({
          where: {},
          include: {
            user: {
              select: { id: true, username: true, profile: { select: { name: true, avatarUrl: true, verified: true } } },
            },
            _count: { select: { likes: true, comments: true, reposts: true, bookmarks: true } },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        db.post.count(),
      ]);

      const formatted = posts.map(p => ({
        id: p.id,
        content: p.content,
        images: safeJsonParse<string[]>(p.images, []),
        hashtags: safeJsonParse<string[]>(p.hashtags, []),
        createdAt: p.createdAt,
        user: {
          id: p.user.id,
          username: p.user.username,
          name: p.user.profile?.name || p.user.username,
          avatarUrl: p.user.profile?.avatarUrl,
          verified: p.user.profile?.verified || false,
        },
        stats: {
          likes: p._count.likes,
          comments: p._count.comments,
          reposts: p._count.reposts,
          bookmarks: p._count.bookmarks,
        },
        isLiked: false,
        isBookmarked: false,
        isReposted: false,
        isRepost: false,
      }));

      return NextResponse.json({
        posts: formatted,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    }

    // Authenticated user flow
    const myUserId = session.user.id;
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const filter = searchParams.get('filter') || 'all';
    const mine = searchParams.get('mine') === 'true';

    const skip = (page - 1) * limit;

    // ── "mine" mode: return user's own posts + reposts with isRepost flag ──
    if (mine) {
      const [myPosts, myReposts] = await Promise.all([
        db.post.findMany({
          where: { userId: myUserId },
          include: {
            user: { select: { id: true, username: true, profile: { select: { name: true, avatarUrl: true, verified: true } } } },
            _count: { select: { likes: true, comments: true, reposts: true, bookmarks: true } },
          },
          orderBy: { createdAt: 'desc' },
        }),
        db.repost.findMany({
          where: { userId: myUserId },
          include: {
            post: {
              include: {
                user: { select: { id: true, username: true, profile: { select: { name: true, avatarUrl: true, verified: true } } } },
                _count: { select: { likes: true, comments: true, reposts: true, bookmarks: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
      ]);

      const formatted = [
        ...myPosts.map(p => ({
          id: p.id,
          content: p.content,
          images: safeJsonParse<string[]>(p.images, []),
          hashtags: safeJsonParse<string[]>(p.hashtags, []),
          createdAt: p.createdAt,
          user: {
            id: p.user.id,
            username: p.user.username,
            name: p.user.profile?.name || p.user.username,
            avatarUrl: p.user.profile?.avatarUrl,
            verified: p.user.profile?.verified || false,
          },
          stats: {
            likes: p._count.likes,
            comments: p._count.comments,
            reposts: p._count.reposts,
            bookmarks: p._count.bookmarks,
          },
          isLiked: false,
          isBookmarked: false,
          isReposted: false,
          isRepost: false,
        })),
        ...myReposts.map(r => ({
          id: r.post.id,
          repostId: r.id,
          repostComment: r.comment,
          repostedAt: r.createdAt,
          content: r.post.content,
          images: safeJsonParse<string[]>(r.post.images, []),
          hashtags: safeJsonParse<string[]>(r.post.hashtags, []),
          createdAt: r.post.createdAt,
          user: {
            id: r.post.user.id,
            username: r.post.user.username,
            name: r.post.user.profile?.name || r.post.user.username,
            avatarUrl: r.post.user.profile?.avatarUrl,
            verified: r.post.user.profile?.verified || false,
          },
          stats: {
            likes: r.post._count.likes,
            comments: r.post._count.comments,
            reposts: r.post._count.reposts,
            bookmarks: r.post._count.bookmarks,
          },
          isLiked: false,
          isBookmarked: false,
          isReposted: true,
          isRepost: true,
        })),
      ];

      // Sort combined list by most recent activity
      formatted.sort((a, b) => {
        const dateA = (a as any).repostedAt || a.createdAt;
        const dateB = (b as any).repostedAt || b.createdAt;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });

      return NextResponse.json({ posts: formatted });
    }

    // ── Standard feed mode ──
    let where: Record<string, unknown> = {};

    if (filter === 'following') {
      const following = await db.follow.findMany({
        where: { followerId: myUserId, status: 'accepted' },
        select: { followingId: true },
      });
      const followingIds = following.map(f => f.followingId);
      followingIds.push(myUserId);
      where.userId = { in: followingIds };
    } else if (filter === 'bookmarked') {
      const bookmarks = await db.postBookmark.findMany({
        where: { userId: myUserId },
        select: { postId: true },
      });
      where.id = { in: bookmarks.map(b => b.postId) };
    }

    const [posts, total] = await Promise.all([
      db.post.findMany({
        where,
        include: {
          user: {
            select: { id: true, username: true, profile: { select: { name: true, avatarUrl: true, verified: true } } },
          },
          _count: { select: { likes: true, comments: true, reposts: true, bookmarks: true } },
          likes: { where: { userId: myUserId }, select: { id: true } },
          bookmarks: { where: { userId: myUserId }, select: { id: true } },
          reposts: { where: { userId: myUserId }, select: { id: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.post.count({ where }),
    ]);

    const formatted = posts.map(p => ({
      id: p.id,
      content: p.content,
      images: safeJsonParse<string[]>(p.images, []),
      hashtags: safeJsonParse<string[]>(p.hashtags, []),
      createdAt: p.createdAt,
      user: {
        id: p.user.id,
        username: p.user.username,
        name: p.user.profile?.name || p.user.username,
        avatarUrl: p.user.profile?.avatarUrl,
        verified: p.user.profile?.verified || false,
      },
      stats: {
        likes: p._count.likes,
        comments: p._count.comments,
        reposts: p._count.reposts,
        bookmarks: p._count.bookmarks,
      },
      isLiked: p.likes.length > 0,
      isBookmarked: p.bookmarks.length > 0,
      isReposted: p.reposts.length > 0,
      isRepost: false,
    }));

    return NextResponse.json({
      posts: formatted,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('GET /api/posts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const guestRejected = rejectGuest(req); if (guestRejected) return guestRejected;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    const { content, taggedUsers, hashtags } = body;

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const post = await db.post.create({
      data: {
        userId: session.user.id,
        content: content.trim(),
        taggedUsers: taggedUsers ? JSON.stringify(taggedUsers) : null,
        hashtags: hashtags ? JSON.stringify(hashtags) : null,
      },
      include: {
        user: {
          select: { id: true, username: true, profile: { select: { name: true, avatarUrl: true } } },
        },
      },
    });

    await awardXP(session.user.id, 'social', 'Created a post');
    await updateStreak(session.user.id);

    // Create notifications for tagged users
    if (taggedUsers && Array.isArray(taggedUsers) && taggedUsers.length > 0) {
      try {
        const taggerProfile = await db.profile.findUnique({ where: { userId: session.user.id }, select: { name: true } });
        const taggerName = taggerProfile?.name || 'Someone';
        for (const taggedUserId of taggedUsers) {
          if (taggedUserId && taggedUserId !== session.user.id) {
            await db.notification.create({
              data: {
                userId: taggedUserId,
                type: 'tag',
                fromUserId: session.user.id,
                postId: post.id,
                message: `${taggerName} tagged you in a post`,
                data: JSON.stringify({ postId: post.id }),
              },
            });
          }
        }
      } catch (tagNotifError) {
        console.error('Tag notification error (non-blocking):', tagNotifError);
      }
    }

    // Create followed_post notifications for all followers
    try {
      const followers = await db.follow.findMany({
        where: { followingId: session.user.id, status: 'accepted' },
        select: { followerId: true },
      });
      if (followers.length > 0) {
        const posterProfile = await db.profile.findUnique({ where: { userId: session.user.id }, select: { name: true } });
        const posterName = posterProfile?.name || 'Someone';
        for (const follower of followers) {
          // Don't notify if they were already tagged (they'll get a tag notification instead)
          const isTagged = taggedUsers && Array.isArray(taggedUsers) && taggedUsers.includes(follower.followerId);
          if (!isTagged) {
            await db.notification.create({
              data: {
                userId: follower.followerId,
                type: 'followed_post',
                fromUserId: session.user.id,
                postId: post.id,
                message: `${posterName} posted: "${content.trim().slice(0, 50)}"`,
                data: JSON.stringify({ postId: post.id }),
              },
            });
          }
        }
      }
    } catch (followedPostError) {
      console.error('Followed post notification error (non-blocking):', followedPostError);
    }

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error('POST /api/posts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
