import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET(request: Request) {
  try {
    const adminCheck = await requireAdmin();
    if ('error' in adminCheck) return NextResponse.json({ error: adminCheck.error!.message }, { status: adminCheck.error!.status });

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const action = searchParams.get('action') || '';

    const where: Record<string, unknown> = {};
    if (action) where.action = { contains: action };

    const [logs, total] = await Promise.all([
      db.auditLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.auditLog.count({ where }),
    ]);

    // Get admin info
    const adminIds = [...new Set(logs.map((l) => l.adminId))];
    const admins = await db.user.findMany({
      where: { id: { in: adminIds } },
      include: { profile: true },
    });

    const logsWithAdmin = logs.map((log) => {
      const admin = admins.find((a) => a.id === log.adminId);
      return {
        id: log.id,
        action: log.action,
        targetUserId: log.targetUserId,
        details: log.details,
        createdAt: log.createdAt,
        admin: {
          id: admin?.id,
          name: admin?.profile?.name || admin?.username || 'Unknown',
          email: admin?.email,
        },
      };
    });

    return NextResponse.json({
      logs: logsWithAdmin,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Admin audit log error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
