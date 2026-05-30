'use client';

import { cn } from '@/lib/utils';

interface SelectPillProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  color?: string;
}

const colorConfig: Record<string, { selected: string; hover: string }> = {
  blue: {
    selected: 'bg-blue-600/30 text-blue-300 border-blue-500/40',
    hover: 'hover:bg-blue-600/10',
  },
  amber: {
    selected: 'bg-amber-600/30 text-amber-300 border-amber-500/40',
    hover: 'hover:bg-amber-600/10',
  },
  purple: {
    selected: 'bg-purple-600/30 text-purple-300 border-purple-500/40',
    hover: 'hover:bg-purple-600/10',
  },
  red: {
    selected: 'bg-red-600/30 text-red-300 border-red-500/40',
    hover: 'hover:bg-red-600/10',
  },
  green: {
    selected: 'bg-emerald-600/30 text-emerald-300 border-emerald-500/40',
    hover: 'hover:bg-emerald-600/10',
  },
  xp: {
    selected: 'bg-amber-600/30 text-amber-300 border-amber-500/40',
    hover: 'hover:bg-amber-600/10',
  },
  streak: {
    selected: 'bg-red-600/30 text-red-300 border-red-500/40',
    hover: 'hover:bg-red-600/10',
  },
  rank: {
    selected: 'bg-purple-600/30 text-purple-300 border-purple-500/40',
    hover: 'hover:bg-purple-600/10',
  },
};

const defaultConfig = {
  selected: 'bg-blue-600/30 text-blue-300 border-blue-500/40',
  hover: 'hover:bg-blue-600/10',
};

export function SelectPill({
  label,
  selected,
  onClick,
  color = 'blue',
}: SelectPillProps) {
  const config = colorConfig[(color || 'blue') as keyof typeof colorConfig] || defaultConfig;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-200',
        selected
          ? config.selected
          : `border-white/10 bg-white/5 text-white/40 ${config.hover} hover:text-white/60`
      )}
    >
      {label}
    </button>
  );
}
