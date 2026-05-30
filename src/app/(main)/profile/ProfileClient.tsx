'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { User, Zap, Flame, Star, Trophy, BadgeCheck, Edit, Save, X, Share2, Trash2, Globe, Lock, BookOpen, Flag, AlertTriangle, ArrowRight, Dumbbell, Loader2, Repeat2, MessageSquare, Phone, ShieldCheck, Sparkles, ChevronRight, Video } from 'lucide-react';
import { GlassCard } from '@/components/glass-card';
import { XPBar } from '@/components/xp-bar';
import { StreakBadge } from '@/components/streak-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useUserStore } from '@/stores/user-store';
import { t } from '@/lib/i18n';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const phaseConfig: Record<string, { icon: any; color: string; bg: string; nameKey: string }> = {
  start: { icon: Zap, color: 'text-blue-400', bg: 'bg-blue-600/20', nameKey: 'phase.start' },
  restart: { icon: Flame, color: 'text-amber-400', bg: 'bg-amber-600/20', nameKey: 'phase.restart' },
  explore: { icon: Star, color: 'text-purple-400', bg: 'bg-purple-600/20', nameKey: 'phase.explore' },
};

// Session storage key for persisting edit state across remounts
const EDIT_STORAGE_KEY = 'sre_profile_edit';

function restoreEditState(): { editing: boolean; name: string; bio: string; phone: string } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(EDIT_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function persistEditState(state: { editing: boolean; name: string; bio: string; phone: string }) {
  if (typeof window === 'undefined') return;
  try {
    if (state.editing) {
      sessionStorage.setItem(EDIT_STORAGE_KEY, JSON.stringify(state));
    } else {
      sessionStorage.removeItem(EDIT_STORAGE_KEY);
    }
  } catch {}
}

export default function ProfileClient() {
  const router = useRouter();
  const { profile, fetchProfile } = useUserStore();

  // Restore editing state from sessionStorage if component remounted mid-edit
  const savedEdit = typeof window !== 'undefined' ? restoreEditState() : null;
  const [editing, setEditing] = useState(savedEdit?.editing || false);
  const [editName, setEditName] = useState(savedEdit?.name || '');
  const [editBio, setEditBio] = useState(savedEdit?.bio || '');
  const [editPhone, setEditPhone] = useState(savedEdit?.phone || '');
  const [achievements, setAchievements] = useState<any[]>([]);
  const [followersOpen, setFollowersOpen] = useState(false);
  const [showFollowers, setShowFollowers] = useState(true);
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  // Initialize from user store to prevent flash of 0 on mount
  const [followerCount, setFollowerCount] = useState(() => profile?.followerCount || 0);
  const [followingCount, setFollowingCount] = useState(() => profile?.followingCount || 0);
  const [learningTopics, setLearningTopics] = useState<any[]>([]);
  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [myReposts, setMyReposts] = useState<any[]>([]);

  // Report dialog state
  const [reportOpen, setReportOpen] = useState(false);
  const [reportCategory, setReportCategory] = useState('');
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);

  // Initialize edit fields only when editing mode is entered (not on every profile change)
  // This prevents AppShell's 5s fetchProfile interval from wiping user input
  const startEditing = useCallback(() => {
    if (profile) {
      setEditName(profile.name || '');
      setEditBio(profile.bio || '');
      setEditPhone(profile.phone || '');
      persistEditState({ editing: true, name: profile.name || '', bio: profile.bio || '', phone: profile.phone || '' });
    }
    setEditing(true);
  }, [profile]);

  // Simple onChange handlers — no useCallback to avoid stale closure issues
  // that caused the space-key crash bug
  function handleNameChange(val: string) {
    setEditName(val);
    persistEditState({ editing: true, name: val, bio: editBio, phone: editPhone });
  }

  function handleBioChange(val: string) {
    setEditBio(val);
    persistEditState({ editing: true, name: editName, bio: val, phone: editPhone });
  }

  function handlePhoneChange(val: string) {
    setEditPhone(val);
    persistEditState({ editing: true, name: editName, bio: editBio, phone: val });
  }

  const fetchCounts = useCallback(async () => {
    try {
      // First sync from user store (which has merge protection)
      const storeCounts = useUserStore.getState().profile;
      if (storeCounts) {
        // On initial load, use store counts; don't use Math.max to avoid
        // preventing legitimate decreases (e.g. after unfollow)
        setFollowerCount(storeCounts.followerCount || 0);
        setFollowingCount(storeCounts.followingCount || 0);
      }
      const r = await fetch('/api/follow?type=count&_t=' + Date.now(), { cache: 'no-store' });
      if (r.ok) {
        const d = await r.json();
        const serverFollowers = typeof d.followersCount === 'number' ? d.followersCount : undefined;
        const serverFollowing = typeof d.followingCount === 'number' ? d.followingCount : undefined;
        // Server count is authoritative — use it directly
        if (serverFollowers !== undefined) setFollowerCount(serverFollowers);
        if (serverFollowing !== undefined) setFollowingCount(serverFollowing);
      }
    } catch {}
  }, []);

  const fetchAchievements = useCallback(async () => {
    try { const r = await fetch('/api/achievements'); if (r.ok) { const d = await r.json(); const arr = Array.isArray(d) ? d : d.achievements || []; setAchievements(arr.filter((a: any) => a.unlocked)); } } catch {}
  }, []);

  const fetchLearningTopics = useCallback(async () => {
    try {
      const r = await fetch('/api/learning/stats');
      if (r.ok) {
        const d = await r.json();
        setLearningTopics(Array.isArray(d.topicDistribution) ? d.topicDistribution : []);
      }
    } catch {}
  }, []);

  const fetchMyPosts = useCallback(async () => {
    try {
      const r = await fetch('/api/posts?mine=true');
      if (r.ok) {
        const d = await r.json();
        const allPosts = Array.isArray(d) ? d : d.posts || [];
        setMyPosts(allPosts.filter((p: any) => !p.isRepost));
        setMyReposts(allPosts.filter((p: any) => p.isRepost));
      }
    } catch {}
  }, []);

  useEffect(() => { fetchCounts(); fetchAchievements(); fetchLearningTopics(); fetchMyPosts(); }, [fetchCounts, fetchAchievements, fetchLearningTopics, fetchMyPosts]);

  // Sync follower/following counts from user store whenever profile updates
  // (AppShell fetchProfile runs every 5s and has merge protection)
  useEffect(() => {
    if (profile) {
      setFollowerCount(profile.followerCount || 0);
      setFollowingCount(profile.followingCount || 0);
    }
  }, [profile?.followerCount, profile?.followingCount]);

  // Refresh follower/following counts when page gains focus (e.g., after following someone elsewhere)
  // Also listen for visibility change to refresh on route navigation back
  // Also listen for follow-updated event dispatched from other profile pages
  useEffect(() => {
    function handleFocus() { fetchCounts(); }
    function handleXpOrNotifUpdate() { fetchCounts(); }
    function handleFollowUpdate() { fetchCounts(); }
    function handleVisibility() { if (document.visibilityState === 'visible') fetchCounts(); }
    window.addEventListener('focus', handleFocus);
    window.addEventListener('xp-updated', handleXpOrNotifUpdate);
    window.addEventListener('notification-updated', handleXpOrNotifUpdate);
    window.addEventListener('follow-updated', handleFollowUpdate);
    window.addEventListener('sharing-updated', handleFollowUpdate);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('xp-updated', handleXpOrNotifUpdate);
      window.removeEventListener('notification-updated', handleXpOrNotifUpdate);
      window.removeEventListener('follow-updated', handleFollowUpdate);
      window.removeEventListener('sharing-updated', handleFollowUpdate);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [fetchCounts]);

  async function saveProfile() {
    try {
      const r = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, bio: editBio, phone: editPhone || null }),
      });
      if (r.ok) { setEditing(false); persistEditState({ editing: false, name: '', bio: '', phone: '' }); fetchProfile(); toast.success(t('common.success')); }
      else { const d = await r.json().catch(() => ({})); toast.error(d.error || 'Failed to save profile'); }
    } catch { toast.error('Network error. Please try again.'); }
  }

  async function toggleShareAchievements(val: boolean) {
    try {
      const r = await fetch('/api/user/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ shareAchievements: val }) });
      if (r.ok) {
        await fetchProfile();
        // Small delay to allow database replication before notifying other pages
        setTimeout(() => { window.dispatchEvent(new CustomEvent('sharing-updated')); }, 500);
      }
    } catch {}
  }

  async function toggleIsPublic(val: boolean) {
    try {
      const r = await fetch('/api/user/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isPublic: val }) });
      if (r.ok) {
        await fetchProfile();
        // Small delay to allow database replication before notifying other pages
        setTimeout(() => { window.dispatchEvent(new CustomEvent('sharing-updated')); }, 500);
      }
    } catch {}
  }

  async function toggleShareFitnessProgress(val: boolean) {
    try {
      const r = await fetch('/api/user/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ shareFitnessProgress: val }) });
      if (r.ok) {
        await fetchProfile();
        // Small delay to allow database replication before notifying other pages
        setTimeout(() => { window.dispatchEvent(new CustomEvent('sharing-updated')); }, 500);
      }
    } catch {}
  }

  async function toggleShareContentStatus(val: boolean) {
    try {
      const r = await fetch('/api/user/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ shareContentStatus: val }) });
      if (r.ok) {
        await fetchProfile();
        // Small delay to allow database replication before notifying other pages
        setTimeout(() => { window.dispatchEvent(new CustomEvent('sharing-updated')); }, 500);
      }
    } catch {}
  }

  async function toggleShareLearningProgress(val: boolean) {
    try {
      const r = await fetch('/api/user/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ shareLearningProgress: val }) });
      if (r.ok) {
        await fetchProfile();
        // Small delay to allow database replication before notifying other pages
        setTimeout(() => { window.dispatchEvent(new CustomEvent('sharing-updated')); }, 500);
      }
    } catch {}
  }

  async function openFollowersList() {
    setShowFollowers(true);
    setFollowersOpen(true);
    try {
      const r = await fetch('/api/follow?type=followers');
      if (r.ok) {
        const d = await r.json();
        setFollowers(Array.isArray(d) ? d : d.followers || []);
      }
    } catch {}
  }

  async function openFollowingList() {
    setShowFollowers(false);
    setFollowersOpen(true);
    try {
      const r = await fetch('/api/follow?type=following');
      if (r.ok) {
        const d = await r.json();
        setFollowing(Array.isArray(d) ? d : d.following || []);
      }
    } catch {}
  }

  async function submitSelfReport() {
    if (!reportCategory || !reportReason.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    setReportSubmitting(true);
    try {
      const r = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'user', targetId: profile?.userId, category: reportCategory, reason: reportReason.trim() }),
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

  async function deleteAccount() {
    if (!confirm('Type DELETE to confirm')) return;
    try {
      await fetch('/api/user/profile', { method: 'DELETE' });
      signOut({ redirect: false }).then(() => router.push('/login'));
    } catch {}
  }

  async function deletePost(postId: string) {
    if (!confirm('Delete this post?')) return;
    try {
      const r = await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
      if (r.ok) {
        setMyPosts(prev => prev.filter(p => p.id !== postId));
        toast.success('Post deleted');
      }
    } catch {}
  }

  async function deleteRepost(postId: string) {
    if (!confirm('Remove this repost?')) return;
    try {
      const r = await fetch(`/api/posts/${postId}/repost`, { method: 'DELETE' });
      if (r.ok) {
        setMyReposts(prev => prev.filter(p => p.id !== postId));
        toast.success('Repost removed');
      }
    } catch {}
  }

  if (!profile) return null;

  const hasLearningPhase = Array.isArray(profile.activePhases) && profile.activePhases.some(p =>
    profile.phaseActivityMap?.[p]?.activities?.includes('learning')
  );

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Header */}
      <GlassCard className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-20 w-20 border border-white/10">
            <AvatarFallback className="bg-blue-600/30 text-blue-300 text-2xl">{profile.name?.[0] || '?'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {editing ? (
                <Input value={editName} onChange={e => handleNameChange(e.target.value)} className="bg-white/5 border-white/10 text-foreground max-w-[200px]" />
              ) : (
                <h2 className="text-xl font-bold text-foreground">{profile.name || 'User'}</h2>
              )}
              {profile.verified && <BadgeCheck size={18} className="text-blue-400 shrink-0" />}
              {profile.tempVerified && !profile.verified && <BadgeCheck size={18} className="text-gray-400 shrink-0 opacity-50" />}
              {editing ? (
                <Button onClick={saveProfile} size="sm" className="gradient-blue"><Save size={14} /></Button>
              ) : (
                <Button onClick={startEditing} size="sm" variant="ghost" className="text-muted-foreground"><Edit size={14} /></Button>
              )}
            </div>
            <p className="text-sm text-muted-foreground">@{profile.username}</p>
            {editing ? (
              <Textarea value={editBio} onChange={e => handleBioChange(e.target.value)} className="bg-white/5 border-white/10 text-foreground mt-2 text-sm" rows={2} />
            ) : (
              <p className="text-sm text-muted-foreground mt-1">{profile.bio || 'No bio'}</p>
            )}
            {editing ? (
              <div className="flex items-center gap-2 mt-2">
                <Phone size={14} className="text-muted-foreground shrink-0" />
                <Input type="tel" placeholder="+91 9876543210" value={editPhone} onChange={e => handlePhoneChange(e.target.value)} className="bg-white/5 border-white/10 text-foreground text-sm h-8" />
                <span className="text-[9px] text-muted-foreground/40 flex items-center gap-0.5 shrink-0"><ShieldCheck size={9} />{t('profile.phoneAdminOnly')}</span>
              </div>
            ) : (
              profile.phone && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Phone size={12} className="text-muted-foreground/60" />
                  <span className="text-xs text-muted-foreground/70">{profile.phone}</span>
                  <span className="text-[9px] text-muted-foreground/40 flex items-center gap-0.5 ml-1"><ShieldCheck size={9} />{t('profile.phoneAdminOnly')}</span>
                </div>
              )
            )}
            <div className="flex items-center gap-3 mt-3">
              <span className="text-sm font-medium text-foreground">Lv.{profile.level}</span>
              <XPBar xp={profile.xp} level={profile.level} compact />
              <span className="text-xs text-muted-foreground tabular-nums">{profile.xp} XP</span>
              <StreakBadge streak={profile.currentStreak} size="sm" />
            </div>
            <div className="flex items-center gap-4 mt-3">
              <button onClick={openFollowersList} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                <span className="text-foreground font-medium">{followerCount}</span> {t('profile.followers')}
              </button>
              <button onClick={openFollowingList} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                <span className="text-foreground font-medium">{followingCount}</span> {t('profile.following')}
              </button>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Active Phases */}
      {Array.isArray(profile.activePhases) && profile.activePhases.length > 0 && (
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-muted-foreground">{t('profile.phaseMapping')}</h3>
            <Button onClick={() => router.push('/onboarding')} size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300 text-xs">
              Remap Phases <ArrowRight size={12} className="ml-1" />
            </Button>
          </div>
          <div className="space-y-3">
            {profile.activePhases.map(phase => {
              const config = phaseConfig[phase];
              if (!config) return null;
              const Icon = config.icon;
              const activities = profile.phaseActivityMap?.[phase]?.activities || [];
              return (
                <div key={phase} className={`flex items-start gap-3 rounded-xl px-4 py-3 ${config.bg} border border-white/10 cursor-pointer hover:opacity-80 transition-opacity`} onClick={() => router.push(`/phase/${phase}`)}>
                  <Icon size={18} className={config.color + ' mt-0.5 shrink-0'} />
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${config.color}`}>{t(config.nameKey)}</p>
                    {activities.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {activities.map((act: string) => (
                          <span key={act} className="text-[10px] bg-white/10 text-foreground/70 px-2 py-0.5 rounded-full">{act}</span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-muted-foreground/50 mt-1">No activities mapped</p>
                    )}
                  </div>
                  <ArrowRight size={14} className="text-muted-foreground/50 mt-1" />
                </div>
              );
            })}
          </div>
        </GlassCard>
      )}

      {/* Learning Topics - shown when learning is an activity */}
      {hasLearningPhase && learningTopics.length > 0 && (
        <GlassCard className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen size={16} className="text-blue-400" />
            <h3 className="text-sm font-medium text-muted-foreground">{t('learning.topics')}</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {learningTopics.map((topic: any) => (
              <span key={topic.id || topic.name} className="text-xs bg-blue-600/20 text-blue-300 px-3 py-1.5 rounded-full">{topic.name}</span>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Achievements - always visible for unlocked ones */}
      <GlassCard className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy size={16} className="text-amber-400" />
            <h3 className="text-sm font-medium text-muted-foreground">Achievements ({achievements.length})</h3>
          </div>
          <Button onClick={() => router.push('/achievements')} size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300 text-xs">
            View All <ArrowRight size={12} className="ml-1" />
          </Button>
        </div>
        {achievements.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {achievements.slice(0, 9).map((a: any) => (
              <div key={a.id} className="p-3 rounded-xl glass-card-sm flex items-center gap-2 overflow-hidden">
                <span className="text-xl shrink-0">{a.iconEmoji || '🏆'}</span>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{a.name || 'Achievement'}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{a.description || ''}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-xs text-muted-foreground/50">No achievements yet. Start your journey!</p>
          </div>
        )}
      </GlassCard>

      {/* Posts / Reposts / Settings Tabs */}
      <Tabs defaultValue="posts">
        <TabsList className="bg-white/5 border border-white/10 w-full flex">
          <TabsTrigger value="posts" className="text-muted-foreground data-[state=active]:text-blue-400 flex-1">{t('profile.myPosts')}</TabsTrigger>
          <TabsTrigger value="reposts" className="text-muted-foreground data-[state=active]:text-blue-400 flex-1">{t('profile.reposts')}</TabsTrigger>
          <TabsTrigger value="settings" className="text-muted-foreground data-[state=active]:text-blue-400 flex-1">{t('profile.settings')}</TabsTrigger>
          <TabsTrigger value="danger" className="text-muted-foreground data-[state=active]:text-red-400 flex-1">{t('profile.dangerZone')}</TabsTrigger>
        </TabsList>
        <TabsContent value="posts" className="mt-4 space-y-3">
          {myPosts.length === 0 ? (
            <GlassCard className="p-6 text-center"><p className="text-sm text-muted-foreground">No posts yet</p></GlassCard>
          ) : (
            myPosts.map((p: any) => {
              const isCollection = p.content?.startsWith('📚 Shared learning topic:') || p.content?.startsWith('📚 Shared my learning collection:');
              const topicIdMatch = p.content?.match(/\[topicId:([\w-]+)\]/);
              const topicId = topicIdMatch ? topicIdMatch[1] : null;
              return (
                <GlassCard key={p.id} className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    {isCollection ? (
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-blue-300">{p.content.replace(/\[topicId:[\w-]+\]/, '').trim()}</p>
                        {topicId && (
                          <button
                            onClick={() => router.push(`/shared-topic/${topicId}?from=profile`)}
                            className="w-full flex items-center gap-2 px-3 py-2 mt-2 rounded-lg bg-blue-600/10 hover:bg-blue-600/15 border border-blue-500/20 transition-colors group"
                          >
                            <Globe size={14} className="text-blue-400 shrink-0" />
                            <span className="text-xs text-blue-300 font-medium flex-1 text-left">View Shared Collection</span>
                            <Sparkles size={10} className="text-amber-400/50 group-hover:text-amber-400 transition-colors" />
                            <ChevronRight size={14} className="text-blue-400" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-foreground/90 whitespace-pre-wrap flex-1 min-w-0">{p.content}</p>
                    )}
                    <button onClick={() => deletePost(p.id)} className="text-muted-foreground/50 hover:text-red-400 shrink-0"><Trash2 size={14} /></button>
                  </div>
                  <p className="text-[10px] text-muted-foreground/50 mt-2">{new Date(p.createdAt).toLocaleDateString()}</p>
                </GlassCard>
              );
            })
          )}
        </TabsContent>
        <TabsContent value="reposts" className="mt-4 space-y-3">
          {myReposts.length === 0 ? (
            <GlassCard className="p-6 text-center"><p className="text-sm text-muted-foreground">No reposts yet</p></GlassCard>
          ) : (
            myReposts.map((p: any) => {
              const isCollection = p.content?.startsWith('📚 Shared learning topic:') || p.content?.startsWith('📚 Shared my learning collection:');
              const topicIdMatch = p.content?.match(/\[topicId:([\w-]+)\]/);
              const topicId = topicIdMatch ? topicIdMatch[1] : null;
              return (
                <GlassCard key={p.repostId || p.id} className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Repeat2 size={12} className="text-green-400" />
                      <span className="text-[10px] text-green-400">Reposted</span>
                      {p.repostComment && <span className="text-[10px] text-muted-foreground/70 ml-1">— {p.repostComment}</span>}
                    </div>
                    <button onClick={() => deleteRepost(p.id)} className="text-muted-foreground/50 hover:text-red-400 shrink-0"><Trash2 size={14} /></button>
                  </div>
                  <p className="text-[10px] text-muted-foreground/70 mb-1">by @{p.user?.username || 'user'}</p>
                  {isCollection ? (
                    <div className="bg-blue-600/10 border border-blue-500/20 rounded-lg p-3">
                      <p className="text-sm text-blue-300">{p.content.replace(/\[topicId:[\w-]+\]/, '').trim()}</p>
                      {topicId && (
                        <button
                          onClick={() => router.push(`/shared-topic/${topicId}?from=profile`)}
                          className="w-full flex items-center gap-2 px-3 py-2 mt-2 rounded-lg bg-blue-600/10 hover:bg-blue-600/15 border border-blue-500/20 transition-colors group"
                        >
                          <Globe size={14} className="text-blue-400 shrink-0" />
                          <span className="text-xs text-blue-300 font-medium flex-1 text-left">View Shared Collection</span>
                          <Sparkles size={10} className="text-amber-400/50 group-hover:text-amber-400 transition-colors" />
                          <ChevronRight size={14} className="text-blue-400 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-foreground/90 whitespace-pre-wrap">{p.content}</p>
                  )}
                </GlassCard>
              );
            })
          )}
        </TabsContent>
        <TabsContent value="settings" className="mt-4 space-y-3">
          <GlassCard className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy size={16} className="text-amber-400" />
                <span className="text-sm text-muted-foreground">{t('profile.shareAchievements')}</span>
              </div>
              <Switch checked={profile.shareAchievements} onCheckedChange={toggleShareAchievements} />
            </div>
          </GlassCard>
          <GlassCard className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Dumbbell size={16} className="text-blue-400" />
                <span className="text-sm text-muted-foreground">Share Fitness Progress</span>
              </div>
              <Switch checked={profile.shareFitnessProgress} onCheckedChange={toggleShareFitnessProgress} />
            </div>
            <p className="text-[10px] text-muted-foreground/50 mt-1">{profile.shareFitnessProgress ? 'Your weight progress and workout history are visible in feed & public profile' : 'Your fitness data is private — not visible in feed or on your public profile'}</p>
          </GlassCard>
          <GlassCard className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video size={16} className="text-purple-400" />
                <span className="text-sm text-muted-foreground">Share Content Status</span>
              </div>
              <Switch checked={profile.shareContentStatus} onCheckedChange={toggleShareContentStatus} />
            </div>
            <p className="text-[10px] text-muted-foreground/50 mt-1">{profile.shareContentStatus ? 'Your content series and live status are visible in feed & public profile' : 'Your content data is private — not visible in feed or on your public profile'}</p>
          </GlassCard>
          <GlassCard className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-cyan-400" />
                <span className="text-sm text-muted-foreground">Share Learning Progress</span>
              </div>
              <Switch checked={profile.shareLearningProgress} onCheckedChange={toggleShareLearningProgress} />
            </div>
            <p className="text-[10px] text-muted-foreground/50 mt-1">{profile.shareLearningProgress ? 'Your shared learning topics are visible in feed & discover page' : 'Your learning data is private — not visible in feed or discover'}</p>
          </GlassCard>
          <GlassCard className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {profile.isPublic ? <Globe size={16} className="text-green-400" /> : <Lock size={16} className="text-amber-400" />}
                <span className="text-sm text-muted-foreground">Public Profile</span>
              </div>
              <Switch checked={profile.isPublic} onCheckedChange={toggleIsPublic} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {profile.isPublic ? 'Anyone can see your profile and follow you automatically. Shared progress is visible to everyone.' : 'Users must send a follow request. Your shared progress is only visible to your followers.'}
            </p>
          </GlassCard>
        </TabsContent>
        <TabsContent value="danger" className="mt-4">
          <GlassCard className="p-5">
            <h3 className="text-sm font-medium text-red-400 mb-3">{t('profile.dangerZone')}</h3>
            <div className="space-y-3">
              <Button onClick={() => setReportOpen(true)} variant="ghost" className="text-amber-400 hover:bg-amber-600/10"><Flag size={14} className="mr-2" />Report an Issue</Button>
              <Button onClick={deleteAccount} variant="ghost" className="text-red-400 hover:bg-red-600/10"><Trash2 size={14} className="mr-2" />{t('profile.deleteAccount')}</Button>
            </div>
          </GlassCard>
        </TabsContent>
      </Tabs>

      {/* Followers/Following Dialog - Separate tabs */}
      <Dialog open={followersOpen} onOpenChange={setFollowersOpen}>
        <DialogContent className="bg-background border-border">
          <DialogHeader><DialogTitle className="text-foreground">{showFollowers ? t('profile.followers') : t('profile.following')}</DialogTitle></DialogHeader>
          <div className="mt-4 space-y-4 max-h-[400px] overflow-y-auto">
            {showFollowers ? (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">{t('profile.followers')} ({followerCount})</p>
                {followers.map((f: any) => (
                  <button key={f.id} onClick={() => { router.push(`/profile/${f.id}`); setFollowersOpen(false); }} className="flex items-center gap-2 p-2 w-full hover:bg-white/5 rounded-lg transition-colors">
                    <Avatar className="h-7 w-7"><AvatarFallback className="bg-blue-600/30 text-blue-300 text-[10px]">{f.name?.[0] || '?'}</AvatarFallback></Avatar>
                    <span className="text-sm text-foreground">{f.name || 'User'}</span>
                    {f.verified && <BadgeCheck size={12} className="text-blue-400" />}
                  </button>
                ))}
                {followers.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No followers yet</p>}
              </div>
            ) : (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">{t('profile.following')} ({followingCount})</p>
                {following.map((f: any) => (
                  <button key={f.id} onClick={() => { router.push(`/profile/${f.id}`); setFollowersOpen(false); }} className="flex items-center gap-2 p-2 w-full hover:bg-white/5 rounded-lg transition-colors">
                    <Avatar className="h-7 w-7"><AvatarFallback className="bg-blue-600/30 text-blue-300 text-[10px]">{f.name?.[0] || '?'}</AvatarFallback></Avatar>
                    <span className="text-sm text-foreground">{f.name || 'User'}</span>
                    {f.verified && <BadgeCheck size={12} className="text-blue-400" />}
                  </button>
                ))}
                {following.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">Not following anyone yet</p>}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Report Dialog */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="bg-background border-border">
          <DialogHeader><DialogTitle className="text-foreground flex items-center gap-2"><AlertTriangle size={18} className="text-amber-400" />Report an Issue</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm">Issue Type</Label>
              <select value={reportCategory} onChange={e => setReportCategory(e.target.value)} className="w-full bg-accent border border-border text-foreground rounded-md px-3 py-2 text-sm">
                <option value="" className="bg-background">Select issue type</option>
                <option value="bug" className="bg-background">Bug / App Issue</option>
                <option value="account" className="bg-background">Account Problem</option>
                <option value="harassment" className="bg-background">Harassment or Bullying</option>
                <option value="content" className="bg-background">Inappropriate Content</option>
                <option value="feature" className="bg-background">Feature Request</option>
                <option value="other" className="bg-background">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm">Description</Label>
              <Textarea value={reportReason} onChange={e => setReportReason(e.target.value)} placeholder="Please describe the issue in detail..." className="bg-accent border-border text-foreground placeholder:text-muted-foreground/50 min-h-[100px]" rows={4} />
            </div>
            <Button onClick={submitSelfReport} disabled={reportSubmitting || !reportCategory || !reportReason.trim()} className="gradient-blue w-full">
              {reportSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Flag size={14} className="mr-2" />}
              Submit Report
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
