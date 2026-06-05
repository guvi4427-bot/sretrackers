import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json({ error: 'username parameter is required' }, { status: 400 });
    }

    const existing = await db.user.findUnique({
      where: { username },
    });

    return NextResponse.json({ available: !existing, userId: existing?.id || null });
  } catch (error) {
    console.error('Check username error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
