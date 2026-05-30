'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Plus, Trash2, Sparkles, Check, Play, Pause, RotateCcw, Send, Bot, Loader2, ChevronDown } from 'lucide-react';
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
const TABS_LIST = ['tasks', 'focusTimer', 'insights', 'aiCoach'];

function formatTime(time: string): string {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${m.toString().padStart(2, '0')} ${ampm}`;
}

export default function TimeClient() {
  const { profile } = useUserStore();
  const [activeTab, setActiveTab] = useState('tasks');
  const [tasks, setTasks] = useState<any[]>([]);
  const [focusSessions, setFocusSessions] = useState<any[]>([]);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCategory, setTaskCategory] = useState('');
  const [taskFromTime, setTaskFromTime] = useState('');
  const [taskToTime, setTaskToTime] = useState('');
  const [categoryAutoFilled, setCategoryAutoFilled] = useState(false);
  const [autoFillTimeout, setAutoFillTimeout] = useState<NodeJS.Timeout | null>(null);

  const [filterCategory, setFilterCategory] = useState('all');

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
  const [conversationId, setConversationId] = useState<string|null>(null);

  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [historyTasks, setHistoryTasks] = useState<Record<string, any[]>>({});
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});

  const isDayEnded = (dateStr: string) => dateStr < today;

  const fetchTasksForDate = useCallback(async (dateStr: string) => {
    try {
      const r = await fetch(`/api/time/tasks?date=${dateStr}`);
      if (r.ok) {
        const d = await r.json();
        const t = Array.isArray(d) ? d : d.tasks || [];
        setHistoryTasks(prev => ({ ...prev, [dateStr]: t }));
      }
    } catch {}
  }, []);

  const fetchTasks = useCallback(async () => {
    try { const r = await fetch(`/api/time/tasks?date=${today}`); if (r.ok) { const d = await r.json(); setTasks(Array.isArray(d) ? d : d.tasks || []); } } catch {}
  }, [today]);

  const fetchFocusSessions = useCallback(async () => {
    try { const r = await fetch(`/api/time/focus?date=${today}`); if (r.ok) { const d = await r.json(); setFocusSessions(Array.isArray(d) ? d : d.sessions || []); } } catch {}
  }, [today]);

  useEffect(() => {
    fetchTasks(); fetchFocusSessions();
    // Load last 7 days of task history
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (i + 1));
      return d.toISOString().split('T')[0];
    });
    Promise.all(last7.map(async dateStr => {
      try {
        const r = await fetch(`/api/time/tasks?date=${dateStr}`);
        if (r.ok) {
          const d = await r.json();
          return { dateStr, tasks: Array.isArray(d) ? d : d.tasks || [] };
        }
      } catch {}
      return { dateStr, tasks: [] as any[] };
    })).then(results => {
      const map: Record<string, any[]> = {};
      results.forEach(r => { map[r.dateStr] = r.tasks; });
      setHistoryTasks(prev => ({ ...prev, ...map }));
    });
  }, [fetchTasks, fetchFocusSessions]);

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

  // AI Classify task on blur
  const [taskIsProductive, setTaskIsProductive] = useState(true);

  async function classifyTask(title: string) {
    if (!title.trim()) return;
    try {
      const r = await fetch('/api/ai/classify-task', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      if (r.ok) {
        const data = await r.json();
        if (data.category) { setTaskCategory(data.category); setCategoryAutoFilled(true); }
        if (data.isProductive !== undefined) { setTaskIsProductive(data.isProductive); }
        setTimeout(() => setCategoryAutoFilled(false), 3000);
      }
    } catch {}
  }

  async function addTask() {
    if (!taskTitle.trim()) return;
    try {
      const r = await fetch('/api/time/tasks', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: taskTitle, category: taskCategory || 'other', isProductive: taskIsProductive, date: today, fromTime: taskFromTime || undefined, toTime: taskToTime || undefined }),
      });
      if (r.ok) {
        toast.success(`+5 ${t('xp.earned')}`);
        setTaskTitle(''); setTaskCategory(''); setTaskFromTime(''); setTaskToTime(''); setCategoryAutoFilled(false); setTaskIsProductive(true);
        fetchTasks();
        window.dispatchEvent(new CustomEvent('xp-updated')); window.dispatchEvent(new CustomEvent('notification-updated'));
      }
    } catch {}
  }

  async function toggleTask(taskId: string, currentStatus: string) {
    try {
      const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
      await fetch('/api/time/tasks', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, status: newStatus }),
      });
      fetchTasks();
    } catch {}
  }

  async function deleteTask(id: string) {
    try {
      await fetch('/api/time/tasks', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      toast.success(`-5 XP`);
      fetchTasks();
      window.dispatchEvent(new CustomEvent('xp-updated')); window.dispatchEvent(new CustomEvent('notification-updated'));
    } catch {}
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

  const filteredTasks = filterCategory === 'all' ? tasks : tasks.filter((t: any) => t.category === filterCategory);

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-accent border border-border w-full flex overflow-x-auto">
          {TABS_LIST.map(tab => <TabsTrigger key={tab} value={tab} className="text-muted-foreground data-[state=active]:text-blue-400 data-[state=active]:bg-blue-600/20 text-xs flex-1">{t(`time.${tab}`)}</TabsTrigger>)}
        </TabsList>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4 mt-4">
          {/* Date selector */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              max={today}
              onChange={e => {
                setSelectedDate(e.target.value);
                if (e.target.value !== today && !historyTasks[e.target.value]) {
                  fetchTasksForDate(e.target.value);
                }
              }}
              className="bg-accent border border-border text-foreground rounded-md px-3 py-1.5 text-sm"
            />
            {selectedDate !== today && (
              <button
                onClick={() => setSelectedDate(today)}
                className="text-xs text-blue-400 hover:underline"
              >
                Back to today
              </button>
            )}
          </div>

          {/* Day card for selected date */}
          {selectedDate !== today && (() => {
            const dateTasks = historyTasks[selectedDate] || [];
            const ended = isDayEnded(selectedDate);
            const isExpanded = expandedDays[selectedDate] ?? false;
            const completedCount = dateTasks.filter((task: any) => task.status === 'completed').length;
            const totalCount = dateTasks.length;
            const score = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : null;
            const dayLabel = new Date(selectedDate + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
            const scoreColor = score !== null ? (score >= 80 ? 'bg-green-100 text-green-700' : score >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700') : '';

            return (
              <GlassCard className="overflow-hidden">
                <div
                  className="p-3 flex items-center justify-between cursor-pointer"
                  style={{ minHeight: 56 }}
                  onClick={() => setExpandedDays(prev => ({ ...prev, [selectedDate]: !isExpanded }))}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{dayLabel}</span>
                    <span className="text-xs text-muted-foreground">{totalCount} tasks</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {score !== null ? (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${scoreColor}`}>{score}%</span>
                    ) : (
                      <span className="text-xs text-muted-foreground/50">—</span>
                    )}
                    <span className="text-[10px] text-muted-foreground">{completedCount} of {totalCount} completed</span>
                    <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown size={16} className="text-muted-foreground/50" />
                    </motion.div>
                  </div>
                </div>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-3 pb-3 border-t border-border/30 space-y-2 pt-2">
                        {dateTasks.length === 0 && (
                          <p className="text-xs text-muted-foreground/50 italic text-center py-4">No tasks logged for this day</p>
                        )}
                        {dateTasks.map((task: any) => {
                          const isDone = task.status === 'completed';
                          return (
                            <div key={task.id} className={`flex items-center gap-3 py-1.5 px-2 rounded-lg bg-accent/30 ${isDone ? 'opacity-60' : ''}`}>
                              <div className={`w-4 h-4 rounded-full border ${isDone ? 'bg-green-500 border-green-500' : 'border-border'} flex items-center justify-center shrink-0`}>
                                {isDone && <Check size={10} className="text-white" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs ${isDone ? 'line-through text-muted-foreground/50' : 'text-foreground'}`}>{task.title}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  {task.fromTime && task.toTime && <span className="text-[10px] text-blue-400">{formatTime(task.fromTime)} - {formatTime(task.toTime)}</span>}
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${task.isProductive ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'}`}>
                                    {task.isProductive ? 'Productive' : 'Unproductive'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            );
          })()}

          {/* Today's task list (always shown when selectedDate is today) */}
          {selectedDate === today && (
            <>
              <GlassCard className="p-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">{t('time.addTask')}</h3>
                <div className="flex gap-2 mb-3">
                  <div className="flex-1 relative">
                    <Input value={taskTitle} onChange={e => setTaskTitle(e.target.value)} onBlur={() => { if (taskTitle.trim()) classifyTask(taskTitle); }} placeholder={t('time.addTask')} className="bg-accent border-border text-foreground placeholder:text-muted-foreground/50 pr-8" />
                    <AnimatePresence>
                      {categoryAutoFilled && <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} className="absolute right-2 top-1/2 -translate-y-1/2"><Sparkles size={16} className="text-purple-400" /></motion.div>}
                    </AnimatePresence>
                  </div>
                  <select value={taskCategory} onChange={e => setTaskCategory(e.target.value)} className={`bg-accent border border-border text-foreground rounded-md px-2 text-sm ${categoryAutoFilled ? 'border-purple-500/50' : ''}`}>
                    <option value="" className="bg-background">Category</option>
                    {CATEGORIES.map(c => <option key={c} value={c} className="bg-background">{t(`category.${c}`)}</option>)}
                  </select>
                  <Button onClick={addTask} className="gradient-blue shrink-0"><Plus size={16} /></Button>
                </div>
                <div className="flex gap-2 mb-3">
                  <Input type="time" value={taskFromTime} onChange={e => setTaskFromTime(e.target.value)} className="bg-accent border-border text-foreground text-xs w-28" />
                  <span className="text-muted-foreground/50 self-center">to</span>
                  <Input type="time" value={taskToTime} onChange={e => setTaskToTime(e.target.value)} className="bg-accent border-border text-foreground text-xs w-28" />
                </div>
                <div className="flex gap-2 flex-wrap mb-4">
                  <SelectPill label="All" selected={filterCategory === 'all'} onClick={() => setFilterCategory('all')} color="blue" />
                  {CATEGORIES.map(c => <SelectPill key={c} label={t(`category.${c}`)} selected={filterCategory === c} onClick={() => setFilterCategory(c)} color="blue" />)}
                </div>
              </GlassCard>
              <div className="space-y-2">
                {filteredTasks.map((task: any) => {
                  const isDone = task.status === 'completed';
                  return (
                  <GlassCard key={task.id} className={`p-3 flex items-center gap-3 ${isDone ? 'opacity-60' : ''}`}>
                    <button onClick={() => toggleTask(task.id, task.status)} className={`w-5 h-5 rounded-full border ${isDone ? 'bg-green-500 border-green-500' : 'border-border'} flex items-center justify-center`}>
                      {isDone && <Check size={12} className="text-white" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${isDone ? 'line-through text-muted-foreground/50' : 'text-foreground'}`}>{task.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {task.fromTime && task.toTime && <span className="text-[10px] text-blue-400">{formatTime(task.fromTime)} - {formatTime(task.toTime)}</span>}
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${task.isProductive ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'}`}>
                          {task.isProductive ? t('time.productive') : t('time.unproductive')}
                        </span>
                        {task.category && <span className="text-[10px] text-muted-foreground/50">{t(`category.${task.category}`)}</span>}
                      </div>
                    </div>
                    <button onClick={() => deleteTask(task.id)} className="text-muted-foreground/50 hover:text-red-400"><Trash2 size={14} /></button>
                  </GlassCard>
                );
                })}
              </div>
              <div className="flex gap-2">
                <Button onClick={rankUnproductive} variant="ghost" className="text-purple-400 hover:text-purple-300 text-xs"><Sparkles size={14} className="mr-1" />{t('time.aiRankUnproductive')}</Button>
                <Button onClick={async () => { await fetch('/api/time/tasks', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resetAll: true }) }); fetchTasks(); window.dispatchEvent(new CustomEvent('xp-updated')); window.dispatchEvent(new CustomEvent('notification-updated')); }} variant="ghost" className="text-red-400 hover:text-red-300 text-xs">{t('common.reset')} All</Button>
              </div>
            </>
          )}

          {/* View history — last 7 days (excluding today) */}
          <div className="space-y-2 mt-2">
            <p className="text-xs text-muted-foreground/50 px-1">Past 7 Days</p>
            {Array.from({ length: 7 }, (_, i) => {
              const d = new Date(); d.setDate(d.getDate() - (i + 1));
              return d.toISOString().split('T')[0];
            }).map(dateStr => {
              const dayTasks = historyTasks[dateStr] || [];
              const isExp = expandedDays[dateStr] ?? false;
              const completedCount = dayTasks.filter((task: any) => task.status === 'completed').length;
              const totalCount = dayTasks.length;
              const score = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : null;
              const label = new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
              const scoreColor = score !== null ? (score >= 80 ? 'bg-green-100 text-green-700' : score >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700') : '';

              return (
                <GlassCard key={dateStr} className="overflow-hidden">
                  <div
                    className="p-3 flex items-center justify-between cursor-pointer"
                    style={{ minHeight: 56 }}
                    onClick={() => setExpandedDays(prev => ({ ...prev, [dateStr]: !isExp }))}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground">{label}</span>
                      {totalCount === 0 && <span className="text-xs text-muted-foreground/40 italic">No tasks logged</span>}
                    </div>
                    <div className="flex items-center gap-3">
                      {score !== null ? (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${scoreColor}`}>{score}%</span>
                      ) : (
                        <span className="text-xs text-muted-foreground/50">—</span>
                      )}
                      {totalCount > 0 && <span className="text-[10px] text-muted-foreground">{completedCount} of {totalCount} completed</span>}
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
                          {dayTasks.map((task: any) => {
                            const isDone = task.status === 'completed';
                            return (
                              <div key={task.id} className={`flex items-center gap-3 py-1.5 px-2 rounded-lg bg-accent/30 ${isDone ? 'opacity-60' : ''}`}>
                                <div className={`w-4 h-4 rounded-full border ${isDone ? 'bg-green-500 border-green-500' : 'border-border'} flex items-center justify-center shrink-0`}>
                                  {isDone && <Check size={10} className="text-white" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-xs ${isDone ? 'line-through text-muted-foreground/50' : 'text-foreground'}`}>{task.title}</p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    {task.fromTime && task.toTime && <span className="text-[10px] text-blue-400">{formatTime(task.fromTime)} - {formatTime(task.toTime)}</span>}
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${task.isProductive ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'}`}>
                                      {task.isProductive ? 'Productive' : 'Unproductive'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              );
            })}
          </div>
        </TabsContent>

        {/* Focus Timer Tab */}
        <TabsContent value="focusTimer" className="space-y-4 mt-4">
          <GlassCard className="p-6 flex flex-col items-center">
            {/* Timer presets */}
            <div className="flex gap-2 mb-6 flex-wrap justify-center">
              {[15, 25, 45, 60].map(m => (
                <SelectPill key={m} label={`${m}m`} selected={timerMinutes === m && !customMinutes} onClick={() => { setTimerMinutes(m); setTimerSeconds(m * 60); setCustomMinutes(''); }} color="blue" />
              ))}
              <div className="flex items-center gap-1">
                <Input type="number" value={customMinutes} onChange={e => { setCustomMinutes(e.target.value); if (e.target.value) { const m = parseInt(e.target.value); if (m > 0) { setTimerMinutes(m); setTimerSeconds(m * 60); } } }} placeholder="Custom" className="bg-accent border-border text-foreground w-20 text-xs h-8" />
                <span className="text-muted-foreground/50 text-xs">min</span>
              </div>
            </div>
            {/* Circular Timer */}
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
          {/* Focus sessions list */}
          <div className="space-y-2">
            {focusSessions.map((s: any) => (
              <GlassCard key={s.id} className="p-3 flex items-center justify-between">
                <div><p className="text-sm text-foreground">{s.taskName || `Focus ${s.duration}min`}</p><p className="text-[10px] text-muted-foreground/70">{s.duration}min · {s.date}</p></div>
                <button onClick={() => deleteFocusSession(s.id)} className="text-muted-foreground/50 hover:text-red-400"><Trash2 size={14} /></button>
              </GlassCard>
            ))}
          </div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4 mt-4">
          <GlassCard className="p-5">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Weekly Productivity</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-accent rounded-lg"><p className="text-2xl font-bold text-foreground">{tasks.filter((t: any) => t.isProductive).length}</p><p className="text-xs text-green-400">{t('time.productive')}</p></div>
              <div className="text-center p-3 bg-accent rounded-lg"><p className="text-2xl font-bold text-foreground">{tasks.filter((t: any) => !t.isProductive).length}</p><p className="text-xs text-red-400">{t('time.unproductive')}</p></div>
              <div className="text-center p-3 bg-accent rounded-lg"><p className="text-2xl font-bold text-foreground">{focusSessions.reduce((a: number, s: any) => a + (s.duration || 0), 0)}</p><p className="text-xs text-blue-400">Focus min</p></div>
              <div className="text-center p-3 bg-accent rounded-lg"><p className="text-2xl font-bold text-foreground">{tasks.filter((t: any) => t.status === 'completed').length}/{tasks.length}</p><p className="text-xs text-amber-400">Completed</p></div>
            </div>
          </GlassCard>
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
    </div>
  );
}
