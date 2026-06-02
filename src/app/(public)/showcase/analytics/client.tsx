'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  BarChart3, TrendingUp, Calendar, Zap, Trophy,
  Target, ArrowRight, ChevronRight, Activity,
  Dumbbell, BookOpen, PenTool, Clock, Flame,
  CheckCircle2, PieChart, LineChart, Award,
} from 'lucide-react';
import { GlassCard } from '@/components/glass-card';
import { Button } from '@/components/ui/button';
import { SITE_NAME } from '@/lib/site-config';

const WEEKLY_XP = [
  { day: 'Mon', xp: 85 },
  { day: 'Tue', xp: 120 },
  { day: 'Wed', xp: 95 },
  { day: 'Thu', xp: 140 },
  { day: 'Fri', xp: 110 },
  { day: 'Sat', xp: 160 },
  { day: 'Sun', xp: 75 },
];

const CATEGORY_BREAKDOWN = [
  { category: 'Fitness', xp: 450, pct: 30, color: 'bg-emerald-500', icon: Dumbbell },
  { category: 'Learning', xp: 380, pct: 25, color: 'bg-blue-500', icon: BookOpen },
  { category: 'Content', xp: 300, pct: 20, color: 'bg-purple-500', icon: PenTool },
  { category: 'Productivity', xp: 225, pct: 15, color: 'bg-amber-500', icon: Clock },
  { category: 'Social', xp: 150, pct: 10, color: 'bg-rose-500', icon: Activity },
];

const WEEKLY_SUMMARY = {
  totalXP: 785,
  dailyAvg: 112,
  bestDay: 'Saturday',
  bestDayXP: 160,
  streaksMaintained: 3,
  newAchievements: 2,
  tasksCompleted: 28,
  focusHours: 14.5,
  workouts: 5,
  studySessions: 7,
  contentPublished: 3,
};

const MONTHLY_TREND = [
  { week: 'W1', xp: 520 },
  { week: 'W2', xp: 680 },
  { week: 'W3', xp: 610 },
  { week: 'W4', xp: 785 },
];

const DEMO_STATS = {
  totalXP: 12840,
  level: 24,
  rank: 'Gold',
  achievementsUnlocked: 34,
  longestStreak: 45,
  currentStreak: 12,
  weeklyRank: 8,
};

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export default function AnalyticsShowcaseClient() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/80 to-slate-100 dark:from-[#0A0F1E] dark:to-[#0F1A2E] relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <motion.div {...fadeIn} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-4">
            <BarChart3 size={14} /> Demo Preview
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Visualize your entire self-growth journey in one place. The {SITE_NAME} analytics dashboard brings together XP trends, category breakdowns, weekly summaries, and progress charts — so you always know where you stand and where you are heading.
          </p>
        </motion.div>

        {/* Top Stats */}
        <motion.div {...fadeIn} transition={{ delay: 0.1 }} className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Total XP', value: DEMO_STATS.totalXP.toLocaleString(), icon: Zap, color: 'text-amber-400', bg: 'bg-amber-600/10' },
            { label: 'Level', value: DEMO_STATS.level, icon: Trophy, color: 'text-blue-400', bg: 'bg-blue-600/10' },
            { label: 'Achievements', value: DEMO_STATS.achievementsUnlocked, icon: Award, color: 'text-purple-400', bg: 'bg-purple-600/10' },
            { label: 'Best Streak', value: `${DEMO_STATS.longestStreak}d`, icon: Flame, color: 'text-orange-400', bg: 'bg-orange-600/10' },
          ].map((stat) => (
            <GlassCard key={stat.label} variant="default" className="p-4 text-center">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mx-auto mb-2`}>
                <stat.icon size={20} className={stat.color} />
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </GlassCard>
          ))}
        </motion.div>

        {/* Weekly XP Chart */}
        <motion.div {...fadeIn} transition={{ delay: 0.15 }} className="mb-8">
          <GlassCard variant="glassmorphism" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <LineChart size={18} className="text-blue-400" />
                <h2 className="text-lg font-semibold text-foreground">Weekly XP</h2>
              </div>
              <span className="text-xs text-muted-foreground">This week</span>
            </div>
            <div className="flex items-end gap-3 h-36 mb-2">
              {WEEKLY_XP.map((entry) => {
                const maxXP = Math.max(...WEEKLY_XP.map(e => e.xp));
                const pct = (entry.xp / maxXP) * 100;
                return (
                  <div key={entry.day} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-muted-foreground">{entry.xp}</span>
                    <div
                      className={`w-full rounded-t-md transition-all ${
                        entry.xp === maxXP ? 'bg-gradient-to-t from-blue-600 to-blue-400' : 'bg-gradient-to-t from-blue-500/60 to-blue-400/60'
                      }`}
                      style={{ height: `${Math.max(10, pct)}%` }}
                    />
                    <span className="text-[10px] text-muted-foreground/60">{entry.day}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <TrendingUp size={14} className="text-emerald-400" />
              <span className="text-xs text-emerald-400 font-medium">+23% vs last week</span>
            </div>
          </GlassCard>
        </motion.div>

        {/* Category Breakdown */}
        <motion.div {...fadeIn} transition={{ delay: 0.2 }} className="mb-8">
          <GlassCard variant="default" className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <PieChart size={18} className="text-purple-400" />
              <h2 className="text-lg font-semibold text-foreground">XP by Category</h2>
            </div>
            <div className="space-y-3 mb-4">
              {CATEGORY_BREAKDOWN.map((cat) => (
                <div key={cat.category} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent/30 flex items-center justify-center shrink-0">
                    <cat.icon size={14} className="text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-foreground">{cat.category}</span>
                      <span className="text-xs text-muted-foreground">{cat.xp} XP ({cat.pct}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-accent/30 overflow-hidden">
                      <div className={`h-full rounded-full ${cat.color}`} style={{ width: `${cat.pct}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Monthly Trend */}
        <motion.div {...fadeIn} transition={{ delay: 0.22 }} className="mb-8">
          <GlassCard variant="default" className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-emerald-400" />
              <h2 className="text-lg font-semibold text-foreground">Monthly XP Trend</h2>
            </div>
            <div className="flex items-end gap-4 h-24 mb-2">
              {MONTHLY_TREND.map((entry) => {
                const maxXP = Math.max(...MONTHLY_TREND.map(e => e.xp));
                const pct = (entry.xp / maxXP) * 100;
                return (
                  <div key={entry.week} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-muted-foreground">{entry.xp}</span>
                    <div
                      className="w-full rounded-t-md bg-gradient-to-t from-emerald-600 to-emerald-400"
                      style={{ height: `${Math.max(10, pct)}%` }}
                    />
                    <span className="text-[10px] text-muted-foreground/60">{entry.week}</span>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </motion.div>

        {/* Weekly Summary */}
        <motion.div {...fadeIn} transition={{ delay: 0.25 }} className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-blue-400" /> Weekly Summary
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'XP Earned', value: WEEKLY_SUMMARY.totalXP, icon: Zap, color: 'text-amber-400' },
              { label: 'Tasks Done', value: WEEKLY_SUMMARY.tasksCompleted, icon: CheckCircle2, color: 'text-emerald-400' },
              { label: 'Focus Hours', value: WEEKLY_SUMMARY.focusHours, icon: Clock, color: 'text-blue-400' },
              { label: 'Workouts', value: WEEKLY_SUMMARY.workouts, icon: Dumbbell, color: 'text-orange-400' },
              { label: 'Study Sessions', value: WEEKLY_SUMMARY.studySessions, icon: BookOpen, color: 'text-purple-400' },
              { label: 'Content Published', value: WEEKLY_SUMMARY.contentPublished, icon: PenTool, color: 'text-pink-400' },
              { label: 'Best Day', value: WEEKLY_SUMMARY.bestDay, icon: Trophy, color: 'text-amber-400' },
              { label: 'New Achievements', value: WEEKLY_SUMMARY.newAchievements, icon: Award, color: 'text-rose-400' },
            ].map((item) => (
              <GlassCard key={item.label} variant="sm" className="p-3 text-center">
                <item.icon size={16} className={`mx-auto mb-1 ${item.color}`} />
                <p className="text-lg font-bold text-foreground">{item.value}</p>
                <p className="text-[10px] text-muted-foreground">{item.label}</p>
              </GlassCard>
            ))}
          </div>
        </motion.div>

        {/* Features */}
        <motion.div {...fadeIn} transition={{ delay: 0.3 }} className="mb-8">
          <GlassCard variant="liquid" className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Target size={18} className="text-blue-400" /> Analytics Features
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: BarChart3, title: 'XP Trends', desc: 'Track daily, weekly, and monthly XP trends with visual charts.' },
                { icon: PieChart, title: 'Category Breakdown', desc: 'See how your XP distributes across fitness, learning, content, and more.' },
                { icon: Calendar, title: 'Weekly Summaries', desc: 'Get a snapshot of your week — tasks, focus time, workouts, and achievements.' },
                { icon: TrendingUp, title: 'Growth Trajectory', desc: 'Visualize your long-term growth with monthly trend analysis.' },
                { icon: Award, title: 'Achievement Tracking', desc: 'Monitor unlocked achievements and see progress toward the next ones.' },
                { icon: Activity, title: 'Consistency Metrics', desc: 'Track streaks, daily averages, and consistency scores.' },
              ].map((f) => (
                <div key={f.title} className="flex items-start gap-3 p-3 rounded-xl bg-accent/20">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center shrink-0">
                    <f.icon size={16} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{f.title}</p>
                    <p className="text-xs text-muted-foreground">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* CTA */}
        <motion.div {...fadeIn} transition={{ delay: 0.35 }}>
          <GlassCard variant="glowing" className="p-6 text-center">
            <CheckCircle2 size={28} className="mx-auto mb-3 text-blue-400" />
            <h2 className="text-xl font-bold text-foreground mb-2">Visualize Your Growth</h2>
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              Join {SITE_NAME} for free and get comprehensive analytics on your self-growth journey. Track XP, visualize progress, and celebrate every milestone.
            </p>
            <Button onClick={() => router.push('/signup')} className="gradient-blue">
              Get Started Free <ArrowRight size={14} className="ml-1" />
            </Button>
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
              <button onClick={() => router.push('/showcase/gamification')} className="hover:text-foreground transition-colors flex items-center gap-1">
                Gamification Demo <ChevronRight size={12} />
              </button>
              <button onClick={() => router.push('/showcase/productivity')} className="hover:text-foreground transition-colors flex items-center gap-1">
                Productivity Demo <ChevronRight size={12} />
              </button>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
