import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { awardXP, updateStreak, reverseXP } from '@/lib/xp';

function localDateStr(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');

    const where: Record<string, unknown> = { userId: session.user.id };
    if (date) where.date = date;

    const sessions = await db.focusSession.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('GET /api/time/focus error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    const { taskName, duration, completed, date } = body;

    if (!taskName || !duration) {
      return NextResponse.json({ error: 'Task name and duration are required' }, { status: 400 });
    }

    const sessionDate = date || localDateStr();
    const isCompleted = completed !== false;

    const focusSession = await db.focusSession.create({
      data: {
        userId: session.user.id,
        taskName,
        duration,
        completed: isCompleted,
        date: sessionDate,
        startedAt: new Date(),
        endedAt: isCompleted ? new Date() : null,
      },
    });

    // Award 20 XP for completed focus session
    if (isCompleted) {
      await awardXP(session.user.id, 'focus', `Focus session: ${taskName} (${duration} min)`);
      await updateStreak(session.user.id);
    }

    return NextResponse.json({ session: focusSession }, { status: 201 });
  } catch (error) {
    console.error('POST /api/time/focus error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let id: string | null = null;
    const { searchParams } = new URL(req.url);
    id = searchParams.get('id');

    // Also accept id from body for client-side compatibility
    if (!id) {
      try {
        const body = await req.json();
        id = body.id;
      } catch {}
    }

    if (!id) {
      return NextResponse.json({ error: 'Focus session ID is required' }, { status: 400 });
    }

    const existing = await db.focusSession.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Focus session not found' }, { status: 404 });
    }

    // Reverse XP if focus session was completed (20 XP for focus)
    if (existing.completed) {
      await reverseXP(session.user.id, 20, `Deleted focus session: ${existing.taskName}`);
    }

    await db.focusSession.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/time/focus error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
