/**
 * AI Module Context Builder
 * ──────────────────────────
 * Each module-specific AI chatbot (Fitness, Learning, Time, Content, Nutrition)
 * automatically receives a context snapshot of the user's data, history, and
 * progress for that module. This enables the AI to behave like a long-term
 * coach that understands the user's journey instead of treating every
 * conversation as the first one.
 *
 * The context is built by querying existing Prisma models (no schema changes
 * required) and is injected into the system prompt of the AI chatbot route.
 *
 * All fetches are wrapped in try/catch so a DB hiccup never blocks the AI
 * response — the chatbot gracefully degrades to a context-free reply.
 */

import { db } from '@/lib/db';

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

export interface ModuleContext {
  /** The module this context belongs to: fitness, learning, time, content, general */
  module: string;
  /** Human-readable context block to inject into the system prompt */
  contextBlock: string;
  /** Compact JSON-serializable snapshot for programmatic use */
  snapshot: Record<string, any>;
}

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysAgoStr(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function safeRound(n: number | null | undefined, digits = 1): number | null {
  if (n === null || n === undefined || Number.isNaN(n)) return null;
  const f = Math.pow(10, digits);
  return Math.round(n * f) / f;
}

function pctChange(prev: number, curr: number): number | null {
  if (!prev || prev === 0) return null;
  return safeRound(((curr - prev) / prev) * 100, 1);
}

/**
 * Format a date string (YYYY-MM-DD) into a short readable label.
 */
function shortDate(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

// ────────────────────────────────────────────────────────────
// Fitness / Nutrition Context
// ────────────────────────────────────────────────────────────

async function getFitnessContext(userId: string): Promise<ModuleContext> {
  const snapshot: Record<string, any> = {};
  const lines: string[] = [];

  try {
    // ── Fitness Profile ──
    const profile = await db.fitnessProfile.findUnique({ where: { userId } });
    if (profile) {
      snapshot.profile = {
        weight: profile.weight,
        height: profile.height,
        age: profile.age,
        gender: profile.gender,
        activityLevel: profile.activityLevel,
        goal: profile.goal,
        tdee: profile.tdee,
        workoutLevel: profile.workoutLevel,
        dietType: profile.dietType,
        unitSystem: profile.unitSystem,
        proteinTarget: profile.proteinTarget,
        calorieTarget: profile.calorieTarget,
      };

      lines.push('── USER FITNESS PROFILE ──');
      if (profile.weight) lines.push(`- Current weight: ${profile.weight} kg`);
      if (profile.height) lines.push(`- Height: ${profile.height} cm`);
      if (profile.age) lines.push(`- Age: ${profile.age}`);
      if (profile.gender) lines.push(`- Gender: ${profile.gender}`);
      if (profile.activityLevel) lines.push(`- Activity level: ${profile.activityLevel}`);
      if (profile.goal) lines.push(`- Goal: ${profile.goal}`);
      if (profile.tdee) lines.push(`- TDEE: ${Math.round(profile.tdee)} kcal/day`);
      if (profile.calorieTarget) lines.push(`- Daily calorie target: ${Math.round(profile.calorieTarget)} kcal`);
      if (profile.proteinTarget) lines.push(`- Daily protein target: ${Math.round(profile.proteinTarget)} g`);
      if (profile.workoutLevel) lines.push(`- Workout level: ${profile.workoutLevel}`);
      if (profile.dietType) lines.push(`- Diet type: ${profile.dietType}`);
    }
  } catch (e) {
    console.error('[AI Module Context] fitness profile fetch failed:', e);
  }

  try {
    // ── Recent Workouts (last 14 days, max 10) ──
    const workouts = await db.fitnessWorkoutLog.findMany({
      where: { userId, date: { gte: daysAgoStr(14) } },
      orderBy: { date: 'desc' },
      take: 10,
    });

    if (workouts.length > 0) {
      snapshot.recentWorkouts = workouts.map(w => ({
        date: w.date,
        type: w.workoutType,
        duration: w.duration,
        calories: w.estimatedCalories,
        muscleGroup: w.muscleGroup,
        sets: w.sets,
        reps: w.reps,
        loadKg: w.loadKg,
        split: w.workoutSplit,
      }));

      const totalDuration = workouts.reduce((s, w) => s + (w.duration || 0), 0);
      const totalCalories = workouts.reduce((s, w) => s + (w.estimatedCalories || 0), 0);
      const workoutTypes = workouts.map(w => w.workoutType);
      const uniqueTypes = [...new Set(workoutTypes)];

      lines.push('');
      lines.push('── RECENT WORKOUTS (last 14 days) ──');
      lines.push(`- ${workouts.length} session(s) logged, ${totalDuration} min total, ~${Math.round(totalCalories)} kcal burned`);
      lines.push(`- Workout types: ${uniqueTypes.join(', ')}`);

      // Latest workout detail
      const latest = workouts[0];
      lines.push(`- Most recent (${shortDate(latest.date)}): ${latest.workoutType}, ${latest.duration} min${latest.muscleGroup ? `, ${latest.muscleGroup}` : ''}${latest.sets ? `, ${latest.sets}×${latest.reps} @ ${latest.loadKg}kg` : ''}`);

      // Workout frequency (sessions per week)
      const dayspan = 14;
      const sessionsPerWeek = safeRound((workouts.length / dayspan) * 7, 1);
      if (sessionsPerWeek !== null) {
        lines.push(`- Training frequency: ~${sessionsPerWeek} sessions/week`);
      }

      // Progressive overload detection (weight training only)
      const weightTraining = workouts
        .filter(w => w.workoutType === 'Weight Training' && w.loadKg && w.muscleGroup)
        .sort((a, b) => a.date.localeCompare(b.date)); // oldest first

      if (weightTraining.length >= 2) {
        const byMuscle: Record<string, typeof weightTraining> = {};
        for (const w of weightTraining) {
          const mg = w.muscleGroup || 'unknown';
          if (!byMuscle[mg]) byMuscle[mg] = [];
          byMuscle[mg].push(w);
        }

        const overloadNotes: string[] = [];
        for (const [muscle, sessions] of Object.entries(byMuscle)) {
          if (sessions.length < 2) continue;
          const first = sessions[0];
          const last = sessions[sessions.length - 1];
          if (first.loadKg && last.loadKg && last.loadKg > first.loadKg) {
            const delta = safeRound((last.loadKg || 0) - (first.loadKg || 0), 1);
            overloadNotes.push(`${muscle}: ${first.loadKg}kg → ${last.loadKg}kg (+${delta}kg)`);
          }
        }
        if (overloadNotes.length > 0) {
          lines.push(`- Progressive overload detected: ${overloadNotes.join(' | ')}`);
        }
      }
    } else {
      lines.push('');
      lines.push('── RECENT WORKOUTS ──');
      lines.push('- No workouts logged in the last 14 days');
    }
  } catch (e) {
    console.error('[AI Module Context] workouts fetch failed:', e);
  }

  try {
    // ── Weight History (last 30 days) ──
    const weightLogs = await db.fitnessWeightLog.findMany({
      where: { userId, date: { gte: daysAgoStr(30) } },
      orderBy: { date: 'asc' },
      take: 30,
    });

    if (weightLogs.length > 0) {
      snapshot.weightHistory = weightLogs.map(w => ({ date: w.date, weight: w.weight }));

      const first = weightLogs[0];
      const last = weightLogs[weightLogs.length - 1];
      const delta = safeRound(last.weight - first.weight, 1);
      const change = pctChange(first.weight, last.weight);

      lines.push('');
      lines.push('── WEIGHT HISTORY (last 30 days) ──');
      lines.push(`- ${weightLogs.length} weigh-ins`);
      lines.push(`- Start: ${first.weight} kg (${shortDate(first.date)}) → Latest: ${last.weight} kg (${shortDate(last.date)})`);
      if (delta !== null) {
        const sign = delta >= 0 ? '+' : '';
        lines.push(`- Change: ${sign}${delta} kg${change !== null ? ` (${change >= 0 ? '+' : ''}${change}%)` : ''}`);
      }
    }
  } catch (e) {
    console.error('[AI Module Context] weight logs fetch failed:', e);
  }

  try {
    // ── Nutrition: Last 7 Days Macro Totals ──
    const foodLogs = await db.fitnessFoodLog.findMany({
      where: { userId, date: { gte: daysAgoStr(7) } },
      orderBy: { date: 'desc' },
      take: 200,
    });

    if (foodLogs.length > 0) {
      // Aggregate per day
      const perDay: Record<string, { cal: number; p: number; c: number; f: number; fiber: number }> = {};
      for (const log of foodLogs) {
        if (!perDay[log.date]) perDay[log.date] = { cal: 0, p: 0, c: 0, f: 0, fiber: 0 };
        perDay[log.date].cal += log.calories || 0;
        perDay[log.date].p += log.proteinG || 0;
        perDay[log.date].c += log.carbsG || 0;
        perDay[log.date].f += log.fatG || 0;
        perDay[log.date].fiber += log.fiberG || 0;
      }

      const days = Object.keys(perDay).sort();
      const totals = days.reduce(
        (acc, d) => {
          acc.cal += perDay[d].cal;
          acc.p += perDay[d].p;
          acc.c += perDay[d].c;
          acc.f += perDay[d].f;
          acc.fiber += perDay[d].fiber;
          return acc;
        },
        { cal: 0, p: 0, c: 0, f: 0, fiber: 0 }
      );

      const avgCal = safeRound(totals.cal / days.length, 0);
      const avgP = safeRound(totals.p / days.length, 1);
      const avgC = safeRound(totals.c / days.length, 1);
      const avgF = safeRound(totals.f / days.length, 1);

      snapshot.nutrition7d = {
        daysLogged: days.length,
        avgCalories: avgCal,
        avgProteinG: avgP,
        avgCarbsG: avgC,
        avgFatG: avgF,
        perDay,
      };

      lines.push('');
      lines.push('── NUTRITION (last 7 days) ──');
      lines.push(`- Logged on ${days.length} of 7 days`);
      if (avgCal) lines.push(`- Avg calories: ${avgCal} kcal/day`);
      if (avgP) lines.push(`- Avg protein: ${avgP}g/day`);
      if (avgC) lines.push(`- Avg carbs: ${avgC}g/day`);
      if (avgF) lines.push(`- Avg fat: ${avgF}g/day`);

      // Most-logged foods (top 8 by frequency)
      const foodCounts: Record<string, { count: number; cal: number; p: number }> = {};
      for (const log of foodLogs) {
        const name = log.mealName.toLowerCase().trim();
        if (!foodCounts[name]) foodCounts[name] = { count: 0, cal: 0, p: 0 };
        foodCounts[name].count++;
        foodCounts[name].cal += log.calories || 0;
        foodCounts[name].p += log.proteinG || 0;
      }
      const topFoods = Object.entries(foodCounts)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 8);

      if (topFoods.length > 0) {
        snapshot.frequentFoods = topFoods.map(([name, info]) => ({
          name,
          count: info.count,
          avgCalories: safeRound(info.cal / info.count, 0),
          avgProteinG: safeRound(info.p / info.count, 1),
        }));
        lines.push('- Frequently logged foods:');
        for (const [name, info] of topFoods) {
          const avgCal = safeRound(info.cal / info.count, 0);
          lines.push(`  • ${name} (${info.count}×, ~${avgCal} kcal/serving)`);
        }
      }
    }
  } catch (e) {
    console.error('[AI Module Context] food logs fetch failed:', e);
  }

  return {
    module: 'fitness',
    contextBlock: lines.length > 0 ? lines.join('\n') : '(no fitness data available yet)',
    snapshot,
  };
}

// ────────────────────────────────────────────────────────────
// Learning Context
// ────────────────────────────────────────────────────────────

async function getLearningContext(userId: string): Promise<ModuleContext> {
  const snapshot: Record<string, any> = {};
  const lines: string[] = [];

  try {
    // ── All Topics with entry counts ──
    const topics = await db.learningTopic.findMany({
      where: { userId },
      include: {
        entries: { orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, title: true, duration: true, date: true, createdAt: true } },
        _count: { select: { entries: true, flags: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    });

    if (topics.length > 0) {
      snapshot.topics = topics.map(t => ({
        name: t.name,
        phase: t.phase,
        entriesCount: t._count.entries,
        flagsCount: t._count.flags,
        lastActivity: t.updatedAt,
        isShared: t.isSharedCollection,
      }));

      lines.push('── LEARNING TOPICS ──');
      lines.push(`- ${topics.length} topic(s) tracked`);
      for (const t of topics.slice(0, 8)) {
        const lastEntry = t.entries[0];
        const lastDate = lastEntry ? shortDate(lastEntry.date) : 'no entries';
        lines.push(`  • ${t.name} — ${t._count.entries} entries, ${t._count.flags} progress flags, last: ${lastDate}${t.phase ? ` [${t.phase}]` : ''}`);
      }
    } else {
      lines.push('── LEARNING TOPICS ──');
      lines.push('- No learning topics created yet');
    }

    // ── Recent Entries (last 14 days) ──
    const recentEntries = await db.learningEntry.findMany({
      where: { userId, date: { gte: daysAgoStr(14) } },
      orderBy: { date: 'desc' },
      take: 10,
      select: { title: true, date: true, duration: true, topicId: true, content: true },
    });

    if (recentEntries.length > 0) {
      snapshot.recentEntries = recentEntries.map(e => ({ title: e.title, date: e.date, duration: e.duration }));
      const totalMins = recentEntries.reduce((s, e) => s + (e.duration || 0), 0);

      lines.push('');
      lines.push('── RECENT STUDY ACTIVITY (last 14 days) ──');
      lines.push(`- ${recentEntries.length} entries logged, ${totalMins} min total (~${safeRound(totalMins / 14, 0)} min/day avg)`);

      // Consistency: how many distinct days studied
      const distinctDays = new Set(recentEntries.map(e => e.date)).size;
      lines.push(`- Studied on ${distinctDays} of 14 days (${safeRound((distinctDays / 14) * 100, 0)}% consistency)`);
    }

    // ── Progress Flags ──
    const flags = await db.learningProgressFlag.findMany({
      where: { userId },
      orderBy: { flagDate: 'desc' },
      take: 5,
      include: { topic: { select: { name: true } } },
    });

    if (flags.length > 0) {
      lines.push('');
      lines.push('── RECENT PROGRESS FLAGS ──');
      for (const f of flags.slice(0, 3)) {
        lines.push(`  • ${f.topic.name} — ${shortDate(f.flagDate)}${f.note ? `: ${f.note.slice(0, 80)}` : ''}`);
      }
    }
  } catch (e) {
    console.error('[AI Module Context] learning fetch failed:', e);
  }

  return {
    module: 'learning',
    contextBlock: lines.length > 0 ? lines.join('\n') : '(no learning data available yet)',
    snapshot,
  };
}

// ────────────────────────────────────────────────────────────
// Time Management Context
// ────────────────────────────────────────────────────────────

async function getTimeContext(userId: string): Promise<ModuleContext> {
  const snapshot: Record<string, any> = {};
  const lines: string[] = [];

  try {
    // ── Today's Tasks ──
    const today = todayStr();
    const todayTasks = await db.timeTask.findMany({
      where: { userId, date: today },
      orderBy: { order: 'asc' },
      take: 20,
    });

    if (todayTasks.length > 0) {
      snapshot.todayTasks = todayTasks.map(t => ({
        title: t.title,
        status: t.status,
        priority: t.priority,
        category: t.category,
        isProductive: t.isProductive,
        fromTime: t.fromTime,
        toTime: t.toTime,
      }));

      const completed = todayTasks.filter(t => t.status === 'completed').length;
      const inProgress = todayTasks.filter(t => t.status === 'in_progress').length;
      const pending = todayTasks.filter(t => t.status === 'pending').length;
      const missed = todayTasks.filter(t => t.status === 'missed').length;

      lines.push('── TODAY\'S TASKS ──');
      lines.push(`- ${todayTasks.length} task(s): ${completed} done, ${inProgress} in-progress, ${pending} pending, ${missed} missed`);

      // Top 5 upcoming
      const upcoming = todayTasks.filter(t => t.status === 'pending' || t.status === 'in_progress').slice(0, 5);
      if (upcoming.length > 0) {
        lines.push('- Upcoming:');
        for (const t of upcoming) {
          const time = t.fromTime ? ` @ ${t.fromTime}` : '';
          const pri = t.priority ? ` [${t.priority}]` : '';
          lines.push(`  • ${t.title}${time}${pri}`);
        }
      }
    } else {
      lines.push('── TODAY\'S TASKS ──');
      lines.push('- No tasks scheduled for today');
    }

    // ── Focus Sessions (last 7 days) ──
    const focusSessions = await db.focusSession.findMany({
      where: { userId, startedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      orderBy: { startedAt: 'desc' },
      take: 30,
      select: { id: true, taskName: true, duration: true, startedAt: true, date: true, completed: true },
    });

    if (focusSessions.length > 0) {
      const totalMins = focusSessions.reduce((s, f) => s + (f.duration || 0), 0);
      const completedCount = focusSessions.filter(f => f.completed).length;
      const distinctDays = new Set(focusSessions.map(f => f.date)).size;

      snapshot.focus7d = {
        sessions: focusSessions.length,
        totalMinutes: totalMins,
        completedSessions: completedCount,
        distinctDays,
      };

      lines.push('');
      lines.push('── FOCUS SESSIONS (last 7 days) ──');
      lines.push(`- ${focusSessions.length} sessions, ${totalMins} min total (~${safeRound(totalMins / 60, 1)} hrs)`);
      lines.push(`- Focused on ${distinctDays} of 7 days, ${completedCount} completed sessions`);

      // Top focus task names
      const taskCounts: Record<string, number> = {};
      for (const f of focusSessions) {
        const n = (f.taskName || 'untitled').toLowerCase().trim();
        taskCounts[n] = (taskCounts[n] || 0) + 1;
      }
      const topFocus = Object.entries(taskCounts).sort((a, b) => b[1] - a[1]).slice(0, 4);
      if (topFocus.length > 0) {
        lines.push('- Most-focused activities:');
        for (const [name, count] of topFocus) {
          lines.push(`  • ${name} (${count}×)`);
        }
      }
    }

    // ── Last 14 days task stats ──
    const recentTasks = await db.timeTask.findMany({
      where: { userId, date: { gte: daysAgoStr(14) } },
      orderBy: { date: 'desc' },
      take: 100,
      select: { status: true, isProductive: true, category: true, priority: true, date: true },
    });

    if (recentTasks.length > 0) {
      const completed = recentTasks.filter(t => t.status === 'completed').length;
      const completionRate = safeRound((completed / recentTasks.length) * 100, 0);
      const productive = recentTasks.filter(t => t.isProductive).length;
      const productiveRate = safeRound((productive / recentTasks.length) * 100, 0);

      // Category breakdown
      const catCounts: Record<string, number> = {};
      for (const t of recentTasks) {
        const c = t.category || 'other';
        catCounts[c] = (catCounts[c] || 0) + 1;
      }
      const topCats = Object.entries(catCounts).sort((a, b) => b[1] - a[1]).slice(0, 4);

      snapshot.tasks14d = {
        total: recentTasks.length,
        completed,
        completionRate,
        productiveRate,
        topCategories: topCats,
      };

      lines.push('');
      lines.push('── TASK STATS (last 14 days) ──');
      lines.push(`- ${recentTasks.length} tasks, ${completed} completed (${completionRate}% completion rate)`);
      lines.push(`- ${productiveRate}% productive tasks`);
      if (topCats.length > 0) {
        lines.push(`- Top categories: ${topCats.map(([c, n]) => `${c} (${n})`).join(', ')}`);
      }
    }
  } catch (e) {
    console.error('[AI Module Context] time fetch failed:', e);
  }

  return {
    module: 'time',
    contextBlock: lines.length > 0 ? lines.join('\n') : '(no time data available yet)',
    snapshot,
  };
}

// ────────────────────────────────────────────────────────────
// Content Creation Context
// ────────────────────────────────────────────────────────────

async function getContentContext(userId: string): Promise<ModuleContext> {
  const snapshot: Record<string, any> = {};
  const lines: string[] = [];

  try {
    const series = await db.contentSeries.findMany({
      where: { userId },
      include: {
        entries: {
          orderBy: { updatedAt: 'desc' },
          take: 5,
          select: { id: true, title: true, status: true, contentType: true, liveStatus: true, postDate: true, updatedAt: true },
        },
        _count: { select: { entries: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    });

    if (series.length > 0) {
      snapshot.series = series.map(s => ({
        name: s.name,
        category: s.category,
        entriesCount: s._count.entries,
      }));

      lines.push('── CONTENT SERIES ──');
      lines.push(`- ${series.length} series tracked`);
      for (const s of series.slice(0, 5)) {
        lines.push(`  • ${s.name} — ${s._count.entries} entries${s.category ? ` [${s.category}]` : ''}`);
      }
    } else {
      lines.push('── CONTENT SERIES ──');
      lines.push('- No content series created yet');
    }

    // ── All entries by status ──
    const allEntries = await db.contentEntry.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 50,
      select: { id: true, title: true, status: true, contentType: true, liveStatus: true, postDate: true, shootDate: true, seriesId: true, updatedAt: true },
    });

    if (allEntries.length > 0) {
      const statusCounts: Record<string, number> = {};
      const liveStatusCounts: Record<string, number> = {};
      for (const e of allEntries) {
        statusCounts[e.status] = (statusCounts[e.status] || 0) + 1;
        if (e.liveStatus) liveStatusCounts[e.liveStatus] = (liveStatusCounts[e.liveStatus] || 0) + 1;
      }

      snapshot.entriesByStatus = statusCounts;
      snapshot.entriesByLiveStatus = liveStatusCounts;

      lines.push('');
      lines.push('── CONTENT PIPELINE ──');
      lines.push(`- ${allEntries.length} total entries`);
      lines.push(`- Stages: ${Object.entries(statusCounts).map(([s, n]) => `${s} (${n})`).join(', ')}`);

      // Recently published
      const published = allEntries.filter(e => e.status === 'published' && e.postDate).slice(0, 5);
      if (published.length > 0) {
        lines.push(`- Recently published: ${published.map(p => `${p.title} (${shortDate(p.postDate!)})`).join(' | ')}`);
      }

      // In progress (drafting/editing)
      const inProgress = allEntries.filter(e => e.status === 'drafting' || e.status === 'editing').slice(0, 5);
      if (inProgress.length > 0) {
        lines.push('- In progress:');
        for (const e of inProgress) {
          lines.push(`  • ${e.title} [${e.status}]`);
        }
      }
    }
  } catch (e) {
    console.error('[AI Module Context] content fetch failed:', e);
  }

  return {
    module: 'content',
    contextBlock: lines.length > 0 ? lines.join('\n') : '(no content data available yet)',
    snapshot,
  };
}

// ────────────────────────────────────────────────────────────
// General Context (lightweight summary of all modules)
// ────────────────────────────────────────────────────────────

async function getGeneralContext(userId: string): Promise<ModuleContext> {
  const lines: string[] = [];
  const snapshot: Record<string, any> = {};

  try {
    // Lightweight counts only — no detail
    const [topics, workouts, weightLogs, tasks, contentEntries, focusSessions] = await Promise.all([
      db.learningTopic.count({ where: { userId } }),
      db.fitnessWorkoutLog.count({ where: { userId, date: { gte: daysAgoStr(30) } } }),
      db.fitnessWeightLog.count({ where: { userId, date: { gte: daysAgoStr(30) } } }),
      db.timeTask.count({ where: { userId, date: { gte: daysAgoStr(7) } } }),
      db.contentEntry.count({ where: { userId } }),
      db.focusSession.count({ where: { userId, startedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
    ]);

    snapshot.counts = { topics, workouts, weightLogs, tasks, contentEntries, focusSessions };

    lines.push('── USER ACTIVITY SUMMARY ──');
    lines.push(`- Learning topics: ${topics}`);
    lines.push(`- Workouts (30d): ${workouts}`);
    lines.push(`- Weight logs (30d): ${weightLogs}`);
    lines.push(`- Tasks (7d): ${tasks}`);
    lines.push(`- Focus sessions (7d): ${focusSessions}`);
    lines.push(`- Content entries: ${contentEntries}`);

    // Current XP / level (best-effort) — these live in Profile, not User
    try {
      const profile = await db.profile.findUnique({
        where: { userId },
        select: { xp: true, level: true, currentStreak: true, longestStreak: true },
      });
      if (profile) {
        snapshot.profile = { xp: profile.xp, level: profile.level, streak: profile.currentStreak };
        lines.push(`- Level: ${profile.level} | XP: ${profile.xp} | Streak: ${profile.currentStreak} days`);
      }
    } catch { /* ignore */ }
  } catch (e) {
    console.error('[AI Module Context] general fetch failed:', e);
  }

  return {
    module: 'general',
    contextBlock: lines.length > 0 ? lines.join('\n') : '(no activity yet)',
    snapshot,
  };
}

// ────────────────────────────────────────────────────────────
// Public: Build module context by agent type
// ────────────────────────────────────────────────────────────

export async function buildModuleContext(userId: string, agentType: string): Promise<ModuleContext | null> {
  try {
    switch (agentType) {
      case 'fitness':
        return await getFitnessContext(userId);
      case 'learning':
        return await getLearningContext(userId);
      case 'time':
        return await getTimeContext(userId);
      case 'content':
        return await getContentContext(userId);
      case 'general':
      case 'navigation':
      default:
        return await getGeneralContext(userId);
    }
  } catch (e) {
    console.error('[AI Module Context] build failed:', e);
    return null;
  }
}

// ────────────────────────────────────────────────────────────
// Persistent Module Memory
// ────────────────────────────────────────────────────────────

export interface ModuleMemory {
  module: string;
  preferences: string[];
  frequentItems: string[];
  goals: string[];
  notes: string[];
  lastUpdated: string | null;
}

/**
 * Fetch the user's persistent module memory.
 *
 * Memory is stored in the `ModuleMemory` Prisma table (one row per
 * user+module). If the table doesn't exist or the row is missing,
 * returns an empty memory object — the AI still works, just without
 * long-term memory.
 */
export async function getModuleMemory(userId: string, module: string): Promise<ModuleMemory> {
  const empty: ModuleMemory = {
    module,
    preferences: [],
    frequentItems: [],
    goals: [],
    notes: [],
    lastUpdated: null,
  };

  try {
    // @ts-ignore — ModuleMemory model may not exist on the Prisma client yet
    const row = await db.moduleMemory?.findUnique({
      where: { userId_module: { userId, module } },
    });

    if (!row) return empty;

    return {
      module: row.module,
      preferences: safeParseArray(row.preferencesJson),
      frequentItems: safeParseArray(row.frequentItemsJson),
      goals: safeParseArray(row.goalsJson),
      notes: safeParseArray(row.notesJson),
      lastUpdated: row.updatedAt?.toISOString() || null,
    };
  } catch (e) {
    // Table missing or query failed — return empty memory
    return empty;
  }
}

/**
 * Update (upsert) the user's persistent module memory.
 * Merges new items into existing arrays and de-duplicates.
 */
export async function updateModuleMemory(
  userId: string,
  module: string,
  updates: Partial<Pick<ModuleMemory, 'preferences' | 'frequentItems' | 'goals' | 'notes'>>,
): Promise<void> {
  try {
    const existing = await getModuleMemory(userId, module);

    const merged = {
      preferences: dedupe([...existing.preferences, ...(updates.preferences || [])]).slice(-20),
      frequentItems: dedupe([...existing.frequentItems, ...(updates.frequentItems || [])]).slice(-30),
      goals: dedupe([...existing.goals, ...(updates.goals || [])]).slice(-10),
      notes: dedupe([...existing.notes, ...(updates.notes || [])]).slice(-15),
    };

    // @ts-ignore — ModuleMemory model may not exist on the Prisma client yet
    await db.moduleMemory?.upsert({
      where: { userId_module: { userId, module } },
      create: {
        userId,
        module,
        preferencesJson: JSON.stringify(merged.preferences),
        frequentItemsJson: JSON.stringify(merged.frequentItems),
        goalsJson: JSON.stringify(merged.goals),
        notesJson: JSON.stringify(merged.notes),
      },
      update: {
        preferencesJson: JSON.stringify(merged.preferences),
        frequentItemsJson: JSON.stringify(merged.frequentItems),
        goalsJson: JSON.stringify(merged.goals),
        notesJson: JSON.stringify(merged.notes),
        updatedAt: new Date(),
      },
    });
  } catch (e) {
    console.error('[AI Module Context] memory update failed:', e);
    // Non-fatal — memory is best-effort
  }
}

/**
 * Format the persistent memory for injection into the system prompt.
 */
export function formatMemoryBlock(memory: ModuleMemory): string {
  const lines: string[] = [];
  if (memory.preferences.length > 0) {
    lines.push(`- Known preferences: ${memory.preferences.join(' | ')}`);
  }
  if (memory.frequentItems.length > 0) {
    lines.push(`- Frequently mentioned items: ${memory.frequentItems.join(' | ')}`);
  }
  if (memory.goals.length > 0) {
    lines.push(`- Stated goals: ${memory.goals.join(' | ')}`);
  }
  if (memory.notes.length > 0) {
    lines.push(`- Coach notes: ${memory.notes.join(' | ')}`);
  }
  if (memory.lastUpdated) {
    lines.push(`- Memory last updated: ${new Date(memory.lastUpdated).toLocaleDateString()}`);
  }
  return lines.join('\n');
}

function safeParseArray(json: string | null | undefined): string[] {
  if (!json) return [];
  try {
    const arr = JSON.parse(json);
    return Array.isArray(arr) ? arr.filter(x => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function dedupe(arr: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of arr) {
    const key = item.toLowerCase().trim();
    if (key && !seen.has(key)) {
      seen.add(key);
      out.push(item);
    }
  }
  return out;
}
