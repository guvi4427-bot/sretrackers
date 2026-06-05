import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { commentId } = await params;

    const existing = await db.commentLike.findUnique({
      where: { commentId_userId: { commentId, userId: session.user.id } },
    });

    if (existing) {
      return NextResponse.json({ liked: true, id: existing.id });
    }

    const like = await db.commentLike.create({
      data: { commentId, userId: session.user.id },
    });

    return NextResponse.json({ liked: true, id: like.id });
  } catch (error) {
    console.error('POST /api/comments/[commentId]/like error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { commentId } = await params;

    await db.commentLike.deleteMany({
      where: { commentId, userId: session.user.id },
    });

    return NextResponse.json({ liked: false });
  } catch (error) {
    console.error('DELETE /api/comments/[commentId]/like error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
