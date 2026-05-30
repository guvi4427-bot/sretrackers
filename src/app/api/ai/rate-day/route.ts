import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { aiChat } from '@/lib/ai-provider';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { activities, tasks, focusMinutes } = await req.json();

    const completedTasks = tasks?.filter((t: any) => t.status === 'completed').length || 0;
    const totalTasks = tasks?.length || 0;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    let feedback = completionRate >= 80
      ? `Excellent! ${completedTasks}/${totalTasks} tasks done. Keep this momentum!`
      : completionRate >= 50
      ? `Good progress! ${completedTasks}/${totalTasks} tasks done. Try breaking large tasks into smaller ones.`
      : `${completedTasks}/${totalTasks} tasks done. Try the Pomodoro technique — 25 min focus, 5 min break.`;

    try {
      const reply = await aiChat(
        [{ role: 'user', content: `Rate my day: ${completedTasks}/${totalTasks} tasks, ${focusMinutes || 0} focus min, activities: ${JSON.stringify(activities || [])}. Give brief encouraging feedback + one suggestion.` }],
        'You are a productivity coach. Give brief (2-3 sentence) encouraging feedback and one specific suggestion.'
      );
      feedback = reply;
    } catch {}

    return NextResponse.json({ rating: Math.min(10, Math.max(1, Math.round(completionRate / 10))), feedback, completionRate });
  } catch (error) {
    console.error('Rate day error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
