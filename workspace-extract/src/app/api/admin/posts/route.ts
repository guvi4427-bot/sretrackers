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
      db.postReport.findMany({
        where,
        include: {
          reporter: { include: { profile: true } },
          post: {
            include: {
              user: { include: { profile: true } },
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.postReport.count({ where }),
    ]);

    return NextResponse.json({
      reports: reports.map((r) => ({
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
          id: r.post.user.id,
          name: r.post.user.profile?.name || r.post.user.username,
          avatarUrl: r.post.user.profile?.avatarUrl,
        },
        post: {
          id: r.post.id,
          content: r.post.content.slice(0, 200),
        },
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Admin post reports error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const adminCheck = await requireAdmin();
    if ('error' in adminCheck) return NextResponse.json({ error: adminCheck.error!.message }, { status: adminCheck.error!.status });

    const body = await request.json();
    const { reportId, status, adminNote } = body;

    if (!reportId || !status) {
      return NextResponse.json({ error: 'reportId and status are required' }, { status: 400 });
    }

    if (!['dismissed', 'actioned'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status. Use dismissed or actioned' }, { status: 400 });
    }

    const report = await db.postReport.update({
      where: { id: reportId },
      data: {
        status,
        reviewedBy: adminCheck.data.session.user.id,
        adminNote: adminNote || null,
      },
    });

    await logAudit(adminCheck.data.session.user.id, `post_report_${status}`, reportId, {
      postId: report.postId,
      adminNote: adminNote || null,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin post report review error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
