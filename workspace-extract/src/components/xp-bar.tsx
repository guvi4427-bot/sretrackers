'use client';

import { cn } from '@/lib/utils';
import { getXPForLevel, getXPForNextLevel } from '@/lib/gamification';

interface XPBarProps {
  xp: number;
  level: number;
  compact?: boolean;
}

export function XPBar({ xp, level, compact = false }: XPBarProps) {
  const xpForCurrentLevel = getXPForLevel(level);
  const xpForNextLevelThreshold = getXPForLevel(level + 1);
  const xpNeeded = getXPForNextLevel(level);
  const xpInCurrentLevel = Math.max(0, xp - xpForCurrentLevel);
  const progress = xpNeeded > 0 ? Math.min(Math.max(xpInCurrentLevel / xpNeeded, 0), 1) : 0;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span
          className="inline-flex items-center justify-center rounded-md px-1.5 py-0.5 text-xs font-bold"
          style={{ backgroundColor: '#8B5CF6', color: '#fff' }}
        >
          Lvl {level}
        </span>
        <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress * 100}%`,
              background: 'linear-gradient(90deg, #F59E0B, #EF4444)',
            }}
          />
        </div>
        <span className="text-[10px] text-white/50 tabular-nums">
          {xpInCurrentLevel}/{xpNeeded}
        </span>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <span
          className="inline-flex items-center justify-center rounded-lg px-3 py-1 text-sm font-bold"
          style={{ backgroundColor: '#8B5CF6', color: '#fff' }}
        >
          Level {level}
        </span>
        <span className="text-sm text-white/60 tabular-nums">
          {xpInCurrentLevel} / {xpNeeded} XP
        </span>
      </div>
      <div className="h-3 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${progress * 100}%`,
            background: 'linear-gradient(90deg, #F59E0B, #EF4444)',
          }}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-white/40">
        <span>{xpForCurrentLevel} XP</span>
        <span>{xpForNextLevelThreshold} XP</span>
      </div>
    </div>
  );
}
