'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Plus, Trash2, Sparkles, Check, Play, Pause, RotateCcw, Send, Bot, Loader2,
  ChevronDown, ChevronRight, Moon, MessageSquare, AlertTriangle, CircleDashed,
  X, SkipForward, Clock, ArrowUpDown, Calendar, Zap, Flag
} from 'lucide-react';
import { GlassCard } from '@/components/glass-card';
import { AIMessage } from '@/components/ai-message';
import { SelectPill } from '@/components/select-pill';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserStore } from '@/stores/user-store';
import { t } from '@/lib/i18n';

const CATEGORIES = ['work', 'personal', 'health', 'learning', 'other'];
const PRIORITIES = ['low', 'medium', 'high'] as const;
type Priority = typeof PRIORITIES[number];

// ── Helper functions ──

function sortByTime(tasks: any[]): any[] {
  return [...tasks].sort((a, b) => {
    if (a.fromTime && b.fromTime) return a.fromTime.localeCompare(b.fromTime);
    if (a.fromTime) return -1;
    if (b.fromTime) return 1;
    return 0;
  });
}

function formatTime(time: string): string {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${m.toString().padStart(2, '0')} ${ampm}`;
}

function isAfter7PM(): boolean {
  const now = new Date();
  return now.getHours() >= 19;
}

function getLocalDateStr(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ── StatusChip ──

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-slate-500/15 text-slate-400 border-slate-500/25',
  in_progress: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  completed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  partially_completed: 'bg-orange-500/15 text-orange-400 border-orange-500/25',
  missed: 'bg-red-500/15 text-red-400 border-red-500/25',
  skipped: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/25',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Planned',
  in_progress: 'In Progress',
  completed: 'Done',
  partially_completed: 'Partial',
  missed: 'Missed',
  skipped: 'Skipped',
};

function StatusChip({ status, onClick, readOnly }: { status: string; onClick?: () => void; readOnly?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={readOnly}
      className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border transition-colors ${STATUS_STYLES[status] || STATUS_STYLES.pending} ${onClick ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
    >
      {status === 'pending' && <CircleDashed size={9} />}
      {status === 'in_progress' && <Play size={8} />}
      {status === 'completed' && <Check size={9} />}
      {status === 'partially_completed' && <CircleDashed size={9} />}
      {status === 'missed' && <AlertTriangle size={9} />}
      {status === 'skipped' && <SkipForward size={9} />}
      {STATUS_LABELS[status] || status}
    </button>
  );
}

// ── PriorityChip ──

const PRIORITY_STYLES: Record<string, string> = {
  low: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/25',
  medium: 'bg-sky-500/15 text-sky-400 border-sky-500/25',
  high: 'bg-red-500/15 text-red-400 border-red-500/25',
};

const PRIORITY_LABELS: Record<string, string> = {
  low: 'Low',
  medium: 'Med',
  high: 'High',
};

function PriorityChip({ priority, onClick, readOnly }: { priority: string; onClick?: () => void; readOnly?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={readOnly}
      className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border transition-colors ${PRIORITY_STYLES[priority] || PRIORITY_STYLES.medium} ${onClick ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
    >
      <Flag size={8} />
      {PRIORITY_LABELS[priority] || 'Med'}
    </button>
  );
}

// ── TaskTableHeader ──

function TaskTableHeader() {
  return (
    <div className="grid grid-cols-[28px_1fr_80px_56px_64px_90px_36px] sm:grid-cols-[28px_1fr_90px_60px_70px_100px_36px] gap-2 px-3 py-2 border-b border-border/30 items-center text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">
      <span />
      <span>Task</span>
      <span>Status</span>
      <span>Priority</span>
      <span>Category</span>
      <span>Time</span>
      <span>XP</span>
    </div>
  );
}

// ── ExpandedTaskDetails ──

function ExpandedTaskDetails({
  task,
  currentTab,
  onUpdateTaskStatus,
  onSetReflectionModal,
  onDeleteTask,
  onRefresh,
}: {
  task: any;
  currentTab: 'today' | 'tomorrow';
  onUpdateTaskStatus: (taskId: string, newStatus: string, currentTab: 'today' | 'tomorrow') => void;
  onSetReflectionModal: (modal: { taskId: string; title: string; status: string } | null) => void;
  onDeleteTask: (id: string, currentTab: 'today' | 'tomorrow') => void;
  onRefresh: (tab: 'today' | 'tomorrow') => void;
}) {
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDesc, setEditDesc] = useState(task.description || '');
  const [editReflection, setEditReflection] = useState(task.reflectionNote || '');
  const [showReflectionInput, setShowReflectionInput] = useState(false);
  const isMissed = task.status === 'missed';
  const isPartial = task.status === 'partially_completed';
  const isSkipped = task.status === 'skipped';

  async function saveField(field: string, value: string) {
    if (!value.trim() && field !== 'description') return;
    try {
      await fetch('/api/time/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: task.id, [field]: value.trim() }),
      });
      onRefresh(currentTab);
    } catch {}
  }

  async function saveReflection() {
    if (!editReflection.trim()) return;
    try {
      await fetch('/api/time/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: task.id, reflectionNote: editReflection.trim() }),
      });
      toast.success('Reflection saved');
      onRefresh(currentTab);
      setShowReflectionInput(false);
    } catch {}
  }

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden"
    >
      <div className="px-3 pb-3 pt-2 border-t border-border/20 space-y-3">
        {/* Description */}
        <div>
          <label className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider">Description</label>
          <Textarea
            value={editDesc}
            onChange={e => setEditDesc(e.target.value)}
            onBlur={() => saveField('description', editDesc)}
            placeholder="Add a description..."
            className="bg-accent/50 border-border/30 text-foreground text-xs mt-1 min-h-[48px] resize-none"
            rows={2}
          />
        </div>

        {/* Reflection */}
        {(isMissed || isPartial || isSkipped || task.reflectionNote) && (
          <div>
            <label className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider">
              {isMissed || isSkipped ? 'What went wrong?' : 'Reflection'}
            </label>
            {task.reflectionNote && !showReflectionInput ? (
              <div
                className="mt-1 text-xs text-amber-400/80 italic cursor-pointer hover:text-amber-400 transition-colors px-2 py-1.5 bg-amber-500/5 rounded-lg border border-amber-500/10"
                onClick={() => { setEditReflection(task.reflectionNote || ''); setShowReflectionInput(true); }}
              >
                &ldquo;{task.reflectionNote}&rdquo;
                <span className="text-[9px] text-muted-foreground/40 ml-1 not-italic">(click to edit)</span>
              </div>
            ) : (
              <div className="mt-1 flex gap-2">
                <Input
                  value={editReflection}
                  onChange={e => setEditReflection(e.target.value)}
                  placeholder="What went wrong? (e.g., Unexpected assignment, Distraction...)"
                  className="bg-accent/50 border-border/30 text-foreground text-xs flex-1"
                  onKeyDown={e => { if (e.key === 'Enter') saveReflection(); }}
                />
                <Button onClick={saveReflection} size="sm" className="gradient-blue text-xs h-8 shrink-0">Save</Button>
              </div>
            )}
            {!task.reflectionNote && !showReflectionInput && (isMissed || isPartial || isSkipped) && (
              <button
                onClick={() => setShowReflectionInput(true)}
                className="mt-1 text-[10px] text-amber-400/60 hover:text-amber-400 flex items-center gap-1 transition-colors"
              >
                <MessageSquare size={10} /> Add reflection
              </button>
            )}
          </div>
        )}

        {/* Meta row */}
        <div className="flex items-center gap-3 flex-wrap">
          {task.xpAwarded > 0 && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25 flex items-center gap-1">
              <Zap size={8} /> +{task.xpAwarded} XP
            </span>
          )}
          {task.completedAt && (
            <span className="text-[10px] text-muted-foreground/40">
              Completed {new Date(task.completedAt).toLocaleString()}
            </span>
          )}
          {task.createdAt && (
            <span className="text-[10px] text-muted-foreground/30">
              Created {new Date(task.createdAt).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 pt-1">
          {task.status !== 'completed' && (
            <>
              <button
                onClick={() => onUpdateTaskStatus(task.id, 'completed', currentTab)}
                className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/20 transition-colors flex items-center gap-1"
              >
                <Check size={10} /> Done
              </button>
              <button
                onClick={async () => {
                  await onUpdateTaskStatus(task.id, 'partially_completed', currentTab);
                  if (!task.reflectionNote) onSetReflectionModal({ taskId: task.id, title: task.title, status: 'partially_completed' });
                }}
                className="text-[10px] px-2.5 py-1 rounded-full bg-orange-500/15 hover:bg-orange-500/25 text-orange-400 border border-orange-500/20 transition-colors flex items-center gap-1"
              >
                <CircleDashed size={10} /> Partial
              </button>
              <button
                onClick={async () => {
                  await onUpdateTaskStatus(task.id, 'missed', currentTab);
                  if (!task.reflectionNote) onSetReflectionModal({ taskId: task.id, title: task.title, status: 'missed' });
                }}
                className="text-[10px] px-2.5 py-1 rounded-full bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/20 transition-colors flex items-center gap-1"
              >
                <AlertTriangle size={10} /> Missed
              </button>
            </>
          )}
          <button
            onClick={() => onDeleteTask(task.id, currentTab)}
            className="text-[10px] px-2.5 py-1 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400/60 hover:text-red-400 border border-red-500/15 transition-colors flex items-center gap-1 ml-auto"
          >
            <Trash2 size={10} /> Delete
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── InlineAddTask ──

function InlineAddTask({
  defaultDate,
  today,
  tomorrow,
  onRefresh,
}: {
  defaultDate: 'today' | 'tomorrow';
  today: string;
  tomorrow: string;
  onRefresh: (tab: 'today' | 'tomorrow') => void;
}) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [fromTime, setFromTime] = useState('');
  const [toTime, setToTime] = useState('');
  const [isProductive, setIsProductive] = useState(true);
  const [autoFill, setAutoFill] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleAdd() {
    if (!title.trim()) return;
    const dateValue = defaultDate === 'tomorrow' ? tomorrow : today;
    try {
      const r = await fetch('/api/time/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title,
          category: category || 'other',
          priority,
          isProductive,
          date: dateValue,
          fromTime: fromTime || undefined,
          toTime: toTime || undefined,
        }),
      });
      if (r.ok) {
        toast.success(defaultDate === 'tomorrow' ? 'Task planned for tomorrow' : 'Task added');
        setTitle(''); setCategory(''); setPriority('medium'); setFromTime(''); setToTime(''); setIsProductive(true); setAutoFill(false); setExpanded(false);
        onRefresh(defaultDate);
        window.dispatchEvent(new CustomEvent('xp-updated'));
        window.dispatchEvent(new CustomEvent('notification-updated'));
      }
    } catch {}
  }

  async function classify(title: string) {
    if (!title.trim()) return;
    try {
      const r = await fetch('/api/ai/classify-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      if (r.ok) {
        const data = await r.json();
        if (data.category) { setCategory(data.category); setAutoFill(true); }
        if (data.isProductive !== undefined) { setIsProductive(data.isProductive); }
        setTimeout(() => setAutoFill(false), 3000);
      }
    } catch {}
  }

  return (
    <div className="grid grid-cols-[28px_1fr] gap-2 px-3 py-2 items-center border-b border-dashed border-border/20 hover:bg-accent/20 transition-colors group">
      <div className="flex justify-center">
        <button
          onClick={() => { setExpanded(!expanded); inputRef.current?.focus(); }}
          className="w-5 h-5 rounded border border-border/40 flex items-center justify-center text-muted-foreground/30 hover:text-muted-foreground/60 hover:border-muted-foreground/40 transition-colors"
        >
          <Plus size={12} />
        </button>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={() => { if (title.trim()) classify(title); }}
            onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
            placeholder={defaultDate === 'tomorrow' ? 'Add a task for tomorrow...' : 'Add a task...'}
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/30 outline-none"
          />
          <AnimatePresence>
            {autoFill && (
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} className="absolute right-0 top-1/2 -translate-y-1/2">
                <Sparkles size={14} className="text-purple-400" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {title.trim() && (
          <Button onClick={handleAdd} size="sm" className="gradient-blue text-[10px] h-6 px-2 shrink-0">
            <Plus size={10} />
          </Button>
        )}
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="col-span-2 overflow-hidden"
          >
            <div className="flex items-center gap-2 py-2 flex-wrap">
              <select value={category} onChange={e => setCategory(e.target.value)} className={`bg-accent border border-border/40 text-foreground rounded-md px-2 py-1 text-[11px] ${autoFill ? 'border-purple-500/50' : ''}`}>
                <option value="" className="bg-background">Category</option>
                {CATEGORIES.map(c => <option key={c} value={c} className="bg-background">{t(`category.${c}`)}</option>)}
              </select>
              <div className="flex items-center gap-1">
                {PRIORITIES.map(p => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                      priority === p
                        ? PRIORITY_STYLES[p]
                        : 'border-border/30 text-muted-foreground/40 hover:text-muted-foreground/60'
                    }`}
                  >
                    <Flag size={8} className="inline mr-0.5" />{PRIORITY_LABELS[p]}
                  </button>
                ))}
              </div>
              <Input type="time" value={fromTime} onChange={e => setFromTime(e.target.value)} className="bg-accent border-border/40 text-foreground text-[11px] w-24 h-7" />
              <span className="text-muted-foreground/30 text-[10px]">to</span>
              <Input type="time" value={toTime} onChange={e => setToTime(e.target.value)} className="bg-accent border-border/40 text-foreground text-[11px] w-24 h-7" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── NotionTaskRow ──

function NotionTaskRow({
  task,
  currentTab,
  isExpanded,
  onToggleExpand,
  onToggleTask,
  onUpdateTaskStatus,
  onDeleteTask,
  onSetReflectionModal,
  onRefresh,
  onPriorityChange,
  readOnly,
}: {
  task: any;
  currentTab: 'today' | 'tomorrow';
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  onToggleTask: (taskId: string, currentStatus: string, currentTab: 'today' | 'tomorrow') => void;
  onUpdateTaskStatus: (taskId: string, newStatus: string, currentTab: 'today' | 'tomorrow') => void;
  onDeleteTask: (id: string, currentTab: 'today' | 'tomorrow') => void;
  onSetReflectionModal: (modal: { taskId: string; title: string; status: string } | null) => void;
  onRefresh: (currentTab: 'today' | 'tomorrow') => void;
  onPriorityChange: (taskId: string, priority: string) => void;
  readOnly?: boolean;
}) {
  const isDone = task.status === 'completed';
  const isMissed = task.status === 'missed';
  const isInProgress = task.status === 'in_progress';
  const isSkipped = task.status === 'skipped';
  const [elapsedMin, setElapsedMin] = useState<number | null>(null);

  useEffect(() => {
    if (!isInProgress || !task.fromTime) return;
    const calcElapsed = () => {
      const now = new Date();
      const [h, m] = task.fromTime.split(':').map(Number);
      const start = new Date(now);
      start.setHours(h, m, 0, 0);
      const diffMin = Math.max(0, Math.round((now.getTime() - start.getTime()) / 60000));
      setElapsedMin(diffMin);
    };
    calcElapsed();
    const interval = setInterval(calcElapsed, 60000);
    return () => clearInterval(interval);
  }, [isInProgress, task.fromTime]);

  const cyclePriority = () => {
    if (readOnly) return;
    const cycle: Record<string, Priority> = { low: 'medium', medium: 'high', high: 'low' };
    const next = cycle[task.priority || 'medium'] || 'medium';
    onPriorityChange(task.id, next);
  };

  return (
    <div className={`border-b border-border/10 transition-colors ${isDone ? 'opacity-50' : isSkipped ? 'opacity-40' : isMissed ? '' : ''} ${isMissed ? 'bg-red-500/[0.02]' : ''} hover:bg-accent/20`}>
      <div
        className="grid grid-cols-[28px_1fr_80px_56px_64px_90px_36px] sm:grid-cols-[28px_1fr_90px_60px_70px_100px_36px] gap-2 px-3 py-2.5 items-center cursor-pointer"
        onClick={() => onToggleExpand(task.id)}
      >
        {/* Checkbox */}
        <div className="flex justify-center" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => { if (!readOnly) onToggleTask(task.id, task.status, currentTab); }}
            disabled={readOnly}
            className={`w-[18px] h-[18px] rounded border flex items-center justify-center transition-colors shrink-0 ${
              isDone ? 'bg-emerald-500 border-emerald-500' :
              isInProgress ? 'bg-amber-500/25 border-amber-500' :
              isMissed ? 'bg-red-500/20 border-red-500' :
              'border-border/50 hover:border-muted-foreground/40'
            }`}
          >
            {isDone && <Check size={11} className="text-white" />}
            {isInProgress && <Play size={8} className="text-amber-400" />}
            {isMissed && <AlertTriangle size={9} className="text-red-400" />}
            {isSkipped && <SkipForward size={9} className="text-zinc-400" />}
          </button>
        </div>

        {/* Title */}
        <div className="min-w-0">
          <p className={`text-sm truncate ${isDone ? 'line-through text-muted-foreground/40' : isMissed || isSkipped ? 'text-muted-foreground/50' : 'text-foreground'}`}>
            {task.title}
          </p>
          {isInProgress && elapsedMin !== null && (
            <span className="text-[9px] text-amber-400/70 flex items-center gap-0.5 mt-0.5">
              <Clock size={7} /> {elapsedMin}m elapsed
            </span>
          )}
          {task.reflectionNote && !isExpanded && (
            <span className="text-[9px] text-amber-400/50 flex items-center gap-0.5 mt-0.5">
              <MessageSquare size={7} /> Reflected
            </span>
          )}
        </div>

        {/* Status */}
        <div onClick={e => e.stopPropagation()}>
          <StatusChip
            status={task.status}
            onClick={readOnly ? undefined : () => onToggleTask(task.id, task.status, currentTab)}
            readOnly={readOnly}
          />
        </div>

        {/* Priority */}
        <div onClick={e => e.stopPropagation()}>
          <PriorityChip
            priority={task.priority || 'medium'}
            onClick={readOnly ? undefined : cyclePriority}
            readOnly={readOnly}
          />
        </div>

        {/* Category */}
        <span className="text-[10px] text-muted-foreground/40 truncate">
          {task.category ? t(`category.${task.category}`) : ''}
        </span>

        {/* Time */}
        <span className="text-[10px] text-muted-foreground/40 truncate">
          {task.fromTime && task.toTime ? `${formatTime(task.fromTime)}–${formatTime(task.toTime)}` : task.fromTime ? formatTime(task.fromTime) : ''}
        </span>

        {/* XP */}
        <span className="text-[10px] text-amber-400/60 font-medium flex items-center gap-0.5">
          {task.xpAwarded ? <><Zap size={8} />{task.xpAwarded}</> : ''}
        </span>
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {isExpanded && (
          <ExpandedTaskDetails
            task={task}
            currentTab={currentTab}
            onUpdateTaskStatus={onUpdateTaskStatus}
            onSetReflectionModal={onSetReflectionModal}
            onDeleteTask={onDeleteTask}
            onRefresh={onRefresh}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── FilterBar ──

type SortMode = 'newest' | 'oldest' | 'priority' | 'time';

function FilterBar({
  filterPriority,
  setFilterPriority,
  filterCategory,
  setFilterCategory,
  filterStatus,
  setFilterStatus,
  sortMode,
  setSortMode,
}: {
  filterPriority: string;
  setFilterPriority: (p: string) => void;
  filterCategory: string;
  setFilterCategory: (c: string) => void;
  filterStatus: string;
  setFilterStatus: (s: string) => void;
  sortMode: SortMode;
  setSortMode: (s: SortMode) => void;
}) {
  const [showFilters, setShowFilters] = useState(false);

  const statusOptions = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Planned' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Done' },
    { value: 'missed', label: 'Missed' },
    { value: 'skipped', label: 'Skipped' },
  ];

  const priorityOptions = [
    { value: 'all', label: 'All' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Med' },
    { value: 'high', label: 'High' },
  ];

  const categoryOptions = [
    { value: 'all', label: 'All' },
    ...CATEGORIES.map(c => ({ value: c, label: t(`category.${c}`) })),
  ];

  const sortOptions: { value: SortMode; label: string }[] = [
    { value: 'time', label: 'Time' },
    { value: 'priority', label: 'Priority' },
    { value: 'newest', label: 'Newest' },
    { value: 'oldest', label: 'Oldest' },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="text-[10px] px-2.5 py-1 rounded-full border border-border/30 text-muted-foreground/60 hover:text-muted-foreground hover:border-border/50 transition-colors flex items-center gap-1"
        >
          <ArrowUpDown size={9} /> Filter & Sort
        </button>
        {(filterPriority !== 'all' || filterCategory !== 'all' || filterStatus !== 'all') && (
          <button
            onClick={() => { setFilterPriority('all'); setFilterCategory('all'); setFilterStatus('all'); }}
            className="text-[10px] px-2 py-1 rounded-full border border-red-500/20 text-red-400/60 hover:text-red-400 transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="space-y-2 p-3 bg-accent/20 rounded-lg border border-border/10">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[9px] text-muted-foreground/40 uppercase tracking-wider mr-1">Priority</span>
                {priorityOptions.map(o => (
                  <button
                    key={o.value}
                    onClick={() => setFilterPriority(o.value)}
                    className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                      filterPriority === o.value
                        ? 'bg-sky-500/15 text-sky-400 border-sky-500/25'
                        : 'border-border/20 text-muted-foreground/40 hover:text-muted-foreground/60'
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[9px] text-muted-foreground/40 uppercase tracking-wider mr-1">Category</span>
                {categoryOptions.map(o => (
                  <button
                    key={o.value}
                    onClick={() => setFilterCategory(o.value)}
                    className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                      filterCategory === o.value
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
                        : 'border-border/20 text-muted-foreground/40 hover:text-muted-foreground/60'
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[9px] text-muted-foreground/40 uppercase tracking-wider mr-1">Status</span>
                {statusOptions.map(o => (
                  <button
                    key={o.value}
                    onClick={() => setFilterStatus(o.value)}
                    className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                      filterStatus === o.value
                        ? 'bg-amber-500/15 text-amber-400 border-amber-500/25'
                        : 'border-border/20 text-muted-foreground/40 hover:text-muted-foreground/60'
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] text-muted-foreground/40 uppercase tracking-wider mr-1">Sort</span>
                {sortOptions.map(o => (
                  <button
                    key={o.value}
                    onClick={() => setSortMode(o.value)}
                    className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                      sortMode === o.value
                        ? 'bg-purple-500/15 text-purple-400 border-purple-500/25'
                        : 'border-border/20 text-muted-foreground/40 hover:text-muted-foreground/60'
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── ReviewTab (kept from original, styled consistently) ──

function ReviewTab({ reviewData }: { reviewData: any }) {
  if (!reviewData) return <div className="flex justify-center py-8"><Loader2 className="animate-spin text-blue-400" size={24} /></div>;
  const { overview, reflections, commonFailures, categoryStats, timeSlots, dailyRates } = reviewData;

  return (
    <div className="space-y-4">
      <GlassCard className="p-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Weekly Overview</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="text-center p-3 bg-accent rounded-lg">
            <p className="text-2xl font-bold text-foreground">{overview.completionRate}%</p>
            <p className="text-[10px] text-green-400">Completion Rate</p>
          </div>
          <div className="text-center p-3 bg-accent rounded-lg">
            <p className="text-2xl font-bold text-green-400">{overview.completed}</p>
            <p className="text-[10px] text-muted-foreground">Completed</p>
          </div>
          <div className="text-center p-3 bg-accent rounded-lg">
            <p className="text-2xl font-bold text-amber-400">{overview.partial}</p>
            <p className="text-[10px] text-muted-foreground">Partial</p>
          </div>
          <div className="text-center p-3 bg-accent rounded-lg">
            <p className="text-2xl font-bold text-red-400">{overview.missed}</p>
            <p className="text-[10px] text-muted-foreground">Missed</p>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Daily Rates</h3>
        <div className="space-y-2">
          {(dailyRates || []).map((d: any) => (
            <div key={d.date} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-20 shrink-0">{new Date(d.date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
              <div className="flex-1 bg-accent rounded-full h-2 overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${d.rate}%`, backgroundColor: d.rate >= 80 ? '#22c55e' : d.rate >= 50 ? '#f59e0b' : '#ef4444' }} />
              </div>
              <span className="text-xs font-bold w-10 text-right" style={{ color: d.rate >= 80 ? '#22c55e' : d.rate >= 50 ? '#f59e0b' : '#ef4444' }}>{d.rate}%</span>
            </div>
          ))}
        </div>
      </GlassCard>

      {commonFailures && commonFailures.length > 0 && (
        <GlassCard className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Common Failure Reasons</h3>
          <div className="space-y-2">
            {commonFailures.map((f: any, i: number) => (
              <div key={i} className="flex items-center justify-between py-1 px-2 bg-accent/50 rounded-lg">
                <span className="text-xs text-foreground">{f.reason}</span>
                <span className="text-xs text-red-400 font-bold">{f.count}×</span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {reflections && reflections.length > 0 && (
        <GlassCard className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Reflection Notes</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {reflections.map((r: any, i: number) => (
              <div key={i} className="py-2 px-3 bg-accent/30 rounded-lg border border-amber-500/10">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-foreground">{r.title}</span>
                  <StatusChip status={r.status} readOnly />
                  <span className="text-[10px] text-muted-foreground/50 ml-auto">{r.date}</span>
                </div>
                <p className="text-[11px] text-amber-400/80 italic">&ldquo;{r.note}&rdquo;</p>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {categoryStats && Object.keys(categoryStats).length > 0 && (
        <GlassCard className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">By Category</h3>
          <div className="space-y-2">
            {Object.entries(categoryStats).map(([cat, stats]: [string, any]) => (
              <div key={cat} className="flex items-center gap-3 py-1 px-2 bg-accent/30 rounded-lg">
                <span className="text-xs text-foreground capitalize w-20">{cat}</span>
                <span className="text-[10px] text-green-400">{stats.completed}/{stats.total} done</span>
                {stats.missed > 0 && <span className="text-[10px] text-red-400">{stats.missed} missed</span>}
                {stats.partial > 0 && <span className="text-[10px] text-amber-400">{stats.partial} partial</span>}
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {timeSlots && (
        <GlassCard className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Time-of-Day Analysis</h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(timeSlots).map(([slot, stats]: [string, any]) => {
              const rate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
              return (
                <div key={slot} className="text-center p-2 bg-accent rounded-lg">
                  <p className="text-xs capitalize text-foreground font-medium">{slot}</p>
                  <p className="text-lg font-bold" style={{ color: rate >= 80 ? '#22c55e' : rate >= 50 ? '#f59e0b' : rate > 0 ? '#ef4444' : '#6b7280' }}>{stats.total > 0 ? `${rate}%` : '—'}</p>
                  <p className="text-[10px] text-muted-foreground">{stats.completed}/{stats.total}</p>
                </div>
              );
            })}
          </div>
        </GlassCard>
      )}
    </div>
  );
}

// ── Main component ──

export default function TimeClient() {
  const { profile } = useUserStore();
  const [activeTab, setActiveTab] = useState('planner');
  const [tasks, setTasks] = useState<any[]>([]);
  const [tomorrowTasks, setTomorrowTasks] = useState<any[]>([]);
  const [focusSessions, setFocusSessions] = useState<any[]>([]);

  // Filters & Sort
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortMode, setSortMode] = useState<SortMode>('time');

  // Expanded rows
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  // Sections visibility
  const [tomorrowCollapsed, setTomorrowCollapsed] = useState(false);
  const [historyCollapsed, setHistoryCollapsed] = useState(true);

  // Reflection modal
  const [reflectionModal, setReflectionModal] = useState<{ taskId: string; title: string; status: string } | null>(null);
  const [reflectionNote, setReflectionNote] = useState('');

  // Review data
  const [reviewData, setReviewData] = useState<any>(null);
  const [planningInsights, setPlanningInsights] = useState<string[]>([]);

  // Focus Timer
  const [timerMinutes, setTimerMinutes] = useState(25);
  const [customMinutes, setCustomMinutes] = useState('');
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [timerNotes, setTimerNotes] = useState('');
  const timerInterval = useRef<NodeJS.Timeout | null>(null);

  // AI Coach
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const today = getLocalDateStr(0);
  const tomorrow = getLocalDateStr(1);
  const [historyTasks, setHistoryTasks] = useState<Record<string, any[]>>({});
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});
  const [upcomingExpanded, setUpcomingExpanded] = useState(true);

  // Force re-render at midnight
  useEffect(() => {
    const now = new Date();
    const msUntilMidnight = ((24 - now.getHours()) * 60 - now.getMinutes()) * 60000 - now.getSeconds() * 1000;
    const timeout = setTimeout(() => {
      setUpcomingExpanded(prev => prev);
    }, msUntilMidnight + 1000);
    return () => clearTimeout(timeout);
  }, [today]);

  // ── Fetch functions ──

  const fetchTasks = useCallback(async () => {
    try {
      const r = await fetch(`/api/time/tasks?date=${today}`);
      if (r.ok) { const d = await r.json(); setTasks(sortByTime(Array.isArray(d) ? d : d.tasks || [])); }
    } catch {}
  }, [today]);

  const fetchTomorrowTasks = useCallback(async () => {
    try {
      const r = await fetch(`/api/time/tasks?date=${tomorrow}`);
      if (r.ok) { const d = await r.json(); setTomorrowTasks(sortByTime(Array.isArray(d) ? d : d.tasks || [])); }
    } catch {}
  }, [tomorrow]);

  const fetchFocusSessions = useCallback(async () => {
    try {
      const r = await fetch(`/api/time/focus?date=${today}`);
      if (r.ok) { const d = await r.json(); setFocusSessions(Array.isArray(d) ? d : d.sessions || []); }
    } catch {}
  }, [today]);

  const fetchReviewData = useCallback(async () => {
    try {
      const r = await fetch('/api/time/review?days=7');
      if (r.ok) { const d = await r.json(); setReviewData(d); }
    } catch {}
  }, []);

  const fetchPlanningInsights = useCallback(async () => {
    try {
      const r = await fetch('/api/time/insights');
      if (r.ok) { const d = await r.json(); setPlanningInsights(d.insights || []); }
    } catch {}
  }, []);

  useEffect(() => {
    fetchTasks(); fetchTomorrowTasks(); fetchFocusSessions(); fetchReviewData(); fetchPlanningInsights();
    const last7 = Array.from({ length: 7 }, (_, i) => getLocalDateStr(-(i + 1)));
    Promise.all(last7.map(async dateStr => {
      try {
        const r = await fetch(`/api/time/tasks?date=${dateStr}`);
        if (r.ok) { const d = await r.json(); return { dateStr, tasks: sortByTime(Array.isArray(d) ? d : d.tasks || []) }; }
      } catch {}
      return { dateStr, tasks: [] as any[] };
    })).then(results => {
      const map: Record<string, any[]> = {};
      results.forEach(r => { map[r.dateStr] = r.tasks; });
      setHistoryTasks(prev => ({ ...prev, ...map }));
    });
  }, [fetchTasks, fetchTomorrowTasks, fetchFocusSessions, fetchReviewData, fetchPlanningInsights]);

  // ── Timer logic ──

  useEffect(() => {
    if (timerRunning && timerSeconds > 0) {
      timerInterval.current = setInterval(() => setTimerSeconds(s => s - 1), 1000);
    } else if (timerSeconds === 0 && timerRunning) {
      setTimerRunning(false);
      handleFocusComplete();
    }
    return () => { if (timerInterval.current) clearInterval(timerInterval.current); };
  }, [timerRunning, timerSeconds]);

  async function handleFocusComplete() {
    const duration = timerMinutes;
    try {
      const r = await fetch('/api/time/focus', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration, notes: timerNotes, date: today, taskName: `Focus ${duration}min` }),
      });
      if (r.ok) {
        toast.success(`+20 ${t('xp.earned')}`);
        setTimerNotes('');
        fetchFocusSessions();
        window.dispatchEvent(new CustomEvent('xp-updated')); window.dispatchEvent(new CustomEvent('notification-updated'));
      }
    } catch {}
  }

  // ── Task operations ──

  async function updateTaskStatus(taskId: string, newStatus: string, currentTab: 'today' | 'tomorrow') {
    try {
      const r = await fetch('/api/time/tasks', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, status: newStatus }),
      });
      if (r.ok) {
        const d = await r.json();
        if (d.xp) {
          if (d.xp.awarded > 0) toast.success(`+${d.xp.awarded} XP — ${d.xp.reason}`);
          else if (d.xp.awarded === 0 && newStatus === 'missed') toast.info('Task marked as missed');
        }
        if ((newStatus === 'missed' || newStatus === 'partially_completed') && !reflectionModal) {
          const taskData = currentTab === 'tomorrow' ? tomorrowTasks : tasks;
          const task = taskData.find((t: any) => t.id === taskId);
          if (task && !task.reflectionNote) {
            setReflectionModal({ taskId, title: task.title, status: newStatus });
          }
        }
        if (currentTab === 'tomorrow') fetchTomorrowTasks(); else fetchTasks();
        fetchReviewData();
        window.dispatchEvent(new CustomEvent('xp-updated')); window.dispatchEvent(new CustomEvent('notification-updated'));
      }
    } catch {}
  }

  async function toggleTask(taskId: string, currentStatus: string, currentTab: 'today' | 'tomorrow') {
    const statusCycle: Record<string, string> = {
      'pending': 'in_progress',
      'in_progress': 'completed',
      'completed': 'skipped',
      'skipped': 'pending',
      'partially_completed': 'completed',
      'missed': 'pending',
    };
    const nextStatus = statusCycle[currentStatus] || 'pending';
    await updateTaskStatus(taskId, nextStatus, currentTab);
  }

  async function changePriority(taskId: string, priority: string) {
    try {
      await fetch('/api/time/tasks', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, priority }),
      });
      fetchTasks(); fetchTomorrowTasks();
    } catch {}
  }

  async function saveReflection() {
    if (!reflectionModal || !reflectionNote.trim()) {
      setReflectionModal(null);
      return;
    }
    try {
      await fetch('/api/time/tasks', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reflectionModal.taskId, reflectionNote: reflectionNote.trim() }),
      });
      toast.success('Reflection saved');
      fetchTasks(); fetchTomorrowTasks(); fetchReviewData();
    } catch {}
    setReflectionNote('');
    setReflectionModal(null);
  }

  async function deleteTask(id: string, currentTab: 'today' | 'tomorrow') {
    try {
      await fetch('/api/time/tasks', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      if (currentTab === 'tomorrow') fetchTomorrowTasks(); else fetchTasks();
      fetchReviewData();
      window.dispatchEvent(new CustomEvent('xp-updated')); window.dispatchEvent(new CustomEvent('notification-updated'));
    } catch {}
  }

  function refreshTab(tab: 'today' | 'tomorrow') {
    if (tab === 'tomorrow') fetchTomorrowTasks(); else fetchTasks();
  }

  // ── Chat functions ──

  async function sendChat() {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatMessages(p => [...p, { role: 'user', content: userMsg }]);
    setChatInput(''); setChatLoading(true);
    try {
      const r = await fetch('/api/ai/chatbot', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, botType: 'time', conversationId }),
      });
      if (r.ok) { const d = await r.json(); setChatMessages(p => [...p, { role: 'assistant', content: d.reply || d.response }]); if (d.conversationId) setConversationId(d.conversationId); }
    } catch {} finally { setChatLoading(false); }
  }

  function startNewChat() {
    setChatMessages([]);
    setConversationId(null);
  }

  async function rankUnproductive() {
    const unproductive = tasks.filter((t: any) => !t.isProductive);
    if (unproductive.length === 0) { toast.info('No unproductive tasks to rank'); return; }
    try {
      const r = await fetch('/api/ai/rank-unproductive', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: unproductive.map(t => ({ title: t.title, duration: 30 })) }),
      });
      if (r.ok) { const d = await r.json(); toast.info(d.rankings?.[0]?.reason || 'Ranked!'); }
    } catch {}
  }

  async function deleteFocusSession(id: string) {
    try {
      await fetch('/api/time/focus', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      fetchFocusSessions(); window.dispatchEvent(new CustomEvent('xp-updated')); window.dispatchEvent(new CustomEvent('notification-updated'));
    } catch {}
  }

  // Auto-mark yesterday's pending tasks as missed
  useEffect(() => {
    const markMissedAndMigrate = async () => {
      const yesterday = getLocalDateStr(-1);
      try {
        const r = await fetch(`/api/time/tasks?date=${yesterday}`);
        if (r.ok) {
          const d = await r.json();
          const oldTasks = Array.isArray(d) ? d : d.tasks || [];
          const pendingOld = oldTasks.filter((t: any) => t.status === 'pending' || t.status === 'in_progress');
          for (const task of pendingOld) {
            await fetch('/api/time/tasks', {
              method: 'PATCH', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: task.id, status: 'missed' }),
            });
          }
          if (pendingOld.length > 0) {
            fetchReviewData();
          }
        }
      } catch {}
    };
    markMissedAndMigrate();
  }, []);

  // ── Filtering & Sorting ──

  function applyFiltersAndSort(taskList: any[]): any[] {
    let filtered = taskList;
    if (filterCategory !== 'all') filtered = filtered.filter((t: any) => t.category === filterCategory);
    if (filterPriority !== 'all') filtered = filtered.filter((t: any) => (t.priority || 'medium') === filterPriority);
    if (filterStatus !== 'all') filtered = filtered.filter((t: any) => t.status === filterStatus);

    const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
    if (sortMode === 'priority') {
      filtered = [...filtered].sort((a, b) => (priorityOrder[a.priority || 'medium'] ?? 1) - (priorityOrder[b.priority || 'medium'] ?? 1));
    } else if (sortMode === 'newest') {
      filtered = [...filtered].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    } else if (sortMode === 'oldest') {
      filtered = [...filtered].sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
    } else {
      filtered = sortByTime(filtered);
    }
    return filtered;
  }

  const filteredTodayTasks = applyFiltersAndSort(tasks);
  const filteredTomorrowTasks = applyFiltersAndSort(tomorrowTasks);

  // ── Render ──

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Plan Tomorrow banner */}
      {isAfter7PM() && activeTab === 'planner' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-violet-600/15 to-purple-600/15 border border-violet-500/20 rounded-xl p-3 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Moon size={18} className="text-violet-400" />
            <span className="text-sm text-foreground font-medium">Plan Tomorrow</span>
            <span className="text-xs text-muted-foreground">— Set up tomorrow&apos;s tasks now</span>
          </div>
          <Button
            onClick={() => { setTomorrowCollapsed(false); document.getElementById('tomorrow-section')?.scrollIntoView({ behavior: 'smooth' }); }}
            size="sm"
            className="gradient-blue text-xs h-7"
          >
            Plan Tomorrow
          </Button>
        </motion.div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-accent border border-border w-full flex overflow-x-auto">
          {['planner', 'review', 'focusTimer', 'aiCoach'].map(tab => (
            <TabsTrigger key={tab} value={tab} className="text-muted-foreground data-[state=active]:text-blue-400 data-[state=active]:bg-blue-600/20 text-xs flex-1">
              {tab === 'planner' ? (isAfter7PM() ? '🌙 Planner' : '📋 Planner') :
               tab === 'review' ? 'Review' :
               tab === 'focusTimer' ? 'Focus' :
               tab === 'aiCoach' ? 'AI Coach' :
               tab}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ═══════════ Planner Tab ═══════════ */}
        <TabsContent value="planner" className="space-y-4 mt-4">

          {/* Insights */}
          {planningInsights.length > 0 && (
            <GlassCard className="p-3 border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} className="text-purple-400" />
                <span className="text-xs font-medium text-purple-400">Insights</span>
              </div>
              <div className="space-y-1">
                {planningInsights.map((insight, i) => (
                  <p key={i} className="text-xs text-muted-foreground">• {insight}</p>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Filter Bar */}
          <FilterBar
            filterPriority={filterPriority}
            setFilterPriority={setFilterPriority}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            sortMode={sortMode}
            setSortMode={setSortMode}
          />

          {/* ── Today's Tasks ── */}
          <GlassCard className="overflow-hidden">
            {/* Section Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/20">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-foreground/70" />
                <span className="text-sm font-semibold text-foreground">Today</span>
                <span className="text-[10px] text-muted-foreground/50 bg-accent px-2 py-0.5 rounded-full">
                  {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                </span>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-foreground/5 text-muted-foreground/50">
                  {tasks.length} task{tasks.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Table Header */}
            <TaskTableHeader />

            {/* Inline Add */}
            <InlineAddTask defaultDate="today" today={today} tomorrow={tomorrow} onRefresh={refreshTab} />

            {/* Task Rows */}
            {filteredTodayTasks.length > 0 ? (
              filteredTodayTasks.map((task: any) => (
                <NotionTaskRow
                  key={task.id}
                  task={task}
                  currentTab="today"
                  isExpanded={expandedTask === task.id}
                  onToggleExpand={(id) => setExpandedTask(prev => prev === id ? null : id)}
                  onToggleTask={toggleTask}
                  onUpdateTaskStatus={updateTaskStatus}
                  onDeleteTask={deleteTask}
                  onSetReflectionModal={setReflectionModal}
                  onRefresh={refreshTab}
                  onPriorityChange={changePriority}
                />
              ))
            ) : (
              <div className="px-4 py-8 text-center text-muted-foreground/40 text-sm">
                {tasks.length === 0 ? 'No tasks for today. Add one above!' : 'No tasks match your filters.'}
              </div>
            )}
          </GlassCard>

          {/* ── Tomorrow's Tasks (collapsible) ── */}
          <GlassCard className="overflow-hidden">
            <div
              className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-accent/10 transition-colors"
              onClick={() => setTomorrowCollapsed(!tomorrowCollapsed)}
            >
              <div className="flex items-center gap-2">
                {tomorrowCollapsed ? <ChevronRight size={14} className="text-muted-foreground/40" /> : <ChevronDown size={14} className="text-muted-foreground/40" />}
                <Moon size={14} className="text-violet-400/70" />
                <span className="text-sm font-semibold text-foreground">Tomorrow</span>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-foreground/5 text-muted-foreground/50">
                  {tomorrowTasks.length} task{tomorrowTasks.length !== 1 ? 's' : ''}
                </span>
                {isAfter7PM() && (
                  <span className="text-[10px] text-violet-400/60">— Plan now</span>
                )}
              </div>
            </div>

            <AnimatePresence>
              {!tomorrowCollapsed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div id="tomorrow-section">
                    <TaskTableHeader />
                    <InlineAddTask defaultDate="tomorrow" today={today} tomorrow={tomorrow} onRefresh={refreshTab} />
                    {filteredTomorrowTasks.length > 0 ? (
                      filteredTomorrowTasks.map((task: any) => (
                        <NotionTaskRow
                          key={task.id}
                          task={task}
                          currentTab="tomorrow"
                          isExpanded={expandedTask === task.id}
                          onToggleExpand={(id) => setExpandedTask(prev => prev === id ? null : id)}
                          onToggleTask={toggleTask}
                          onUpdateTaskStatus={updateTaskStatus}
                          onDeleteTask={deleteTask}
                          onSetReflectionModal={setReflectionModal}
                          onRefresh={refreshTab}
                          onPriorityChange={changePriority}
                        />
                      ))
                    ) : (
                      <div className="px-4 py-6 text-center text-muted-foreground/40 text-sm">
                        No tasks planned for tomorrow yet.
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button onClick={rankUnproductive} variant="ghost" className="text-purple-400 hover:text-purple-300 text-xs">
              <Sparkles size={14} className="mr-1" />{t('time.aiRankUnproductive')}
            </Button>
            <Button
              onClick={async () => {
                await fetch('/api/time/tasks', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resetAll: true }) });
                fetchTasks();
                window.dispatchEvent(new CustomEvent('xp-updated'));
                window.dispatchEvent(new CustomEvent('notification-updated'));
              }}
              variant="ghost"
              className="text-red-400 hover:text-red-300 text-xs"
            >
              {t('common.reset')} All
            </Button>
          </div>

          {/* ── Past 7 Days (collapsible) ── */}
          <GlassCard className="overflow-hidden">
            <div
              className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-accent/10 transition-colors"
              onClick={() => setHistoryCollapsed(!historyCollapsed)}
            >
              <div className="flex items-center gap-2">
                {historyCollapsed ? <ChevronRight size={14} className="text-muted-foreground/40" /> : <ChevronDown size={14} className="text-muted-foreground/40" />}
                <span className="text-sm font-semibold text-foreground">Past 7 Days</span>
              </div>
            </div>

            <AnimatePresence>
              {!historyCollapsed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="max-h-96 overflow-y-auto"
                >
                  <div className="space-y-0">
                    {Array.from({ length: 7 }, (_, i) => getLocalDateStr(-(i + 1))).map(dateStr => {
                      const dayTasks = historyTasks[dateStr] || [];
                      const isExp = expandedDays[dateStr] ?? false;
                      const completedCount = dayTasks.filter((task: any) => task.status === 'completed').length;
                      const partialCount = dayTasks.filter((task: any) => task.status === 'partially_completed').length;
                      const missedCount = dayTasks.filter((task: any) => task.status === 'missed').length;
                      const totalCount = dayTasks.length;
                      const score = totalCount > 0 ? Math.round(((completedCount + partialCount * 0.6) / totalCount) * 100) : null;
                      const label = new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
                      const scoreColor = score !== null ? (score >= 80 ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' : score >= 50 ? 'bg-amber-500/15 text-amber-400 border-amber-500/25' : 'bg-red-500/15 text-red-400 border-red-500/25') : '';

                      return (
                        <div key={dateStr} className="border-b border-border/10 last:border-b-0">
                          <div
                            className="flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-accent/10 transition-colors"
                            onClick={() => setExpandedDays(prev => ({ ...prev, [dateStr]: !isExp }))}
                          >
                            <div className="flex items-center gap-2">
                              {isExp ? <ChevronDown size={12} className="text-muted-foreground/40" /> : <ChevronRight size={12} className="text-muted-foreground/40" />}
                              <span className="text-xs text-foreground">{label}</span>
                              {totalCount === 0 && <span className="text-[10px] text-muted-foreground/30 italic">No tasks</span>}
                            </div>
                            <div className="flex items-center gap-2">
                              {score !== null && (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${scoreColor}`}>{score}%</span>
                              )}
                              {totalCount > 0 && (
                                <div className="flex items-center gap-1">
                                  <span className="text-[10px] text-emerald-400">{completedCount}</span>
                                  {partialCount > 0 && <span className="text-[10px] text-amber-400">+{partialCount}p</span>}
                                  {missedCount > 0 && <span className="text-[10px] text-red-400">{missedCount}m</span>}
                                </div>
                              )}
                            </div>
                          </div>
                          <AnimatePresence>
                            {isExp && dayTasks.length > 0 && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.15 }}
                                className="overflow-hidden"
                              >
                                <div className="px-4 pb-3 space-y-1">
                                  {dayTasks.map((task: any) => (
                                    <div
                                      key={task.id}
                                      className={`grid grid-cols-[20px_1fr_70px_50px] gap-2 px-2 py-1.5 rounded-lg items-center ${task.status === 'completed' ? 'opacity-40' : ''}`}
                                    >
                                      <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                                        task.status === 'completed' ? 'bg-emerald-500 border-emerald-500' :
                                        task.status === 'missed' ? 'bg-red-500/20 border-red-500' :
                                        task.status === 'partially_completed' ? 'bg-amber-500/20 border-amber-500' :
                                        'border-border/40'
                                      }`}>
                                        {task.status === 'completed' && <Check size={9} className="text-white" />}
                                        {task.status === 'missed' && <AlertTriangle size={8} className="text-red-400" />}
                                      </div>
                                      <div className="min-w-0">
                                        <p className={`text-xs truncate ${task.status === 'completed' ? 'line-through text-muted-foreground/40' : 'text-foreground'}`}>{task.title}</p>
                                      </div>
                                      <StatusChip status={task.status} readOnly />
                                      <PriorityChip priority={task.priority || 'medium'} readOnly />
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>
        </TabsContent>

        {/* ═══════════ Review Tab ═══════════ */}
        <TabsContent value="review" className="space-y-4 mt-4">
          <ReviewTab reviewData={reviewData} />
        </TabsContent>

        {/* ═══════════ Focus Timer Tab ═══════════ */}
        <TabsContent value="focusTimer" className="space-y-4 mt-4">
          <GlassCard className="p-6 flex flex-col items-center">
            <div className="flex gap-2 mb-6 flex-wrap justify-center">
              {[15, 25, 45, 60].map(m => (
                <SelectPill key={m} label={`${m}m`} selected={timerMinutes === m && !customMinutes} onClick={() => { setTimerMinutes(m); setTimerSeconds(m * 60); setCustomMinutes(''); }} color="blue" />
              ))}
              <div className="flex items-center gap-1">
                <Input type="number" value={customMinutes} onChange={e => { setCustomMinutes(e.target.value); if (e.target.value) { const m = parseInt(e.target.value); if (m > 0) { setTimerMinutes(m); setTimerSeconds(m * 60); } } }} placeholder="Custom" className="bg-accent border-border text-foreground w-20 text-xs h-8" />
                <span className="text-muted-foreground/50 text-xs">min</span>
              </div>
            </div>
            <div className="relative w-48 h-48 mb-6">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                <circle cx="60" cy="60" r="54" fill="none" stroke="url(#timerGradient)" strokeWidth="6" strokeDasharray={`${2 * Math.PI * 54}`} strokeDashoffset={`${2 * Math.PI * 54 * (1 - timerSeconds / (timerMinutes * 60))}`} strokeLinecap="round" className="transition-all duration-1000" />
                <defs><linearGradient id="timerGradient"><stop offset="0%" stopColor="#3B82F6" /><stop offset="100%" stopColor="#8B5CF6" /></linearGradient></defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-3xl font-bold text-foreground">{Math.floor(timerSeconds / 60).toString().padStart(2, '0')}:{(timerSeconds % 60).toString().padStart(2, '0')}</p>
                <p className="text-xs text-muted-foreground/70">{timerMinutes}min</p>
              </div>
            </div>
            <div className="flex gap-3 mb-4">
              <Button onClick={() => setTimerRunning(!timerRunning)} className={`w-12 h-12 rounded-full ${timerRunning ? 'bg-amber-600' : 'gradient-blue'}`}>
                {timerRunning ? <Pause size={20} /> : <Play size={20} />}
              </Button>
              <Button onClick={() => { setTimerRunning(false); setTimerSeconds(timerMinutes * 60); }} variant="ghost" className="w-12 h-12 rounded-full border border-border text-muted-foreground"><RotateCcw size={20} /></Button>
            </div>
            <Textarea value={timerNotes} onChange={e => setTimerNotes(e.target.value)} placeholder="Session notes..." className="bg-accent border-border text-foreground placeholder:text-muted-foreground/50 w-full max-w-xs text-sm" rows={2} />
          </GlassCard>
          <div className="space-y-2">
            {focusSessions.map((s: any) => (
              <GlassCard key={s.id} className="p-3 flex items-center justify-between">
                <div><p className="text-sm text-foreground">{s.taskName || `Focus ${s.duration}min`}</p><p className="text-[10px] text-muted-foreground/70">{s.duration}min · {s.date}</p></div>
                <button onClick={() => deleteFocusSession(s.id)} className="text-muted-foreground/50 hover:text-red-400"><Trash2 size={14} /></button>
              </GlassCard>
            ))}
          </div>
        </TabsContent>

        {/* ═══════════ AI Coach Tab ═══════════ */}
        <TabsContent value="aiCoach" className="space-y-4 mt-4">
          <GlassCard className="p-4 h-[500px] flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <Bot size={18} className="text-purple-400" />
              <span className="text-sm font-medium text-foreground">{t('time.aiCoach')}</span>
              <button onClick={startNewChat} className="ml-auto text-xs text-muted-foreground hover:text-blue-400 flex items-center gap-1"><Plus size={12} />New Chat</button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 mb-3">
              {chatMessages.length === 0 && <p className="text-center text-muted-foreground/50 py-8 text-sm">{t('ai.askAnything')}</p>}
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex items-end ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0 mr-1.5 shadow-md shadow-violet-500/20"><Bot size={11} className="text-white" /></div>}
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-md' : 'bg-gradient-to-br from-violet-600/20 to-indigo-600/10 dark:from-violet-500/25 dark:to-indigo-500/15 text-foreground rounded-bl-md border border-violet-400/20 dark:border-violet-400/30'}`}>{msg.role === 'assistant' ? <AIMessage content={msg.content} /> : msg.content}</div>
                </div>
              ))}
              {chatLoading && <div className="flex justify-start items-end"><div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0 mr-1.5 shadow-md shadow-violet-500/20"><Bot size={11} className="text-white" /></div><div className="bg-gradient-to-br from-violet-600/20 to-indigo-600/10 dark:from-violet-500/25 dark:to-indigo-500/15 rounded-2xl px-4 py-2 text-sm text-muted-foreground border border-violet-400/20 dark:border-violet-400/30">{t('ai.thinking')}</div></div>}
            </div>
            <div className="flex gap-2">
              <Input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()} placeholder={t('ai.askAnything')} className="bg-accent border-border text-foreground" />
              <Button onClick={sendChat} className="gradient-blue shrink-0" disabled={chatLoading}><Send size={16} /></Button>
            </div>
          </GlassCard>
        </TabsContent>
      </Tabs>

      {/* ── Reflection Modal ── */}
      <AnimatePresence>
        {reflectionModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setReflectionModal(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-background border border-border rounded-xl p-5 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-foreground">What Went Wrong?</h3>
                <button onClick={() => setReflectionModal(null)} className="text-muted-foreground/50 hover:text-foreground"><X size={16} /></button>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                <span className="font-medium text-foreground">{reflectionModal.title}</span>
                <span className="ml-2"><StatusChip status={reflectionModal.status} readOnly /></span>
              </p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {['Unexpected assignment', 'Time conflict', 'Health issue', 'Underestimated effort', 'Distraction', 'Lack of energy', 'Poor planning'].map(reason => (
                  <button
                    key={reason}
                    onClick={() => setReflectionNote(prev => prev ? `${prev}, ${reason.toLowerCase()}` : reason.toLowerCase())}
                    className="text-[10px] px-2 py-1 rounded-full bg-accent border border-border text-muted-foreground hover:text-foreground hover:border-amber-500/30 transition-colors"
                  >
                    {reason}
                  </button>
                ))}
              </div>
              <Textarea value={reflectionNote} onChange={e => setReflectionNote(e.target.value)} placeholder="What happened? (e.g., Got distracted by phone, Task took longer than expected...)" className="bg-accent border-border text-foreground placeholder:text-muted-foreground/50 text-sm mb-3" rows={3} />
              <div className="flex gap-2 justify-end">
                <Button onClick={() => setReflectionModal(null)} variant="ghost" size="sm" className="text-xs">Skip</Button>
                <Button onClick={saveReflection} size="sm" className="gradient-blue text-xs">Save Reflection</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
