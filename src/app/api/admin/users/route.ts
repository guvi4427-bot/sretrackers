import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, logAudit, SUPER_ADMIN_EMAIL } from '@/lib/admin-auth';

export async function GET(request: Request) {
  try {
    const adminCheck = await requireAdmin();
    if ('error' in adminCheck) return NextResponse.json({ error: adminCheck.error!.message }, { status: adminCheck.error!.status });

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { email: { contains: search } },
        { username: { contains: search } },
        { profile: { name: { contains: search } } },
      ];
    }
    if (status) {
      where.profile = { ...(where.profile as object || {}), accessStatus: status };
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        include: { profile: true, adminRole: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.user.count({ where }),
    ]);

    return NextResponse.json({
      users: users.map((u) => ({
        id: u.id,
        email: u.email,
        phone: u.phone,
        username: u.username,
        createdAt: u.createdAt,
        profile: u.profile
          ? {
              name: u.profile.name,
              avatarUrl: u.profile.avatarUrl,
              xp: u.profile.xp,
              level: u.profile.level,
              accessStatus: u.profile.accessStatus,
              verified: u.profile.verified,
              currentStreak: u.profile.currentStreak,
              activePhases: u.profile.activePhases,
              phaseActivityMap: u.profile.phaseActivityMap,
              isPublic: u.profile.isPublic,
              onboardingComplete: u.profile.onboardingComplete,
            }
          : null,
        adminRole: u.adminRole ? { isSuperAdmin: u.adminRole.isSuperAdmin } : null,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Admin users list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const adminCheck = await requireAdmin();
    if ('error' in adminCheck) return NextResponse.json({ error: adminCheck.error!.message }, { status: adminCheck.error!.status });

    const body = await request.json();
    const { userId, action, adminNote } = body;

    if (!userId || !action) {
      return NextResponse.json({ error: 'userId and action are required' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      include: { profile: true, adminRole: true },
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const isSuperAdmin = adminCheck.data.isSuperAdmin;
    const isTargetSuperAdmin = user.adminRole?.isSuperAdmin || user.email === SUPER_ADMIN_EMAIL;

    // Admins can perform ban/suspend/activate/verify/unverify on ALL users including super admins
    // Only restriction: admins cannot delete super admins or modify super admin access (promote/demote)
    if (isTargetSuperAdmin && !isSuperAdmin) {
      // Non-super-admin cannot delete a super admin
      if (action === 'delete') {
        return NextResponse.json({ error: 'Only super admin can delete a super admin' }, { status: 403 });
      }
      // Non-super-admin cannot modify access of a super admin (promote/demote)
      if (['promote_super_admin', 'demote_super_admin', 'promote_admin', 'demote_admin'].includes(action)) {
        return NextResponse.json({ error: 'Only super admin can modify super admin access' }, { status: 403 });
      }
      // All other actions (ban, suspend, activate, verify, unverify) are allowed for admins on super admins
    }

    const validActions = ['suspend', 'ban', 'activate', 'verify', 'unverify', 'promote_admin', 'promote_super_admin', 'demote_admin', 'demote_super_admin'];
    if (!validActions.includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const statusMap: Record<string, string> = { suspend: 'suspended', ban: 'banned', activate: 'active' };
    if (action in statusMap) {
      await db.profile.update({ where: { userId }, data: { accessStatus: statusMap[action] } });
    }

    if (action === 'verify') {
      await db.profile.update({ where: { userId }, data: { verified: true } });
    }
    if (action === 'unverify') {
      await db.profile.update({ where: { userId }, data: { verified: false } });
    }

    if (action === 'promote_admin') {
      const existing = await db.adminRole.findUnique({ where: { userId } });
      if (!existing) {
        await db.adminRole.create({ data: { userId, email: user.email, appointedById: adminCheck.data.session.user.id, isSuperAdmin: false } });
      }
    }

    if (action === 'promote_super_admin') {
      const existing = await db.adminRole.findUnique({ where: { userId } });
      if (existing) {
        await db.adminRole.update({ where: { userId }, data: { isSuperAdmin: true } });
      } else {
        await db.adminRole.create({ data: { userId, email: user.email, appointedById: adminCheck.data.session.user.id, isSuperAdmin: true } });
      }
    }

    if (action === 'demote_admin') {
      const existing = await db.adminRole.findUnique({ where: { userId } });
      if (existing && !existing.isSuperAdmin) {
        await db.adminRole.delete({ where: { userId } });
      }
    }

    if (action === 'demote_super_admin') {
      const existing = await db.adminRole.findUnique({ where: { userId } });
      if (existing && existing.isSuperAdmin) {
        await db.adminRole.update({ where: { userId }, data: { isSuperAdmin: false } });
      }
    }

    await logAudit(adminCheck.data.session.user.id, `user_${action}`, userId, {
      targetEmail: user.email,
      adminNote: adminNote || null,
    });

    return NextResponse.json({ success: true, action });
  } catch (error) {
    console.error('Admin user update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const adminCheck = await requireAdmin();
    if ('error' in adminCheck) return NextResponse.json({ error: adminCheck.error!.message }, { status: adminCheck.error!.status });

    // Admins can delete users, but not super admins (checked below)
    // No super-admin-only gate here — any admin can delete non-super-admin users

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) return NextResponse.json({ error: 'userId is required' }, { status: 400 });

    const user = await db.user.findUnique({ where: { id: userId }, include: { adminRole: true } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const isTargetSuperAdmin = user.adminRole?.isSuperAdmin || user.email === SUPER_ADMIN_EMAIL;
    if (isTargetSuperAdmin && !adminCheck.data.isSuperAdmin) {
      return NextResponse.json({ error: 'Only super admin can delete a super admin' }, { status: 403 });
    }

    await logAudit(adminCheck.data.session.user.id, 'user_deleted', userId, { targetEmail: user.email });
    await db.user.delete({ where: { id: userId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin user delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
