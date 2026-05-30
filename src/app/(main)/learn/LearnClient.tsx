'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { BookOpen, Plus, Trash2, Sparkles, Send, Bot, Loader2, Globe, Lock, Eye, Share2, X, Users, ChevronRight, Clock, Calendar, MessageCircle, Search, Filter } from 'lucide-react';
import { GlassCard } from '@/components/glass-card';
import { AIMessage } from '@/components/ai-message';
import { AdCard } from '@/components/ad-banner';
import { SelectPill } from '@/components/select-pill';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useUserStore } from '@/stores/user-store';
import { t } from '@/lib/i18n';

const TABS_LIST = ['overview', 'topics', 'logEntry', 'aiTutor'];

function LearnPageContent() {
  const { profile } = useUserStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const topicParam = searchParams.get('topicId');
  const tabParam = searchParams.get('tab');

  const [activeTab, setActiveTab] = useState(tabParam && TABS_LIST.includes(tabParam) ? tabParam : 'overview');
  const [topics, setTopics] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicPhase, setNewTopicPhase] = useState('');
  const [entryTopicId, setEntryTopicId] = useState('');
  const [entryTitle, setEntryTitle] = useState('');
  const [entryContent, setEntryContent] = useState('');
  const [entryDuration, setEntryDuration] = useState('');
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTopicId, setSelectedTopicId] = useState<string|null>(null);
  const [topicDetail, setTopicDetail] = useState<any>(null);
  const [addTopicOpen, setAddTopicOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{role:string;content:string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string|null>(null);
  const [aiProgress, setAiProgress] = useState<any>(null);
  const [shareToGroupOpen, setShareToGroupOpen] = useState(false);
  const [shareTopicData, setShareTopicData] = useState<any>(null);
  const [userGroups, setUserGroups] = useState<any[]>([]);
  const [sharingGroupId, setSharingGroupId] = useState<string|null>(null);
  const [shareToDMOpen, setShareToDMOpen] = useState(false);
  const [dmConversations, setDmConversations] = useState<any[]>([]);
  const [dmSearchQuery, setDmSearchQuery] = useState('');
  const [dmSearchResults, setDmSearchResults] = useState<any[]>([]);
  const [sharingDMConvId, setSharingDMConvId] = useState<string|null>(null);
  const [topicLoading, setTopicLoading] = useState(false);
  const [filterDate, setFilterDate] = useState('');

  const fetchTopics = useCallback(async () => { try { const r = await fetch('/api/learning/topic'); if (r.ok) { const d = await r.json(); setTopics(Array.isArray(d) ? d : d.topics || []); } } catch {} }, []);
  const fetchEntries = useCallback(async () => { try { const r = await fetch('/api/learning/entries'); if (r.ok) { const d = await r.json(); setEntries(Array.isArray(d) ? d : d.entries || []); } } catch {} }, []);
  const fetchStats = useCallback(async () => { try { const r = await fetch('/api/learning/stats'); if (r.ok) setStats(await r.json()); } catch {} }, []);

  useEffect(() => { fetchTopics(); fetchEntries(); fetchStats(); }, [fetchTopics, fetchEntries, fetchStats]);

  // Client-side inactivity check: triggers server-side notification creation for 21-day inactive topics
  useEffect(() => {
    fetch('/api/cron/learning-inactivity', { method: 'GET' }).catch(() => {});
  }, []);

  // Auto-open topic from URL param ?topicId=xxx
  useEffect(() => {
    if (topicParam) {
      setActiveTab('topics');
      viewTopic(topicParam);
    }
  }, [topicParam]);

  const focusPhases = profile?.activePhases.filter(p => profile.phaseActivityMap[p]?.activities?.includes('learning')) || [];

  async function createTopic() {
    if (!newTopicName.trim()) return;
    try { const r = await fetch('/api/learning/topic', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newTopicName, phase: newTopicPhase || undefined }) }); if (r.ok) { setNewTopicName(''); setNewTopicPhase(''); setAddTopicOpen(false); fetchTopics(); fetchStats(); } } catch {}
  }

  async function shareTopic(topicId: string, share: boolean) {
    try { const r = await fetch('/api/learning/topic/share', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topicId, share }) }); if (r.ok) { fetchTopics(); } } catch {}
  }

  async function deleteTopic(topicId: string) {
    try { const r = await fetch(`/api/learning/topic/${topicId}`, { method: 'DELETE' }); if (r.ok) { setTopicDetail(null); fetchTopics(); fetchStats(); toast.success('Topic deleted'); } } catch {}
  }

  async function viewTopic(topicId: string) {
    setTopicLoading(true);
    try {
      const r = await fetch(`/api/learning/topic/${topicId}`);
      if (r.ok) {
        const data = await r.json();
        // API returns { topic: {...} }, unwrap it so topicDetail.entries works
        const topicData = data.topic || data;
        setTopicDetail(topicData);
        setSelectedTopicId(topicId);
      }
    } catch {}
    setTopicLoading(false);
  }

  async function createEntry() {
    if (!entryTopicId || !entryTitle.trim()) return;
    try {
      const r = await fetch('/api/learning/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId: entryTopicId, title: entryTitle, content: entryContent, duration: entryDuration ? parseInt(entryDuration) : null, date: entryDate }),
      });
      if (r.ok) {
        const d = await r.json();
        const newEntry = d.entry;
        // Optimistic: add to entries list immediately
        if (newEntry) {
          const topicName = topics.find((t: any) => t.id === entryTopicId)?.name || '';
          setEntries(prev => [{ ...newEntry, topic: { name: topicName } }, ...prev]);
        }
        toast.success(`+10 ${t('xp.earned')}`);
        setEntryTitle(''); setEntryContent(''); setEntryDuration('');
        fetchEntries(); // background sync
        fetchStats();
        fetchTopics();
        // If the topic detail dialog is open for this topic, refresh it
        if (selectedTopicId === entryTopicId) { viewTopic(entryTopicId); }
        window.dispatchEvent(new CustomEvent('xp-updated')); window.dispatchEvent(new CustomEvent('notification-updated'));
      }
    } catch {}
  }

  async function deleteEntry(id: string) {
    try {
      // Optimistic: remove from entries list immediately
      setEntries(prev => prev.filter((e: any) => e.id !== id));
      // Also update topic detail if open
      if (topicDetail && topicDetail.entries) {
        setTopicDetail((prev: any) => prev ? { ...prev, entries: prev.entries.filter((e: any) => e.id !== id) } : null);
      }
      await fetch(`/api/learning/entries?entryId=${id}`, { method: 'DELETE' });
      fetchEntries(); // background sync
      fetchStats();
      fetchTopics();
      if (selectedTopicId) { viewTopic(selectedTopicId); }
      window.dispatchEvent(new CustomEvent('xp-updated')); window.dispatchEvent(new CustomEvent('notification-updated'));
    } catch {}
  }

  async function openShareToGroup(topic: any) {
    setShareTopicData(topic);
    setShareToGroupOpen(true);
    try {
      const r = await fetch('/api/groups');
      if (r.ok) {
        const d = await r.json();
        setUserGroups(Array.isArray(d) ? d : d.groups || []);
      }
    } catch {}
  }

  async function openShareToDM(topic: any) {
    setShareTopicData(topic);
    setShareToDMOpen(true);
    setDmSearchQuery('');
    setDmSearchResults([]);
    try {
      const r = await fetch('/api/messages');
      if (r.ok) {
        const d = await r.json();
        setDmConversations(Array.isArray(d) ? d : d.conversations || []);
      }
    } catch {}
  }

  async function searchDMUsers() {
    if (!dmSearchQuery.trim()) return;
    try {
      const r = await fetch(`/api/discover?type=users&q=${encodeURIComponent(dmSearchQuery)}`);
      if (r.ok) {
        const d = await r.json();
        setDmSearchResults(Array.isArray(d) ? d : d.users || []);
      }
    } catch {}
  }

  async function shareTopicToDM(receiverId: string) {
    if (!shareTopicData) return;
    setSharingDMConvId(receiverId);
    try {
      const entryCount = shareTopicData._count?.entries || 0;
      const content = `📚 Shared learning topic: "${shareTopicData.name}"${shareTopicData.phase ? ` (Phase: ${shareTopicData.phase})` : ''} — ${entryCount} entries. [topicId:${shareTopicData.id}] Check it out! #Learning`;
      // Send as DM message
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId, content }),
      });
      toast.success('Shared to DM!');
      setShareToDMOpen(false);
      setShareTopicData(null);
    } catch {
      toast.error('Failed to share to DM');
    } finally {
      setSharingDMConvId(null);
    }
  }

  async function shareTopicToGroup(groupId: string) {
    if (!shareTopicData) return;
    setSharingGroupId(groupId);
    try {
      const entryCount = shareTopicData._count?.entries || 0;
      const content = `📚 Shared learning topic: "${shareTopicData.name}"${shareTopicData.phase ? ` (Phase: ${shareTopicData.phase})` : ''} — ${entryCount} entries. [topicId:${shareTopicData.id}] Check it out! #Learning`;
      // Send as group message
      await fetch(`/api/groups/${groupId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      // Also create a feed post
      await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, hashtags: ['Learning', shareTopicData.name.replace(/\s+/g, '')] }),
      });
      toast.success('Shared to group!');
      setShareToGroupOpen(false);
      setShareTopicData(null);
    } catch {
      toast.error('Failed to share to group');
    } finally {
      setSharingGroupId(null);
    }
  }

  async function checkProgress() {
    try { const r = await fetch('/api/ai/progress-check', { method: 'POST' }); if (r.ok) { const d = await r.json(); setAiProgress(d); } } catch {}
  }

  async function sendChat() {
    if (!chatInput.trim()) return; const msg = chatInput.trim(); setChatMessages(p => [...p, { role: 'user', content: msg }]); setChatInput(''); setChatLoading(true);
    try { const r = await fetch('/api/ai/chatbot', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: msg, botType: 'learning', conversationId }) }); if (r.ok) { const d = await r.json(); setChatMessages(p => [...p, { role: 'assistant', content: d.reply || d.response }]); if (d.conversationId) setConversationId(d.conversationId); } } catch {} finally { setChatLoading(false); }
  }

  function startNewChat() {
    setChatMessages([]);
    setConversationId(null);
  }

  const topicEntries = topicDetail?.entries || [];
  const isTopicOwner = topicDetail?.userId === profile?.userId;

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-accent border border-border w-full flex overflow-x-auto">
          {TABS_LIST.map(tab => <TabsTrigger key={tab} value={tab} className="text-muted-foreground data-[state=active]:text-blue-400 data-[state=active]:bg-blue-600/20 text-xs flex-1">{t(`learning.${tab}`)}</TabsTrigger>)}
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          {focusPhases.length > 0 && <GlassCard variant="liquid" className="p-4"><h4 className="text-sm font-medium text-muted-foreground mb-2">{t('learning.focusAreas')}</h4><div className="flex gap-2">{focusPhases.map(p => <span key={p} className="text-xs bg-blue-600/20 text-blue-300 px-2 py-1 rounded-full">{p}</span>)}</div></GlassCard>}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <GlassCard variant="liquid" className="p-3 text-center"><p className="text-lg font-bold text-foreground">{stats?.totalEntries || 0}</p><p className="text-[10px] text-muted-foreground/70">{t('learning.totalEntries')}</p></GlassCard>
            <GlassCard variant="liquid" className="p-3 text-center"><p className="text-lg font-bold text-foreground">{stats?.totalMinutes || 0}</p><p className="text-[10px] text-muted-foreground/70">{t('learning.totalMinutes')}</p></GlassCard>
            <GlassCard variant="liquid" className="p-3 text-center"><p className="text-lg font-bold text-foreground">{stats?.totalTopics || 0}</p><p className="text-[10px] text-muted-foreground/70">{t('learning.topicsCount')}</p></GlassCard>
            <GlassCard variant="liquid" className="p-3 text-center"><p className="text-lg font-bold text-foreground">{stats?.streakDays || 0}</p><p className="text-[10px] text-muted-foreground/70">{t('learning.streakDays')}</p></GlassCard>
          </div>
          <Button onClick={checkProgress} variant="ghost" className="text-purple-400 border border-purple-500/20"><Sparkles size={14} className="mr-1" />{t('learning.aiProgressCheck')}</Button>
          {aiProgress && <GlassCard className="p-4"><p className={`text-sm ${aiProgress.shouldWarn ? 'text-amber-400' : 'text-green-400'}`}>{aiProgress.message}</p></GlassCard>}
        </TabsContent>

        <TabsContent value="topics" className="space-y-4 mt-4">
          <div className="flex justify-between items-center"><h3 className="text-sm font-medium text-muted-foreground">{t('learning.topics')}</h3><Button onClick={() => setAddTopicOpen(true)} className="gradient-blue text-xs"><Plus size={14} className="mr-1" />{t('learning.addTopic')}</Button></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {topics.map((topic: any) => (
              <GlassCard key={topic.id} variant="glassmorphism" className="p-4 cursor-pointer" onClick={() => viewTopic(topic.id)}>
                <div className="flex items-start justify-between mb-2">
                  <div><p className="text-sm font-medium text-foreground">{topic.name}</p>{topic.phase && <span className="text-[10px] bg-blue-600/20 text-blue-300 px-2 py-0.5 rounded-full">{topic.phase}</span>}</div>
                  <div className="flex gap-1">
                    {topic.isSharedCollection ? <Globe size={14} className="text-green-400" /> : <Lock size={14} className="text-muted-foreground/50" />}
                    <button onClick={(e) => { e.stopPropagation(); shareTopic(topic.id, !topic.isSharedCollection); }} className={`p-1 rounded ${topic.isSharedCollection ? 'text-red-400' : 'text-green-400'}`}><Share2 size={14} /></button>
                    <button onClick={(e) => { e.stopPropagation(); openShareToGroup(topic); }} className="text-muted-foreground hover:text-emerald-400 p-1" title="Share to Group"><Users size={14} /></button>
                    <button onClick={(e) => { e.stopPropagation(); openShareToDM(topic); }} className="text-muted-foreground hover:text-blue-400 p-1" title="Share to DM"><MessageCircle size={14} /></button>
                    <button onClick={(e) => { e.stopPropagation(); viewTopic(topic.id); }} className="text-muted-foreground hover:text-blue-400 p-1"><Eye size={14} /></button>
                    <button onClick={(e) => { e.stopPropagation(); deleteTopic(topic.id); }} className="text-muted-foreground/50 hover:text-red-400 p-1"><Trash2 size={14} /></button>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground/70">{topic._count?.entries || 0} entries</p>
              </GlassCard>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="logEntry" className="space-y-4 mt-4">
          <GlassCard variant="deep" className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">{t('learning.logEntry')}</h3>
            <div className="space-y-3">
              <select value={entryTopicId} onChange={e => setEntryTopicId(e.target.value)} className="w-full bg-accent border border-border text-foreground rounded-md px-3 py-2 text-sm">
                <option value="" className="bg-background">Select topic</option>
                {topics.map((t: any) => <option key={t.id} value={t.id} className="bg-background">{t.name}</option>)}
              </select>
              <Input value={entryTitle} onChange={e => setEntryTitle(e.target.value)} placeholder="Title" className="bg-accent border-border text-foreground placeholder:text-muted-foreground/50" />
              <Textarea value={entryContent} onChange={e => setEntryContent(e.target.value)} placeholder="Notes..." className="bg-accent border-border text-foreground placeholder:text-muted-foreground/50" rows={3} />
              <div className="flex gap-2">
                <Input type="number" value={entryDuration} onChange={e => setEntryDuration(e.target.value)} placeholder="Duration (min)" className="bg-accent border-border text-foreground placeholder:text-muted-foreground/50" />
                <Input type="date" value={entryDate} onChange={e => setEntryDate(e.target.value)} className="bg-accent border-border text-foreground" />
              </div>
              <Button onClick={createEntry} className="gradient-blue w-full">{t('common.submit')}</Button>
            </div>
          </GlassCard>

          {/* Date Filter & Entries Grouped by Date */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-muted-foreground/60" />
              <Input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} placeholder="Filter by date" className="bg-accent border-border text-foreground text-sm max-w-[200px]" />
              {filterDate && (
                <button onClick={() => setFilterDate('')} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Clear</button>
              )}
            </div>

            {/* Group entries by date */}
            {(() => {
              const filteredEntries = filterDate
                ? entries.filter((e: any) => e.date === filterDate)
                : entries;

              const groupedByDate: Record<string, any[]> = {};
              filteredEntries.slice(0, 30).forEach((e: any) => {
                const dateKey = e.date || 'Unknown';
                if (!groupedByDate[dateKey]) groupedByDate[dateKey] = [];
                groupedByDate[dateKey].push(e);
              });

              const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));

              if (sortedDates.length === 0) {
                return (
                  <GlassCard className="p-6 text-center">
                    <Calendar className="w-6 h-6 mx-auto mb-2 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground/60">{filterDate ? 'No entries found for this date' : 'No entries yet. Log your first entry above!'}</p>
                  </GlassCard>
                );
              }

              return sortedDates.map(dateKey => (
                <div key={dateKey} className="space-y-2">
                  <div className="flex items-center gap-2 pt-1">
                    <Calendar size={12} className="text-blue-400/60" />
                    <h4 className="text-xs font-medium text-muted-foreground/80">{dateKey}</h4>
                    <span className="text-[9px] text-muted-foreground/40">({groupedByDate[dateKey].length} entr{groupedByDate[dateKey].length !== 1 ? 'ies' : 'y'})</span>
                    <div className="flex-1 h-px bg-border/30" />
                  </div>
                  {groupedByDate[dateKey].map((e: any) => (
                    <GlassCard key={e.id} variant="default" className="p-3 flex items-center justify-between cursor-pointer hover:border-blue-500/20 transition-all group" onClick={() => router.push(`/learn/entry/${e.id}?from=learn`)}>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground group-hover:text-blue-300 transition-colors">{e.title}</p>
                        <p className="text-[10px] text-muted-foreground/70">{e.topic?.name && <span className="text-blue-400/60">{e.topic.name} · </span>}{e.duration ? `${e.duration}min` : ''}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={(ev) => { ev.stopPropagation(); deleteEntry(e.id); }} className="text-muted-foreground/30 hover:text-red-400 p-1"><Trash2 size={12} /></button>
                        <ChevronRight size={14} className="text-muted-foreground/30 group-hover:text-blue-400" />
                      </div>
                    </GlassCard>
                  ))}
                </div>
              ));
            })()}
          </div>
        </TabsContent>

        <TabsContent value="aiTutor" className="space-y-4 mt-4">
          <GlassCard variant="glowing" className="p-4 h-[500px] flex flex-col">
            <div className="flex items-center gap-2 mb-3"><Bot size={18} className="text-purple-400" /><span className="text-sm font-medium text-foreground">{t('learning.aiTutor')}</span><button onClick={startNewChat} className="ml-auto text-xs text-muted-foreground hover:text-blue-400 flex items-center gap-1"><Plus size={12} />New Chat</button></div>
            <div className="flex-1 overflow-y-auto space-y-3 mb-3">
              {chatMessages.map((msg, i) => <div key={i} className={`flex items-end ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>{msg.role === 'assistant' && <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0 mr-1.5 shadow-md shadow-violet-500/20"><Bot size={11} className="text-white" /></div>}<div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-md' : 'bg-gradient-to-br from-violet-600/20 to-indigo-600/10 dark:from-violet-500/25 dark:to-indigo-500/15 text-foreground rounded-bl-md border border-violet-400/20 dark:border-violet-400/30'}`}>{msg.role === 'assistant' ? <AIMessage content={msg.content} /> : msg.content}</div></div>)}
              {chatLoading && <div className="flex justify-start items-end"><div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0 mr-1.5 shadow-md shadow-violet-500/20"><Bot size={11} className="text-white" /></div><div className="bg-gradient-to-br from-violet-600/20 to-indigo-600/10 dark:from-violet-500/25 dark:to-indigo-500/15 rounded-2xl px-4 py-2 text-sm text-muted-foreground border border-violet-400/20 dark:border-violet-400/30">{t('ai.thinking')}</div></div>}
            </div>
            <div className="flex gap-2"><Input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()} placeholder={t('ai.askAnything')} className="bg-accent border-border text-foreground" /><Button onClick={sendChat} className="gradient-blue shrink-0" disabled={chatLoading}><Send size={16} /></Button></div>
          </GlassCard>
        </TabsContent>
      </Tabs>

      {/* Add Topic Dialog */}
      <Dialog open={addTopicOpen} onOpenChange={setAddTopicOpen}>
        <DialogContent className="bg-background border-border"><DialogHeader><DialogTitle className="text-foreground">{t('learning.addTopic')}</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-4">
            <Input value={newTopicName} onChange={e => setNewTopicName(e.target.value)} placeholder="Topic name" className="bg-accent border-border text-foreground" />
            <div className="flex gap-2 flex-wrap">{(profile?.activePhases || []).map(p => <SelectPill key={p} label={p} selected={newTopicPhase === p} onClick={() => setNewTopicPhase(p)} color="blue" />)}</div>
            <Button onClick={createTopic} className="gradient-blue w-full">{t('common.add')}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Topic Detail Dialog */}
      <Dialog open={!!topicDetail} onOpenChange={(open) => { if (!open) { setTopicDetail(null); setSelectedTopicId(null); } }}>
        <DialogContent className="bg-background border-border max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <BookOpen size={18} className="text-blue-400" />
              {topicDetail?.name || ''}
              {!isTopicOwner && topicDetail?.isSharedCollection && (
                <span className="text-[9px] bg-green-600/20 text-green-400 px-2 py-0.5 rounded-full">Shared Collection</span>
              )}
            </DialogTitle>
            {topicDetail?.phase && (
              <span className="text-[10px] bg-blue-600/20 text-blue-300 px-2 py-0.5 rounded-full ml-7">{topicDetail.phase}</span>
            )}
          </DialogHeader>
          <div className="mt-4 space-y-2">
            {topicLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
              </div>
            ) : topicEntries.length === 0 ? (
              <GlassCard variant="liquid" className="p-8 text-center">
                <BookOpen className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No entries yet</p>
                {isTopicOwner ? (
                  <>
                    <p className="text-xs text-muted-foreground/50 mt-1">Log a subtopic from the Log Entry tab!</p>
                    <Button
                      onClick={() => { setTopicDetail(null); setSelectedTopicId(null); setActiveTab('logEntry'); setEntryTopicId(selectedTopicId || ''); }}
                      variant="ghost"
                      className="text-blue-400 border border-blue-500/20 text-xs mt-3"
                    >
                      <Plus size={12} className="mr-1" /> Log Entry
                    </Button>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground/50 mt-1">The creator hasn&apos;t added any entries yet.</p>
                )}
              </GlassCard>
            ) : (
              <>
                <p className="text-xs text-muted-foreground/70 mb-2">{topicEntries.length} subtopic{topicEntries.length !== 1 ? 's' : ''} learnt</p>
                <AnimatePresence>
                  {topicEntries.map((e: any, i: number) => (
                    <motion.div
                      key={e.id || i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => { setTopicDetail(null); setSelectedTopicId(null); router.push(`/learn/entry/${e.id}?from=learn&topicId=${selectedTopicId || ''}`); }}
                      className="bg-accent/50 hover:bg-accent/80 rounded-xl p-3 cursor-pointer transition-all duration-200 border border-transparent hover:border-blue-500/20 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-600/15 flex items-center justify-center shrink-0 group-hover:bg-blue-600/25 transition-colors">
                          <BookOpen size={14} className="text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground group-hover:text-blue-300 transition-colors">{e.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {e.duration && <span className="text-[10px] text-muted-foreground/70 flex items-center gap-0.5"><Clock size={8} />{e.duration}min</span>}
                            <span className="text-[10px] text-muted-foreground/70 flex items-center gap-0.5"><Calendar size={8} />{e.date}</span>
                            {e.content && <span className="text-[10px] text-blue-400/60">Has notes</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {isTopicOwner && (
                            <button
                              onClick={(ev) => { ev.stopPropagation(); deleteEntry(e.id); }}
                              className="text-muted-foreground/30 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                          <ChevronRight size={16} className="text-muted-foreground/30 group-hover:text-blue-400 transition-colors" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Share to Group Dialog */}
      <Dialog open={shareToGroupOpen} onOpenChange={setShareToGroupOpen}>
        <DialogContent className="sm:max-w-md bg-background border-border p-4 overflow-hidden max-w-full">
          <DialogHeader><DialogTitle className="text-foreground flex items-center gap-2"><Users size={18} className="text-emerald-400" />Share to Group</DialogTitle></DialogHeader>
          <div className="mt-2">
            {shareTopicData && (
              <p className="text-sm text-muted-foreground mb-3 break-words w-full">Share <span className="text-foreground font-medium truncate">"{shareTopicData.name}"</span> to a group</p>
            )}
            {userGroups.length === 0 ? (
              <p className="text-sm text-muted-foreground/60 text-center py-4">No groups yet. Create one in Messages!</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {userGroups.map((g: any) => (
                  <button key={g.id} onClick={() => shareTopicToGroup(g.id)} disabled={!!sharingGroupId} className="flex items-center gap-3 w-full p-3 rounded-xl bg-accent hover:bg-accent/80 transition-colors text-left disabled:opacity-50">
                    <div className="w-8 h-8 rounded-full bg-emerald-600/20 flex items-center justify-center shrink-0"><Users size={14} className="text-emerald-400" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">{g.name}</p>
                      <p className="text-[10px] text-muted-foreground/70">{g.memberCount || g._count?.members || 0} members</p>
                    </div>
                    {sharingGroupId === g.id ? <Loader2 size={14} className="text-emerald-400 animate-spin" /> : <Share2 size={14} className="text-muted-foreground/50" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Share to DM Dialog */}
      <Dialog open={shareToDMOpen} onOpenChange={setShareToDMOpen}>
        <DialogContent className="sm:max-w-md bg-background border-border p-4 overflow-hidden max-w-full">
          <DialogHeader><DialogTitle className="text-foreground flex items-center gap-2"><MessageCircle size={18} className="text-blue-400" />Share to DM</DialogTitle></DialogHeader>
          <div className="mt-4">
            {shareTopicData && (
              <p className="text-sm text-muted-foreground mb-3 break-words w-full">Share <span className="text-foreground font-medium truncate">"{shareTopicData.name}"</span> in a DM</p>
            )}
            {/* Search for users */}
            <div className="flex gap-2 mb-3">
              <Input value={dmSearchQuery} onChange={e => setDmSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && searchDMUsers()} placeholder="Search users..." className="bg-accent border-border text-foreground text-xs" />
              <Button onClick={searchDMUsers} size="sm" className="gradient-blue shrink-0"><Search size={14} /></Button>
            </div>
            {/* Search results */}
            {dmSearchResults.length > 0 && (
              <div className="space-y-2 mb-3">
                <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">Search Results</p>
                {dmSearchResults.map((u: any) => (
                  <button key={u.id} onClick={() => shareTopicToDM(u.id)} disabled={!!sharingDMConvId} className="flex items-center gap-3 w-full p-3 rounded-xl bg-accent hover:bg-accent/80 transition-colors text-left disabled:opacity-50">
                    <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center shrink-0"><span className="text-blue-300 text-xs font-medium">{u.name?.[0] || u.username?.[0] || '?'}</span></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">{u.name || u.username || 'User'}</p>
                      <p className="text-[10px] text-muted-foreground/70">@{u.username || 'user'}</p>
                    </div>
                    {sharingDMConvId === u.id ? <Loader2 size={14} className="text-blue-400 animate-spin" /> : <Send size={14} className="text-muted-foreground/50" />}
                  </button>
                ))}
              </div>
            )}
            {/* Existing conversations */}
            <div className="space-y-2">
              <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">Recent Conversations</p>
              {dmConversations.length === 0 ? (
                <p className="text-sm text-muted-foreground/60 text-center py-4">No conversations yet. Search for users to start a DM!</p>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {dmConversations.map((conv: any) => {
                    const otherUser = conv.otherUser;
                    const receiverId = otherUser?.id;
                    return (
                      <button key={conv.id} onClick={() => receiverId && shareTopicToDM(receiverId)} disabled={!!sharingDMConvId || !receiverId} className="flex items-center gap-3 w-full p-3 rounded-xl bg-accent hover:bg-accent/80 transition-colors text-left disabled:opacity-50">
                        <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center shrink-0"><span className="text-blue-300 text-xs font-medium">{otherUser?.name?.[0] || '?'}</span></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground truncate">{otherUser?.name || 'User'}</p>
                          <p className="text-[10px] text-muted-foreground/70">@{otherUser?.username || 'user'}</p>
                        </div>
                        {sharingDMConvId === receiverId ? <Loader2 size={14} className="text-blue-400 animate-spin" /> : <Send size={14} className="text-muted-foreground/50" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ad Banner — bottom of page, above footer */}
      <AdCard format="in-feed" slot="learn_bottom" />
    </div>
  );
}

export default function LearnClient() {
  return (
    <Suspense>
      <LearnPageContent />
    </Suspense>
  );
}
