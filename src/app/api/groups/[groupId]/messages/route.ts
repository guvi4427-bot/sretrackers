import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { groupId } = await params;

    // Check membership
    const membership = await db.groupChatMember.findUnique({
      where: { groupId_userId: { groupId, userId: session.user.id } },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Not a group member' }, { status: 403 });
    }

    const messages = await db.groupChatMessage.findMany({
      where: { groupId },
      orderBy: { createdAt: 'asc' },
      take: 100,
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            profile: { select: { name: true, avatarUrl: true } },
          },
        },
      },
    });

    return NextResponse.json({
      messages: messages.map((m) => ({
        id: m.id,
        content: m.content,
        senderId: m.senderId,
        senderName: m.sender.profile?.name || m.sender.username,
        createdAt: m.createdAt.toISOString(),
        isOwn: m.senderId === session.user.id,
      })),
    });
  } catch (error) {
    console.error('Group messages error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { groupId } = await params;
    const { content } = await req.json();

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Message content required' }, { status: 400 });
    }

    // Check membership and message access
    const membership = await db.groupChatMember.findUnique({
      where: { groupId_userId: { groupId, userId: session.user.id } },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Not a group member' }, { status: 403 });
    }

    // Check if group restricts messaging to admins only
    const group = await db.groupChat.findUnique({ where: { id: groupId }, select: { messageAccess: true } });
    if (group?.messageAccess === 'admins_only' && membership.role === 'member') {
      return NextResponse.json({ error: 'Only admins can send messages in this group' }, { status: 403 });
    }

    const message = await db.groupChatMessage.create({
      data: { groupId, senderId: session.user.id, content: content.trim() },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            profile: { select: { name: true, avatarUrl: true } },
          },
        },
      },
    });

    // Create group_message notifications for all other group members
    try {
      const senderProfile = await db.profile.findUnique({ where: { userId: session.user.id }, select: { name: true } });
      const senderName = senderProfile?.name || 'Someone';
      const groupInfo = await db.groupChat.findUnique({ where: { id: groupId }, select: { name: true } });
      const groupName = groupInfo?.name || 'Group';
      const members = await db.groupChatMember.findMany({
        where: { groupId, userId: { not: session.user.id } },
        select: { userId: true },
      });
      for (const member of members) {
        await db.notification.create({
          data: {
            userId: member.userId,
            type: 'group_message',
            fromUserId: session.user.id,
            message: `${senderName} posted in ${groupName}: "${content.trim().slice(0, 50)}"`,
            data: JSON.stringify({ groupId }),
          },
        });
      }
    } catch (notifError) {
      console.error('Group message notification error (non-blocking):', notifError);
    }

    return NextResponse.json({
      message: {
        id: message.id,
        content: message.content,
        senderId: message.senderId,
        senderName: message.sender.profile?.name || message.sender.username,
        createdAt: message.createdAt.toISOString(),
        isOwn: true,
      },
    });
  } catch (error) {
    console.error('Group message send error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
