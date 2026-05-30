import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { rejectGuest } from '@/lib/auth-helper';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { postId } = await params;

    const comments = await db.comment.findMany({
      where: { postId },
      include: {
        user: {
          select: { id: true, username: true, profile: { select: { name: true, avatarUrl: true } } },
        },
        _count: { select: { likes: true } },
        likes: { where: { userId: session.user.id }, select: { id: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const formatted = comments.map(c => ({
      id: c.id,
      content: c.content,
      createdAt: c.createdAt,
      user: {
        id: c.user.id,
        username: c.user.username,
        name: c.user.profile?.name || c.user.username,
        avatarUrl: c.user.profile?.avatarUrl,
      },
      likes: c._count.likes,
      isLiked: c.likes.length > 0,
    }));

    return NextResponse.json({ comments: formatted });
  } catch (error) {
    console.error('GET /api/posts/[postId]/comments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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
    const body = await req.json();
    const { content } = body;

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const comment = await db.comment.create({
      data: {
        postId,
        userId: session.user.id,
        content: content.trim(),
      },
      include: {
        user: {
          select: { id: true, username: true, profile: { select: { name: true, avatarUrl: true } } },
        },
      },
    });

    // Create notification
    const post = await db.post.findUnique({ where: { id: postId }, select: { userId: true } });
    if (post && post.userId !== session.user.id) {
      await db.notification.create({
        data: {
          userId: post.userId,
          type: 'comment',
          fromUserId: session.user.id,
          postId,
          message: `commented: "${content.slice(0, 50)}"`,
        },
      });
    }

    // Create tag notifications for @mentioned users in the comment
    try {
      const mentionRegex = /@(\w+)/g;
      const mentionedUsernames: string[] = [];
      let match;
      while ((match = mentionRegex.exec(content)) !== null) {
        mentionedUsernames.push(match[1]);
      }
      if (mentionedUsernames.length > 0) {
        const mentionedUsers = await db.user.findMany({
          where: { username: { in: mentionedUsernames } },
          select: { id: true, username: true },
        });
        const commenterProfile = await db.profile.findUnique({ where: { userId: session.user.id }, select: { name: true } });
        const commenterName = commenterProfile?.name || 'Someone';
        for (const mentionedUser of mentionedUsers) {
          if (mentionedUser.id !== session.user.id) {
            await db.notification.create({
              data: {
                userId: mentionedUser.id,
                type: 'tag',
                fromUserId: session.user.id,
                postId,
                message: `${commenterName} mentioned you in a comment`,
                data: JSON.stringify({ postId }),
              },
            });
          }
        }
      }
    } catch (tagNotifError) {
      console.error('Comment tag notification error (non-blocking):', tagNotifError);
    }

    return NextResponse.json({
      comment: {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        user: {
          id: comment.user.id,
          username: comment.user.username,
          name: comment.user.profile?.name || comment.user.username,
          avatarUrl: comment.user.profile?.avatarUrl,
        },
        likes: 0,
        isLiked: false,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/posts/[postId]/comments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
