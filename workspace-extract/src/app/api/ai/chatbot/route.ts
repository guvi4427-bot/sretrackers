import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { aiChat, generateTitle, getNavigatorResponse } from '@/lib/ai-provider';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { message, botType, conversationId, history } = await req.json();
    if (!message) return NextResponse.json({ error: 'Message required' }, { status: 400 });

    const userId = session.user.id;
    const agentType = botType || 'general';

    // ── System Prompts (detailed, no forced concise) ──
    const systemPrompts: Record<string, string> = {
      learning: `You are a helpful learning assistant for the SRE (Start·Restart·Explore) platform. Help users study effectively, explain concepts clearly, suggest learning strategies, and create study roadmaps.

Answer the user's question directly and completely. Provide detailed explanations when appropriate. Use short responses only for simple questions. For roadmap, educational, planning, and learning questions provide structured and complete answers. Prioritize usefulness over brevity.

You can help with:
- Explaining concepts in depth
- Creating study plans and roadmaps
- Suggesting learning resources and techniques
- Breaking down complex topics
- Motivating and encouraging consistent study habits
- Analyzing learning patterns and suggesting improvements`,

      fitness: `You are a fitness and nutrition assistant for the SRE (Start·Restart·Explore) platform. Help with workouts, nutrition, form tips, motivation, and fitness planning.

Answer the user's question directly and completely. Provide detailed explanations when appropriate. Use short responses only for simple questions. For fitness planning, workout programming, nutrition advice, and training questions provide structured and complete answers. Prioritize usefulness over brevity.

You can help with:
- Creating workout plans and routines
- Explaining exercises and proper form
- Nutrition advice and meal planning
- TDEE and macro calculations
- Weight loss/gain strategies
- Recovery and injury prevention
- Motivating consistent fitness habits`,

      content: `You are a content creation assistant for the SRE (Start·Restart·Explore) platform. Help with writing, scripting, content strategy, and creative ideas.

Answer the user's question directly and completely. Provide detailed explanations when appropriate. Use short responses only for simple questions. For content strategy, script writing, creative planning, and content creation questions provide structured and complete answers. Prioritize usefulness over brevity.

You can help with:
- Writing scripts and content
- Content strategy and planning
- Platform-specific optimization (YouTube, blog, social media)
- Hook and CTA creation
- Content calendars and publishing schedules
- Editing and improving content
- Brainstorming creative ideas`,

      time: `You are a time management and productivity assistant for the SRE (Start·Restart·Explore) platform. Help with prioritization, focus techniques, scheduling, and building productive habits.

Answer the user's question directly and completely. Provide detailed explanations when appropriate. Use short responses only for simple questions. For productivity planning, time management, scheduling, and habit building questions provide structured and complete answers. Prioritize usefulness over brevity.

You can help with:
- Prioritizing tasks and managing workload
- Focus techniques (Pomodoro, time blocking, etc.)
- Daily and weekly planning
- Overcoming procrastination
- Building consistent routines
- Identifying and replacing unproductive habits`,

      navigation: `You are the SRE Platform Navigation Assistant. Your job is to help users navigate and use the SRE (Start·Restart·Explore) platform effectively.

Answer the user's question directly and completely. Help users find features, understand what each section does, and get the most out of the platform.

SRE Platform Sections you can guide users to:
- **Home** (/home) — Your personalized dashboard showing activity summary, stats, and quick actions
- **Learn** (/learn) — Learning tracker: create topics, log study entries, track progress with charts, share topics
- **Fitness** (/fitness) — Fitness tracker: log workouts, meals, weight; view progress charts; AI macro/burn estimation
- **Content** (/content) — Content creation tracker: manage series, track pipeline stages (idea→drafting→editing→published)
- **Time** (/time) — Time management: create tasks with priorities, focus timer, day planner with AI rating
- **Feed** (/feed) — Social feed: see posts from people you follow, like, bookmark, repost, comment
- **Discover** (/discover) — Find new users and content to follow
- **Leaderboard** (/leaderboard) — Community XP rankings
- **Achievements** (/achievements) — View unlocked badges (100+ achievements across learning, fitness, time, content)
- **Analytics** (/analytics) — Visual dashboards for learning, fitness, and focus data
- **Profile** (/profile) — Your public profile with stats, achievements, and activity
- **Settings** (/settings) — Account settings and preferences
- **Notifications** (/notifications) — Activity notifications (likes, follows, comments, achievements)
- **Messages** (/messages) — Direct messages and group chats
- **Friends** (/friends) — Your friends list
- **Onboarding** (/onboarding) — Set up your phases and interests if not completed
- **AI Hub** (/ai-hub) — Unified AI chat center with all AI assistants and chat history

Platform Concepts:
- **Phases**: Start (begin something new), Restart (return to paused goals), Explore (discover new interests)
- **XP System**: Earn XP for every activity, level up with increasing thresholds
- **Achievements**: Unlock bronze→silver→gold→platinum badges across 4 categories
- **Daily Quests**: Personalized challenges for bonus XP
- **Streaks**: Track consecutive active days
- **AI Assistants**: Each module has a specialized AI to help you

When a user asks where to find something or how to do something on the platform, give them clear navigation instructions with the page path.`,

      general: `You are SRE AI, a friendly self-growth assistant for the SRE (Start·Restart·Explore) platform. Help with learning, fitness, content creation, time management, and motivation.

Answer the user's question directly and completely. Provide detailed explanations when appropriate. Use short responses only for simple questions. For roadmap, educational, planning, fitness, productivity, technical, and content creation questions provide structured and complete answers. Prioritize usefulness over brevity.

You can help with:
- Learning and studying effectively
- Fitness planning and nutrition
- Content creation and strategy
- Time management and productivity
- Building consistent habits
- Motivation and overcoming setbacks
- Navigating the SRE platform features`,
    };

    const selectedPrompt = systemPrompts[agentType] || systemPrompts.general;

    // ── Load or create conversation (fully isolated try/catch) ──
    // This MUST NOT break AI responses even if DB tables are missing
    let conversation: any = null;
    let contextMessages: { role: string; content: string }[] = [];

    try {
      if (conversationId) {
        // Load existing conversation
        conversation = await db.conversation.findUnique({
          where: { id: conversationId },
          include: {
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 30, // Last 15 exchanges (30 messages)
            },
          },
        });

        if (conversation && conversation.userId === userId) {
          // Reverse to get chronological order (oldest first)
          contextMessages = [...conversation.messages].reverse().map((m: any) => ({
            role: m.role,
            content: m.content,
          }));
        }
      }

      // If no conversation found, check for recent conversation within 30 min
      if (!conversation) {
        const recentConv = await db.conversation.findFirst({
          where: {
            userId,
            aiAgentType: agentType,
            updatedAt: { gte: new Date(Date.now() - 30 * 60 * 1000) },
          },
          orderBy: { updatedAt: 'desc' },
          include: {
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 30,
            },
          },
        });

        if (recentConv) {
          conversation = recentConv;
          contextMessages = [...recentConv.messages].reverse().map((m: any) => ({
            role: m.role,
            content: m.content,
          }));
        }
      }
    } catch (dbLoadError) {
      // DB tables may not exist yet — continue without conversation context
      console.log('[AI Chatbot] DB conversation load failed (tables may not exist):', dbLoadError instanceof Error ? dbLoadError.message : 'unknown');
      // If client sent history, use it as fallback context
      if (Array.isArray(history) && history.length > 0) {
        contextMessages = history.slice(-30);
      }
    }

    // Build messages with context window (rolling 15 exchanges = 30 messages max)
    const messages = [
      ...contextMessages.slice(-30),
      { role: 'user', content: message },
    ];

    // ── Call AI — this is the critical path, must always work ──
    let reply: string;

    // Navigator bot: try instant local response first
    if (agentType === 'navigation') {
      const localReply = getNavigatorResponse(message);
      if (localReply) {
        reply = localReply;
      } else {
        // No local match — fall through to AI API with navigation prompt
        reply = await aiChat(messages, selectedPrompt);
      }
    } else {
      reply = await aiChat(messages, selectedPrompt);
    }

    // ── Save conversation (fully isolated try/catch) ──
    // This MUST NOT break the AI response even if DB save fails
    let savedConversationId = conversationId || null;

    try {
      if (conversation) {
        // Add messages to existing conversation
        await db.chatMessage.createMany({
          data: [
            { conversationId: conversation.id, role: 'user', content: message },
            { conversationId: conversation.id, role: 'assistant', content: reply },
          ],
        });

        // Generate title if this is the first message
        if (conversation.title === 'New Conversation') {
          const title = await generateTitle(message);
          await db.conversation.update({
            where: { id: conversation.id },
            data: { title, updatedAt: new Date() },
          });
        } else {
          await db.conversation.update({
            where: { id: conversation.id },
            data: { updatedAt: new Date() },
          });
        }

        savedConversationId = conversation.id;
      } else {
        // Create new conversation
        const title = await generateTitle(message);
        const newConv = await db.conversation.create({
          data: {
            userId,
            aiAgentType: agentType,
            title,
            messages: {
              create: [
                { role: 'user', content: message },
                { role: 'assistant', content: reply },
              ],
            },
          },
        });
        savedConversationId = newConv.id;
      }
    } catch (dbSaveError) {
      // DB save failed — try legacy ChatHistory as fallback
      console.log('[AI Chatbot] DB conversation save failed, trying legacy:', dbSaveError instanceof Error ? dbSaveError.message : 'unknown');
      try {
        const existingChat = await db.chatHistory.findFirst({
          where: { userId, botType: agentType },
          orderBy: { updatedAt: 'desc' },
        });

        if (existingChat) {
          const existingMessages = JSON.parse(existingChat.messages);
          const updatedMessages = [
            ...existingMessages,
            { role: 'user', content: message, timestamp: new Date().toISOString() },
            { role: 'assistant', content: reply, timestamp: new Date().toISOString() },
          ];
          await db.chatHistory.update({
            where: { id: existingChat.id },
            data: { messages: JSON.stringify(updatedMessages.slice(-200)), updatedAt: new Date() },
          });
          savedConversationId = savedConversationId || existingChat.id;
        } else {
          const newChat = await db.chatHistory.create({
            data: {
              userId,
              botType: agentType,
              messages: JSON.stringify([
                { role: 'user', content: message, timestamp: new Date().toISOString() },
                { role: 'assistant', content: reply, timestamp: new Date().toISOString() },
              ]),
            },
          });
          savedConversationId = savedConversationId || newChat.id;
        }
      } catch (legacyError) {
        // Even legacy save failed — AI response is still returned to user
        console.error('[AI Chatbot] Legacy chat history save also failed:', legacyError instanceof Error ? legacyError.message : 'unknown');
      }
    }

    return NextResponse.json({ reply, response: reply, conversationId: savedConversationId });
  } catch (error) {
    console.error('AI chatbot error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
