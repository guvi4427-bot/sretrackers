'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { BadgeCheck, Zap, Flame, Star, Trophy, UserPlus, UserMinus, BookOpen, Clock, Flag, AlertTriangle, Loader2, Dumbbell, Video, Share2, FileText, Film, Edit3, ExternalLink, PenTool, Check, Lock } from 'lucide-react';
import { GlassCard } from '@/components/glass-card';
import { AdCard } from '@/components/ad-banner';
import { XPBar } from '@/components/xp-bar';
import { StreakBadge } from '@/components/streak-badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useUserStore } from '@/stores/user-store';
import { t } from '@/lib/i18n';
import { safeJsonParse } from '@/lib/utils';
import { useParams, useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { WorkoutChart } from '@/app/(main)/fitness/_charts';
import { useGuest } from '@/components/guest-guard';

const phaseConfig: Record<string, { icon: any; color: string; bg: string; nameKey: string }> = {
  start: { icon: Zap, color: 'text-blue-400', bg: 'bg-blue-600/20', nameKey: 'phase.start' },
  restart: { icon: Flame, color: 'text-amber-400', bg: 'bg-amber-600/20', nameKey: 'phase.restart' },
  explore: { icon: Star, color: 'text-purple-400', bg: 'bg-purple-600/20', nameKey: 'phase.explore' },
};

// Live status pipeline per content type (same as content page)
const LIVE_STATUS_PIPELINES: Record<string, { key: string; label: string; color: string; icon: any }[]> = {
  blog: [
    { key: 'not_started', label: 'Not Started', color: 'text-muted-foreground bg-white/5', icon: FileText },
    { key: 'written', label: 'Written', color: 'text-blue-400 bg-blue-600/20', icon: PenTool },
    { key: 'posted', label: 'Posted', color: 'text-green-400 bg-green-600/20', icon: ExternalLink },
  ],
  video: [
    { key: 'not_started', label: 'Not Started', color: 'text-muted-foreground bg-white/5', icon: Film },
    { key: 'scripted', label: 'Scripted', color: 'text-purple-400 bg-purple-600/20', icon: PenTool },
    { key: 'shoot', label: 'Shoot', color: 'text-red-400 bg-red-600/20', icon: Video },
    { key: 'edit', label: 'Edit', color: 'text-amber-400 bg-amber-600/20', icon: Edit3 },
    { key: 'posted', label: 'Posted', color: 'text-green-400 bg-green-600/20', icon: ExternalLink },
  ],
  post: [
    { key: 'not_started', label: 'Not Started', color: 'text-muted-foreground bg-white/5', icon: FileText },
    { key: 'shoot', label: 'Shoot', color: 'text-red-400 bg-red-600/20', icon: Video },
    { key: 'edit', label: 'Edit', color: 'text-amber-400 bg-amber-600/20', icon: Edit3 },
    { key: 'posted', label: 'Posted', color: 'text-green-400 bg-green-600/20', icon: ExternalLink },
  ],
};

function getPipeline(contentType: string) {
  return LIVE_STATUS_PIPELINES[contentType] || LIVE_STATUS_PIPELINES.post;
}

function getPipelineStepIndex(contentType: string, liveStatus: string) {
  const pipeline = getPipeline(contentType);
  return pipeline.findIndex(s => s.key === liveStatus);
}

const contentTypeIcon = (type: string) => {
  switch (type) {
    case 'blog': return <FileText size={12} />;
    case 'video': return <Film size={12} />;
    default: return <PenTool size={12} />;
  }
};

const contentTypeLabel = (type: string) => {
  switch (type) {
    case 'blog': return 'Blog';
    case 'video': return 'Video';
    case 'post': return 'Post';
    default: return type;
  }
};

export default function UserProfileClient() {
  const { userId } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { profile: myProfile } = useUserStore();
  const { isGuest, showLoginPrompt } = useGuest();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [followersOpen, setFollowersOpen] = useState(false);
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [followStatus, setFollowStatus] = useState<'none' | 'pending' | 'accepted'>('none');
  const highlightAchievement = searchParams.get('achievement');

  // Report dialog
  const [reportOpen, setReportOpen] = useState(false);
  const [reportCategory, setReportCategory] = useState('');
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);

  const [sharedWorkouts, setSharedWorkouts] = useState<any[]>([]);
  const [sharedWeightLogs, setSharedWeightLogs] = useState<any[]>([]);
  const [sharedContentSeries, setSharedContentSeries] = useState<any[]>([]);
  const [sharedContentEntries, setSharedContentEntries] = useState<any[]>([]);

  const isAdmin = myProfile?.isAdmin || myProfile?.isSuperAdmin;

  // Track last follow action type and timestamp to handle reconciliation correctly
  // 'follow' = count should increase, 'unfollow' = count should decrease
  const lastActionRef = useRef<{type: 'follow' | 'unfollow' | null; timestamp: number}>({type: null, timestamp: 0});

  const loadUser = useCallback(async () => {
    try {
      const r = await fetch(`/api/user/public/${userId}?_t=` + Date.now(), { cache: 'no-store' });
      if (r.ok) {
        const data = await r.json();
        setUserData((prev: any) => {
          const serverFollowers = typeof data.followersCount === 'number' ? data.followersCount : undefined;
          const serverFollowing = typeof data.followingCount === 'number' ? data.followingCount : undefined;
          if (!prev) {
            // First load — use server data directly
            return {
              ...data,
              followersCount: serverFollowers ?? 0,
              followingCount: serverFollowing ?? 0,
            };
          }
          // Reconciliation logic depends on last action type:
          // - After follow: server count may lag, so take max(server, local) to protect optimistic +1
          // - After unfollow: server count should be authoritative (lower), so use server directly
          // - No recent action: use server count directly (it's the truth)
          const timeSinceAction = Date.now() - lastActionRef.current.timestamp;
          const isRecentFollow = lastActionRef.current.type === 'follow' && timeSinceAction < 5000;
          const isRecentUnfollow = lastActionRef.current.type === 'unfollow' && timeSinceAction < 5000;

          const prevFollowers = prev.followersCount ?? 0;
          const prevFollowing = prev.followingCount ?? 0;
          let safeFollowers: number;
          let safeFollowing: number;

          if (isRecentFollow) {
            // After follow: protect optimistic +1 by taking max
            safeFollowers = (serverFollowers !== undefined && serverFollowers >= prevFollowers) ? serverFollowers : prevFollowers;
            safeFollowing = (serverFollowing !== undefined && serverFollowing >= prevFollowing) ? serverFollowing : prevFollowing;
          } else {
            // After unfollow or no action: server is authoritative
            safeFollowers = serverFollowers !== undefined ? serverFollowers : prevFollowers;
            safeFollowing = serverFollowing !== undefined ? serverFollowing : prevFollowing;
          }
          return {
            ...prev,
            ...data,
            followersCount: safeFollowers,
            followingCount: safeFollowing,
          };
        });
      }
    } catch {}
    setLoading(false);
  }, [userId]);

  useEffect(() => { if (userId) loadUser(); }, [userId, loadUser]);

  // Fetch shared fitness/content data when profile loads
  // Respects: share toggle (ON/OFF) + private account (only followers see shared data)
  useEffect(() => {
    if (!userData) return;
    const profileData = userData.profile || userData;

    async function fetchSharedData() {
      // Guests cannot access fitness/content APIs (auth required), skip shared data
      if (isGuest) return;

      // For private accounts: only show shared data to accepted followers
      // For public accounts: show shared data to everyone if toggle is ON
      const isPrivateAccount = profileData.isPublic === false;
      const canSeePrivateData = isPrivateAccount ? followStatus === 'accepted' : true;

      // Fetch fitness progress if shareFitnessProgress is true AND viewer has access
      if (profileData.shareFitnessProgress && canSeePrivateData) {
        const [wRes, wlRes] = await Promise.all([
          fetch(`/api/fitness/workout?userId=${userId}`),
          fetch(`/api/fitness/weight?userId=${userId}`)
        ]);
        if (wRes.ok) { const d = await wRes.json(); setSharedWorkouts(Array.isArray(d) ? d : d.workouts || []); }
        if (wlRes.ok) { const d = await wlRes.json(); setSharedWeightLogs(Array.isArray(d) ? d : d.weightLogs || []); }
      } else {
        setSharedWorkouts([]);
        setSharedWeightLogs([]);
      }

      // Fetch content series if shareContentStatus is true AND viewer has access
      if (profileData.shareContentStatus && canSeePrivateData) {
        const cRes = await fetch(`/api/content/series?userId=${userId}`);
        if (cRes.ok) { const d = await cRes.json(); setSharedContentSeries(Array.isArray(d) ? d : d.series || []); }
        // Also fetch content entries for live status
        const eRes = await fetch(`/api/content/entries?userId=${userId}`);
        if (eRes.ok) { const d = await eRes.json(); setSharedContentEntries(Array.isArray(d) ? d : d.entries || []); }
      } else {
        setSharedContentSeries([]);
        setSharedContentEntries([]);
      }
    }
    fetchSharedData();
  }, [userData, userId, followStatus]);

  // Check follow status (accepted or pending)
  useEffect(() => {
    if (!userId || !myProfile || isGuest) return;
    async function check() {
      try {
        // Check if we're already following (accepted)
        const fR = await fetch(`/api/follow?type=following`);
        if (fR.ok) {
          const data = await fR.json();
          const followingList = Array.isArray(data) ? data : data.following || [];
          const isFollowing = followingList.some((f: any) => f.id === userId);
          if (isFollowing) {
            setFollowStatus('accepted');
            return;
          }
        }
        // Check if we have a pending request
        const sR = await fetch(`/api/follow?type=sent-requests`);
        if (sR.ok) {
          const sData = await sR.json();
          const sentList = Array.isArray(sData) ? sData : [];
          const hasPending = sentList.some((r: any) => r.followingId === userId);
          if (hasPending) {
            setFollowStatus('pending');
          }
        }
      } catch {}
    }
    check();
  }, [userId, myProfile]);

  async function handleFollow() {
    if (isGuest) { showLoginPrompt('follow users'); return; }
    try {
      const r = await fetch('/api/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await r.json();
      if (data.status === 'accepted') {
        setFollowStatus('accepted');
        toast.success('Following!');
        // Mark action as follow so reconciliation protects the optimistic +1
        lastActionRef.current = { type: 'follow', timestamp: Date.now() };
        // Use server count directly if available, otherwise optimistically increment
        setUserData((prev: any) => {
          if (!prev) return prev;
          const newCount = typeof data.targetFollowersCount === 'number' ? data.targetFollowersCount : (prev.followersCount ?? 0) + 1;
          return { ...prev, followersCount: newCount };
        });
      } else if (data.status === 'pending') {
        setFollowStatus('pending');
        toast.success('Follow request sent');
      } else if (data.status === 'unfollowed') {
        setFollowStatus('none');
        toast.success('Unfollowed');
        // Mark action as unfollow so reconciliation uses server count (which will be lower)
        lastActionRef.current = { type: 'unfollow', timestamp: Date.now() };
        // Use server count directly if available
        setUserData((prev: any) => {
          if (!prev) return prev;
          const newCount = typeof data.targetFollowersCount === 'number' ? data.targetFollowersCount : Math.max(0, (prev.followersCount ?? 0) - 1);
          return { ...prev, followersCount: newCount };
        });
      } else if (data.status === 'withdrawn') {
        setFollowStatus('none');
        toast.success('Request withdrawn');
      }
      // Update user store so own profile page reflects the new following count
      if (typeof data.myFollowingCount === 'number') {
        try {
          const profileRes = await fetch('/api/user/profile');
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            useUserStore.getState().setUser(profileData);
          }
        } catch {}
      }
      // Dispatch follow-updated event so other pages (like own profile) refresh their counts
      window.dispatchEvent(new CustomEvent('follow-updated'));
      window.dispatchEvent(new CustomEvent('xp-updated'));
      window.dispatchEvent(new CustomEvent('notification-updated'));
      // Delayed server refresh for count reconciliation
      setTimeout(async () => {
        try {
          const r = await fetch(`/api/user/public/${userId}?_t=` + Date.now(), { cache: 'no-store' });
          if (r.ok) {
            const serverData = await r.json();
            const sFollowers = typeof serverData.followersCount === 'number' ? serverData.followersCount : undefined;
            const sFollowing = typeof serverData.followingCount === 'number' ? serverData.followingCount : undefined;
            setUserData((prev: any) => {
              if (!prev) return prev;
              // After delay, server should have caught up — use server count directly
              return {
                ...prev,
                followersCount: sFollowers !== undefined ? sFollowers : prev.followersCount,
                followingCount: sFollowing !== undefined ? sFollowing : prev.followingCount,
              };
            });
          }
        } catch {}
      }, 2000);
    } catch {}
  }

  async function openFollowers() {
    setFollowersOpen(true);
    try {
      const [fR, fgR] = await Promise.all([
        fetch(`/api/user/public/${userId}?type=followers`),
        fetch(`/api/user/public/${userId}?type=following`),
      ]);
      if (fR.ok) {
        const d = await fR.json();
        setFollowers(Array.isArray(d) ? d : d.followers || []);
      }
      if (fgR.ok) {
        const d = await fgR.json();
        setFollowing(Array.isArray(d) ? d : d.following || []);
      }
    } catch {}
  }

  async function submitReport() {
    if (isGuest) { showLoginPrompt('report users'); return; }
    if (!reportCategory || !reportReason.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    setReportSubmitting(true);
    try {
      const r = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'user', targetId: userId as string, category: reportCategory, reason: reportReason.trim() }),
      });
      if (r.ok) {
        toast.success('Report submitted');
        setReportOpen(false);
        setReportCategory('');
        setReportReason('');
      } else {
        const d = await r.json();
        toast.error(d.error || 'Report failed');
      }
    } catch {
      toast.error('Report failed');
    } finally {
      setReportSubmitting(false);
    }
  }

  if (loading) return <div className="flex justify-center py-8"><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><Zap className="w-8 h-8 text-blue-400" /></motion.div></div>;
  if (!userData) return <div className="text-center py-8 text-muted-foreground">User not found</div>;

  const p = userData.profile || userData;
  const activePhases = safeJsonParse<string[]>(typeof p.activePhases === 'string' ? p.activePhases : JSON.stringify(p.activePhases), []);
  const phaseActivityMap = (() => {
    try {
      const raw = safeJsonParse<Record<string, any>>(typeof p.phaseActivityMap === 'string' ? p.phaseActivityMap : JSON.stringify(p.phaseActivityMap || {}), {});
      const result: any = {};
      for (const [k, v] of Object.entries(raw)) {
        if (Array.isArray(v)) result[k] = { activities: v };
        else if (v && typeof v === 'object') result[k] = v;
      }
      return result;
    } catch { return {}; }
  })();
  const achievements = userData.achievements || [];
  const isOwn = myProfile?.userId === userId;

  const hasLearningPhase = Array.isArray(activePhases) && activePhases.some((phase: string) =>
    phaseActivityMap[phase]?.activities?.includes('learning')
  );

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Semantic heading for SEO/crawlers — visually hidden */}
      <h1 className="sr-only">{p.name || 'User'} — {t('app.name')} Profile</h1>

      <GlassCard className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-20 w-20 border border-border"><AvatarFallback className="bg-blue-600/30 text-blue-300 text-2xl">{p.name?.[0] || '?'}</AvatarFallback></Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-foreground">{p.name || 'User'}</h2>
              {p.verified && <BadgeCheck size={18} className="text-blue-400 shrink-0" />}
              {p.isPublic === false && <Lock size={14} className="text-amber-400 shrink-0" />}
              {!isOwn && (
                <Button onClick={() => setReportOpen(true)} size="sm" variant="ghost" className="text-muted-foreground hover:text-amber-400 ml-auto">
                  <Flag size={14} />
                </Button>
              )}
            </div>
            <p className="text-sm text-muted-foreground">@{p.username || userData.username || ''}</p>
            <p className="text-sm text-muted-foreground mt-1">{p.bio || ''}</p>
            {isAdmin && userData.phone && (
              <p className="text-xs text-muted-foreground mt-1">📞 {userData.phone}</p>
            )}
            <div className="flex items-center gap-3 mt-3">
              <span className="text-sm font-medium text-foreground">Lv.{p.level || 1}</span>
              <XPBar xp={p.xp || 0} level={p.level || 1} compact />
              <span className="text-xs text-muted-foreground tabular-nums">{p.xp || 0} XP</span>
              <StreakBadge streak={p.currentStreak || 0} size="sm" />
            </div>
            <div className="flex items-center justify-between gap-3 mt-3">
              <div className="flex items-center gap-4 shrink-0">
                <button onClick={openFollowers} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <span className="text-foreground font-medium">{userData.followersCount ?? 0}</span> {t('profile.followers')}
                </button>
                <button onClick={openFollowers} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <span className="text-foreground font-medium">{userData.followingCount ?? 0}</span> {t('profile.following')}
                </button>
              </div>
              {!isOwn && (
                <Button onClick={handleFollow} size="sm" variant={followStatus === 'accepted' ? 'outline' : 'default'} className={`min-w-[100px] shrink-0 ${followStatus !== 'accepted' ? 'gradient-blue text-white' : ''}`}>
                  {followStatus === 'accepted' ? <><UserMinus size={14} className="mr-1" />Unfollow</> : followStatus === 'pending' ? <><Clock size={14} className="mr-1" />Pending</> : <><UserPlus size={14} className="mr-1" />{p.isPublic !== false ? t('profile.follow') : t('profile.request')}</>}
                </Button>
              )}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Private Account Notice */}
      {p.isPublic === false && followStatus !== 'accepted' && !isOwn && (
        <GlassCard className="p-4 border-amber-500/30">
          <div className="flex items-center gap-3">
            <Lock size={18} className="text-amber-400 shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">Private Account</p>
              <p className="text-xs text-muted-foreground mt-0.5">Follow this account to see their shared progress and updates. Only approved followers can view their fitness, learning, and content data.</p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Active Phases */}
      {activePhases.length > 0 && (
        <GlassCard className="p-5">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Current Journey</h3>
          <div className="space-y-3">
            {activePhases.map((phase: string) => {
              const config = phaseConfig[phase];
              if (!config) return null;
              const Icon = config.icon;
              const activities = phaseActivityMap[phase]?.activities || [];
              return (
                <div key={phase} className={`flex items-start gap-3 rounded-xl px-4 py-3 ${config.bg} border border-border`}>
                  <Icon size={18} className={config.color + ' mt-0.5 shrink-0'} />
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${config.color}`}>{t(config.nameKey)}</p>
                    {activities.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {activities.map((act: string) => (
                          <span key={act} className="text-[10px] bg-accent text-foreground/70 px-2 py-0.5 rounded-full">{act}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      )}

      {/* Learning Topics */}
      {hasLearningPhase && Array.isArray(userData.learningTopics) && userData.learningTopics.length > 0 && (
        <GlassCard className="p-5">
          <div className="flex items-center gap-2 mb-3"><BookOpen size={16} className="text-blue-400" /><h3 className="text-sm font-medium text-muted-foreground">{t('learning.topics')}</h3></div>
          <div className="flex flex-wrap gap-2">
            {userData.learningTopics.map((topic: any) => (
              <span key={topic.id || topic.name} className="text-xs bg-blue-600/20 text-blue-300 px-3 py-1.5 rounded-full">{topic.name}</span>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Shared Achievements */}
      {p.shareAchievements && achievements.length > 0 && (
        <GlassCard className="p-5">
          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2"><Trophy size={16} className="text-amber-400" />Shared Achievements</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {achievements.map((a: any) => (
              <div key={a.id} className={`p-3 rounded-xl glass-card-sm ${highlightAchievement === a.achievement?.key ? 'border-amber-500/50 ring-2 ring-amber-500/30' : ''} flex items-center gap-2`}>
                <span className="text-xl">{a.achievement?.iconEmoji || '🏆'}</span>
                <div><p className="text-xs font-medium text-foreground">{a.achievement?.name || 'Achievement'}</p></div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Shared Fitness Progress */}
      {p.shareFitnessProgress && (sharedWorkouts.length > 0 || sharedWeightLogs.length > 0) && (
        <GlassCard className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Dumbbell size={16} className="text-blue-400" />
            <h3 className="text-sm font-medium text-muted-foreground">Fitness Progress</h3>
          </div>
          {sharedWeightLogs.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-muted-foreground/60 mb-2">Weight Log</p>
              <div className="flex gap-2 flex-wrap">
                {sharedWeightLogs.slice(-5).map((w: any) => (
                  <div key={w.id} className="text-center bg-accent/30 rounded-lg px-3 py-2">
                    <p className="text-sm font-bold text-foreground">{w.weight}kg</p>
                    <p className="text-[10px] text-muted-foreground/60">{w.date}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {sharedWorkouts.length >= 1 && (
            <div className="mb-4">
              <p className="text-xs text-muted-foreground/60 mb-2">Workout Calories Trend</p>
              <WorkoutChart data={Object.entries(
                sharedWorkouts.reduce((acc: Record<string, number>, w: any) => {
                  const d = w.date?.slice(5) || w.date;
                  acc[d] = (acc[d] || 0) + (w.estimatedCalories || 0);
                  return acc;
                }, {})
              ).map(([date, calories]) => ({ date, calories }))
                .sort((a, b) => a.date.localeCompare(b.date))
                .slice(-14)} />
            </div>
          )}
          {sharedWorkouts.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground/60 mb-2">{sharedWorkouts.length} workouts logged</p>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(
                  sharedWorkouts.reduce((acc: any, w: any) => {
                    acc[w.workoutType] = (acc[w.workoutType] || 0) + 1;
                    return acc;
                  }, {})
                ).slice(0, 6).map(([type, count]: any) => (
                  <span key={type} className="text-xs bg-blue-600/20 text-blue-300 px-2 py-1 rounded-full">
                    {type} x {count}
                  </span>
                ))}
              </div>
            </div>
          )}
        </GlassCard>
      )}

      {/* Shared Content Status */}
      {p.shareContentStatus && (sharedContentSeries.length > 0 || sharedContentEntries.length > 0) && (
        <GlassCard className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Video size={16} className="text-purple-400" />
            <h3 className="text-sm font-medium text-muted-foreground">Content Status</h3>
          </div>
          {sharedContentSeries.length > 0 && (
            <div className="space-y-2 mb-3">
              {sharedContentSeries.slice(0, 5).map((s: any) => (
                <div key={s.id} className="flex items-center justify-between p-2 bg-accent/30 rounded-lg">
                  <div>
                    <p className="text-xs font-medium text-foreground">{s.name}</p>
                    {s.category && <p className="text-[10px] text-muted-foreground/60">{s.category}</p>}
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    s.status === 'active' ? 'bg-green-600/20 text-green-400' :
                    s.status === 'completed' ? 'bg-blue-600/20 text-blue-400' :
                    'bg-amber-600/20 text-amber-400'
                  }`}>
                    {s.status || 'active'}
                  </span>
                </div>
              ))}
            </div>
          )}
          {sharedContentEntries.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground/60 mb-2">Live Status</p>
              <div className="space-y-3">
                {sharedContentEntries.slice(0, 5).map((e: any) => {
                  const ct = e.contentType || 'post';
                  const pipeline = getPipeline(ct);
                  const currentIdx = getPipelineStepIndex(ct, e.liveStatus || 'not_started');
                  return (
                    <div key={e.id} className="bg-accent/50 rounded-xl p-3">
                      {/* Entry Header */}
                      <div className="flex items-center gap-2 mb-2.5">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md flex items-center gap-1 ${ct === 'blog' ? 'bg-purple-600/20 text-purple-400' : ct === 'video' ? 'bg-red-600/20 text-red-400' : 'bg-blue-600/20 text-blue-400'}`}>
                          {contentTypeIcon(ct)}
                          {contentTypeLabel(ct)}
                        </span>
                        <p className="text-sm font-medium text-foreground truncate">{e.title}</p>
                      </div>

                      {/* Pipeline Steps (view-only) */}
                      <div className="flex items-center gap-0">
                        {pipeline.map((step: any, idx: number) => {
                          const isCompleted = idx < currentIdx;
                          const isCurrent = idx === currentIdx;
                          const StepIcon = step.icon;
                          return (
                            <div key={step.key} className="flex items-center flex-1 last:flex-none">
                              {/* Step Circle (view-only, no buttons) */}
                              <div
                                className={`
                                  relative flex items-center justify-center w-7 h-7 rounded-full shrink-0 transition-all duration-300
                                  ${isCompleted ? 'bg-green-500 text-white shadow-md shadow-green-500/20' : ''}
                                  ${isCurrent ? `${step.color} ring-2 ring-offset-1 ring-offset-background ring-current scale-110` : ''}
                                  ${!isCompleted && !isCurrent ? 'bg-white/5 text-muted-foreground/40' : ''}
                                `}
                              >
                                {isCompleted ? (
                                  <Check size={12} strokeWidth={3} />
                                ) : isCurrent ? (
                                  <StepIcon size={12} />
                                ) : (
                                  <StepIcon size={11} />
                                )}
                                {isCurrent && (
                                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-current" />
                                )}
                              </div>

                              {/* Connector Line */}
                              {idx < pipeline.length - 1 && (
                                <div className={`h-0.5 flex-1 mx-1 rounded-full transition-all duration-500 ${isCompleted ? 'bg-green-500/60' : isCurrent ? 'bg-gradient-to-r from-current/40 to-transparent' : 'bg-white/5'}`} />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Step Labels */}
                      <div className="flex items-center mt-1.5">
                        {pipeline.map((step: any, idx: number) => (
                          <div key={step.key} className={`flex-1 text-center last:flex-none ${idx === currentIdx ? 'text-foreground' : 'text-muted-foreground/40'}`}>
                            <span className={`text-[9px] font-medium ${idx === currentIdx ? step.color.split(' ')[0] : ''}`}>{step.label}</span>
                          </div>
                        ))}
                      </div>

                      {/* Completed Badge */}
                      {currentIdx === pipeline.length - 1 && (
                        <div className="flex justify-end mt-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-600/20 text-green-400 font-medium flex items-center gap-1">
                            <Check size={10} /> Live
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </GlassCard>
      )}

      {/* Followers Dialog */}
      <Dialog open={followersOpen} onOpenChange={setFollowersOpen}>
        <DialogContent className="bg-background border-border">
          <DialogHeader><DialogTitle className="text-foreground">{t('profile.followers')} & {t('profile.following')}</DialogTitle></DialogHeader>
          <div className="mt-4 space-y-4 max-h-[400px] overflow-y-auto">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">{t('profile.followers')}</p>
              {followers.map((f: any) => (
                <button key={f.id} onClick={() => { setFollowersOpen(false); router.push(`/profile/${f.id}`); }} className="flex items-center gap-2 p-2 w-full hover:bg-accent rounded-lg transition-colors">
                  <Avatar className="h-7 w-7"><AvatarFallback className="bg-blue-600/30 text-blue-300 text-[10px]">{f.name?.[0] || '?'}</AvatarFallback></Avatar>
                  <span className="text-sm text-foreground">{f.name || 'User'}</span>
                  {f.verified && <BadgeCheck size={12} className="text-blue-400" />}
                </button>
              ))}
            </div>
            <div className="border-t border-border pt-2">
              <p className="text-xs font-medium text-muted-foreground mb-2">{t('profile.following')}</p>
              {following.map((f: any) => (
                <button key={f.id} onClick={() => { setFollowersOpen(false); router.push(`/profile/${f.id}`); }} className="flex items-center gap-2 p-2 w-full hover:bg-accent rounded-lg transition-colors">
                  <Avatar className="h-7 w-7"><AvatarFallback className="bg-blue-600/30 text-blue-300 text-[10px]">{f.name?.[0] || '?'}</AvatarFallback></Avatar>
                  <span className="text-sm text-foreground">{f.name || 'User'}</span>
                  {f.verified && <BadgeCheck size={12} className="text-blue-400" />}
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Report User Dialog */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="bg-background border-border">
          <DialogHeader><DialogTitle className="text-foreground flex items-center gap-2"><AlertTriangle size={18} className="text-amber-400" />Report User</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm">Violation Type</Label>
              <select value={reportCategory} onChange={e => setReportCategory(e.target.value)} className="w-full bg-accent border border-border text-foreground rounded-md px-3 py-2 text-sm">
                <option value="" className="bg-background">Select violation type</option>
                <option value="spam" className="bg-background">Spam</option>
                <option value="harassment" className="bg-background">Harassment or Bullying</option>
                <option value="inappropriate" className="bg-background">Inappropriate Content</option>
                <option value="hate_speech" className="bg-background">Hate Speech</option>
                <option value="misinformation" className="bg-background">Misinformation</option>
                <option value="violence" className="bg-background">Violence or Threats</option>
                <option value="impersonation" className="bg-background">Impersonation</option>
                <option value="other" className="bg-background">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm">Reason</Label>
              <Textarea value={reportReason} onChange={e => setReportReason(e.target.value)} placeholder="Please describe the issue in detail..." className="bg-accent border-border text-foreground placeholder:text-muted-foreground/50 min-h-[100px]" rows={4} />
            </div>
            <Button onClick={submitReport} disabled={reportSubmitting || !reportCategory || !reportReason.trim()} className="gradient-blue w-full">
              {reportSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Flag size={14} className="mr-2" />}
              Submit Report
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ad Banner — bottom of page, above footer */}
      <AdCard format="in-feed" slot="profile_bottom" />
    </div>
  );
}
