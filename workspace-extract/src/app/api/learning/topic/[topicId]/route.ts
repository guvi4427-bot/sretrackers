import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserId, getUserIdOrNull } from '@/lib/auth-helper';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ topicId: string }> }
) {
  try {
    const userId = await getUserIdOrNull();
    const { topicId } = await params;

    const topic = await db.learningTopic.findUnique({
      where: { id: topicId },
      include: {
        entries: { orderBy: { date: 'desc' } },
        flags: { orderBy: { flagDate: 'desc' } },
        user: { select: { id: true, username: true, profile: { select: { name: true, verified: true } } } },
      },
    });

    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    // Allow access if:
    // 1. User is the owner, OR
    // 2. Topic is shared publicly (isSharedCollection=true AND collectionVisibility=public)
    const isOwner = userId ? topic.userId === userId : false;
    const isPublicShared = topic.isSharedCollection && topic.collectionVisibility === 'public';

    if (!isOwner && !isPublicShared) {
      // Guests can only see publicly shared topics
      if (!userId) {
        return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    return NextResponse.json({ topic, isOwner });
  } catch (error) {
    console.error('Learning topic GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch topic' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ topicId: string }> }
) {
  try {
    const userId = await getUserId();
    const { topicId } = await params;
    const body = await request.json();
    const { name, phase, isSharedCollection, collectionVisibility } = body;

    const existing = await db.learningTopic.findUnique({ where: { id: topicId } });
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    const topic = await db.learningTopic.update({
      where: { id: topicId },
      data: {
        ...(name !== undefined && { name }),
        ...(phase !== undefined && { phase }),
        ...(isSharedCollection !== undefined && {
          isSharedCollection,
          sharedAt: isSharedCollection ? new Date() : null,
        }),
        ...(collectionVisibility !== undefined && { collectionVisibility }),
      },
    });

    return NextResponse.json({ topic });
  } catch (error) {
    console.error('Learning topic PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update topic' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ topicId: string }> }
) {
  try {
    const userId = await getUserId();
    const { topicId } = await params;

    const existing = await db.learningTopic.findUnique({ where: { id: topicId } });
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    await db.learningTopic.delete({ where: { id: topicId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Learning topic DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete topic' }, { status: 500 });
  }
}
