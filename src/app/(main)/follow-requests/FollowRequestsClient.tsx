'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { UserPlus, UserX, Clock, CheckCircle, XCircle, Loader2, Send, Inbox, ArrowLeft } from 'lucide-react';
import { GlassCard } from '@/components/glass-card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useUserStore } from '@/stores/user-store';
import { t } from '@/lib/i18n';
import { useRouter } from 'next/navigation';

export default function FollowRequestsClient() {
  const router = useRouter();
  const { profile } = useUserStore();
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      const [rR, sR] = await Promise.all([
        fetch('/api/follow?type=requests'),
        fetch('/api/follow?type=sent-requests'),
      ]);
      if (rR.ok) {
        const d = await rR.json();
        setPendingRequests(Array.isArray(d) ? d : []);
      }
      if (sR.ok) {
        const d = await sR.json();
        setSentRequests(Array.isArray(d) ? d : []);
      }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  // Auto-switch to received tab if there are pending requests
  useEffect(() => {
    if (pendingRequests.length > 0 && sentRequests.length === 0) {
      setActiveTab('received');
    } else if (sentRequests.length > 0 && pendingRequests.length === 0) {
      setActiveTab('sent');
    }
  }, [pendingRequests.length, sentRequests.length]);

  async function handleAccept(followerId: string, reqId: string) {
    setActionLoading(reqId);
    try {
      const r = await fetch('/api/follow', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followerId, action: 'accept' }),
      });
      if (r.ok) {
        toast.success('Follow request accepted');
        fetchRequests();
        window.dispatchEvent(new CustomEvent('notification-updated'));
      } else {
        toast.error('Failed to accept request');
      }
    } catch {
      toast.error('Something went wrong');
    }
    setActionLoading(null);
  }

  async function handleDeny(followerId: string, reqId: string) {
    setActionLoading(reqId);
    try {
      const r = await fetch('/api/follow', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followerId, action: 'reject' }),
      });
      if (r.ok) {
        toast.success('Follow request denied');
        fetchRequests();
        window.dispatchEvent(new CustomEvent('notification-updated'));
      } else {
        toast.error('Failed to deny request');
      }
    } catch {
      toast.error('Something went wrong');
    }
    setActionLoading(null);
  }

  async function withdrawRequest(followingId: string, reqId: string) {
    setActionLoading(reqId);
    try {
      const r = await fetch(`/api/follow?userId=${followingId}`, { method: 'DELETE' });
      if (r.ok) {
        toast.success('Request withdrawn');
        fetchRequests();
      } else {
        toast.error('Failed to withdraw request');
      }
    } catch {
      toast.error('Something went wrong');
    }
    setActionLoading(null);
  }

  function formatTimeAgo(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-muted-foreground hover:text-foreground transition-colors p-1">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-lg font-bold text-foreground">{t('followRequests.title')}</h2>
          <p className="text-xs text-muted-foreground">{pendingRequests.length + sentRequests.length} total requests</p>
        </div>
      </div>

      {/* Sub-tab Switcher */}
      <GlassCard variant="glassmorphism" className="p-1.5">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('received')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'received'
                ? 'bg-blue-600/20 text-blue-400 shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/5 dark:hover:bg-white/5'
            }`}
          >
            <Inbox size={16} />
            <span>{t('followRequests.received')}</span>
            {pendingRequests.length > 0 && (
              <span className="min-w-[20px] h-5 flex items-center justify-center rounded-full bg-red-500/90 text-white text-[10px] font-bold px-1.5">
                {pendingRequests.length > 99 ? '99+' : pendingRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'sent'
                ? 'bg-blue-600/20 text-blue-400 shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/5 dark:hover:bg-white/5'
            }`}
          >
            <Send size={16} />
            <span>{t('followRequests.sent')}</span>
            {sentRequests.length > 0 && (
              <span className="min-w-[20px] h-5 flex items-center justify-center rounded-full bg-blue-500/60 text-white text-[10px] font-bold px-1.5">
                {sentRequests.length > 99 ? '99+' : sentRequests.length}
              </span>
            )}
          </button>
        </div>
      </GlassCard>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'received' ? (
          <motion.div
            key="received"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {pendingRequests.length === 0 ? (
              <GlassCard variant="liquid" className="p-10 text-center">
                <div className="w-14 h-14 rounded-full bg-blue-600/10 flex items-center justify-center mx-auto mb-3">
                  <Inbox className="w-7 h-7 text-blue-400/50" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">{t('followRequests.noRequests')}</p>
                <p className="text-xs text-muted-foreground/50 mt-1">When someone sends you a follow request, it will appear here</p>
              </GlassCard>
            ) : (
              pendingRequests.map((req: any, index: number) => (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <GlassCard variant="glowing" className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar
                        className="h-11 w-11 border border-blue-400/20 shrink-0 cursor-pointer"
                        onClick={() => router.push(`/profile/${req.followerId}`)}
                      >
                        <AvatarFallback className="bg-blue-600/30 text-blue-300 text-sm">
                          {req.follower?.name?.[0] || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{req.follower?.name || 'User'}</p>
                        <p className="text-[11px] text-muted-foreground">@{req.follower?.username || 'user'}</p>
                        <p className="text-[10px] text-muted-foreground/50 mt-0.5">{formatTimeAgo(req.createdAt)}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          onClick={() => handleAccept(req.followerId, req.id)}
                          disabled={actionLoading === req.id}
                          size="sm"
                          className="bg-green-600/80 hover:bg-green-600 text-white h-8 px-3 text-xs"
                        >
                          {actionLoading === req.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <CheckCircle size={14} className="mr-1" />
                          )}
                          {t('followRequests.accept')}
                        </Button>
                        <Button
                          onClick={() => handleDeny(req.followerId, req.id)}
                          disabled={actionLoading === req.id}
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:text-red-300 hover:bg-red-600/10 h-8 px-3 text-xs"
                        >
                          {actionLoading === req.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <XCircle size={14} className="mr-1" />
                          )}
                          {t('followRequests.deny')}
                        </Button>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))
            )}
          </motion.div>
        ) : (
          <motion.div
            key="sent"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {sentRequests.length === 0 ? (
              <GlassCard variant="liquid" className="p-10 text-center">
                <div className="w-14 h-14 rounded-full bg-blue-600/10 flex items-center justify-center mx-auto mb-3">
                  <Send className="w-7 h-7 text-blue-400/50" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">{t('followRequests.noSentRequests')}</p>
                <p className="text-xs text-muted-foreground/50 mt-1">When you send a follow request to a private account, it will appear here</p>
              </GlassCard>
            ) : (
              sentRequests.map((req: any, index: number) => (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <GlassCard variant="default" className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar
                        className="h-11 w-11 border border-border shrink-0 cursor-pointer"
                        onClick={() => router.push(`/profile/${req.followingId}`)}
                      >
                        <AvatarFallback className="bg-blue-600/30 text-blue-300 text-sm">
                          {req.following?.name?.[0] || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{req.following?.name || 'User'}</p>
                        <p className="text-[11px] text-muted-foreground">@{req.following?.username || 'user'}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Clock size={10} className="text-amber-400/70" />
                          <span className="text-[10px] text-amber-400/70">Pending</span>
                          <span className="text-[10px] text-muted-foreground/40">· {formatTimeAgo(req.createdAt)}</span>
                        </div>
                      </div>
                      <Button
                        onClick={() => withdrawRequest(req.followingId, req.id)}
                        disabled={actionLoading === req.id}
                        size="sm"
                        variant="ghost"
                        className="text-red-400 hover:text-red-300 hover:bg-red-600/10 h-8 px-3 text-xs shrink-0"
                      >
                        {actionLoading === req.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <>
                            <XCircle size={14} className="mr-1" />
                            {t('followRequests.withdraw')}
                          </>
                        )}
                      </Button>
                    </div>
                  </GlassCard>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
