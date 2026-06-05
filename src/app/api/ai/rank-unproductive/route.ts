import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const UNPRODUCTIVE_KEYWORDS = ['scroll', 'binge', 'procrastinate', 'lazy', 'waste', 'distraction', 'social media', 'netflix', 'youtube browse', 'doom scroll', 'overthink', 'complain', 'idle', 'nothing'];
const ROUTINE_KEYWORDS = ['wake up','waking up','wake','lunch','breakfast','dinner','meal','eat','shower','bath','nap','rest','hydrate','brush','skincare','self care','self-care','get ready','morning routine','night routine','bedtime','sleep','tea time','snack'];

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { tasks } = await req.json();
    if (!Array.isArray(tasks)) return NextResponse.json({ error: 'Tasks array required' }, { status: 400 });

    const rankings = tasks
      .filter((t: any) => {
        const title = (t.title || '').toLowerCase();
        // Never flag routine self-care tasks as unproductive
        if (ROUTINE_KEYWORDS.some(kw => title.includes(kw))) return false;
        return UNPRODUCTIVE_KEYWORDS.some(kw => title.includes(kw));
      })
      .map((t: any) => ({ title: t.title, timeWasted: t.duration || 30, reason: `"${t.title}" appears to be an unproductive use of time` }))
      .sort((a: any, b: any) => b.timeWasted - a.timeWasted);

    return NextResponse.json({ rankings });
  } catch (error) {
    console.error('Rank unproductive error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
