import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { safeJsonParse } from '@/lib/utils';

// GET /api/blogs/bookmarked - Get all blogs bookmarked by the authenticated user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const myUserId = session.user.id;

    const blogs = await db.blog.findMany({
      where: {
        status: 'published',
        bookmarks: { some: { userId: myUserId } },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profile: { select: { name: true, avatarUrl: true, verified: true } },
          },
        },
        _count: { select: { likes: true, comments: true, bookmarks: true } },
        likes: { where: { userId: myUserId }, select: { id: true } },
        bookmarks: { where: { userId: myUserId }, select: { id: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = blogs.map((b: any) => ({
      id: b.id,
      title: b.title,
      slug: b.slug,
      excerpt: b.excerpt || b.content?.slice(0, 200) + '...',
      coverImage: b.coverImage,
      tags: safeJsonParse<string[]>(b.tags, []),
      readTime: b.readTime,
      featured: b.featured,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
      user: {
        id: b.user.id,
        username: b.user.username,
        name: b.user.profile?.name || b.user.username,
        avatarUrl: b.user.profile?.avatarUrl,
        verified: b.user.profile?.verified || false,
      },
      stats: {
        likes: b._count.likes,
        comments: b._count.comments,
        bookmarks: b._count.bookmarks,
      },
      isLiked: b.likes?.length > 0,
      isBookmarked: b.bookmarks?.length > 0,
    }));

    return NextResponse.json({ blogs: formatted });
  } catch (error) {
    console.error('GET /api/blogs/bookmarked error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
