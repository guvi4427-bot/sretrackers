'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Heart, MessageCircle, Bookmark, Loader2, Rss, Clock, Newspaper,
  Video, Check, Dumbbell, Scale, BookOpen, Flame, Zap, Trophy,
  TrendingUp, Activity, Globe, Sparkles, ChevronRight, Repeat2,
  BarChart3
} from 'lucide-react';
import { GlassCard } from '@/components/glass-card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserStore } from '@/stores/user-store';
import { useGuest } from '@/components/guest-guard';

// ── Pipeline helpers (same as FeedClient) ──
function getPipeline(contentType: string) {
  if (contentType === 'blog') return [
    { key: 'idea', label: 'Idea', icon: Sparkles, color: 'text-amber-400' },
    { key: 'drafting', label: 'Draft', icon: Newspaper, color: 'text-blue-400' },
    { key: 'editing', label: 'Edit', icon: Check, color: 'text-purple-400' },
    { key: 'published', label: 'Live', icon: Globe, color: 'text-green-400' },
  ];
  if (contentType === 'video') return [
    { key: 'idea', label: 'Idea', icon: Sparkles, color: 'text-amber-400' },
    { key: 'written', label: 'Script', icon: Newspaper, color: 'text-blue-400' },
    { key: 'shoot', label: 'Shoot', icon: Video, color: 'text-purple-400' },
    { key: 'edit', label: 'Edit', icon: Check, color: 'text-orange-400' },
    { key: 'posted', label: 'Live', icon: Globe, color: 'text-green-400' },
  ];
  return [
    { key: 'not_started', label: 'Idea', icon: Sparkles, color: 'text-amber-400' },
    { key: 'written', label: 'Draft', icon: Newspaper, color: 'text-blue-400' },
    { key: 'edit', label: 'Edit', icon: Check, color: 'text-purple-400' },
    { key: 'posted', label: 'Live', icon: Globe, color: 'text-green-400' },
  ];
}
function getPipelineStepIndex(contentType: string, liveStatus: string) {
  const pipeline = getPipeline(contentType);
  return pipeline.findIndex(s => s.key === liveStatus);
}
function contentTypeIcon(ct: string) {
  if (ct === 'blog') return <Newspaper size={10} />;
  if (ct === 'video') return <Video size={10} />;
  return <Rss size={10} />;
}
function contentTypeLabel(ct: string) {
  if (ct === 'blog') return 'Blog';
  if (ct === 'video') return 'Video';
  return 'Post';
}

interface BlogItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string | null;
  tags: string[];
  readTime: number;
  featured: boolean;
  createdAt: string;
  user: {
    id: string;
    username: string;
    name: string;
    avatarUrl: string | null;
    verified: boolean;
  };
  stats: {
    likes: number;
    comments: number;
    bookmarks: number;
  };
  isLiked: boolean;
  isBookmarked: boolean;
}

interface PostItem {
  id: string;
  content: string;
  images: string[];
  hashtags: string[];
  createdAt: string;
  user: {
    id: string;
    username: string;
    name: string;
    avatarUrl: string | null;
    verified: boolean;
  };
  stats: {
    likes: number;
    comments: number;
    reposts: number;
    bookmarks: number;
  };
  isLiked: boolean;
  isBookmarked: boolean;
  isReposted: boolean;
  isRepost: boolean;
}

interface LiveUpdateItem {
  id: string;
  type: string;
  entityType: string;
  bookmarkedAt: string;
  isOwn: boolean;
  isBookmarked: boolean;
  isLiked: boolean;
  isReposted: boolean;
  likes: number;
  reposts: number;
  comments: number;
  user: {
    id: string;
    username: string;
    name: string;
    avatarUrl: string | null;
    verified: boolean;
    fitnessGoal?: string;
  };
  hashtags: string[];
  // Content entry fields
  title?: string;
  contentType?: string;
  liveStatus?: string;
  status?: string;
  platform?: string;
  seriesName?: string;
  seriesCategory?: string;
  createdAt?: string;
  updatedAt?: string;
  // Fitness workout fields
  subType?: string;
  workoutType?: string;
  duration?: number;
  estimatedCalories?: number;
  muscleGroup?: string;
  sets?: number;
  reps?: number;
  loadKg?: number;
  date?: string;
  // Weight fields
  weight?: number;
  trendData?: { date: string; weight: number }[];
  trendDirection?: string;
  currentWeight?: number;
  // Learning fields
  name?: string;
  phase?: string;
  entryCount?: number;
  sharedAt?: string | null;
}

export default function BookmarksClient() {
  const router = useRouter();
  const { profile, loading: profileLoading } = useUserStore();
  const { isGuest, showLoginPrompt } = useGuest();
  const [tab, setTab] = useState('blogs');
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [liveUpdates, setLiveUpdates] = useState<LiveUpdateItem[]>([]);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingLive, setLoadingLive] = useState(true);
  const initialFetchDone = useRef(false);

  const fetchBlogs = useCallback(async () => {
    setLoadingBlogs(true);
    try {
      const res = await fetch(`/api/blogs/bookmarked?_t=${Date.now()}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setBlogs(data.blogs || []);
      } else {
        console.error('Bookmarks blogs API error:', res.status);
      }
    } catch (e) {
      console.error('Bookmarks blogs fetch error:', e);
      toast.error('Failed to load bookmarked blogs');
    } finally {
      setLoadingBlogs(false);
    }
  }, []);

  const fetchPosts = useCallback(async () => {
    setLoadingPosts(true);
    try {
      const res = await fetch(`/api/posts/bookmarked?_t=${Date.now()}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      } else {
        console.error('Bookmarks posts API error:', res.status);
      }
    } catch (e) {
      console.error('Bookmarks posts fetch error:', e);
      toast.error('Failed to load bookmarked posts');
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  const fetchLiveUpdates = useCallback(async () => {
    setLoadingLive(true);
    try {
      const res = await fetch(`/api/live-updates/bookmarked?_t=${Date.now()}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setLiveUpdates(data.updates || []);
      } else {
        console.error('Bookmarks live updates API error:', res.status);
      }
    } catch (e) {
      console.error('Bookmarks live updates fetch error:', e);
      toast.error('Failed to load bookmarked live updates');
    } finally {
      setLoadingLive(false);
    }
  }, []);

  useEffect(() => {
    if (isGuest) {
      showLoginPrompt('view bookmarks');
      router.push('/feed');
      return;
    }
    // Only fetch once when profile becomes available
    if (!profileLoading && profile && !initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchBlogs();
      fetchPosts();
      fetchLiveUpdates();
    } else if (!profileLoading && !profile) {
      router.push('/login');
    }
  }, [profile, profileLoading, isGuest, fetchBlogs, fetchPosts, fetchLiveUpdates, router, showLoginPrompt]);

  const toggleBlogBookmark = async (blog: BlogItem) => {
    const wasBookmarked = blog.isBookmarked;
    setBlogs(prev => prev.map(b => b.id === blog.id ? {
      ...b,
      isBookmarked: !wasBookmarked,
      stats: { ...b.stats, bookmarks: b.stats.bookmarks + (wasBookmarked ? -1 : 1) },
    } : b));
    try {
      const method = wasBookmarked ? 'DELETE' : 'POST';
      await fetch(`/api/blogs/${blog.id}/bookmark`, { method, credentials: 'include' });
      if (wasBookmarked) {
        setBlogs(prev => prev.filter(b => b.id !== blog.id));
        toast.success('Bookmark removed');
      }
    } catch {
      setBlogs(prev => prev.map(b => b.id === blog.id ? {
        ...b,
        isBookmarked: wasBookmarked,
        stats: { ...b.stats, bookmarks: b.stats.bookmarks + (wasBookmarked ? 1 : -1) },
      } : b));
    }
  };

  const togglePostBookmark = async (post: PostItem) => {
    const wasBookmarked = post.isBookmarked;
    setPosts(prev => prev.map(p => p.id === post.id ? {
      ...p,
      isBookmarked: !wasBookmarked,
      stats: { ...p.stats, bookmarks: p.stats.bookmarks + (wasBookmarked ? -1 : 1) },
    } : p));
    try {
      const method = wasBookmarked ? 'DELETE' : 'POST';
      await fetch(`/api/posts/${post.id}/bookmark`, { method, credentials: 'include' });
      if (wasBookmarked) {
        setPosts(prev => prev.filter(p => p.id !== post.id));
        toast.success('Bookmark removed');
      }
    } catch {
      setPosts(prev => prev.map(p => p.id === post.id ? {
        ...p,
        isBookmarked: wasBookmarked,
        stats: { ...p.stats, bookmarks: p.stats.bookmarks + (wasBookmarked ? 1 : -1) },
      } : p));
    }
  };

  const toggleLiveUpdateBookmark = async (update: LiveUpdateItem) => {
    setLiveUpdates(prev => prev.map(u => u.id === update.id ? { ...u, isBookmarked: false } : u));
    try {
      await fetch(`/api/live-updates/${update.id}/bookmark?entityType=${update.entityType}`, { method: 'DELETE', credentials: 'include' });
      setLiveUpdates(prev => prev.filter(u => u.id !== update.id));
      toast.success('Bookmark removed');
    } catch {
      setLiveUpdates(prev => prev.map(u => u.id === update.id ? { ...u, isBookmarked: true } : u));
    }
  };

  if (profileLoading || (loadingBlogs && loadingPosts && loadingLive)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  // ── Live Update Rich Card Components ──

  function ContentUpdateCard({ update }: { update: LiveUpdateItem }) {
    const ct = update.contentType || 'post';
    const pipeline = getPipeline(ct);
    const currentIdx = getPipelineStepIndex(ct, update.liveStatus || 'not_started');

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

            {/* Pipeline card */}
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

            {/* Navigate CTA */}
            <div className="mt-2">
              <button
                onClick={() => router.push(update.isOwn ? '/content' : `/profile/${update.user?.id}`)}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-purple-600/10 hover:bg-purple-600/15 border border-purple-500/20 transition-colors group"
              >
                <Video size={14} className="text-purple-400 shrink-0" />
                <span className="text-xs text-purple-300 font-medium flex-1 text-left">
                  {update.isOwn ? 'View Your Content Pipeline' : 'View Live Status'}
                </span>
                <ChevronRight size={14} className="text-purple-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Action bar */}
            <div className="flex items-center gap-4 mt-2 pt-2 border-t border-border/20">
              <span className={`flex items-center gap-1 text-xs ${update.isLiked ? 'text-rose-400' : 'text-muted-foreground/70'}`}><Heart size={13} fill={update.isLiked ? 'currentColor' : 'none'} />{update.likes}</span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground/70"><MessageCircle size={13} />{update.comments}</span>
              <span className={`flex items-center gap-1 text-xs ${update.isReposted ? 'text-green-400' : 'text-muted-foreground/70'}`}><Repeat2 size={13} />{update.reposts}</span>
              <button onClick={() => toggleLiveUpdateBookmark(update)} className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 transition-colors ml-auto"><Bookmark size={13} fill="currentColor" /></button>
            </div>
          </div>
        </div>
      </GlassCard>
    );
  }

  function FitnessUpdateCard({ update }: { update: LiveUpdateItem }) {
    const isWorkout = update.subType === 'workout';
    const isGaining = update.hashtags?.includes('gains');
    const goalLabel = isGaining ? 'Gains' : 'Shredding';
    const goalColor = isGaining ? 'text-green-400' : 'text-orange-400';
    const goalBg = isGaining ? 'bg-green-600/15' : 'bg-orange-600/15';

    // Weight trend sparkline
    const trendData = update.trendData || [];
    const trendDirection = update.trendDirection || 'none';
    const sparkHeights = trendData.length >= 2
      ? (() => {
          const weights = trendData.map(t => t.weight);
          const min = Math.min(...weights);
          const max = Math.max(...weights);
          const range = max - min || 1;
          return weights.map(w => ((w - min) / range) * 70 + 30);
        })()
      : [];

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

            {/* Fitness card */}
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
                  {update.currentWeight && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] text-muted-foreground/50">Current:</span>
                      <span className={`text-[10px] font-medium ${isGaining ? 'text-green-300' : 'text-orange-300'}`}>{update.currentWeight} kg</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Navigate CTA */}
            <div className="mt-2">
              <button
                onClick={() => router.push(update.isOwn ? '/fitness' : `/profile/${update.user?.id}`)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-colors group ${isGaining ? 'bg-green-600/10 hover:bg-green-600/15 border-green-500/20' : 'bg-orange-600/10 hover:bg-orange-600/15 border-orange-500/20'}`}
              >
                <Activity size={14} className={isGaining ? 'text-green-400 shrink-0' : 'text-orange-400 shrink-0'} />
                <span className={`text-xs font-medium flex-1 text-left ${isGaining ? 'text-green-300' : 'text-orange-300'}`}>
                  {update.isOwn ? 'View Your Fitness Dashboard' : `View ${update.user?.name?.split(' ')[0] || 'User'}'s Fitness`}
                </span>
                <ChevronRight size={14} className={isGaining ? 'text-green-400 group-hover:translate-x-0.5 transition-transform' : 'text-orange-400 group-hover:translate-x-0.5 transition-transform'} />
              </button>
            </div>

            {/* Action bar */}
            <div className="flex items-center gap-4 mt-2 pt-2 border-t border-border/20">
              <span className={`flex items-center gap-1 text-xs ${update.isLiked ? 'text-rose-400' : 'text-muted-foreground/70'}`}><Heart size={13} fill={update.isLiked ? 'currentColor' : 'none'} />{update.likes}</span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground/70"><MessageCircle size={13} />{update.comments}</span>
              <span className={`flex items-center gap-1 text-xs ${update.isReposted ? 'text-green-400' : 'text-muted-foreground/70'}`}><Repeat2 size={13} />{update.reposts}</span>
              <button onClick={() => toggleLiveUpdateBookmark(update)} className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 transition-colors ml-auto"><Bookmark size={13} fill="currentColor" /></button>
            </div>
          </div>
        </div>
      </GlassCard>
    );
  }

  function LearningUpdateCard({ update }: { update: LiveUpdateItem }) {
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

            {/* Learning card */}
            <div className="bg-accent/50 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2.5">
                <span className="text-[10px] px-1.5 py-0.5 rounded-md flex items-center gap-1 bg-cyan-600/20 text-cyan-400">
                  <BookOpen size={12} /> Learning
                </span>
                <p className="text-sm font-medium text-foreground truncate">{update.name}</p>
              </div>
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

            {/* Navigate CTA */}
            <div className="mt-2">
              <button
                onClick={() => router.push(`/shared-topic/${update.id}?from=bookmarks`)}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-cyan-600/10 hover:bg-cyan-600/15 border border-cyan-500/20 transition-colors group"
              >
                <Globe size={14} className="text-cyan-400 shrink-0" />
                <span className="text-xs text-cyan-300 font-medium flex-1 text-left">View Shared Collection</span>
                <ChevronRight size={14} className="text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Action bar */}
            <div className="flex items-center gap-4 mt-2 pt-2 border-t border-border/20">
              <span className={`flex items-center gap-1 text-xs ${update.isLiked ? 'text-rose-400' : 'text-muted-foreground/70'}`}><Heart size={13} fill={update.isLiked ? 'currentColor' : 'none'} />{update.likes}</span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground/70"><MessageCircle size={13} />{update.comments}</span>
              <span className={`flex items-center gap-1 text-xs ${update.isReposted ? 'text-green-400' : 'text-muted-foreground/70'}`}><Repeat2 size={13} />{update.reposts}</span>
              <button onClick={() => toggleLiveUpdateBookmark(update)} className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 transition-colors ml-auto"><Bookmark size={13} fill="currentColor" /></button>
            </div>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-xl font-bold text-foreground">Bookmarks</h1>
        <p className="text-xs text-muted-foreground">Your saved content</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-white/5 border border-border">
          <TabsTrigger value="blogs" className="gap-1.5">
            <Newspaper size={14} /> Blogs
          </TabsTrigger>
          <TabsTrigger value="posts" className="gap-1.5">
            <Rss size={14} /> Posts
          </TabsTrigger>
          <TabsTrigger value="live" className="gap-1.5">
            <Activity size={14} /> Live
          </TabsTrigger>
        </TabsList>

        {/* ── Blogs Tab ── */}
        <TabsContent value="blogs" className="mt-4">
          {loadingBlogs ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
            </div>
          ) : blogs.length === 0 ? (
            <GlassCard className="p-12 text-center">
              <Newspaper className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No bookmarked blogs</p>
              <p className="text-xs text-muted-foreground/50 mt-1">Bookmark blogs you want to read later</p>
              <Button size="sm" variant="outline" className="mt-4 text-xs" onClick={() => router.push('/blog')}>
                Browse Blogs
              </Button>
            </GlassCard>
          ) : (
            <div className="space-y-3">
              {blogs.map(blog => (
                <GlassCard key={blog.id} className="p-4 cursor-pointer hover:bg-accent/30 transition-colors" onClick={() => router.push(`/blog/${blog.slug || blog.id}`)}>
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Avatar className="h-5 w-5 border border-border">
                          <AvatarImage src={blog.user.avatarUrl || undefined} />
                          <AvatarFallback className="bg-blue-600/20 text-blue-300 text-[8px]">
                            {blog.user.name?.[0] || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-[10px] text-muted-foreground">{blog.user.name}</span>
                        {blog.user.verified && <span className="text-blue-400 text-[9px]">✓</span>}
                      </div>
                      <h3 className="text-sm font-semibold text-foreground hover:text-blue-300 transition-colors line-clamp-1">
                        {blog.title}
                      </h3>
                      <p className="text-xs text-muted-foreground/70 line-clamp-2 mt-1">{blog.excerpt}</p>
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground/50">
                        <span className="flex items-center gap-1"><Clock size={10} />{new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        <span>{blog.readTime} min read</span>
                        <span className="flex items-center gap-1"><Heart size={10} />{blog.stats.likes}</span>
                        <span className="flex items-center gap-1"><MessageCircle size={10} />{blog.stats.comments}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleBlogBookmark(blog); }}
                      className="shrink-0 text-amber-400 hover:text-amber-300 transition-colors p-1"
                    >
                      <Bookmark size={18} fill="currentColor" />
                    </button>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Posts Tab ── */}
        <TabsContent value="posts" className="mt-4">
          {loadingPosts ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
            </div>
          ) : posts.length === 0 ? (
            <GlassCard className="p-12 text-center">
              <Rss className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No bookmarked posts</p>
              <p className="text-xs text-muted-foreground/50 mt-1">Bookmark posts you want to revisit</p>
              <Button size="sm" variant="outline" className="mt-4 text-xs" onClick={() => router.push('/feed')}>
                Browse Feed
              </Button>
            </GlassCard>
          ) : (
            <div className="space-y-3">
              {posts.map(post => (
                <GlassCard key={post.id} className="p-4 cursor-pointer hover:bg-accent/30 transition-colors" onClick={() => router.push('/feed')}>
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8 border border-border shrink-0">
                      <AvatarImage src={post.user.avatarUrl || undefined} />
                      <AvatarFallback className="bg-blue-600/20 text-blue-300 text-xs">
                        {post.user.name?.[0] || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-foreground">{post.user.name}</span>
                        {post.user.verified && <span className="text-blue-400 text-[10px]">✓</span>}
                        <span className="text-[10px] text-muted-foreground/40">{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-foreground line-clamp-3">{post.content}</p>
                      {post.images?.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {post.images.slice(0, 3).map((img, i) => (
                            <div key={i} className="w-12 h-12 rounded-md bg-accent overflow-hidden">
                              <img src={img} alt="" className="w-full h-full object-cover" />
                            </div>
                          ))}
                          {post.images.length > 3 && (
                            <div className="w-12 h-12 rounded-md bg-accent flex items-center justify-center text-[10px] text-muted-foreground">
                              +{post.images.length - 3}
                            </div>
                          )}
                        </div>
                      )}
                      {post.hashtags?.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {post.hashtags.map((tag, i) => (
                            <span key={i} className="text-[10px] text-blue-400/70">#{tag}</span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground/50">
                        <span className="flex items-center gap-1"><Heart size={10} />{post.stats.likes}</span>
                        <span className="flex items-center gap-1"><MessageCircle size={10} />{post.stats.comments}</span>
                        <span className="flex items-center gap-1"><Repeat2 size={10} />{post.stats.reposts}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); togglePostBookmark(post); }}
                      className="shrink-0 text-amber-400 hover:text-amber-300 transition-colors p-1"
                    >
                      <Bookmark size={18} fill="currentColor" />
                    </button>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Live Updates Tab ── */}
        <TabsContent value="live" className="mt-4">
          {loadingLive ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
            </div>
          ) : liveUpdates.length === 0 ? (
            <GlassCard className="p-12 text-center">
              <Activity className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No bookmarked live updates</p>
              <p className="text-xs text-muted-foreground/50 mt-1">Bookmark live updates you want to revisit</p>
              <Button size="sm" variant="outline" className="mt-4 text-xs" onClick={() => router.push('/feed')}>
                Browse Feed
              </Button>
            </GlassCard>
          ) : (
            <div className="space-y-3">
              {liveUpdates.map(update => {
                if (update.type === 'content') return <ContentUpdateCard key={update.id} update={update} />;
                if (update.type === 'fitness') return <FitnessUpdateCard key={update.id} update={update} />;
                if (update.type === 'learning') return <LearningUpdateCard key={update.id} update={update} />;
                return null;
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
