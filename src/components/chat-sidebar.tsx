'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Trash2, Pencil, X, Check, MessageSquare, Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GlassCard } from '@/components/glass-card';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ChatSidebarProps {
  agentType: string; // 'all' | 'general' | 'learning' | 'fitness' | 'time' | 'content' | 'navigation'
  currentConversationId?: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  isOpen: boolean;
  onClose: () => void;
}

interface ConversationItem {
  id: string;
  title: string;
  aiAgentType: string;
  messageCount: number;
  lastMessage: string;
  lastMessageAt: string;
  createdAt: string;
}

const AGENT_FILTERS = [
  { key: 'all', label: 'All', color: '' },
  { key: 'general', label: 'Main', color: 'blue' },
  { key: 'learning', label: 'Learning', color: 'purple' },
  { key: 'fitness', label: 'Fitness', color: 'green' },
  { key: 'time', label: 'Productivity', color: 'amber' },
  { key: 'content', label: 'Content', color: 'pink' },
  { key: 'navigation', label: 'Navigation', color: 'cyan' },
];

const AGENT_BADGE_COLORS: Record<string, string> = {
  general: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  learning: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  fitness: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  time: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  content: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  navigation: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
};

const AGENT_LABELS: Record<string, string> = {
  general: 'Main',
  learning: 'Learning',
  fitness: 'Fitness',
  time: 'Productivity',
  content: 'Content',
  navigation: 'Navigation',
};

function formatRelativeTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay === 1) return 'Yesterday';
    if (diffDay < 7) return `${diffDay}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

export function ChatSidebar({
  agentType,
  currentConversationId,
  onSelectConversation,
  onNewChat,
  isOpen,
  onClose,
}: ChatSidebarProps) {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState(agentType);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchConversations = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        agentType: activeFilter,
        page: String(pageNum),
        limit: '15',
      });
      if (search.trim()) params.set('search', search.trim());

      const res = await fetch(`/api/ai/conversations?${params}`);
      if (res.ok) {
        const data = await res.json();
        setConversations(prev => append ? [...prev, ...data.conversations] : data.conversations);
        setHasMore(data.hasMore);
        setPage(pageNum);
      }
    } catch {
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, [activeFilter, search]);

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchConversations(1, false);
  }, [fetchConversations]);

  // Debounced search
  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      fetchConversations(1, false);
    }, 300);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleting(id);
    try {
      const res = await fetch(`/api/ai/conversations/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setConversations(prev => prev.filter(c => c.id !== id));
        if (currentConversationId === id) {
          onNewChat();
        }
        toast.success('Conversation deleted');
      } else {
        toast.error('Failed to delete');
      }
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeleting(null);
    }
  };

  const handleRename = async (id: string) => {
    if (!editTitle.trim()) {
      setEditingId(null);
      return;
    }
    try {
      const res = await fetch(`/api/ai/conversations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle.trim() }),
      });
      if (res.ok) {
        setConversations(prev =>
          prev.map(c => (c.id === id ? { ...c, title: editTitle.trim() } : c))
        );
        toast.success('Renamed');
      }
    } catch {
      toast.error('Failed to rename');
    } finally {
      setEditingId(null);
    }
  };

  const startEditing = (conv: ConversationItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchConversations(page + 1, true);
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-background/95 dark:bg-[#0B1120]/95 backdrop-blur-xl border-r border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground">Chats</h2>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={onNewChat}
              title="New Chat"
            >
              <Plus size={18} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground md:hidden"
              onClick={onClose}
            >
              <X size={18} />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
          <Input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search conversations..."
            className="pl-9 h-9 bg-accent/50 border-border text-sm text-foreground placeholder:text-muted-foreground/40"
          />
        </div>
      </div>

      {/* Agent type filter pills */}
      <div className="px-4 py-3 border-b border-border overflow-x-auto">
        <div className="flex gap-1.5 min-w-max">
          {AGENT_FILTERS.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={cn(
                'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200 whitespace-nowrap',
                activeFilter === filter.key
                  ? filter.color
                    ? `${AGENT_BADGE_COLORS[filter.key as keyof typeof AGENT_BADGE_COLORS] || 'bg-blue-500/20 text-blue-400 border-blue-500/30'}`
                    : 'bg-white/15 text-foreground border-white/20'
                  : 'border-white/10 bg-white/5 text-muted-foreground/60 hover:bg-white/10 hover:text-muted-foreground'
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation list */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-0.5">
          {loading && conversations.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={20} className="animate-spin text-muted-foreground/40" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground/50">No conversations yet</p>
              <p className="text-xs text-muted-foreground/30 mt-1">Start a new chat to begin</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={cn(
                  'group relative flex items-start gap-2 p-3 rounded-xl cursor-pointer transition-all duration-150',
                  currentConversationId === conv.id
                    ? 'bg-blue-600/15 border border-blue-500/20'
                    : 'hover:bg-accent/50 border border-transparent'
                )}
              >
                <div className="flex-1 min-w-0">
                  {editingId === conv.id ? (
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRename(conv.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        className="h-7 text-xs bg-accent border-border"
                        autoFocus
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={() => handleRename(conv.id)}
                      >
                        <Check size={12} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={() => setEditingId(null)}
                      >
                        <X size={12} />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-foreground truncate">{conv.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full border px-1.5 py-0 text-[9px] font-medium',
                            AGENT_BADGE_COLORS[conv.aiAgentType] || AGENT_BADGE_COLORS.general
                          )}
                        >
                          {AGENT_LABELS[conv.aiAgentType] || 'AI'}
                        </span>
                        <span className="text-[10px] text-muted-foreground/40">
                          {conv.messageCount} msg{conv.messageCount !== 1 ? 's' : ''}
                        </span>
                        <span className="text-[10px] text-muted-foreground/30">
                          {formatRelativeTime(conv.lastMessageAt)}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Action buttons */}
                {editingId !== conv.id && (
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground/40 hover:text-foreground"
                      onClick={(e) => startEditing(conv, e)}
                      title="Rename"
                    >
                      <Pencil size={12} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground/40 hover:text-red-400"
                      onClick={(e) => handleDelete(conv.id, e)}
                      disabled={deleting === conv.id}
                      title="Delete"
                    >
                      {deleting === conv.id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Trash2 size={12} />
                      )}
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}

          {/* Load More */}
          {hasMore && (
            <div className="p-3 text-center">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground/50 hover:text-muted-foreground"
                onClick={loadMore}
                disabled={loading}
              >
                {loading ? <Loader2 size={14} className="animate-spin mr-1" /> : null}
                Load More
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <>
      {/* Desktop: fixed sidebar */}
      <div className="hidden md:block w-80 shrink-0 h-full">
        {sidebarContent}
      </div>

      {/* Mobile: slide-in overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              onClick={onClose}
            />
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-80 md:hidden"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
