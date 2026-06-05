import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { rejectGuest } from '@/lib/auth-helper';

// GET /api/blogs/[blogId]/comment - List comments (public)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ blogId: string }> }
) {
  try {
    const { blogId } = await params;
    const comments = await db.blogComment.findMany({
      where: { blogId },
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
      take: 100,
    });

    const formatted = comments.map((c: any) => ({
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
    }));

    return NextResponse.json({ comments: formatted });
  } catch (error) {
    console.error('GET /api/blogs/[blogId]/comment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/blogs/[blogId]/comment - Add comment (auth required)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ blogId: string }> }
) {
  const guestRejected = rejectGuest(req);
  if (guestRejected) return guestRejected;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { blogId } = await params;
    const body = await req.json();
    const { content } = body;

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 });
    }

    const comment = await db.blogComment.create({
      data: {
        blogId,
        userId: session.user.id,
        content: content.trim(),
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profile: { select: { name: true, avatarUrl: true, verified: true } },
          },
        },
      },
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error('POST /api/blogs/[blogId]/comment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
