'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  BookOpen, Dumbbell, PenTool, Clock, Rss, Bot,
  Sparkles, Zap, Trophy, ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/glass-card';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';

const FEATURE_CARDS = [
  {
    icon: BookOpen,
    title: 'Learning Tracker',
    description: 'Create study topics, log entries, track progress with AI tutoring',
    gradient: 'from-cyan-500 to-blue-600',
    iconBg: 'bg-cyan-500/20 border-cyan-500/30',
    iconColor: 'text-cyan-400',
  },
  {
    icon: Dumbbell,
    title: 'Fitness Tracker',
    description: 'Log workouts & meals, AI macro estimation, weight progress charts',
    gradient: 'from-emerald-500 to-green-600',
    iconBg: 'bg-emerald-500/20 border-emerald-500/30',
    iconColor: 'text-emerald-400',
  },
  {
    icon: PenTool,
    title: 'Content Creation',
    description: 'Manage series, track pipeline stages, AI script reviews',
    gradient: 'from-pink-500 to-rose-600',
    iconBg: 'bg-pink-500/20 border-pink-500/30',
    iconColor: 'text-pink-400',
  },
  {
    icon: Clock,
    title: 'Time Management',
    description: 'Smart task classification, focus timer, productivity insights',
    gradient: 'from-amber-500 to-orange-600',
    iconBg: 'bg-amber-500/20 border-amber-500/30',
    iconColor: 'text-amber-400',
  },
  {
    icon: Rss,
    title: 'Social Feed',
    description: 'Share progress, follow friends, earn XP and achievements',
    gradient: 'from-blue-500 to-indigo-600',
    iconBg: 'bg-blue-500/20 border-blue-500/30',
    iconColor: 'text-blue-400',
  },
  {
    icon: Bot,
    title: 'AI Assistants',
    description: 'Specialized AI for learning, fitness, content, productivity, and navigation',
    gradient: 'from-violet-500 to-purple-600',
    iconBg: 'bg-violet-500/20 border-violet-500/30',
    iconColor: 'text-violet-400',
  },
];

const STATS = [
  { value: '100+', label: 'Achievements', icon: Trophy },
  { value: '5', label: 'AI Assistants', icon: Bot },
  { value: '4', label: 'Growth Modules', icon: Zap },
  { value: 'Free', label: 'Forever', icon: Sparkles },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: 'easeOut' },
  }),
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1120] via-[#0F172A] to-[#1A1040] text-white overflow-x-hidden">
      {/* Nav bar */}
      <header className="sticky top-0 z-30 h-14 flex items-center justify-between px-4 backdrop-blur-xl bg-[#0B1120]/70 border-b border-white/5">
        <Logo size={28} showText />
        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white hover:bg-white/10 text-sm"
            >
              Sign In
            </Button>
          </Link>
          <Link href="/signup">
            <Button
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm rounded-lg border-0"
            >
              Sign Up Free
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 pt-20 pb-16 text-center max-w-4xl mx-auto">
        {/* Decorative gradient orb */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs text-white/60 mb-6">
            <Sparkles size={12} className="text-amber-400" />
            AI-Powered Self-Growth Platform
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight">
            Your Self-Growth,{' '}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Supercharged by AI
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-white/50 max-w-2xl mx-auto leading-relaxed">
            Track learning, fitness, content creation, and productivity — all in one platform powered by AI assistants
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl border-0 shadow-lg shadow-blue-500/25 h-12 px-8 text-base"
              >
                Get Started Free
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>
            <Link href="/home?sre_guest=true">
              <Button
                variant="outline"
                size="lg"
                className="border-white/20 text-white/80 hover:bg-white/10 hover:text-white font-semibold rounded-xl h-12 px-8 text-base"
              >
                Explore as Guest
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Feature Cards */}
      <section className="px-6 py-16 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl sm:text-3xl font-bold">Everything You Need to Grow</h2>
          <p className="text-white/40 mt-2 text-sm">Six powerful modules, one unified platform</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURE_CARDS.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <GlassCard
                  variant="default"
                  hoverGlow="blue"
                  className="p-6 h-full !bg-white/5 dark:!bg-white/[0.03] !border-white/10 hover:!border-white/20"
                >
                  <div className={cn('w-12 h-12 rounded-xl border flex items-center justify-center mb-4', feature.iconBg)}>
                    <Icon size={24} className={feature.iconColor} />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{feature.description}</p>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <GlassCard
            variant="glassmorphism"
            className="p-8"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {STATS.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    custom={i}
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="space-y-2"
                  >
                    <Icon size={20} className="mx-auto text-blue-400/60" />
                    <p className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-white/40 font-medium uppercase tracking-wider">{stat.label}</p>
                  </motion.div>
                );
              })}
            </div>
          </GlassCard>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-16 text-center max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold">
            Ready to Start Your Journey?
          </h2>
          <p className="text-white/40 mt-3 text-sm leading-relaxed">
            Join thousands who are tracking their growth, earning achievements, and building consistency — for free.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl border-0 shadow-lg shadow-blue-500/25 h-12 px-8 text-base"
              >
                Get Started Free
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>
            <Link href="/home?sre_guest=true">
              <Button
                variant="outline"
                size="lg"
                className="border-white/20 text-white/70 hover:bg-white/10 hover:text-white font-semibold rounded-xl h-12 px-8 text-base"
              >
                Explore as Guest
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-white/5 text-center">
        <div className="flex items-center justify-center flex-wrap gap-x-4 gap-y-1 text-xs text-white/30">
          <a href="/blog" className="hover:text-white/60 transition-colors">Blog</a>
          <span>·</span>
          <a href="/about" className="hover:text-white/60 transition-colors">About</a>
          <span>·</span>
          <a href="/contact" className="hover:text-white/60 transition-colors">Contact</a>
          <span>·</span>
          <a href="/privacy" className="hover:text-white/60 transition-colors">Privacy Policy</a>
          <span>·</span>
          <a href="/terms" className="hover:text-white/60 transition-colors">Terms & Conditions</a>
          <span>·</span>
          <a href="/community-guidelines" className="hover:text-white/60 transition-colors">Community Guidelines</a>
        </div>
        <p className="text-white/15 text-xs mt-3">
          Consistency beats intensity. Your growth is visible here.
        </p>
      </footer>
    </div>
  );
}
