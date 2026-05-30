'use client';

import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Crown, UserPlus, UserCheck } from 'lucide-react';
import { useState } from 'react';

interface LeaderboardRowProps {
  rank: number;
  name: string;
  score: number;
  avatarUrl?: string | null;
  isOwnEntry?: boolean;
  followStatus?: 'following' | 'not_following' | 'self';
}

const rankStyles: Record<number, { bg: string; text: string; icon: string }> = {
  1: { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: '🥇' },
  2: { bg: 'bg-slate-400/20', text: 'text-slate-300', icon: '🥈' },
  3: { bg: 'bg-orange-700/20', text: 'text-orange-400', icon: '🥉' },
};

export function LeaderboardRow({
  rank,
  name,
  score,
  avatarUrl,
  isOwnEntry = false,
  followStatus = 'not_following',
}: LeaderboardRowProps) {
  const [isFollowing, setIsFollowing] = useState(followStatus === 'following');
  const isTop3 = rank <= 3;
  const style = isTop3 ? rankStyles[rank] : null;

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200',
        isOwnEntry
          ? 'bg-blue-500/10 border border-blue-500/20'
          : 'hover:bg-white/5',
        isTop3 && !isOwnEntry && 'bg-white/[0.02]'
      )}
    >
      {/* Rank */}
      <div
        className={cn(
          'flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold shrink-0',
          style ? `${style.bg} ${style.text}` : 'bg-white/5 text-white/40'
        )}
      >
        {isTop3 ? style!.icon : rank}
      </div>

      {/* Avatar */}
      <Avatar className="h-9 w-9 shrink-0">
        {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
        <AvatarFallback className="bg-white/10 text-white/60 text-xs">
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* Name & Score */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-sm font-medium truncate',
          isOwnEntry ? 'text-blue-300' : 'text-white'
        )}>
          {name}
          {isOwnEntry && (
            <span className="ml-1.5 text-[10px] font-normal text-blue-400/60">(You)</span>
          )}
        </p>
        <p className="text-xs text-white/40 tabular-nums">{score.toLocaleString()} XP</p>
      </div>

      {/* Follow Button */}
      {followStatus !== 'self' && (
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'h-8 rounded-lg text-xs gap-1 shrink-0',
            isFollowing
              ? 'text-white/40 hover:text-white/60'
              : 'text-blue-400 hover:text-blue-300'
          )}
          onClick={() => setIsFollowing(!isFollowing)}
        >
          {isFollowing ? (
            <>
              <UserCheck size={14} />
              <span className="hidden sm:inline">Following</span>
            </>
          ) : (
            <>
              <UserPlus size={14} />
              <span className="hidden sm:inline">Follow</span>
            </>
          )}
        </Button>
      )}
    </div>
  );
}
