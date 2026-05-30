'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { BarChart3, Loader2 } from 'lucide-react';
import { GlassCard } from '@/components/glass-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { t } from '@/lib/i18n';
import { useUserStore } from '@/stores/user-store';

const RANGES = ['7', '30', '90', 'all'];

export default function AnalyticsClient() {
  const { profile } = useUserStore();
  const [range, setRange] = useState('7');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try { const r = await fetch(`/api/analytics?range=${range}`); if (r.ok) setData(await r.json()); } catch {}
    setLoading(false);
  }, [range]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const scores = data?.scores || { learning: 0, fitness: 0, focus: 0, overall: 0 };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">{t('analytics.title')}</h2>
        <div className="flex gap-2">
          {RANGES.map(r => <button key={r} onClick={() => setRange(r)} className={`text-xs px-3 py-1.5 rounded-full transition-all ${range === r ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'bg-accent text-muted-foreground/70 border border-border'}`}>{t(`analytics.range${r === 'all' ? 'All' : r}`)}</button>)}
        </div>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <GlassCard className="p-4 text-center"><p className="text-2xl font-bold text-blue-400">{scores.learning}%</p><p className="text-xs text-muted-foreground/70">{t('analytics.learning')}</p></GlassCard>
        <GlassCard className="p-4 text-center"><p className="text-2xl font-bold text-red-400">{scores.fitness}%</p><p className="text-xs text-muted-foreground/70">{t('analytics.fitness')}</p></GlassCard>
        <GlassCard className="p-4 text-center"><p className="text-2xl font-bold text-purple-400">{scores.focus}%</p><p className="text-xs text-muted-foreground/70">{t('analytics.focus')}</p></GlassCard>
        <GlassCard className="p-4 text-center"><p className="text-2xl font-bold text-amber-400">{scores.overall}%</p><p className="text-xs text-muted-foreground/70">{t('analytics.overall')}</p></GlassCard>
      </div>

      {/* Weekly Breakdowns */}
      {loading ? <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-blue-400 animate-spin" /></div> :
      data?.weeks ? (
        <div className="space-y-2">
          {data.weeks.map((week: any, i: number) => (
            <GlassCard key={i} className="p-3 flex items-center justify-between">
              <span className="text-xs text-muted-foreground/70">{week.label || `Week ${i + 1}`}</span>
              <div className="flex gap-4">
                <span className="text-xs text-blue-400">{week.learningEntries || 0} L</span>
                <span className="text-xs text-red-400">{week.workouts || 0} W</span>
                <span className="text-xs text-purple-400">{week.focusMin || 0}m F</span>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : <GlassCard className="p-8 text-center"><p className="text-muted-foreground/50 text-sm">No data yet</p></GlassCard>}
    </div>
  );
}
