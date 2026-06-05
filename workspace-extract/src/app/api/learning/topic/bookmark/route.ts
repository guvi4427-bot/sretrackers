import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserId } from '@/lib/auth-helper';

// GET /api/learning/topic/bookmark - List user's bookmarked topics
export async function GET(request: Request) {
  try {
    const userId = await getUserId();
    const { searchParams } = new URL(request.url);
    const topicId = searchParams.get('topicId');

    if (topicId) {
      // Check if a specific topic is bookmarked
      const bookmark = await db.topicBookmark.findUnique({
        where: { topicId_userId: { topicId, userId } },
      });
      return NextResponse.json({ bookmarked: !!bookmark });
    }

    const bookmarks = await db.topicBookmark.findMany({
      where: { userId },
      include: {
        topic: {
          select: {
            id: true,
            name: true,
            userId: true,
            isSharedCollection: true,
            collectionVisibility: true,
            sharedAt: true,
            user: { select: { id: true, username: true, profile: { select: { name: true, avatarUrl: true } } } },
            _count: { select: { entries: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ bookmarks });
  } catch (error) {
    console.error('Topic bookmark GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/learning/topic/bookmark - Bookmark or unbookmark a topic
export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    const { topicId, bookmark } = await request.json();

    if (!topicId) {
      return NextResponse.json({ error: 'topicId required' }, { status: 400 });
    }

    // Verify the topic exists and is shared
    const topic = await db.learningTopic.findUnique({ where: { id: topicId } });
    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    // Can only bookmark shared topics that aren't your own
    if (topic.userId === userId) {
      return NextResponse.json({ error: 'Cannot bookmark your own topic' }, { status: 400 });
    }

    const existing = await db.topicBookmark.findUnique({
      where: { topicId_userId: { topicId, userId } },
    });

    if (bookmark) {
      // Bookmark
      if (existing) {
        return NextResponse.json({ bookmarked: true, message: 'Already bookmarked' });
      }
      await db.topicBookmark.create({
        data: { topicId, userId },
      });
      return NextResponse.json({ bookmarked: true });
    } else {
      // Unbookmark
      if (!existing) {
        return NextResponse.json({ bookmarked: false, message: 'Not bookmarked' });
      }
      await db.topicBookmark.delete({
        where: { topicId_userId: { topicId, userId } },
      });
      return NextResponse.json({ bookmarked: false });
    }
  } catch (error) {
    console.error('Topic bookmark POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
