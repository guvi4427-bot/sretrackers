'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Heart, MessageCircle, Repeat2, MoreHorizontal, Send, Trash2, Flag, Loader2, BookOpen, AlertTriangle, Bookmark, Rss, FileText, ChevronRight, Globe, Sparkles, Video, Edit3, ExternalLink, Film, PenTool, Check, Dumbbell, TrendingUp, Activity, Flame, Scale, Zap, Trophy, Share2 } from 'lucide-react';
import { GlassCard } from '@/components/glass-card';
import { AdCard } from '@/components/ad-banner';
import ShareToChatDialog, { ShareData } from '@/components/share-to-chat-dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useUserStore } from '@/stores/user-store';
import { t } from '@/lib/i18n';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { WeightChart, WorkoutChart } from '@/app/(main)/fitness/_charts';
import { useGuest } from '@/components/guest-guard';

// ── Shared Topic CTA Button ──
function SharedTopicCTA({ topicId, router }: { topicId: string; router: ReturnType<typeof useRouter> }) {
  return (
    <div className="mt-2">
      <button
        onClick={() => router.push(`/shared-topic/${topicId}?from=feed`)}
        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-blue-600/10 hover:bg-blue-600/15 border border-blue-500/20 transition-colors group"
      >
        <Globe size={14} className="text-blue-400 shrink-0" />
        <span className="text-xs text-blue-300 font-medium flex-1 text-left">
          View Shared Collection
        </span>
        <Sparkles size={10} className="text-amber-400/50 group-hover:text-amber-400 transition-colors" />
        <ChevronRight size={14} className="text-blue-400 group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
}

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

export default function FeedClient() {
  const router = useRouter();
  const { profile } = useUserStore();
  const { isGuest, showLoginPrompt } = useGuest();
  const [posts, setPosts] = useState<any[]>([]);
  const [newContent, setNewContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [commentPostId, setCommentPostId] = useState<string|null>(null);
  const [commentText, setCommentText] = useState('');
  const [openComments, setOpenComments] = useState<Record<string, any[]>>({});
  const [liveUpdateComments, setLiveUpdateComments] = useState<Record<string, any[]>>({});
  const [liveUpdateCommentText, setLiveUpdateCommentText] = useState('');
  const [liveUpdateCommentTarget, setLiveUpdateCommentTarget] = useState<string|null>(null);
  const abortRef = useRef<AbortController|null>(null);
  const initialLoadRef = useRef(false);
  // Guard: prevent fetchLiveUpdates from unmounting comment input on mobile
  const isCommentingRef = useRef(false);
  const liveUpdateCommentInputRef = useRef<HTMLInputElement | null>(null);

  // Live Status data (own data for Live tab)
  const [feedWeightLogs, setFeedWeightLogs] = useState<any[]>([]);
  const [feedWorkouts, setFeedWorkouts] = useState<any[]>([]);
  const [feedContentEntries, setFeedContentEntries] = useState<any[]>([]);
  const [feedLearningTopics, setFeedLearningTopics] = useState<any[]>([]);

  // Other users' live updates for Feed tab
  const [liveContentUpdates, setLiveContentUpdates] = useState<any[]>([]);
  const [liveFitnessUpdates, setLiveFitnessUpdates] = useState<any[]>([]);
  const [liveWeightUpdates, setLiveWeightUpdates] = useState<any[]>([]);
  const [liveLearningUpdates, setLiveLearningUpdates] = useState<any[]>([]);

  const fetchPosts = useCallback(async (showSkeleton = false) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    if (showSkeleton) setLoading(true);
    try {
      const r = await fetch(`/api/posts?_t=${Date.now()}`, { signal: controller.signal });
      if (r.ok && !controller.signal.aborted) {
        const data = await r.json();
        const postsArr = Array.isArray(data) ? data : data.posts || [];
        setPosts(postsArr);
        setLoading(false);
        initialLoadRef.current = true;
      }
    } catch (e: any) { if (e.name !== 'AbortError') setLoading(false); }
  }, []);

  // Fetch user's own fitness & content data for Live Status tab (auth required)
  const fetchLiveData = useCallback(async () => {
    if (isGuest) return; // Guests can't access fitness/content APIs
    try {
      const [wRes, wlRes, eRes, ltRes] = await Promise.all([
        fetch('/api/fitness/workout'),
        fetch('/api/fitness/weight'),
        fetch('/api/content/entries'),
        fetch('/api/learning/topic'),
      ]);
      if (wRes.ok) { const d = await wRes.json(); setFeedWorkouts(Array.isArray(d) ? d : d.workouts || []); }
      if (wlRes.ok) { const d = await wlRes.json(); setFeedWeightLogs(Array.isArray(d) ? d : d.weightLogs || []); }
      if (eRes.ok) { const d = await eRes.json(); setFeedContentEntries(Array.isArray(d) ? d : d.entries || []); }
      if (ltRes.ok) { const d = await ltRes.json(); setFeedLearningTopics(Array.isArray(d) ? d : d.topics || []); }
    } catch {}
  }, []);

  // Fetch other users' live updates for Feed tab
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
    } catch {}
  }, []);

  useEffect(() => { fetchPosts(true); fetchLiveData(); fetchLiveUpdates(); }, [fetchPosts, fetchLiveData, fetchLiveUpdates]);

  // Listen for xp-updated and sharing-updated events to refresh live data
  // Skip fetchLiveUpdates when user is actively commenting to prevent unmounting input on mobile
  useEffect(() => {
    const handler = () => {
      fetchLiveData();
      if (!isCommentingRef.current) {
        fetchLiveUpdates();
      }
    };
    window.addEventListener('xp-updated', handler);
    window.addEventListener('sharing-updated', handler);
    return () => { window.removeEventListener('xp-updated', handler); window.removeEventListener('sharing-updated', handler); };
  }, [fetchLiveData, fetchLiveUpdates]);

  // Visibility/focus refetch
  useEffect(() => {
    let throttle = false;
    const handler = () => { if (!throttle) { throttle = true; fetchPosts(); setTimeout(() => { throttle = false; }, 2000); } };
    document.addEventListener('visibilitychange', handler);
    window.addEventListener('focus', handler);
    return () => { document.removeEventListener('visibilitychange', handler); window.removeEventListener('focus', handler); };
  }, [fetchPosts]);

  // ── Live update card components ──

  function ContentLiveUpdateCard({ update }: { update: any }) {
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
              <p className="text-sm font-medium text-foreground cursor-pointer hover:text-purple-300 transition-colors" onClick={() => router.push(`/profile/${update.user?.id}`)}>{update.user?.name || 'User'} {update.user?.verified && <span className="text-blue-400">✓</span>}</p>
              <p className="text-[10px] text-muted-foreground/70">@{update.user?.username || 'user'}</p>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse ml-0.5" />
              <span className="text-[9px] text-green-400/70 font-medium ml-0.5">LIVE</span>
            </div>

            {/* Live content card with pipeline — same visual as content page */}
            <div className="bg-accent/50 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2.5">
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md flex items-center gap-1 ${ct === 'blog' ? 'bg-purple-600/20 text-purple-400' : ct === 'video' ? 'bg-red-600/20 text-red-400' : 'bg-blue-600/20 text-blue-400'}`}>
                  {contentTypeIcon(ct)}
                  {contentTypeLabel(ct)}
                </span>
                <p className="text-sm font-medium text-foreground truncate">{update.title}</p>
              </div>

              {/* Pipeline Steps */}
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

              {/* Step Labels */}
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

            {/* View Live Status CTA — like Shared Topic CTA */}
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

            {/* Hashtag pills */}
            <div className="flex items-center gap-1.5 mt-2">
              {update.hashtags?.map((tag: string) => (
                <span
                  key={tag}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-purple-600/15 text-purple-300 cursor-pointer hover:bg-purple-600/25 transition-colors"
                  onClick={() => router.push(`/discover?q=${encodeURIComponent('#' + tag)}`)}
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Action bar for live updates */}
            <div className="flex items-center gap-4 mt-2 pt-2 border-t border-border/20">
              <button onClick={() => toggleLiveUpdateLike(update.id, update.entityType || 'content_entry', update.isLiked || false)} className={`flex items-center gap-1 text-xs transition-colors ${update.isLiked ? 'text-rose-400' : 'text-muted-foreground/70 hover:text-rose-400'}`}><Heart size={13} fill={update.isLiked ? 'currentColor' : 'none'} />{update.likes || 0}</button>
              <button onClick={() => toggleLiveUpdateCommentSection(update.id, update.entityType || 'content_entry')} className="flex items-center gap-1 text-xs text-muted-foreground/70 hover:text-cyan-400 transition-colors"><MessageCircle size={13} />{update.comments || 0}</button>
              <button onClick={() => toggleLiveUpdateRepost(update.id, update.entityType || 'content_entry', update.isReposted || false)} className={`flex items-center gap-1 text-xs transition-colors ${update.isReposted ? 'text-green-400' : 'text-muted-foreground/70 hover:text-green-400'}`}><Repeat2 size={13} />{update.reposts || 0}</button>
              <button onClick={() => openShareDialog({ type: 'content_update', id: update.id, preview: update.title || 'Content update', userName: update.user?.name, username: update.user?.username, extra: { contentType: update.contentType, status: update.liveStatus, entityType: update.entityType || 'content_entry' } })} className="flex items-center gap-1 text-xs text-muted-foreground/70 hover:text-blue-400 transition-colors"><Share2 size={13} /></button>
              <button onClick={() => toggleLiveUpdateBookmark(update.id, update.entityType || 'content_entry', update.isBookmarked || false)} className={`flex items-center gap-1 text-xs transition-colors ${update.isBookmarked ? 'text-amber-400' : 'text-muted-foreground/70 hover:text-amber-400'}`}><Bookmark size={13} fill={update.isBookmarked ? 'currentColor' : 'none'} /></button>
              <button onClick={() => openLiveUpdateReport(update.id, update.entityType || 'content_entry')} className="text-muted-foreground/60 hover:text-amber-400 ml-auto transition-colors"><Flag size={12} /></button>
            </div>
            {/* Inline comment section for content update */}
            {liveUpdateCommentTarget === update.id && (
              <div className="mt-3 pt-3 border-t border-border/20 space-y-2">
                <div className="flex gap-2">
                  <Input ref={liveUpdateCommentInputRef} value={liveUpdateCommentTarget === update.id ? liveUpdateCommentText : ''} onChange={e => setLiveUpdateCommentText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addLiveUpdateComment(update.id, update.entityType || 'content_entry'); }} placeholder="Write a comment..." className="bg-accent border-border text-foreground text-xs h-8" autoFocus />
                  <Button onClick={() => addLiveUpdateComment(update.id, update.entityType || 'content_entry')} size="icon" className="gradient-blue shrink-0 h-8 w-8" disabled={!liveUpdateCommentText.trim()}><Send size={12} /></Button>
                </div>
                {(liveUpdateComments[update.id] || []).map((c: any) => (
                  <div key={c.id} className="flex items-start gap-2 p-2 rounded-lg bg-accent/20">
                    <Avatar className="h-6 w-6 border border-border shrink-0"><AvatarFallback className="bg-blue-600/20 text-blue-300 text-[9px]">{c.user?.profile?.name?.[0] || c.user?.username?.[0] || '?'}</AvatarFallback></Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-medium text-foreground">{c.user?.profile?.name || c.user?.username || 'User'}{c.user?.profile?.verified && <span className="text-blue-400 text-[8px] ml-0.5">✓</span>}</p>
                      <p className="text-[10px] text-muted-foreground">{c.content}</p>
                    </div>
                  </div>
                ))}
                {(!liveUpdateComments[update.id] || liveUpdateComments[update.id].length === 0) && <p className="text-[10px] text-muted-foreground/50 text-center">No comments yet</p>}
              </div>
            )}
          </div>
        </div>
      </GlassCard>
    );
  }

  function FitnessLiveUpdateCard({ update }: { update: any }) {
    const isWorkout = update.subType === 'workout';
    const isGaining = update.hashtags?.includes('gains');
    const isOwn = update.isOwn;
    const goalLabel = isGaining ? 'Gains' : 'Shredding';
    const goalColor = isGaining ? 'text-green-400' : 'text-orange-400';
    const goalBg = isGaining ? 'bg-green-600/15' : 'bg-orange-600/15';

    // Weight trend sparkline (from API trendData)
    const trendData: { date: string; weight: number }[] = update.trendData || [];
    const trendDirection = update.trendDirection || 'none';

    // Compute sparkline heights (normalize to 0-100% range)
    const sparkHeights = trendData.length >= 2
      ? (() => {
          const weights = trendData.map((t: any) => t.weight);
          const min = Math.min(...weights);
          const max = Math.max(...weights);
          const range = max - min || 1;
          return weights.map((w: number) => ((w - min) / range) * 70 + 30); // 30-100% height range
        })()
      : [];

    // Trend arrow
    const TrendArrow = trendDirection === 'up'
      ? <TrendingUp size={12} className="text-green-400" />
      : trendDirection === 'down'
        ? <TrendingUp size={12} className="text-orange-400 rotate-180" />
        : trendDirection === 'stable'
          ? <TrendingUp size={12} className="text-muted-foreground/50" />
          : null;

    return (
      <GlassCard className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-9 w-9 border border-border shrink-0 cursor-pointer" onClick={() => router.push(`/profile/${update.user?.id}`)}>
            <AvatarFallback className={isGaining ? 'bg-green-600/30 text-green-300 text-xs' : 'bg-orange-600/30 text-orange-300 text-xs'}>{update.user?.name?.[0] || '?'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-medium text-foreground cursor-pointer hover:text-blue-300 transition-colors" onClick={() => router.push(`/profile/${update.user?.id}`)}>{update.user?.name || 'User'} {update.user?.verified && <span className="text-blue-400">✓</span>}</p>
              <p className="text-[10px] text-muted-foreground/70">@{update.user?.username || 'user'}</p>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse ml-0.5" />
              <span className="text-[9px] text-green-400/70 font-medium ml-0.5">LIVE</span>
            </div>

            {/* Fitness update card */}
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

            {/* View Fitness Dashboard CTA — like Shared Topic CTA */}
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

            {/* Hashtag pills */}
            <div className="flex items-center gap-1.5 mt-2">
              {update.hashtags?.map((tag: string) => (
                <span
                  key={tag}
                  className={`text-[10px] px-2 py-0.5 rounded-full cursor-pointer hover:opacity-80 transition-colors ${isGaining ? 'bg-green-600/15 text-green-300' : 'bg-orange-600/15 text-orange-300'}`}
                  onClick={() => router.push(`/discover?q=${encodeURIComponent('#' + tag)}`)}
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Action bar for live updates */}
            <div className="flex items-center gap-4 mt-2 pt-2 border-t border-border/20">
              <button onClick={() => toggleLiveUpdateLike(update.id, update.entityType || (update.subType === 'weight' ? 'fitness_weight' : 'fitness_workout'), update.isLiked || false)} className={`flex items-center gap-1 text-xs transition-colors ${update.isLiked ? 'text-rose-400' : 'text-muted-foreground/70 hover:text-rose-400'}`}><Heart size={13} fill={update.isLiked ? 'currentColor' : 'none'} />{update.likes || 0}</button>
              <button onClick={() => toggleLiveUpdateCommentSection(update.id, update.entityType || (update.subType === 'weight' ? 'fitness_weight' : 'fitness_workout'))} className="flex items-center gap-1 text-xs text-muted-foreground/70 hover:text-cyan-400 transition-colors"><MessageCircle size={13} />{update.comments || 0}</button>
              <button onClick={() => toggleLiveUpdateRepost(update.id, update.entityType || (update.subType === 'weight' ? 'fitness_weight' : 'fitness_workout'), update.isReposted || false)} className={`flex items-center gap-1 text-xs transition-colors ${update.isReposted ? 'text-green-400' : 'text-muted-foreground/70 hover:text-green-400'}`}><Repeat2 size={13} />{update.reposts || 0}</button>
              <button onClick={() => openShareDialog({ type: 'fitness_update', id: update.id, preview: update.subType === 'weight' ? `Weight: ${update.weight}kg` : `${update.workoutType || 'Workout'} ${update.duration ? update.duration + 'min' : ''}${update.estimatedCalories ? ' ' + update.estimatedCalories + 'cal' : ''}`, userName: update.user?.name, username: update.user?.username, extra: { fitnessType: update.subType || 'workout', entityType: update.entityType || (update.subType === 'weight' ? 'fitness_weight' : 'fitness_workout') } })} className="flex items-center gap-1 text-xs text-muted-foreground/70 hover:text-blue-400 transition-colors"><Share2 size={13} /></button>
              <button onClick={() => toggleLiveUpdateBookmark(update.id, update.entityType || (update.subType === 'weight' ? 'fitness_weight' : 'fitness_workout'), update.isBookmarked || false)} className={`flex items-center gap-1 text-xs transition-colors ${update.isBookmarked ? 'text-amber-400' : 'text-muted-foreground/70 hover:text-amber-400'}`}><Bookmark size={13} fill={update.isBookmarked ? 'currentColor' : 'none'} /></button>
              <button onClick={() => openLiveUpdateReport(update.id, update.entityType || (update.subType === 'weight' ? 'fitness_weight' : 'fitness_workout'))} className="text-muted-foreground/60 hover:text-amber-400 ml-auto transition-colors"><Flag size={12} /></button>
            </div>
            {/* Inline comment section for fitness update */}
            {liveUpdateCommentTarget === update.id && (
              <div className="mt-3 pt-3 border-t border-border/20 space-y-2">
                <div className="flex gap-2">
                  <Input ref={liveUpdateCommentInputRef} value={liveUpdateCommentTarget === update.id ? liveUpdateCommentText : ''} onChange={e => setLiveUpdateCommentText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addLiveUpdateComment(update.id, update.entityType || (update.subType === 'weight' ? 'fitness_weight' : 'fitness_workout')); }} placeholder="Write a comment..." className="bg-accent border-border text-foreground text-xs h-8" autoFocus />
                  <Button onClick={() => addLiveUpdateComment(update.id, update.entityType || (update.subType === 'weight' ? 'fitness_weight' : 'fitness_workout'))} size="icon" className="gradient-blue shrink-0 h-8 w-8" disabled={!liveUpdateCommentText.trim()}><Send size={12} /></Button>
                </div>
                {(liveUpdateComments[update.id] || []).map((c: any) => (
                  <div key={c.id} className="flex items-start gap-2 p-2 rounded-lg bg-accent/20">
                    <Avatar className="h-6 w-6 border border-border shrink-0"><AvatarFallback className="bg-blue-600/20 text-blue-300 text-[9px]">{c.user?.profile?.name?.[0] || c.user?.username?.[0] || '?'}</AvatarFallback></Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-medium text-foreground">{c.user?.profile?.name || c.user?.username || 'User'}{c.user?.profile?.verified && <span className="text-blue-400 text-[8px] ml-0.5">✓</span>}</p>
                      <p className="text-[10px] text-muted-foreground">{c.content}</p>
                    </div>
                  </div>
                ))}
                {(!liveUpdateComments[update.id] || liveUpdateComments[update.id].length === 0) && <p className="text-[10px] text-muted-foreground/50 text-center">No comments yet</p>}
              </div>
            )}
          </div>
        </div>
      </GlassCard>
    );
  }

  // ── Learning Live Update Card ──
  function LearningLiveUpdateCard({ update }: { update: any }) {
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
              <p className="text-sm font-medium text-foreground cursor-pointer hover:text-cyan-300 transition-colors" onClick={() => router.push(`/profile/${update.user?.id}`)}>{update.user?.name || 'User'} {update.user?.verified && <span className="text-blue-400">✓</span>}</p>
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
                onClick={() => router.push(`/shared-topic/${update.id}?from=feed`)}
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

            {/* Hashtag pills */}
            <div className="flex items-center gap-1.5 mt-2">
              {update.hashtags?.map((tag: string) => (
                <span
                  key={tag}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-600/15 text-cyan-300 cursor-pointer hover:bg-cyan-600/25 transition-colors"
                  onClick={() => router.push(`/discover?q=${encodeURIComponent('#' + tag)}`)}
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Action bar for live updates */}
            <div className="flex items-center gap-4 mt-2 pt-2 border-t border-border/20">
              <button onClick={() => toggleLiveUpdateLike(update.id, update.entityType || 'learning_topic', update.isLiked || false)} className={`flex items-center gap-1 text-xs transition-colors ${update.isLiked ? 'text-rose-400' : 'text-muted-foreground/70 hover:text-rose-400'}`}><Heart size={13} fill={update.isLiked ? 'currentColor' : 'none'} />{update.likes || 0}</button>
              <button onClick={() => toggleLiveUpdateCommentSection(update.id, update.entityType || 'learning_topic')} className="flex items-center gap-1 text-xs text-muted-foreground/70 hover:text-cyan-400 transition-colors"><MessageCircle size={13} />{update.comments || 0}</button>
              <button onClick={() => toggleLiveUpdateRepost(update.id, update.entityType || 'learning_topic', update.isReposted || false)} className={`flex items-center gap-1 text-xs transition-colors ${update.isReposted ? 'text-green-400' : 'text-muted-foreground/70 hover:text-green-400'}`}><Repeat2 size={13} />{update.reposts || 0}</button>
              <button onClick={() => openShareDialog({ type: 'learning_update', id: update.id, preview: update.name || 'Learning topic', userName: update.user?.name, username: update.user?.username, extra: { entityType: update.entityType || 'learning_topic' } })} className="flex items-center gap-1 text-xs text-muted-foreground/70 hover:text-blue-400 transition-colors"><Share2 size={13} /></button>
              <button onClick={() => toggleLiveUpdateBookmark(update.id, update.entityType || 'learning_topic', update.isBookmarked || false)} className={`flex items-center gap-1 text-xs transition-colors ${update.isBookmarked ? 'text-amber-400' : 'text-muted-foreground/70 hover:text-amber-400'}`}><Bookmark size={13} fill={update.isBookmarked ? 'currentColor' : 'none'} /></button>
              <button onClick={() => openLiveUpdateReport(update.id, update.entityType || 'learning_topic')} className="text-muted-foreground/60 hover:text-amber-400 ml-auto transition-colors"><Flag size={12} /></button>
            </div>
            {/* Inline comment section for learning update */}
            {liveUpdateCommentTarget === update.id && (
              <div className="mt-3 pt-3 border-t border-border/20 space-y-2">
                <div className="flex gap-2">
                  <Input ref={liveUpdateCommentInputRef} value={liveUpdateCommentTarget === update.id ? liveUpdateCommentText : ''} onChange={e => setLiveUpdateCommentText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addLiveUpdateComment(update.id, update.entityType || 'learning_topic'); }} placeholder="Write a comment..." className="bg-accent border-border text-foreground text-xs h-8" autoFocus />
                  <Button onClick={() => addLiveUpdateComment(update.id, update.entityType || 'learning_topic')} size="icon" className="gradient-blue shrink-0 h-8 w-8" disabled={!liveUpdateCommentText.trim()}><Send size={12} /></Button>
                </div>
                {(liveUpdateComments[update.id] || []).map((c: any) => (
                  <div key={c.id} className="flex items-start gap-2 p-2 rounded-lg bg-accent/20">
                    <Avatar className="h-6 w-6 border border-border shrink-0"><AvatarFallback className="bg-blue-600/20 text-blue-300 text-[9px]">{c.user?.profile?.name?.[0] || c.user?.username?.[0] || '?'}</AvatarFallback></Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-medium text-foreground">{c.user?.profile?.name || c.user?.username || 'User'}{c.user?.profile?.verified && <span className="text-blue-400 text-[8px] ml-0.5">✓</span>}</p>
                      <p className="text-[10px] text-muted-foreground">{c.content}</p>
                    </div>
                  </div>
                ))}
                {(!liveUpdateComments[update.id] || liveUpdateComments[update.id].length === 0) && <p className="text-[10px] text-muted-foreground/50 text-center">No comments yet</p>}
              </div>
            )}
          </div>
        </div>
      </GlassCard>
    );
  }

  // ── Build merged feed: posts + live updates, sorted by time, grouped by hashtags ──
  const mergedFeedItems = useMemo(() => {
    type FeedItem = {
      id: string;
      sortTime: number;
      type: 'post' | 'content_update' | 'fitness_update' | 'learning_update';
      hashtags: string[];
      data: any;
    };

    const items: FeedItem[] = [];

    // Add regular posts
    const safePosts = Array.isArray(posts) ? posts : [];
    safePosts.forEach((p: any) => {
      let tags: string[] = [];
      try {
        tags = (Array.isArray(p.hashtags) ? p.hashtags : JSON.parse(p.hashtags || '[]')).map((tg: string) => tg.toLowerCase());
      } catch {}
      items.push({
        id: p.id,
        sortTime: new Date(p.createdAt).getTime(),
        type: 'post',
        hashtags: tags,
        data: p,
      });
    });

    // Add content live updates
    liveContentUpdates.forEach((u: any) => {
      items.push({
        id: `content-${u.id}`,
        sortTime: new Date(u.updatedAt || u.createdAt).getTime(),
        type: 'content_update',
        hashtags: u.hashtags || ['content', 'progress'],
        data: u,
      });
    });

    // Add fitness live updates (workouts)
    liveFitnessUpdates.forEach((u: any) => {
      items.push({
        id: `fitness-${u.id}`,
        sortTime: new Date(u.createdAt).getTime(),
        type: 'fitness_update',
        hashtags: u.hashtags || ['fitness', 'gains'],
        data: u,
      });
    });

    // Add learning live updates
    liveLearningUpdates.forEach((u: any) => {
      items.push({
        id: `learning-${u.id}`,
        sortTime: new Date(u.sharedAt || u.updatedAt || u.createdAt).getTime(),
        type: 'learning_update',
        hashtags: u.hashtags || ['learning', 'study'],
        data: u,
      });
    });

    // Add weight updates
    liveWeightUpdates.forEach((u: any) => {
      items.push({
        id: `weight-${u.id}`,
        sortTime: new Date(u.createdAt).getTime(),
        type: 'fitness_update',
        hashtags: u.hashtags || ['fitness', 'gains'],
        data: u,
      });
    });

    // ── Deduplicate: same entity from same user should appear only once ──
    const seenKeys = new Set<string>();
    const dedupedItems = items.filter(item => {
      // Create a unique key per (entity id + user id) for live updates
      // Regular posts use their own id
      const dedupKey = item.type === 'post' ? item.id : `${item.type}-${item.data?.id}_${item.data?.user?.id}`;
      if (seenKeys.has(dedupKey)) return false;
      seenKeys.add(dedupKey);
      return true;
    });

    // Sort by time descending
    dedupedItems.sort((a, b) => b.sortTime - a.sortTime);

    // ── Hashtag grouping ──
    // Always force-group these special tags
    const FORCE_GROUP_TAGS = ['content', 'progress', 'fitness', 'gains', 'shredding', 'learning', 'study'];

    const tagCount: Record<string, number> = {};
    dedupedItems.forEach(item => {
      item.hashtags.forEach(tg => { tagCount[tg] = (tagCount[tg] || 0) + 1; });
    });

    // Trending = any tag with 2+ posts OR any force-group tag that has items
    const trending = Object.entries(tagCount)
      .filter(([tg, c]) => c >= 2 || FORCE_GROUP_TAGS.includes(tg))
      .map(([tg]) => tg);

    const grouped: Record<string, FeedItem[]> = {};
    const ungrouped: FeedItem[] = [];

    dedupedItems.forEach(item => {
      // Find the first matching trending/force tag
      const matched = item.hashtags.find(tg => trending.includes(tg));
      if (matched) {
        if (!grouped[matched]) grouped[matched] = [];
        grouped[matched].push(item);
      } else {
        ungrouped.push(item);
      }
    });

    // Define section order for grouped tags (live updates first)
    const groupOrder = ['learning', 'content', 'progress', 'fitness', 'gains', 'shredding'];
    const orderedGroups = Object.entries(grouped).sort(([a], [b]) => {
      const ai = groupOrder.indexOf(a); const bi = groupOrder.indexOf(b);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });

    return { orderedGroups, ungrouped };
  }, [posts, liveContentUpdates, liveFitnessUpdates, liveWeightUpdates, liveLearningUpdates]);

  // Legacy hashtag grouping for backward compat (still used by trending header text)
  const { grouped, ungrouped } = useMemo(() => {
    const safePosts = Array.isArray(posts) ? posts : [];
    const tagCount: Record<string, number> = {};
    safePosts.forEach((p: any) => {
      try {
        const tags = Array.isArray(p.hashtags) ? p.hashtags : JSON.parse(p.hashtags || '[]');
        if (Array.isArray(tags)) tags.forEach((tg: string) => { const key = tg.toLowerCase(); tagCount[key] = (tagCount[key] || 0) + 1; });
      } catch {}
    });
    const trending = Object.entries(tagCount).filter(([, c]) => c >= 2).map(([tg]) => tg);
    const grouped: Record<string, any[]> = {};
    const ungrouped: any[] = [];
    safePosts.forEach((p: any) => {
      try {
        const tags = (Array.isArray(p.hashtags) ? p.hashtags : JSON.parse(p.hashtags || '[]')).map((tg: string) => tg.toLowerCase());
        const matched = tags.find((tg: string) => trending.includes(tg));
        if (matched) { if (!grouped[matched]) grouped[matched] = []; grouped[matched].push(p); }
        else ungrouped.push(p);
      } catch { ungrouped.push(p); }
    });
    return { grouped, ungrouped };
  }, [posts]);

  // Computed chart data for Live Status tab — pass full date strings so WeightChart can parse & format
  const feedWeightChartData = feedWeightLogs.slice(-30).map((w: any) => ({
    date: typeof w.date === 'string' ? w.date : String(w.date ?? ''),
    weight: Number(w.weight),
  }));

  const feedWorkoutChartArr = Object.entries(
    feedWorkouts.reduce((acc: Record<string, number>, w: any) => {
      const d = w.date?.slice(5) || w.date;
      acc[d] = (acc[d] || 0) + (w.estimatedCalories || 0);
      return acc;
    }, {})
  ).map(([date, calories]) => ({ date, calories })).slice(-14);

  async function createPost() {
    if (isGuest) { showLoginPrompt('create posts'); return; }
    if (!newContent.trim()) return;
    setSubmitting(true);
    const hashtags = (newContent.match(/#(\w+)/g) || []).map((h: string) => h.slice(1));
    const taggedUsers: string[] = [];
    try {
      const r = await fetch('/api/posts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: newContent, hashtags, taggedUsers }) });
      if (r.ok) { setNewContent(''); fetchPosts(); toast.success(`+5 ${t('xp.earned')}`); window.dispatchEvent(new CustomEvent('xp-updated')); window.dispatchEvent(new CustomEvent('notification-updated')); }
    } catch {} finally { setSubmitting(false); }
  }

  async function toggleLike(postId: string, isLiked: boolean) {
    if (isGuest) { showLoginPrompt('like posts'); return; }
    try {
      const res = isLiked
        ? await fetch(`/api/posts/${postId}/like`, { method: 'DELETE' })
        : await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
      if (res.ok) {
        fetchPosts();
      } else {
        const d = await res.json().catch(() => ({}));
        if (d.error === 'Unauthorized') {
          toast.error('Please sign in to like posts');
        }
      }
    } catch {
      toast.error('Network error — please try again');
    }
  }

  async function toggleBookmark(postId: string, isBookmarked: boolean) {
    if (isGuest) { showLoginPrompt('bookmark posts'); return; }
    try {
      if (isBookmarked) {
        await fetch(`/api/posts/${postId}/bookmark`, { method: 'DELETE' });
      } else {
        await fetch(`/api/posts/${postId}/bookmark`, { method: 'POST' });
      }
      fetchPosts();
    } catch {}
  }

  async function toggleRepost(postId: string, isReposted: boolean) {
    if (isGuest) { showLoginPrompt('repost'); return; }
    try {
      const res = isReposted
        ? await fetch(`/api/posts/${postId}/repost`, { method: 'DELETE' })
        : await fetch(`/api/posts/${postId}/repost`, { method: 'POST' });
      if (res.ok) {
        fetchPosts();
      } else {
        const d = await res.json().catch(() => ({}));
        if (d.error === 'Unauthorized') {
          toast.error('Please sign in to repost');
        }
      }
    } catch {
      toast.error('Network error — please try again');
    }
  }

  // Like/repost for live updates (ContentEntry, FitnessWorkoutLog, FitnessWeightLog, LearningTopic)
  async function toggleLiveUpdateLike(updateId: string, entityType: string, isLiked: boolean) {
    if (isGuest) { showLoginPrompt('like'); return; }
    try {
      const url = `/api/live-updates/${updateId}/like?entityType=${encodeURIComponent(entityType)}`;
      const res = isLiked
        ? await fetch(url, { method: 'DELETE' })
        : await fetch(url, { method: 'POST' });
      if (res.ok) {
        fetchLiveUpdates();
      } else {
        const d = await res.json().catch(() => ({}));
        if (d.error === 'Unauthorized') {
          toast.error('Please sign in to like');
        }
      }
    } catch {
      toast.error('Network error — please try again');
    }
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
      } else {
        const d = await res.json().catch(() => ({}));
        if (d.error === 'Unauthorized') {
          toast.error('Please sign in to repost');
        }
      }
    } catch {
      toast.error('Network error — please try again');
    }
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

  function openLiveUpdateReport(updateId: string, entityType: string) {
    if (isGuest) { showLoginPrompt('report'); return; }
    setReportTargetId(updateId);
    setReportCategory('');
    setReportReason('');
    setReportOpen(true);
  }

  async function addComment(postId: string) {
    if (isGuest) { showLoginPrompt('comment on posts'); return; }
    if (!commentText.trim()) return;
    try {
      const r = await fetch(`/api/posts/${postId}/comments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: commentText }) });
      if (r.ok) {
        const d = await r.json();
        const comment = d.comment || d;
        setOpenComments(p => ({ ...p, [postId]: [...(p[postId] || []), comment] }));
        setCommentText('');
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, stats: { ...p.stats, comments: (p.stats?.comments || p._count?.comments || 0) + 1 } } : p));
        toast.success('+3 XP');
        window.dispatchEvent(new CustomEvent('xp-updated')); window.dispatchEvent(new CustomEvent('notification-updated'));
      } else {
        const d = await r.json().catch(() => ({}));
        if (d.error === 'Unauthorized') {
          toast.error('Please sign in to comment');
        }
      }
    } catch {
      toast.error('Network error — please try again');
    }
  }

  async function loadComments(postId: string) {
    try {
      const r = await fetch(`/api/posts/${postId}/comments`);
      if (r.ok) {
        const d = await r.json();
        const comments = Array.isArray(d) ? d : d.comments || [];
        setOpenComments(p => ({ ...p, [postId]: comments }));
      }
    } catch {}
  }

  async function deletePost(postId: string) {
    if (!confirm('Delete this post?')) return;
    try {
      const r = await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
      if (r.ok) {
        setPosts(prev => prev.filter(p => p.id !== postId));
        toast.success('Post deleted');
      }
    } catch {}
  }

  // ── Live Update Comments ──
  async function loadLiveUpdateComments(updateId: string, entityType: string) {
    try {
      const r = await fetch(`/api/live-updates/${updateId}/comments?entityType=${encodeURIComponent(entityType)}`);
      if (r.ok) {
        const d = await r.json();
        setLiveUpdateComments(p => ({ ...p, [updateId]: d.comments || [] }));
      }
    } catch {}
  }

  async function addLiveUpdateComment(updateId: string, entityType: string) {
    if (isGuest) { showLoginPrompt('comment'); return; }
    if (!liveUpdateCommentText.trim()) return;
    // Set ref to prevent fetchLiveUpdates from unmounting input during comment
    isCommentingRef.current = true;
    try {
      const r = await fetch(`/api/live-updates/${updateId}/comments?entityType=${encodeURIComponent(entityType)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: liveUpdateCommentText.trim() }),
      });
      if (r.ok) {
        const d = await r.json();
        const comment = d.comment || d;
        setLiveUpdateComments(p => ({ ...p, [updateId]: [comment, ...(p[updateId] || [])] }));
        setLiveUpdateCommentText('');
        toast.success('+3 XP');
        // Re-focus input to keep keyboard open on mobile after posting
        setTimeout(() => { liveUpdateCommentInputRef.current?.focus(); }, 50);
        // Delay dispatching XP event and releasing the commenting guard
        // to keep the input mounted on mobile after posting
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('xp-updated'));
          window.dispatchEvent(new CustomEvent('notification-updated'));
          // Release guard after event handlers have run
          setTimeout(() => { isCommentingRef.current = false; }, 1000);
        }, 500);
      } else {
        const d = await r.json().catch(() => ({}));
        if (d.error === 'Unauthorized') {
          toast.error('Please sign in to comment');
        }
        isCommentingRef.current = false;
      }
    } catch {
      toast.error('Network error — please try again');
      isCommentingRef.current = false;
    }
  }

  function toggleLiveUpdateCommentSection(updateId: string, entityType: string) {
    if (isGuest) { showLoginPrompt('comment'); return; }
    if (liveUpdateCommentTarget === updateId) {
      setLiveUpdateCommentTarget(null);
      isCommentingRef.current = false;
    } else {
      setLiveUpdateCommentTarget(updateId);
      isCommentingRef.current = true;
      if (!liveUpdateComments[updateId]) {
        loadLiveUpdateComments(updateId, entityType);
      }
    }
  }

  const [reportOpen, setReportOpen] = useState(false);
  const [reportTargetId, setReportTargetId] = useState<string|null>(null);
  const [reportCategory, setReportCategory] = useState('');
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [activeFeedTab, setActiveFeedTab] = useState('feed');
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareData, setShareData] = useState<ShareData | null>(null);

  function openShareDialog(data: ShareData) {
    if (isGuest) { showLoginPrompt('share'); return; }
    setShareData(data);
    setShareDialogOpen(true);
  }

  function openReport(postId: string) {
    setReportTargetId(postId);
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
      const r = await fetch('/api/report', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'post', targetId: reportTargetId, category: reportCategory, reason: reportReason.trim() }) });
      if (r.ok) { toast.success('Report submitted'); setReportOpen(false); }
      else { const d = await r.json(); toast.error(d.error || 'Report failed'); }
    } catch { toast.error('Report failed'); }
    finally { setReportSubmitting(false); }
  }

  function renderContent(text: string) {
    // Split on hashtags, mentions, and URLs
    return text.split(/(#[\w]+|@[\w]+|https?:\/\/[^\s]+)/g).map((part, i) => {
      if (part.startsWith('#')) return <span key={i} className="text-blue-400 cursor-pointer" onClick={() => router.push(`/discover?q=${encodeURIComponent(part)}`)}>{part}</span>;
      if (part.startsWith('@')) return <span key={i} className="text-purple-400 cursor-pointer" onClick={() => { const username = part.slice(1); fetch(`/api/user/check-username?username=${encodeURIComponent(username)}`).then(r => r.ok ? r.json() : null).then(data => { if (data?.userId) router.push(`/profile/${data.userId}`); }); }}>{part}</span>;
      if (part.startsWith('http://') || part.startsWith('https://')) {
        const href = part.replace(/[.,;:!?)\]]+$/, ''); // strip trailing punctuation
        return <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline underline-offset-2 hover:text-blue-300 break-all">{part}</a>;
      }
      return part;
    });
  }

  function PostCard({ post }: { post: any }) {
    const isOwnPost = post.user?.id === profile?.userId;
    const isAdmin = profile?.isAdmin || profile?.isSuperAdmin;
    const isCollection = post.content?.startsWith('📚 Shared learning topic:') || post.content?.startsWith('📚 Shared my learning collection:');
    const topicIdMatch = post.content?.match(/\[topicId:([\w-]+)\]/);
    const topicId = topicIdMatch ? topicIdMatch[1] : null;

    return (
      <GlassCard className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-9 w-9 border border-border shrink-0"><AvatarFallback className="bg-blue-600/30 text-blue-300 text-xs">{post.user?.name?.[0] || '?'}</AvatarFallback></Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-medium text-foreground">{post.user?.name || 'User'} {post.user?.verified && <span className="text-blue-400">✓</span>}</p>
              <p className="text-[10px] text-muted-foreground/70">@{post.user?.username || 'user'}</p>
              {(isOwnPost || isAdmin) && (
                <div className="ml-auto">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="text-muted-foreground/50 hover:text-foreground p-1"><MoreHorizontal size={16} /></button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-background border-border">
                      {isOwnPost && (
                        <DropdownMenuItem className="text-red-400 focus:text-red-300 cursor-pointer" onClick={() => deletePost(post.id)}>
                          <Trash2 size={14} className="mr-2" />Delete Post
                        </DropdownMenuItem>
                      )}
                      {isAdmin && !isOwnPost && (
                        <DropdownMenuItem className="text-red-400 focus:text-red-300 cursor-pointer" onClick={() => deletePost(post.id)}>
                          <Trash2 size={14} className="mr-2" />Delete (Admin)
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
            {isCollection ? (
              <div className="bg-blue-600/10 border border-blue-500/20 rounded-lg p-3 mb-1">
                <p className="text-sm text-blue-300">{post.content.replace(/\[topicId:[\w-]+\]/, '').trim()}</p>
                {/* Shared Topic CTA - navigates to full topic viewer */}
                {topicId && <SharedTopicCTA topicId={topicId} router={router} />}
              </div>
            ) : (
              <p className="text-sm text-foreground/90 whitespace-pre-wrap mb-2">{renderContent(post.content)}</p>
            )}
            <div className="flex items-center gap-4">
              <button onClick={() => toggleLike(post.id, post.isLiked)} className={`flex items-center gap-1 text-xs transition-colors ${post.isLiked ? 'text-rose-400' : 'text-muted-foreground/70 hover:text-rose-400'}`}><Heart size={14} fill={post.isLiked ? 'currentColor' : 'none'} />{post.stats?.likes || post._count?.likes || 0}</button>
              <button onClick={() => { setCommentPostId(post.id); loadComments(post.id); }} className="flex items-center gap-1 text-xs text-muted-foreground/70 hover:text-cyan-400 transition-colors"><MessageCircle size={14} />{post.stats?.comments || post._count?.comments || 0}</button>
              <button onClick={() => toggleRepost(post.id, post.isReposted)} className={`flex items-center gap-1 text-xs transition-colors ${post.isReposted ? 'text-green-400' : 'text-muted-foreground/70 hover:text-green-400'}`}><Repeat2 size={14} />{post.stats?.reposts || post._count?.reposts || 0}</button>
              <button onClick={() => toggleBookmark(post.id, post.isBookmarked)} className={`flex items-center gap-1 text-xs transition-colors ${post.isBookmarked ? 'text-amber-400' : 'text-muted-foreground/70 hover:text-amber-400'}`}><Bookmark size={14} fill={post.isBookmarked ? 'currentColor' : 'none'} /></button>
              <button onClick={() => openShareDialog({ type: 'post', id: post.id, preview: post.content?.slice(0, 120) || '', userName: post.user?.name, username: post.user?.username })} className="flex items-center gap-1 text-xs text-muted-foreground/70 hover:text-blue-400 transition-colors"><Share2 size={14} /></button>
              <button onClick={() => openReport(post.id)} className="text-muted-foreground/60 hover:text-amber-400 ml-auto transition-colors"><Flag size={12} /></button>
            </div>
            {/* Comments */}
            <AnimatePresence>
              {commentPostId === post.id && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="mt-3 border-t border-border pt-3">
                    {(openComments[post.id] || []).map((c: any, i: number) => (
                      <div key={c.id || i} className="mb-2 flex gap-2">
                        <Avatar className="h-6 w-6 shrink-0"><AvatarFallback className="bg-blue-600/30 text-blue-300 text-[8px]">{c.user?.name?.[0] || '?'}</AvatarFallback></Avatar>
                        <div>
                          <p className="text-[10px] text-muted-foreground">@{c.user?.username || 'user'}</p>
                          <p className="text-xs text-foreground">{c.content}</p>
                        </div>
                      </div>
                    ))}
                    <div className="flex gap-2 mt-2">
                      <Input value={commentText} onChange={e => setCommentText(e.target.value)} onKeyDown={e => e.key === 'Enter' && addComment(post.id)} placeholder="Write a comment..." className="bg-white/5 border-border text-foreground text-xs h-8" />
                      <Button onClick={() => addComment(post.id)} size="sm" className="gradient-blue shrink-0 h-8"><Send size={12} /></Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </GlassCard>
    );
  }

  if (loading && !initialLoadRef.current) {
    return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="w-6 h-6 text-blue-400 animate-spin" /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Semantic heading for SEO/crawlers — visually hidden */}
      <h1 className="sr-only">Community Feed — {t('app.name')}</h1>
      <Tabs value={activeFeedTab} onValueChange={setActiveFeedTab}>
        <TabsList className="bg-accent border border-border w-full flex">
          <TabsTrigger value="feed" className="text-muted-foreground data-[state=active]:text-blue-400 flex-1"><Rss size={14} className="mr-1" />Feed</TabsTrigger>
          <TabsTrigger value="live" className="text-muted-foreground data-[state=active]:text-green-400 flex-1"><Activity size={14} className="mr-1" />Live</TabsTrigger>
          {!isGuest && <TabsTrigger value="myposts" className="text-muted-foreground data-[state=active]:text-blue-400 flex-1"><FileText size={14} className="mr-1" />{t('feed.myPosts')}</TabsTrigger>}
          {!isGuest && <TabsTrigger value="bookmarks" className="text-muted-foreground data-[state=active]:text-amber-400 flex-1"><Bookmark size={14} className="mr-1" />{t('feed.bookmarks')}</TabsTrigger>}
        </TabsList>

        <TabsContent value="feed" className="mt-4 space-y-4">
      {/* Create Post — hidden for guests */}
      {!isGuest && (
      <GlassCard variant="glassmorphism" className="p-4">
        <Textarea value={newContent} onChange={e => setNewContent(e.target.value)} placeholder={t('feed.createPost')} className="bg-white/5 border-border text-foreground placeholder:text-muted-foreground/60 min-h-[80px]" rows={3} />
        <div className="flex items-center justify-between mt-2">
          <p className="text-[10px] text-muted-foreground/60">{t('feed.textOnly')}</p>
          <Button onClick={createPost} disabled={submitting} className="gradient-blue text-xs">{submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : t('common.submit')}</Button>
        </div>
      </GlassCard>
      )}

      {/* ═══ LIVE UPDATE SECTIONS (grouped by hashtags) ═══ */}
      {mergedFeedItems.orderedGroups.map(([tag, items]) => {
        const isContentTag = tag === 'content' || tag === 'progress';
        const isLearningTag = tag === 'learning' || tag === 'study';
        const isFitnessTag = tag === 'fitness' || tag === 'gains' || tag === 'shredding';
        const isGainsTag = tag === 'gains';
        const isShredTag = tag === 'shredding';
        const headerIcon = isLearningTag ? <BookOpen size={14} className="text-cyan-400" /> : isContentTag ? <Video size={14} className="text-purple-400" /> : isFitnessTag ? <Dumbbell size={14} className={isGainsTag ? 'text-green-400' : isShredTag ? 'text-orange-400' : 'text-blue-400'} /> : <Rss size={14} className="text-blue-400" />;
        const headerColor = isLearningTag ? 'text-cyan-400' : isContentTag ? 'text-purple-400' : isGainsTag ? 'text-green-400' : isShredTag ? 'text-orange-400' : 'text-blue-400';

        return (
          <div key={tag}>
            <div className="flex items-center gap-1.5 mb-2">
              {headerIcon}
              <h3 className={`text-sm font-medium ${headerColor}`}>#{tag}</h3>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse ml-0.5" />
              <span className="text-[9px] text-muted-foreground/50 ml-1">{items.length} update{items.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="space-y-3">
              {items.map((item: any) => {
                if (item.type === 'content_update') return <ContentLiveUpdateCard key={item.id} update={item.data} />;
                if (item.type === 'fitness_update') return <FitnessLiveUpdateCard key={item.id} update={item.data} />;
                if (item.type === 'learning_update') return <LearningLiveUpdateCard key={item.id} update={item.data} />;
                return <PostCard key={item.id} post={item.data} />;
              })}
            </div>
          </div>
        );
      })}

      {/* Ungrouped Posts (no matching hashtag groups) */}
      {mergedFeedItems.ungrouped.length > 0 && (
        <div className="space-y-3">
          {mergedFeedItems.ungrouped.map((item: any) => {
            if (item.type === 'content_update') return <ContentLiveUpdateCard key={item.id} update={item.data} />;
            if (item.type === 'fitness_update') return <FitnessLiveUpdateCard key={item.id} update={item.data} />;
            if (item.type === 'learning_update') return <LearningLiveUpdateCard key={item.id} update={item.data} />;
            return <PostCard key={item.id} post={item.data} />;
          })}
        </div>
      )}

      {posts.length === 0 && liveContentUpdates.length === 0 && liveFitnessUpdates.length === 0 && liveWeightUpdates.length === 0 && liveLearningUpdates.length === 0 && !loading && (
        <GlassCard className="p-8 text-center">
          <p className="text-muted-foreground">No posts yet. Be the first to share!</p>
        </GlassCard>
      )}
        </TabsContent>

        {/* ═══ LIVE STATUS TAB ═══ */}
        <TabsContent value="live" className="mt-4 space-y-4">
          {isGuest && (
            <GlassCard className="p-4 text-center">
              <Activity size={24} className="mx-auto mb-2 text-green-400" />
              <p className="text-sm text-foreground font-medium">Live updates from the community</p>
              <p className="text-xs text-muted-foreground mt-1">Sign in to track your own fitness and content status.</p>
            </GlassCard>
          )}
          {/* Your Fitness Dashboard — auth only */}
          {!isGuest && (<>
          <GlassCard className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Dumbbell size={16} className="text-blue-400" />
              <h3 className="text-sm font-semibold text-foreground">Your Fitness Dashboard</h3>
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse ml-1" />
            </div>

            {feedWeightLogs.length === 0 && feedWorkouts.length === 0 ? (
              <p className="text-xs text-muted-foreground/50 text-center py-6">No fitness data yet. Log workouts or weight to see your trends here.</p>
            ) : (
              <div className="space-y-4">
                {/* Weight Summary */}
                {feedWeightLogs.length > 0 && (
                  <div className="flex items-center gap-3 bg-accent/50 rounded-xl p-3">
                    <Scale size={18} className="text-blue-400 shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground/60">Latest Weight</p>
                      <p className="text-lg font-bold text-foreground">{feedWeightLogs[feedWeightLogs.length - 1]?.weight} kg</p>
                    </div>
                    {feedWeightLogs.length >= 2 && (() => {
                      const diff = feedWeightLogs[feedWeightLogs.length - 1]?.weight - feedWeightLogs[feedWeightLogs.length - 2]?.weight;
                      return (
                        <div className={`flex items-center gap-1 text-xs font-medium ${diff > 0 ? 'text-green-400' : diff < 0 ? 'text-orange-400' : 'text-muted-foreground'}`}>
                          <TrendingUp size={12} className={diff < 0 ? 'rotate-180' : ''} />
                          {diff > 0 ? '+' : ''}{diff.toFixed(1)} kg
                        </div>
                      );
                    })()}
                    <span className="text-[10px] text-muted-foreground/50">{feedWeightLogs.length} entries</span>
                  </div>
                )}

                {/* Weight Trend Chart */}
                <AnimatePresence>
                  {feedWeightChartData.length >= 2 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p className="text-xs text-muted-foreground/60 mb-2 flex items-center gap-1.5">
                        <TrendingUp size={12} className="text-blue-400" /> Weight Trend
                      </p>
                      <WeightChart data={feedWeightChartData} />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Workout Calories Trend */}
                <AnimatePresence>
                  {feedWorkoutChartArr.length >= 1 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                    >
                      <p className="text-xs text-muted-foreground/60 mb-2 flex items-center gap-1.5">
                        <Activity size={12} className="text-red-400" /> Workout Calories Trend
                      </p>
                      <WorkoutChart data={feedWorkoutChartArr} />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Workout Summary */}
                {feedWorkouts.length > 0 && (
                  <div className="flex items-center gap-3 bg-accent/50 rounded-xl p-3">
                    <Flame size={18} className="text-red-400 shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground/60">Total Workouts</p>
                      <p className="text-lg font-bold text-foreground">{feedWorkouts.length}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground/60">Total Calories</p>
                      <p className="text-sm font-semibold text-amber-400">{feedWorkouts.reduce((sum: number, w: any) => sum + (w.estimatedCalories || 0), 0).toFixed(0)}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </GlassCard>

          {/* Your Learning Live Status */}
          {feedLearningTopics.length > 0 && (
            <GlassCard className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen size={16} className="text-cyan-400" />
                <h3 className="text-sm font-semibold text-foreground">Your Learning Status</h3>
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse ml-1" />
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {feedLearningTopics.map((topic: any) => (
                  <div key={topic.id} className="bg-accent/50 rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <BookOpen size={14} className="text-cyan-400 shrink-0" />
                        <p className="text-sm font-medium text-foreground truncate">{topic.name}</p>
                      </div>
                      {topic.phase && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-600/15 text-cyan-300 font-medium shrink-0">
                          {topic.phase.charAt(0).toUpperCase() + topic.phase.slice(1)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-muted-foreground/50">{topic._count?.entries || topic.entryCount || 0} entries</span>
                      {topic.isSharedCollection && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-600/15 text-blue-300 font-medium">Shared</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Your Content Live Status */}
          <GlassCard className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Video size={16} className="text-purple-400" />
              <h3 className="text-sm font-semibold text-foreground">Your Content Live Status</h3>
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse ml-1" />
            </div>

            {feedContentEntries.length === 0 ? (
              <p className="text-xs text-muted-foreground/50 text-center py-6">No content entries yet. Create entries on the Content page to track their live status.</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {feedContentEntries.map((entry: any) => {
                  const ct = entry.contentType || 'post';
                  const pipeline = getPipeline(ct);
                  const currentIdx = getPipelineStepIndex(ct, entry.liveStatus || 'not_started');

                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-accent/50 rounded-xl p-3"
                    >
                      {/* Entry Header */}
                      <div className="flex items-center gap-2 mb-2.5">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md flex items-center gap-1 ${ct === 'blog' ? 'bg-purple-600/20 text-purple-400' : ct === 'video' ? 'bg-red-600/20 text-red-400' : 'bg-blue-600/20 text-blue-400'}`}>
                          {contentTypeIcon(ct)}
                          {contentTypeLabel(ct)}
                        </span>
                        <p className="text-sm font-medium text-foreground truncate">{entry.title}</p>
                      </div>

                      {/* Pipeline Steps (view-only) */}
                      <div className="flex items-center gap-0">
                        {pipeline.map((step, idx) => {
                          const isCompleted = idx < currentIdx;
                          const isCurrent = idx === currentIdx;
                          const StepIcon = step.icon;

                          return (
                            <div key={step.key} className="flex items-center flex-1 last:flex-none">
                              {/* Step Circle (view-only, no click) */}
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
                        {pipeline.map((step, idx) => (
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
                    </motion.div>
                  );
                })}
              </div>
            )}
          </GlassCard>
          </>)}
        </TabsContent>

        {/* My Posts Tab */}
        <TabsContent value="myposts" className="mt-4 space-y-4">
          {posts.filter(p => p.user?.id === profile?.userId && !p.isRepost).length === 0 ? (
            <GlassCard className="p-8 text-center"><p className="text-muted-foreground">You haven&apos;t posted anything yet</p></GlassCard>
          ) : (
            posts.filter(p => p.user?.id === profile?.userId && !p.isRepost).map((p: any) => <PostCard key={p.id} post={p} />)
          )}
        </TabsContent>

        {/* Bookmarks Tab */}
        <TabsContent value="bookmarks" className="mt-4 space-y-4">
          {posts.filter(p => p.isBookmarked).length === 0 ? (
            <GlassCard className="p-8 text-center"><p className="text-muted-foreground">{t('feed.noBookmarks')}</p></GlassCard>
          ) : (
            posts.filter(p => p.isBookmarked).map((p: any) => <PostCard key={p.id} post={p} />)
          )}
        </TabsContent>
      </Tabs>

      {/* Ad Banner — bottom of page, above footer */}
      <AdCard format="in-feed" slot="feed_top" />

      {/* Report Dialog */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="bg-background border-border">
          <DialogHeader><DialogTitle className="text-foreground flex items-center gap-2"><AlertTriangle size={18} className="text-amber-400" />Report Post</DialogTitle></DialogHeader>
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
                <option value="copyright" className="bg-background">Copyright Violation</option>
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

      {/* Share to Chat Dialog */}
      <ShareToChatDialog isOpen={shareDialogOpen} onClose={() => setShareDialogOpen(false)} shareData={shareData} />
    </div>
  );
}
