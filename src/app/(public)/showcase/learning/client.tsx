'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  BookOpen, Clock, Flame, TrendingUp, Globe,
  Trophy, Calendar, ArrowRight, CheckCircle2,
  ChevronRight, Sparkles, Brain, Target,
} from 'lucide-react';
import { GlassCard } from '@/components/glass-card';
import { Button } from '@/components/ui/button';
import { SITE_NAME } from '@/lib/site-config';

const DEMO_TOPICS = [
  { id: 1, name: 'React & Next.js', entries: 24, hours: 18, phase: 'Explore', shared: true, streak: 5 },
  { id: 2, name: 'Data Structures', entries: 15, hours: 12, phase: 'Start', shared: false, streak: 3 },
  { id: 3, name: 'Machine Learning', entries: 8, hours: 6, phase: 'Restart', shared: true, streak: 2 },
  { id: 4, name: 'System Design', entries: 12, hours: 9, phase: 'Explore', shared: false, streak: 4 },
];

const DEMO_ENTRIES = [
  { id: 1, topic: 'React & Next.js', title: 'Server Components Deep Dive', duration: 45, date: 'Today', notes: 'Learned about RSC boundaries, streaming, and Suspense integration.' },
  { id: 2, topic: 'Data Structures', title: 'Binary Trees & BST Operations', duration: 60, date: 'Today', notes: 'Implemented insert, search, delete. Practiced on LeetCode.' },
  { id: 3, topic: 'Machine Learning', title: 'Gradient Descent Intuition', duration: 30, date: 'Yesterday', notes: 'Visualized cost function minimization with learning rate effects.' },
  { id: 4, topic: 'React & Next.js', title: 'App Router Caching Strategies', duration: 40, date: 'Yesterday', notes: 'Studied ISR, on-demand revalidation, and cache control headers.' },
];

const DEMO_STATS = {
  totalEntries: 59,
  totalTopics: 4,
  totalHours: 45,
  currentStreak: 12,
  longestStreak: 28,
  totalXP: 1680,
  sharedCollections: 2,
};

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export default function LearningShowcaseClient() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50/80 to-slate-100 dark:from-[#0A0F1E] dark:to-[#0F1A2E] relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <motion.div {...fadeIn} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-600/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium mb-4">
            <BookOpen size={14} /> Demo Preview
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Learning Tracker
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Organize your study topics, log learning sessions, build streaks, and watch your knowledge grow — all with gamified XP and achievements. The {SITE_NAME} learning dashboard makes self-education feel like an adventure.
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div {...fadeIn} transition={{ delay: 0.1 }} className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Study Entries', value: DEMO_STATS.totalEntries, icon: BookOpen, color: 'text-cyan-400', bg: 'bg-cyan-600/10' },
            { label: 'Current Streak', value: `${DEMO_STATS.currentStreak}d`, icon: Flame, color: 'text-orange-400', bg: 'bg-orange-600/10' },
            { label: 'Study Hours', value: DEMO_STATS.totalHours, icon: Clock, color: 'text-blue-400', bg: 'bg-blue-600/10' },
            { label: 'Learning XP', value: DEMO_STATS.totalXP, icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-600/10' },
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

        {/* Topics Section */}
        <motion.div {...fadeIn} transition={{ delay: 0.15 }} className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Target size={18} className="text-cyan-400" /> Study Topics
            </h2>
            <span className="text-xs text-muted-foreground">Demo data</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {DEMO_TOPICS.map((topic) => (
              <GlassCard key={topic.id} variant="default" hoverGlow="xp" className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{topic.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-600/15 text-cyan-300 font-medium">{topic.phase} Phase</span>
                      {topic.shared && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-600/15 text-green-300 font-medium flex items-center gap-1">
                          <Globe size={10} /> Shared
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-xs text-orange-400">
                      <Flame size={12} /> {topic.streak}d streak
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><BookOpen size={12} /> {topic.entries} entries</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> {topic.hours}h studied</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </motion.div>

        {/* Recent Entries */}
        <motion.div {...fadeIn} transition={{ delay: 0.2 }} className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <BookOpen size={18} className="text-cyan-400" /> Recent Entries
            </h2>
          </div>
          <div className="space-y-3">
            {DEMO_ENTRIES.map((entry) => (
              <GlassCard key={entry.id} variant="default" className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-600/15 text-cyan-300 font-medium">{entry.topic}</span>
                      <span className="text-[10px] text-muted-foreground/50">{entry.date}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-foreground mb-1">{entry.title}</h3>
                    <p className="text-xs text-muted-foreground">{entry.notes}</p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                      <Clock size={12} /> {entry.duration} min
                    </div>
                    <div className="flex items-center gap-1 text-xs text-amber-400">
                      <Trophy size={12} /> +10 XP
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </motion.div>

        {/* Features Highlight */}
        <motion.div {...fadeIn} transition={{ delay: 0.3 }} className="mb-8">
          <GlassCard variant="liquid" className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Sparkles size={18} className="text-cyan-400" /> What You Get
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: BookOpen, title: 'Topic Organization', desc: 'Create study topics and organize entries within them.' },
                { icon: Clock, title: 'Session Logging', desc: 'Track study duration, notes, and reflections per session.' },
                { icon: Brain, title: 'AI Progress Checks', desc: 'Get personalized insights on your learning patterns.' },
                { icon: Globe, title: 'Share Collections', desc: 'Make topics public to share knowledge with the community.' },
                { icon: Trophy, title: 'XP & Achievements', desc: 'Earn XP for every session and unlock learning milestones.' },
                { icon: Calendar, title: 'Study Streaks', desc: 'Build daily streaks and maintain consistent study habits.' },
              ].map((f) => (
                <div key={f.title} className="flex items-start gap-3 p-3 rounded-xl bg-accent/20">
                  <div className="w-8 h-8 rounded-lg bg-cyan-600/10 flex items-center justify-center shrink-0">
                    <f.icon size={16} className="text-cyan-400" />
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
            <CheckCircle2 size={28} className="mx-auto mb-3 text-cyan-400" />
            <h2 className="text-xl font-bold text-foreground mb-2">Start Tracking Your Learning</h2>
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              Join {SITE_NAME} for free and turn your learning journey into an adventure. Log sessions, build streaks, earn XP, and watch your knowledge grow.
            </p>
            <Button onClick={() => router.push('/signup')} className="gradient-blue">
              Get Started Free <ArrowRight size={14} className="ml-1" />
            </Button>
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
              <button onClick={() => router.push('/features/learning')} className="hover:text-foreground transition-colors flex items-center gap-1">
                Learning Features <ChevronRight size={12} />
              </button>
              <button onClick={() => router.push('/showcase/fitness')} className="hover:text-foreground transition-colors flex items-center gap-1">
                Fitness Demo <ChevronRight size={12} />
              </button>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
