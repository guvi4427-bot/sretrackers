import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, targetId, category, reason } = await req.json();

    if (!category || !reason) {
      return NextResponse.json({ error: 'Category and reason required' }, { status: 400 });
    }

    if (type === 'post' && targetId) {
      const post = await db.post.findUnique({ where: { id: targetId } });
      if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

      await db.postReport.create({
        data: {
          reporterId: session.user.id,
          postId: targetId,
          reportedUserId: post.userId,
          category,
          reason,
        },
      });
    } else if (type === 'comment' && targetId) {
      const comment = await db.comment.findUnique({ where: { id: targetId } });
      if (!comment) return NextResponse.json({ error: 'Comment not found' }, { status: 404 });

      await db.commentReport.create({
        data: {
          reporterId: session.user.id,
          commentId: targetId,
          reportedUserId: comment.userId,
          category,
          reason,
        },
      });
    } else if (type === 'user' && targetId) {
      await db.report.create({
        data: {
          reporterId: session.user.id,
          reportedUserId: targetId,
          category,
          reason,
        },
      });
    } else {
      return NextResponse.json({ error: 'Invalid report type or missing target' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Report submitted' });
  } catch (error) {
    console.error('Report error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
