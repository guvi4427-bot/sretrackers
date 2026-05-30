'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Zap, BookOpen, Dumbbell, PenTool, Clock, Trophy, Flame, Star, Target, Award, BarChart3, ChevronRight } from 'lucide-react';
import { GlassCard } from '@/components/glass-card';
import { AdCard } from '@/components/ad-banner';
import { XPBar } from '@/components/xp-bar';
import { StreakBadge } from '@/components/streak-badge';
import { useUserStore } from '@/stores/user-store';
import { t } from '@/lib/i18n';

const phaseConfig: Record<string, { icon: any; color: string; bg: string; nameKey: string; descKey: string }> = {
  start: { icon: Zap, color: 'text-blue-400', bg: 'bg-blue-600/20', nameKey: 'phase.start', descKey: 'phase.start.desc' },
  restart: { icon: Flame, color: 'text-amber-400', bg: 'bg-amber-600/20', nameKey: 'phase.restart', descKey: 'phase.restart.desc' },
  explore: { icon: Star, color: 'text-purple-400', bg: 'bg-purple-600/20', nameKey: 'phase.explore', descKey: 'phase.explore.desc' },
};

const statIcons = [
  { key: 'learning', icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-600/20' },
  { key: 'workouts', icon: Dumbbell, color: 'text-red-400', bg: 'bg-red-600/20' },
  { key: 'focus', icon: Clock, color: 'text-purple-400', bg: 'bg-purple-600/20' },
  { key: 'meals', icon: Target, color: 'text-amber-400', bg: 'bg-amber-600/20' },
];

const activityTypeIcons: Record<string, any> = { learning: BookOpen, workout: Dumbbell, content: PenTool, focus: Clock };

export default function HomeClient() {
  const router = useRouter();
  const { profile, fetchProfile } = useUserStore();
  const [homeData, setHomeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const res = await fetch(`/api/home?_t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) setHomeData(await res.json());
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    const handler = () => { fetchProfile(); loadData(); };
    window.addEventListener('xp-updated', handler);
    window.addEventListener('phases-updated', handler);
    return () => { window.removeEventListener('xp-updated', handler); window.removeEventListener('phases-updated', handler); };
  }, [fetchProfile, loadData]);

  if (!profile || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <Zap className="w-8 h-8 text-blue-400" />
        </motion.div>
      </div>
    );
  }

  const hour = new Date().getHours();
  const greetingKey = hour < 12 ? 'home.greeting.morning' : hour < 17 ? 'home.greeting.afternoon' : hour < 21 ? 'home.greeting.evening' : 'home.greeting.night';
  const quickStats = homeData?.quickStats || { learningEntries: 0, workouts: 0, focusMinutes: 0, meals: 0 };
  const recentActivity = homeData?.recentActivity || [];
  const leaderboard = homeData?.leaderboard || [];
  const quests = homeData?.quests || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t(greetingKey)}, {profile.name?.split(' ')[0] || 'Explorer'}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t('xp.keepUp')}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard hoverGlow="rank" className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center"><Star className="w-5 h-5 text-purple-400" /></div><div><p className="text-xs text-muted-foreground">{t('xp.level')}</p><p className="text-xl font-bold text-foreground">{profile.level}</p></div></div></GlassCard>
        <GlassCard hoverGlow="xp" className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-amber-600/20 flex items-center justify-center"><Zap className="w-5 h-5 text-amber-400" /></div><div><p className="text-xs text-muted-foreground">XP</p><p className="text-xl font-bold text-foreground">{profile.xp.toLocaleString()}</p></div></div></GlassCard>
        <GlassCard hoverGlow="streak" className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-red-600/20 flex items-center justify-center"><Flame className="w-5 h-5 text-red-400" /></div><div><p className="text-xs text-muted-foreground">{t('xp.streak')}</p><p className="text-xl font-bold text-foreground">{profile.currentStreak}d</p></div></div></GlassCard>
        <GlassCard hoverGlow="blue" className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center"><Trophy className="w-5 h-5 text-blue-400" /></div><div><p className="text-xs text-muted-foreground">Achievements</p><p className="text-xl font-bold text-foreground">{homeData?.achievementCount || 0}</p></div></div></GlassCard>
      </div>

      <GlassCard className="p-5">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">{t('xp.level')} Progress</h3>
        <XPBar xp={profile.xp} level={profile.level} />
      </GlassCard>

      {profile.activePhases.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Your Phases</h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {profile.activePhases.map((phase) => {
              const config = phaseConfig[phase];
              if (!config) return null;
              const Icon = config.icon;
              const activities = profile.phaseActivityMap[phase]?.activities || [];
              return (
                <motion.button key={phase} whileHover={{ scale: 1.03 }} onClick={() => router.push(`/phase/${phase}`)}
                  className={`flex items-center gap-3 rounded-xl px-5 py-4 ${config.bg} border border-border hover:border-blue-500/30 transition-all shrink-0`}>
                  <Icon size={22} className={config.color} />
                  <div className="text-left">
                    <p className={`text-sm font-semibold ${config.color}`}>{t(config.nameKey)}</p>
                    <p className="text-[10px] text-muted-foreground">{activities.length} {t('onboarding.activities')}</p>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">{t('home.quickStats')}</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {statIcons.map(({ key, icon: Icon, color, bg }) => (
            <GlassCard key={key} className="p-3 text-center">
              <Icon className={`w-5 h-5 ${color} mx-auto mb-1`} />
              <p className="text-lg font-bold text-foreground">{quickStats[key === 'learning' ? 'learningEntries' : key === 'focus' ? 'focusMinutes' : key] || 0}</p>
              <p className="text-[10px] text-muted-foreground">{t(key === 'learning' ? 'nav.learning' : key === 'workouts' ? 'nav.fitness' : key === 'focus' ? 'nav.time' : key)}</p>
            </GlassCard>
          ))}
        </div>
      </div>

      {(quests.length > 0 || true) && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">{t('home.dailyQuests')}</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <GlassCard className="p-4 border-l-2 border-l-teal-500/50">
              <p className="text-sm font-medium text-teal-300">{t('home.logYourDay')}</p>
              <p className="text-[10px] text-muted-foreground mt-1">+10 XP</p>
            </GlassCard>
            {quests.slice(0, 3).map((q: any, i: number) => (
              <GlassCard key={i} className={`p-4 border-l-2 ${q.completed ? 'border-l-green-500/50' : 'border-l-blue-500/50'}`}>
                <p className={`text-sm font-medium ${q.completed ? 'text-green-300 line-through' : 'text-foreground'}`}>{q.title}</p>
                <p className="text-[10px] text-muted-foreground mt-1">+{q.xpReward} XP</p>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {leaderboard.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-muted-foreground">{t('leaderboard.title')}</h3>
            <button onClick={() => router.push('/leaderboard')} className="text-xs text-blue-400 hover:text-blue-300">{t('common.seeAll')}</button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {leaderboard.slice(0, 5).map((entry: any, i: number) => (
              <motion.button key={entry.userId || i} whileHover={{ scale: 1.03 }} onClick={() => router.push(`/profile/${entry.userId}`)}
                className="flex flex-col items-center gap-2 p-3 rounded-xl glass-card-sm shrink-0 min-w-[80px]">
                <div className="w-10 h-10 rounded-full gradient-blue flex items-center justify-center text-white text-sm font-bold">{entry.name?.[0] || '?'}</div>
                <p className="text-xs font-medium text-foreground truncate max-w-[70px]">{entry.name || 'User'}</p>
                <p className="text-[10px] text-amber-400">{entry.xp || 0} XP</p>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {recentActivity.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">{t('home.recentActivity')}</h3>
          <div className="space-y-2">
            {recentActivity.slice(0, 5).map((activity: any, i: number) => {
              const Icon = activityTypeIcons[activity.type] || Zap;
              return (
                <GlassCard key={i} className="p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center"><Icon size={16} className="text-blue-400" /></div>
                  <div className="flex-1 min-w-0"><p className="text-sm text-foreground truncate">{activity.title || activity.type}</p><p className="text-[10px] text-muted-foreground">{activity.timeAgo || ''}</p></div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      )}

      <GlassCard className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <StreakBadge streak={profile.currentStreak} size="md" />
            <div>
              <p className="text-sm font-medium text-foreground">{t('home.streakInfo')}</p>
              <p className="text-xs text-muted-foreground">{t('xp.longest')}: {profile.longestStreak}d</p>
            </div>
          </div>
          {profile.lastActiveDate === new Date().toISOString().split('T')[0] && (
            <span className="text-xs text-emerald-400 bg-emerald-600/20 px-2 py-1 rounded-full">{t('home.activeToday')}</span>
          )}
        </div>
      </GlassCard>

      {/* Ad Banner — bottom of page, above footer */}
      <AdCard format="in-feed" slot="home_bottom" />
    </div>
  );
}
