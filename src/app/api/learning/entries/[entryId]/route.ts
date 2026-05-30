import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserId } from '@/lib/auth-helper';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ entryId: string }> }
) {
  try {
    const userId = await getUserId();
    const { entryId } = await params;

    const entry = await db.learningEntry.findUnique({
      where: { id: entryId },
      include: {
        topic: { select: { name: true, id: true, phase: true, userId: true, isSharedCollection: true, collectionVisibility: true } },
      },
    });

    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    // Allow access if:
    // 1. User is the entry owner, OR
    // 2. The entry belongs to a publicly shared topic
    const isOwner = entry.userId === userId;
    const isPublicSharedTopic = entry.topic.isSharedCollection && entry.topic.collectionVisibility === 'public';

    if (!isOwner && !isPublicSharedTopic) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    return NextResponse.json({ entry, isOwner });
  } catch (error) {
    console.error('Learning entry GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch entry' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ entryId: string }> }
) {
  try {
    const userId = await getUserId();
    const { entryId } = await params;
    const body = await request.json();
    const { title, content, duration, date } = body;

    const existing = await db.learningEntry.findUnique({ where: { id: entryId } });
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    const entry = await db.learningEntry.update({
      where: { id: entryId },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(duration !== undefined && { duration }),
        ...(date !== undefined && { date }),
      },
    });

    return NextResponse.json({ entry });
  } catch (error) {
    console.error('Learning entry PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ entryId: string }> }
) {
  try {
    const userId = await getUserId();
    const { entryId } = await params;

    const existing = await db.learningEntry.findUnique({ where: { id: entryId } });
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    await db.learningEntry.delete({ where: { id: entryId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Learning entry DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 });
  }
}
