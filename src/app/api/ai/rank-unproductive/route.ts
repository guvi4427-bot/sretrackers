import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const UNPRODUCTIVE_KEYWORDS = ['scroll', 'binge', 'procrastinate', 'lazy', 'waste', 'distraction', 'social media', 'netflix', 'youtube browse', 'doom scroll', 'overthink', 'complain', 'idle', 'nothing'];

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { tasks } = await req.json();
    if (!Array.isArray(tasks)) return NextResponse.json({ error: 'Tasks array required' }, { status: 400 });

    const rankings = tasks
      .filter((t: any) => UNPRODUCTIVE_KEYWORDS.some(kw => (t.title || '').toLowerCase().includes(kw)))
      .map((t: any) => ({ title: t.title, timeWasted: t.duration || 30, reason: `"${t.title}" appears to be an unproductive use of time` }))
      .sort((a: any, b: any) => b.timeWasted - a.timeWasted);

    return NextResponse.json({ rankings });
  } catch (error) {
    console.error('Rank unproductive error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
