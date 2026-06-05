'use client';

import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface LoadingSkeletonProps {
  type: 'card' | 'text' | 'avatar' | 'chart';
  count?: number;
}

function CardSkeleton() {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-lg bg-white/10" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-1/3 bg-white/10" />
          <Skeleton className="h-5 w-1/2 bg-white/10" />
        </div>
      </div>
      <Skeleton className="h-2 w-full rounded-full bg-white/10" />
    </div>
  );
}

function TextSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-3/4 bg-white/10" />
      <Skeleton className="h-4 w-1/2 bg-white/10" />
      <Skeleton className="h-4 w-2/3 bg-white/10" />
    </div>
  );
}

function AvatarSkeleton() {
  return (
    <div className="flex items-center gap-3">
      <Skeleton className="h-10 w-10 rounded-full bg-white/10" />
      <div className="space-y-1.5">
        <Skeleton className="h-3 w-24 bg-white/10" />
        <Skeleton className="h-2 w-16 bg-white/10" />
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
      <Skeleton className="h-4 w-1/3 bg-white/10" />
      <div className="flex items-end gap-1 h-32">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1 bg-white/10"
            style={{ height: `${Math.random() * 80 + 20}%` }}
          />
        ))}
      </div>
    </div>
  );
}

const skeletonMap = {
  card: CardSkeleton,
  text: TextSkeleton,
  avatar: AvatarSkeleton,
  chart: ChartSkeleton,
};

export function LoadingSkeleton({ type, count = 1 }: LoadingSkeletonProps) {
  const SkeletonComponent = skeletonMap[type];

  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonComponent key={i} />
      ))}
    </div>
  );
}
