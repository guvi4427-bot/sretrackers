import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { calculateLevel } from '@/lib/gamification';

const QUEST_TEMPLATES = [
  { title: 'Log a learning entry', category: 'learning', xpReward: 10 },
  { title: 'Complete a workout', category: 'fitness', xpReward: 15 },
  { title: 'Log a meal', category: 'fitness', xpReward: 5 },
  { title: 'Start a focus session', category: 'time', xpReward: 20 },
  { title: 'Create a content entry', category: 'content', xpReward: 10 },
  { title: 'Make a post', category: 'social', xpReward: 5 },
  { title: 'Review your day', category: 'time', xpReward: 10 },
  { title: 'Update your profile', category: 'social', xpReward: 5 },
];

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date().toISOString().split('T')[0];

    // Check if quests exist for today
    let quests = await db.userQuest.findMany({
      where: { userId: session.user.id, date: today },
    });

    // Generate daily quests if none exist
    if (quests.length === 0) {
      const shuffled = [...QUEST_TEMPLATES].sort(() => Math.random() - 0.5);
      const dailyQuests = shuffled.slice(0, 5);

      quests = await db.$transaction(
        dailyQuests.map((q) =>
          db.userQuest.create({
            data: {
              userId: session.user.id,
              title: q.title,
              category: q.category,
              xpReward: q.xpReward,
              date: today,
            },
          })
        )
      );
    }

    return NextResponse.json({
      quests: quests.map((q) => ({
        id: q.id,
        title: q.title,
        description: q.description,
        category: q.category,
        xpReward: q.xpReward,
        completed: q.completed,
        date: q.date,
      })),
    });
  } catch (error) {
    console.error('Quests GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { questId } = body;

    if (!questId) {
      return NextResponse.json({ error: 'questId is required' }, { status: 400 });
    }

    const quest = await db.userQuest.findUnique({
      where: { id: questId },
    });

    if (!quest) {
      return NextResponse.json({ error: 'Quest not found' }, { status: 404 });
    }

    if (quest.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not your quest' }, { status: 403 });
    }

    // Early check outside transaction for fast rejection
    if (quest.completed) {
      return NextResponse.json({ error: 'Quest already completed' }, { status: 400 });
    }

    // Complete quest and award XP inside transaction to prevent double-claim
    const result = await db.$transaction(async (tx) => {
      // Re-fetch inside transaction to ensure atomicity (prevents race condition)
      const freshQuest = await tx.userQuest.findUnique({ where: { id: questId } });
      if (!freshQuest || freshQuest.completed) {
        return null; // Already completed by another request
      }

      const completed = await tx.userQuest.update({
        where: { id: questId },
        data: { completed: true },
      });

      await tx.xPGain.create({
        data: {
          userId: session.user.id,
          amount: freshQuest.xpReward,
          reason: `Completed quest: ${freshQuest.title}`,
          category: 'quest',
        },
      });

      const profile = await tx.profile.findUnique({ where: { userId: session.user.id } });
      if (!profile) throw new Error('Profile not found');

      const newXP = profile.xp + freshQuest.xpReward;
      const newLevel = calculateLevel(newXP);

      const updated = await tx.profile.update({
        where: { userId: session.user.id },
        data: { xp: newXP, level: newLevel },
      });

      return { completed, updated, xpReward: freshQuest.xpReward } as const;
    });

    if (!result) {
      return NextResponse.json({ error: 'Quest already completed' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      quest: { id: result.completed.id, completed: result.completed.completed },
      xpAwarded: result.xpReward,
      newTotal: result.updated.xp,
      newLevel: result.updated.level,
    });
  } catch (error) {
    console.error('Quest complete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
