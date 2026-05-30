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
    const rating = searchParams.get('rating') || '';
    const category = searchParams.get('category') || '';

    const where: Record<string, unknown> = {};
    if (rating) where.rating = parseInt(rating);
    if (category) where.category = category;

    const [feedbacks, total] = await Promise.all([
      db.feedback.findMany({
        where,
        include: {
          user: { include: { profile: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.feedback.count({ where }),
    ]);

    // Rating distribution
    const distribution = await db.feedback.groupBy({
      by: ['rating'],
      _count: { rating: true },
    });

    const ratingDist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    distribution.forEach((d) => {
      ratingDist[d.rating] = d._count.rating;
    });

    return NextResponse.json({
      feedbacks: feedbacks.map((f) => ({
        id: f.id,
        rating: f.rating,
        category: f.category,
        message: f.message,
        createdAt: f.createdAt,
        user: {
          id: f.user.id,
          name: f.user.profile?.name || f.user.username,
          avatarUrl: f.user.profile?.avatarUrl,
          email: f.user.email,
        },
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
      ratingDistribution: ratingDist,
    });
  } catch (error) {
    console.error('Admin feedback list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
