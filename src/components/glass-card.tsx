'use client';

import { cn } from '@/lib/utils';
import { forwardRef, HTMLAttributes } from 'react';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  hoverGlow?: 'blue' | 'xp' | 'streak' | 'rank' | 'gold' | 'none';
  variant?: 'default' | 'sm' | 'intense' | 'glassmorphism' | 'liquid' | 'glowing' | 'deep';
}

const variantClasses = {
  // Clean, modern cards with crisp borders and subtle translucent surface
  default:
    'backdrop-blur-md bg-white/80 dark:bg-slate-900/75 border border-slate-200/80 dark:border-slate-800/80 rounded-xl shadow-xs transition-colors',
  sm:
    'backdrop-blur-md bg-white/80 dark:bg-slate-900/75 border border-slate-200/80 dark:border-slate-800/80 rounded-lg shadow-xs transition-colors',
  intense:
    'backdrop-blur-lg bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm transition-colors',
  glassmorphism:
    'backdrop-blur-md bg-white/85 dark:bg-slate-900/80 border border-blue-500/15 dark:border-blue-400/15 rounded-xl shadow-xs transition-colors',
  liquid:
    'backdrop-blur-md bg-white/90 dark:bg-slate-900/85 border border-slate-200/70 dark:border-slate-800/70 rounded-xl shadow-sm transition-colors',
  glowing:
    'backdrop-blur-md bg-white/90 dark:bg-slate-900/85 border border-blue-500/20 dark:border-blue-400/20 rounded-xl shadow-xs transition-colors',
  deep:
    'backdrop-blur-xl bg-white/95 dark:bg-slate-950/90 border border-slate-300/80 dark:border-slate-800 rounded-xl shadow-md transition-colors',
};

// Refined, professional hover states (subtle borders and crisp depth rather than loud neon halos)
const glowClasses = {
  blue: 'hover:border-blue-500/40 hover:shadow-xs',
  xp: 'hover:border-amber-500/40 hover:shadow-xs',
  streak: 'hover:border-red-500/40 hover:shadow-xs',
  rank: 'hover:border-indigo-500/40 hover:shadow-xs',
  gold: 'hover:border-amber-400/40 hover:shadow-xs',
  none: 'hover:border-slate-300 dark:hover:border-slate-700',
};

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, hoverGlow = 'none', variant = 'default', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          variantClasses[variant],
          glowClasses[hoverGlow],
          'transition-all duration-200',
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
