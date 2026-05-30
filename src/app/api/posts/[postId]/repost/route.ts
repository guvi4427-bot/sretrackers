import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { rejectGuest } from '@/lib/auth-helper';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const guestRejected = rejectGuest(req); if (guestRejected) return guestRejected;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { postId } = await params;
    let comment: string | null = null;
    try {
      const body = await req.json();
      comment = body.comment || null;
    } catch {
      // No body provided, that's fine
    }

    const existing = await db.repost.findUnique({
      where: { postId_userId: { postId, userId: session.user.id } },
    });

    if (existing) {
      return NextResponse.json({ reposted: true, id: existing.id });
    }

    const repost = await db.repost.create({
      data: { postId, userId: session.user.id, comment: comment || null },
    });

    // Create notification
    const post = await db.post.findUnique({ where: { id: postId }, select: { userId: true } });
    if (post && post.userId !== session.user.id) {
      await db.notification.create({
        data: {
          userId: post.userId,
          type: 'repost',
          fromUserId: session.user.id,
          postId,
          message: comment ? `reposted your post: "${comment}"` : 'reposted your post',
        },
      });
    }

    return NextResponse.json({ reposted: true, id: repost.id });
  } catch (error) {
    console.error('POST /api/posts/[postId]/repost error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const guestRejected = rejectGuest(req); if (guestRejected) return guestRejected;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { postId } = await params;

    await db.repost.deleteMany({
      where: { postId, userId: session.user.id },
    });

    return NextResponse.json({ reposted: false });
  } catch (error) {
    console.error('DELETE /api/posts/[postId]/repost error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
