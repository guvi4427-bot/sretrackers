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

    const existing = await db.liveUpdateBookmark.findUnique({
      where: { entityType_entityId_userId: { entityType, entityId: updateId, userId: session.user.id } },
    });

    if (existing) {
      return NextResponse.json({ bookmarked: true, id: existing.id });
    }

    const bookmark = await db.liveUpdateBookmark.create({
      data: { entityType, entityId: updateId, userId: session.user.id },
    });

    return NextResponse.json({ bookmarked: true, id: bookmark.id });
  } catch (error) {
    console.error('POST /api/live-updates/[updateId]/bookmark error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
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

    await db.liveUpdateBookmark.deleteMany({
      where: { entityType, entityId: updateId, userId: session.user.id },
    });

    return NextResponse.json({ bookmarked: false });
  } catch (error) {
    console.error('DELETE /api/live-updates/[updateId]/bookmark error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
