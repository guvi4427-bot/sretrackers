import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { awardXP, updateStreak, reverseXP } from '@/lib/xp';

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
    const { id, status, priority, order } = body;

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
    if (status !== undefined) data.status = status;
    if (priority !== undefined) data.priority = priority;
    if (order !== undefined) data.order = order;

    // Award XP when completing a task
    if (status === 'completed' && existing.status !== 'completed') {
      data.completedAt = new Date();
      await awardXP(session.user.id, 'social', 'Task completed: ' + existing.title);
    }

    const task = await db.timeTask.update({
      where: { id },
      data,
    });

    return NextResponse.json({ task });
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

    // Reverse XP if task was completed (5 XP for task completion)
    if (existing.status === 'completed') {
      await reverseXP(session.user.id, 5, `Deleted completed task: ${existing.title}`);
    }

    await db.timeTask.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/time/tasks error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
