import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ conversationId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = (session.user as any).id;
    const { conversationId } = await params;

    let messages: any[] = [];

    if (conversationId.startsWith('legacy_')) {
      // Legacy conversation - fetch from Message model
      const otherUserId = conversationId.replace('legacy_', '');
      const directMessages = await db.message.findMany({
        where: {
          OR: [
            { senderId: userId, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: userId },
          ],
        },
        orderBy: { createdAt: 'asc' },
        take: 100,
        include: {
          sender: { select: { id: true, username: true, profile: { select: { name: true } } } },
        },
      });
      messages = directMessages.map(m => ({
        id: m.id,
        senderId: m.senderId,
        content: m.content,
        createdAt: m.createdAt.toISOString(),
        senderName: m.sender.profile?.name || m.sender.username,
      }));
    } else {
      // DMConversation-based conversation
      const conv = await db.dMConversation.findUnique({
        where: { id: conversationId },
      });

      if (!conv || (conv.participant1Id !== userId && conv.participant2Id !== userId)) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
      }

      const dmMessages = await db.dMMessage.findMany({
        where: { conversationId },
        include: { sender: { include: { profile: true } } },
        orderBy: { createdAt: 'asc' },
        take: 100,
      });

      // Mark as read
      await db.dMMessage.updateMany({
        where: { conversationId, senderId: { not: userId }, isRead: false },
        data: { isRead: true },
      });

      messages = dmMessages.map(m => ({
        id: m.id,
        senderId: m.senderId,
        content: m.content,
        isRead: m.isRead,
        createdAt: m.createdAt.toISOString(),
        senderName: m.sender.profile?.name || m.sender.username,
      }));
    }

    return NextResponse.json(messages);
  } catch (error) {
    console.error('GET /api/messages/[conversationId] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
