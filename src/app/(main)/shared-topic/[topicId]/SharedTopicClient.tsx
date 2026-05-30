'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  ArrowLeft, BookOpen, Clock, Calendar, Sparkles, Send, Bot,
  Loader2, Globe, ChevronRight, MessageCircle, User, Eye
} from 'lucide-react';
import { GlassCard } from '@/components/glass-card';
import { AdCard } from '@/components/ad-banner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUserStore } from '@/stores/user-store';

function SharedTopicContent() {
  const { topicId } = useParams<{ topicId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromParam = searchParams.get('from') || 'feed';
  const { profile } = useUserStore();

  const [topic, setTopic] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  const fetchTopic = useCallback(async () => {
    try {
      const r = await fetch(`/api/learning/topic/${topicId}?_t=${Date.now()}`);
      if (r.ok) {
        const d = await r.json();
        const topicData = d.topic || d;
        setTopic(topicData);
        setIsOwner(d.isOwner !== undefined ? d.isOwner : (topicData.userId === profile?.userId));
      } else {
        toast.error('Topic not found or not publicly shared');
        router.push(`/${fromParam}`);
      }
    } catch {
      toast.error('Failed to load topic');
    } finally {
      setLoading(false);
    }
  }, [topicId, profile?.userId, router, fromParam]);

  useEffect(() => { fetchTopic(); }, [fetchTopic]);

  // Live refresh: re-fetch on window focus/visibility change to reflect owner's changes
  useEffect(() => {
    let throttle = false;
    const handler = () => {
      if (!throttle) {
        throttle = true;
        fetchTopic();
        setTimeout(() => { throttle = false; }, 3000);
      }
    };
    document.addEventListener('visibilitychange', handler);
    window.addEventListener('focus', handler);
    return () => {
      document.removeEventListener('visibilitychange', handler);
      window.removeEventListener('focus', handler);
    };
  }, [fetchTopic]);

  // Polling every 15s for live updates while the page is visible
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchTopic();
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchTopic]);

  const entries = topic?.entries || [];

  const goBack = () => {
    if (fromParam === 'profile') {
      router.push('/profile');
    } else if (fromParam === 'learn') {
      router.push('/learn');
    } else if (fromParam === 'messages') {
      router.push('/messages');
    } else {
      router.push('/feed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading shared collection...</p>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <BookOpen className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Topic not found or not publicly shared</p>
          <Button onClick={goBack} variant="ghost" className="text-blue-400 mt-3 text-xs">
            <ArrowLeft size={14} className="mr-1" /> Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Semantic heading for SEO/crawlers — visually hidden */}
      <h1 className="sr-only">{topic.name} — Shared Learning Collection</h1>

      {/* Back button */}
      <button
        onClick={goBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
      >
        <ArrowLeft size={16} />
        <span>Back to {fromParam === 'profile' ? 'Profile' : fromParam === 'learn' ? 'Learning' : fromParam === 'messages' ? 'Messages' : fromParam === 'discover' ? 'Discover' : 'Feed'}</span>
      </button>

      {/* Topic Header */}
      <GlassCard variant="deep" className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen size={20} className="text-blue-400 shrink-0" />
              <h1 className="text-xl font-bold text-foreground">{topic.name}</h1>
            </div>

            <div className="flex items-center gap-2 flex-wrap mt-2">
              <span className="text-[10px] bg-green-600/20 text-green-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Globe size={10} /> Shared Collection
              </span>
              {topic.phase && (
                <span className="text-[10px] bg-blue-600/20 text-blue-300 px-2 py-0.5 rounded-full">
                  {topic.phase}
                </span>
              )}
              <span className="text-[10px] text-muted-foreground/70 flex items-center gap-1">
                <Eye size={10} /> Read-only{isOwner && ' (Owner View)'}
              </span>
            </div>

            {/* Creator info */}
            {topic.user && (
              <div className="flex items-center gap-2 mt-3">
                <div className="w-6 h-6 rounded-full bg-blue-600/30 flex items-center justify-center shrink-0">
                  <User size={12} className="text-blue-300" />
                </div>
                <span className="text-xs text-muted-foreground">
                  by <span className="text-foreground font-medium">{topic.user.profile?.name || topic.user.username || 'User'}</span>
                </span>
                {topic.user.profile?.verified && <span className="text-blue-400 text-[10px]">✓</span>}
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-4 mt-3">
              <span className="text-xs text-muted-foreground/70">
                {entries.length} subtopic{entries.length !== 1 ? 's' : ''}
              </span>
              {entries.length > 0 && (
                <span className="text-xs text-muted-foreground/70">
                  {entries.reduce((sum: number, e: any) => sum + (e.duration || 0), 0)} min total
                </span>
              )}
              {topic.sharedAt && (
                <span className="text-xs text-muted-foreground/70">
                  Shared {new Date(topic.sharedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          {/* Live indicator */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[9px] text-green-400">Live</span>
          </div>
        </div>
      </GlassCard>

      {/* Entries (Sub-topics) List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <BookOpen size={14} className="text-blue-400" />
            Sub-topics
          </h3>
          <span className="text-[10px] text-muted-foreground/50">
            Click a sub-topic to view content &amp; ask AI doubts
          </span>
        </div>

        {entries.length === 0 ? (
          <GlassCard variant="liquid" className="p-8 text-center">
            <BookOpen className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No sub-topics yet</p>
            <p className="text-xs text-muted-foreground/50 mt-1">
              The creator hasn&apos;t added any entries yet. Check back later!
            </p>
          </GlassCard>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {entries.map((e: any, i: number) => (
                <motion.div
                  key={e.id || i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => router.push(`/learn/entry/${e.id}?from=shared-topic&topicId=${topicId}`)}
                  className="bg-accent/50 hover:bg-accent/80 rounded-xl p-4 cursor-pointer transition-all duration-200 border border-transparent hover:border-blue-500/20 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-600/15 flex items-center justify-center shrink-0 group-hover:bg-blue-600/25 transition-colors">
                      <BookOpen size={16} className="text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground group-hover:text-blue-300 transition-colors">{e.title}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {e.duration && (
                          <span className="text-[10px] text-muted-foreground/70 flex items-center gap-0.5">
                            <Clock size={8} />{e.duration}min
                          </span>
                        )}
                        <span className="text-[10px] text-muted-foreground/70 flex items-center gap-0.5">
                          <Calendar size={8} />{e.date}
                        </span>
                        {e.content && (
                          <span className="text-[10px] text-blue-400/60 flex items-center gap-0.5">
                            <MessageCircle size={8} />Has notes
                          </span>
                        )}
                      </div>
                      {/* Content preview */}
                      {e.content && (
                        <p className="text-[10px] text-muted-foreground/50 mt-1 line-clamp-1">
                          {e.content.substring(0, 80)}{e.content.length > 80 ? '...' : ''}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Sparkles size={12} className="text-amber-400/40 group-hover:text-amber-400 transition-colors" />
                      <ChevronRight size={16} className="text-muted-foreground/30 group-hover:text-blue-400 transition-colors" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Quick Info Card */}
      <GlassCard variant="liquid" className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-600/15 flex items-center justify-center shrink-0">
            <Sparkles size={14} className="text-amber-400" />
          </div>
          <div>
            <h4 className="text-xs font-medium text-foreground">AI Doubt Solver Available</h4>
            <p className="text-[10px] text-muted-foreground/70 mt-0.5">
              Click any sub-topic to view its content and ask an AI assistant questions about it.
              The AI knows the topic context and your notes to help clear your doubts.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Ad Banner — bottom of page, above footer */}
      <AdCard format="in-feed" slot="shared_topic_bottom" />
    </div>
  );
}

export default function SharedTopicClient() {
  return (
    <Suspense>
      <SharedTopicContent />
    </Suspense>
  );
}
