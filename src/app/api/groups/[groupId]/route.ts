import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { groupId } = await params;

    const group = await db.groupChat.findUnique({
      where: { id: groupId },
      include: {
        members: {
          select: {
            userId: true, role: true, joinedAt: true,
            user: {
              select: { id: true, username: true, profile: { select: { name: true, avatarUrl: true } } },
            },
          },
        },
      },
    });

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    const isMember = group.members.some(m => m.userId === session.user.id);
    if (!isMember && !group.isPublic) {
      return NextResponse.json({ error: 'Not a member' }, { status: 403 });
    }

    return NextResponse.json({
      group: {
        id: group.id,
        name: group.name,
        description: group.description,
        isPublic: group.isPublic,
        messageAccess: group.messageAccess,
        createdBy: group.createdBy,
        members: group.members.map(m => ({
          userId: m.userId,
          username: m.user.username,
          name: m.user.profile?.name || m.user.username,
          avatarUrl: m.user.profile?.avatarUrl,
          role: m.role,
          joinedAt: m.joinedAt,
        })),
      },
    });
  } catch (error) {
    console.error('GET /api/groups/[groupId] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { groupId } = await params;
    const body = await req.json();
    const { name, description, isPublic } = body;

    const group = await db.groupChat.findUnique({ where: { id: groupId } });
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    const member = await db.groupChatMember.findFirst({
      where: { groupId, userId: session.user.id, role: { in: ['creator', 'admin'] } },
    });
    if (!member) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const updated = await db.groupChat.update({
      where: { id: groupId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(isPublic !== undefined && { isPublic }),
      },
    });

    return NextResponse.json({ group: updated });
  } catch (error) {
    console.error('PATCH /api/groups/[groupId] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { groupId } = await params;

    const group = await db.groupChat.findUnique({ where: { id: groupId } });
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }
    if (group.createdBy !== session.user.id) {
      return NextResponse.json({ error: 'Only creator can delete' }, { status: 403 });
    }

    await db.groupChat.delete({ where: { id: groupId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/groups/[groupId] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
