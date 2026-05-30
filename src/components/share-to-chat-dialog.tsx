'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Share2, MessageCircle, Copy, Check, ExternalLink, Users, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

// ── Share Data Type ──
export interface ShareData {
  type: 'post' | 'content_update' | 'fitness_update' | 'learning_update';
  id: string;
  preview: string;
  userName?: string;
  username?: string;
  extra?: Record<string, any>;
}

interface ShareToChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  shareData: ShareData | null;
}

interface Conversation {
  id: string;
  otherUser: {
    id: string;
    username: string;
    name: string;
    avatarUrl?: string;
  };
  lastMessage: string;
  lastMessageAt: string;
}

interface Group {
  id: string;
  name: string;
  memberCount: number;
  isPublic: boolean;
}

export default function ShareToChatDialog({ isOpen, onClose, shareData }: ShareToChatDialogProps) {
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [activeSection, setActiveSection] = useState<'actions' | 'chats' | 'groups'>('actions');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loadingTargets, setLoadingTargets] = useState(false);
  const [chatQuery, setChatQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Reset state when dialog closes
  const handleClose = () => {
    setError(null);
    setActiveSection('actions');
    onClose();
  };

  const getShareUrl = (data: ShareData): string => {
    if (typeof window === 'undefined') return '';
    try {
      const origin = window.location.origin;
      switch (data.type) {
        case 'post':
          return `${origin}/feed?post=${data.id}`;
        case 'learning_update':
          return `${origin}/shared-topic/${data.id}?from=share`;
        case 'content_update':
          return `${origin}/discover?q=%23content`;
        case 'fitness_update':
          return `${origin}/discover?q=%23fitness`;
        default:
          return `${origin}/shared-topic/${data.id}?from=share`;
      }
    } catch {
      return '';
    }
  };

  // Safe defaults when shareData is null/undefined
  const safeShareData = shareData || { type: 'post' as const, id: '', preview: '' };
  const shareUrl = getShareUrl(safeShareData);
  const shareMessage = `Shared: ${safeShareData.preview || 'Item'}\n\n${shareUrl}`;

  // Fetch conversations when user clicks "Share to Chat"
  useEffect(() => {
    if (activeSection === 'chats' && conversations.length === 0) {
      setLoadingTargets(true);
      setError(null);
      fetch('/api/messages')
        .then(r => {
          if (!r.ok) throw new Error('Failed to load chats');
          return r.json();
        })
        .then(data => {
          const convs = Array.isArray(data?.conversations) ? data.conversations : [];
          setConversations(convs);
        })
        .catch((err) => {
          setError(err?.message || 'Could not load your chats. Please try again.');
        })
        .finally(() => setLoadingTargets(false));
    }
  }, [activeSection]);

  // Fetch groups when user clicks "Share to Group"
  useEffect(() => {
    if (activeSection === 'groups' && groups.length === 0) {
      setLoadingTargets(true);
      setError(null);
      fetch('/api/groups')
        .then(r => {
          if (!r.ok) throw new Error('Failed to load groups');
          return r.json();
        })
        .then(data => {
          const grps = Array.isArray(data?.groups) ? data.groups : [];
          setGroups(grps);
        })
        .catch((err) => {
          setError(err?.message || 'Could not load your groups. Please try again.');
        })
        .finally(() => setLoadingTargets(false));
    }
  }, [activeSection]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  }

  async function shareToDM(receiverId: string) {
    setSharing(true);
    setError(null);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId,
          content: shareMessage,
        }),
      });
      if (res.ok) {
        toast.success('Shared to chat!');
        handleClose();
      } else {
        const d = await res.json().catch(() => ({}));
        const errMsg = d.error || 'Failed to share to chat';
        setError(errMsg);
        toast.error(errMsg);
      }
    } catch {
      const errMsg = 'Network error. Please check your connection and try again.';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setSharing(false);
    }
  }

  async function shareToGroupChat(groupId: string) {
    setSharing(true);
    setError(null);
    try {
      const res = await fetch(`/api/groups/${groupId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: shareMessage }),
      });
      if (res.ok) {
        toast.success('Shared to group!');
        handleClose();
      } else {
        const d = await res.json().catch(() => ({}));
        const errMsg = d.error || 'Failed to share to group';
        setError(errMsg);
        toast.error(errMsg);
      }
    } catch {
      const errMsg = 'Network error. Please check your connection and try again.';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setSharing(false);
    }
  }

  const typeLabel = {
    post: 'Post',
    content_update: 'Content Update',
    fitness_update: 'Fitness Update',
    learning_update: 'Learning Topic',
  }[safeShareData.type] || 'Item';

  // Filter conversations by search query
  const filteredConversations = chatQuery.trim()
    ? conversations.filter(c =>
        c.otherUser.name?.toLowerCase().includes(chatQuery.toLowerCase()) ||
        c.otherUser.username?.toLowerCase().includes(chatQuery.toLowerCase())
      )
    : conversations;

  const filteredGroups = chatQuery.trim()
    ? groups.filter(g => g.name?.toLowerCase().includes(chatQuery.toLowerCase()))
    : groups;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { handleClose(); } }}>
      <DialogContent
        className="!p-3 box-border max-h-[85vh] overflow-y-auto overflow-x-hidden !max-w-[340px]"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 size={18} />
            Share {typeLabel}
          </DialogTitle>
        </DialogHeader>

        {!shareData ? (
          <div className="py-4 text-center">
            <p className="text-sm text-muted-foreground">No item selected to share</p>
          </div>
        ) : error ? (
          <div className="space-y-4">
            <div className="bg-destructive/10 rounded-lg p-4 text-center">
              <p className="text-sm text-destructive font-medium">Something went wrong</p>
              <p className="text-xs text-muted-foreground mt-1">{error}</p>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => { setError(null); setActiveSection('actions'); }}
            >
              Try Again
            </Button>
          </div>
        ) : (
        <div className="space-y-4">
          {/* Preview — compact, never overflows */}
          <div className="bg-accent/50 rounded-lg p-3 overflow-hidden">
            {safeShareData.userName && (
              <p className="text-xs text-muted-foreground mb-1">
                by {safeShareData.userName}
              </p>
            )}
            <p className="text-sm text-foreground line-clamp-2 break-words whitespace-normal w-full max-w-full">
              {safeShareData.preview}
            </p>
          </div>

          {/* FIX 2: URL display box — overflow-hidden text-ellipsis whitespace-nowrap box-border min-w-0 */}
          <div className="relative w-full box-border">
            <div className="w-full bg-accent/30 rounded-md pr-10 pl-3 py-2 text-xs text-muted-foreground border border-border/50 overflow-hidden box-border">
              <p className="truncate whitespace-nowrap text-ellipsis overflow-hidden">{shareUrl || 'Generating link...'}</p>
            </div>
            <button
              onClick={copyLink}
              disabled={!shareUrl}
              title="Copy link"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 rounded-md hover:bg-accent/60 transition-colors text-muted-foreground hover:text-foreground disabled:opacity-40"
            >
              {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
            </button>
          </div>

          {/* Share platform buttons — vertical stack, zero overflow risk */}
          <div className="flex flex-col gap-1 w-full">
            <button
              type="button"
              className="w-full flex items-center justify-center h-8 rounded-md border border-border bg-background text-xs text-foreground hover:bg-accent transition-colors overflow-hidden"
              onClick={() => {
                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent((safeShareData.preview?.slice(0, 100) || 'Check this out') + ' ' + shareUrl)}`, '_blank');
              }}
              disabled={!shareUrl}
            >
              WhatsApp
            </button>
            <div className="flex gap-1 w-full">
              <button
                type="button"
                className="flex-1 flex items-center justify-center h-8 rounded-md border border-border bg-background text-xs text-foreground hover:bg-accent transition-colors overflow-hidden"
                onClick={() => {
                  window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(safeShareData.preview?.slice(0, 100) || 'Check this out')}`, '_blank');
                }}
                disabled={!shareUrl}
              >
                X
              </button>
              <button
                type="button"
                className="flex-1 flex items-center justify-center h-8 rounded-md border border-border bg-background text-xs text-foreground hover:bg-accent transition-colors overflow-hidden"
                onClick={() => {
                  window.open(`https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(safeShareData.preview?.slice(0, 100) || 'Check this out')}`, '_blank');
                }}
                disabled={!shareUrl}
              >
                Reddit
              </button>
            </div>
          </div>

          {activeSection === 'actions' && (
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => setActiveSection('chats')}
                className="w-full"
              >
                <MessageCircle size={16} className="mr-2" />
                Share to Chat
              </Button>

              <Button
                onClick={() => setActiveSection('groups')}
                variant="outline"
                className="w-full"
              >
                <Users size={16} className="mr-2" />
                Share to Group
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  window.open(shareUrl, '_blank');
                }}
                className="w-full"
              >
                <ExternalLink size={16} className="mr-2" />
                Open in New Tab
              </Button>
            </div>
          )}

          {activeSection === 'chats' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={() => setActiveSection('actions')} className="text-xs shrink-0">
                  ← Back
                </Button>
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={14} />
                  <Input
                    value={chatQuery}
                    onChange={e => setChatQuery(e.target.value)}
                    placeholder="Search chats..."
                    className="bg-accent border-border text-foreground text-xs h-8 pl-8"
                  />
                </div>
              </div>

              {loadingTargets ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                </div>
              ) : filteredConversations.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No conversations found</p>
              ) : (
                <div className="max-h-52 overflow-y-auto space-y-1">
                  {filteredConversations.map(conv => (
                    <button
                      key={conv.id}
                      onClick={() => shareToDM(conv.otherUser.id)}
                      disabled={sharing}
                      className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-accent/50 transition-colors text-left"
                    >
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="bg-blue-600/30 text-blue-300 text-xs">
                          {conv.otherUser.name?.[0] || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{conv.otherUser.name || conv.otherUser.username}</p>
                        <p className="text-[10px] text-muted-foreground truncate">@{conv.otherUser.username}</p>
                      </div>
                      {sharing && <Loader2 size={14} className="animate-spin text-blue-400 shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSection === 'groups' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={() => setActiveSection('actions')} className="text-xs shrink-0">
                  ← Back
                </Button>
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={14} />
                  <Input
                    value={chatQuery}
                    onChange={e => setChatQuery(e.target.value)}
                    placeholder="Search groups..."
                    className="bg-accent border-border text-foreground text-xs h-8 pl-8"
                  />
                </div>
              </div>

              {loadingTargets ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                </div>
              ) : filteredGroups.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No groups found. Join a group first!</p>
              ) : (
                <div className="max-h-52 overflow-y-auto space-y-1">
                  {filteredGroups.map(group => (
                    <button
                      key={group.id}
                      onClick={() => shareToGroupChat(group.id)}
                      disabled={sharing}
                      className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-accent/50 transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-full bg-emerald-600/20 flex items-center justify-center shrink-0">
                        <Users size={14} className="text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{group.name}</p>
                        <p className="text-[10px] text-muted-foreground">{group.memberCount} members{group.isPublic ? ' · Public' : ' · Private'}</p>
                      </div>
                      {sharing && <Loader2 size={14} className="animate-spin text-blue-400 shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
