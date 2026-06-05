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

    const existing = await db.postBookmark.findUnique({
      where: { postId_userId: { postId, userId: session.user.id } },
    });

    if (existing) {
      return NextResponse.json({ bookmarked: true, id: existing.id });
    }

    const bookmark = await db.postBookmark.create({
      data: { postId, userId: session.user.id },
    });

    return NextResponse.json({ bookmarked: true, id: bookmark.id });
  } catch (error) {
    console.error('POST /api/posts/[postId]/bookmark error:', error);
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

    await db.postBookmark.deleteMany({
      where: { postId, userId: session.user.id },
    });

    return NextResponse.json({ bookmarked: false });
  } catch (error) {
    console.error('DELETE /api/posts/[postId]/bookmark error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
