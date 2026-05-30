import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const now = new Date();
    const sevenDaysAgo = new Date(now); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const fourteenDaysAgo = new Date(now); fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const recentEntries = await db.learningEntry.count({ where: { userId: session.user.id, createdAt: { gte: sevenDaysAgo } } });
    const previousEntries = await db.learningEntry.count({ where: { userId: session.user.id, createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } } });

    const shouldWarn = recentEntries < previousEntries * 0.5;
    const message = shouldWarn
      ? `Your learning activity has dropped significantly. You had ${previousEntries} entries last week but only ${recentEntries} this week. Try setting a small daily goal to get back on track!`
      : recentEntries > 0
      ? `Good progress! ${recentEntries} learning entries this week. Keep it up!`
      : `No learning entries this week. Start with just 10 minutes today!`;

    return NextResponse.json({ shouldWarn, message, recentEntries, previousEntries });
  } catch (error) {
    console.error('Progress check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
