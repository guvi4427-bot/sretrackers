import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET(request: Request) {
  try {
    const adminCheck = await requireAdmin();
    if ('error' in adminCheck) return NextResponse.json({ error: adminCheck.error!.message }, { status: adminCheck.error!.status });

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    // View specific messages
    if (type && id) {
      if (type === 'dm') {
        const msgs = await db.dMMessage.findMany({
          where: { conversationId: id },
          orderBy: { createdAt: 'asc' },
          include: { sender: { include: { profile: true } } },
        });
        return NextResponse.json({
          messages: msgs.map(m => ({
            id: m.id, content: m.content, createdAt: m.createdAt, isRead: m.isRead,
            senderName: m.sender?.profile?.name || m.sender?.username || 'Unknown',
          })),
        });
      }
      if (type === 'group') {
        const msgs = await db.groupChatMessage.findMany({
          where: { groupId: id },
          orderBy: { createdAt: 'asc' },
          include: { sender: { include: { profile: true } } },
        });
        return NextResponse.json({
          messages: msgs.map(m => ({
            id: m.id, content: m.content, createdAt: m.createdAt,
            senderName: m.sender?.profile?.name || m.sender?.username || 'Unknown',
          })),
        });
      }
    }

    // List all conversations
    const dmConversations = await db.dMConversation.findMany({
      orderBy: { lastMessageAt: 'desc' },
      include: {
        participant1: { include: { profile: true } },
        participant2: { include: { profile: true } },
        messages: { select: { id: true } },
      },
    });

    const groupChats = await db.groupChat.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        members: { select: { id: true } },
        messages: { select: { id: true } },
      },
    });

    return NextResponse.json({
      dmConversations: dmConversations.map(dm => ({
        id: dm.id,
        p1name: dm.participant1?.profile?.name || dm.participant1?.username,
        p2name: dm.participant2?.profile?.name || dm.participant2?.username,
        messageCount: dm.messages.length,
        lastMessageAt: dm.lastMessageAt,
      })),
      groupChats: groupChats.map(gc => ({
        id: gc.id,
        name: gc.name,
        isPublic: gc.isPublic,
        memberCount: gc.members.length,
        messageCount: gc.messages.length,
      })),
    });
  } catch (error) {
    console.error('Admin DM monitor error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
