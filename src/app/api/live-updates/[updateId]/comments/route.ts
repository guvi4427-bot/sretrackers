import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { rejectGuest } from '@/lib/auth-helper';

// Map frontend entity types to valid Prisma values
const VALID_ENTITY_TYPES = ['content_entry', 'fitness_workout', 'fitness_weight', 'learning_topic'] as const;
type EntityType = typeof VALID_ENTITY_TYPES[number];

function getEntityType(type: string): EntityType | null {
  if (VALID_ENTITY_TYPES.includes(type as EntityType)) return type as EntityType;
  if (type === 'content') return 'content_entry';
  if (type === 'workout') return 'fitness_workout';
  if (type === 'weight') return 'fitness_weight';
  if (type === 'learning') return 'learning_topic';
  return null;
}

// GET /api/live-updates/[updateId]/comments?entityType=learning_topic
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ updateId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { updateId } = await params;

    const { searchParams } = new URL(req.url);
    const entityTypeParam = searchParams.get('entityType') || 'content_entry';
    const entityType = getEntityType(entityTypeParam);
    if (!entityType) {
      return NextResponse.json({ error: 'Invalid entity type' }, { status: 400 });
    }

    const comments = await db.liveUpdateComment.findMany({
      where: { entityType, entityId: updateId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profile: { select: { name: true, avatarUrl: true, verified: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error('GET /api/live-updates/[updateId]/comments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/live-updates/[updateId]/comments — create a comment
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ updateId: string }> }
) {
  const guestRejected = rejectGuest(req); if (guestRejected) return guestRejected;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { updateId } = await params;

    const { searchParams } = new URL(req.url);
    const entityTypeParam = searchParams.get('entityType') || 'content_entry';
    const entityType = getEntityType(entityTypeParam);
    if (!entityType) {
      return NextResponse.json({ error: 'Invalid entity type' }, { status: 400 });
    }

    const body = await req.json();
    const content = (body.content || '').trim();
    if (!content) {
      return NextResponse.json({ error: 'Comment cannot be empty' }, { status: 400 });
    }

    const comment = await db.liveUpdateComment.create({
      data: { entityType, entityId: updateId, userId: session.user.id, content },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profile: { select: { name: true, avatarUrl: true, verified: true } },
          },
        },
      },
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error('POST /api/live-updates/[updateId]/comments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
