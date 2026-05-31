import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { rejectGuest } from '@/lib/auth-helper';

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
    const existing = await db.blogLike.findUnique({
      where: { blogId_userId: { blogId, userId: session.user.id } },
    });

    if (existing) {
      return NextResponse.json({ liked: true, id: existing.id });
    }

    const like = await db.blogLike.create({
      data: { blogId, userId: session.user.id },
    });

    return NextResponse.json({ liked: true, id: like.id });
  } catch (error) {
    console.error('POST /api/blogs/[blogId]/like error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
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
    await db.blogLike.deleteMany({
      where: { blogId, userId: session.user.id },
    });

    return NextResponse.json({ liked: false });
  } catch (error) {
    console.error('DELETE /api/blogs/[blogId]/like error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
