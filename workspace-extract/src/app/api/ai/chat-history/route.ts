import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// GET /api/ai/chat-history — List all conversations for user
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const botType = searchParams.get('botType');
    const search = searchParams.get('search');

    const where: any = { userId: session.user.id };
    if (botType) where.botType = botType;

    const chats = await db.chatHistory.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      take: 50,
      select: {
        id: true,
        botType: true,
        messages: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Parse and format conversations
    const conversations = chats.map(chat => {
      let messages: any[] = [];
      try { messages = JSON.parse(chat.messages); } catch { messages = []; }

      const firstUserMsg = messages.find((m: any) => m.role === 'user');
      const title = firstUserMsg?.content?.slice(0, 80) + (firstUserMsg?.content?.length > 80 ? '...' : '') || 'New Conversation';

      // Filter by search if provided
      if (search && !title.toLowerCase().includes(search.toLowerCase()) && !messages.some((m: any) => m.content?.toLowerCase().includes(search.toLowerCase()))) {
        return null;
      }

      return {
        id: chat.id,
        botType: chat.botType,
        title,
        messageCount: messages.length,
        lastMessageAt: chat.updatedAt,
        createdAt: chat.createdAt,
        preview: messages.length > 0 ? messages[messages.length - 1]?.content?.slice(0, 100) : '',
      };
    }).filter(Boolean);

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Chat history GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch chat history' }, { status: 500 });
  }
}

// DELETE /api/ai/chat-history?id=xxx — Delete a conversation
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Conversation ID required' }, { status: 400 });

    const chat = await db.chatHistory.findUnique({ where: { id } });
    if (!chat || chat.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await db.chatHistory.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Chat history DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete conversation' }, { status: 500 });
  }
}
