import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, logAudit } from '@/lib/admin-auth';

export async function GET(request: Request) {
  try {
    const adminCheck = await requireAdmin();
    if ('error' in adminCheck) return NextResponse.json({ error: adminCheck.error!.message }, { status: adminCheck.error!.status });

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || '';

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const [reports, total] = await Promise.all([
      db.report.findMany({
        where,
        include: {
          reporter: { include: { profile: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.report.count({ where }),
    ]);

    // Fetch reported users separately
    const reportedUserIds = [...new Set(reports.map(r => r.reportedUserId))];
    const reportedUsers = await db.user.findMany({
      where: { id: { in: reportedUserIds } },
      include: { profile: true },
    });

    return NextResponse.json({
      reports: reports.map((r) => {
        const reportedUser = reportedUsers.find(u => u.id === r.reportedUserId);
        return {
          id: r.id,
          category: r.category,
          reason: r.reason,
          status: r.status,
          adminNote: r.adminNote,
          reviewedBy: r.reviewedBy,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
          reporter: {
            id: r.reporter.id,
            name: r.reporter.profile?.name || r.reporter.username,
            avatarUrl: r.reporter.profile?.avatarUrl,
          },
          reportedUser: {
            id: r.reportedUserId,
            name: reportedUser?.profile?.name || reportedUser?.username || 'Unknown',
            avatarUrl: reportedUser?.profile?.avatarUrl,
            email: reportedUser?.email,
            accessStatus: reportedUser?.profile?.accessStatus || 'active',
          },
        };
      }),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Admin user reports error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const adminCheck = await requireAdmin();
    if ('error' in adminCheck) return NextResponse.json({ error: adminCheck.error!.message }, { status: adminCheck.error!.status });

    const body = await request.json();
    const { reportId, status, adminNote, action } = body;

    if (!reportId || !status) {
      return NextResponse.json({ error: 'reportId and status are required' }, { status: 400 });
    }

    if (!['dismissed', 'actioned'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status. Use dismissed or actioned' }, { status: 400 });
    }

    const report = await db.report.update({
      where: { id: reportId },
      data: {
        status,
        reviewedBy: adminCheck.data.session.user.id,
        adminNote: adminNote || null,
      },
    });

    // If actioning a user report, optionally take action on the reported user
    if (status === 'actioned' && action && report.reportedUserId) {
      const statusMap: Record<string, string> = { suspend: 'suspended', ban: 'banned' };
      if (statusMap[action]) {
        await db.profile.update({
          where: { userId: report.reportedUserId },
          data: { accessStatus: statusMap[action] },
        });
      }
    }

    await logAudit(adminCheck.data.session.user.id, `user_report_${status}`, report.reportedUserId, {
      reportId,
      action: action || null,
      adminNote: adminNote || null,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin user report review error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
