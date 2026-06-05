'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Award, Lock, Unlock, Sparkles, Trophy, BookOpen, Dumbbell, Clock, PenTool, ChevronRight, X, Star, Flame, Loader2 } from 'lucide-react';
import { GlassCard } from '@/components/glass-card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserStore } from '@/stores/user-store';
import { t } from '@/lib/i18n';

interface Achievement {
  id: string;
  key: string;
  name: string;
  description: string;
  iconEmoji: string;
  xpReward: number;
  tier: string;
  category: string;
  criteria: string | null;
  unlocked: boolean;
  unlockedAt: string | null;
  eligible: boolean;
  currentProgress: number;
}

interface CriteriaObj {
  type: string;
  value: number;
}

const CATEGORY_CONFIG: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  learning: { icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-600/20', label: 'Learning' },
  fitness: { icon: Dumbbell, color: 'text-green-400', bg: 'bg-green-600/20', label: 'Fitness' },
  time: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-600/20', label: 'Time' },
  content: { icon: PenTool, color: 'text-purple-400', bg: 'bg-purple-600/20', label: 'Content' },
};

const TIER_CONFIG: Record<string, { color: string; border: string; glow: string; label: string }> = {
  bronze: { color: 'text-amber-600', border: 'border-amber-700/30', glow: '', label: 'Bronze' },
  silver: { color: 'text-gray-300', border: 'border-gray-400/30', glow: '', label: 'Silver' },
  gold: { color: 'text-yellow-400', border: 'border-yellow-500/30', glow: 'shadow-yellow-500/10', label: 'Gold' },
  platinum: { color: 'text-cyan-300', border: 'border-cyan-400/30', glow: 'shadow-cyan-400/10', label: 'Platinum' },
};

function getCriteriaLabel(type: string): string {
  const labels: Record<string, string> = {
    learning_entries: 'Learning entries',
    learning_topics: 'Topics created',
    learning_notes: 'Entries with notes',
    learning_duration: 'Study minutes',
    learning_shared: 'Shared topics',
    learning_deep_topic: 'Max entries in one topic',
    fitness_workouts: 'Workouts logged',
    fitness_meals: 'Meals logged',
    fitness_weights: 'Weight entries',
    fitness_workout_duration: 'Workout minutes',
    time_focus: 'Focus sessions',
    time_tasks: 'Tasks completed',
    time_focus_duration: 'Focus minutes',
    content_posts: 'Posts created',
    content_scripts: 'Scripts written',
    content_videos: 'Video plans created',
    content_blogs: 'Blog posts written',
    content_live_posted: 'Content posted live',
    content_live_pipeline_blog: 'Blog posts published live',
    content_live_pipeline_video: 'Videos published live',
    content_live_pipeline_post: 'Posts published live',
    streak: 'Current streak',
    longest_streak: 'Longest streak',
    level: 'Current level',
    xp: 'Total XP',
    followers: 'Followers',
  };
  return labels[type] || type;
}

// Celebration overlay component
function CelebrationOverlay({ achievement, onClose }: { achievement: Achievement | null; onClose: () => void }) {
  if (!achievement) return null;

  const tierConfig = TIER_CONFIG[achievement.tier] || TIER_CONFIG.bronze;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Floating particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            backgroundColor: ['#F59E0B', '#3B82F6', '#8B5CF6', '#10B981', '#EF4444', '#06B6D4'][i % 6],
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [0, 1.5, 0],
            opacity: [0, 1, 0],
            y: [0, -100 - Math.random() * 200],
            x: [(Math.random() - 0.5) * 200],
          }}
          transition={{ duration: 1.5 + Math.random(), delay: Math.random() * 0.5, ease: 'easeOut' }}
        />
      ))}

      <motion.div
        initial={{ scale: 0.5, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', damping: 15 }}
        className="relative max-w-sm w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <GlassCard variant="glassmorphism" className="p-8 text-center">
          {/* Big emoji */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 10, delay: 0.2 }}
            className="text-7xl mb-4"
          >
            {achievement.iconEmoji}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <p className="text-xs font-medium text-amber-400 uppercase tracking-wider mb-1">
              {t('achievements.unlocked')}!
            </p>
            <h2 className={`text-xl font-bold ${tierConfig.color} mb-2`}>
              {achievement.name}
            </h2>
            <p className="text-sm text-muted-foreground mb-4">{achievement.description}</p>

            {/* XP reward */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.6 }}
              className="inline-flex items-center gap-1.5 bg-amber-500/20 px-4 py-2 rounded-full mb-6"
            >
              <Sparkles size={16} className="text-amber-400" />
              <span className="text-lg font-bold text-amber-400">+{achievement.xpReward} XP</span>
            </motion.div>
          </motion.div>

          <Button onClick={onClose} className="gradient-blue w-full">
            {t('achievements.awesome')}
          </Button>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}

function AchievementsContent() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [claiming, setClaiming] = useState<string | null>(null);
  const [celebration, setCelebration] = useState<Achievement | null>(null);
  const [detailAchievement, setDetailAchievement] = useState<Achievement | null>(null);
  const profile = useUserStore((s) => s.profile);
  const { fetchProfile } = useUserStore();

  const fetchAchievements = useCallback(async () => {
    setLoading(true);
    try {
      // Cache-bust to always get fresh achievement eligibility data
      const res = await fetch('/api/achievements?_t=' + Date.now(), { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setAchievements(data.achievements || []);
        // Notify app-shell to refresh notification count (GET endpoint creates achievement_eligible notifications)
        window.dispatchEvent(new CustomEvent('notification-updated'));
      }
    } catch (err) {
      console.error('Failed to fetch achievements:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAchievements(); }, [fetchAchievements]);

  // Re-fetch achievements when XP/progress updates happen (so newly eligible achievements appear instantly)
  useEffect(() => {
    function handleProgressUpdate() {
      fetchAchievements();
    }
    window.addEventListener('xp-updated', handleProgressUpdate);
    window.addEventListener('notification-updated', handleProgressUpdate);
    // Also re-fetch when window gains focus (user navigated back from another page)
    window.addEventListener('focus', handleProgressUpdate);
    return () => {
      window.removeEventListener('xp-updated', handleProgressUpdate);
      window.removeEventListener('notification-updated', handleProgressUpdate);
      window.removeEventListener('focus', handleProgressUpdate);
    };
  }, [fetchAchievements]);

  const filtered = categoryFilter === 'all'
    ? achievements
    : achievements.filter((a) => a.category === categoryFilter);

  const unlocked = achievements.filter((a) => a.unlocked).length;
  const eligibleCount = achievements.filter((a) => a.eligible && !a.unlocked).length;
  const totalXPFromAchievements = achievements
    .filter((a) => a.unlocked)
    .reduce((sum, a) => sum + a.xpReward, 0);

  async function claimAchievement(achievement: Achievement) {
    setClaiming(achievement.id);
    try {
      const r = await fetch('/api/achievements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ achievementId: achievement.id }),
      });
      if (r.ok) {
        // Show celebration!
        setCelebration(achievement);
        setDetailAchievement(null);
        // Dispatch events so app-shell + other pages refresh
        window.dispatchEvent(new CustomEvent('xp-updated'));
        window.dispatchEvent(new CustomEvent('notification-updated'));
        // Refresh profile immediately, delay achievements refresh slightly
        // to ensure server-side checkAndNotifyEligibleAchievements completes
        fetchProfile();
        setTimeout(() => { fetchAchievements(); }, 300);
      } else {
        const d = await r.json();
        toast.error(d.error || 'Failed to claim');
      }
    } catch {
      toast.error('Failed to claim achievement');
    } finally {
      setClaiming(null);
    }
  }

  function getCriteriaInfo(criteriaStr: string | null): { label: string; current: number; required: number; progress: number } | null {
    if (!criteriaStr) return null;
    try {
      const c: CriteriaObj = JSON.parse(criteriaStr);
      return {
        label: getCriteriaLabel(c.type),
        current: 0, // Will be filled from achievement data
        required: c.value,
        progress: 0,
      };
    } catch {
      return null;
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl gradient-rank flex items-center justify-center">
          <Trophy className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground">{t('achievements.title')}</h1>
          <p className="text-xs text-muted-foreground/70">{t('achievements.subtitle')}</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <GlassCard variant="liquid" className="p-3 text-center">
          <p className="text-xl font-bold text-foreground">{unlocked}<span className="text-muted-foreground/50 text-sm">/{achievements.length}</span></p>
          <p className="text-[10px] text-muted-foreground/70">{t('achievements.unlocked')}</p>
        </GlassCard>
        <GlassCard variant="liquid" className="p-3 text-center">
          <p className="text-xl font-bold text-amber-400">{totalXPFromAchievements}</p>
          <p className="text-[10px] text-muted-foreground/70">{t('achievements.xpEarned')}</p>
        </GlassCard>
        <GlassCard variant="liquid" className="p-3 text-center">
          <p className="text-xl font-bold text-green-400">{eligibleCount}</p>
          <p className="text-[10px] text-muted-foreground/70">{t('achievements.readyToClaim')}</p>
        </GlassCard>
        <GlassCard variant="liquid" className="p-3 text-center">
          <p className="text-xl font-bold text-cyan-300">
            {achievements.filter((a) => a.unlocked && a.tier === 'platinum').length}
          </p>
          <p className="text-[10px] text-muted-foreground/70">Platinum</p>
        </GlassCard>
      </div>

      {/* Category Filter Tabs */}
      <Tabs value={categoryFilter} onValueChange={setCategoryFilter}>
        <TabsList className="bg-accent border border-border w-full flex overflow-x-auto">
          <TabsTrigger value="all" className="text-muted-foreground data-[state=active]:text-blue-400 data-[state=active]:bg-blue-600/20 text-xs flex-1">
            All
          </TabsTrigger>
          {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <TabsTrigger key={key} value={key} className="text-muted-foreground data-[state=active]:text-blue-400 data-[state=active]:bg-blue-600/20 text-xs flex-1">
                <Icon size={12} className="mr-1" />
                {config.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value={categoryFilter} className="mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map((achievement, i) => {
                const tierConfig = TIER_CONFIG[achievement.tier] || TIER_CONFIG.bronze;
                const criteriaInfo = getCriteriaInfo(achievement.criteria);
                const progress = criteriaInfo ? Math.min(100, Math.round((achievement.currentProgress / criteriaInfo.required) * 100)) : 0;

                return (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                  >
                    <GlassCard
                      variant={achievement.unlocked ? 'glassmorphism' : achievement.eligible ? 'glowing' : 'default'}
                      className={`p-4 cursor-pointer transition-all ${achievement.unlocked ? '' : achievement.eligible ? 'hover:scale-[1.02]' : 'opacity-70'}`}
                      onClick={() => setDetailAchievement(achievement)}
                    >
                      <div className="flex items-start gap-3">
                        {/* Emoji */}
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                          achievement.unlocked ? 'bg-white/10' : achievement.eligible ? 'bg-amber-500/10 animate-pulse' : 'bg-white/5'
                        }`}>
                          {achievement.unlocked ? achievement.iconEmoji : achievement.eligible ? achievement.iconEmoji : '🔒'}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <p className={`text-sm font-semibold truncate ${achievement.unlocked ? tierConfig.color : achievement.eligible ? 'text-amber-400' : 'text-muted-foreground/60'}`}>
                              {achievement.name}
                            </p>
                            {achievement.eligible && !achievement.unlocked && (
                              <span className="text-[9px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full font-medium shrink-0">CLAIMABLE</span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground/70 leading-snug line-clamp-2">{achievement.description}</p>

                          {/* Progress bar */}
                          {criteriaInfo && !achievement.unlocked && (
                            <div className="mt-2">
                              <div className="flex justify-between text-[9px] text-muted-foreground/50 mb-0.5">
                                <span>{achievement.currentProgress}/{criteriaInfo.required} {criteriaInfo.label}</span>
                                <span>{progress}%</span>
                              </div>
                              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${progress}%` }}
                                  transition={{ duration: 0.8, delay: i * 0.02 }}
                                  className={`h-full rounded-full ${achievement.eligible ? 'bg-green-500' : 'bg-blue-500'}`}
                                />
                              </div>
                            </div>
                          )}

                          {/* Tier + XP */}
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`text-[9px] font-medium uppercase tracking-wider ${tierConfig.color}`}>{achievement.tier}</span>
                            <span className="text-[9px] text-amber-400/70">+{achievement.xpReward} XP</span>
                          </div>
                        </div>

                        <ChevronRight size={14} className="text-muted-foreground/30 shrink-0 mt-1" />
                      </div>
                    </GlassCard>
                  </motion.div>
                );
              })}
            </div>
          )}
          {filtered.length === 0 && !loading && (
            <div className="text-center py-12">
              <Award className="w-10 h-10 mx-auto mb-3 text-muted-foreground/20" />
              <p className="text-sm text-muted-foreground/50">{t('achievements.noAchievements')}</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Achievement Detail Dialog */}
      <AnimatePresence>
        {detailAchievement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setDetailAchievement(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-sm w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <GlassCard variant="deep" className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl ${detailAchievement.unlocked ? 'bg-white/10' : 'bg-white/5'}`}>
                      {detailAchievement.unlocked ? detailAchievement.iconEmoji : '🔒'}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-foreground">{detailAchievement.name}</h3>
                      <span className={`text-[10px] font-medium uppercase tracking-wider ${TIER_CONFIG[detailAchievement.tier]?.color || 'text-amber-600'}`}>
                        {detailAchievement.tier}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => setDetailAchievement(null)} className="text-muted-foreground hover:text-foreground p-1">
                    <X size={16} />
                  </button>
                </div>

                <p className="text-sm text-muted-foreground mb-4">{detailAchievement.description}</p>

                {/* Criteria */}
                {detailAchievement.criteria && (() => {
                  const criteriaInfo = getCriteriaInfo(detailAchievement.criteria);
                  if (!criteriaInfo) return null;
                  const progress = Math.min(100, Math.round((detailAchievement.currentProgress / criteriaInfo.required) * 100));
                  return (
                    <div className="bg-accent/50 rounded-xl p-3 mb-4">
                      <p className="text-xs font-medium text-muted-foreground mb-2">{t('achievements.criteria')}</p>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-muted-foreground">{criteriaInfo.label}</span>
                        <span className={detailAchievement.currentProgress >= criteriaInfo.required ? 'text-green-400' : 'text-foreground'}>
                          {detailAchievement.currentProgress}/{criteriaInfo.required}
                        </span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.8 }}
                          className={`h-full rounded-full ${detailAchievement.unlocked ? 'bg-amber-500' : detailAchievement.eligible ? 'bg-green-500' : 'bg-blue-500'}`}
                        />
                      </div>
                    </div>
                  );
                })()}

                {/* XP Reward */}
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={14} className="text-amber-400" />
                  <span className="text-sm text-amber-400 font-medium">+{detailAchievement.xpReward} XP</span>
                </div>

                {/* Status / Claim Button */}
                {detailAchievement.unlocked ? (
                  <div className="flex items-center gap-2 text-green-400 text-sm">
                    <Unlock size={14} />
                    <span>{t('achievements.claimedOn')} {detailAchievement.unlockedAt ? new Date(detailAchievement.unlockedAt).toLocaleDateString() : ''}</span>
                  </div>
                ) : detailAchievement.eligible ? (
                  <Button
                    onClick={() => claimAchievement(detailAchievement)}
                    disabled={claiming === detailAchievement.id}
                    className="gradient-gold text-gray-900 w-full font-bold"
                  >
                    {claiming === detailAchievement.id ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Trophy size={14} className="mr-2" />
                    )}
                    {t('achievements.claim')}
                  </Button>
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground/50 text-sm">
                    <Lock size={14} />
                    <span>{t('achievements.criteriaNotMet')}</span>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Celebration Overlay */}
      <AnimatePresence>
        {celebration && (
          <CelebrationOverlay achievement={celebration} onClose={() => setCelebration(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AchievementsPage() {
  return (
    <Suspense>
      <AchievementsContent />
    </Suspense>
  );
}
