'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Clock, CheckCircle2, Target, Zap, Calendar,
  Timer, ListTodo, ArrowRight, ChevronRight,
  BarChart3, Trophy, Focus, Sun, Moon, Coffee,
  Brain, TrendingUp, Sparkles,
} from 'lucide-react';
import { GlassCard } from '@/components/glass-card';
import { Button } from '@/components/ui/button';
import { SITE_NAME } from '@/lib/site-config';

const DEMO_TASKS = [
  { id: 1, title: 'Complete project proposal', priority: 'High', category: 'Work', completed: true, xp: 20, time: '9:00 AM' },
  { id: 2, title: 'Review pull requests', priority: 'Medium', category: 'Work', completed: true, xp: 10, time: '10:30 AM' },
  { id: 3, title: 'Study React patterns', priority: 'High', category: 'Learning', completed: true, xp: 15, time: '11:00 AM' },
  { id: 4, title: 'Write blog post draft', priority: 'Medium', category: 'Content', completed: false, xp: 15, time: '2:00 PM' },
  { id: 5, title: 'Evening workout', priority: 'High', category: 'Fitness', completed: false, xp: 20, time: '6:00 PM' },
  { id: 6, title: 'Read 30 pages', priority: 'Low', category: 'Learning', completed: false, xp: 10, time: '8:00 PM' },
];

const DEMO_FOCUS_SESSIONS = [
  { id: 1, task: 'Project Proposal', duration: 90, type: 'Deep Work', completedAt: '10:30 AM', xp: 25 },
  { id: 2, task: 'React Study', duration: 45, type: 'Learning', completedAt: '12:00 PM', xp: 15 },
  { id: 3, task: 'Code Review', duration: 25, type: 'Pomodoro', completedAt: '1:00 PM', xp: 10 },
];

const DEMO_DAY_PLAN = [
  { time: '6:00 AM', block: 'Morning Routine', icon: Sun, color: 'text-amber-400', bg: 'bg-amber-600/10', status: 'done' },
  { time: '7:00 AM', block: 'Deep Work Session', icon: Brain, color: 'text-blue-400', bg: 'bg-blue-600/10', status: 'done' },
  { time: '9:00 AM', block: 'Project Work', icon: Target, color: 'text-emerald-400', bg: 'bg-emerald-600/10', status: 'done' },
  { time: '12:00 PM', block: 'Lunch Break', icon: Coffee, color: 'text-orange-400', bg: 'bg-orange-600/10', status: 'done' },
  { time: '1:00 PM', block: 'Study & Learning', icon: Sparkles, color: 'text-purple-400', bg: 'bg-purple-600/10', status: 'active' },
  { time: '3:00 PM', block: 'Content Creation', icon: Timer, color: 'text-pink-400', bg: 'bg-pink-600/10', status: 'upcoming' },
  { time: '6:00 PM', block: 'Fitness & Exercise', icon: Zap, color: 'text-emerald-400', bg: 'bg-emerald-600/10', status: 'upcoming' },
  { time: '8:00 PM', block: 'Evening Wind Down', icon: Moon, color: 'text-indigo-400', bg: 'bg-indigo-600/10', status: 'upcoming' },
];

const DEMO_STATS = {
  tasksToday: 6,
  tasksCompleted: 3,
  focusMinutes: 160,
  totalFocusToday: 240,
  streak: 12,
  weeklyXP: 320,
  totalXP: 4250,
  productivityScore: 87,
};

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export default function ProductivityShowcaseClient() {
  const router = useRouter();

  const priorityColor = (p: string) => {
    switch (p) {
      case 'High': return 'bg-rose-600/15 text-rose-400';
      case 'Medium': return 'bg-amber-600/15 text-amber-400';
      default: return 'bg-blue-600/15 text-blue-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/80 to-slate-100 dark:from-[#0A0F1E] dark:to-[#1E1A0F] relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <motion.div {...fadeIn} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-600/10 border border-amber-500/20 text-amber-400 text-xs font-medium mb-4">
            <Clock size={14} /> Demo Preview
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Productivity & Time Management
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Plan your day, manage tasks, run focus sessions, and track your productivity with gamified rewards. The {SITE_NAME} productivity suite helps you make every hour count — earn XP for completing tasks and staying focused.
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div {...fadeIn} transition={{ delay: 0.1 }} className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Tasks Done', value: `${DEMO_STATS.tasksCompleted}/${DEMO_STATS.tasksToday}`, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-600/10' },
            { label: 'Focus Time', value: `${DEMO_STATS.focusMinutes}m`, icon: Timer, color: 'text-amber-400', bg: 'bg-amber-600/10' },
            { label: 'Day Streak', value: DEMO_STATS.streak, icon: Zap, color: 'text-orange-400', bg: 'bg-orange-600/10' },
            { label: 'Productivity XP', value: DEMO_STATS.totalXP, icon: Trophy, color: 'text-blue-400', bg: 'bg-blue-600/10' },
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

        {/* Productivity Score */}
        <motion.div {...fadeIn} transition={{ delay: 0.15 }} className="mb-8">
          <GlassCard variant="glassmorphism" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 size={18} className="text-amber-400" />
                <h2 className="text-lg font-semibold text-foreground">Today&apos;s Productivity</h2>
              </div>
              <span className="text-2xl font-bold text-amber-400">{DEMO_STATS.productivityScore}%</span>
            </div>
            <div className="w-full h-4 rounded-full bg-accent/30 overflow-hidden mb-3">
              <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all" style={{ width: `${DEMO_STATS.productivityScore}%` }} />
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-sm font-bold text-emerald-400">{DEMO_STATS.tasksCompleted}</p>
                <p className="text-[10px] text-muted-foreground">Tasks Done</p>
              </div>
              <div>
                <p className="text-sm font-bold text-amber-400">{DEMO_STATS.focusMinutes}m</p>
                <p className="text-[10px] text-muted-foreground">Focus Time</p>
              </div>
              <div>
                <p className="text-sm font-bold text-blue-400">+{DEMO_STATS.weeklyXP}</p>
                <p className="text-[10px] text-muted-foreground">XP This Week</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Day Plan */}
        <motion.div {...fadeIn} transition={{ delay: 0.2 }} className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-amber-400" /> Day Plan
          </h2>
          <GlassCard variant="default" className="p-4">
            <div className="space-y-2">
              {DEMO_DAY_PLAN.map((block) => (
                <div key={block.time} className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${
                  block.status === 'active' ? 'bg-amber-600/10 border border-amber-500/20' :
                  block.status === 'done' ? 'opacity-60' : ''
                }`}>
                  <span className="text-xs text-muted-foreground w-16 shrink-0">{block.time}</span>
                  <div className={`w-8 h-8 rounded-lg ${block.bg} flex items-center justify-center shrink-0`}>
                    <block.icon size={14} className={block.color} />
                  </div>
                  <span className={`text-sm flex-1 ${block.status === 'done' ? 'line-through text-muted-foreground' : 'text-foreground font-medium'}`}>
                    {block.block}
                  </span>
                  {block.status === 'done' && <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />}
                  {block.status === 'active' && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-600/20 text-amber-400 shrink-0">Now</span>}
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Tasks */}
        <motion.div {...fadeIn} transition={{ delay: 0.25 }} className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <ListTodo size={18} className="text-amber-400" /> Today&apos;s Tasks
            </h2>
            <span className="text-xs text-muted-foreground">Demo data</span>
          </div>
          <div className="space-y-2">
            {DEMO_TASKS.map((task) => (
              <GlassCard key={task.id} variant="sm" className="p-3">
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${
                    task.completed ? 'bg-emerald-500 border-emerald-500' : 'border-muted-foreground/30'
                  }`}>
                    {task.completed && <CheckCircle2 size={12} className="text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground font-medium'}`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${priorityColor(task.priority)}`}>{task.priority}</span>
                      <span className="text-[10px] text-muted-foreground">{task.category}</span>
                      <span className="text-[10px] text-muted-foreground/50">{task.time}</span>
                    </div>
                  </div>
                  <span className="text-xs text-amber-400 shrink-0">+{task.xp} XP</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </motion.div>

        {/* Focus Sessions */}
        <motion.div {...fadeIn} transition={{ delay: 0.28 }} className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Timer size={18} className="text-amber-400" /> Focus Sessions
          </h2>
          <div className="space-y-2">
            {DEMO_FOCUS_SESSIONS.map((session) => (
              <GlassCard key={session.id} variant="default" className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-600/10 flex items-center justify-center">
                      <Focus size={18} className="text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{session.task}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground">{session.type}</span>
                        <span className="text-[10px] text-muted-foreground/50">·</span>
                        <span className="text-[10px] text-muted-foreground">{session.duration} min</span>
                        <span className="text-[10px] text-muted-foreground/50">·</span>
                        <span className="text-[10px] text-muted-foreground">{session.completedAt}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-amber-400">+{session.xp} XP</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </motion.div>

        {/* Features */}
        <motion.div {...fadeIn} transition={{ delay: 0.3 }} className="mb-8">
          <GlassCard variant="liquid" className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Target size={18} className="text-amber-400" /> Productivity Features
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: ListTodo, title: 'Smart Tasks', desc: 'AI-classified tasks with priority and category suggestions.' },
                { icon: Timer, title: 'Focus Sessions', desc: 'Deep work, Pomodoro, and learning timers with XP rewards.' },
                { icon: Calendar, title: 'Day Planning', desc: 'Time-block your day with morning, afternoon, and evening slots.' },
                { icon: Zap, title: 'XP Rewards', desc: 'Earn XP for completing tasks and focus sessions.' },
                { icon: TrendingUp, title: 'Productivity Score', desc: 'Daily score based on task completion and focus time.' },
                { icon: Brain, title: 'AI Insights', desc: 'Get tips on unproductive time and ranking of distractions.' },
              ].map((f) => (
                <div key={f.title} className="flex items-start gap-3 p-3 rounded-xl bg-accent/20">
                  <div className="w-8 h-8 rounded-lg bg-amber-600/10 flex items-center justify-center shrink-0">
                    <f.icon size={16} className="text-amber-400" />
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
            <CheckCircle2 size={28} className="mx-auto mb-3 text-amber-400" />
            <h2 className="text-xl font-bold text-foreground mb-2">Take Control of Your Time</h2>
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              Join {SITE_NAME} for free and gamify your productivity. Plan your day, run focus sessions, complete tasks, and earn XP for staying on track.
            </p>
            <Button onClick={() => router.push('/signup')} className="gradient-blue">
              Get Started Free <ArrowRight size={14} className="ml-1" />
            </Button>
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
              <button onClick={() => router.push('/showcase/analytics')} className="hover:text-foreground transition-colors flex items-center gap-1">
                Analytics Demo <ChevronRight size={12} />
              </button>
              <button onClick={() => router.push('/showcase/gamification')} className="hover:text-foreground transition-colors flex items-center gap-1">
                Gamification Demo <ChevronRight size={12} />
              </button>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
