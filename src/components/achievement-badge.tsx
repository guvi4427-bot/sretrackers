'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface AchievementBadgeProps {
  iconEmoji: string;
  name: string;
  description?: string;
  locked?: boolean;
  xpReward?: number;
}

export function AchievementBadge({
  iconEmoji,
  name,
  description,
  locked = false,
  xpReward,
}: AchievementBadgeProps) {
  return (
    <motion.div
      className={cn(
        'flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-4 text-center transition-all duration-300',
        locked ? 'opacity-40 grayscale cursor-not-allowed' : 'hover:scale-105 cursor-pointer'
      )}
      whileHover={!locked ? { scale: 1.05 } : {}}
      whileTap={!locked ? { scale: 0.97 } : {}}
    >
      <div
        className={cn(
          'flex items-center justify-center w-14 h-14 rounded-xl text-2xl',
          locked ? 'bg-white/5' : 'bg-white/10'
        )}
      >
        {locked ? '🔒' : iconEmoji}
      </div>
      <div className="space-y-0.5">
        <p className={cn('text-sm font-semibold', locked ? 'text-white/30' : 'text-white')}>
          {name}
        </p>
        {description && (
          <p className="text-xs text-white/40 leading-relaxed">{description}</p>
        )}
      </div>
      {xpReward && !locked && (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-400">
          +{xpReward} XP
        </span>
      )}
    </motion.div>
  );
}
