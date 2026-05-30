import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserId } from '@/lib/auth-helper';

export async function GET(request: Request) {
  try {
    const userId = await getUserId();
    const { searchParams } = new URL(request.url);
    const phase = searchParams.get('phase');

    const where: any = { userId };
    if (phase) where.phase = phase;

    const topics = await db.learningTopic.findMany({
      where,
      include: {
        _count: { select: { entries: true, flags: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ topics });
  } catch (error) {
    console.error('Learning topics GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch topics' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    const body = await request.json();
    const { name, phase, isSharedCollection, collectionVisibility } = body;

    if (!name) {
      return NextResponse.json({ error: 'Topic name required' }, { status: 400 });
    }

    const topic = await db.learningTopic.create({
      data: {
        userId,
        name,
        phase: phase || null,
        isSharedCollection: isSharedCollection || false,
        collectionVisibility: collectionVisibility || 'public',
        sharedAt: isSharedCollection ? new Date() : null,
      },
    });

    return NextResponse.json({ topic }, { status: 201 });
  } catch (error) {
    console.error('Learning topic POST error:', error);
    return NextResponse.json({ error: 'Failed to create topic' }, { status: 500 });
  }
}
