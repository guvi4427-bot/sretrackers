import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// GET /api/ai/conversations/[id] — Get conversation with messages
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    try {
      const conversation = await db.conversation.findUnique({
        where: { id },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      if (!conversation || conversation.userId !== session.user.id) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }

      return NextResponse.json({ conversation });
    } catch (dbError) {
      // Table may not exist — try legacy ChatHistory
      console.log('[Conversation GET] DB query failed, trying legacy:', dbError instanceof Error ? dbError.message : 'unknown');
      try {
        const legacyChat = await db.chatHistory.findUnique({ where: { id } });
        if (!legacyChat || legacyChat.userId !== session.user.id) {
          return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
        let messages: any[] = [];
        try { messages = JSON.parse(legacyChat.messages); } catch { messages = []; }
        return NextResponse.json({
          conversation: {
            id: legacyChat.id,
            title: messages.find((m: any) => m.role === 'user')?.content?.slice(0, 80) || 'New Conversation',
            aiAgentType: legacyChat.botType,
            messages: messages.map((m: any, i: number) => ({
              id: `${legacyChat.id}-msg-${i}`,
              role: m.role,
              content: m.content,
              createdAt: m.timestamp || legacyChat.createdAt,
            })),
            createdAt: legacyChat.createdAt,
            updatedAt: legacyChat.updatedAt,
          },
        });
      } catch (legacyError) {
        console.log('[Conversation GET] Legacy fallback also failed:', legacyError instanceof Error ? legacyError.message : 'unknown');
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
    }
  } catch (error) {
    console.error('Conversation GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch conversation' }, { status: 500 });
  }
}

// PATCH /api/ai/conversations/[id] — Rename conversation
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const { title } = await req.json();
    if (!title?.trim()) return NextResponse.json({ error: 'Title required' }, { status: 400 });

    try {
      const conversation = await db.conversation.findUnique({ where: { id } });
      if (!conversation || conversation.userId !== session.user.id) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }

      const updated = await db.conversation.update({
        where: { id },
        data: { title: title.trim() },
      });

      return NextResponse.json({ conversation: updated });
    } catch (dbError) {
      console.log('[Conversation PATCH] DB update failed:', dbError instanceof Error ? dbError.message : 'unknown');
      return NextResponse.json({
        conversation: { id, title: title.trim(), updatedAt: new Date().toISOString() },
      });
    }
  } catch (error) {
    console.error('Conversation PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update conversation' }, { status: 500 });
  }
}

// DELETE /api/ai/conversations/[id] — Delete conversation
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    try {
      const conversation = await db.conversation.findUnique({ where: { id } });
      if (!conversation || conversation.userId !== session.user.id) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }

      // Delete all messages first (cascade should handle this, but be safe)
      await db.chatMessage.deleteMany({ where: { conversationId: id } });
      await db.conversation.delete({ where: { id } });

      return NextResponse.json({ success: true });
    } catch (dbError) {
      // Try legacy ChatHistory delete
      console.log('[Conversation DELETE] DB delete failed, trying legacy:', dbError instanceof Error ? dbError.message : 'unknown');
      try {
        const legacyChat = await db.chatHistory.findUnique({ where: { id } });
        if (legacyChat && legacyChat.userId === session.user.id) {
          await db.chatHistory.delete({ where: { id } });
          return NextResponse.json({ success: true });
        }
      } catch (legacyError) {
        console.log('[Conversation DELETE] Legacy delete also failed:', legacyError instanceof Error ? legacyError.message : 'unknown');
      }
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Conversation DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete conversation' }, { status: 500 });
  }
}
