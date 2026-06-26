'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Dumbbell } from 'lucide-react';
import { GlassCard } from '@/components/glass-card';
import { WorkoutStatus } from './_workout-card';
import { WorkoutFilters, FilterState, SortOption } from './_workout-filters';
import { WorkoutTimeline, DateGroup } from './_workout-timeline';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getLocalDateStr(date?: Date): string {
  const d = date || new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getRelativeDateLabel(dateStr: string, today: string): { label: string; sublabel: string } {
  if (dateStr === today) return { label: 'Today', sublabel: formatDateShort(dateStr) };
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = getLocalDateStr(yesterday);
  if (dateStr === yStr) return { label: 'Yesterday', sublabel: formatDateShort(dateStr) };

  const date = new Date(dateStr + 'T00:00:00');
  const todayDate = new Date(today + 'T00:00:00');
  const daysDiff = Math.round((todayDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDiff < 7 && daysDiff > 0) {
    return { label: DAY_NAMES[date.getDay()], sublabel: formatDateShort(dateStr) };
  }
  return { label: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), sublabel: date.toLocaleDateString(undefined, { year: 'numeric' }) };
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface WorkoutTrackerProps {
  workouts: any[];
  onDeleteWorkout: (id: string) => void;
  onAddWorkout: (date: string) => void;
  onEditWorkout: (workout: any) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  allWorkouts?: any[];
}

// ─── Component ───────────────────────────────────────────────────────────────

export function WorkoutTracker({
  workouts,
  onDeleteWorkout,
  onAddWorkout,
  onEditWorkout,
  onUpdateNotes,
  allWorkouts,
}: WorkoutTrackerProps) {
  const today = getLocalDateStr();

  // ── Status map (client-side only — persists during session) ──
  // Workouts with [PLANNED] in notes default to 'planned', otherwise 'done'
  const [statusMap, setStatusMap] = useState<Record<string, WorkoutStatus>>({});

  // Initialize status for workouts that have [PLANNED] in notes
  const initializedStatusMap = useMemo(() => {
    const map = { ...statusMap };
    workouts.forEach(w => {
      if (!map[w.id] && w.notes && typeof w.notes === 'string' && w.notes.includes('[PLANNED]')) {
        map[w.id] = 'planned';
      }
    });
    return map;
  }, [statusMap, workouts]);

  // ── Expanded groups ──
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  // ── Filters & Sort ──
  const [filters, setFilters] = useState<FilterState>({
    muscleGroup: 'all',
    workoutType: 'all',
    status: 'all',
    dateRange: 'all',
  });
  const [sort, setSort] = useState<SortOption>('newest');

  // ── Status change handler ──
  const handleStatusChange = useCallback((id: string, status: WorkoutStatus) => {
    setStatusMap(prev => ({ ...prev, [id]: status }));
  }, []);

  // ── Toggle group expand/collapse ──
  const handleToggleGroup = useCallback((date: string) => {
    setExpandedGroups(prev => ({ ...prev, [date]: !prev[date] }));
  }, []);

  // ── Apply filters ──
  const filteredWorkouts = useMemo(() => {
    let result = [...workouts];

    // Muscle group filter
    if (filters.muscleGroup !== 'all') {
      result = result.filter(w => w.muscleGroup === filters.muscleGroup);
    }

    // Workout type filter
    if (filters.workoutType !== 'all') {
      result = result.filter(w => w.workoutType === filters.workoutType);
    }

    // Status filter
    if (filters.status !== 'all') {
      result = result.filter(w => (initializedStatusMap[w.id] || 'done') === filters.status);
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const days = parseInt(filters.dateRange);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      const cutoffStr = getLocalDateStr(cutoff);
      result = result.filter(w => w.date >= cutoffStr);
    }

    // Sort
    switch (sort) {
      case 'newest':
        result.sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.createdAt || '').localeCompare(a.createdAt || ''));
        break;
      case 'oldest':
        result.sort((a, b) => (a.date || '').localeCompare(b.date || '') || (a.createdAt || '').localeCompare(b.createdAt || ''));
        break;
      case 'longest':
        result.sort((a, b) => (b.duration || 0) - (a.duration || 0));
        break;
      case 'shortest':
        result.sort((a, b) => (a.duration || 0) - (b.duration || 0));
        break;
    }

    return result;
  }, [workouts, filters, sort, initializedStatusMap]);

  // ── Group by date for timeline ──
  const dateGroups: DateGroup[] = useMemo(() => {
    const groupMap = new Map<string, any[]>();

    filteredWorkouts.forEach(w => {
      const dateKey = w.date || today;
      if (!groupMap.has(dateKey)) groupMap.set(dateKey, []);
      groupMap.get(dateKey)!.push(w);
    });

    // Build groups sorted by date (same order as filteredWorkouts sort)
    const sortedDates = Array.from(groupMap.keys()).sort((a, b) => {
      if (sort === 'newest') return b.localeCompare(a);
      if (sort === 'oldest') return a.localeCompare(b);
      return b.localeCompare(a); // default newest first for timeline
    });

    return sortedDates.map(dateStr => {
      const groupWorkouts = groupMap.get(dateStr) || [];
      const { label, sublabel } = getRelativeDateLabel(dateStr, today);
      return {
        date: dateStr,
        label,
        sublabel,
        workouts: groupWorkouts,
        totalCal: groupWorkouts.reduce((a: number, w: any) => a + (w.estimatedCalories || 0), 0),
        totalMin: groupWorkouts.reduce((a: number, w: any) => a + (w.duration || 0), 0),
      };
    });
  }, [filteredWorkouts, sort, today]);

  // ── Summary stats ──
  const summaryStats = useMemo(() => {
    const totalCal = filteredWorkouts.reduce((a: number, w: any) => a + (w.estimatedCalories || 0), 0);
    const totalMin = filteredWorkouts.reduce((a: number, w: any) => a + (w.duration || 0), 0);
    const uniqueDays = new Set(filteredWorkouts.map(w => w.date)).size;
    return { totalCal, totalMin, uniqueDays, totalWorkouts: filteredWorkouts.length };
  }, [filteredWorkouts]);

  return (
    <div className="space-y-4">
      {/* Header: Title + Summary */}
      <GlassCard variant="glowing" className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Dumbbell size={18} className="text-blue-400" />
          <h3 className="text-sm font-semibold text-foreground">Workout Tracker</h3>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { value: summaryStats.totalWorkouts, label: 'Workouts', color: 'text-foreground' },
            { value: summaryStats.uniqueDays, label: 'Days', color: 'text-foreground' },
            { value: Math.round(summaryStats.totalCal), label: 'Cal Burned', color: 'text-amber-400' },
            { value: summaryStats.totalMin >= 60 ? `${Math.floor(summaryStats.totalMin / 60)}h ${summaryStats.totalMin % 60}m` : `${summaryStats.totalMin}m`, label: 'Duration', color: 'text-blue-400' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.35 }}
              className="text-center p-1.5 rounded-lg bg-accent/20"
            >
              <p className={`text-xs font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-[9px] text-muted-foreground/50">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </GlassCard>

      {/* Filters */}
      <WorkoutFilters
        filters={filters}
        onFiltersChange={setFilters}
        sort={sort}
        onSortChange={setSort}
        totalWorkouts={workouts.length}
        filteredCount={filteredWorkouts.length}
      />

      {/* Timeline View */}
      <WorkoutTimeline
        groups={dateGroups}
        statusMap={initializedStatusMap}
        expandedGroups={expandedGroups}
        onToggleGroup={handleToggleGroup}
        onStatusChange={handleStatusChange}
        onEdit={onEditWorkout}
        onDelete={onDeleteWorkout}
        onNotesChange={onUpdateNotes}
        onAddWorkout={onAddWorkout}
        allWorkouts={allWorkouts || workouts}
      />
    </div>
  );
}

