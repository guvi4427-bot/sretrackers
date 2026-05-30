'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Search, Loader2 } from 'lucide-react';
import { GlassCard } from '@/components/glass-card';
import { AdCard } from '@/components/ad-banner';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useUserStore } from '@/stores/user-store';
import { t } from '@/lib/i18n';
import { useRouter } from 'next/navigation';

export default function LeaderboardClient() {
  const router = useRouter();
  const { profile } = useUserStore();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('xp');
  const [search, setSearch] = useState('');

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/leaderboard?filter=${filter}`);
      if (r.ok) {
        const data = await r.json();
        setUsers(Array.isArray(data) ? data : (data.entries || []));
      }
    } catch {}
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetchLeaderboard(); }, [fetchLeaderboard]);

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h2 className="text-lg font-bold text-foreground">{t('leaderboard.title')}</h2>

      <div className="flex gap-2 flex-wrap">
        {['xp', 'phase_streak', 'topic_streak', 'fitness_weekly', 'focus_weekly'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`text-xs px-3 py-1.5 rounded-full transition-all ${filter === f ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'bg-accent text-muted-foreground/70 border border-border'}`}>
            {t(`leaderboard.${f === 'xp' ? 'title' : f.replace(/_([a-z])/g, (_, c) => c.toUpperCase())}`)}
          </button>
        ))}
      </div>

      <Input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('common.search')} className="bg-accent border-border text-foreground placeholder:text-muted-foreground/50" />

      {loading ? <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-blue-400 animate-spin" /></div> : (
        <div className="space-y-2">
          {users.filter((u: any) => !search || (u.name || '').toLowerCase().includes(search.toLowerCase())).map((u: any, i: number) => {
            const isOwn = u.id === profile?.userId || u.userId === profile?.userId;
            return (
              <motion.div key={u.id || i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <GlassCard className={`p-3 flex items-center gap-3 cursor-pointer ${isOwn ? 'border-blue-500/30 bg-blue-600/10' : ''}`} onClick={() => router.push(`/profile/${u.userId || u.id}`)}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i < 3 ? 'bg-amber-600/20 text-amber-400' : 'bg-accent text-muted-foreground/70'}`}>#{i + 1}</div>
                  <Avatar className="h-9 w-9"><AvatarFallback className="bg-blue-600/30 text-blue-300 text-xs">{u.name?.[0] || '?'}</AvatarFallback></Avatar>
                  <div className="flex-1"><p className="text-sm font-medium text-foreground">{u.name || 'User'} {isOwn && <span className="text-xs text-blue-400 ml-1">({t('leaderboard.you')})</span>}</p></div>
                  <div className="text-right"><p className="text-sm font-bold text-amber-400">{u.xp || 0} XP</p></div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Ad Banner — bottom of page, above footer */}
      <AdCard format="in-feed" slot="leaderboard_bottom" />
    </div>
  );
}
