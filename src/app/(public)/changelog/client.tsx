'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  GitCommitHorizontal, ArrowRight, ChevronRight,
  Sparkles, Zap, Bug, Shield, Plus,
  RefreshCw, CheckCircle2, Dumbbell, BookOpen,
  PenTool, Trophy, Brain, Users, Clock,
  BarChart3, Smartphone, Globe,
} from 'lucide-react';
import { GlassCard } from '@/components/glass-card';
import { Button } from '@/components/ui/button';
import { SITE_NAME } from '@/lib/site-config';

type ChangeType = 'feature' | 'improvement' | 'fix' | 'security';

interface ChangeEntry {
  type: ChangeType;
  text: string;
}

interface VersionEntry {
  version: string;
  date: string;
  title: string;
  changes: ChangeEntry[];
}

const CHANGE_STYLES: Record<ChangeType, { label: string; color: string; bg: string; icon: typeof Plus }> = {
  feature: { label: 'New', color: 'text-emerald-400', bg: 'bg-emerald-600/10', icon: Plus },
  improvement: { label: 'Improved', color: 'text-blue-400', bg: 'bg-blue-600/10', icon: RefreshCw },
  fix: { label: 'Fixed', color: 'text-amber-400', bg: 'bg-amber-600/10', icon: Bug },
  security: { label: 'Security', color: 'text-rose-400', bg: 'bg-rose-600/10', icon: Shield },
};

const CHANGELOG: VersionEntry[] = [
  {
    version: '2.4.0',
    date: 'February 2025',
    title: 'Content Creation Tracker',
    changes: [
      { type: 'feature', text: 'Added content creation tracker with blog, video, and social post entries.' },
      { type: 'feature', text: 'Content series for organizing related posts into collections.' },
      { type: 'feature', text: 'Content pipeline view showing drafts, editing, and published states.' },
      { type: 'improvement', text: 'Enhanced XP rewards for content publishing — now 15-30 XP per entry.' },
      { type: 'improvement', text: 'Improved blog editor with better tag management and cover image support.' },
      { type: 'fix', text: 'Fixed issue where blog excerpts were not auto-generated for short content.' },
    ],
  },
  {
    version: '2.3.0',
    date: 'January 2025',
    title: 'Productivity & Time Management',
    changes: [
      { type: 'feature', text: 'Task management with AI-classified priorities and categories.' },
      { type: 'feature', text: 'Focus session timer with Deep Work, Pomodoro, and Learning modes.' },
      { type: 'feature', text: 'Day planner with time-blocked schedule for morning, afternoon, and evening.' },
      { type: 'feature', text: 'AI productivity insights — rank unproductive time and get optimization tips.' },
      { type: 'improvement', text: 'Dashboard now shows productivity score alongside fitness and learning stats.' },
      { type: 'fix', text: 'Fixed timer notification not triggering on some mobile browsers.' },
    ],
  },
  {
    version: '2.2.0',
    date: 'December 2024',
    title: 'Analytics Dashboard Overhaul',
    changes: [
      { type: 'feature', text: 'Completely redesigned analytics dashboard with weekly and monthly views.' },
      { type: 'feature', text: 'XP breakdown by category with visual progress bars.' },
      { type: 'feature', text: 'Weekly summary cards showing tasks, focus time, workouts, and achievements.' },
      { type: 'improvement', text: 'Charts now load 3x faster with optimized data queries.' },
      { type: 'improvement', text: 'Added monthly XP trend comparison with previous month.' },
      { type: 'fix', text: 'Fixed chart rendering issue on Safari with dark mode enabled.' },
    ],
  },
  {
    version: '2.1.0',
    date: 'November 2024',
    title: 'AI Assistant Upgrade',
    changes: [
      { type: 'feature', text: 'AI chatbot with conversational interface for personalized advice.' },
      { type: 'feature', text: 'AI-powered macro estimation for meal logging without exact data.' },
      { type: 'feature', text: 'AI calorie burn estimates for workouts based on type and duration.' },
      { type: 'improvement', text: 'AI progress checks now include cross-category insights and correlations.' },
      { type: 'improvement', text: 'Improved AI response accuracy by 40% with updated training data.' },
      { type: 'security', text: 'Updated AI API endpoints with enhanced rate limiting and input validation.' },
    ],
  },
  {
    version: '2.0.0',
    date: 'October 2024',
    title: 'Major Platform Release',
    changes: [
      { type: 'feature', text: 'Complete UI redesign with glass morphism design system.' },
      { type: 'feature', text: 'Gamification system — XP, achievements, streaks, levels, and leaderboards.' },
      { type: 'feature', text: 'Social community — user profiles, follow system, social feed, and messaging.' },
      { type: 'feature', text: 'Achievement system with rarity tiers from Common to Mythic.' },
      { type: 'improvement', text: 'Performance improvements — page load times reduced by 50%.' },
      { type: 'improvement', text: 'Mobile-responsive design across all pages and components.' },
      { type: 'security', text: 'Implemented CSRF protection and enhanced session management.' },
    ],
  },
  {
    version: '1.3.0',
    date: 'September 2024',
    title: 'Learning Tracker',
    changes: [
      { type: 'feature', text: 'Learning topic management with bookmark and share capabilities.' },
      { type: 'feature', text: 'Study entry logging with notes, reflections, and time tracking.' },
      { type: 'feature', text: 'Learning progress visualization with daily and weekly charts.' },
      { type: 'improvement', text: 'Enhanced topic detail view with chronological entry timeline.' },
      { type: 'fix', text: 'Fixed issue where shared topic links were not loading correctly.' },
    ],
  },
  {
    version: '1.2.0',
    date: 'August 2024',
    title: 'Fitness Tracker',
    changes: [
      { type: 'feature', text: 'Workout logging with exercises, duration, calories, and workout types.' },
      { type: 'feature', text: 'Meal tracking with macronutrient breakdowns (protein, carbs, fat).' },
      { type: 'feature', text: 'Weight progress chart with goal tracking and trend visualization.' },
      { type: 'improvement', text: 'Added fitness profile for setting goals and tracking personal records.' },
      { type: 'fix', text: 'Fixed weight chart not displaying when only one data point exists.' },
    ],
  },
  {
    version: '1.1.0',
    date: 'July 2024',
    title: 'Community Features',
    changes: [
      { type: 'feature', text: 'User profiles with bio, avatar, and public stats.' },
      { type: 'feature', text: 'Follow system with follower and following lists.' },
      { type: 'feature', text: 'Social feed with posts, likes, comments, and bookmarks.' },
      { type: 'improvement', text: 'Enhanced profile page with activity timeline and achievement showcase.' },
      { type: 'security', text: 'Added content moderation tools and community guidelines enforcement.' },
    ],
  },
  {
    version: '1.0.0',
    date: 'June 2024',
    title: 'Initial Launch',
    changes: [
      { type: 'feature', text: 'User authentication with email and Google sign-in.' },
      { type: 'feature', text: 'Onboarding flow with goal selection and profile setup.' },
      { type: 'feature', text: 'Basic dashboard with daily activity tracking.' },
      { type: 'feature', text: 'XP system for daily logins and basic activities.' },
      { type: 'security', text: 'Implemented secure session management and input sanitization.' },
    ],
  },
];

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export default function ChangelogClient() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/80 to-slate-100 dark:from-[#0A0F1E] dark:to-[#1E160F] relative overflow-hidden">
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-orange-600/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-amber-600/8 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <motion.div {...fadeIn} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-600/10 border border-orange-500/20 text-orange-400 text-xs font-medium mb-4">
            <GitCommitHorizontal size={14} /> Version History
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Changelog
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Every update, new feature, improvement, and bug fix to {SITE_NAME}. Follow the evolution of the platform from our initial launch to the latest release.
          </p>
        </motion.div>

        {/* Legend */}
        <motion.div {...fadeIn} transition={{ delay: 0.1 }} className="mb-6">
          <GlassCard variant="default" className="p-4">
            <div className="flex items-center gap-4 flex-wrap">
              {Object.entries(CHANGE_STYLES).map(([key, style]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <style.icon size={12} className={style.color} />
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${style.bg} ${style.color} font-medium`}>
                    {style.label}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Timeline */}
        <div className="relative mb-10">
          {/* Timeline line */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-border/30 hidden sm:block" />

          <div className="space-y-6">
            {CHANGELOG.map((entry, entryIndex) => (
              <motion.div
                key={entry.version}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + entryIndex * 0.05 }}
              >
                <div className="flex items-start gap-4">
                  {/* Timeline dot */}
                  <div className="hidden sm:flex w-10 h-10 rounded-full bg-orange-600/10 border border-orange-500/20 items-center justify-center shrink-0 relative z-10">
                    <span className="text-[10px] font-bold text-orange-400">{entry.version}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="sm:hidden text-xs font-bold text-orange-400">v{entry.version}</span>
                      <h2 className="text-lg font-bold text-foreground">{entry.title}</h2>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{entry.date}</p>

                    <GlassCard variant="default" className="p-4">
                      <div className="space-y-2">
                        {entry.changes.map((change, changeIndex) => {
                          const style = CHANGE_STYLES[change.type];
                          return (
                            <div key={changeIndex} className="flex items-start gap-2">
                              <div className={`w-5 h-5 rounded ${style.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                                <style.icon size={10} className={style.color} />
                              </div>
                              <p className="text-sm text-muted-foreground leading-relaxed">{change.text}</p>
                            </div>
                          );
                        })}
                      </div>
                    </GlassCard>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <motion.div {...fadeIn} transition={{ delay: 0.5 }} className="mb-8">
          <GlassCard variant="liquid" className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <BarChart3 size={18} className="text-orange-400" /> Release Statistics
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              {[
                { label: 'Releases', value: CHANGELOG.length, color: 'text-orange-400' },
                { label: 'Features', value: CHANGELOG.reduce((acc, e) => acc + e.changes.filter(c => c.type === 'feature').length, 0), color: 'text-emerald-400' },
                { label: 'Improvements', value: CHANGELOG.reduce((acc, e) => acc + e.changes.filter(c => c.type === 'improvement').length, 0), color: 'text-blue-400' },
                { label: 'Bug Fixes', value: CHANGELOG.reduce((acc, e) => acc + e.changes.filter(c => c.type === 'fix').length, 0), color: 'text-amber-400' },
              ].map((stat) => (
                <div key={stat.label} className="p-3 rounded-xl bg-accent/20">
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* CTA */}
        <motion.div {...fadeIn} transition={{ delay: 0.55 }}>
          <GlassCard variant="glowing" className="p-6 text-center">
            <CheckCircle2 size={28} className="mx-auto mb-3 text-orange-400" />
            <h2 className="text-xl font-bold text-foreground mb-2">Be Part of the Next Release</h2>
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              Join {SITE_NAME} today and experience the latest features. Your feedback shapes what we build next — every suggestion helps us improve.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button onClick={() => router.push('/signup')} className="gradient-blue">
                Get Started Free <ArrowRight size={14} className="ml-1" />
              </Button>
              <Button onClick={() => router.push('/roadmap')} variant="outline">
                View Roadmap
              </Button>
            </div>
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
              <button onClick={() => router.push('/docs')} className="hover:text-foreground transition-colors flex items-center gap-1">
                Documentation <ChevronRight size={12} />
              </button>
              <button onClick={() => router.push('/help')} className="hover:text-foreground transition-colors flex items-center gap-1">
                Help Center <ChevronRight size={12} />
              </button>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
