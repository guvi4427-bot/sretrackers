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
  const member = group.members.find(m => m.userId === userId);
  if (!member) return NextResponse.json({ error: 'Not a member' }, { status: 400 });
  if (member.role === 'creator') return NextResponse.json({ error: 'Creator cannot leave, must disband' }, { status: 400 });
  await db.groupChatMember.deleteMany({ where: { groupId, userId } });
  return NextResponse.json({ success: true });
}
