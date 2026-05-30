'use client';

import { cn } from '@/lib/utils';
import { GlassCard } from '@/components/glass-card';
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

const trendConfig = {
  up: { icon: TrendingUp, color: 'text-emerald-400' },
  down: { icon: TrendingDown, color: 'text-red-400' },
  neutral: { icon: Minus, color: 'text-white/40' },
};

export function StatCard({ icon, label, value, trend = 'neutral', trendValue }: StatCardProps) {
  const TrendIcon = trendConfig[trend].icon;
  const trendColor = trendConfig[trend].color;

  return (
    <GlassCard hoverGlow="blue" className="p-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 text-white/70 shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-white/40 truncate">{label}</p>
          <p className="text-lg font-bold text-white tabular-nums">{value}</p>
        </div>
        {trendValue && (
          <div className={cn('flex items-center gap-0.5 text-xs font-medium', trendColor)}>
            <TrendIcon size={14} />
            <span>{trendValue}</span>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
