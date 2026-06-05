import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: Promise<{ groupId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { groupId } = await params;
  const userId = (session.user as any).id;
  const body = await req.json();
  const { action, targetUserId, value } = body;
  const group = await db.groupChat.findUnique({ where: { id: groupId }, include: { members: true } });
  if (!group) return NextResponse.json({ error: 'Group not found' }, { status: 404 });
  const member = group.members.find(m => m.userId === userId);
  if (!member || (member.role !== 'creator' && member.role !== 'admin')) return NextResponse.json({ error: 'Not authorized' }, { status: 403 });

  switch (action) {
    case 'appoint_admin':
      await db.groupChatMember.updateMany({ where: { groupId, userId: targetUserId }, data: { role: 'admin' } });
      break;
    case 'remove_admin':
      await db.groupChatMember.updateMany({ where: { groupId, userId: targetUserId }, data: { role: 'member' } });
      break;
    case 'kick_member':
      if (member.role !== 'creator') return NextResponse.json({ error: 'Only creator can kick' }, { status: 403 });
      await db.groupChatMember.deleteMany({ where: { groupId, userId: targetUserId } });
      break;
    case 'change_visibility':
      await db.groupChat.update({ where: { id: groupId }, data: { isPublic: value } });
      break;
    case 'change_message_access':
      await db.groupChat.update({ where: { id: groupId }, data: { messageAccess: value } });
      break;
    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}
