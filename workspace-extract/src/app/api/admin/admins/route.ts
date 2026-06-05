import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, logAudit, SUPER_ADMIN_EMAIL } from '@/lib/admin-auth';

export async function GET() {
  try {
    const adminCheck = await requireAdmin();
    if ('error' in adminCheck) return NextResponse.json({ error: adminCheck.error!.message }, { status: adminCheck.error!.status });

    const admins = await db.adminRole.findMany({
      include: {
        user: { include: { profile: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({
      admins: admins.map((a) => ({
        id: a.id,
        userId: a.userId,
        email: a.email,
        isSuperAdmin: a.isSuperAdmin || a.email === SUPER_ADMIN_EMAIL,
        appointedById: a.appointedById,
        createdAt: a.createdAt,
        user: {
          name: a.user.profile?.name || a.user.username,
          avatarUrl: a.user.profile?.avatarUrl,
        },
      })),
    });
  } catch (error) {
    console.error('Admin list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const adminCheck = await requireAdmin();
    if ('error' in adminCheck) return NextResponse.json({ error: adminCheck.error!.message }, { status: adminCheck.error!.status });

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'email is required' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email },
      include: { adminRole: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.adminRole) {
      return NextResponse.json({ error: 'User is already an admin' }, { status: 400 });
    }

    const adminRole = await db.adminRole.create({
      data: {
        userId: user.id,
        email: user.email,
        appointedById: adminCheck.data.session.user.id,
        isSuperAdmin: false,
      },
    });

    await logAudit(adminCheck.data.session.user.id, 'promote_to_admin', user.id, {
      promotedEmail: user.email,
    });

    return NextResponse.json({ success: true, adminRole });
  } catch (error) {
    console.error('Admin promote error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const adminCheck = await requireAdmin();
    if ('error' in adminCheck) return NextResponse.json({ error: adminCheck.error!.message }, { status: adminCheck.error!.status });

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const targetAdmin = await db.adminRole.findUnique({
      where: { userId },
    });

    if (!targetAdmin) {
      return NextResponse.json({ error: 'Admin role not found' }, { status: 404 });
    }

    // Only super admin can demote super admin
    if (targetAdmin.email === SUPER_ADMIN_EMAIL || targetAdmin.isSuperAdmin) {
      if (!adminCheck.data.isSuperAdmin) {
        return NextResponse.json({ error: 'Only super-admins can demote super-admin' }, { status: 403 });
      }
      return NextResponse.json({ error: 'Cannot demote super-admin' }, { status: 403 });
    }

    // Regular admins CAN demote other regular admins
    await db.adminRole.delete({
      where: { userId },
    });

    await logAudit(adminCheck.data.session.user.id, 'demote_admin', userId, {
      demotedEmail: targetAdmin.email,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin demote error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
