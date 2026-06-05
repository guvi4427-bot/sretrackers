'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Plus, Trash2, Sparkles, Check, Play, Pause, RotateCcw, Send, Bot, Loader2, ChevronDown, Moon, MessageSquare, AlertTriangle, CircleDashed, X } from 'lucide-react';
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

function getTomorrow(): string {
  return new Date(Date.now() + 86400000).toISOString().split('T')[0];
}

// ── Static components (moved outside render to satisfy react-hooks/static-components) ──

function StatusIcon({ status }: { status: string }) {
  if (status === 'completed') return <Check size={12} className="text-white" />;
  if (status === 'partially_completed') return <CircleDashed size={12} className="text-amber-400" />;
  if (status === 'missed') return <AlertTriangle size={12} className="text-red-400" />;
  return null;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-slate-600/20 text-slate-400',
    in_progress: 'bg-blue-600/20 text-blue-400',
    completed: 'bg-green-600/20 text-green-400',
    partially_completed: 'bg-amber-600/20 text-amber-400',
    missed: 'bg-red-600/20 text-red-400',
  };
  const labels: Record<string, string> = {
    pending: 'Pending',
    in_progress: 'In Progress',
    completed: 'Done',
    partially_completed: 'Partial',
    missed: 'Missed',
  };
  return <span className={`text-[10px] px-2 py-0.5 rounded-full ${styles[status] || styles.pending}`}>{labels[status] || status}</span>;
}

interface TaskCardProps {
  task: any;
  currentTab: 'today' | 'tomorrow';
  onToggleTask: (taskId: string, currentStatus: string, currentTab: 'today' | 'tomorrow') => void;
  onUpdateTaskStatus: (taskId: string, newStatus: string, currentTab: 'today' | 'tomorrow') => void;
  onDeleteTask: (id: string, currentTab: 'today' | 'tomorrow') => void;
  onSetReflectionModal: (modal: { taskId: string; title: string; status: string } | null) => void;
  onRefresh: (currentTab: 'today' | 'tomorrow') => void;
}

function TaskCard({ task, currentTab, onToggleTask, onUpdateTaskStatus, onDeleteTask, onSetReflectionModal, onRefresh }: TaskCardProps) {
  const isDone = task.status === 'completed';
  const isMissed = task.status === 'missed';
  const isPartial = task.status === 'partially_completed';
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showReflection, setShowReflection] = useState(false);
  const [localReflection, setLocalReflection] = useState(task.reflectionNote || '');

  async function saveLocalReflection() {
    if (!localReflection.trim()) { setShowReflection(false); return; }
    try {
      await fetch('/api/time/tasks', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: task.id, reflectionNote: localReflection.trim() }),
      });
      toast.success('Reflection saved');
      onRefresh(currentTab);
    } catch {}
    setShowReflection(false);
  }

  return (
    <GlassCard className={`p-3 ${isDone ? 'opacity-60' : ''} ${isMissed ? 'border-red-500/30' : ''} ${isPartial ? 'border-amber-500/30' : ''}`}>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onToggleTask(task.id, task.status, currentTab)}
          className={`w-5 h-5 rounded-full border shrink-0 flex items-center justify-center ${
            isDone ? 'bg-green-500 border-green-500' :
            isMissed ? 'bg-red-500/30 border-red-500' :
            isPartial ? 'bg-amber-500/30 border-amber-500' :
            'border-border'
          }`}
        >
          <StatusIcon status={task.status} />
        </button>
        <div className="flex-1 min-w-0">
          <p className={`text-sm ${isDone ? 'line-through text-muted-foreground/50' : isMissed ? 'text-muted-foreground/60' : 'text-foreground'}`}>{task.title}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {task.fromTime && task.toTime && <span className="text-[10px] text-blue-400">{formatTime(task.fromTime)} - {formatTime(task.toTime)}</span>}
            <StatusBadge status={task.status} />
            {task.isProductive ? (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-600/20 text-green-400">Productive</span>
            ) : (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-600/20 text-red-400">Unproductive</span>
            )}
            {task.category && <span className="text-[10px] text-muted-foreground/50">{t(`category.${task.category}`)}</span>}
            {task.reflectionNote && (
              <span className="text-[10px] text-amber-400 flex items-center gap-0.5">
                <MessageSquare size={8} /> Reflected
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {task.status !== 'completed' && (
            <div className="relative">
              <button
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className="text-[10px] text-muted-foreground/50 hover:text-foreground px-1 py-0.5 rounded bg-accent/50"
              >
                Status
              </button>
              {showStatusMenu && (
                <div className="absolute right-0 top-6 z-20 bg-popover border border-border rounded-lg shadow-lg overflow-hidden min-w-[140px]">
                  {['completed', 'partially_completed', 'missed'].map(s => (
                    <button
                      key={s}
                      onClick={async () => {
                        setShowStatusMenu(false);
                        await onUpdateTaskStatus(task.id, s, currentTab);
                        if ((s === 'missed' || s === 'partially_completed') && !task.reflectionNote) {
                          onSetReflectionModal({ taskId: task.id, title: task.title, status: s });
                        }
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs hover:bg-accent/50 text-foreground"
                    >
                      <StatusBadge status={s} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {(isMissed || isPartial) && (
            <button
              onClick={() => setShowReflection(!showReflection)}
              className="text-amber-400/60 hover:text-amber-400 p-1"
              title="Add reflection"
            >
              <MessageSquare size={12} />
            </button>
          )}
          <button onClick={() => onDeleteTask(task.id, currentTab)} className="text-muted-foreground/50 hover:text-red-400 p-1">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      {showReflection && (
        <div className="mt-2 flex gap-2">
          <Input
            value={localReflection}
            onChange={e => setLocalReflection(e.target.value)}
            placeholder="What went wrong? (e.g., Unexpected assignment, Distraction...)"
            className="bg-accent border-border text-foreground text-xs flex-1"
          />
          <Button onClick={saveLocalReflection} size="sm" className="gradient-blue text-xs h-8">Save</Button>
        </div>
      )}
      {task.reflectionNote && !showReflection && (
        <p className="text-[10px] text-amber-400/70 mt-1 pl-8 italic">&ldquo;{task.reflectionNote}&rdquo;</p>
      )}
    </GlassCard>
  );
}

interface AddTaskFormProps {
  defaultDate: 'today' | 'tomorrow';
  today: string;
  tomorrow: string;
  filterCategory: string;
  onSetFilterCategory: (cat: string) => void;
  onRefresh: (tab: 'today' | 'tomorrow') => void;
  onAdd?: () => void;
}

function AddTaskForm({ defaultDate, today, tomorrow, filterCategory, onSetFilterCategory, onRefresh, onAdd }: AddTaskFormProps) {
  const [localTitle, setLocalTitle] = useState('');
  const [localCategory, setLocalCategory] = useState('');
  const [localFromTime, setLocalFromTime] = useState('');
  const [localToTime, setLocalToTime] = useState('');
  const [localIsProductive, setLocalIsProductive] = useState(true);
  const [localAutoFill, setLocalAutoFill] = useState(false);

  async function handleAdd() {
    if (!localTitle.trim()) return;
    const dateValue = defaultDate === 'tomorrow' ? tomorrow : today;
    try {
      const r = await fetch('/api/time/tasks', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: localTitle, category: localCategory || 'other', isProductive: localIsProductive, date: dateValue, fromTime: localFromTime || undefined, toTime: localToTime || undefined }),
      });
      if (r.ok) {
        toast.success(defaultDate === 'tomorrow' ? 'Task planned for tomorrow' : 'Task added');
        setLocalTitle(''); setLocalCategory(''); setLocalFromTime(''); setLocalToTime(''); setLocalIsProductive(true); setLocalAutoFill(false);
        onRefresh(defaultDate);
        window.dispatchEvent(new CustomEvent('xp-updated')); window.dispatchEvent(new CustomEvent('notification-updated'));
        onAdd?.();
      }
    } catch {}
  }

  async function localClassify(title: string) {
    if (!title.trim()) return;
    try {
      const r = await fetch('/api/ai/classify-task', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      if (r.ok) {
        const data = await r.json();
        if (data.category) { setLocalCategory(data.category); setLocalAutoFill(true); }
        if (data.isProductive !== undefined) { setLocalIsProductive(data.isProductive); }
        setTimeout(() => setLocalAutoFill(false), 3000);
      }
    } catch {}
  }

  return (
    <GlassCard className="p-4">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">
        {defaultDate === 'tomorrow' ? '🌙 Plan Tomorrow' : t('time.addTask')}
      </h3>
      <div className="flex gap-2 mb-3">
        <div className="flex-1 relative">
          <Input value={localTitle} onChange={e => setLocalTitle(e.target.value)} onBlur={() => { if (localTitle.trim()) localClassify(localTitle); }} placeholder={defaultDate === 'tomorrow' ? 'What will you do tomorrow?' : t('time.addTask')} className="bg-accent border-border text-foreground placeholder:text-muted-foreground/50 pr-8" />
          <AnimatePresence>
            {localAutoFill && <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} className="absolute right-2 top-1/2 -translate-y-1/2"><Sparkles size={16} className="text-purple-400" /></motion.div>}
          </AnimatePresence>
        </div>
        <select value={localCategory} onChange={e => setLocalCategory(e.target.value)} className={`bg-accent border border-border text-foreground rounded-md px-2 text-sm ${localAutoFill ? 'border-purple-500/50' : ''}`}>
          <option value="" className="bg-background">Category</option>
          {CATEGORIES.map(c => <option key={c} value={c} className="bg-background">{t(`category.${c}`)}</option>)}
        </select>
        <Button onClick={handleAdd} className="gradient-blue shrink-0"><Plus size={16} /></Button>
      </div>
      <div className="flex gap-2 mb-3">
        <Input type="time" value={localFromTime} onChange={e => setLocalFromTime(e.target.value)} className="bg-accent border-border text-foreground text-xs w-28" />
        <span className="text-muted-foreground/50 self-center">to</span>
        <Input type="time" value={localToTime} onChange={e => setLocalToTime(e.target.value)} className="bg-accent border-border text-foreground text-xs w-28" />
      </div>
      <div className="flex gap-2 flex-wrap">
        <SelectPill label="All" selected={filterCategory === 'all'} onClick={() => onSetFilterCategory('all')} color="blue" />
        {CATEGORIES.map(c => <SelectPill key={c} label={t(`category.${c}`)} selected={filterCategory === c} onClick={() => onSetFilterCategory(c)} color="blue" />)}
      </div>
    </GlassCard>
  );
}

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
                  <StatusBadge status={r.status} />
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
  const [activeTab, setActiveTab] = useState('today');
  const [tasks, setTasks] = useState<any[]>([]);
  const [tomorrowTasks, setTomorrowTasks] = useState<any[]>([]);
  const [focusSessions, setFocusSessions] = useState<any[]>([]);

  const [filterCategory, setFilterCategory] = useState('all');

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

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = getTomorrow();
  const [historyTasks, setHistoryTasks] = useState<Record<string, any[]>>({});
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});

  const fetchTasks = useCallback(async () => {
    try {
      const r = await fetch(`/api/time/tasks?date=${today}`);
      if (r.ok) { const d = await r.json(); setTasks(Array.isArray(d) ? d : d.tasks || []); }
    } catch {}
  }, [today]);

  const fetchTomorrowTasks = useCallback(async () => {
    try {
      const r = await fetch(`/api/time/tasks?date=${tomorrow}`);
      if (r.ok) { const d = await r.json(); setTomorrowTasks(Array.isArray(d) ? d : d.tasks || []); }
    } catch {}
  }, [tomorrow]);

  const fetchFocusSessions = useCallback(async () => {
    try { const r = await fetch(`/api/time/focus?date=${today}`); if (r.ok) { const d = await r.json(); setFocusSessions(Array.isArray(d) ? d : d.sessions || []); } } catch {}
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
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (i + 1));
      return d.toISOString().split('T')[0];
    });
    Promise.all(last7.map(async dateStr => {
      try {
        const r = await fetch(`/api/time/tasks?date=${dateStr}`);
        if (r.ok) { const d = await r.json(); return { dateStr, tasks: Array.isArray(d) ? d : d.tasks || [] }; }
      } catch {}
      return { dateStr, tasks: [] as any[] };
    })).then(results => {
      const map: Record<string, any[]> = {};
      results.forEach(r => { map[r.dateStr] = r.tasks; });
      setHistoryTasks(prev => ({ ...prev, ...map }));
    });
  }, [fetchTasks, fetchTomorrowTasks, fetchFocusSessions, fetchReviewData, fetchPlanningInsights]);

  // Timer logic
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
    if (currentStatus === 'completed') {
      await updateTaskStatus(taskId, 'pending', currentTab);
    } else {
      await updateTaskStatus(taskId, 'completed', currentTab);
    }
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
    const markMissed = async () => {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
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
    markMissed();
  }, []);

  const filteredTodayTasks = filterCategory === 'all' ? tasks : tasks.filter((t: any) => t.category === filterCategory);
  const filteredTomorrowTasks = filterCategory === 'all' ? tomorrowTasks : tomorrowTasks.filter((t: any) => t.category === filterCategory);

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {isAfter7PM() && activeTab === 'today' && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Moon size={18} className="text-indigo-400" />
            <span className="text-sm text-foreground font-medium">Plan Tomorrow</span>
            <span className="text-xs text-muted-foreground">— Set up tomorrow&apos;s tasks now</span>
          </div>
          <Button onClick={() => setActiveTab('tomorrow')} size="sm" className="gradient-blue text-xs h-7">Plan Tomorrow</Button>
        </motion.div>
      )}

      {activeTab === 'tomorrow' && planningInsights.length > 0 && (
        <GlassCard className="p-3 border-purple-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-purple-400" />
            <span className="text-xs font-medium text-purple-400">Planning Insights</span>
          </div>
          <div className="space-y-1">
            {planningInsights.map((insight, i) => (
              <p key={i} className="text-xs text-muted-foreground">• {insight}</p>
            ))}
          </div>
        </GlassCard>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-accent border border-border w-full flex overflow-x-auto">
          {['today', 'tomorrow', 'review', 'focusTimer', 'aiCoach'].map(tab => (
            <TabsTrigger key={tab} value={tab} className="text-muted-foreground data-[state=active]:text-blue-400 data-[state=active]:bg-blue-600/20 text-xs flex-1">
              {tab === 'tomorrow' ? (isAfter7PM() ? '🌙 Tomorrow' : 'Tomorrow') :
               tab === 'review' ? 'Review' :
               tab === 'focusTimer' ? 'Focus' :
               tab === 'aiCoach' ? 'AI Coach' :
               'Today'}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Today Tab */}
        <TabsContent value="today" className="space-y-4 mt-4">
          <AddTaskForm defaultDate="today" today={today} tomorrow={tomorrow} filterCategory={filterCategory} onSetFilterCategory={setFilterCategory} onRefresh={refreshTab} />
          <div className="space-y-2">
            {filteredTodayTasks.map((task: any) => (
              <TaskCard key={task.id} task={task} currentTab="today" onToggleTask={toggleTask} onUpdateTaskStatus={updateTaskStatus} onDeleteTask={deleteTask} onSetReflectionModal={setReflectionModal} onRefresh={refreshTab} />
            ))}
            {tasks.length === 0 && (
              <p className="text-center text-muted-foreground/50 py-8 text-sm">No tasks for today. Add one above!</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={rankUnproductive} variant="ghost" className="text-purple-400 hover:text-purple-300 text-xs"><Sparkles size={14} className="mr-1" />{t('time.aiRankUnproductive')}</Button>
            <Button onClick={async () => { await fetch('/api/time/tasks', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resetAll: true }) }); fetchTasks(); window.dispatchEvent(new CustomEvent('xp-updated')); window.dispatchEvent(new CustomEvent('notification-updated')); }} variant="ghost" className="text-red-400 hover:text-red-300 text-xs">{t('common.reset')} All</Button>
          </div>

          {/* Past 7 Days History */}
          <div className="space-y-2 mt-4">
            <p className="text-xs text-muted-foreground/50 px-1">Past 7 Days</p>
            {Array.from({ length: 7 }, (_, i) => {
              const d = new Date(); d.setDate(d.getDate() - (i + 1));
              return d.toISOString().split('T')[0];
            }).map(dateStr => {
              const dayTasks = historyTasks[dateStr] || [];
              const isExp = expandedDays[dateStr] ?? false;
              const completedCount = dayTasks.filter((task: any) => task.status === 'completed').length;
              const partialCount = dayTasks.filter((task: any) => task.status === 'partially_completed').length;
              const missedCount = dayTasks.filter((task: any) => task.status === 'missed').length;
              const totalCount = dayTasks.length;
              const score = totalCount > 0 ? Math.round(((completedCount + partialCount * 0.6) / totalCount) * 100) : null;
              const label = new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
              const scoreColor = score !== null ? (score >= 80 ? 'bg-green-100 text-green-700' : score >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700') : '';

              return (
                <GlassCard key={dateStr} className="overflow-hidden">
                  <div
                    className="p-3 flex items-center justify-between cursor-pointer"
                    style={{ minHeight: 48 }}
                    onClick={() => setExpandedDays(prev => ({ ...prev, [dateStr]: !isExp }))}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground">{label}</span>
                      {totalCount === 0 && <span className="text-xs text-muted-foreground/40 italic">No tasks</span>}
                    </div>
                    <div className="flex items-center gap-3">
                      {score !== null ? (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${scoreColor}`}>{score}%</span>
                      ) : (
                        <span className="text-xs text-muted-foreground/50">—</span>
                      )}
                      {totalCount > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-green-400">{completedCount}</span>
                          {partialCount > 0 && <span className="text-[10px] text-amber-400">+{partialCount}p</span>}
                          {missedCount > 0 && <span className="text-[10px] text-red-400">{missedCount}m</span>}
                        </div>
                      )}
                      <motion.div animate={{ rotate: isExp ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDown size={15} className="text-muted-foreground/50" />
                      </motion.div>
                    </div>
                  </div>
                  <AnimatePresence>
                    {isExp && dayTasks.length > 0 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 pb-3 border-t border-border/30 space-y-2 pt-2">
                          {dayTasks.map((task: any) => (
                            <div key={task.id} className={`flex items-center gap-3 py-1.5 px-2 rounded-lg bg-accent/30 ${task.status === 'completed' ? 'opacity-60' : ''}`}>
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                task.status === 'completed' ? 'bg-green-500 border-green-500' :
                                task.status === 'missed' ? 'bg-red-500/30 border-red-500' :
                                task.status === 'partially_completed' ? 'bg-amber-500/30 border-amber-500' :
                                'border-border'
                              }`}>
                                <StatusIcon status={task.status} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs ${task.status === 'completed' ? 'line-through text-muted-foreground/50' : 'text-foreground'}`}>{task.title}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <StatusBadge status={task.status} />
                                  {task.reflectionNote && <span className="text-[10px] text-amber-400/70 italic">&ldquo;{task.reflectionNote.substring(0, 40)}{task.reflectionNote.length > 40 ? '...' : ''}&rdquo;</span>}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              );
            })}
          </div>
        </TabsContent>

        {/* Tomorrow Tab */}
        <TabsContent value="tomorrow" className="space-y-4 mt-4">
          <AddTaskForm defaultDate="tomorrow" today={today} tomorrow={tomorrow} filterCategory={filterCategory} onSetFilterCategory={setFilterCategory} onRefresh={refreshTab} />
          <div className="space-y-2">
            {filteredTomorrowTasks.map((task: any) => (
              <TaskCard key={task.id} task={task} currentTab="tomorrow" onToggleTask={toggleTask} onUpdateTaskStatus={updateTaskStatus} onDeleteTask={deleteTask} onSetReflectionModal={setReflectionModal} onRefresh={refreshTab} />
            ))}
            {tomorrowTasks.length === 0 && (
              <div className="text-center py-8">
                <Moon size={32} className="text-indigo-400/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground/50">No tasks planned for tomorrow yet.</p>
                <p className="text-xs text-muted-foreground/30 mt-1">Plan ahead — add tasks above to set up your day.</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Review Tab */}
        <TabsContent value="review" className="space-y-4 mt-4">
          <ReviewTab reviewData={reviewData} />
        </TabsContent>

        {/* Focus Timer Tab */}
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

        {/* AI Coach Tab */}
        <TabsContent value="aiCoach" className="space-y-4 mt-4">
          <GlassCard className="p-4 h-[500px] flex flex-col">
            <div className="flex items-center gap-2 mb-3"><Bot size={18} className="text-purple-400" /><span className="text-sm font-medium text-foreground">{t('time.aiCoach')}</span><button onClick={startNewChat} className="ml-auto text-xs text-muted-foreground hover:text-blue-400 flex items-center gap-1"><Plus size={12} />New Chat</button></div>
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

      {/* Reflection Modal */}
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
                <span className="ml-2"><StatusBadge status={reflectionModal.status} /></span>
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
