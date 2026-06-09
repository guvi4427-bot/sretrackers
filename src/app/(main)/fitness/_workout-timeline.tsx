'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Plus, Dumbbell, Flame, Timer } from 'lucide-react';
import { GlassCard } from '@/components/glass-card';
import { WorkoutCard, WorkoutStatus } from './_workout-card';

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

function formatDuration(minutes: number): string {
  if (!minutes) return '0m';
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface DateGroup {
  date: string;
  label: string;
  sublabel: string;
  workouts: any[];
  totalCal: number;
  totalMin: number;
}

interface WorkoutTimelineProps {
  groups: DateGroup[];
  statusMap: Record<string, WorkoutStatus>;
  expandedGroups: Record<string, boolean>;
  onToggleGroup: (date: string) => void;
  onStatusChange: (id: string, status: WorkoutStatus) => void;
  onEdit: (workout: any) => void;
  onDelete: (id: string) => void;
  onNotesChange: (id: string, notes: string) => void;
  onAddWorkout: (date: string) => void;
  allWorkouts?: any[];
}

// ─── Animation Variants ──────────────────────────────────────────────────────

const groupVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
};

// ─── Component ───────────────────────────────────────────────────────────────

export function WorkoutTimeline({
  groups,
  statusMap,
  expandedGroups,
  onToggleGroup,
  onStatusChange,
  onEdit,
  onDelete,
  onNotesChange,
  onAddWorkout,
  allWorkouts = [],
}: WorkoutTimelineProps) {
  if (groups.length === 0) {
    return (
      <div className="text-center py-12">
        <Dumbbell size={32} className="text-muted-foreground/15 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground/40">No workouts found</p>
        <p className="text-xs text-muted-foreground/20 mt-1">Log a workout to see it here</p>
      </div>
    );
  }

  // Find previous workout for a given workout (same type + muscle group, earlier date)
  const findPreviousWorkout = (workout: any): any | null => {
    if (!workout.workoutType || !workout.muscleGroup) return null;
    const prev = allWorkouts
      .filter((w: any) =>
        w.id !== workout.id &&
        w.workoutType === workout.workoutType &&
        w.muscleGroup === workout.muscleGroup &&
        w.sets && w.reps && w.loadKg &&
        (w.date || '') < (workout.date || '')
      )
      .sort((a: any, b: any) => (b.date || '').localeCompare(a.date || ''));
    return prev[0] || null;
  };

  return (
    <div className="space-y-4">
      {groups.map(group => {
        const isExpanded = expandedGroups[group.date] ?? true;

        return (
          <motion.div
            key={group.date}
            variants={groupVariants}
            initial="hidden"
            animate="show"
          >
            {/* Group Header — Notion-style */}
            <button
              onClick={() => onToggleGroup(group.date)}
              className="w-full flex items-center gap-3 px-1 py-2 group/header"
            >
              {/* Expand/collapse chevron */}
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-muted-foreground/25 group-hover/header:text-muted-foreground/50 transition-colors"
              >
                <ChevronDown size={14} />
              </motion.div>

              {/* Date label — Notion-style prominent */}
              <div className="flex-1 text-left">
                <span className="text-sm font-semibold text-foreground">{group.label}</span>
                <span className="text-[10px] text-muted-foreground/30 ml-2">{group.sublabel}</span>
              </div>

              {/* Stats summary — pill style */}
              <div className="flex items-center gap-2 text-[10px]">
                <span className="text-muted-foreground/40 bg-accent/20 px-2 py-0.5 rounded-full">
                  {group.workouts.length} workout{group.workouts.length !== 1 ? 's' : ''}
                </span>
                <span className="inline-flex items-center gap-0.5 text-amber-400/60 bg-accent/20 px-2 py-0.5 rounded-full">
                  <Timer size={9} /> {formatDuration(group.totalMin)}
                </span>
                {group.totalCal > 0 && (
                  <span className="inline-flex items-center gap-0.5 text-red-400/60 bg-accent/20 px-2 py-0.5 rounded-full">
                    <Flame size={9} /> {Math.round(group.totalCal)} cal
                  </span>
                )}
              </div>
            </button>

            {/* Collapsible workout cards — Notion-style left border line */}
            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <motion.div
                    className="pl-5 border-l-2 border-blue-500/8 ml-1.5 space-y-2 mb-2"
                    variants={groupVariants}
                    initial="hidden"
                    animate="show"
                  >
                    {group.workouts.map((w: any) => (
                      <motion.div key={w.id} variants={cardVariants}>
                        <WorkoutCard
                          workout={w}
                          status={statusMap[w.id] || 'done'}
                          onStatusChange={onStatusChange}
                          onEdit={onEdit}
                          onDelete={onDelete}
                          onNotesChange={onNotesChange}
                          previousWorkout={findPreviousWorkout(w)}
                        />
                      </motion.div>
                    ))}

                    {/* + New Workout button — Notion-style */}
                    <motion.div variants={cardVariants}>
                      <button
                        onClick={() => onAddWorkout(group.date)}
                        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-blue-500/10 text-blue-400/40 hover:text-blue-400 hover:border-blue-500/25 hover:bg-blue-500/5 transition-all text-xs"
                      >
                        <Plus size={13} />
                        New Workout
                      </button>
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
