import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { safeJsonParse } from '@/lib/utils';

// GET /api/posts/bookmarked - Get all posts bookmarked by the authenticated user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const myUserId = session.user.id;

    // Find all bookmarked post IDs for this user
    const bookmarks = await db.postBookmark.findMany({
      where: { userId: myUserId },
      select: { postId: true },
    });

    if (bookmarks.length === 0) {
      return NextResponse.json({ posts: [] });
    }

    const postIds = bookmarks.map(b => b.postId);

    // Fetch the actual posts
    const posts = await db.post.findMany({
      where: { id: { in: postIds } },
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
    });

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

    return NextResponse.json({ posts: formatted });
  } catch (error) {
    console.error('GET /api/posts/bookmarked error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
