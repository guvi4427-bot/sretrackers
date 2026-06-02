'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Eye, Rocket, Globe, Sparkles, Heart,
  ChevronRight, ArrowRight, CheckCircle2,
  Users, Brain, Shield, Star, Target,
  Dumbbell, BookOpen, Smartphone, Lightbulb,
  GraduationCap, Compass, Zap,
} from 'lucide-react';
import { GlassCard } from '@/components/glass-card';
import { Button } from '@/components/ui/button';
import { SITE_NAME } from '@/lib/site-config';

const VISION_PILLARS = [
  {
    title: 'Universal Access to Growth',
    desc: 'We envision a world where anyone with an internet connection has access to world-class self-growth tools. No subscription fees, no premium tiers blocking essential features, no geographical restrictions. Whether you are a student in Mumbai, a professional in New York, or a parent in Lagos, the tools for personal transformation should be equally available. We believe that the democratization of self-improvement is not just a business strategy — it is a moral imperative. When we remove financial barriers to growth, we unlock human potential at a scale that has never been seen before.',
    icon: Globe,
    color: 'text-blue-400',
    bg: 'bg-blue-600/10',
  },
  {
    title: 'Gamification as a Force for Good',
    desc: 'Gamification has been used for decades to make people spend more time in apps, click more ads, and make more purchases. We are flipping that script. Our vision is to prove that the same psychological principles that make games addictive can be harnessed to make people healthier, smarter, and more productive. When earning XP for a workout becomes more compelling than scrolling social media, we have won. When maintaining a study streak feels as satisfying as leveling up in a game, we have created something meaningful. We want gamification to be recognized not as a manipulation tactic, but as a legitimate tool for positive behavior change.',
    icon: Zap,
    color: 'text-amber-400',
    bg: 'bg-amber-600/10',
  },
  {
    title: 'Community-Driven Transformation',
    desc: 'The most powerful force in personal growth is not willpower — it is community. We envision a platform where strangers become accountability partners, where achievements are celebrated collectively, and where the path to self-improvement is never walked alone. Our community features are designed to create genuine connections, not just social metrics. We want every user to feel that they are part of something bigger than themselves — a movement of people who believe that growth is a shared endeavor. When one person shares their progress, it inspires ten others. When someone struggles, the community lifts them up. This is the network effect of positive habits.',
    icon: Users,
    color: 'text-emerald-400',
    bg: 'bg-emerald-600/10',
  },
  {
    title: 'AI That Understands You',
    desc: 'We envision AI that goes beyond generic advice to truly understand your unique patterns, goals, and challenges. An AI that knows when you are most productive, what motivates you, and how to help you through slumps. Not an AI that replaces human judgment, but one that augments it — providing personalized insights and recommendations that you would never discover on your own. The future of AI in self-growth is not about automation; it is about augmentation. We want our AI to be the wise mentor who has studied your habits for months and can offer the exact advice you need at the exact moment you need it.',
    icon: Brain,
    color: 'text-purple-400',
    bg: 'bg-purple-600/10',
  },
];

const FUTURE_PRODUCTS = [
  {
    name: 'StudiCate',
    desc: 'A dedicated student success platform that applies SRE\'s gamification principles to academic achievement. StudiCate will offer AI-powered study planning, collaborative study rooms, flashcard systems, exam preparation tools, and progress tracking specifically designed for students. We envision StudiCate becoming the go-to tool for students worldwide who want to make studying as engaging as gaming. By translating the same consistency and streak mechanics that drive fitness and habit success into academic contexts, we aim to help millions of students achieve better results with less stress.',
    icon: GraduationCap,
    color: 'text-violet-400',
    bg: 'bg-violet-600/10',
  },
  {
    name: 'MentoLance',
    desc: 'A mentorship marketplace that connects people with experienced guides in their areas of growth. MentoLance will use AI matching to pair mentees with mentors who have walked the path they want to follow. Whether you need fitness coaching, career guidance, creative mentorship, or life advice, MentoLance will provide structured mentorship programs with milestone tracking, integrated communication, and progress reviews. We envision MentoLance making high-quality mentorship accessible to everyone — not just those who can afford expensive coaching programs. The best mentors are often those who have recently navigated the same challenges you face.',
    icon: Heart,
    color: 'text-rose-400',
    bg: 'bg-rose-600/10',
  },
  {
    name: 'SRE Mobile',
    desc: 'Native mobile applications for iOS and Android that bring the full SRE experience to your pocket. With offline support, push notifications, quick-entry widgets, and integration with Apple Health and Google Fit, the mobile app will make tracking seamless. We envision a world where logging a workout takes 10 seconds on your watch, checking your streaks is a glance at your home screen, and the AI assistant is always just a voice command away. Mobile is not just an extension of the web platform — it is the key to making growth tracking a natural, effortless part of daily life.',
    icon: Smartphone,
    color: 'text-cyan-400',
    bg: 'bg-cyan-600/10',
  },
];

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export default function VisionClient() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50/80 to-slate-100 dark:from-[#0A0F1E] dark:to-[#14101E] relative overflow-hidden">
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-violet-600/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-fuchsia-600/8 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <motion.div {...fadeIn} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-600/10 border border-violet-500/20 text-violet-400 text-xs font-medium mb-4">
            <Eye size={14} /> Our Vision
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            The Future of Self-Growth
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
            We envision a world where self-improvement is not a privilege but a universal right. Where gamification drives positive habits, where AI provides personalized guidance, and where community makes growth a shared journey.
          </p>
        </motion.div>

        {/* Vision Statement */}
        <motion.div {...fadeIn} transition={{ delay: 0.1 }} className="mb-8">
          <GlassCard variant="glassmorphism" className="p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-4">
              <Compass size={20} className="text-violet-400" />
              <h2 className="text-xl font-bold text-foreground">Our Long-Term Vision</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Imagine waking up every morning with a clear plan for self-improvement, guided by an AI that understands your patterns, motivated by a gamification system that makes growth feel rewarding, and supported by a community that celebrates your progress. That is the world we are building with {SITE_NAME}.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Today, {SITE_NAME} is a comprehensive platform for tracking fitness, learning, content, and productivity. But that is just the beginning. Our long-term vision extends far beyond tracking — we want to become the operating system for personal growth. A platform that not only records what you do but actively helps you do it better, more consistently, and with greater joy.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We see a future where the gap between wanting to improve and actually improving is closed by technology. Where the decision to start a new habit is the hardest part, and everything after that is supported, guided, and rewarded. Where restarting after a setback is not a source of shame but a celebrated act of courage. And where exploring new dimensions of your potential is not a luxury but an everyday adventure. This is the future we are committed to building — one feature, one user, and one habit at a time.
            </p>
          </GlassCard>
        </motion.div>

        {/* Vision Pillars */}
        <motion.div {...fadeIn} transition={{ delay: 0.15 }} className="mb-8">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Star size={18} className="text-violet-400" /> Vision Pillars
          </h2>
          <div className="space-y-3">
            {VISION_PILLARS.map((pillar, i) => (
              <GlassCard key={pillar.title} variant="default" className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl ${pillar.bg} flex items-center justify-center shrink-0`}>
                    <pillar.icon size={18} className={pillar.color} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground mb-1">{pillar.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{pillar.desc}</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </motion.div>

        {/* Future Products */}
        <motion.div {...fadeIn} transition={{ delay: 0.2 }} className="mb-8">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Rocket size={18} className="text-rose-400" /> Future Products
          </h2>
          <div className="space-y-3">
            {FUTURE_PRODUCTS.map((product) => (
              <GlassCard key={product.name} variant="default" hoverGlow="xp" className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl ${product.bg} flex items-center justify-center shrink-0`}>
                    <product.icon size={22} className={product.color} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground mb-1">{product.name}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{product.desc}</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </motion.div>

        {/* The World We Want */}
        <motion.div {...fadeIn} transition={{ delay: 0.25 }} className="mb-8">
          <GlassCard variant="liquid" className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb size={18} className="text-amber-400" />
              <h2 className="text-lg font-semibold text-foreground">The World We Want to Create</h2>
            </div>
            <div className="space-y-3">
              {[
                { text: 'A world where anyone can access the tools for self-improvement, regardless of income, location, or background.', icon: Globe },
                { text: 'A world where gamification is recognized as a legitimate force for positive behavior change, not just engagement metrics.', icon: Zap },
                { text: 'A world where community support is the default, not the exception — where asking for help is celebrated as strength.', icon: Users },
                { text: 'A world where AI augmentation helps people understand themselves better, make smarter decisions, and grow faster than they could alone.', icon: Brain },
                { text: 'A world where starting, restarting, and exploring are all seen as valid and valuable parts of the human experience.', icon: Compass },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-accent/20">
                  <item.icon size={16} className="text-violet-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* CTA */}
        <motion.div {...fadeIn} transition={{ delay: 0.3 }}>
          <GlassCard variant="glowing" className="p-6 text-center">
            <CheckCircle2 size={28} className="mx-auto mb-3 text-violet-400" />
            <h2 className="text-xl font-bold text-foreground mb-2">Help Us Build the Future</h2>
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              Join {SITE_NAME} today and be part of a community that is redefining self-growth. Your journey, your feedback, and your success stories shape the platform we are building.
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
              <button onClick={() => router.push('/mission')} className="hover:text-foreground transition-colors flex items-center gap-1">
                Our Mission <ChevronRight size={12} />
              </button>
              <button onClick={() => router.push('/about')} className="hover:text-foreground transition-colors flex items-center gap-1">
                About Us <ChevronRight size={12} />
              </button>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
