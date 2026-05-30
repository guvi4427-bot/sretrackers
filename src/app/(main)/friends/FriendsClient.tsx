'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Users, MessageCircle, Loader2, BadgeCheck } from 'lucide-react';
import { GlassCard } from '@/components/glass-card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useUserStore } from '@/stores/user-store';
import { t } from '@/lib/i18n';
import { useRouter } from 'next/navigation';

export default function FriendsClient() {
  const router = useRouter();
  const { profile } = useUserStore();
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFriends = useCallback(async () => {
    try {
      // Get both followers and following, then find mutuals
      const [fR, fgR] = await Promise.all([
        fetch('/api/follow?type=followers'),
        fetch('/api/follow?type=following'),
      ]);
      const followersData = fR.ok ? await fR.json() : [];
      const followingData = fgR.ok ? await fgR.json() : [];

      const followers = Array.isArray(followersData) ? followersData : [];
      const following = Array.isArray(followingData) ? followingData : [];

      // Find mutuals: people who follow you AND you follow back
      const followingIds = new Set(following.map((f: any) => f.id));
      const mutuals = followers.filter((f: any) => followingIds.has(f.id));
      setFriends(mutuals);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchFriends(); }, [fetchFriends]);

  if (loading) {
    return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-blue-400 animate-spin" /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">{t('friends.title')}</h2>
        <span className="text-xs text-muted-foreground">{friends.length} {t('friends.mutual')}</span>
      </div>

      {friends.length === 0 ? (
        <GlassCard className="p-8 text-center">
          <Users className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">{t('friends.noFriends')}</p>
          <p className="text-xs text-muted-foreground/50 mt-1">Follow people who follow you to become friends</p>
        </GlassCard>
      ) : (
        <div className="space-y-2">
          {friends.map((friend: any) => (
            <GlassCard key={friend.id} className="p-4 flex items-center gap-3">
              <Avatar className="h-11 w-11 border border-border shrink-0 cursor-pointer" onClick={() => router.push(`/profile/${friend.id}`)}>
                <AvatarFallback className="bg-blue-600/30 text-blue-300">{friend.name?.[0] || '?'}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-sm font-medium text-foreground truncate">{friend.name || 'User'}</p>
                  {friend.verified && <BadgeCheck size={14} className="text-blue-400 shrink-0" />}
                </div>
                <p className="text-[10px] text-muted-foreground">@{friend.username || 'user'}</p>
              </div>
              <Button
                onClick={() => {
                  // Use window.location.href for reliable navigation to DM with userId
                  // router.push can sometimes lose query params with Suspense boundaries
                  window.location.href = `/messages?userId=${friend.id}`;
                }}
                size="sm"
                variant="ghost"
                className="text-blue-400 hover:bg-blue-600/10 shrink-0"
              >
                <MessageCircle size={16} className="mr-1" />{t('friends.message')}
              </Button>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
