import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { rejectGuest } from '@/lib/auth-helper';

export async function POST(req: Request) {
  const guestRejected = rejectGuest(req); if (guestRejected) return guestRejected;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { rating, category, message } = await req.json();

    if (!rating || !message) {
      return NextResponse.json({ error: 'Rating and message required' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    const feedback = await db.feedback.create({
      data: {
        userId: session.user.id,
        rating,
        category: category || 'general',
        message,
      },
    });

    return NextResponse.json({ success: true, feedback });
  } catch (error) {
    console.error('Feedback error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
