'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Rocket, Map, ChevronRight, ArrowRight,
  CheckCircle2, Clock, Sparkles, Users,
  Brain, Dumbbell, BookOpen, Smartphone,
  Globe, Shield, Target, Zap, Star,
  PenTool, BarChart3, Award, Heart, Trophy,
  MessageCircle, GraduationCap,
} from 'lucide-react';
import { GlassCard } from '@/components/glass-card';
import { Button } from '@/components/ui/button';
import { SITE_NAME } from '@/lib/site-config';

const ROADMAP_PHASES = [
  {
    phase: 'Completed',
    status: 'done',
    color: 'text-emerald-400',
    bg: 'bg-emerald-600/10',
    borderColor: 'border-emerald-500/20',
    items: [
      { name: 'Fitness Tracker', desc: 'Workout logging, meal tracking, weight progress, and AI health features.', icon: Dumbbell },
      { name: 'Learning Tracker', desc: 'Topic management, study entries, progress visualization, and AI progress checks.', icon: BookOpen },
      { name: 'Content Creation', desc: 'Blog posts, video tracking, social posts, content series, and publishing pipeline.', icon: PenTool },
      { name: 'Productivity Tools', desc: 'Task management, focus sessions, day planning, and AI productivity insights.', icon: Target },
      { name: 'Gamification System', desc: 'XP, achievements, streaks, levels, and leaderboards across all features.', icon: Trophy },
      { name: 'AI Assistant', desc: 'Conversational AI chat, macro estimation, calorie burn estimates, and progress reviews.', icon: Brain },
      { name: 'Social Community', desc: 'User profiles, follow system, social feed, messaging, and community guidelines.', icon: Users },
      { name: 'Analytics Dashboard', desc: 'Comprehensive charts, weekly summaries, category breakdowns, and growth trends.', icon: BarChart3 },
    ],
  },
  {
    phase: 'In Progress',
    status: 'active',
    color: 'text-blue-400',
    bg: 'bg-blue-600/10',
    borderColor: 'border-blue-500/20',
    items: [
      { name: 'Enhanced AI Features', desc: 'Deeper personalization, habit analysis, predictive streak alerts, and goal-setting AI that adapts to your patterns and suggests optimal routines for your lifestyle.', icon: Brain },
      { name: 'Advanced Analytics', desc: 'Monthly and yearly reports, comparison tools, and cross-category insights that reveal connections between your fitness, learning, and productivity patterns.', icon: BarChart3 },
      { name: 'Community Groups', desc: 'Create and join interest-based groups with shared challenges, group streaks, collaborative goals, and group-specific leaderboards for friendly competition.', icon: Users },
    ],
  },
  {
    phase: 'Planned — Q2 2025',
    status: 'planned',
    color: 'text-purple-400',
    bg: 'bg-purple-600/10',
    borderColor: 'border-purple-500/20',
    items: [
      { name: 'StudiCate', desc: 'A dedicated student module with structured study plans, exam preparation tools, collaborative study rooms, flashcard systems, and AI-powered tutoring that adapts to your learning style. StudiCate applies the same gamification principles that make SRE effective for general self-growth, but optimized specifically for academic success.', icon: GraduationCap },
      { name: 'Custom Challenges', desc: 'Create and share custom challenges with the community — 30-day fitness challenges, reading challenges, content creation sprints, and more. Track participation and award special badges for challenge completion.', icon: Star },
      { name: 'Improved Notifications', desc: 'Smart notification system with streak reminders, achievement alerts, friend activity updates, and AI-suggested optimal times for engagement based on your usage patterns.', icon: MessageCircle },
    ],
  },
  {
    phase: 'Planned — Q3 2025',
    status: 'planned',
    color: 'text-amber-400',
    bg: 'bg-amber-600/10',
    borderColor: 'border-amber-500/20',
    items: [
      { name: 'MentoLance', desc: 'A mentorship marketplace that connects users with experienced mentors and coaches in fitness, career development, creative skills, and more. MentoLance features AI-powered matching to pair mentees with the best mentors for their goals, structured mentorship programs with milestone tracking, and integrated video calling. It extends the SRE philosophy of community-driven growth into professional mentorship.', icon: Heart },
      { name: 'Mobile App (iOS & Android)', desc: 'Native mobile applications with offline support, push notifications, quick-entry widgets, and Apple Health / Google Fit integration for seamless fitness tracking on the go.', icon: Smartphone },
    ],
  },
  {
    phase: 'Future Vision',
    status: 'future',
    color: 'text-rose-400',
    bg: 'bg-rose-600/10',
    borderColor: 'border-rose-500/20',
    items: [
      { name: 'Public API & SDKs', desc: 'REST API with OAuth 2.0, webhooks for real-time events, and client libraries for JavaScript, Python, and more. Enable third-party integrations with Notion, Google Calendar, and fitness wearables.', icon: Globe },
      { name: 'Wearable Integration', desc: 'Direct sync with Apple Watch, Fitbit, Garmin, and other wearables for automatic workout and activity logging without manual entry.', icon: Smartphone },
      { name: 'AI Coaching Plans', desc: 'Fully automated AI coaching that creates personalized multi-week improvement plans, adjusts based on your progress, and provides daily guidance like a personal trainer for life.', icon: Sparkles },
      { name: 'Enterprise & Teams', desc: 'Team dashboards, company-wide wellness challenges, and organizational analytics for workplaces that want to gamify employee well-being and productivity.', icon: Shield },
    ],
  },
];

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export default function RoadmapClient() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/80 to-slate-100 dark:from-[#0A0F1E] dark:to-[#0F1E1A] relative overflow-hidden">
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-emerald-600/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-blue-600/8 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <motion.div {...fadeIn} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-4">
            <Map size={14} /> Product Roadmap
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Where We Are Headed
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
            {SITE_NAME} is constantly evolving. Explore our roadmap to see what has been built, what is in progress, and what exciting features are coming next — including StudiCate, MentoLance, and a native mobile app.
          </p>
        </motion.div>

        {/* Roadmap Phases */}
        <div className="space-y-8 mb-10">
          {ROADMAP_PHASES.map((phase, phaseIndex) => (
            <motion.div
              key={phase.phase}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + phaseIndex * 0.08 }}
            >
              {/* Phase Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-8 h-8 rounded-lg ${phase.bg} flex items-center justify-center`}>
                  {phase.status === 'done' ? <CheckCircle2 size={16} className={phase.color} /> :
                   phase.status === 'active' ? <Zap size={16} className={phase.color} /> :
                   <Clock size={16} className={phase.color} />}
                </div>
                <h2 className={`text-lg font-bold ${phase.color}`}>{phase.phase}</h2>
                <div className="flex-1 h-px bg-border/30" />
              </div>

              {/* Phase Items */}
              <div className="space-y-3 ml-11">
                {phase.items.map((item) => (
                  <GlassCard key={item.name} variant="default" className={`p-4 border ${phase.borderColor}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg ${phase.bg} flex items-center justify-center shrink-0`}>
                        <item.icon size={16} className={phase.color} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-foreground mb-0.5">{item.name}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Request Feature */}
        <motion.div {...fadeIn} transition={{ delay: 0.5 }} className="mb-8">
          <GlassCard variant="liquid" className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={18} className="text-amber-400" />
              <h2 className="text-lg font-semibold text-foreground">Shape the Future</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Your feedback directly influences our roadmap. We prioritize features based on community demand, so every suggestion matters. Whether it is a new tracking category, an AI improvement, or an integration request, we want to hear from you. The best ideas often come from the people using the platform every day.
            </p>
            <div className="flex items-center gap-3">
              <Button onClick={() => router.push('/feedback')} variant="outline" className="text-xs">
                <MessageCircle size={14} className="mr-1" /> Submit Feedback
              </Button>
              <Button onClick={() => router.push('/contact')} variant="outline" className="text-xs">
                <Globe size={14} className="mr-1" /> Contact Us
              </Button>
            </div>
          </GlassCard>
        </motion.div>

        {/* CTA */}
        <motion.div {...fadeIn} transition={{ delay: 0.55 }}>
          <GlassCard variant="glowing" className="p-6 text-center">
            <Rocket size={28} className="mx-auto mb-3 text-emerald-400" />
            <h2 className="text-xl font-bold text-foreground mb-2">Join the Journey</h2>
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              Start using {SITE_NAME} today and be part of the community that shapes the future of gamified self-growth. Every feature you see on this roadmap was influenced by users like you.
            </p>
            <Button onClick={() => router.push('/signup')} className="gradient-blue">
              Get Started Free <ArrowRight size={14} className="ml-1" />
            </Button>
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
              <button onClick={() => router.push('/changelog')} className="hover:text-foreground transition-colors flex items-center gap-1">
                Changelog <ChevronRight size={12} />
              </button>
              <button onClick={() => router.push('/vision')} className="hover:text-foreground transition-colors flex items-center gap-1">
                Our Vision <ChevronRight size={12} />
              </button>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
