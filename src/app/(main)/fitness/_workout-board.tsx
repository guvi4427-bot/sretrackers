'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell } from 'lucide-react';
import { WorkoutCard, WorkoutStatus, WORKOUT_STATUSES } from './_workout-card';

// ─── Column Config ───────────────────────────────────────────────────────────

const COLUMN_CONFIG: Record<WorkoutStatus, { label: string; accent: string; borderAccent: string; headerBg: string; headerColor: string; emptyIcon: string }> = {
  planned: {
    label: 'Planned',
    accent: 'border-t-blue-500/40',
    borderAccent: 'border-blue-500/10',
    headerBg: 'bg-blue-500/10',
    headerColor: 'text-blue-400',
    emptyIcon: '📋',
  },
  in_progress: {
    label: 'In Progress',
    accent: 'border-t-amber-500/40',
    borderAccent: 'border-amber-500/10',
    headerBg: 'bg-amber-500/10',
    headerColor: 'text-amber-400',
    emptyIcon: '⏳',
  },
  done: {
    label: 'Done',
    accent: 'border-t-emerald-500/40',
    borderAccent: 'border-emerald-500/10',
    headerBg: 'bg-emerald-500/10',
    headerColor: 'text-emerald-400',
    emptyIcon: '✅',
  },
  skipped: {
    label: 'Skipped',
    accent: 'border-t-zinc-500/30',
    borderAccent: 'border-zinc-500/10',
    headerBg: 'bg-zinc-500/10',
    headerColor: 'text-zinc-400',
    emptyIcon: '⏭️',
  },
};

// ─── Types ───────────────────────────────────────────────────────────────────

interface WorkoutBoardProps {
  workouts: any[];
  statusMap: Record<string, WorkoutStatus>;
  onStatusChange: (id: string, status: WorkoutStatus) => void;
  onEdit: (workout: any) => void;
  onDelete: (id: string) => void;
  onNotesChange: (id: string, notes: string) => void;
}

// ─── Animation Variants ──────────────────────────────────────────────────────

const columnVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 6 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
};

// ─── Component ───────────────────────────────────────────────────────────────

export function WorkoutBoard({
  workouts,
  statusMap,
  onStatusChange,
  onEdit,
  onDelete,
  onNotesChange,
}: WorkoutBoardProps) {
  // Group workouts by their current status
  const columns = WORKOUT_STATUSES.map(status => {
    const items = workouts.filter(w => (statusMap[w.id] || 'done') === status);
    return { status, items };
  });

  const totalWorkouts = workouts.length;

  if (totalWorkouts === 0) {
    return (
      <div className="text-center py-12">
        <Dumbbell size={32} className="text-muted-foreground/20 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground/50">No workouts found</p>
        <p className="text-xs text-muted-foreground/30 mt-1">Log a workout to see it here</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {columns.map(({ status, items }) => {
        const cfg = COLUMN_CONFIG[status];

        return (
          <div
            key={status}
            className={`rounded-xl border-t-2 ${cfg.accent} border border-border/50 bg-accent/5 min-h-[200px]`}
          >
            {/* Column Header */}
            <div className={`px-3 py-2 rounded-t-lg ${cfg.headerBg} flex items-center justify-between`}>
              <span className={`text-xs font-semibold ${cfg.headerColor}`}>
                {cfg.label}
              </span>
              <span className="text-[10px] text-muted-foreground/40 bg-accent/30 px-1.5 py-0.5 rounded-full">
                {items.length}
              </span>
            </div>

            {/* Column Body — cards */}
            <motion.div
              className="p-2 space-y-2"
              variants={columnVariants}
              initial="hidden"
              animate="show"
            >
              {items.length === 0 ? (
                <div className="text-center py-8">
                  <span className="text-lg">{cfg.emptyIcon}</span>
                  <p className="text-[10px] text-muted-foreground/30 mt-1">No workouts</p>
                </div>
              ) : (
                items.map((w: any) => (
                  <motion.div
                    key={w.id}
                    variants={cardVariants}
                    layout
                    className="cursor-grab active:cursor-grabbing"
                  >
                    <WorkoutCard
                      workout={w}
                      status={status}
                      onStatusChange={onStatusChange}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onNotesChange={onNotesChange}
                      viewMode="board"
                      compact
                    />
                  </motion.div>
                ))
              )}
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
