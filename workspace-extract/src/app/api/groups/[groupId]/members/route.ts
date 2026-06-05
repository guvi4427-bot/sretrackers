import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ groupId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { groupId } = await params;
  const members = await db.groupChatMember.findMany({ where: { groupId }, include: { user: { include: { profile: true } } }, orderBy: { joinedAt: 'asc' } });
  return NextResponse.json(members.map(m => ({ id: m.id, userId: m.userId, role: m.role, joinedAt: m.joinedAt, name: m.user.profile?.name || m.user.username, avatarUrl: m.user.profile?.avatarUrl, verified: m.user.profile?.verified || false })));
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ groupId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { groupId } = await params;
  const userId = (session.user as any).id;
  const body = await req.json();
  const { userIds } = body;
  const group = await db.groupChat.findUnique({ where: { id: groupId }, include: { members: true } });
  if (!group) return NextResponse.json({ error: 'Group not found' }, { status: 404 });
  const member = group.members.find(m => m.userId === userId);
  if (!member || (member.role !== 'creator' && member.role !== 'admin')) return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  const existingIds = group.members.map(m => m.userId);
  const newIds = (userIds || []).filter((id: string) => !existingIds.includes(id) && id !== userId);
  if (newIds.length === 0) return NextResponse.json({ message: 'No new members to add' });
  await db.groupChatMember.createMany({ data: newIds.map((id: string) => ({ groupId, userId: id, role: 'member' })) });
  return NextResponse.json({ success: true, addedCount: newIds.length });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ groupId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { groupId } = await params;
  const userId = (session.user as any).id;
  const body = await req.json();
  const { targetUserId } = body;
  const group = await db.groupChat.findUnique({ where: { id: groupId }, include: { members: true } });
  if (!group) return NextResponse.json({ error: 'Group not found' }, { status: 404 });
  const member = group.members.find(m => m.userId === userId);
  if (!member || (member.role !== 'creator' && member.role !== 'admin')) return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  await db.groupChatMember.deleteMany({ where: { groupId, userId: targetUserId } });
  return NextResponse.json({ success: true });
}
