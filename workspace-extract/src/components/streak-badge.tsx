'use client';

import { cn } from '@/lib/utils';
import { Flame } from 'lucide-react';
import { motion } from 'framer-motion';

interface StreakBadgeProps {
  streak: number;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'gap-1 text-xs',
  md: 'gap-1.5 text-sm',
  lg: 'gap-2 text-base',
};

const iconSizes = {
  sm: 14,
  md: 18,
  lg: 24,
};

export function StreakBadge({ streak, size = 'md' }: StreakBadgeProps) {
  const isActive = streak > 0;

  return (
    <motion.div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 font-semibold',
        sizeClasses[size],
        isActive
          ? 'bg-red-500/20 text-red-400'
          : 'bg-white/5 text-white/30'
      )}
      animate={isActive ? { scale: [1, 1.05, 1] } : {}}
      transition={isActive ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : {}}
    >
      <Flame
        size={iconSizes[size]}
        className={cn(
          isActive
            ? 'text-red-400 drop-shadow-[0_0_6px_rgba(239,68,68,0.6)]'
            : 'text-white/30'
        )}
      />
      <span className="tabular-nums">{streak}</span>
      <span className="text-white/40">day{streak !== 1 ? 's' : ''}</span>
    </motion.div>
  );
}
