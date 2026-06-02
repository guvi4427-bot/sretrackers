'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Zap, Trophy, Flame, Star, Award, Target,
  ArrowRight, ChevronRight, Crown, Medal,
  Shield, Swords, TrendingUp, CheckCircle2,
  Lock, Unlock, Sparkles, Gem, Rocket,
} from 'lucide-react';
import { GlassCard } from '@/components/glass-card';
import { Button } from '@/components/ui/button';
import { SITE_NAME } from '@/lib/site-config';

const DEMO_LEVEL = {
  level: 24,
  title: 'Consistency Champion',
  currentXP: 2840,
  xpToNext: 3500,
  xpInLevel: 660,
  totalXP: 12840,
  rank: 'Gold',
};

const DEMO_ACHIEVEMENTS = [
  { id: 1, name: 'First Step', desc: 'Complete your first task', icon: Star, rarity: 'Common', unlocked: true, xp: 10 },
  { id: 2, name: 'Week Warrior', desc: '7-day activity streak', icon: Flame, rarity: 'Uncommon', unlocked: true, xp: 25 },
  { id: 3, name: 'Knowledge Seeker', desc: 'Log 50 study entries', icon: Award, rarity: 'Rare', unlocked: true, xp: 50 },
  { id: 4, name: 'Iron Will', desc: '30-day consistency streak', icon: Shield, rarity: 'Epic', unlocked: true, xp: 100 },
  { id: 5, name: 'Content Creator', desc: 'Publish 20 blog posts', icon: Sparkles, rarity: 'Rare', unlocked: true, xp: 75 },
  { id: 6, name: 'Fitness Fanatic', desc: 'Complete 100 workouts', icon: Trophy, rarity: 'Epic', unlocked: true, xp: 100 },
  { id: 7, name: 'Zen Master', desc: '50 meditation sessions', icon: Gem, rarity: 'Legendary', unlocked: false, xp: 200 },
  { id: 8, name: 'Unstoppable', desc: '365-day streak', icon: Crown, rarity: 'Mythic', unlocked: false, xp: 500 },
];

const DEMO_STREAKS = [
  { name: 'Daily Login', days: 45, best: 62, color: 'text-amber-400', bg: 'bg-amber-600/10' },
  { name: 'Workout Streak', days: 12, best: 28, color: 'text-emerald-400', bg: 'bg-emerald-600/10' },
  { name: 'Learning Streak', days: 8, best: 35, color: 'text-blue-400', bg: 'bg-blue-600/10' },
  { name: 'Content Streak', days: 3, best: 14, color: 'text-purple-400', bg: 'bg-purple-600/10' },
];

const DEMO_LEADERBOARD = [
  { rank: 1, name: 'Sarah K.', xp: 18500, level: 32, avatar: 'S' },
  { rank: 2, name: 'Mike T.', xp: 16200, level: 29, avatar: 'M' },
  { rank: 3, name: 'Aisha R.', xp: 14800, level: 27, avatar: 'A' },
  { rank: 4, name: 'You', xp: 12840, level: 24, avatar: 'Y', isYou: true },
  { rank: 5, name: 'Chris L.', xp: 11900, level: 23, avatar: 'C' },
];

const RARITY_COLORS: Record<string, string> = {
  Common: 'text-slate-400',
  Uncommon: 'text-emerald-400',
  Rare: 'text-blue-400',
  Epic: 'text-purple-400',
  Legendary: 'text-amber-400',
  Mythic: 'text-rose-400',
};

const RARITY_BG: Record<string, string> = {
  Common: 'bg-slate-600/10',
  Uncommon: 'bg-emerald-600/10',
  Rare: 'bg-blue-600/10',
  Epic: 'bg-purple-600/10',
  Legendary: 'bg-amber-600/10',
  Mythic: 'bg-rose-600/10',
};

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export default function GamificationShowcaseClient() {
  const router = useRouter();
  const xpPercent = Math.round((DEMO_LEVEL.xpInLevel / (DEMO_LEVEL.xpToNext - DEMO_LEVEL.currentXP + DEMO_LEVEL.xpInLevel)) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/80 to-slate-100 dark:from-[#0A0F1E] dark:to-[#1E0F1A] relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-amber-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <motion.div {...fadeIn} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-600/10 border border-rose-500/20 text-rose-400 text-xs font-medium mb-4">
            <Trophy size={14} /> Demo Preview
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Gamification System
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Turn your self-growth journey into an adventure with {SITE_NAME}&apos;s gamification system. Earn XP for every positive action, unlock achievements for milestones, build impressive streaks, and level up as you transform your habits. Every step forward is rewarded.
          </p>
        </motion.div>

        {/* Level & XP Card */}
        <motion.div {...fadeIn} transition={{ delay: 0.1 }} className="mb-8">
          <GlassCard variant="glassmorphism" className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-500/20 to-rose-500/20 border border-amber-500/30 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-3xl font-bold text-amber-400">{DEMO_LEVEL.level}</p>
                  <p className="text-[10px] text-amber-400/70">LEVEL</p>
                </div>
              </div>
              <div className="flex-1 w-full">
                <div className="flex items-center gap-2 mb-1">
                  <Crown size={16} className="text-amber-400" />
                  <h2 className="text-lg font-bold text-foreground">{DEMO_LEVEL.title}</h2>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-600/15 text-amber-400 font-medium">{DEMO_LEVEL.rank}</span>
                </div>
                <div className="w-full h-4 rounded-full bg-accent/30 overflow-hidden mb-2">
                  <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all" style={{ width: `${xpPercent}%` }} />
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{DEMO_LEVEL.xpInLevel} / {DEMO_LEVEL.xpToNext - DEMO_LEVEL.currentXP + DEMO_LEVEL.xpInLevel} XP to Level {DEMO_LEVEL.level + 1}</span>
                  <span>Total: {DEMO_LEVEL.totalXP.toLocaleString()} XP</span>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Streaks */}
        <motion.div {...fadeIn} transition={{ delay: 0.15 }} className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Flame size={18} className="text-orange-400" /> Active Streaks
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {DEMO_STREAKS.map((streak) => (
              <GlassCard key={streak.name} variant="default" hoverGlow="streak" className="p-4 text-center">
                <div className={`w-12 h-12 rounded-xl ${streak.bg} flex items-center justify-center mx-auto mb-2`}>
                  <Flame size={24} className={streak.color} />
                </div>
                <p className="text-2xl font-bold text-foreground">{streak.days}</p>
                <p className="text-xs text-muted-foreground">{streak.name}</p>
                <p className="text-[10px] text-muted-foreground/50 mt-1">Best: {streak.best} days</p>
              </GlassCard>
            ))}
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div {...fadeIn} transition={{ delay: 0.2 }} className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Award size={18} className="text-amber-400" /> Achievements
            </h2>
            <span className="text-xs text-muted-foreground">{DEMO_ACHIEVEMENTS.filter(a => a.unlocked).length}/{DEMO_ACHIEVEMENTS.length} Unlocked</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DEMO_ACHIEVEMENTS.map((ach) => (
              <GlassCard key={ach.id} variant="default" className={`p-4 ${!ach.unlocked ? 'opacity-50' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl ${RARITY_BG[ach.rarity]} flex items-center justify-center shrink-0 relative`}>
                    <ach.icon size={22} className={RARITY_COLORS[ach.rarity]} />
                    {!ach.unlocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl">
                        <Lock size={14} className="text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{ach.name}</p>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded ${RARITY_BG[ach.rarity]} ${RARITY_COLORS[ach.rarity]} font-medium`}>{ach.rarity}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{ach.desc}</p>
                    <p className="text-[10px] text-amber-400 mt-0.5">+{ach.xp} XP</p>
                  </div>
                  {ach.unlocked && <Unlock size={14} className="text-emerald-400 shrink-0" />}
                </div>
              </GlassCard>
            ))}
          </div>
        </motion.div>

        {/* Leaderboard */}
        <motion.div {...fadeIn} transition={{ delay: 0.25 }} className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Swords size={18} className="text-blue-400" /> Leaderboard
          </h2>
          <GlassCard variant="default" className="p-4">
            <div className="space-y-2">
              {DEMO_LEADERBOARD.map((entry) => (
                <div key={entry.rank} className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  entry.isYou ? 'bg-blue-600/10 border border-blue-500/20' : 'hover:bg-accent/20'
                }`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold text-sm ${
                    entry.rank === 1 ? 'bg-amber-600/15 text-amber-400' :
                    entry.rank === 2 ? 'bg-slate-400/15 text-slate-400' :
                    entry.rank === 3 ? 'bg-orange-600/15 text-orange-400' :
                    'bg-accent/30 text-muted-foreground'
                  }`}>
                    {entry.rank}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-xs font-semibold text-foreground shrink-0">
                    {entry.avatar}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${entry.isYou ? 'text-blue-400' : 'text-foreground'}`}>
                      {entry.name} {entry.isYou && <span className="text-[10px] text-blue-400/70">(you)</span>}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Level {entry.level}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-amber-400">{entry.xp.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">XP</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* XP Sources */}
        <motion.div {...fadeIn} transition={{ delay: 0.28 }} className="mb-8">
          <GlassCard variant="liquid" className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Zap size={18} className="text-amber-400" /> How to Earn XP
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: Flame, title: 'Daily Login', desc: 'Stay consistent — earn XP every day you visit.', xp: '5 XP' },
                { icon: Trophy, title: 'Complete Workouts', desc: 'Log workouts and earn XP based on duration.', xp: '15-30 XP' },
                { icon: Star, title: 'Study Sessions', desc: 'Log learning entries and build knowledge.', xp: '10-25 XP' },
                { icon: Sparkles, title: 'Publish Content', desc: 'Write blog posts and share with the community.', xp: '15-30 XP' },
                { icon: Shield, title: 'Complete Tasks', desc: 'Finish daily tasks and check off goals.', xp: '10-20 XP' },
                { icon: Award, title: 'Unlock Achievements', desc: 'Hit milestones and earn bonus XP rewards.', xp: '10-500 XP' },
                { icon: Rocket, title: 'Focus Sessions', desc: 'Run deep work and Pomodoro sessions.', xp: '10-25 XP' },
                { icon: Medal, title: 'Streak Bonuses', desc: 'Maintain streaks for multiplier bonuses.', xp: '2x multiplier' },
              ].map((f) => (
                <div key={f.title} className="flex items-start gap-3 p-3 rounded-xl bg-accent/20">
                  <div className="w-8 h-8 rounded-lg bg-amber-600/10 flex items-center justify-center shrink-0">
                    <f.icon size={16} className="text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">{f.title}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-600/10 text-amber-400 font-medium">{f.xp}</span>
                    </div>
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
            <CheckCircle2 size={28} className="mx-auto mb-3 text-rose-400" />
            <h2 className="text-xl font-bold text-foreground mb-2">Level Up Your Life</h2>
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              Join {SITE_NAME} for free and gamify your self-growth journey. Earn XP, unlock achievements, build streaks, and climb the leaderboard — all while becoming your best self.
            </p>
            <Button onClick={() => router.push('/signup')} className="gradient-blue">
              Get Started Free <ArrowRight size={14} className="ml-1" />
            </Button>
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
              <button onClick={() => router.push('/showcase/analytics')} className="hover:text-foreground transition-colors flex items-center gap-1">
                Analytics Demo <ChevronRight size={12} />
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
