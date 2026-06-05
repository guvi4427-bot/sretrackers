import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { updateStreak } from '@/lib/xp';
import { safeJsonParse } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const now = new Date();
    const date = searchParams.get('date') || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const dayPlan = await db.dayPlan.findFirst({
      where: { userId: session.user.id, date },
    });

    const parsedPlan = dayPlan
      ? { ...dayPlan, highlights: safeJsonParse(dayPlan.highlights, []) }
      : null;

    return NextResponse.json({ dayPlan: parsedPlan });
  } catch (error) {
    console.error('GET /api/time/day-plan error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    const { date, rating, review, highlights } = body;

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    const highlightsJson = highlights ? JSON.stringify(highlights) : null;

    const existing = await db.dayPlan.findFirst({
      where: { userId: session.user.id, date },
    });

    let dayPlan;
    if (existing) {
      dayPlan = await db.dayPlan.update({
        where: { id: existing.id },
        data: {
          rating: rating ?? existing.rating,
          review: review ?? existing.review,
          highlights: highlightsJson ?? existing.highlights,
        },
      });
    } else {
      dayPlan = await db.dayPlan.create({
        data: {
          userId: session.user.id,
          date,
          rating: rating || null,
          review: review || null,
          highlights: highlightsJson,
        },
      });
    }

    await updateStreak(session.user.id);

    const parsedPlan = { ...dayPlan, highlights: safeJsonParse(dayPlan.highlights, []) };

    return NextResponse.json({ dayPlan: parsedPlan });
  } catch (error) {
    console.error('POST /api/time/day-plan error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
