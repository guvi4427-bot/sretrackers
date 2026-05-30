import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { rejectGuest } from '@/lib/auth-helper';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all DM conversations for the current user
    const conversations = await db.dMConversation.findMany({
      where: {
        OR: [
          { participant1Id: session.user.id },
          { participant2Id: session.user.id },
        ],
      },
      include: {
        participant1: {
          select: {
            id: true, username: true,
            profile: { select: { name: true, avatarUrl: true } },
          },
        },
        participant2: {
          select: {
            id: true, username: true,
            profile: { select: { name: true, avatarUrl: true } },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { content: true, createdAt: true },
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    });

    const formatted = conversations.map(conv => {
      const isP1 = conv.participant1Id === session.user.id;
      const otherUser = isP1 ? conv.participant2 : conv.participant1;
      return {
        id: conv.id,
        otherUser: {
          id: otherUser.id,
          username: otherUser.username,
          name: otherUser.profile?.name || otherUser.username,
          avatarUrl: otherUser.profile?.avatarUrl,
        },
        lastMessage: conv.messages[0]?.content || '',
        lastMessageAt: conv.messages[0]?.createdAt?.toISOString() || conv.createdAt.toISOString(),
      };
    });

    // If no DM conversations exist yet, also check Message model for legacy conversations
    const legacyMessages = await db.message.findMany({
      where: {
        OR: [
          { senderId: session.user.id },
          { receiverId: session.user.id },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        sender: {
          select: { id: true, username: true, profile: { select: { name: true, avatarUrl: true } } },
        },
        receiver: {
          select: { id: true, username: true, profile: { select: { name: true, avatarUrl: true } } },
        },
      },
    });

    // Build legacy conversation map (only for users without DMConversation)
    const existingConvUserIds = new Set(formatted.map(c => c.otherUser.id));
    const legacyConvMap = new Map<string, any>();

    for (const m of legacyMessages) {
      const isSender = m.senderId === session.user.id;
      const otherUser = isSender ? m.receiver : m.sender;
      const otherId = otherUser.id;

      if (existingConvUserIds.has(otherId)) continue; // Already has DMConversation

      const existing = legacyConvMap.get(otherId);
      const msgDate = new Date(m.createdAt).getTime();
      const existingDate = existing ? new Date(existing.lastMessageAt).getTime() : 0;

      if (!existing || msgDate > existingDate) {
        legacyConvMap.set(otherId, {
          id: `legacy_${otherId}`, // Prefix to identify legacy conversations
          otherUser: {
            id: otherUser.id,
            username: otherUser.username,
            name: otherUser.profile?.name || otherUser.username,
            avatarUrl: otherUser.profile?.avatarUrl,
          },
          lastMessage: m.content,
          lastMessageAt: m.createdAt.toISOString(),
        });
      }
    }

    const allConversations = [
      ...formatted,
      ...Array.from(legacyConvMap.values()),
    ].sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

    return NextResponse.json({ conversations: allConversations });
  } catch (error) {
    console.error('GET /api/messages error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const guestRejected = rejectGuest(req); if (guestRejected) return guestRejected;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    const { receiverId, content } = body;

    if (!receiverId || !content?.trim()) {
      return NextResponse.json({ error: 'Receiver and content are required' }, { status: 400 });
    }

    // Check if blocked
    const blocked = await db.block.findFirst({
      where: {
        OR: [
          { blockerId: session.user.id, blockedId: receiverId },
          { blockerId: receiverId, blockedId: session.user.id },
        ],
      },
    });
    if (blocked) {
      return NextResponse.json({ error: 'Cannot send message' }, { status: 403 });
    }

    // Find or create DMConversation
    let conversation = await db.dMConversation.findFirst({
      where: {
        OR: [
          { participant1Id: session.user.id, participant2Id: receiverId },
          { participant1Id: receiverId, participant2Id: session.user.id },
        ],
      },
    });

    if (!conversation) {
      conversation = await db.dMConversation.create({
        data: {
          participant1Id: session.user.id,
          participant2Id: receiverId,
        },
      });
    }

    // Create DM message
    const message = await db.dMMessage.create({
      data: {
        conversationId: conversation.id,
        senderId: session.user.id,
        content: content.trim(),
      },
    });

    // Also create in Message model for backward compatibility
    await db.message.create({
      data: {
        senderId: session.user.id,
        receiverId,
        content: content.trim(),
      },
    });

    // Update conversation lastMessageAt timestamp
    await db.dMConversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: new Date() },
    });

    // Create DM notification
    await db.notification.create({
      data: {
        userId: receiverId,
        type: 'dm',
        fromUserId: session.user.id,
        message: 'sent you a message',
      },
    });

    return NextResponse.json({ message, conversationId: conversation.id }, { status: 201 });
  } catch (error) {
    console.error('POST /api/messages error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
