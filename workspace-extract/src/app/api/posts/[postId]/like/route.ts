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

    const existing = await db.postLike.findUnique({
      where: { postId_userId: { postId, userId: session.user.id } },
    });

    if (existing) {
      return NextResponse.json({ liked: true, id: existing.id });
    }

    const like = await db.postLike.create({
      data: { postId, userId: session.user.id },
    });

    // Create notification
    const post = await db.post.findUnique({ where: { id: postId }, select: { userId: true } });
    if (post && post.userId !== session.user.id) {
      await db.notification.create({
        data: {
          userId: post.userId,
          type: 'like',
          fromUserId: session.user.id,
          postId,
          message: 'liked your post',
        },
      });
    }

    return NextResponse.json({ liked: true, id: like.id });
  } catch (error) {
    console.error('POST /api/posts/[postId]/like error:', error);
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

    await db.postLike.deleteMany({
      where: { postId, userId: session.user.id },
    });

    return NextResponse.json({ liked: false });
  } catch (error) {
    console.error('DELETE /api/posts/[postId]/like error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
