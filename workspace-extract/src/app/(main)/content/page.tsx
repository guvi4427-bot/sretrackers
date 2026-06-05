'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { PenTool, Plus, Trash2, Sparkles, Send, Bot, Loader2, Calendar, BookOpen, FileText, Film, Eye, Check, ChevronLeft, ChevronRight, Video, Edit3, ExternalLink, Share2 } from 'lucide-react';
import { GlassCard } from '@/components/glass-card';
import { AIMessage } from '@/components/ai-message';
import { SelectPill } from '@/components/select-pill';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useUserStore } from '@/stores/user-store';
import { t } from '@/lib/i18n';
import { PLATFORMS } from '@/lib/constants';

const TABS_LIST = ['overview', 'series', 'calendar', 'createEntry', 'aiAssistant'];
const STATUS_OPTIONS = ['idea', 'drafting', 'editing', 'published', 'archived'];
const CONTENT_TYPES = ['blog', 'video', 'post'] as const;
const SERIES_CATEGORIES = [
  { value: '', label: 'General' },
  { value: 'script', label: 'Script' },
  { value: 'video', label: 'Video' },
  { value: 'blog', label: 'Blog' },
] as const;

// Live status pipeline per content type
const LIVE_STATUS_PIPELINES: Record<string, { key: string; label: string; color: string; icon: any }[]> = {
  blog: [
    { key: 'not_started', label: 'Not Started', color: 'text-muted-foreground bg-white/5', icon: FileText },
    { key: 'written', label: 'Written', color: 'text-blue-400 bg-blue-600/20', icon: PenTool },
    { key: 'posted', label: 'Posted', color: 'text-green-400 bg-green-600/20', icon: ExternalLink },
  ],
  video: [
    { key: 'not_started', label: 'Not Started', color: 'text-muted-foreground bg-white/5', icon: Film },
    { key: 'scripted', label: 'Scripted', color: 'text-purple-400 bg-purple-600/20', icon: PenTool },
    { key: 'shoot', label: 'Shoot', color: 'text-red-400 bg-red-600/20', icon: Video },
    { key: 'edit', label: 'Edit', color: 'text-amber-400 bg-amber-600/20', icon: Edit3 },
    { key: 'posted', label: 'Posted', color: 'text-green-400 bg-green-600/20', icon: ExternalLink },
  ],
  post: [
    { key: 'not_started', label: 'Not Started', color: 'text-muted-foreground bg-white/5', icon: FileText },
    { key: 'shoot', label: 'Shoot', color: 'text-red-400 bg-red-600/20', icon: Video },
    { key: 'edit', label: 'Edit', color: 'text-amber-400 bg-amber-600/20', icon: Edit3 },
    { key: 'posted', label: 'Posted', color: 'text-green-400 bg-green-600/20', icon: ExternalLink },
  ],
};

function getPipeline(contentType: string) {
  return LIVE_STATUS_PIPELINES[contentType] || LIVE_STATUS_PIPELINES.post;
}

function getPipelineStepIndex(contentType: string, liveStatus: string) {
  const pipeline = getPipeline(contentType);
  return pipeline.findIndex(s => s.key === liveStatus);
}

export default function ContentPage() {
  const { profile } = useUserStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [series, setSeries] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const [selectedSeries, setSelectedSeries] = useState('');
  const [entryTitle, setEntryTitle] = useState('');
  const [entryContent, setEntryContent] = useState('');
  const [entryStatus, setEntryStatus] = useState('draft');
  const [entryContentType, setEntryContentType] = useState<string>('post');
  const [entryPlatforms, setEntryPlatforms] = useState<string[]>([]);
  const [entryShootDate, setEntryShootDate] = useState('');
  const [entryPostDate, setEntryPostDate] = useState('');
  const [newSeriesName, setNewSeriesName] = useState('');
  const [newSeriesCategory, setNewSeriesCategory] = useState('');
  const [aiReview, setAiReview] = useState<any>(null);
  const [aiPostingTime, setAiPostingTime] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<{role:string;content:string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string|null>(null);
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [seriesDetail, setSeriesDetail] = useState<any>(null);
  const [seriesDetailOpen, setSeriesDetailOpen] = useState(false);
  const [seriesDetailEntries, setSeriesDetailEntries] = useState<any[]>([]);
  const [seriesDetailLoading, setSeriesDetailLoading] = useState(false);
  const [updatingLiveStatus, setUpdatingLiveStatus] = useState<string | null>(null);

  const fetchSeries = useCallback(async () => { try { const r = await fetch('/api/content/series'); if (r.ok) { const d = await r.json(); setSeries(Array.isArray(d) ? d : d.series || []); } } catch {} }, []);
  const fetchEntries = useCallback(async () => { try { const r = await fetch('/api/content/entries'); if (r.ok) { const d = await r.json(); setEntries(Array.isArray(d) ? d : d.entries || []); } } catch {} }, []);

  useEffect(() => { fetchSeries(); fetchEntries(); }, [fetchSeries, fetchEntries]);

  async function createSeries() {
    if (!newSeriesName.trim()) return;
    try { const r = await fetch('/api/content/series', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newSeriesName, category: newSeriesCategory || undefined }) }); if (r.ok) { setNewSeriesName(''); setNewSeriesCategory(''); fetchSeries(); } } catch {}
  }

  async function createEntry() {
    if (!entryTitle.trim()) return;
    try {
      const r = await fetch('/api/content/entries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ seriesId: selectedSeries || series[0]?.id, title: entryTitle, content: entryContent, status: entryStatus, contentType: entryContentType, platform: entryPlatforms.join(','), shootDate: entryShootDate || undefined, postDate: entryPostDate || undefined }) });
      if (r.ok) { toast.success(`+10 ${t('xp.earned')}`); setEntryTitle(''); setEntryContent(''); setEntryPlatforms([]); setEntryShootDate(''); setEntryPostDate(''); fetchEntries(); window.dispatchEvent(new CustomEvent('xp-updated')); window.dispatchEvent(new CustomEvent('notification-updated')); }
    } catch {}
  }

  async function updateLiveStatus(entryId: string, newStatus: string) {
    setUpdatingLiveStatus(entryId);
    try {
      const r = await fetch('/api/content/entries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: entryId, liveStatus: newStatus }),
      });
      if (r.ok) {
        toast.success(`Status updated to ${newStatus.replace('_', ' ')}`);
        fetchEntries();
        window.dispatchEvent(new CustomEvent('xp-updated'));
        window.dispatchEvent(new CustomEvent('notification-updated'));
        window.dispatchEvent(new CustomEvent('sharing-updated'));
      } else {
        const d = await r.json();
        toast.error(d.error || 'Failed to update status');
      }
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingLiveStatus(null);
    }
  }

  async function deleteEntry(id: string) { try { await fetch('/api/content/entries', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }); fetchEntries(); window.dispatchEvent(new CustomEvent('xp-updated')); window.dispatchEvent(new CustomEvent('notification-updated')); } catch {} }

  async function deleteSeries(id: string) {
    try {
      const r = await fetch(`/api/content/series?id=${id}`, { method: 'DELETE' });
      if (r.ok) {
        toast.success('Series deleted');
        fetchSeries();
        fetchEntries();
      } else {
        const d = await r.json();
        toast.error(d.error || 'Failed to delete series');
      }
    } catch { toast.error('Failed to delete series'); }
  }

  async function viewSeriesDetail(s: any) {
    setSeriesDetail(s);
    setSeriesDetailOpen(true);
    setSeriesDetailLoading(true);
    try {
      const r = await fetch(`/api/content/entries?seriesId=${s.id}`);
      if (r.ok) {
        const d = await r.json();
        setSeriesDetailEntries(Array.isArray(d) ? d : d.entries || []);
      }
    } catch {} finally { setSeriesDetailLoading(false); }
  }

  async function scriptReview() {
    if (!entryContent.trim()) return; setAiLoading(true);
    try { const r = await fetch('/api/ai/script-review', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: entryContent, platform: entryPlatforms[0] || 'general' }) }); if (r.ok) setAiReview(await r.json()); } catch {} finally { setAiLoading(false); }
  }

  async function postingTime() {
    setAiLoading(true);
    try { const r = await fetch('/api/ai/posting-time', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ platform: entryPlatforms[0] || 'general', content: entryContent }) }); if (r.ok) setAiPostingTime(await r.json()); } catch {} finally { setAiLoading(false); }
  }

  async function sendChat() {
    if (!chatInput.trim()) return; const msg = chatInput.trim(); setChatMessages(p => [...p, { role: 'user', content: msg }]); setChatInput(''); setChatLoading(true);
    try { const r = await fetch('/api/ai/chatbot', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: msg, botType: 'content', conversationId }) }); if (r.ok) { const d = await r.json(); setChatMessages(p => [...p, { role: 'assistant', content: d.reply || d.response }]); if (d.conversationId) setConversationId(d.conversationId); } } catch {} finally { setChatLoading(false); }
  }

  function startNewChat() {
    setChatMessages([]);
    setConversationId(null);
  }

  const published = entries.filter((e: any) => e.status === 'published');
  const drafts = entries.filter((e: any) => e.status !== 'published');
  const postedEntries = entries.filter((e: any) => e.liveStatus === 'posted');
  const inProgressEntries = entries.filter((e: any) => e.liveStatus !== 'posted' && e.liveStatus !== 'not_started');
  const togglePlatform = (p: string) => setEntryPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);

  const contentTypeIcon = (type: string) => {
    switch (type) {
      case 'blog': return <FileText size={12} />;
      case 'video': return <Film size={12} />;
      default: return <PenTool size={12} />;
    }
  };

  const contentTypeLabel = (type: string) => {
    switch (type) {
      case 'blog': return 'Blog';
      case 'video': return 'Video';
      case 'post': return 'Post';
      default: return type;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-accent border border-border w-full flex overflow-x-auto">
          {TABS_LIST.map(tab => <TabsTrigger key={tab} value={tab} className="text-muted-foreground data-[state=active]:text-blue-400 data-[state=active]:bg-blue-600/20 text-xs flex-1">{t(`content.${tab}`)}</TabsTrigger>)}
        </TabsList>

        {/* ═══ OVERVIEW TAB ═══ */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <GlassCard className="p-3 text-center"><p className="text-lg font-bold text-foreground">{entries.length}</p><p className="text-[10px] text-muted-foreground/70">Entries</p></GlassCard>
            <GlassCard className="p-3 text-center"><p className="text-lg font-bold text-foreground">{series.length}</p><p className="text-[10px] text-muted-foreground/70">Series</p></GlassCard>
            <GlassCard className="p-3 text-center"><p className="text-lg font-bold text-green-400">{postedEntries.length}</p><p className="text-[10px] text-muted-foreground/70">Live Posted</p></GlassCard>
            <GlassCard className="p-3 text-center"><p className="text-lg font-bold text-amber-400">{inProgressEntries.length}</p><p className="text-[10px] text-muted-foreground/70">In Progress</p></GlassCard>
          </div>

          {/* Live Status Overview */}
          <GlassCard className="p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Live Status Tracker
            </h3>

            {entries.length === 0 ? (
              <p className="text-xs text-muted-foreground/50 text-center py-6">No entries yet. Create one to start tracking live status.</p>
            ) : (
              <div className="space-y-3">
                {entries.map((entry: any) => {
                  const ct = entry.contentType || 'post';
                  const pipeline = getPipeline(ct);
                  const currentIdx = getPipelineStepIndex(ct, entry.liveStatus || 'not_started');

                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-accent/50 rounded-xl p-3"
                    >
                      {/* Entry Header */}
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-md flex items-center gap-1 ${ct === 'blog' ? 'bg-purple-600/20 text-purple-400' : ct === 'video' ? 'bg-red-600/20 text-red-400' : 'bg-blue-600/20 text-blue-400'}`}>
                            {contentTypeIcon(ct)}
                            {contentTypeLabel(ct)}
                          </span>
                          <p className="text-sm font-medium text-foreground truncate">{entry.title}</p>
                        </div>
                        <button onClick={() => deleteEntry(entry.id)} className="text-muted-foreground/30 hover:text-red-400 ml-2 p-1 shrink-0"><Trash2 size={12} /></button>
                      </div>

                      {/* Share Live Status */}
                      <div className="flex justify-end mt-1">
                        <button
                          onClick={() => {
                            const ct = entry.contentType || 'post';
                            const statusLabel = entry.liveStatus === 'posted' ? 'Posted' : entry.liveStatus === 'edit' ? 'Editing' : entry.liveStatus === 'shoot' ? 'Shooting' : entry.liveStatus === 'written' ? 'Written' : 'Not Started';
                            const shareText = `${ct === 'blog' ? '📝' : ct === 'video' ? '🎥' : '📱'} ${entry.title} — Status: ${statusLabel}`;
                            fetch('/api/posts', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ content: shareText }),
                            }).then(r => {
                              if (r.ok) { toast.success('Shared to feed!'); window.dispatchEvent(new CustomEvent('xp-updated')); window.dispatchEvent(new CustomEvent('notification-updated')); }
                              else toast.error('Failed to share');
                            }).catch(() => toast.error('Failed to share'));
                          }}
                          className="text-[10px] text-muted-foreground/40 hover:text-blue-400 flex items-center gap-1"
                        >
                          <Share2 size={10} /> Share status
                        </button>
                      </div>

                      {/* Pipeline Steps */}
                      <div className="flex items-center gap-0">
                        {pipeline.map((step, idx) => {
                          const isCompleted = idx < currentIdx;
                          const isCurrent = idx === currentIdx;
                          const isNext = idx === currentIdx + 1;
                          const StepIcon = step.icon;

                          return (
                            <div key={step.key} className="flex items-center flex-1 last:flex-none">
                              {/* Step Circle */}
                              <button
                                onClick={() => {
                                  if (idx <= currentIdx + 1 && idx > 0 && idx !== currentIdx) {
                                    updateLiveStatus(entry.id, step.key);
                                  }
                                }}
                                disabled={updatingLiveStatus === entry.id || idx > currentIdx + 1}
                                className={`
                                  relative flex items-center justify-center w-7 h-7 rounded-full shrink-0 transition-all duration-300
                                  ${isCompleted ? 'bg-green-500 text-white shadow-md shadow-green-500/20' : ''}
                                  ${isCurrent ? `${step.color} ring-2 ring-offset-1 ring-offset-background ring-current scale-110` : ''}
                                  ${!isCompleted && !isCurrent ? 'bg-white/5 text-muted-foreground/40' : ''}
                                  ${isNext ? 'hover:bg-white/10 hover:text-foreground cursor-pointer' : ''}
                                  ${idx > currentIdx + 1 ? 'cursor-not-allowed' : ''}
                                `}
                              >
                                {isCompleted ? (
                                  <Check size={12} strokeWidth={3} />
                                ) : isCurrent ? (
                                  <StepIcon size={12} />
                                ) : (
                                  <StepIcon size={11} />
                                )}
                                {isCurrent && (
                                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-current" />
                                )}
                              </button>

                              {/* Connector Line */}
                              {idx < pipeline.length - 1 && (
                                <div className={`h-0.5 flex-1 mx-1 rounded-full transition-all duration-500 ${isCompleted ? 'bg-green-500/60' : isCurrent ? 'bg-gradient-to-r from-current/40 to-transparent' : 'bg-white/5'}`} />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Step Labels */}
                      <div className="flex items-center mt-1.5">
                        {pipeline.map((step, idx) => (
                          <div key={step.key} className={`flex-1 text-center last:flex-none ${idx === currentIdx ? 'text-foreground' : 'text-muted-foreground/40'}`}>
                            <span className={`text-[9px] font-medium ${idx === currentIdx ? step.color.split(' ')[0] : ''}`}>{step.label}</span>
                          </div>
                        ))}
                      </div>

                      {/* Advance Button */}
                      {currentIdx < pipeline.length - 1 && (
                        <div className="flex justify-end mt-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs h-7 gap-1 text-blue-400 hover:text-blue-300 hover:bg-blue-600/10"
                            onClick={() => updateLiveStatus(entry.id, pipeline[currentIdx + 1].key)}
                            disabled={updatingLiveStatus === entry.id}
                          >
                            {updatingLiveStatus === entry.id ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <>
                                Mark as {pipeline[currentIdx + 1].label}
                                <ChevronRight size={12} />
                              </>
                            )}
                          </Button>
                        </div>
                      )}

                      {/* Completed Badge */}
                      {currentIdx === pipeline.length - 1 && (
                        <div className="flex justify-end mt-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-600/20 text-green-400 font-medium flex items-center gap-1">
                            <Check size={10} /> Live
                          </span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </GlassCard>
        </TabsContent>

        {/* ═══ SERIES TAB ═══ */}
        <TabsContent value="series" className="space-y-4 mt-4">
          <GlassCard className="p-4">
            <div className="flex gap-2 mb-4">
              <Input value={newSeriesName} onChange={e => setNewSeriesName(e.target.value)} placeholder="New series name" className="bg-accent border-border text-foreground placeholder:text-muted-foreground/50 flex-1" />
              <select value={newSeriesCategory} onChange={e => setNewSeriesCategory(e.target.value)} className="bg-accent border border-border text-foreground rounded-md px-2 py-2 text-sm min-w-[100px]">
                {SERIES_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              <Button onClick={createSeries} className="gradient-blue shrink-0"><Plus size={16} /></Button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">{series.map((s: any) => (
              <GlassCard key={s.id} className="p-3 cursor-pointer hover:border-border group relative" onClick={() => viewSeriesDetail(s)}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium text-foreground">{s.name}</p>
                      {s.category && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-600/15 text-purple-300 font-medium">{s.category}</span>}
                    </div>
                    <p className="text-[10px] text-muted-foreground/70">{s.description || ''}</p>
                    {s._count?.entries !== undefined && <p className="text-[10px] text-muted-foreground/50 mt-1">{s._count.entries} entries</p>}
                  </div>
                  <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={e => { e.stopPropagation(); viewSeriesDetail(s); }} className="text-muted-foreground/50 hover:text-blue-400 p-1"><Eye size={14} /></button>
                    <button onClick={e => { e.stopPropagation(); deleteSeries(s.id); }} className="text-muted-foreground/50 hover:text-red-400 p-1"><Trash2 size={14} /></button>
                  </div>
                </div>
              </GlassCard>
            ))}</div>
          </GlassCard>
        </TabsContent>

        {/* ═══ CALENDAR TAB ═══ */}
        <TabsContent value="calendar" className="space-y-4 mt-4">
          <GlassCard className="p-4">
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => { setCalMonth(m => m === 0 ? 11 : m - 1); if (calMonth === 0) setCalYear(y => y - 1); }} className="text-muted-foreground hover:text-foreground"><ChevronLeft size={18} /></button>
              <span className="text-sm font-medium text-foreground">{new Date(calYear, calMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
              <button onClick={() => { setCalMonth(m => m === 11 ? 0 : m + 1); if (calMonth === 11) setCalYear(y => y + 1); }} className="text-muted-foreground hover:text-foreground"><ChevronRight size={18} /></button>
            </div>
            <div className="flex items-center gap-4 mb-3 px-1">
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-500/30 border border-red-500/40" /><span className="text-[10px] text-muted-foreground">Shoot Date</span></div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-500/30 border border-blue-500/40" /><span className="text-[10px] text-muted-foreground">Post Date</span></div>
            </div>
            {/* Day-of-week headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="text-center text-[10px] text-muted-foreground/50 font-medium py-1">{d}</div>
              ))}
            </div>
            {/* Calendar grid with offset for first day of month */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for days before the 1st */}
              {Array.from({ length: new Date(calYear, calMonth, 1).getDay() }, (_, i) => (
                <div key={`empty-${i}`} className="min-h-[72px]" />
              ))}
              {Array.from({ length: new Date(calYear, calMonth + 1, 0).getDate() }, (_, i) => {
                const day = i + 1;
                const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const shootDateEntries = entries.filter((e: any) => e.shootDate === dateStr);
                const postDateEntries = entries.filter((e: any) => e.postDate === dateStr);
                const hasEntries = shootDateEntries.length > 0 || postDateEntries.length > 0;
                const isToday = dateStr === new Date().toISOString().split('T')[0];

                return (
                  <div key={day} className={`min-h-[72px] p-1.5 rounded-lg border transition-colors ${
                    hasEntries ? 'bg-accent/80 border-border' : 'bg-transparent border-transparent'
                  } ${isToday ? 'ring-1 ring-blue-500/40' : ''}`}>
                    <p className={`text-[10px] font-medium mb-1 ${isToday ? 'text-blue-400' : hasEntries ? 'text-foreground' : 'text-muted-foreground/40'}`}>{day}</p>
                    <div className="space-y-0.5">
                      {shootDateEntries.slice(0, 2).map((e: any, ei: number) => {
                        const seriesName = e.series?.name || series.find((s: any) => s.id === e.seriesId)?.name || '';
                        return (
                          <div key={`s-${ei}`} className="px-1 py-0.5 rounded bg-red-500/20 border border-red-500/25 text-[8px] leading-tight">
                            <p className="text-red-300 font-medium truncate">{e.title}</p>
                            {seriesName && <p className="text-red-400/60 truncate">{seriesName}</p>}
                            <p className="text-red-400/80 font-medium">Shoot</p>
                          </div>
                        );
                      })}
                      {postDateEntries.slice(0, 2).map((e: any, ei: number) => {
                        const seriesName = e.series?.name || series.find((s: any) => s.id === e.seriesId)?.name || '';
                        return (
                          <div key={`p-${ei}`} className="px-1 py-0.5 rounded bg-blue-500/20 border border-blue-500/25 text-[8px] leading-tight">
                            <p className="text-blue-300 font-medium truncate">{e.title}</p>
                            {seriesName && <p className="text-blue-400/60 truncate">{seriesName}</p>}
                            <p className="text-blue-400/80 font-medium">Post</p>
                          </div>
                        );
                      })}
                      {(shootDateEntries.length + postDateEntries.length > 2) && (
                        <p className="text-[8px] text-muted-foreground/50 text-center">+{shootDateEntries.length + postDateEntries.length - 2} more</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </TabsContent>

        {/* ═══ CREATE ENTRY TAB ═══ */}
        <TabsContent value="createEntry" className="space-y-4 mt-4">
          <GlassCard className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">{t('content.createEntry')}</h3>
            <div className="space-y-3">
              <select value={selectedSeries} onChange={e => setSelectedSeries(e.target.value)} className="w-full bg-accent border border-border text-foreground rounded-md px-3 py-2 text-sm">
                <option value="" className="bg-background">Select series</option>
                {series.map((s: any) => <option key={s.id} value={s.id} className="bg-background">{s.name}</option>)}
              </select>
              <Input value={entryTitle} onChange={e => setEntryTitle(e.target.value)} placeholder="Title" className="bg-accent border-border text-foreground placeholder:text-muted-foreground/50" />
              <Textarea value={entryContent} onChange={e => setEntryContent(e.target.value)} placeholder="Content..." className="bg-accent border-border text-foreground placeholder:text-muted-foreground/50 min-h-[120px]" rows={4} />

              {/* Content Type Selector */}
              <div>
                <Label className="text-muted-foreground text-xs mb-2 block">Content Type</Label>
                <div className="flex gap-2">
                  {CONTENT_TYPES.map(ct => (
                    <button
                      key={ct}
                      onClick={() => setEntryContentType(ct)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        entryContentType === ct
                          ? ct === 'blog' ? 'bg-purple-600/20 text-purple-400 ring-1 ring-purple-500/30'
                            : ct === 'video' ? 'bg-red-600/20 text-red-400 ring-1 ring-red-500/30'
                            : 'bg-blue-600/20 text-blue-400 ring-1 ring-blue-500/30'
                          : 'bg-accent text-muted-foreground hover:bg-accent/80'
                      }`}
                    >
                      {contentTypeIcon(ct)}
                      {contentTypeLabel(ct)}
                    </button>
                  ))}
                </div>
              </div>

              <select value={entryStatus} onChange={e => setEntryStatus(e.target.value)} className="w-full bg-accent border border-border text-foreground rounded-md px-3 py-2 text-sm">
                {STATUS_OPTIONS.map(s => <option key={s} value={s} className="bg-background">{s}</option>)}
              </select>
              {/* Shoot Date & Post Date */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Shoot Date</Label>
                  <Input type="date" value={entryShootDate} onChange={e => setEntryShootDate(e.target.value)} className="bg-accent border-border text-foreground h-9" />
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Post Date</Label>
                  <Input type="date" value={entryPostDate} onChange={e => setEntryPostDate(e.target.value)} className="bg-accent border-border text-foreground h-9" />
                </div>
              </div>
              {/* Multi-platform selector */}
              <div>
                <Label className="text-muted-foreground text-sm mb-2 block">{t('content.selectPlatforms')}</Label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map(p => <SelectPill key={p} label={p} selected={entryPlatforms.includes(p)} onClick={() => togglePlatform(p)} color="blue" />)}
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={scriptReview} disabled={aiLoading} variant="ghost" className="text-purple-400 border border-purple-500/20 text-xs"><Sparkles size={14} className="mr-1" />{t('content.aiScriptReview')}</Button>
                <Button onClick={postingTime} disabled={aiLoading} variant="ghost" className="text-purple-400 border border-purple-500/20 text-xs"><Sparkles size={14} className="mr-1" />{t('content.aiPostingTime')}</Button>
              </div>
              {aiReview && (
                <div className="bg-accent rounded-lg p-3 text-sm text-muted-foreground space-y-3">
                  <p className="font-medium text-purple-300 mb-2">AI Script Review</p>
                  {aiReview.corrections && aiReview.corrections.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-amber-300 mb-1">Corrections</p>
                      <ul className="space-y-1">{aiReview.corrections.map((c: string, i: number) => <li key={i} className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" /><span className="text-xs text-foreground/80">{c}</span></li>)}</ul>
                    </div>
                  )}
                  {aiReview.hooks && aiReview.hooks.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-blue-300 mb-1">Hooks</p>
                      <div className="flex flex-wrap gap-1.5">{aiReview.hooks.map((h: string, i: number) => <span key={i} className="text-xs bg-blue-600/20 text-blue-300 px-2 py-1 rounded-full">{h}</span>)}</div>
                    </div>
                  )}
                  {aiReview.ctas && aiReview.ctas.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-green-300 mb-1">CTAs</p>
                      <div className="flex flex-wrap gap-1.5">{aiReview.ctas.map((c: string, i: number) => <span key={i} className="text-xs bg-green-600/20 text-green-300 px-2 py-1 rounded-full">{c}</span>)}</div>
                    </div>
                  )}
                  {aiReview.engagementTriggers && aiReview.engagementTriggers.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-purple-300 mb-1">Engagement Triggers</p>
                      <div className="flex flex-wrap gap-1.5">{aiReview.engagementTriggers.map((t: string, i: number) => <span key={i} className="text-xs bg-purple-600/20 text-purple-300 px-2 py-1 rounded-full">{t}</span>)}</div>
                    </div>
                  )}
                  {aiReview.summary && <p className="text-xs text-muted-foreground italic mt-2">{aiReview.summary}</p>}
                  {!aiReview.corrections && !aiReview.hooks && !aiReview.ctas && !aiReview.engagementTriggers && (
                    <p className="text-xs text-muted-foreground">{typeof aiReview === 'string' ? aiReview : 'Review complete.'}</p>
                  )}
                </div>
              )}
              {aiPostingTime && (
                <div className="bg-accent rounded-lg p-3 text-sm text-muted-foreground space-y-2">
                  <p className="font-medium text-purple-300 mb-2">Best Posting Time</p>
                  {aiPostingTime.recommendation?.bestTimes && aiPostingTime.recommendation.bestTimes.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-blue-300 mb-1.5">Recommended Times</p>
                      <div className="flex flex-wrap gap-1.5">{aiPostingTime.recommendation.bestTimes.map((t: string, i: number) => <span key={i} className="text-xs bg-blue-600/20 text-blue-300 px-2.5 py-1 rounded-full font-medium">{t}</span>)}</div>
                    </div>
                  )}
                  {aiPostingTime.recommendation?.reasoning && <p className="text-xs text-foreground/80 mt-2">{aiPostingTime.recommendation.reasoning}</p>}
                  {!aiPostingTime.recommendation && (
                    <p className="text-xs text-muted-foreground">{typeof aiPostingTime === 'string' ? aiPostingTime : 'Analysis complete.'}</p>
                  )}
                </div>
              )}
              <Button onClick={createEntry} className="gradient-blue w-full">{t('common.submit')}</Button>
            </div>
          </GlassCard>
          <div className="space-y-2">{entries.slice(0, 10).map((e: any) => <GlassCard key={e.id} className="p-3 flex items-center justify-between"><div className="flex-1 min-w-0"><p className="text-sm text-foreground truncate">{e.title}</p><div className="flex items-center gap-2 mt-1"><span className={`text-[10px] px-2 py-0.5 rounded-full ${e.status === 'published' ? 'bg-green-600/20 text-green-400' : 'bg-amber-600/20 text-amber-400'}`}>{e.status}</span>{e.platform && <span className="text-[10px] text-muted-foreground/50">{e.platform}</span>}</div></div><button onClick={() => deleteEntry(e.id)} className="text-muted-foreground/50 hover:text-red-400 ml-2"><Trash2 size={14} /></button></GlassCard>)}</div>
        </TabsContent>

        {/* ═══ AI ASSISTANT TAB ═══ */}
        <TabsContent value="aiAssistant" className="space-y-4 mt-4">
          <GlassCard className="p-4 h-[500px] flex flex-col">
            <div className="flex items-center gap-2 mb-3"><Bot size={18} className="text-purple-400" /><span className="text-sm font-medium text-foreground">{t('content.aiAssistant')}</span><button onClick={startNewChat} className="ml-auto text-xs text-muted-foreground hover:text-blue-400 flex items-center gap-1"><Plus size={12} />New Chat</button></div>
            <div className="flex-1 overflow-y-auto space-y-3 mb-3">
              {chatMessages.map((msg, i) => <div key={i} className={`flex items-end ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>{msg.role === 'assistant' && <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0 mr-1.5 shadow-md shadow-violet-500/20"><Bot size={11} className="text-white" /></div>}<div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-md' : 'bg-gradient-to-br from-violet-600/20 to-indigo-600/10 dark:from-violet-500/25 dark:to-indigo-500/15 text-foreground rounded-bl-md border border-violet-400/20 dark:border-violet-400/30'}`}>{msg.role === 'assistant' ? <AIMessage content={msg.content} /> : msg.content}</div></div>)}
              {chatLoading && <div className="flex justify-start items-end"><div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0 mr-1.5 shadow-md shadow-violet-500/20"><Bot size={11} className="text-white" /></div><div className="bg-gradient-to-br from-violet-600/20 to-indigo-600/10 dark:from-violet-500/25 dark:to-indigo-500/15 rounded-2xl px-4 py-2 text-sm text-muted-foreground border border-violet-400/20 dark:border-violet-400/30">{t('ai.thinking')}</div></div>}
            </div>
            <div className="flex gap-2"><Input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()} placeholder={t('ai.askAnything')} className="bg-accent border-border text-foreground" /><Button onClick={sendChat} className="gradient-blue shrink-0" disabled={chatLoading}><Send size={16} /></Button></div>
          </GlassCard>
        </TabsContent>
      </Tabs>

      {/* Series Detail Dialog */}
      <Dialog open={seriesDetailOpen} onOpenChange={setSeriesDetailOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{seriesDetail?.name || 'Series Details'}</DialogTitle>
            {seriesDetail?.description && <DialogDescription>{seriesDetail.description}</DialogDescription>}
          </DialogHeader>
          {seriesDetailLoading ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
          ) : seriesDetailEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No entries in this series yet.</p>
          ) : (
            <div className="space-y-2">
              {seriesDetailEntries.map((e: any) => {
                const ct = e.contentType || 'post';
                const pipeline = getPipeline(ct);
                const currentIdx = getPipelineStepIndex(ct, e.liveStatus || 'not_started');

                return (
                  <GlassCard key={e.id} className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-md flex items-center gap-1 ${ct === 'blog' ? 'bg-purple-600/20 text-purple-400' : ct === 'video' ? 'bg-red-600/20 text-red-400' : 'bg-blue-600/20 text-blue-400'}`}>
                            {contentTypeIcon(ct)}
                            {contentTypeLabel(ct)}
                          </span>
                          <p className="text-sm font-medium text-foreground">{e.title}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${e.status === 'published' ? 'bg-green-600/20 text-green-400' : e.status === 'drafting' ? 'bg-amber-600/20 text-amber-400' : e.status === 'editing' ? 'bg-blue-600/20 text-blue-400' : 'bg-muted text-muted-foreground'}`}>{e.status}</span>
                          {e.platform && <span className="text-[10px] text-muted-foreground/50">{e.platform}</span>}
                        </div>
                        {e.content && <p className="text-xs text-muted-foreground/70 mt-1 line-clamp-2">{e.content}</p>}
                        <div className="flex items-center gap-3 mt-1">
                          {e.shootDate && <span className="text-[10px] text-red-400">Shoot: {e.shootDate}</span>}
                          {e.postDate && <span className="text-[10px] text-blue-400">Post: {e.postDate}</span>}
                        </div>

                        {/* Mini pipeline in series detail */}
                        <div className="flex items-center gap-1 mt-2">
                          {pipeline.map((step, idx) => (
                            <div key={step.key} className="flex items-center">
                              <span className={`w-2 h-2 rounded-full ${idx < currentIdx ? 'bg-green-500' : idx === currentIdx ? 'bg-blue-400' : 'bg-white/10'}`} title={step.label} />
                              {idx < pipeline.length - 1 && <span className={`w-3 h-0.5 ${idx < currentIdx ? 'bg-green-500/50' : 'bg-white/5'}`} />}
                            </div>
                          ))}
                          <span className="text-[9px] text-muted-foreground/50 ml-1">{pipeline[currentIdx]?.label || 'N/A'}</span>
                        </div>
                      </div>
                      <button onClick={() => { deleteEntry(e.id); viewSeriesDetail(seriesDetail); }} className="text-muted-foreground/50 hover:text-red-400 ml-2"><Trash2 size={14} /></button>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          )}
          <div className="flex justify-end mt-2">
            <Button onClick={() => { setSelectedSeries(seriesDetail?.id); setSeriesDetailOpen(false); setActiveTab('createEntry'); }} className="gradient-blue text-xs">
              <Plus size={14} className="mr-1" />Add Entry
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
