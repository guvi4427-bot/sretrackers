import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: Promise<{ groupId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { groupId } = await params;
  const userId = (session.user as any).id;
  const group = await db.groupChat.findUnique({ where: { id: groupId }, include: { members: true } });
  if (!group) return NextResponse.json({ error: 'Group not found' }, { status: 404 });
  if (!group.isPublic) return NextResponse.json({ error: 'Group is private' }, { status: 403 });
  const existing = group.members.find(m => m.userId === userId);
  if (existing) return NextResponse.json({ error: 'Already a member' }, { status: 400 });
  await db.groupChatMember.create({ data: { groupId, userId, role: 'member' } });
  return NextResponse.json({ success: true });
}
