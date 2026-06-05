import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const BEST_TIMES: Record<string, string[]> = {
  youtube: ['2:00 PM - 4:00 PM', '6:00 PM - 9:00 PM'],
  instagram: ['11:00 AM - 1:00 PM', '7:00 PM - 9:00 PM'],
  twitter: ['8:00 AM - 10:00 AM', '12:00 PM - 1:00 PM'],
  linkedin: ['7:00 AM - 8:00 AM', '12:00 PM - 1:00 PM'],
  tiktok: ['7:00 PM - 11:00 PM', '10:00 AM - 12:00 PM'],
  blog: ['9:00 AM - 11:00 AM', '2:00 PM - 4:00 PM'],
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { platform } = await req.json();
    const key = (platform || 'blog').toLowerCase().split(',')[0].trim();
    const bestTimes = BEST_TIMES[key] || ['9:00 AM - 11:00 AM', '2:00 PM - 4:00 PM'];
    return NextResponse.json({ recommendation: { bestTimes, reasoning: `Based on typical engagement patterns for ${key}` } });
  } catch (error) { return NextResponse.json({ error: 'Internal server error' }, { status: 500 }); }
}
