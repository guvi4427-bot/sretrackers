'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Target, Heart, Shield, Globe, Users,
  ChevronRight, ArrowRight, Zap, Flame,
  Sparkles, Rocket, CheckCircle2, Eye,
  Scale, BookOpen, Dumbbell, Star,
  Lightbulb, Compass, Handshake,
} from 'lucide-react';
import { GlassCard } from '@/components/glass-card';
import { Button } from '@/components/ui/button';
import { SITE_NAME, SITE_TAGLINE } from '@/lib/site-config';

const CORE_VALUES = [
  {
    title: 'Growth is for Everyone',
    desc: 'We believe self-improvement should be accessible, inclusive, and free. No paywalls blocking your progress, no premium tiers gating essential features. Every person deserves the tools to become a better version of themselves, regardless of their financial situation. Our platform is and will remain free at its core because we believe that the most important investment you can make is in yourself.',
    icon: Globe,
    color: 'text-blue-400',
    bg: 'bg-blue-600/10',
  },
  {
    title: 'Community Over Competition',
    desc: 'While we have leaderboards and competitive elements, the real goal is lifting each other up. We design our social features to encourage support, not comparison. When one person succeeds, the community celebrates. When someone struggles, the community rallies. We believe that collective growth is more powerful and sustainable than isolated ambition. The best competitor you will ever face is the person you were yesterday.',
    icon: Handshake,
    color: 'text-emerald-400',
    bg: 'bg-emerald-600/10',
  },
  {
    title: 'Consistency Beats Intensity',
    desc: 'A small daily habit is more powerful than an occasional burst of effort. We celebrate streaks, not just milestones. Our gamification system is deliberately designed to reward showing up every day more than performing exceptionally once. This principle comes from behavioral science — consistent small actions compound into massive transformations over time. We want to help people understand that progress is not about perfection; it is about persistence.',
    icon: Flame,
    color: 'text-orange-400',
    bg: 'bg-orange-600/10',
  },
  {
    title: 'Privacy Matters',
    desc: 'Your data belongs to you. We are transparent about what we collect and why, and we will never sell your personal information. In an age where personal data is the currency of the internet, we take a different approach. Your habits, your workouts, your study sessions — these are deeply personal. We protect them with the same seriousness we would want for our own. We publish our privacy practices openly and welcome scrutiny.',
    icon: Shield,
    color: 'text-purple-400',
    bg: 'bg-purple-600/10',
  },
  {
    title: 'Progress, Not Perfection',
    desc: 'Everyone starts somewhere, and every step forward counts. There is no "perfect" score on our platform — only your personal best. We intentionally avoid features that punish failure or create anxiety about performance. Missing a day does not erase your progress; it is simply a data point on a longer journey. We celebrate restarts as much as starts because we understand that life is not a straight line. Setbacks are not failures — they are part of the process.',
    icon: Scale,
    color: 'text-amber-400',
    bg: 'bg-amber-600/10',
  },
];

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export default function MissionClient() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50/80 to-slate-100 dark:from-[#0A0F1E] dark:to-[#0F1A1E] relative overflow-hidden">
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-teal-600/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-blue-600/8 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <motion.div {...fadeIn} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-600/10 border border-teal-500/20 text-teal-400 text-xs font-medium mb-4">
            <Target size={14} /> Our Mission
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Start · Restart · Explore
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
            {SITE_NAME} exists to make self-growth accessible, engaging, and rewarding for everyone. Our mission is to transform the way people approach personal development — by making it feel less like a chore and more like an adventure.
          </p>
        </motion.div>

        {/* Mission Statement */}
        <motion.div {...fadeIn} transition={{ delay: 0.1 }} className="mb-8">
          <GlassCard variant="glassmorphism" className="p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-4">
              <Compass size={20} className="text-teal-400" />
              <h2 className="text-xl font-bold text-foreground">Our Mission</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We are on a mission to democratize self-improvement. For too long, the tools and knowledge needed for personal growth have been locked behind paywalls, scattered across dozens of apps, or hidden in complex systems that only the most dedicated can navigate. {SITE_NAME} changes that by bringing together fitness tracking, learning tools, content creation, productivity management, and community — all in one free, gamified platform.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The name SRE — Start, Restart, Explore — captures our philosophy perfectly. Whether you are starting a brand-new habit for the first time, restarting after a setback (which is not failure, but courage), or exploring a new dimension of your potential, we are here to support you every step of the way. Our gamification system is not just about points and badges; it is about creating a feedback loop that makes positive habits self-reinforcing.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We believe that when growth feels rewarding, people stick with it. And when people stick with it, transformation happens. That is the core insight that drives every feature we build, every design decision we make, and every line of code we write. Self-improvement should not be a luxury — it should be a joyful, accessible part of everyday life.
            </p>
          </GlassCard>
        </motion.div>

        {/* S/R/E Pillars */}
        <motion.div {...fadeIn} transition={{ delay: 0.15 }} className="mb-8">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Star size={18} className="text-teal-400" /> The S/R/E Pillars
          </h2>
          <div className="space-y-3">
            {[
              { letter: 'S', word: 'Start', color: 'text-blue-400', bg: 'bg-blue-600/20', desc: 'Every journey begins with a single step. Start new habits, set ambitious goals, and begin your transformation with the confidence that comes from having the right tools and community behind you. Starting is often the hardest part — we make it easier by removing friction and rewarding that crucial first action.' },
              { letter: 'R', word: 'Restart', color: 'text-emerald-400', bg: 'bg-emerald-600/20', desc: 'Falling off track is not failure — it is part of the process. Restart with zero judgment and full support. Your past progress is never erased, and your streaks can always be rebuilt. We designed our platform so that coming back after a break feels welcoming, not punishing. Every restart is a new opportunity.' },
              { letter: 'E', word: 'Explore', color: 'text-purple-400', bg: 'bg-purple-600/20', desc: 'Discover new dimensions of your potential. Explore fitness, learning, content creation, and productivity with tools that guide you beyond your comfort zone. Exploration is where growth accelerates — trying new things, learning unexpected skills, and pushing boundaries you did not know existed.' },
            ].map((pillar) => (
              <GlassCard key={pillar.letter} variant="default" className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl ${pillar.bg} flex items-center justify-center shrink-0`}>
                    <span className={`text-xl font-bold ${pillar.color}`}>{pillar.letter}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground mb-1">{pillar.word}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{pillar.desc}</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </motion.div>

        {/* Core Values */}
        <motion.div {...fadeIn} transition={{ delay: 0.2 }} className="mb-8">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Heart size={18} className="text-rose-400" /> Core Values
          </h2>
          <div className="space-y-3">
            {CORE_VALUES.map((value, i) => (
              <GlassCard key={value.title} variant="default" className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl ${value.bg} flex items-center justify-center shrink-0`}>
                    <value.icon size={18} className={value.color} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground/50 font-mono">0{i + 1}</span>
                      <h3 className="text-sm font-bold text-foreground">{value.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{value.desc}</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </motion.div>

        {/* What We Build */}
        <motion.div {...fadeIn} transition={{ delay: 0.25 }} className="mb-8">
          <GlassCard variant="liquid" className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb size={18} className="text-amber-400" />
              <h2 className="text-lg font-semibold text-foreground">What We Build & Why</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Every feature on {SITE_NAME} is built with intention. We do not add features for the sake of having more features — we add them because they solve real problems that real people face on their self-growth journeys. Our fitness tracker exists because tracking workouts manually is tedious. Our learning tracker exists because scattered study notes are ineffective. Our gamification system exists because willpower alone is unreliable.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: Dumbbell, title: 'Fitness', desc: 'Because physical health is the foundation of everything else.' },
                { icon: BookOpen, title: 'Learning', desc: 'Because knowledge compounds and opens doors you never knew existed.' },
                { icon: Zap, title: 'Gamification', desc: 'Because making growth rewarding makes it sustainable.' },
                { icon: Users, title: 'Community', desc: 'Because shared journeys are more powerful than solitary ones.' },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3 p-3 rounded-xl bg-accent/20">
                  <div className="w-8 h-8 rounded-lg bg-teal-600/10 flex items-center justify-center shrink-0">
                    <item.icon size={16} className="text-teal-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* CTA */}
        <motion.div {...fadeIn} transition={{ delay: 0.3 }}>
          <GlassCard variant="glowing" className="p-6 text-center">
            <CheckCircle2 size={28} className="mx-auto mb-3 text-teal-400" />
            <h2 className="text-xl font-bold text-foreground mb-2">Join Our Mission</h2>
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              Be part of a community that believes self-growth should be accessible, gamified, and community-driven. Join {SITE_NAME} for free and start your transformation today.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button onClick={() => router.push('/signup')} className="gradient-blue">
                Get Started Free <ArrowRight size={14} className="ml-1" />
              </Button>
              <Button onClick={() => router.push('/vision')} variant="outline">
                Our Vision
              </Button>
            </div>
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
              <button onClick={() => router.push('/about')} className="hover:text-foreground transition-colors flex items-center gap-1">
                About Us <ChevronRight size={12} />
              </button>
              <button onClick={() => router.push('/roadmap')} className="hover:text-foreground transition-colors flex items-center gap-1">
                Roadmap <ChevronRight size={12} />
              </button>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
