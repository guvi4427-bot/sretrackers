'use client';

import { cn } from '@/lib/utils';
import { forwardRef, HTMLAttributes } from 'react';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  hoverGlow?: 'blue' | 'xp' | 'streak' | 'rank' | 'gold' | 'none';
  variant?: 'default' | 'sm' | 'intense' | 'glassmorphism' | 'liquid' | 'glowing' | 'deep';
}

const variantClasses = {
  // Primary 1: Frosted glass - standard frosted look
  default: 'backdrop-blur-xl bg-white/70 dark:bg-black/40 border border-black/5 dark:border-white/10 rounded-xl shadow-sm',
  sm: 'backdrop-blur-xl bg-white/70 dark:bg-black/40 border border-black/5 dark:border-white/10 rounded-lg shadow-sm',
  // Primary 1 (intense): Frosted glass - more blur and opacity
  intense: 'backdrop-blur-2xl bg-white/80 dark:bg-black/60 border border-black/5 dark:border-white/10 rounded-xl shadow-md',
  // Primary 2: Glassmorphism - gradient bg overlay + colored border glow
  glassmorphism: 'backdrop-blur-xl bg-gradient-to-br from-white/60 via-white/40 to-blue-500/10 dark:from-black/50 dark:via-blue-900/20 dark:to-indigo-900/10 border border-blue-200/30 dark:border-blue-400/20 rounded-xl shadow-lg shadow-blue-500/5 dark:shadow-blue-500/10',
  // Secondary 1: Liquid glass - soft gradient shift + no hard border + gentle shadow
  liquid: 'backdrop-blur-2xl bg-gradient-to-br from-white/50 via-white/30 to-transparent dark:from-white/10 dark:via-blue-500/5 dark:to-transparent border border-white/20 dark:border-white/5 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)]',
  // Secondary 2: Glowing glass - colored border glow + inner glow
  glowing: 'backdrop-blur-xl bg-white/60 dark:bg-blue-950/40 border border-blue-300/40 dark:border-blue-400/30 rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.15),inset_0_1px_0_rgba(255,255,255,0.1)] dark:shadow-[0_0_20px_rgba(59,130,246,0.2),inset_0_1px_0_rgba(255,255,255,0.05)]',
  // Accent: Deep glass - heavy blur + deep dark bg + strong border contrast
  deep: 'backdrop-blur-3xl bg-white/90 dark:bg-black/70 border border-black/10 dark:border-blue-400/30 rounded-xl shadow-xl dark:shadow-blue-900/20',
};

const glowClasses = {
  blue: 'hover:shadow-[0_0_25px_rgba(37,99,235,0.35)]',
  xp: 'hover:shadow-[0_0_25px_rgba(245,158,11,0.35)]',
  streak: 'hover:shadow-[0_0_25px_rgba(239,68,68,0.3)]',
  rank: 'hover:shadow-[0_0_25px_rgba(139,92,246,0.3)]',
  gold: 'hover:shadow-[0_0_25px_rgba(212,160,23,0.35)]',
  none: '',
};

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, hoverGlow = 'none', variant = 'default', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          variantClasses[variant],
          glowClasses[hoverGlow],
          'transition-all duration-300',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';

export { GlassCard };
