'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  BookOpen, Dumbbell, PenTool, Trophy, BarChart3, Bot,
  Flame, Zap, Star, ArrowRight, LogIn, UserPlus, Eye,
  Sun, Moon, ChevronRight, Target, Users, MessageCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { SITE_NAME, SITE_SHORT_NAME, SITE_TAGLINE } from '@/lib/site-config';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import Link from 'next/link';

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const PHASES = [
  {
    icon: Zap,
    title: 'Start',
    description: 'Beginning your journey — build new habits, learn new skills, and lay the foundation for a better you.',
    color: 'text-blue-400',
    bg: 'bg-blue-600/10',
    border: 'border-blue-500/20',
    glow: 'group-hover:shadow-[0_0_25px_rgba(59,130,246,0.3)]',
  },
  {
    icon: Flame,
    title: 'Restart',
    description: 'Getting back on track — recommit, refresh, and rebuild the momentum you once had.',
    color: 'text-orange-400',
    bg: 'bg-orange-600/10',
    border: 'border-orange-500/20',
    glow: 'group-hover:shadow-[0_0_25px_rgba(249,115,22,0.3)]',
  },
  {
    icon: Star,
    title: 'Explore',
    description: 'Discovering new paths — creative projects, teaching others, and expanding your horizons.',
    color: 'text-yellow-400',
    bg: 'bg-yellow-600/10',
    border: 'border-yellow-500/20',
    glow: 'group-hover:shadow-[0_0_25px_rgba(245,158,11,0.3)]',
  },
];

const FEATURES = [
  {
    icon: BookOpen,
    title: 'Learning',
    description: 'Track topics, log study entries, and watch your knowledge grow with AI-powered progress checks.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-600/10',
  },
  {
    icon: Dumbbell,
    title: 'Fitness',
    description: 'Log workouts, track nutrition, monitor weight trends, and get AI coaching for your body goals.',
    color: 'text-green-400',
    bg: 'bg-green-600/10',
  },
  {
    icon: PenTool,
    title: 'Content Creation',
    description: 'Track blogs, videos, and social posts. Plan with series calendars and optimize posting times with AI.',
    color: 'text-purple-400',
    bg: 'bg-purple-600/10',
  },
  {
    icon: Target,
    title: 'Time Management',
    description: 'Organize tasks, plan your day, use the focus timer, and let AI classify and rank your productivity.',
    color: 'text-rose-400',
    bg: 'bg-rose-600/10',
  },
  {
    icon: Trophy,
    title: 'Gamification',
    description: 'Earn XP, level up, unlock achievements, build streaks, and compete on community leaderboards.',
    color: 'text-yellow-400',
    bg: 'bg-yellow-600/10',
  },
  {
    icon: Bot,
    title: 'AI Assistant',
    description: 'AI-powered tutoring, macro estimation, script review, progress checks, and personalized guidance.',
    color: 'text-violet-400',
    bg: 'bg-violet-600/10',
  },
  {
    icon: Users,
    title: 'Community',
    description: 'Follow friends, share progress, join groups, and stay accountable with a supportive community.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-600/10',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description: 'Visualize your learning, fitness, and focus trends with detailed 7-day to all-time analytics.',
    color: 'text-indigo-400',
    bg: 'bg-indigo-600/10',
  },
  {
    icon: MessageCircle,
    title: 'Social Feed',
    description: 'Post updates, comment, like, repost, and discover what the community is working on.',
    color: 'text-blue-400',
    bg: 'bg-blue-600/10',
  },
];

/* ------------------------------------------------------------------ */
/*  Animation helpers                                                  */
/* ------------------------------------------------------------------ */

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: 'easeOut' as const },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function LandingPageClient({ isGuest }: { isGuest?: boolean }) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleGuest = () => {
    document.cookie = 'sre_guest=true; path=/; max-age=86400; SameSite=Lax';
    localStorage.setItem('sre_guest', 'true');
    router.push('/feed');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 dark:from-[#0A0F1E] dark:to-[#1E3A5F] relative overflow-x-hidden">
      {/* Decorative blurs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-2/3 left-1/2 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px] pointer-events-none" />

      {/* ---- Top Navigation ---- */}
      <header className="sticky top-0 z-30 h-14 flex items-center justify-between px-4 glass-glowing">
        <div className="flex items-center gap-2">
          <Logo size={28} showText />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="text-muted-foreground hover:text-foreground transition-colors p-2"
            aria-label="Toggle theme"
          >
            {mounted && (theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />)}
          </button>
          <Button
            onClick={() => router.push('/login')}
            size="sm"
            className="gradient-blue text-white font-semibold h-8 px-3 text-xs rounded-lg"
          >
            <LogIn size={14} className="mr-1" /> Sign In
          </Button>
          <Button
            onClick={() => router.push('/signup')}
            size="sm"
            variant="outline"
            className="border-border text-foreground font-semibold h-8 px-3 text-xs rounded-lg"
          >
            <UserPlus size={14} className="mr-1" /> Sign Up
          </Button>
        </div>
      </header>

      {/* ---- Hero Section ---- */}
      <section className="relative z-10 flex flex-col items-center text-center px-4 pt-16 pb-12 sm:pt-24 sm:pb-16 max-w-3xl mx-auto">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-6"
        >
          <Logo size={72} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-3"
        >
          {SITE_SHORT_NAME}
          <span className="block text-xl sm:text-2xl font-medium text-muted-foreground mt-1">
            {SITE_TAGLINE}
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="text-base sm:text-lg text-muted-foreground max-w-xl mb-8 leading-relaxed"
        >
          {SITE_NAME} is a free gamified self-growth platform. Track your learning, fitness, and content creation journeys publicly. 
          Earn XP, build streaks, unlock achievements, and grow with a supportive accountability community.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto"
        >
          <Button
            onClick={() => router.push('/signup')}
            size="lg"
            className="gradient-blue text-white font-bold h-12 px-8 text-base rounded-xl hover:opacity-90 transition-opacity w-full sm:w-auto"
          >
            Get Started Free <ArrowRight size={18} className="ml-2" />
          </Button>
          <Button
            onClick={() => router.push('/login')}
            size="lg"
            variant="outline"
            className="border-border text-foreground font-semibold h-12 px-8 text-base rounded-xl w-full sm:w-auto"
          >
            <LogIn size={18} className="mr-2" /> Sign In
          </Button>
          <Button
            onClick={handleGuest}
            size="lg"
            variant="ghost"
            className="text-muted-foreground font-medium h-12 px-6 text-base rounded-xl w-full sm:w-auto"
          >
            <Eye size={18} className="mr-2" /> Browse as Guest
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="text-xs text-muted-foreground/50 mt-4"
        >
          100% free. No credit card required.
        </motion.p>
      </section>

      {/* ---- Phases Section ---- */}
      <section className="relative z-10 px-4 pb-12 sm:pb-16 max-w-4xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={staggerContainer}
          className="text-center mb-8"
        >
          <motion.h2 variants={fadeInUp} custom={0} className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Your Journey, Your Phase
          </motion.h2>
          <motion.p variants={fadeInUp} custom={1} className="text-muted-foreground max-w-lg mx-auto">
            Whether you&apos;re starting fresh, getting back on track, or exploring new horizons — {SITE_SHORT_NAME} adapts to where you are.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {PHASES.map((phase, i) => {
            const PhaseIcon = phase.icon;
            return (
              <motion.div
                key={phase.title}
                variants={fadeInUp}
                custom={i}
                className={`group glass-card p-6 text-center transition-all duration-300 ${phase.border} ${phase.glow}`}
              >
                <div className={`rounded-xl p-3 ${phase.bg} inline-flex mb-4`}>
                  <PhaseIcon size={28} className={phase.color} />
                </div>
                <h3 className={`text-lg font-bold ${phase.color} mb-2`}>{phase.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{phase.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ---- Features Grid ---- */}
      <section className="relative z-10 px-4 pb-12 sm:pb-16 max-w-5xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={staggerContainer}
          className="text-center mb-8"
        >
          <motion.h2 variants={fadeInUp} custom={0} className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Everything You Need to Grow
          </motion.h2>
          <motion.p variants={fadeInUp} custom={1} className="text-muted-foreground max-w-lg mx-auto">
            Nine powerful modules designed to keep you consistent, accountable, and progressing every single day.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {FEATURES.map((feature, i) => {
            const FeatureIcon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={fadeInUp}
                custom={i}
                className="group glass-card p-5 transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex items-start gap-4">
                  <div className={`rounded-xl p-2.5 ${feature.bg} shrink-0`}>
                    <FeatureIcon size={22} className={feature.color} />
                  </div>
                  <div className="min-w-0">
                    <h3 className={`text-sm font-bold ${feature.color} mb-1`}>{feature.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ---- Social Proof / CTA Section ---- */}
      <section className="relative z-10 px-4 pb-12 sm:pb-16 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="glass-card glass-morphism p-8 sm:p-10 text-center"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            Ready to Start Your Growth Journey?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Join a community of self-improvers who track, share, and celebrate their progress every day. Your consistency compounds.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => router.push('/signup')}
              size="lg"
              className="gradient-blue text-white font-bold h-12 px-8 text-base rounded-xl hover:opacity-90 transition-opacity"
            >
              Create Free Account <ArrowRight size={18} className="ml-2" />
            </Button>
            <Button
              onClick={handleGuest}
              size="lg"
              variant="outline"
              className="border-border text-foreground font-semibold h-12 px-8 text-base rounded-xl"
            >
              <Eye size={18} className="mr-2" /> Browse as Guest
            </Button>
          </div>
        </motion.div>
      </section>

      {/* ---- Footer ---- */}
      <footer className="relative z-10 pb-8 pt-4 px-4">
        <div className="max-w-3xl mx-auto flex items-center justify-center flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground/50">
          <Link href="/about" className="hover:text-muted-foreground transition-colors">About</Link>
          <span>&middot;</span>
          <Link href="/contact" className="hover:text-muted-foreground transition-colors">Contact</Link>
          <span>&middot;</span>
          <Link href="/privacy" className="hover:text-muted-foreground transition-colors">Privacy Policy</Link>
          <span>&middot;</span>
          <Link href="/terms" className="hover:text-muted-foreground transition-colors">Terms &amp; Conditions</Link>
          <span>&middot;</span>
          <Link href="/community-guidelines" className="hover:text-muted-foreground transition-colors">Community Guidelines</Link>
        </div>
        <p className="text-center text-[11px] text-muted-foreground/30 mt-2">
          &copy; {new Date().getFullYear()} {SITE_NAME}. Built for consistency, accountability, and real visible progress.
        </p>
      </footer>
    </div>
  );
}
