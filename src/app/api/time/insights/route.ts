import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Look at the last 14 days of task data for insights
    const startD = new Date();
    startD.setDate(startD.getDate() - 14);
    const startDate = `${startD.getFullYear()}-${String(startD.getMonth() + 1).padStart(2, '0')}-${String(startD.getDate()).padStart(2, '0')}`;
    const tasks = await db.timeTask.findMany({
      where: {
        userId: session.user.id,
        date: { gte: startDate },
      },
      orderBy: { date: 'desc' },
    });

    const insights: string[] = [];

    if (tasks.length === 0) {
      return NextResponse.json({ insights: ['Start planning tasks to get personalized insights!'] });
    }

    const completed = tasks.filter(t => t.status === 'completed');
    const missed = tasks.filter(t => t.status === 'missed');
    const partial = tasks.filter(t => t.status === 'partially_completed');
    const completionRate = tasks.length > 0 ? Math.round((completed.length / tasks.length) * 100) : 0;

    // Insight 1: Overall completion rate
    if (completionRate >= 80) {
      insights.push(`Great execution! You complete ${completionRate}% of your planned tasks.`);
    } else if (completionRate >= 50) {
      insights.push(`You complete ${completionRate}% of planned tasks. Aim higher!`);
    } else {
      insights.push(`Only ${completionRate}% of planned tasks are completed. Try planning fewer, more realistic tasks.`);
    }

    // Insight 2: Category-specific patterns
    const catStats: Record<string, { total: number; completed: number; missed: number }> = {};
    tasks.forEach(t => {
      const cat = t.category || 'other';
      if (!catStats[cat]) catStats[cat] = { total: 0, completed: 0, missed: 0 };
      catStats[cat].total++;
      if (t.status === 'completed') catStats[cat].completed++;
      if (t.status === 'missed') catStats[cat].missed++;
    });

    Object.entries(catStats).forEach(([cat, stats]) => {
      const rate = Math.round((stats.completed / stats.total) * 100);
      const catName = cat.charAt(0).toUpperCase() + cat.slice(1);
      if (rate >= 80 && stats.total >= 3) {
        insights.push(`You consistently complete ${catName} tasks (${rate}%). Keep it up!`);
      } else if (rate < 40 && stats.total >= 3) {
        insights.push(`You frequently miss ${catName} tasks (${rate}% completion). Consider scheduling fewer or shorter ones.`);
      }
    });

    // Insight 3: Time-of-day patterns
    const timeSlots: Record<string, { total: number; completed: number; missed: number }> = {
      morning: { total: 0, completed: 0, missed: 0 },
      afternoon: { total: 0, completed: 0, missed: 0 },
      evening: { total: 0, completed: 0, missed: 0 },
    };
    tasks.forEach(t => {
      if (!t.fromTime) return;
      const hour = parseInt(t.fromTime.split(':')[0]);
      let slot = 'evening';
      if (hour >= 6 && hour < 12) slot = 'morning';
      else if (hour >= 12 && hour < 17) slot = 'afternoon';
      timeSlots[slot].total++;
      if (t.status === 'completed') timeSlots[slot].completed++;
      if (t.status === 'missed') timeSlots[slot].missed++;
    });

    Object.entries(timeSlots).forEach(([slot, stats]) => {
      if (stats.total >= 3) {
        const rate = Math.round((stats.completed / stats.total) * 100);
        const slotName = slot.charAt(0).toUpperCase() + slot.slice(1);
        if (rate < 40) {
          insights.push(`You frequently miss ${slotName} tasks (${rate}% completion).`);
        }
      }
    });

    // Insight 4: Overplanning detection
    const byDate: Record<string, number> = {};
    tasks.forEach(t => { byDate[t.date] = (byDate[t.date] || 0) + 1; });
    const avgTasksPerDay = Object.values(byDate).length > 0
      ? Math.round(Object.values(byDate).reduce((a, b) => a + b, 0) / Object.values(byDate).length)
      : 0;
    
    const completedByDate: Record<string, number> = {};
    completed.forEach(t => { completedByDate[t.date] = (completedByDate[t.date] || 0) + 1; });
    const avgCompletedPerDay = Object.keys(completedByDate).length > 0
      ? Math.round(Object.values(completedByDate).reduce((a, b) => a + b, 0) / Object.keys(completedByDate).length)
      : 0;

    if (avgTasksPerDay > avgCompletedPerDay + 3) {
      insights.push(`You plan ~${avgTasksPerDay} tasks/day but only complete ~${avgCompletedPerDay}. Try planning ${avgCompletedPerDay}-${avgCompletedPerDay + 2} tasks instead.`);
    }

    // Insight 5: Reflection-based insights
    const reflectionTasks = tasks.filter(t => t.reflectionNote);
    if (reflectionTasks.length >= 2) {
      const notes = reflectionTasks.map(t => t.reflectionNote!.toLowerCase()).join(' ');
      if (notes.includes('underestimate') || notes.includes('longer') || notes.includes('more time')) {
        insights.push('You often underestimate task duration. Try adding buffer time to your plans.');
      }
      if (notes.includes('distract') || notes.includes('procrastinat') || notes.includes('social media')) {
        insights.push('Distractions are a recurring issue. Consider using focus sessions during task time.');
      }
      if (notes.includes('energy') || notes.includes('tired') || notes.includes('fatigue')) {
        insights.push('Low energy affects your completion. Schedule demanding tasks during peak energy hours.');
      }
    }

    // Limit to 5 most relevant insights
    const finalInsights = insights.slice(0, 5);

    return NextResponse.json({
      insights: finalInsights.length > 0 ? finalInsights : ['Plan tomorrow\'s tasks and track your progress to unlock insights!'],
      stats: {
        completionRate,
        avgTasksPerDay,
        avgCompletedPerDay,
        totalTasks: tasks.length,
        completedTasks: completed.length,
        missedTasks: missed.length,
        partialTasks: partial.length,
      },
    });
  } catch (error) {
    console.error('GET /api/time/insights error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
