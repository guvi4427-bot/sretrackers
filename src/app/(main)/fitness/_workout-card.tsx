'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Edit3, MoreVertical, Clock, SkipForward, Circle, CheckCircle2, Flame, Dumbbell, Timer, X } from 'lucide-react';
import { GlassCard } from '@/components/glass-card';

// ─── Constants ───────────────────────────────────────────────────────────────

const MUSCLE_GROUP_META: Record<string, { label: string; icon: string }> = {
  chest:     { label: 'Chest',      icon: '🫁' },
  back:      { label: 'Back',       icon: '🔙' },
  shoulders: { label: 'Shoulders',  icon: '🦴' },
  arms:      { label: 'Arms',       icon: '💪' },
  legs:      { label: 'Legs',       icon: '🦵' },
  core:      { label: 'Core',       icon: '⚡' },
  full_body: { label: 'Full Body',  icon: '🏋️' },
};

export const WORKOUT_STATUSES = ['planned', 'in_progress', 'done', 'skipped'] as const;
export type WorkoutStatus = typeof WORKOUT_STATUSES[number];

const STATUS_CONFIG: Record<WorkoutStatus, { label: string; color: string; bg: string; border: string; icon: typeof Circle }> = {
  planned:     { label: 'Planned',     color: 'text-blue-400',     bg: 'bg-blue-500/15',        border: 'border-blue-500/30',     icon: Circle },
  in_progress: { label: 'In Progress', color: 'text-amber-400',    bg: 'bg-amber-500/15',       border: 'border-amber-500/30',    icon: Clock },
  done:        { label: 'Done',        color: 'text-emerald-400',  bg: 'bg-emerald-500/15',     border: 'border-emerald-500/30',  icon: CheckCircle2 },
  skipped:     { label: 'Skipped',     color: 'text-zinc-400',     bg: 'bg-zinc-500/10',        border: 'border-zinc-500/20',     icon: SkipForward },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDuration(minutes: number): string {
  if (!minutes) return '0m';
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function cycleStatus(current: WorkoutStatus): WorkoutStatus {
  const idx = WORKOUT_STATUSES.indexOf(current);
  return WORKOUT_STATUSES[(idx + 1) % WORKOUT_STATUSES.length];
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface WorkoutCardProps {
  workout: any;
  status: WorkoutStatus;
  onStatusChange: (id: string, status: WorkoutStatus) => void;
  onEdit: (workout: any) => void;
  onDelete: (id: string) => void;
  onNotesChange: (id: string, notes: string) => void;
  viewMode: 'timeline' | 'board';
  compact?: boolean;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function WorkoutCard({
  workout,
  status,
  onStatusChange,
  onEdit,
  onDelete,
  onNotesChange,
  viewMode,
  compact = false,
}: WorkoutCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [noteDraft, setNoteDraft] = useState(workout.notes || '');
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.done;
  const StatusIcon = cfg.icon;
  const muscle = workout.muscleGroup ? MUSCLE_GROUP_META[workout.muscleGroup] : null;
  const isWeightTraining = workout.workoutType === 'Weight Training';

  // Close menu on outside click
  const handleMenuToggle = useCallback(() => {
    setMenuOpen(prev => !prev);
  }, []);

  // Notes auto-save
  const handleNotesBlur = useCallback(async () => {
    const trimmed = noteDraft.trim();
    const original = workout.notes || '';
    if (trimmed !== original) {
      setSaving(true);
      try {
        await onNotesChange(workout.id, trimmed);
      } finally {
        setSaving(false);
      }
    }
    setEditingNotes(false);
  }, [noteDraft, workout.id, workout.notes, onNotesChange]);

  const handleNotesKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      setNoteDraft(workout.notes || '');
      setEditingNotes(false);
    }
    // Ctrl/Cmd + Enter saves
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      textareaRef.current?.blur();
    }
  }, [workout.notes]);

  return (
    <GlassCard
      variant="default"
      className={`relative group ${viewMode === 'board' ? 'p-3' : 'p-3 sm:p-4'}`}
    >
      {/* Top row: Workout name + status + menu */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-semibold text-foreground truncate">
              {workout.workoutType}
            </h4>

            {/* Status badge — clickable to cycle */}
            <motion.button
              onClick={() => onStatusChange(workout.id, cycleStatus(status))}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border transition-colors ${cfg.bg} ${cfg.border} ${cfg.color}`}
              whileTap={{ scale: 0.92 }}
              title={`Status: ${cfg.label} (click to change)`}
            >
              <StatusIcon size={10} />
              {cfg.label}
            </motion.button>

            {/* Muscle group tag */}
            {muscle && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] bg-blue-500/10 border border-blue-500/20 text-blue-300">
                {muscle.icon} {muscle.label}
              </span>
            )}
          </div>

          {/* Workout type subtitle (if different from title) */}
          {!compact && workout.workoutSplit && (
            <p className="text-[10px] text-muted-foreground/50 mt-0.5 capitalize">
              {workout.workoutSplit.replace(/_/g, ' ')}
            </p>
          )}
        </div>

        {/* ⋮ Menu */}
        <div className="relative shrink-0">
          <button
            onClick={handleMenuToggle}
            className="p-1 rounded-md text-muted-foreground/40 hover:text-foreground hover:bg-accent/50 transition-colors"
          >
            <MoreVertical size={14} />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <>
                {/* Backdrop to close */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMenuOpen(false)}
                />
                <motion.div
                  ref={menuRef}
                  initial={{ opacity: 0, scale: 0.9, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 top-7 z-50 w-36 rounded-xl bg-[#0A0F1E]/95 backdrop-blur-xl border border-white/10 shadow-xl overflow-hidden"
                >
                  <button
                    onClick={() => { setMenuOpen(false); onEdit(workout); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-accent/30 transition-colors"
                  >
                    <Edit3 size={12} className="text-blue-400" /> Edit
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); onDelete(workout.id); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Stats row: Duration, Calories, Sets/Reps/Load */}
      <div className="flex items-center gap-3 flex-wrap text-[11px] text-muted-foreground/70 mb-2">
        <span className="inline-flex items-center gap-1">
          <Timer size={11} className="text-blue-400/60" />
          {formatDuration(workout.duration)}
        </span>
        {workout.estimatedCalories > 0 && (
          <span className="inline-flex items-center gap-1">
            <Flame size={11} className="text-red-400/60" />
            {Math.round(workout.estimatedCalories)} cal
          </span>
        )}
        {isWeightTraining && workout.sets && (
          <span className="inline-flex items-center gap-1">
            <Dumbbell size={11} className="text-amber-400/60" />
            {workout.sets} × {workout.reps} @ {workout.loadKg}kg
          </span>
        )}
      </div>

      {/* Date (shown in board view only) */}
      {viewMode === 'board' && workout.date && (
        <p className="text-[10px] text-muted-foreground/40 mb-1">
          {workout.date}
        </p>
      )}

      {/* Inline Notes */}
      {!compact && (
        <div className="mt-1">
          {editingNotes ? (
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={noteDraft}
                onChange={e => setNoteDraft(e.target.value)}
                onBlur={handleNotesBlur}
                onKeyDown={handleNotesKeyDown}
                placeholder="Add notes..."
                rows={2}
                autoFocus
                className="w-full bg-accent/30 border border-blue-500/20 rounded-lg px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/30 resize-none focus:outline-none focus:border-blue-500/40"
              />
              {saving && (
                <span className="absolute top-1 right-2 text-[9px] text-blue-400/60">Saving...</span>
              )}
              <p className="text-[9px] text-muted-foreground/30 mt-0.5">
                Ctrl+Enter to save · Esc to cancel
              </p>
            </div>
          ) : (
            <button
              onClick={() => { setNoteDraft(workout.notes || ''); setEditingNotes(true); }}
              className="w-full text-left text-xs text-muted-foreground/50 hover:text-muted-foreground/80 hover:bg-accent/20 rounded-lg px-2 py-1.5 -mx-2 transition-colors min-h-[24px]"
            >
              {workout.notes ? (
                <span className="text-muted-foreground/70 whitespace-pre-wrap">{workout.notes}</span>
              ) : (
                <span className="italic">+ Add notes</span>
              )}
            </button>
          )}
        </div>
      )}
    </GlassCard>
  );
}
