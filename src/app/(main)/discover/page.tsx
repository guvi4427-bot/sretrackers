'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Search, Globe, Lock, Users, BadgeCheck, Loader2, BookOpen, UserPlus, LogIn, ChevronRight, Sparkles, Activity, Dumbbell, Flame, Scale, Zap, Trophy, Video, FileText, Film, PenTool, Edit3, ExternalLink, Check, Heart, MessageCircle, Repeat2, Share2, Bookmark, Flag } from 'lucide-react';
import { GlassCard } from '@/components/glass-card';
import { AdCard } from '@/components/ad-banner';
import ShareToChatDialog, { ShareData } from '@/components/share-to-chat-dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useUserStore } from '@/stores/user-store';
import { t } from '@/lib/i18n';
import { useRouter } from 'next/navigation';
import { useGuest } from '@/components/guest-guard';

const TABS = ['posts', 'topics', 'groups', 'users'];

// Live status pipeline per content type (shared with feed page)
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

export default function DiscoverPage() {
  const router = useRouter();
  const { profile } = useUserStore();
  const { isGuest, showLoginPrompt } = useGuest();
  const [activeTab, setActiveTab] = useState('posts');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>({ posts: [], topics: [], groups: [], users: [] });
  const [loading, setLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState<string|null>(null);

  // Live updates state — auto-fetched on page load
  const [liveContentUpdates, setLiveContentUpdates] = useState<any[]>([]);
  const [liveFitnessUpdates, setLiveFitnessUpdates] = useState<any[]>([]);
  const [liveWeightUpdates, setLiveWeightUpdates] = useState<any[]>([]);
  const [liveLearningUpdates, setLiveLearningUpdates] = useState<any[]>([]);
  const [liveLoading, setLiveLoading] = useState(true);

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Use refs for latest query/tab so the search callback doesn't need them as deps
  const queryRef = useRef(query);
  const activeTabRef = useRef(activeTab);
  queryRef.current = query;
  activeTabRef.current = activeTab;

  const search = useCallback(async (type?: string, searchQuery?: string) => {
    const tab = type || activeTabRef.current;
    const q = searchQuery ?? queryRef.current;
    setLoading(true);
    try {
      const r = await fetch(`/api/discover?type=${tab}&q=${encodeURIComponent(q.toLowerCase())}`);
      if (r.ok) {
        const d = await r.json();
        const items = Array.isArray(d) ? d : (d[tab] || []);
        setResults(prev => ({ ...prev, [tab]: items }));
      } else {
        setResults(prev => ({ ...prev, [tab]: [] }));
      }
    } catch {
      setResults(prev => ({ ...prev, [tab]: [] }));
    } finally { setLoading(false); }
  }, []);

  // Auto-fetch live updates on page load
  const fetchLiveUpdates = useCallback(async () => {
    try {
      const r = await fetch(`/api/feed/live-updates?_t=${Date.now()}`, { cache: 'no-store' });
      if (r.ok) {
        const d = await r.json();
        setLiveContentUpdates(d.contentUpdates || []);
        setLiveFitnessUpdates(d.fitnessUpdates || []);
        setLiveWeightUpdates(d.weightUpdates || []);
        setLiveLearningUpdates(d.learningUpdates || []);
      }
    } catch {} finally { setLiveLoading(false); }
  }, []);

  useEffect(() => { fetchLiveUpdates(); }, [fetchLiveUpdates]);

  // Listen for xp-updated and sharing-updated events to refresh live data
  useEffect(() => {
    const handler = () => { fetchLiveUpdates(); };
    window.addEventListener('xp-updated', handler);
    window.addEventListener('sharing-updated', handler);
    return () => { window.removeEventListener('xp-updated', handler); window.removeEventListener('sharing-updated', handler); };
  }, [fetchLiveUpdates]);

  // Debounced search: auto-search when query or tab changes (300ms delay)
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    // Always trigger search on tab change or query change
    searchTimerRef.current = setTimeout(() => { search(); }, 300);
    return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); };
  }, [activeTab, query]); // removed `search` from deps — it's now stable

  // Handle URL query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) {
      setQuery(q);
    }
  }, []);

  async function followUser(userId: string) {
    if (isGuest) { showLoginPrompt('follow users'); return; }
    try {
      const r = await fetch('/api/follow', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId }) });
      if (r.ok) {
        const data = await r.json();
        // Dispatch events so other pages (profile, feed) update their counts
        window.dispatchEvent(new CustomEvent('xp-updated'));
        window.dispatchEvent(new CustomEvent('notification-updated'));
        // Update local results to reflect the new follow status
        setResults(prev => ({
          ...prev,
          users: (prev.users || []).map((u: any) => {
            if (u.id !== userId) return u;
            if (data.status === 'accepted') return { ...u, isFollowing: true, followRequestStatus: 'accepted' };
            if (data.status === 'pending') return { ...u, isFollowing: false, followRequestStatus: 'pending' };
            if (data.status === 'unfollowed') return { ...u, isFollowing: false, followRequestStatus: 'none' };
            if (data.status === 'withdrawn') return { ...u, isFollowing: false, followRequestStatus: 'none' };
            return u;
          }),
        }));
        // Also re-search to get fresh data
        search('users');
      }
    } catch {}
  }

  async function joinGroup(groupId: string) {
    if (isGuest) { showLoginPrompt('join groups'); return; }
    setJoinLoading(groupId);
    try {
      const r = await fetch(`/api/groups/${groupId}/join`, { method: 'POST' });
      if (r.ok) {
        toast.success('Joined group!');
        search('groups');
      } else {
        const d = await r.json();
        toast.error(d.error || 'Failed to join group');
      }
    } catch {
      toast.error('Failed to join group');
    } finally {
      setJoinLoading(null);
    }
  }

  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareData, setShareData] = useState<ShareData | null>(null);

  function openShareDialog(data: ShareData) {
    if (isGuest) { showLoginPrompt('share'); return; }
    setShareData(data);
    setShareDialogOpen(true);
  }

  // Like/repost for live updates
  async function toggleLiveUpdateLike(updateId: string, entityType: string, isLiked: boolean) {
    if (isGuest) { showLoginPrompt('like'); return; }
    try {
      const url = `/api/live-updates/${updateId}/like?entityType=${encodeURIComponent(entityType)}`;
      const res = isLiked
        ? await fetch(url, { method: 'DELETE' })
        : await fetch(url, { method: 'POST' });
      if (res.ok) {
        fetchLiveUpdates();
        toast.success(isLiked ? 'Unliked' : 'Liked!');
      }
    } catch {}
  }

  async function toggleLiveUpdateRepost(updateId: string, entityType: string, isReposted: boolean) {
    if (isGuest) { showLoginPrompt('repost'); return; }
    try {
      const url = `/api/live-updates/${updateId}/repost?entityType=${encodeURIComponent(entityType)}`;
      const res = isReposted
        ? await fetch(url, { method: 'DELETE' })
        : await fetch(url, { method: 'POST' });
      if (res.ok) {
        fetchLiveUpdates();
        toast.success(isReposted ? 'Repost removed' : 'Reposted!');
      }
    } catch {}
  }

  async function toggleLiveUpdateBookmark(updateId: string, entityType: string, isBookmarked: boolean) {
    if (isGuest) { showLoginPrompt('bookmark'); return; }
    try {
      const url = `/api/live-updates/${updateId}/bookmark?entityType=${encodeURIComponent(entityType)}`;
      if (isBookmarked) {
        await fetch(url, { method: 'DELETE' });
      } else {
        await fetch(url, { method: 'POST' });
      }
      fetchLiveUpdates();
      toast.success(isBookmarked ? 'Bookmark removed' : 'Bookmarked!');
    } catch {}
  }

  // Report state for live updates
  const [reportOpen, setReportOpen] = useState(false);
  const [reportTargetId, setReportTargetId] = useState<string|null>(null);
  const [reportCategory, setReportCategory] = useState('');
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);

  function openLiveUpdateReport(updateId: string, entityType: string) {
    if (isGuest) { showLoginPrompt('report'); return; }
    setReportTargetId(updateId);
    setReportCategory('');
    setReportReason('');
    setReportOpen(true);
  }

  async function submitReport() {
    if (!reportTargetId || !reportCategory || !reportReason.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    setReportSubmitting(true);
    try {
      const r = await fetch('/api/report', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'live_update', targetId: reportTargetId, category: reportCategory, reason: reportReason.trim() }) });
      if (r.ok) { toast.success('Report submitted'); setReportOpen(false); }
      else { const d = await r.json(); toast.error(d.error || 'Report failed'); }
    } catch { toast.error('Report failed'); }
    finally { setReportSubmitting(false); }
  }

  // Like/repost for regular posts (discover search results)
  async function togglePostLike(postId: string, isLiked: boolean) {
    if (isGuest) { showLoginPrompt('like'); return; }
    try {
      const res = isLiked
        ? await fetch(`/api/posts/${postId}/like`, { method: 'DELETE' })
        : await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
      if (res.ok) {
        search('posts');
        toast.success(isLiked ? 'Unliked' : 'Liked!');
      }
    } catch {}
  }

  async function togglePostRepost(postId: string, isReposted: boolean) {
    if (isGuest) { showLoginPrompt('repost'); return; }
    try {
      const res = isReposted
        ? await fetch(`/api/posts/${postId}/repost`, { method: 'DELETE' })
        : await fetch(`/api/posts/${postId}/repost`, { method: 'POST' });
      if (res.ok) {
        search('posts');
        toast.success(isReposted ? 'Repost removed' : 'Reposted!');
      }
    } catch {}
  }

  function renderContent(text: string) {
    return text.split(/(#[\w]+|@[\w]+|https?:\/\/[^\s]+)/g).map((part, i) => {
      if (part.startsWith('#')) return <span key={i} className="text-blue-400 cursor-pointer" onClick={() => { setQuery(part); setActiveTab('posts'); }}>{part}</span>;
      if (part.startsWith('@')) return <span key={i} className="text-purple-400 cursor-pointer" onClick={() => { const username = part.slice(1); fetch(`/api/user/check-username?username=${encodeURIComponent(username)}`).then(r => r.ok ? r.json() : null).then(data => { if (data?.userId) router.push(`/profile/${data.userId}`); }); }}>{part}</span>;
      if (part.startsWith('http://') || part.startsWith('https://')) {
        const href = part.replace(/[.,;:!?)\]]+$/, '');
        return <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline underline-offset-2 hover:text-blue-300 break-all">{part}</a>;
      }
      return part;
    });
  }

  // ── Live update card renderers for discover ──
  function DiscoverContentCard({ update }: { update: any }) {
    const ct = update.contentType || 'post';
    const pipeline = getPipeline(ct);
    const currentIdx = getPipelineStepIndex(ct, update.liveStatus || 'not_started');
    const isOwn = update.isOwn;

    return (
      <GlassCard className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-9 w-9 border border-border shrink-0 cursor-pointer" onClick={() => router.push(`/profile/${update.user?.id}`)}>
            <AvatarFallback className="bg-purple-600/30 text-purple-300 text-xs">{update.user?.name?.[0] || '?'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-medium text-foreground cursor-pointer hover:text-purple-300 transition-colors" onClick={() => router.push(`/profile/${update.user?.id}`)}>{update.user?.name || 'User'} {update.user?.verified && <BadgeCheck size={12} className="text-blue-400 inline" />}</p>
              <p className="text-[10px] text-muted-foreground/70">@{update.user?.username || 'user'}</p>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse ml-0.5" />
              <span className="text-[9px] text-green-400/70 font-medium ml-0.5">LIVE</span>
            </div>
            <div className="bg-accent/50 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2.5">
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md flex items-center gap-1 ${ct === 'blog' ? 'bg-purple-600/20 text-purple-400' : ct === 'video' ? 'bg-red-600/20 text-red-400' : 'bg-blue-600/20 text-blue-400'}`}>
                  {contentTypeIcon(ct)} {contentTypeLabel(ct)}
                </span>
                <p className="text-sm font-medium text-foreground truncate">{update.title}</p>
              </div>
              <div className="flex items-center gap-0">
                {pipeline.map((step, idx) => {
                  const isCompleted = idx < currentIdx;
                  const isCurrent = idx === currentIdx;
                  const StepIcon = step.icon;
                  return (
                    <div key={step.key} className="flex items-center flex-1 last:flex-none">
                      <div className={`relative flex items-center justify-center w-7 h-7 rounded-full shrink-0 transition-all duration-300 ${isCompleted ? 'bg-green-500 text-white shadow-md shadow-green-500/20' : ''} ${isCurrent ? `${step.color} ring-2 ring-offset-1 ring-offset-background ring-current scale-110` : ''} ${!isCompleted && !isCurrent ? 'bg-white/5 text-muted-foreground/40' : ''}`}>
                        {isCompleted ? <Check size={12} strokeWidth={3} /> : isCurrent ? <StepIcon size={12} /> : <StepIcon size={11} />}
                        {isCurrent && <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-current" />}
                      </div>
                      {idx < pipeline.length - 1 && (
                        <div className={`h-0.5 flex-1 mx-1 rounded-full transition-all duration-500 ${isCompleted ? 'bg-green-500/60' : isCurrent ? 'bg-gradient-to-r from-current/40 to-transparent' : 'bg-white/5'}`} />
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center mt-1.5">
                {pipeline.map((step, idx) => (
                  <div key={step.key} className={`flex-1 text-center last:flex-none ${idx === currentIdx ? 'text-foreground' : 'text-muted-foreground/40'}`}>
                    <span className={`text-[9px] font-medium ${idx === currentIdx ? step.color.split(' ')[0] : ''}`}>{step.label}</span>
                  </div>
                ))}
              </div>
              {currentIdx === pipeline.length - 1 && (
                <div className="flex justify-end mt-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-600/20 text-green-400 font-medium flex items-center gap-1">
                    <Check size={10} /> Live
                  </span>
                </div>
              )}
            </div>
            {/* View Live Status CTA — like Shared Topic */}
            <div className="mt-2">
              <button
                onClick={() => router.push(isOwn ? '/content' : `/profile/${update.user?.id}`)}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-purple-600/10 hover:bg-purple-600/15 border border-purple-500/20 transition-colors group"
              >
                <Video size={14} className="text-purple-400 shrink-0" />
                <span className="text-xs text-purple-300 font-medium flex-1 text-left">
                  {isOwn ? 'View Your Content Pipeline' : 'View Live Status'}
                </span>
                <Sparkles size={10} className="text-amber-400/50 group-hover:text-amber-400 transition-colors" />
                <ChevronRight size={14} className="text-purple-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              {update.hashtags?.map((tag: string) => (
                <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-purple-600/15 text-purple-300 cursor-pointer hover:bg-purple-600/25 transition-colors">#{tag}</span>
              ))}
            </div>
            {/* Action bar */}
            <div className="flex items-center gap-4 mt-2 pt-2 border-t border-border/20">
              <button onClick={() => toggleLiveUpdateLike(update.id, update.entityType || 'content_entry', update.isLiked || false)} className={`flex items-center gap-1 text-xs transition-colors ${update.isLiked ? 'text-rose-400' : 'text-muted-foreground/70 hover:text-rose-400'}`}><Heart size={13} fill={update.isLiked ? 'currentColor' : 'none'} />{update.likes || 0}</button>
              <button onClick={() => { if (isGuest) { showLoginPrompt('comment'); return; } if (update.postId) { router.push(`/feed?comment=${update.postId}`); } else { router.push(isOwn ? '/content' : `/profile/${update.user?.id}`); } }} className="flex items-center gap-1 text-xs text-muted-foreground/70 hover:text-cyan-400 transition-colors"><MessageCircle size={13} />{update.comments || 0}</button>
              <button onClick={() => toggleLiveUpdateRepost(update.id, update.entityType || 'content_entry', update.isReposted || false)} className={`flex items-center gap-1 text-xs transition-colors ${update.isReposted ? 'text-green-400' : 'text-muted-foreground/70 hover:text-green-400'}`}><Repeat2 size={13} />{update.reposts || 0}</button>
              <button onClick={() => openShareDialog({ type: 'content_update', id: update.id, preview: update.title || 'Content update', userName: update.user?.name, username: update.user?.username, extra: { contentType: update.contentType, status: update.liveStatus, entityType: update.entityType || 'content_entry' } })} className="flex items-center gap-1 text-xs text-muted-foreground/70 hover:text-blue-400 transition-colors"><Share2 size={13} /></button>
              <button onClick={() => toggleLiveUpdateBookmark(update.id, update.entityType || 'content_entry', update.isBookmarked || false)} className={`flex items-center gap-1 text-xs transition-colors ${update.isBookmarked ? 'text-amber-400' : 'text-muted-foreground/70 hover:text-amber-400'}`}><Bookmark size={13} fill={update.isBookmarked ? 'currentColor' : 'none'} /></button>
              <button onClick={() => openLiveUpdateReport(update.id, update.entityType || 'content_entry')} className="text-muted-foreground/60 hover:text-amber-400 ml-auto transition-colors"><Flag size={12} /></button>
            </div>
          </div>
        </div>
      </GlassCard>
    );
  }

  function DiscoverFitnessCard({ update }: { update: any }) {
    const isWorkout = update.subType === 'workout';
    const isGaining = update.hashtags?.includes('gains');
    const isOwn = update.isOwn;
    const goalLabel = isGaining ? 'Gains' : 'Shredding';
    const goalColor = isGaining ? 'text-green-400' : 'text-orange-400';
    const goalBg = isGaining ? 'bg-green-600/15' : 'bg-orange-600/15';

    // Weight trend sparkline (from API trendData)
    const trendData: { date: string; weight: number }[] = update.trendData || [];
    const trendDirection = update.trendDirection || 'none';

    // Compute sparkline heights
    const sparkHeights = trendData.length >= 2
      ? (() => {
          const weights = trendData.map((t: any) => t.weight);
          const min = Math.min(...weights);
          const max = Math.max(...weights);
          const range = max - min || 1;
          return weights.map((w: number) => ((w - min) / range) * 70 + 30);
        })()
      : [];

    // Trend arrow
    const TrendArrow = trendDirection === 'up'
      ? <Activity size={12} className="text-green-400" />
      : trendDirection === 'down'
        ? <Activity size={12} className="text-orange-400" />
        : trendDirection === 'stable'
          ? <Activity size={12} className="text-muted-foreground/50" />
          : null;

    return (
      <GlassCard className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-9 w-9 border border-border shrink-0 cursor-pointer" onClick={() => router.push(`/profile/${update.user?.id}`)}>
            <AvatarFallback className={isGaining ? 'bg-green-600/30 text-green-300 text-xs' : 'bg-orange-600/30 text-orange-300 text-xs'}>{update.user?.name?.[0] || '?'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-medium text-foreground cursor-pointer hover:text-blue-300 transition-colors" onClick={() => router.push(`/profile/${update.user?.id}`)}>{update.user?.name || 'User'} {update.user?.verified && <BadgeCheck size={12} className="text-blue-400 inline" />}</p>
              <p className="text-[10px] text-muted-foreground/70">@{update.user?.username || 'user'}</p>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse ml-0.5" />
              <span className="text-[9px] text-green-400/70 font-medium ml-0.5">LIVE</span>
            </div>
            <div className="bg-accent/50 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md flex items-center gap-1 ${isGaining ? 'bg-green-600/20 text-green-400' : 'bg-orange-600/20 text-orange-400'}`}>
                  {isWorkout ? <Dumbbell size={12} /> : <Scale size={12} />}
                  {isWorkout ? 'Workout' : 'Weight Update'}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${goalBg} ${goalColor} font-medium`}>
                  <Trophy size={10} className="inline mr-0.5" />{goalLabel}
                </span>
              </div>
              {isWorkout ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <Flame size={14} className="text-red-400" />
                      <span className="text-sm font-semibold text-foreground">{update.workoutType}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{update.duration} min</span>
                  </div>
                  <div className="flex items-center gap-4">
                    {update.estimatedCalories && (
                      <div className="flex items-center gap-1">
                        <Zap size={12} className="text-amber-400" />
                        <span className="text-xs text-amber-300 font-medium">{update.estimatedCalories} cal</span>
                      </div>
                    )}
                    {update.muscleGroup && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-600/15 text-blue-300">{update.muscleGroup}</span>
                    )}
                    {update.sets && update.reps && (
                      <span className="text-[10px] text-muted-foreground">{update.sets}x{update.reps}{update.loadKg ? ` @ ${update.loadKg}kg` : ''}</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Scale size={16} className={isGaining ? 'text-green-400' : 'text-orange-400'} />
                    <span className="text-lg font-bold text-foreground">{update.weight} kg</span>
                    {TrendArrow}
                    <span className="text-xs text-muted-foreground">{update.date}</span>
                  </div>
                  {/* Mini weight trend sparkline */}
                  {sparkHeights.length >= 2 && (
                    <div className="flex items-end gap-[3px] h-8 px-1">
                      {sparkHeights.map((h: number, i: number) => (
                        <div
                          key={i}
                          className={`flex-1 rounded-sm transition-all duration-300 ${i === sparkHeights.length - 1 ? (isGaining ? 'bg-green-400/80' : 'bg-orange-400/80') : (isGaining ? 'bg-green-400/30' : 'bg-orange-400/30')}`}
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  )}
                  {/* Current weight from profile */}
                  {update.currentWeight && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] text-muted-foreground/50">Current:</span>
                      <span className={`text-[10px] font-medium ${isGaining ? 'text-green-300' : 'text-orange-300'}`}>{update.currentWeight} kg</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* View Fitness Dashboard CTA — like Shared Topic */}
            <div className="mt-2">
              <button
                onClick={() => router.push(isOwn ? '/fitness' : `/profile/${update.user?.id}`)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-colors group ${isGaining ? 'bg-green-600/10 hover:bg-green-600/15 border-green-500/20' : 'bg-orange-600/10 hover:bg-orange-600/15 border-orange-500/20'}`}
              >
                <Activity size={14} className={isGaining ? 'text-green-400 shrink-0' : 'text-orange-400 shrink-0'} />
                <span className={`text-xs font-medium flex-1 text-left ${isGaining ? 'text-green-300' : 'text-orange-300'}`}>
                  {isOwn ? 'View Your Fitness Dashboard' : `View ${update.user?.name?.split(' ')[0] || 'User'}'s Fitness`}
                </span>
                <Sparkles size={10} className="text-amber-400/50 group-hover:text-amber-400 transition-colors" />
                <ChevronRight size={14} className={isGaining ? 'text-green-400 group-hover:translate-x-0.5 transition-transform' : 'text-orange-400 group-hover:translate-x-0.5 transition-transform'} />
              </button>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              {update.hashtags?.map((tag: string) => (
                <span key={tag} className={`text-[10px] px-2 py-0.5 rounded-full cursor-pointer hover:opacity-80 transition-colors ${isGaining ? 'bg-green-600/15 text-green-300' : 'bg-orange-600/15 text-orange-300'}`}>#{tag}</span>
              ))}
            </div>
            {/* Action bar */}
            <div className="flex items-center gap-4 mt-2 pt-2 border-t border-border/20">
              <button onClick={() => toggleLiveUpdateLike(update.id, update.entityType || (update.subType === 'weight' ? 'fitness_weight' : 'fitness_workout'), update.isLiked || false)} className={`flex items-center gap-1 text-xs transition-colors ${update.isLiked ? 'text-rose-400' : 'text-muted-foreground/70 hover:text-rose-400'}`}><Heart size={13} fill={update.isLiked ? 'currentColor' : 'none'} />{update.likes || 0}</button>
              <button onClick={() => { if (isGuest) { showLoginPrompt('comment'); return; } if (update.postId) { router.push(`/feed?comment=${update.postId}`); } else { router.push(isOwn ? '/fitness' : `/profile/${update.user?.id}`); } }} className="flex items-center gap-1 text-xs text-muted-foreground/70 hover:text-cyan-400 transition-colors"><MessageCircle size={13} />{update.comments || 0}</button>
              <button onClick={() => toggleLiveUpdateRepost(update.id, update.entityType || (update.subType === 'weight' ? 'fitness_weight' : 'fitness_workout'), update.isReposted || false)} className={`flex items-center gap-1 text-xs transition-colors ${update.isReposted ? 'text-green-400' : 'text-muted-foreground/70 hover:text-green-400'}`}><Repeat2 size={13} />{update.reposts || 0}</button>
              <button onClick={() => openShareDialog({ type: 'fitness_update', id: update.id, preview: update.subType === 'weight' ? `Weight: ${update.weight}kg` : `${update.workoutType || 'Workout'} ${update.duration ? update.duration + 'min' : ''}${update.estimatedCalories ? ' ' + update.estimatedCalories + 'cal' : ''}`, userName: update.user?.name, username: update.user?.username, extra: { fitnessType: update.subType || 'workout', entityType: update.entityType || (update.subType === 'weight' ? 'fitness_weight' : 'fitness_workout') } })} className="flex items-center gap-1 text-xs text-muted-foreground/70 hover:text-blue-400 transition-colors"><Share2 size={13} /></button>
              <button onClick={() => toggleLiveUpdateBookmark(update.id, update.entityType || (update.subType === 'weight' ? 'fitness_weight' : 'fitness_workout'), update.isBookmarked || false)} className={`flex items-center gap-1 text-xs transition-colors ${update.isBookmarked ? 'text-amber-400' : 'text-muted-foreground/70 hover:text-amber-400'}`}><Bookmark size={13} fill={update.isBookmarked ? 'currentColor' : 'none'} /></button>
              <button onClick={() => openLiveUpdateReport(update.id, update.entityType || (update.subType === 'weight' ? 'fitness_weight' : 'fitness_workout'))} className="text-muted-foreground/60 hover:text-amber-400 ml-auto transition-colors"><Flag size={12} /></button>
            </div>
          </div>
        </div>
      </GlassCard>
    );
  }

  // ── Learning Live Update Card ──
  function DiscoverLearningCard({ update }: { update: any }) {
    const isOwn = update.isOwn;
    const phase = update.phase;

    return (
      <GlassCard className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-9 w-9 border border-border shrink-0 cursor-pointer" onClick={() => router.push(`/profile/${update.user?.id}`)}>
            <AvatarFallback className="bg-cyan-600/30 text-cyan-300 text-xs">{update.user?.name?.[0] || '?'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-medium text-foreground cursor-pointer hover:text-cyan-300 transition-colors" onClick={() => router.push(`/profile/${update.user?.id}`)}>{update.user?.name || 'User'} {update.user?.verified && <BadgeCheck size={12} className="text-blue-400 inline" />}</p>
              <p className="text-[10px] text-muted-foreground/70">@{update.user?.username || 'user'}</p>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse ml-0.5" />
              <span className="text-[9px] text-green-400/70 font-medium ml-0.5">LIVE</span>
            </div>

            {/* Learning card with topic info */}
            <div className="bg-accent/50 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2.5">
                <span className="text-[10px] px-1.5 py-0.5 rounded-md flex items-center gap-1 bg-cyan-600/20 text-cyan-400">
                  <BookOpen size={12} /> Learning
                </span>
                <p className="text-sm font-medium text-foreground truncate">{update.name}</p>
              </div>

              {/* Topic stats row */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <BookOpen size={12} className="text-cyan-400" />
                  <span className="text-xs text-foreground font-medium">{update.entryCount || 0} entries</span>
                </div>
                {phase && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-600/15 text-cyan-300 font-medium">
                    {phase.charAt(0).toUpperCase() + phase.slice(1)} Phase
                  </span>
                )}
                {update.sharedAt && (
                  <span className="text-[10px] text-muted-foreground/50">
                    Shared {new Date(update.sharedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            {/* View Shared Collection CTA */}
            <div className="mt-2">
              <button
                onClick={() => router.push(`/shared-topic/${update.id}?from=discover`)}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-cyan-600/10 hover:bg-cyan-600/15 border border-cyan-500/20 transition-colors group"
              >
                <Globe size={14} className="text-cyan-400 shrink-0" />
                <span className="text-xs text-cyan-300 font-medium flex-1 text-left">
                  View Shared Collection
                </span>
                <Sparkles size={10} className="text-amber-400/50 group-hover:text-amber-400 transition-colors" />
                <ChevronRight size={14} className="text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            <div className="flex items-center gap-1.5 mt-2">
              {update.hashtags?.map((tag: string) => (
                <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-600/15 text-cyan-300 cursor-pointer hover:bg-cyan-600/25 transition-colors">#{tag}</span>
              ))}
            </div>
            {/* Action bar */}
            <div className="flex items-center gap-4 mt-2 pt-2 border-t border-border/20">
              <button onClick={() => toggleLiveUpdateLike(update.id, update.entityType || 'learning_topic', update.isLiked || false)} className={`flex items-center gap-1 text-xs transition-colors ${update.isLiked ? 'text-rose-400' : 'text-muted-foreground/70 hover:text-rose-400'}`}><Heart size={13} fill={update.isLiked ? 'currentColor' : 'none'} />{update.likes || 0}</button>
              <button onClick={() => { if (isGuest) { showLoginPrompt('comment'); return; } if (update.postId) { router.push(`/feed?comment=${update.postId}`); } else { router.push(`/shared-topic/${update.id}?from=discover`); } }} className="flex items-center gap-1 text-xs text-muted-foreground/70 hover:text-cyan-400 transition-colors"><MessageCircle size={13} />{update.comments || 0}</button>
              <button onClick={() => toggleLiveUpdateRepost(update.id, update.entityType || 'learning_topic', update.isReposted || false)} className={`flex items-center gap-1 text-xs transition-colors ${update.isReposted ? 'text-green-400' : 'text-muted-foreground/70 hover:text-green-400'}`}><Repeat2 size={13} />{update.reposts || 0}</button>
              <button onClick={() => openShareDialog({ type: 'learning_update', id: update.id, preview: update.name || 'Learning topic', userName: update.user?.name, username: update.user?.username, extra: { entityType: update.entityType || 'learning_topic' } })} className="flex items-center gap-1 text-xs text-muted-foreground/70 hover:text-blue-400 transition-colors"><Share2 size={13} /></button>
              <button onClick={() => toggleLiveUpdateBookmark(update.id, update.entityType || 'learning_topic', update.isBookmarked || false)} className={`flex items-center gap-1 text-xs transition-colors ${update.isBookmarked ? 'text-amber-400' : 'text-muted-foreground/70 hover:text-amber-400'}`}><Bookmark size={13} fill={update.isBookmarked ? 'currentColor' : 'none'} /></button>
              <button onClick={() => openLiveUpdateReport(update.id, update.entityType || 'learning_topic')} className="text-muted-foreground/60 hover:text-amber-400 ml-auto transition-colors"><Flag size={12} /></button>
            </div>
          </div>
        </div>
      </GlassCard>
    );
  }

  // Build merged & sorted live updates
  const allLiveUpdates = [...liveLearningUpdates, ...liveContentUpdates, ...liveFitnessUpdates, ...liveWeightUpdates]
    .sort((a, b) => new Date(b.updatedAt || b.sharedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.sharedAt || a.createdAt).getTime());

  // Group live updates for sectioned display
  const learningLive = liveLearningUpdates;
  const contentLive = liveContentUpdates;
  const fitnessLive = [...liveFitnessUpdates, ...liveWeightUpdates];

  // Filter live updates by search query (case-insensitive match on name, title, hashtags, content keywords)
  const lowerQuery = query.trim().toLowerCase();
  function liveMatchesSearch(update: any): boolean {
    if (!lowerQuery) return true;
    const name = (update.name || '').toLowerCase();
    const title = (update.title || '').toLowerCase();
    const tags = (update.hashtags || []).map((h: string) => h.toLowerCase());
    const workoutType = (update.workoutType || '').toLowerCase();
    const muscleGroup = (update.muscleGroup || '').toLowerCase();
    return name.includes(lowerQuery) || title.includes(lowerQuery) || tags.some((t: string) => t.includes(lowerQuery)) || workoutType.includes(lowerQuery) || muscleGroup.includes(lowerQuery);
  }
  const filteredLearningLive = learningLive.filter(liveMatchesSearch);
  const filteredContentLive = contentLive.filter(liveMatchesSearch);
  const filteredFitnessLive = fitnessLive.filter(liveMatchesSearch);

  // Deduplicate: same topic from same user should appear only once
  const deduplicatedLearningLive = (() => {
    const seen = new Set<string>();
    return filteredLearningLive.filter((u: any) => {
      const key = `${u.id}_${u.user?.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  })();
  const deduplicatedContentLive = (() => {
    const seen = new Set<string>();
    return filteredContentLive.filter((u: any) => {
      const key = `${u.id}_${u.user?.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  })();
  const deduplicatedFitnessLive = (() => {
    const seen = new Set<string>();
    return filteredFitnessLive.filter((u: any) => {
      const key = `${u.id}_${u.user?.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  })();

  // Set of live topic IDs to exclude from regular topic search results (prevent duplicate text-only version)
  const liveTopicIds = new Set<string>(deduplicatedLearningLive.map((u: any) => u.id));

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Semantic heading for SEO/crawlers — visually hidden */}
      <h1 className="sr-only">Discover — {t('app.name')}</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-accent border border-border w-full flex">
          {TABS.map(tab => (
            <TabsTrigger key={tab} value={tab} className="text-muted-foreground text-xs flex-1 data-[state=active]:text-blue-400 data-[state=active]:bg-blue-600/20">
              {t(`discover.${tab}`)}
            </TabsTrigger>
          ))}
        </TabsList>

      {/* Search */}
      <GlassCard className="p-4 mt-4">
        <div className="flex gap-2">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={16} /><Input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()} placeholder={t('discover.searchPlaceholder')} className="bg-accent border-border text-foreground pl-10 placeholder:text-muted-foreground/50" /></div>
          <Button onClick={() => search()} className="gradient-blue">{t('common.search')}</Button>
        </div>
      </GlassCard>

        <TabsContent value="posts" className="space-y-3 mt-4">
          {/* ═══ LIVE UPDATES in Posts tab: learning + content + fitness rich cards ═══ */}
          {!liveLoading && (deduplicatedLearningLive.length > 0 || deduplicatedContentLive.length > 0 || deduplicatedFitnessLive.length > 0) && (
            <div className="space-y-3">
              {/* Learning Live Topic Updates */}
              {deduplicatedLearningLive.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <BookOpen size={14} className="text-cyan-400" />
                    <h3 className="text-sm font-medium text-cyan-400">#learning</h3>
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse ml-0.5" />
                    <span className="text-[9px] text-green-400/70 font-medium ml-0.5">LIVE</span>
                    <span className="text-[9px] text-muted-foreground/50 ml-1">{deduplicatedLearningLive.length} update{deduplicatedLearningLive.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="space-y-3">
                    {deduplicatedLearningLive.map((u: any) => (
                      <DiscoverLearningCard key={u.id} update={u} />
                    ))}
                  </div>
                </div>
              )}

              {/* Content Live Updates */}
              {deduplicatedContentLive.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Video size={14} className="text-purple-400" />
                    <h3 className="text-sm font-medium text-purple-400">#content</h3>
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse ml-0.5" />
                    <span className="text-[9px] text-green-400/70 font-medium ml-0.5">LIVE</span>
                    <span className="text-[9px] text-muted-foreground/50 ml-1">{deduplicatedContentLive.length} update{deduplicatedContentLive.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="space-y-3">
                    {deduplicatedContentLive.map((u: any) => (
                      <DiscoverContentCard key={u.id} update={u} />
                    ))}
                  </div>
                </div>
              )}

              {/* Fitness Live Updates */}
              {deduplicatedFitnessLive.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Dumbbell size={14} className="text-green-400" />
                    <h3 className="text-sm font-medium text-green-400">#fitness</h3>
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse ml-0.5" />
                    <span className="text-[9px] text-green-400/70 font-medium ml-0.5">LIVE</span>
                    <span className="text-[9px] text-muted-foreground/50 ml-1">{deduplicatedFitnessLive.length} update{deduplicatedFitnessLive.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="space-y-3">
                    {deduplicatedFitnessLive.map((u: any) => (
                      <DiscoverFitnessCard key={u.id} update={u} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Live loading skeleton for posts tab */}
          {liveLoading && (
            <GlassCard className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Activity size={14} className="text-green-400" />
                <span className="text-sm text-muted-foreground">Loading live updates...</span>
                <Loader2 size={14} className="text-green-400 animate-spin ml-1" />
              </div>
            </GlassCard>
          )}

          {/* Text posts from feed — raw/simple style */}
          {loading ? <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-blue-400 animate-spin" /></div> :
          (Array.isArray(results.posts) ? results.posts : []).length === 0 && !liveLoading && deduplicatedLearningLive.length === 0 && deduplicatedContentLive.length === 0 && deduplicatedFitnessLive.length === 0 ? (
            <GlassCard className="p-8 text-center">
              <Search className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No posts found</p>
              <p className="text-xs text-muted-foreground/50 mt-1">Try searching for a keyword or hashtag</p>
            </GlassCard>
          ) :
          (Array.isArray(results.posts) ? results.posts : []).map((p: any) => (
            <GlassCard key={p.id} className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Avatar className="h-8 w-8"><AvatarFallback className="bg-blue-600/30 text-blue-300 text-xs">{p.user?.name?.[0] || '?'}</AvatarFallback></Avatar>
                <div><p className="text-sm font-medium text-foreground">{p.user?.name || 'User'} {p.user?.verified && <BadgeCheck size={12} className="text-blue-400 inline" />}</p><p className="text-[10px] text-muted-foreground">@{p.user?.username || ''}</p></div>
              </div>
              <p className="text-sm text-foreground/90 whitespace-pre-wrap mb-2">{renderContent(p.content)}</p>
              <div className="flex items-center gap-4 pt-1 border-t border-border/20">
                <button onClick={() => togglePostLike(p.id, p.isLiked)} className={`flex items-center gap-1 text-xs transition-colors ${p.isLiked ? 'text-rose-400' : 'text-muted-foreground/70 hover:text-rose-400'}`}><Heart size={13} fill={p.isLiked ? 'currentColor' : 'none'} />{p.stats?.likes || p.likes || 0}</button>
                <button onClick={() => { if (isGuest) { showLoginPrompt('comment'); return; } router.push(`/feed?comment=${p.id}`); }} className="flex items-center gap-1 text-xs text-muted-foreground/70 hover:text-cyan-400 transition-colors"><MessageCircle size={13} />{p.stats?.comments || 0}</button>
                <button onClick={() => togglePostRepost(p.id, p.isReposted)} className={`flex items-center gap-1 text-xs transition-colors ${p.isReposted ? 'text-green-400' : 'text-muted-foreground/70 hover:text-green-400'}`}><Repeat2 size={13} />{p.stats?.reposts || 0}</button>
                <button onClick={() => openShareDialog({ type: 'post', id: p.id, preview: p.content?.slice(0, 120) || '', userName: p.user?.name, username: p.user?.username })} className="flex items-center gap-1 text-xs text-muted-foreground/70 hover:text-blue-400 transition-colors"><Share2 size={13} /></button>
              </div>
            </GlassCard>
          ))}
        </TabsContent>

        <TabsContent value="topics" className="space-y-3 mt-4">
          {/* ═══ LIVE UPDATES in Topics tab: learning live cards ═══ */}
          {!liveLoading && deduplicatedLearningLive.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 mb-2">
                <BookOpen size={14} className="text-cyan-400" />
                <h3 className="text-sm font-medium text-cyan-400">#learning</h3>
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse ml-0.5" />
                <span className="text-[9px] text-green-400/70 font-medium ml-0.5">LIVE</span>
                <span className="text-[9px] text-muted-foreground/50 ml-1">{deduplicatedLearningLive.length} update{deduplicatedLearningLive.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="space-y-3">
                {deduplicatedLearningLive.map((u: any) => (
                  <DiscoverLearningCard key={u.id} update={u} />
                ))}
              </div>
            </div>
          )}

          {/* Live loading skeleton for topics tab */}
          {liveLoading && (
            <GlassCard className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Activity size={14} className="text-cyan-400" />
                <span className="text-sm text-muted-foreground">Loading live topics...</span>
                <Loader2 size={14} className="text-cyan-400 animate-spin ml-1" />
              </div>
            </GlassCard>
          )}

          {/* Topic search results — exclude topics already shown as rich live cards */}
          {loading ? <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-blue-400 animate-spin" /></div> :
          (Array.isArray(results.topics) ? results.topics : []).filter((topic: any) => !liveTopicIds.has(topic.id)).map((topic: any) => (
            <GlassCard
              key={topic.id}
              className="p-4 cursor-pointer hover:border-blue-500/20 transition-colors group"
              onClick={() => router.push(`/shared-topic/${topic.id}?from=discover`)}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-600/15 flex items-center justify-center shrink-0 group-hover:bg-blue-600/25 transition-colors">
                  <BookOpen size={16} className="text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground group-hover:text-blue-300 transition-colors truncate">{topic.name}</p>
                    <div className="flex items-center gap-2 shrink-0">
                      {topic.isSharedCollection ? <Globe size={14} className="text-green-400" /> : <Lock size={14} className="text-muted-foreground/50" />}
                      <ChevronRight size={16} className="text-muted-foreground/30 group-hover:text-blue-400 transition-colors" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-[10px] text-muted-foreground/70">{topic.entryCount || 0} entries</span>
                    {topic.phase && <span className="text-[10px] bg-blue-600/20 text-blue-300 px-2 py-0.5 rounded-full">{topic.phase}</span>}
                    {topic.sharedAt && (
                      <span className="text-[10px] text-muted-foreground/50">Shared {new Date(topic.sharedAt).toLocaleDateString()}</span>
                    )}
                  </div>
                  {/* Owner info — same style as feed */}
                  {topic.author && (
                    <div className="flex items-center gap-2 mt-2">
                      <Avatar className="h-5 w-5 shrink-0">
                        <AvatarFallback className="bg-blue-600/30 text-blue-300 text-[8px]">{topic.author.name?.[0] || '?'}</AvatarFallback>
                      </Avatar>
                      <span className="text-[10px] text-muted-foreground">
                        by <span className="text-foreground font-medium">{topic.author.name}</span>
                      </span>
                      {topic.author.verified && <BadgeCheck size={10} className="text-blue-400" />}
                      <span className="text-[10px] text-muted-foreground/50">@{topic.author.username}</span>
                    </div>
                  )}
                  {/* View Collection CTA — like feed */}
                  <div className="mt-2">
                    <div className="flex items-center gap-1.5 text-[10px] text-blue-300 font-medium group-hover:text-blue-200 transition-colors">
                      <Sparkles size={8} className="text-amber-400/60 group-hover:text-amber-400 transition-colors" />
                      View Shared Collection
                      <ChevronRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
          {!loading && (Array.isArray(results.topics) ? results.topics : []).filter((t: any) => !liveTopicIds.has(t.id)).length === 0 && !liveLoading && deduplicatedLearningLive.length === 0 && (
            <GlassCard className="p-8 text-center">
              <BookOpen className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No shared topics found</p>
              <p className="text-xs text-muted-foreground/50 mt-1">Try searching for a topic name</p>
            </GlassCard>
          )}
        </TabsContent>

        <TabsContent value="groups" className="space-y-3 mt-4">
          {loading ? <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-blue-400 animate-spin" /></div> :
          (Array.isArray(results.groups) ? results.groups : []).length === 0 ? (
            <GlassCard className="p-8 text-center">
              <Users className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No groups found</p>
              <p className="text-xs text-muted-foreground/50 mt-1">Try searching for a group name</p>
            </GlassCard>
          ) :
          (Array.isArray(results.groups) ? results.groups : []).map((g: any) => (
            <GlassCard key={g.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-600/20 flex items-center justify-center"><Users size={18} className="text-emerald-400" /></div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{g.name}</p>
                    <p className="text-[10px] text-muted-foreground">{g.memberCount || g._count?.members || 0} members{g.isPublic ? ' · Public' : ' · Private'}</p>
                  </div>
                </div>
                {g.isPublic && (
                  <Button
                    onClick={() => joinGroup(g.id)}
                    size="sm"
                    variant="ghost"
                    disabled={joinLoading === g.id}
                    className="text-emerald-400 text-xs"
                  >
                    {joinLoading === g.id ? <Loader2 size={14} className="animate-spin" /> : <LogIn size={14} className="mr-1" />}
                    Join
                  </Button>
                )}
              </div>
            </GlassCard>
          ))}
        </TabsContent>

        <TabsContent value="users" className="space-y-3 mt-4">
          {loading ? <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-blue-400 animate-spin" /></div> :
          (Array.isArray(results.users) ? results.users : []).length === 0 ? (
            <GlassCard className="p-8 text-center">
              <Users className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No users found</p>
              <p className="text-xs text-muted-foreground/50 mt-1">Try searching for a name or username</p>
            </GlassCard>
          ) :
          (Array.isArray(results.users) ? results.users : []).map((u: any) => (
            <GlassCard key={u.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push(`/profile/${u.id}`)}>
                <Avatar className="h-10 w-10"><AvatarFallback className="bg-blue-600/30 text-blue-300 text-sm">{u.name?.[0] || u.username?.[0] || '?'}</AvatarFallback></Avatar>
                <div><p className="text-sm font-medium text-foreground">{u.name || u.username} {u.verified && <BadgeCheck size={12} className="text-blue-400 inline" />}</p><p className="text-[10px] text-muted-foreground">@{u.username}</p></div>
              </div>
              {u.id !== profile?.userId && (
                <Button onClick={() => followUser(u.id)} size="sm" variant="ghost" className={`text-xs ${u.isFollowing ? 'text-muted-foreground' : u.followRequestStatus === 'pending' ? 'text-amber-400' : 'text-blue-400'}`}>
                  {u.isFollowing ? 'Following' : u.followRequestStatus === 'pending' ? 'Requested' : u.isPublic === false ? 'Request' : 'Follow'}
                </Button>
              )}
            </GlassCard>
          ))}
        </TabsContent>
      </Tabs>

      {/* Ad Banner — bottom of page, above footer */}
      <AdCard format="in-feed" slot="discover_bottom" />

      {/* Share to Chat Dialog */}
      <ShareToChatDialog isOpen={shareDialogOpen} onClose={() => setShareDialogOpen(false)} shareData={shareData} />

      {/* Report Dialog for Live Updates */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flag size={18} className="text-amber-400" />
              Report Content
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1">Category</Label>
              <select value={reportCategory} onChange={e => setReportCategory(e.target.value)} className="w-full p-2 rounded-md bg-accent border border-border text-foreground text-sm">
                <option value="">Select category</option>
                <option value="spam">Spam</option>
                <option value="harassment">Harassment</option>
                <option value="misinformation">Misinformation</option>
                <option value="inappropriate">Inappropriate Content</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1">Reason</Label>
              <Textarea value={reportReason} onChange={e => setReportReason(e.target.value)} placeholder="Describe the issue..." className="bg-accent border-border text-foreground text-sm" rows={3} />
            </div>
            <Button onClick={submitReport} disabled={reportSubmitting} className="w-full gradient-blue">
              {reportSubmitting ? <Loader2 size={14} className="animate-spin" /> : 'Submit Report'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
