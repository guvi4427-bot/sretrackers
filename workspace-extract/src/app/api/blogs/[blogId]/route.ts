import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { safeJsonParse } from '@/lib/utils';

// GET /api/blogs/[blogId] - Get a single blog (public)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ blogId: string }> }
) {
  try {
    const { blogId } = await params;
    const session = await getServerSession(authOptions);
    const myUserId = session?.user?.id || '';

    // Try to find by ID first, then by slug
    let blog = await db.blog.findUnique({
      where: { id: blogId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profile: { select: { name: true, avatarUrl: true, verified: true, bio: true } },
          },
        },
        _count: { select: { likes: true, comments: true, bookmarks: true } },
        ...(myUserId ? {
          likes: { where: { userId: myUserId }, select: { id: true } },
          bookmarks: { where: { userId: myUserId }, select: { id: true } },
        } : {}),
      },
    });

    // If not found by ID, try by slug
    if (!blog) {
      blog = await db.blog.findUnique({
        where: { slug: blogId },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              profile: { select: { name: true, avatarUrl: true, verified: true, bio: true } },
            },
          },
          _count: { select: { likes: true, comments: true, bookmarks: true } },
          ...(myUserId ? {
            likes: { where: { userId: myUserId }, select: { id: true } },
            bookmarks: { where: { userId: myUserId }, select: { id: true } },
          } : {}),
        },
      });
    }

    if (!blog || (blog.status !== 'published' && blog.userId !== myUserId)) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    // Fetch comments
    const comments = await db.blogComment.findMany({
      where: { blogId: blog.id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profile: { select: { name: true, avatarUrl: true, verified: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const formatted = {
      id: blog.id,
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt,
      content: blog.content,
      coverImage: blog.coverImage,
      tags: safeJsonParse<string[]>(blog.tags, []),
      readTime: blog.readTime,
      status: blog.status,
      featured: blog.featured,
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt,
      user: {
        id: blog.user.id,
        username: blog.user.username,
        name: blog.user.profile?.name || blog.user.username,
        avatarUrl: blog.user.profile?.avatarUrl,
        verified: blog.user.profile?.verified || false,
        bio: blog.user.profile?.bio || null,
      },
      stats: {
        likes: blog._count.likes,
        comments: blog._count.comments,
        bookmarks: blog._count.bookmarks,
      },
      isLiked: myUserId ? (blog as any).likes?.length > 0 : false,
      isBookmarked: myUserId ? (blog as any).bookmarks?.length > 0 : false,
      isOwn: myUserId === blog.userId,
      comments: comments.map((c: any) => ({
        id: c.id,
        content: c.content,
        createdAt: c.createdAt,
        user: {
          id: c.user.id,
          username: c.user.username,
          name: c.user.profile?.name || c.user.username,
          avatarUrl: c.user.profile?.avatarUrl,
          verified: c.user.profile?.verified || false,
        },
      })),
    };

    return NextResponse.json({ blog: formatted });
  } catch (error) {
    console.error('GET /api/blogs/[blogId] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/blogs/[blogId] - Update blog (owner only)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ blogId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { blogId } = await params;
    const blog = await db.blog.findUnique({ where: { id: blogId } });
    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }
    if (blog.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { title, content, excerpt, coverImage, tags, status, featured } = body;

    const wordCount = content?.trim().split(/\s+/).length || blog.readTime * 200;
    const readTime = content ? Math.max(1, Math.ceil(wordCount / 200)) : blog.readTime;

    const updated = await db.blog.update({
      where: { id: blogId },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(content !== undefined && { content: content.trim(), readTime }),
        ...(excerpt !== undefined && { excerpt: excerpt?.trim() }),
        ...(coverImage !== undefined && { coverImage }),
        ...(tags !== undefined && { tags: tags ? JSON.stringify(tags) : null }),
        ...(status !== undefined && { status }),
        ...(featured !== undefined && { featured }),
      },
    });

    return NextResponse.json({ blog: updated });
  } catch (error) {
    console.error('PUT /api/blogs/[blogId] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/blogs/[blogId] - Delete blog (owner only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ blogId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { blogId } = await params;
    const blog = await db.blog.findUnique({ where: { id: blogId } });
    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }
    if (blog.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await db.blog.delete({ where: { id: blogId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/blogs/[blogId] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
