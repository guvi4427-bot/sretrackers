'use client';

import { motion } from 'framer-motion';
import { Filter, ArrowUpDown, X } from 'lucide-react';

// ─── Constants ───────────────────────────────────────────────────────────────

const MUSCLE_GROUPS = ['all', 'chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'full_body'] as const;

const MUSCLE_LABELS: Record<string, string> = {
  all: 'All Muscles',
  chest: 'Chest',
  back: 'Back',
  shoulders: 'Shoulders',
  arms: 'Arms',
  legs: 'Legs',
  core: 'Core',
  full_body: 'Full Body',
};

const WORKOUT_TYPES = ['all', 'Running', 'Walking', 'Cycling', 'Swimming', 'Weight Training', 'HIIT', 'Yoga', 'Pilates', 'Dance', 'Boxing', 'Jump Rope', 'Other'] as const;

const STATUS_OPTIONS = ['all', 'planned', 'in_progress', 'done', 'skipped'] as const;

const STATUS_LABELS: Record<string, string> = {
  all: 'All Status',
  planned: 'Planned',
  in_progress: 'In Progress',
  done: 'Done',
  skipped: 'Skipped',
};

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'longest', label: 'Longest Duration' },
  { value: 'shortest', label: 'Shortest Duration' },
] as const;

export type SortOption = typeof SORT_OPTIONS[number]['value'];

// ─── Types ───────────────────────────────────────────────────────────────────

export interface FilterState {
  muscleGroup: string;
  workoutType: string;
  status: string;
  dateRange: string; // 'all' | '7d' | '14d' | '30d'
}

// ─── Component ───────────────────────────────────────────────────────────────

interface WorkoutFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
  totalWorkouts: number;
  filteredCount: number;
}

export function WorkoutFilters({
  filters,
  onFiltersChange,
  sort,
  onSortChange,
  totalWorkouts,
  filteredCount,
}: WorkoutFiltersProps) {
  const hasActiveFilters =
    filters.muscleGroup !== 'all' ||
    filters.workoutType !== 'all' ||
    filters.status !== 'all' ||
    filters.dateRange !== 'all';

  const updateFilter = (key: keyof FilterState, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({ muscleGroup: 'all', workoutType: 'all', status: 'all', dateRange: 'all' });
  };

  return (
    <div className="space-y-3">
      {/* Filter pills row — horizontally scrollable on mobile */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <Filter size={13} className="text-muted-foreground/50 shrink-0" />

        {/* Muscle Group pills */}
        <div className="flex items-center gap-1 shrink-0">
          {MUSCLE_GROUPS.map(mg => (
            <button
              key={mg}
              onClick={() => updateFilter('muscleGroup', mg)}
              className={`px-2 py-0.5 rounded-full text-[10px] font-medium border transition-all whitespace-nowrap ${
                filters.muscleGroup === mg
                  ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                  : 'bg-accent/30 border-border text-muted-foreground/60 hover:border-blue-500/20'
              }`}
            >
              {MUSCLE_LABELS[mg]}
            </button>
          ))}
        </div>

        <div className="w-px h-4 bg-border/50 shrink-0" />

        {/* Status pills */}
        <div className="flex items-center gap-1 shrink-0">
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => updateFilter('status', s)}
              className={`px-2 py-0.5 rounded-full text-[10px] font-medium border transition-all whitespace-nowrap ${
                filters.status === s
                  ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                  : 'bg-accent/30 border-border text-muted-foreground/60 hover:border-blue-500/20'
              }`}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        <div className="w-px h-4 bg-border/50 shrink-0" />

        {/* Date range pills */}
        {(['all', '7d', '14d', '30d'] as const).map(dr => (
          <button
            key={dr}
            onClick={() => updateFilter('dateRange', dr)}
            className={`px-2 py-0.5 rounded-full text-[10px] font-medium border transition-all whitespace-nowrap shrink-0 ${
              filters.dateRange === dr
                ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                : 'bg-accent/30 border-border text-muted-foreground/60 hover:border-blue-500/20'
            }`}
          >
            {dr === 'all' ? 'All Time' : `Last ${dr.replace('d', '')}d`}
          </button>
        ))}

        {/* Clear filters */}
        {hasActiveFilters && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={clearFilters}
            className="shrink-0 p-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
          >
            <X size={11} />
          </motion.button>
        )}
      </div>

      {/* Second row: Workout type dropdown + Sort */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Workout Type dropdown */}
        <select
          value={filters.workoutType}
          onChange={e => updateFilter('workoutType', e.target.value)}
          className="bg-accent/30 border border-border text-foreground rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-blue-500/30"
        >
          {WORKOUT_TYPES.map(wt => (
            <option key={wt} value={wt} className="bg-[#0A0F1E]">
              {wt === 'all' ? 'All Workout Types' : wt}
            </option>
          ))}
        </select>

        {/* Sort dropdown */}
        <div className="flex items-center gap-1.5">
          <ArrowUpDown size={11} className="text-muted-foreground/40" />
          <select
            value={sort}
            onChange={e => onSortChange(e.target.value as SortOption)}
            className="bg-accent/30 border border-border text-foreground rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-blue-500/30"
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value} className="bg-[#0A0F1E]">
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Count indicator */}
        {hasActiveFilters && (
          <span className="text-[10px] text-muted-foreground/40 ml-auto">
            {filteredCount} of {totalWorkouts} workouts
          </span>
        )}
      </div>
    </div>
  );
}
