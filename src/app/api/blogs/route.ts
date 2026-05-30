import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { rejectGuest } from '@/lib/auth-helper';
import { safeJsonParse } from '@/lib/utils';
import { awardXP, updateStreak } from '@/lib/xp';

// GET /api/blogs - List all published blogs (public, guests can read)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const myUserId = session?.user?.id || '';
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const tag = searchParams.get('tag');
    const search = searchParams.get('q');
    const username = searchParams.get('username');
    const skip = (page - 1) * limit;

    const where: any = { status: 'published' };
    if (tag) {
      // Filter by tag (tags is JSON array, use contains)
      where.tags = { contains: tag };
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (username) {
      where.user = { username };
    }

    const [blogs, total] = await Promise.all([
      db.blog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              profile: { select: { name: true, avatarUrl: true, verified: true } },
            },
          },
          _count: { select: { likes: true, comments: true, bookmarks: true } },
          ...(myUserId ? {
            likes: { where: { userId: myUserId }, select: { id: true } },
            bookmarks: { where: { userId: myUserId }, select: { id: true } },
          } : {}),
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.blog.count({ where }),
    ]);

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
      isLiked: myUserId ? b.likes?.length > 0 : false,
      isBookmarked: myUserId ? b.bookmarks?.length > 0 : false,
    }));

    return NextResponse.json({
      blogs: formatted,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('GET /api/blogs error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/blogs - Create a blog (auth required)
export async function POST(req: NextRequest) {
  const guestRejected = rejectGuest(req);
  if (guestRejected) return guestRejected;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, content, excerpt, coverImage, tags, status, featured } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    if (!content?.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Generate slug from title
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 80);
    
    // Ensure slug is unique
    let slug = baseSlug;
    let suffix = 1;
    while (await db.blog.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${suffix++}`;
    }

    // Estimate read time (avg 200 words/min)
    const wordCount = content.trim().split(/\s+/).length;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));

    const blog = await db.blog.create({
      data: {
        userId: session.user.id,
        title: title.trim(),
        slug,
        excerpt: excerpt?.trim() || content.trim().slice(0, 200),
        content: content.trim(),
        coverImage: coverImage || null,
        tags: tags ? JSON.stringify(tags) : null,
        readTime,
        status: status === 'draft' ? 'draft' : 'published',
        featured: featured || false,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profile: { select: { name: true, avatarUrl: true } },
          },
        },
      },
    });

    // Award XP for publishing a blog
    if (blog.status === 'published') {
      await awardXP(session.user.id, 'social', 'Published a blog article');
      await updateStreak(session.user.id);
    }

    return NextResponse.json({ blog }, { status: 201 });
  } catch (error) {
    console.error('POST /api/blogs error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
