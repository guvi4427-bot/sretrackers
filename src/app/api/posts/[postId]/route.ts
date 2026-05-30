import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { logAudit } from '@/lib/admin-auth';
import { safeJsonParse } from '@/lib/utils';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { postId } = await params;

    const post = await db.post.findUnique({
      where: { id: postId },
      include: {
        user: {
          select: { id: true, username: true, profile: { select: { name: true, avatarUrl: true } } },
        },
        _count: { select: { likes: true, comments: true, reposts: true, bookmarks: true } },
        likes: { where: { userId: session.user.id }, select: { id: true } },
        bookmarks: { where: { userId: session.user.id }, select: { id: true } },
        reposts: { where: { userId: session.user.id }, select: { id: true } },
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({
      post: {
        id: post.id,
        content: post.content,
        images: safeJsonParse<string[]>(post.images, []),
        hashtags: safeJsonParse<string[]>(post.hashtags, []),
        createdAt: post.createdAt,
        user: {
          id: post.user.id,
          username: post.user.username,
          name: post.user.profile?.name || post.user.username,
          avatarUrl: post.user.profile?.avatarUrl,
        },
        stats: {
          likes: post._count.likes,
          comments: post._count.comments,
          reposts: post._count.reposts,
          bookmarks: post._count.bookmarks,
        },
        isLiked: post.likes.length > 0,
        isBookmarked: post.bookmarks.length > 0,
        isReposted: post.reposts.length > 0,
      },
    });
  } catch (error) {
    console.error('GET /api/posts/[postId] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { postId } = await params;

    const post = await db.post.findUnique({ where: { id: postId } });
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Allow owner or admin to delete
    const adminRole = await db.adminRole.findUnique({ where: { userId: session.user.id } });
    const isAdmin = !!adminRole;
    if (post.userId !== session.user.id && !isAdmin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    await db.post.delete({ where: { id: postId } });

    // Audit log if admin deleted
    if (isAdmin && post.userId !== session.user.id) {
      await logAudit(session.user.id, 'admin_delete_post', post.userId, { postId, contentSnippet: post.content.slice(0, 100) });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/posts/[postId] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
