'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, MessageCircle, Users, Heart, Repeat2, UserPlus, AtSign, FileText, Check, Award, Trash2, X, Shield, Bookmark, RefreshCw } from 'lucide-react';
import { GlassCard } from '@/components/glass-card';
import { Button } from '@/components/ui/button';
import { t } from '@/lib/i18n';
import { useRouter } from 'next/navigation';

const NOTIFICATION_CONFIG: Record<string, { icon: any; color: string; getPath: (data: any) => string }> = {
  achievement: { icon: Trophy, color: 'text-amber-400', getPath: () => '/achievements' },
  achievement_eligible: { icon: Award, color: 'text-amber-400', getPath: () => '/achievements' },
  level_up: { icon: Trophy, color: 'text-yellow-400', getPath: () => '/home' },
  dm: { icon: MessageCircle, color: 'text-blue-400', getPath: () => '/messages' },
  group_message: { icon: Users, color: 'text-teal-400', getPath: (d) => `/messages?group=${d?.groupId || ''}` },
  tag: { icon: AtSign, color: 'text-purple-400', getPath: (d) => `/feed?postId=${d?.postId}` },
  followed_post: { icon: FileText, color: 'text-emerald-400', getPath: (d) => `/feed?postId=${d?.postId}` },
  like: { icon: Heart, color: 'text-rose-400', getPath: (d) => `/feed?postId=${d?.postId}` },
  comment: { icon: MessageCircle, color: 'text-cyan-400', getPath: (d) => `/feed?postId=${d?.postId}` },
  repost: { icon: Repeat2, color: 'text-green-400', getPath: (d) => `/feed?postId=${d?.postId}` },
  follow: { icon: UserPlus, color: 'text-orange-400', getPath: (d) => `/profile/${d?.fromUserId || ''}` },
  follow_request: { icon: UserPlus, color: 'text-amber-400', getPath: () => '/follow-requests' },
  follow_accepted: { icon: UserPlus, color: 'text-emerald-400', getPath: (d) => `/profile/${d?.fromUserId || ''}` },
  verification: { icon: Shield, color: 'text-blue-400', getPath: () => '/profile' },
  bookmarked_topic_update: { icon: Bookmark, color: 'text-indigo-400', getPath: (d) => `/shared-topic/${d?.topicId || ''}` },
  system: { icon: FileText, color: 'text-muted-foreground', getPath: () => '' },
  mention: { icon: AtSign, color: 'text-purple-400', getPath: (d) => `/feed?postId=${d?.postId}` },
  quest: { icon: Trophy, color: 'text-green-400', getPath: () => '/home' },
  topic_switch_recommendation: { icon: RefreshCw, color: 'text-orange-400', getPath: () => '/learn?tab=topics' },
};

export default function NotificationsClient() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);

  const fetchNotifications = useCallback(async () => {
    try { const r = await fetch('/api/notifications'); if (r.ok) { const d = await r.json(); setNotifications(Array.isArray(d) ? d : d.notifications || []); } } catch {}
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  async function markAllRead() {
    try { await fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ markAll: true }) }); fetchNotifications(); window.dispatchEvent(new CustomEvent('notification-updated')); } catch {}
  }

  async function markRead(id: string) {
    try { await fetch(`/api/notifications`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ notificationId: id }) }); fetchNotifications(); window.dispatchEvent(new CustomEvent('notification-updated')); } catch {}
  }

  async function clearAll() {
    try {
      await fetch('/api/notifications?clearAll=true', { method: 'DELETE' });
      setNotifications([]);
      window.dispatchEvent(new CustomEvent('notification-updated'));
    } catch {}
  }

  async function clearNotification(id: string) {
    try {
      // Optimistic: remove from UI immediately
      setNotifications(prev => prev.filter(n => n.id !== id));
      await fetch(`/api/notifications?id=${id}`, { method: 'DELETE' });
      window.dispatchEvent(new CustomEvent('notification-updated'));
    } catch {
      // Revert on failure
      fetchNotifications();
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">{t('notifications.title')}</h2>
        <div className="flex items-center gap-1">
          <Button onClick={markAllRead} variant="ghost" className="text-xs text-blue-400">{t('notifications.markAllRead')}</Button>
          {notifications.length > 0 && (
            <Button onClick={clearAll} variant="ghost" className="text-xs text-red-400 hover:text-red-300">
              <Trash2 size={12} className="mr-1" />Clear All
            </Button>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <AnimatePresence>
          {notifications.map((n: any) => {
            const config = NOTIFICATION_CONFIG[n.type] || { icon: FileText, color: 'text-muted-foreground/70', getPath: () => '' };
            const Icon = config.icon;
            return (
              <motion.div key={n.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 50, transition: { duration: 0.2 } }}>
                <GlassCard className={`p-4 flex items-center gap-3 cursor-pointer ${n.read ? 'opacity-60' : ''}`} onClick={() => {
                markRead(n.id);
                // Parse notification data for navigation (combines direct fields + JSON data field)
                let parsedData: any = {};
                try { parsedData = JSON.parse(n.data || '{}'); } catch {}
                const navData = { ...parsedData, fromUserId: n.fromUserId, postId: n.postId, groupId: parsedData.groupId, topicId: parsedData.topicId };
                const path = config.getPath(navData);
                if (path) router.push(path);
              }}>
                  <div className={`w-9 h-9 rounded-full bg-accent flex items-center justify-center shrink-0 ${config.color}`}><Icon size={18} /></div>
                  <div className="flex-1 min-w-0"><p className="text-sm text-foreground">{n.title || n.message}</p><p className="text-[10px] text-muted-foreground/70">{n.message}</p></div>
                  <div className="flex items-center gap-1 shrink-0">
                    {!n.read && <div className="w-2 h-2 rounded-full bg-blue-400" />}
                    <button onClick={(e) => { e.stopPropagation(); clearNotification(n.id); }} className="text-muted-foreground/30 hover:text-red-400 p-1 rounded-lg hover:bg-red-500/10 transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {notifications.length === 0 && <GlassCard className="p-8 text-center"><p className="text-muted-foreground/50 text-sm">No notifications</p></GlassCard>}
      </div>
    </div>
  );
}
