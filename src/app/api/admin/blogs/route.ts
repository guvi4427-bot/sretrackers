import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, logAudit } from '@/lib/admin-auth';

// GET /api/admin/blogs - List all blogs for moderation
export async function GET(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin();
    if ('error' in adminCheck) return NextResponse.json({ error: adminCheck.error!.message }, { status: adminCheck.error!.status });

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('q') || '';
    const status = searchParams.get('status') || '';

    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [blogs, total] = await Promise.all([
      db.blog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              profile: { select: { name: true, avatarUrl: true } },
            },
          },
          _count: { select: { likes: true, comments: true, bookmarks: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.blog.count({ where }),
    ]);

    return NextResponse.json({
      blogs: blogs.map(b => ({
        id: b.id,
        title: b.title,
        slug: b.slug,
        excerpt: b.excerpt,
        status: b.status,
        featured: b.featured,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
        user: {
          id: b.user.id,
          username: b.user.username,
          email: b.user.email,
          name: b.user.profile?.name || b.user.username,
          avatarUrl: b.user.profile?.avatarUrl,
        },
        stats: {
          likes: b._count.likes,
          comments: b._count.comments,
          bookmarks: b._count.bookmarks,
        },
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Admin blogs list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/blogs - Admin delete a blog
export async function DELETE(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin();
    if ('error' in adminCheck) return NextResponse.json({ error: adminCheck.error!.message }, { status: adminCheck.error!.status });

    const { searchParams } = new URL(request.url);
    const blogId = searchParams.get('id');
    if (!blogId) return NextResponse.json({ error: 'Blog ID required' }, { status: 400 });

    await db.blog.delete({ where: { id: blogId } });

    await logAudit(adminCheck.data.session.user.id, 'admin_delete_blog', blogId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin blog delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/admin/blogs - Admin update blog (hide/feature/status)
export async function PATCH(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin();
    if ('error' in adminCheck) return NextResponse.json({ error: adminCheck.error!.message }, { status: adminCheck.error!.status });

    const body = await request.json();
    const { blogId, status, featured } = body;
    if (!blogId) return NextResponse.json({ error: 'Blog ID required' }, { status: 400 });

    const updateData: any = {};
    if (status) updateData.status = status;
    if (featured !== undefined) updateData.featured = featured;

    const blog = await db.blog.update({
      where: { id: blogId },
      data: updateData,
    });

    await logAudit(adminCheck.data.session.user.id, 'admin_update_blog', blogId, { status, featured });

    return NextResponse.json({ blog });
  } catch (error) {
    console.error('Admin blog update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
