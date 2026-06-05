import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const groups = await db.groupChat.findMany({
      where: {
        members: { some: { userId: session.user.id } },
      },
      include: {
        members: {
          select: {
            userId: true,
            role: true,
            user: {
              select: { id: true, username: true, profile: { select: { name: true, avatarUrl: true } } },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { content: true, createdAt: true, sender: { select: { username: true } } },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const formatted = groups.map(g => ({
      id: g.id,
      name: g.name,
      description: g.description,
      isPublic: g.isPublic,
      messageAccess: g.messageAccess,
      memberCount: g.members.length,
      members: g.members.map(m => ({
        userId: m.userId,
        username: m.user.username,
        name: m.user.profile?.name || m.user.username,
        avatarUrl: m.user.profile?.avatarUrl,
        role: m.role,
      })),
      lastMessage: g.messages[0] ? {
        content: g.messages[0].content,
        sender: g.messages[0].sender.username,
        createdAt: g.messages[0].createdAt,
      } : null,
    }));

    return NextResponse.json({ groups: formatted });
  } catch (error) {
    console.error('GET /api/groups error:', error);
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
    const { name, description, isPublic } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Group name is required' }, { status: 400 });
    }

    const group = await db.groupChat.create({
      data: {
        name: name.trim(),
        description: description || null,
        isPublic: isPublic !== false,
        createdBy: session.user.id,
        members: {
          create: { userId: session.user.id, role: 'creator' },
        },
      },
      include: {
        members: {
          select: { userId: true, role: true },
        },
      },
    });

    return NextResponse.json({ group }, { status: 201 });
  } catch (error) {
    console.error('POST /api/groups error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
