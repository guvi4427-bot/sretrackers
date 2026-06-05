import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { awardXP, updateStreak, reverseXP } from '@/lib/xp';

const VALID_STATUSES = ['pending', 'in_progress', 'completed', 'partially_completed', 'missed'];
const TASK_XP = 20; // base XP for a completed task
const PARTIAL_XP_PERCENT = 0.6; // 60% for partially completed

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const status = searchParams.get('status');
    const category = searchParams.get('category');

    const where: Record<string, unknown> = { userId: session.user.id, date };
    if (status) where.status = status;
    if (category) where.category = category;

    const tasks = await db.timeTask.findMany({
      where,
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('GET /api/time/tasks error:', error);
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
    const { title, description, category, priority, isProductive, date, fromTime, toTime } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const taskDate = date || new Date().toISOString().split('T')[0];

    // Only allow today or tomorrow
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    if (taskDate !== today && taskDate !== tomorrow) {
      return NextResponse.json({ error: 'Tasks can only be scheduled for today or tomorrow' }, { status: 400 });
    }

    const maxOrderTask = await db.timeTask.findFirst({
      where: { userId: session.user.id, date: taskDate },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const task = await db.timeTask.create({
      data: {
        userId: session.user.id,
        title,
        description: description || null,
        category: category || null,
        priority: priority || 'medium',
        isProductive: isProductive !== undefined ? isProductive : true,
        fromTime: fromTime || null,
        toTime: toTime || null,
        date: taskDate,
        order: (maxOrderTask?.order ?? -1) + 1,
      },
    });

    await updateStreak(session.user.id);

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error('POST /api/time/tasks error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    const { id, status, priority, order, reflectionNote } = body;

    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    const existing = await db.timeTask.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const data: Record<string, unknown> = {};
    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      data.status = status;
    }
    if (priority !== undefined) data.priority = priority;
    if (order !== undefined) data.order = order;
    if (reflectionNote !== undefined) data.reflectionNote = reflectionNote;

    let xpResult: { awarded: number; reason: string } | null = null;

    // ── Execution-Based XP System ──
    // Award XP ONLY when status changes to a terminal state (completed/partial/missed)
    // AND only if XP has never been awarded for this task before (xpAwarded === false)
    if (status && status !== existing.status && !existing.xpAwarded) {
      if (status === 'completed') {
        data.completedAt = new Date();
        data.xpAwarded = true;
        await awardXP(session.user.id, 'task', 'Task completed: ' + existing.title);
        xpResult = { awarded: TASK_XP, reason: 'Task completed' };
      } else if (status === 'partially_completed') {
        data.completedAt = new Date();
        data.xpAwarded = true;
        const partialXP = Math.round(TASK_XP * PARTIAL_XP_PERCENT);
        await awardXP(session.user.id, 'task', 'Task partially completed: ' + existing.title);
        // The awardXP uses XP_REWARDS.task = 20, but we want 60% = 12
        // Reverse the 20 and award the correct 12
        await reverseXP(session.user.id, TASK_XP - partialXP, 'Partial completion adjustment: ' + existing.title);
        xpResult = { awarded: partialXP, reason: 'Task partially completed (60%)' };
      } else if (status === 'missed') {
        data.xpAwarded = true; // Mark as processed — no XP for missed
        xpResult = { awarded: 0, reason: 'Task missed — no XP' };
      }
    }

    const task = await db.timeTask.update({
      where: { id },
      data,
    });

    return NextResponse.json({ task, xp: xpResult });
  } catch (error) {
    console.error('PATCH /api/time/tasks error:', error);
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
        id = body.id || body.resetAll ? null : null;
        if (body.resetAll) {
          await db.timeTask.deleteMany({ where: { userId: session.user.id } });
          return NextResponse.json({ success: true });
        }
        id = body.id;
      } catch {}
    }

    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    const existing = await db.timeTask.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Reverse XP if task had XP awarded
    if (existing.xpAwarded && existing.status === 'completed') {
      await reverseXP(session.user.id, TASK_XP, `Deleted completed task: ${existing.title}`);
    } else if (existing.xpAwarded && existing.status === 'partially_completed') {
      const partialXP = Math.round(TASK_XP * PARTIAL_XP_PERCENT);
      await reverseXP(session.user.id, partialXP, `Deleted partially completed task: ${existing.title}`);
    }

    await db.timeTask.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/time/tasks error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
