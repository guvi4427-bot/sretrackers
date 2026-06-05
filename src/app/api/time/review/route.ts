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

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '7');
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const startD = new Date();
    startD.setDate(startD.getDate() - days);
    const startDate = `${startD.getFullYear()}-${String(startD.getMonth() + 1).padStart(2, '0')}-${String(startD.getDate()).padStart(2, '0')}`;

    // Fetch tasks for the review period
    const tasks = await db.timeTask.findMany({
      where: {
        userId: session.user.id,
        date: { gte: startDate, lte: today },
      },
      orderBy: { date: 'desc' },
    });

    // Calculate stats
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const partial = tasks.filter(t => t.status === 'partially_completed').length;
    const missed = tasks.filter(t => t.status === 'missed').length;
    const pending = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Group by date
    const byDate: Record<string, any[]> = {};
    tasks.forEach(t => {
      if (!byDate[t.date]) byDate[t.date] = [];
      byDate[t.date].push(t);
    });

    // Daily completion rates
    const dailyRates = Object.entries(byDate).map(([date, dayTasks]) => ({
      date,
      total: dayTasks.length,
      completed: dayTasks.filter(t => t.status === 'completed').length,
      partial: dayTasks.filter(t => t.status === 'partially_completed').length,
      missed: dayTasks.filter(t => t.status === 'missed').length,
      rate: dayTasks.length > 0 ? Math.round((dayTasks.filter(t => t.status === 'completed').length / dayTasks.length) * 100) : 0,
    }));

    // Reflection notes collection
    const reflections = tasks
      .filter(t => t.reflectionNote)
      .map(t => ({
        taskId: t.id,
        title: t.title,
        date: t.date,
        status: t.status,
        note: t.reflectionNote,
      }));

    // Common failure patterns from reflections
    const failureReasons: Record<string, number> = {};
    reflections.forEach(r => {
      const note = r.note!.toLowerCase();
      // Common keywords
      const patterns = [
        { key: 'Unexpected assignment', keywords: ['unexpected', 'assignment', 'surprise'] },
        { key: 'Time conflict', keywords: ['time conflict', 'schedule', 'overlap', 'clash'] },
        { key: 'Health issue', keywords: ['health', 'sick', 'ill', 'headache', 'fever'] },
        { key: 'Underestimated effort', keywords: ['underestimate', 'longer', 'more time', 'harder'] },
        { key: 'Distraction', keywords: ['distract', 'procrastinat', 'social media', 'phone'] },
        { key: 'Lack of energy', keywords: ['energy', 'tired', 'exhausted', 'fatigue'] },
        { key: 'Poor planning', keywords: ['poor plan', 'bad plan', 'unrealistic', 'overplanned'] },
      ];
      patterns.forEach(p => {
        if (p.keywords.some(kw => note.includes(kw))) {
          failureReasons[p.key] = (failureReasons[p.key] || 0) + 1;
        }
      });
    });

    const commonFailures = Object.entries(failureReasons)
      .sort(([, a], [, b]) => b - a)
      .map(([reason, count]) => ({ reason, count }));

    // Category breakdown
    const categoryStats: Record<string, { total: number; completed: number; missed: number; partial: number }> = {};
    tasks.forEach(t => {
      const cat = t.category || 'other';
      if (!categoryStats[cat]) categoryStats[cat] = { total: 0, completed: 0, missed: 0, partial: 0 };
      categoryStats[cat].total++;
      if (t.status === 'completed') categoryStats[cat].completed++;
      if (t.status === 'missed') categoryStats[cat].missed++;
      if (t.status === 'partially_completed') categoryStats[cat].partial++;
    });

    // Time-of-day analysis
    const timeSlots: Record<string, { total: number; completed: number; missed: number }> = {
      morning: { total: 0, completed: 0, missed: 0 },    // 6-12
      afternoon: { total: 0, completed: 0, missed: 0 },  // 12-17
      evening: { total: 0, completed: 0, missed: 0 },    // 17-21
      night: { total: 0, completed: 0, missed: 0 },      // 21-6
    };
    tasks.forEach(t => {
      if (!t.fromTime) return;
      const hour = parseInt(t.fromTime.split(':')[0]);
      let slot = 'night';
      if (hour >= 6 && hour < 12) slot = 'morning';
      else if (hour >= 12 && hour < 17) slot = 'afternoon';
      else if (hour >= 17 && hour < 21) slot = 'evening';
      timeSlots[slot].total++;
      if (t.status === 'completed') timeSlots[slot].completed++;
      if (t.status === 'missed') timeSlots[slot].missed++;
    });

    // Weekly completion rate
    const weeklyRate = dailyRates.length > 0
      ? Math.round(dailyRates.reduce((sum, d) => sum + d.rate, 0) / dailyRates.length)
      : 0;

    return NextResponse.json({
      overview: { total, completed, partial, missed, pending, completionRate, weeklyRate },
      dailyRates,
      reflections,
      commonFailures,
      categoryStats,
      timeSlots,
      tasks,
    });
  } catch (error) {
    console.error('GET /api/time/review error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
