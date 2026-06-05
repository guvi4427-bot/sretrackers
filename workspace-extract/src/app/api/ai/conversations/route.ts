import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// GET /api/ai/conversations — List conversations with filters
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const agentType = searchParams.get('agentType');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '15'), 50);

    const where: any = { userId: session.user.id };
    if (agentType && agentType !== 'all') where.aiAgentType = agentType;

    // Search across titles (message search requires joins, done separately)
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
      ];
    }

    let conversations: any[] = [];
    let total = 0;

    try {
      [conversations, total] = await Promise.all([
        db.conversation.findMany({
          where,
          orderBy: { updatedAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
          select: {
            id: true,
            title: true,
            aiAgentType: true,
            createdAt: true,
            updatedAt: true,
            _count: { select: { messages: true } },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              select: { content: true, role: true, createdAt: true },
            },
          },
        }),
        db.conversation.count({ where }),
      ]);

      // If searching, also search message content
      if (search) {
        let searchResults: any[] = [];
        try {
          const msgMatches = await db.chatMessage.findMany({
            where: {
              content: { contains: search, mode: 'insensitive' },
              conversation: { userId: session.user.id, ...(agentType && agentType !== 'all' ? { aiAgentType: agentType } : {}) },
            },
            select: {
              conversationId: true,
              conversation: {
                select: {
                  id: true,
                  title: true,
                  aiAgentType: true,
                  createdAt: true,
                  updatedAt: true,
                  _count: { select: { messages: true } },
                  messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                    select: { content: true, role: true, createdAt: true },
                  },
                },
              },
            },
            distinct: ['conversationId'],
            take: 20,
          });
          searchResults = msgMatches.map(m => m.conversation);
        } catch (msgSearchError) {
          console.log('[Conversations] Message search failed:', msgSearchError instanceof Error ? msgSearchError.message : 'unknown');
        }

        // Merge and deduplicate
        const allConvs = search
          ? [...conversations, ...searchResults.filter((sr: any) => !conversations.some((c: any) => c.id === sr.id))]
          : conversations;

        conversations = allConvs;
      }
    } catch (dbError) {
      // Conversation table may not exist yet — return empty results gracefully
      console.log('[Conversations] DB query failed (tables may not exist):', dbError instanceof Error ? dbError.message : 'unknown');
      // Try fallback to legacy ChatHistory
      try {
        const legacyChats = await db.chatHistory.findMany({
          where: { userId: session.user.id, ...(agentType && agentType !== 'all' ? { botType: agentType } : {}) },
          orderBy: { updatedAt: 'desc' },
          take: limit,
          skip: (page - 1) * limit,
        });

        conversations = legacyChats.map(chat => {
          let messages: any[] = [];
          try { messages = JSON.parse(chat.messages); } catch { messages = []; }
          return {
            id: chat.id,
            title: messages.find((m: any) => m.role === 'user')?.content?.slice(0, 80) || 'New Conversation',
            aiAgentType: chat.botType,
            _count: { messages: messages.length },
            messages: messages.length > 0 ? [{ content: messages[messages.length - 1]?.content, role: messages[messages.length - 1]?.role, createdAt: chat.updatedAt }] : [],
            createdAt: chat.createdAt,
            updatedAt: chat.updatedAt,
          };
        });
        total = conversations.length;
      } catch (legacyError) {
        console.log('[Conversations] Legacy fallback also failed:', legacyError instanceof Error ? legacyError.message : 'unknown');
        return NextResponse.json({ conversations: [], total: 0, page, hasMore: false });
      }
    }

    const formatted = conversations.map((c: any) => ({
      id: c.id,
      title: c.title,
      aiAgentType: c.aiAgentType,
      messageCount: c._count?.messages || 0,
      lastMessage: c.messages?.[0]?.content?.slice(0, 100) || '',
      lastMessageAt: c.updatedAt,
      createdAt: c.createdAt,
    }));

    return NextResponse.json({
      conversations: formatted,
      total,
      page,
      hasMore: total > page * limit,
    });
  } catch (error) {
    console.error('Conversations GET error:', error);
    return NextResponse.json({ conversations: [], total: 0, page: 1, hasMore: false });
  }
}

// POST /api/ai/conversations — Create new conversation
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { title, aiAgentType } = await req.json();

    try {
      const conversation = await db.conversation.create({
        data: {
          userId: session.user.id,
          title: title || 'New Conversation',
          aiAgentType: aiAgentType || 'general',
        },
      });
      return NextResponse.json({ conversation });
    } catch (dbError) {
      // Table may not exist — return a placeholder
      console.log('[Conversations] Create failed (table may not exist):', dbError instanceof Error ? dbError.message : 'unknown');
      return NextResponse.json({
        conversation: {
          id: `temp-${Date.now()}`,
          title: title || 'New Conversation',
          aiAgentType: aiAgentType || 'general',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
    }
  } catch (error) {
    console.error('Conversations POST error:', error);
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
  }
}
