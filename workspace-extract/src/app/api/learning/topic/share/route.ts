import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserId } from '@/lib/auth-helper';

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    const body = await request.json();
    const { topicId, share } = body;

    if (!topicId || typeof share !== 'boolean') {
      return NextResponse.json({ error: 'topicId and share (boolean) required' }, { status: 400 });
    }

    // Verify topic belongs to user
    const existing = await db.learningTopic.findUnique({ where: { id: topicId } });
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    if (share) {
      // Share: update topic and create auto feed post
      const topic = await db.learningTopic.update({
        where: { id: topicId },
        data: {
          isSharedCollection: true,
          sharedAt: new Date(),
        },
      });

      // Create auto feed post about shared collection
      const entryCount = await db.learningEntry.count({ where: { topicId } });
      await db.post.create({
        data: {
          userId,
          content: `📚 Shared my learning collection: "${existing.name}" (${entryCount} entries) [topicId:${topicId}] — check it out! #Learning #${existing.name.replace(/\s+/g, '')}`,
          hashtags: JSON.stringify(['Learning', existing.name.replace(/\s+/g, '')]),
        },
      });

      return NextResponse.json({ topic, shared: true });
    } else {
      // Unshare: update topic and delete auto feed post
      const topic = await db.learningTopic.update({
        where: { id: topicId },
        data: {
          isSharedCollection: false,
          sharedAt: null,
        },
      });

      // Delete auto feed posts about this collection
      const posts = await db.post.findMany({
        where: {
          userId,
          content: { contains: topicId },
        },
      });

      for (const post of posts) {
        if (post.content.includes('📚 Shared my learning collection:') && post.content.includes(topicId)) {
          await db.post.delete({ where: { id: post.id } }).catch(() => {});
        }
      }

      return NextResponse.json({ topic, shared: false });
    }
  } catch (error) {
    console.error('Topic share error:', error);
    return NextResponse.json({ error: 'Failed to update share status' }, { status: 500 });
  }
}
