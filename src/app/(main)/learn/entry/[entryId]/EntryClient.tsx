'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  ArrowLeft, BookOpen, Clock, Calendar, Trash2, Send, Bot,
  Loader2, Sparkles, Edit, Save, X, MessageCircle, ChevronRight
} from 'lucide-react';
import { GlassCard } from '@/components/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useUserStore } from '@/stores/user-store';
import { t } from '@/lib/i18n';

function EntryDetailContent() {
  const { entryId } = useParams<{ entryId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromParam = searchParams.get('from') || '';
  const fromTopicId = searchParams.get('topicId') || '';
  const { fetchProfile: fetchUserProfile } = useUserStore();

  const [entry, setEntry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', content: '', duration: '', date: '' });
  const [saving, setSaving] = useState(false);
  const [isOwner, setIsOwner] = useState(true);

  // AI doubt chat
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const fetchEntry = useCallback(async () => {
    try {
      const r = await fetch(`/api/learning/entries/${entryId}`);
      if (r.ok) {
        const d = await r.json();
        setEntry(d.entry);
        setIsOwner(d.isOwner !== false); // default true for backward compat
        setEditForm({
          title: d.entry?.title || '',
          content: d.entry?.content || '',
          duration: d.entry?.duration?.toString() || '',
          date: d.entry?.date || '',
        });
      } else {
        toast.error('Entry not found');
        router.push('/learn');
      }
    } catch {
      toast.error('Failed to load entry');
    } finally {
      setLoading(false);
    }
  }, [entryId, router]);

  useEffect(() => { fetchEntry(); }, [fetchEntry]);

  async function saveEntry() {
    if (!editForm.title.trim()) return;
    setSaving(true);
    try {
      const r = await fetch(`/api/learning/entries/${entryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editForm.title,
          content: editForm.content || null,
          duration: editForm.duration ? parseInt(editForm.duration) : null,
          date: editForm.date || undefined,
        }),
      });
      if (r.ok) {
        const d = await r.json();
        setEntry(d.entry);
        setEditing(false);
        toast.success('Entry updated!');
      } else {
        toast.error('Failed to update');
      }
    } catch {
      toast.error('Failed to update');
    } finally {
      setSaving(false);
    }
  }

  async function deleteEntry() {
    if (!confirm('Delete this entry?')) return;
    try {
      const r = await fetch(`/api/learning/entries/${entryId}`, { method: 'DELETE' });
      if (r.ok) {
        toast.success('Entry deleted');
        router.push('/learn');
      }
    } catch {
      toast.error('Failed to delete');
    }
  }

  async function sendDoubt() {
    if (!chatInput.trim() || !entry) return;
    const msg = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', content: msg }]);
    setChatInput('');
    setChatLoading(true);
    try {
      const contextContent = `The user is studying a topic called "${entry.topic?.name || 'Unknown'}". The subtopic/entry is titled "${entry.title}". Here are their notes:\n\n${entry.content || '(No notes provided)'}\n\nThe user has a doubt about this content. Help them understand clearly. Use examples if helpful. Keep responses concise.`;
      const r = await fetch('/api/ai/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          botType: 'learning',
          history: [
            { role: 'system', content: contextContent },
            ...chatMessages.slice(-6),
          ],
        }),
      });
      if (r.ok) {
        const d = await r.json();
        setChatMessages(prev => [...prev, { role: 'assistant', content: d.reply || d.response }]);
      }
    } catch {
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I could not process your doubt. Please try again.' }]);
    } finally {
      setChatLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-muted-foreground">Entry not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Back button */}
      <button
        onClick={() => {
          if (fromParam === 'shared-topic' && fromTopicId) {
            router.push(`/shared-topic/${fromTopicId}?from=feed`);
          } else {
            router.push('/learn');
          }
        }}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
      >
        <ArrowLeft size={16} />
        <span>{fromParam === 'shared-topic' ? 'Back to Shared Topic' : 'Back to Learning'}</span>
      </button>

      {/* Entry Header */}
      <GlassCard variant="deep" className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="space-y-3">
                <Input
                  value={editForm.title}
                  onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                  className="text-lg font-bold bg-accent border-border text-foreground"
                  placeholder="Title"
                />
                <Textarea
                  value={editForm.content}
                  onChange={e => setEditForm(f => ({ ...f, content: e.target.value }))}
                  className="bg-accent border-border text-foreground min-h-[200px]"
                  placeholder="Your notes..."
                  rows={8}
                />
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={editForm.duration}
                    onChange={e => setEditForm(f => ({ ...f, duration: e.target.value }))}
                    placeholder="Duration (min)"
                    className="bg-accent border-border text-foreground w-32"
                  />
                  <Input
                    type="date"
                    value={editForm.date}
                    onChange={e => setEditForm(f => ({ ...f, date: e.target.value }))}
                    className="bg-accent border-border text-foreground"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={saveEntry} disabled={saving} className="gradient-blue">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save size={14} className="mr-2" />}
                    Save
                  </Button>
                  <Button onClick={() => setEditing(false)} variant="ghost" className="text-muted-foreground">
                    <X size={14} className="mr-1" /> Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Topic breadcrumb */}
                {entry.topic && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                    <BookOpen size={12} className="text-blue-400" />
                    <span>{entry.topic.name}</span>
                    {entry.topic.phase && (
                      <>
                        <ChevronRight size={10} />
                        <span className="bg-blue-600/20 text-blue-300 px-1.5 py-0.5 rounded-full">{entry.topic.phase}</span>
                      </>
                    )}
                  </div>
                )}

                <h1 className="text-xl font-bold text-foreground mb-2">{entry.title}</h1>

                <div className="flex items-center gap-3 text-xs text-muted-foreground/70 mb-4">
                  {entry.duration && (
                    <span className="flex items-center gap-1"><Clock size={12} /> {entry.duration} min</span>
                  )}
                  <span className="flex items-center gap-1"><Calendar size={12} /> {entry.date}</span>
                </div>

                {/* Entry Content */}
                {entry.content ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <div className="text-foreground/90 whitespace-pre-wrap text-sm leading-relaxed bg-accent/50 rounded-xl p-4 border border-border/50">
                      {entry.content}
                    </div>
                  </div>
                ) : (
                  <div className="bg-accent/30 rounded-xl p-4 text-center border border-dashed border-border">
                    <p className="text-muted-foreground text-sm">No notes yet. Click edit to add content.</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Action buttons - only for owner */}
          {!editing && isOwner && (
            <div className="flex gap-1 shrink-0">
              <Button onClick={() => setEditing(true)} size="sm" variant="ghost" className="text-muted-foreground hover:text-blue-400">
                <Edit size={14} />
              </Button>
              <Button onClick={deleteEntry} size="sm" variant="ghost" className="text-muted-foreground/50 hover:text-red-400">
                <Trash2 size={14} />
              </Button>
            </div>
          )}
        </div>
      </GlassCard>

      {/* AI Doubt Solver */}
      <GlassCard variant="glowing" className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full gradient-gold flex items-center justify-center">
            <Sparkles size={14} className="text-gray-900" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-foreground">Ask Doubts About This Topic</h3>
            <p className="text-[10px] text-muted-foreground/70">AI assistant with context of your notes</p>
          </div>
        </div>

        {/* Chat messages */}
        <div className="max-h-[320px] overflow-y-auto space-y-3 mb-3">
          {chatMessages.length === 0 && (
            <div className="text-center py-6">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
              <p className="text-xs text-muted-foreground/60">Ask any doubt about &ldquo;{entry.title}&rdquo;</p>
              <div className="flex flex-wrap gap-1.5 justify-center mt-3">
                {[
                  `Explain "${entry.title}" simply`,
                  'Give me practice questions',
                  'What are the key takeaways?',
                  'Connect this to real-world examples',
                ].map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => { setChatInput(suggestion); }}
                    className="text-[10px] bg-blue-600/10 text-blue-300 px-2 py-1 rounded-full hover:bg-blue-600/20 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
          {chatMessages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0 mr-2 mt-1 shadow-md shadow-violet-500/20">
                  <Bot size={13} className="text-white" />
                </div>
              )}
              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                msg.role === 'user'
                  ? 'gradient-blue text-white rounded-br-md'
                  : 'bg-gradient-to-br from-violet-600/20 to-indigo-600/10 dark:from-violet-500/25 dark:to-indigo-500/15 text-foreground rounded-bl-md border border-violet-400/20 dark:border-violet-400/30'
              }`}>
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            </motion.div>
          ))}
          {chatLoading && (
            <div className="flex justify-start">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0 mr-2 mt-1 shadow-md shadow-violet-500/20">
                <Bot size={13} className="text-white" />
              </div>
              <div className="bg-gradient-to-br from-violet-600/20 to-indigo-600/10 dark:from-violet-500/25 dark:to-indigo-500/15 rounded-2xl px-4 py-2.5 text-sm text-muted-foreground border border-violet-400/20 dark:border-violet-400/30">
                <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                  Thinking...
                </motion.span>
              </div>
            </div>
          )}
        </div>

        {/* Chat input */}
        <div className="flex gap-2">
          <Input
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendDoubt()}
            placeholder="Ask a doubt about this content..."
            className="bg-accent border-border text-foreground placeholder:text-muted-foreground/50"
          />
          <Button onClick={sendDoubt} className="gradient-gold border-0 shrink-0 text-gray-900" disabled={chatLoading}>
            <Send size={16} />
          </Button>
        </div>
      </GlassCard>

      {/* Quick Actions */}
      <GlassCard variant="liquid" className="p-4">
        <h4 className="text-xs font-medium text-muted-foreground mb-2">Quick Actions</h4>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => router.push('/learn')}
            variant="ghost"
            size="sm"
            className="text-blue-400 border border-blue-500/20 text-xs"
          >
            <BookOpen size={12} className="mr-1" /> All Topics
          </Button>
          <Button
            onClick={() => {
              setChatInput('Summarize the key points of this topic in bullet points');
            }}
            variant="ghost"
            size="sm"
            className="text-purple-400 border border-purple-500/20 text-xs"
          >
            <Sparkles size={12} className="mr-1" /> Summarize
          </Button>
          <Button
            onClick={() => {
              setChatInput('Create a quiz with 5 questions based on this content');
            }}
            variant="ghost"
            size="sm"
            className="text-amber-400 border border-amber-500/20 text-xs"
          >
            <Bot size={12} className="mr-1" /> Quiz Me
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}

export default function EntryClient() {
  return (
    <Suspense>
      <EntryDetailContent />
    </Suspense>
  );
}
