import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, logAudit } from '@/lib/admin-auth';

export async function GET() {
  try {
    const adminCheck = await requireAdmin();
    if ('error' in adminCheck) {
      return NextResponse.json({ error: adminCheck.error!.message }, { status: adminCheck.error!.status });
    }

    const totalUsers = await db.user.count();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const activeUsers = await db.user.count({
      where: {
        profile: {
          lastActiveDate: { gte: sevenDaysAgo.toISOString().split('T')[0] },
        },
      },
    });

    const suspendedUsers = await db.user.count({
      where: { profile: { accessStatus: 'suspended' } },
    });

    const bannedUsers = await db.user.count({
      where: { profile: { accessStatus: 'banned' } },
    });

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const newThisWeek = await db.user.count({
      where: { createdAt: { gte: weekAgo } },
    });

    const totalPosts = await db.post.count();
    const feedbackCount = await db.feedback.count();

    const pendingPostReports = await db.postReport.count({ where: { status: 'pending' } });
    const pendingCommentReports = await db.commentReport.count({ where: { status: 'pending' } });
    const pendingUserReports = await db.report.count({ where: { status: 'pending' } });

    // Fetch recent reports from all three report tables
    const [recentUserReports, recentPostReports, recentCommentReports] = await Promise.all([
      db.report.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          reporter: { include: { profile: true } },
        },
      }),
      db.postReport.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          reporter: { include: { profile: true } },
        },
      }),
      db.commentReport.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          reporter: { include: { profile: true } },
        },
      }),
    ]);

    // Combine and sort all reports, then take the latest 5
    const allReports = [
      ...recentUserReports.map((r) => ({
        id: r.id,
        type: 'user' as const,
        category: r.category,
        reason: r.reason,
        status: r.status,
        createdAt: r.createdAt,
        reporterName: r.reporter.profile?.name || r.reporter.username,
      })),
      ...recentPostReports.map((r) => ({
        id: r.id,
        type: 'post' as const,
        category: r.category,
        reason: r.reason,
        status: r.status,
        createdAt: r.createdAt,
        reporterName: r.reporter.profile?.name || r.reporter.username,
      })),
      ...recentCommentReports.map((r) => ({
        id: r.id,
        type: 'comment' as const,
        category: r.category,
        reason: r.reason,
        status: r.status,
        createdAt: r.createdAt,
        reporterName: r.reporter.profile?.name || r.reporter.username,
      })),
    ]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    const recentActivity = await db.auditLog.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
    });

    const adminIds = [...new Set(recentActivity.map((a) => a.adminId))];
    const admins = await db.user.findMany({
      where: { id: { in: adminIds } },
      include: { profile: true },
    });

    const activityWithAdmin = recentActivity.map((log) => {
      const admin = admins.find((a) => a.id === log.adminId);
      return {
        id: log.id,
        action: log.action,
        targetUserId: log.targetUserId,
        details: log.details,
        createdAt: log.createdAt,
        adminName: admin?.profile?.name || admin?.username || 'Unknown',
      };
    });

    await logAudit(adminCheck.data.session.user.id, 'view_dashboard');

    return NextResponse.json({
      totalUsers,
      activeUsers,
      suspendedUsers,
      bannedUsers,
      newThisWeek,
      totalPosts,
      feedbackCount,
      pendingReports: pendingPostReports + pendingCommentReports + pendingUserReports,
      recentReports: allReports,
      recentActivity: activityWithAdmin,
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
