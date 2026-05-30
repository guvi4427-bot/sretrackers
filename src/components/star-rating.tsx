'use client';

import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';
import { useState } from 'react';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 14,
  md: 18,
  lg: 24,
};

const gapMap = {
  sm: 'gap-0.5',
  md: 'gap-1',
  lg: 'gap-1.5',
};

export function StarRating({
  value,
  onChange,
  readOnly = false,
  size = 'md',
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const displayValue = hoverValue ?? value;
  const iconSize = sizeMap[size];

  return (
    <div
      className={cn('inline-flex items-center', gapMap[size])}
      onMouseLeave={() => !readOnly && setHoverValue(null)}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= displayValue;
        return (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            className={cn(
              'transition-colors duration-150',
              readOnly ? 'cursor-default' : 'cursor-pointer',
              isFilled ? 'text-amber-400' : 'text-white/20'
            )}
            onMouseEnter={() => !readOnly && setHoverValue(star)}
            onClick={() => !readOnly && onChange?.(star === value ? 0 : star)}
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
          >
            <Star
              size={iconSize}
              className={cn(
                'transition-all duration-150',
                isFilled ? 'fill-amber-400' : 'fill-transparent'
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
