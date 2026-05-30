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

    let comment: string | null = null;
    try {
      const body = await req.json();
      comment = body.comment || null;
    } catch {
      // No body provided, that's fine
    }

    const existing = await db.liveUpdateRepost.findUnique({
      where: { entityType_entityId_userId: { entityType, entityId: updateId, userId: session.user.id } },
    });

    if (existing) {
      return NextResponse.json({ reposted: true, id: existing.id });
    }

    const repost = await db.liveUpdateRepost.create({
      data: { entityType, entityId: updateId, userId: session.user.id, comment: comment || null },
    });

    return NextResponse.json({ reposted: true, id: repost.id });
  } catch (error) {
    console.error('POST /api/live-updates/[updateId]/repost error:', error);
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

    await db.liveUpdateRepost.deleteMany({
      where: { entityType, entityId: updateId, userId: session.user.id },
    });

    return NextResponse.json({ reposted: false });
  } catch (error) {
    console.error('DELETE /api/live-updates/[updateId]/repost error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
