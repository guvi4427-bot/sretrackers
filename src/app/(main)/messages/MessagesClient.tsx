'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { MessageCircle, Users, Plus, Send, Settings, Shield, LogOut, Crown, Search, Loader2, ArrowLeft, X, BookOpen, Globe, Sparkles, ChevronRight, FileText, Dumbbell, Activity, Video, Rss } from 'lucide-react';
import { GlassCard } from '@/components/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUserStore } from '@/stores/user-store';
import { t } from '@/lib/i18n';
import { useRouter, useSearchParams } from 'next/navigation';

// ── Topic Share Message Card ──
function TopicShareCard({ content, router }: { content: string; router: ReturnType<typeof useRouter> }) {
  const isTopicShare = content.startsWith('📚 Shared learning topic:') || content.startsWith('📚 Shared my learning collection:');
  const topicIdMatch = content.match(/\[topicId:([\w-]+)\]/);
  const topicId = topicIdMatch ? topicIdMatch[1] : null;

  if (!isTopicShare || !topicId) return null;

  const cleanContent = content.replace(/\[topicId:[\w-]+\]/, '').replace('📚 Shared learning topic:', '').replace('📚 Shared my learning collection:', '').trim();

  return (
    <div className="mt-1.5">
      <div className="bg-blue-600/10 border border-blue-500/20 rounded-lg p-2.5">
        <div className="flex items-center gap-1.5 mb-1.5">
          <BookOpen size={12} className="text-blue-400 shrink-0" />
          <p className="text-xs text-blue-300 line-clamp-2 flex-1">{cleanContent}</p>
        </div>
        <button
          onClick={() => router.push(`/shared-topic/${topicId}?from=messages`)}
          className="w-full flex items-center gap-1.5 px-2.5 py-2 rounded-md bg-blue-600/10 hover:bg-blue-600/15 border border-blue-500/20 transition-colors group"
        >
          <Globe size={12} className="text-blue-400 shrink-0" />
          <span className="text-[10px] text-blue-300 font-medium flex-1 text-left">View Shared Collection</span>
          <Sparkles size={9} className="text-amber-400/50 group-hover:text-amber-400 transition-colors" />
          <ChevronRight size={12} className="text-blue-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}

// ── Helper: render clickable links in plain text ──
function renderTextWithLinks(text: string) {
  return text.split(/(https?:\/\/[^\s]+)/g).map((part, i) => {
    if (part.startsWith('http://') || part.startsWith('https://')) {
      const href = part.replace(/[.,;:!?)\]]+$/, '');
      return <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline underline-offset-2 hover:text-blue-300 break-all">{part}</a>;
    }
    return part;
  });
}

// ── Render message content with rich card detection ──
function renderMessageContent(content: string, router: ReturnType<typeof useRouter>) {
  // 1) Topic share (existing pattern)
  const isTopicShare = content.startsWith('📚 Shared learning topic:') || content.startsWith('📚 Shared my learning collection:');
  const topicIdMatch = content.match(/\[topicId:([\w-]+)\]/);
  const topicId = topicIdMatch ? topicIdMatch[1] : null;

  if (isTopicShare && topicId) {
    const cleanContent = content.replace(/\[topicId:[\w-]+\]/, '').replace('📚 Shared learning topic:', '').replace('📚 Shared my learning collection:', '').trim();
    return (
      <div>
        <div className="flex items-center gap-1.5 mb-1.5">
          <BookOpen size={12} className="text-blue-400 shrink-0" />
          <p className="text-xs line-clamp-2 flex-1">{cleanContent}</p>
        </div>
        <button
          onClick={() => router.push(`/shared-topic/${topicId}?from=messages`)}
          className="w-full flex items-center gap-1.5 px-2.5 py-2 rounded-md bg-blue-600/10 hover:bg-blue-600/15 border border-blue-500/20 transition-colors group"
        >
          <Globe size={12} className="text-blue-400 shrink-0" />
          <span className="text-[10px] font-medium flex-1 text-left">View Shared Collection</span>
          <Sparkles size={9} className="text-amber-400/50 group-hover:text-amber-400 transition-colors" />
          <ChevronRight size={12} className="text-blue-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    );
  }

  // 2) Shared post
  if (content.startsWith('📌 Shared a post')) {
    const postIdMatch = content.match(/\[postId:([\w-]+)\]/);
    const postId = postIdMatch ? postIdMatch[1] : null;
    const cleanContent = content.replace(/\[postId:[\w-]+\]/, '').replace('📌 Shared a post', '').replace(/^\s*by\s+[^:]+:/, '').trim().replace(/^"|"$/g, '');
    const byMatch = content.match(/by\s+([^:]+):/);
    const byName = byMatch ? byMatch[1].trim() : null;

    return (
      <div className="mt-1">
        <div className="bg-blue-600/10 border border-blue-500/20 rounded-lg p-2.5">
          <div className="flex items-center gap-1.5 mb-1.5">
            <FileText size={12} className="text-blue-400 shrink-0" />
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-600/20 text-blue-400">Post</span>
            {byName && <span className="text-[10px] text-muted-foreground">by {byName}</span>}
          </div>
          <p className="text-xs text-foreground/80 line-clamp-3 mb-2">{cleanContent}</p>
          <button
            onClick={() => router.push('/feed')}
            className="w-full flex items-center gap-1.5 px-2.5 py-2 rounded-md bg-blue-600/10 hover:bg-blue-600/15 border border-blue-500/20 transition-colors group"
          >
            <Rss size={12} className="text-blue-400 shrink-0" />
            <span className="text-[10px] text-blue-300 font-medium flex-1 text-left">View Post in Feed</span>
            <ChevronRight size={12} className="text-blue-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    );
  }

  // 3) Shared content update
  if (content.startsWith('🎬 Shared a content update')) {
    const idMatch = content.match(/\[contentEntryId:([\w-]+)\]/);
    const contentTypeMatch = content.match(/\[contentType:(\w+)\]/);
    const statusMatch = content.match(/\[status:([\w_]+)\]/);
    const cleanContent = content.replace(/\[contentEntryId:[\w-]+\]/, '').replace(/\[contentType:\w+\]/, '').replace(/\[status:[\w_]+\]/, '').replace('🎬 Shared a content update', '').replace(/^\s*by\s+[^:]+:/, '').trim().replace(/^"|"$/g, '');
    const byMatch = content.match(/by\s+([^:]+):/);
    const byName = byMatch ? byMatch[1].trim() : null;
    const ctLabel = contentTypeMatch ? contentTypeMatch[1].charAt(0).toUpperCase() + contentTypeMatch[1].slice(1) : 'Content';
    const statusLabel = statusMatch ? statusMatch[1].replace(/_/g, ' ') : '';

    return (
      <div className="mt-1">
        <div className="bg-purple-600/10 border border-purple-500/20 rounded-lg p-2.5">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Video size={12} className="text-purple-400 shrink-0" />
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-purple-600/20 text-purple-400">{ctLabel}</span>
            {statusLabel && <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-green-600/15 text-green-400">{statusLabel}</span>}
            {byName && <span className="text-[10px] text-muted-foreground">by {byName}</span>}
          </div>
          <p className="text-xs text-foreground/80 line-clamp-2 mb-2">{cleanContent}</p>
          <button
            onClick={() => router.push('/feed')}
            className="w-full flex items-center gap-1.5 px-2.5 py-2 rounded-md bg-purple-600/10 hover:bg-purple-600/15 border border-purple-500/20 transition-colors group"
          >
            <Globe size={12} className="text-purple-400 shrink-0" />
            <span className="text-[10px] text-purple-300 font-medium flex-1 text-left">View in Feed</span>
            <ChevronRight size={12} className="text-purple-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    );
  }

  // 4) Shared fitness update
  if (content.startsWith('💪 Shared a fitness update')) {
    const idMatch = content.match(/\[fitnessId:([\w-]+)\]/);
    const fitnessTypeMatch = content.match(/\[fitnessType:(\w+)\]/);
    const cleanContent = content.replace(/\[fitnessId:[\w-]+\]/, '').replace(/\[fitnessType:\w+\]/, '').replace('💪 Shared a fitness update', '').replace(/^\s*by\s+[^:]+:/, '').trim().replace(/^"|"$/g, '');
    const byMatch = content.match(/by\s+([^:]+):/);
    const byName = byMatch ? byMatch[1].trim() : null;
    const isWeight = fitnessTypeMatch?.[1] === 'weight';

    return (
      <div className="mt-1">
        <div className="bg-green-600/10 border border-green-500/20 rounded-lg p-2.5">
          <div className="flex items-center gap-1.5 mb-1.5">
            {isWeight ? <Activity size={12} className="text-green-400 shrink-0" /> : <Dumbbell size={12} className="text-green-400 shrink-0" />}
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-green-600/20 text-green-400">{isWeight ? 'Weight' : 'Workout'}</span>
            {byName && <span className="text-[10px] text-muted-foreground">by {byName}</span>}
          </div>
          <p className="text-xs text-foreground/80 line-clamp-2 mb-2">{cleanContent}</p>
          <button
            onClick={() => router.push('/feed')}
            className="w-full flex items-center gap-1.5 px-2.5 py-2 rounded-md bg-green-600/10 hover:bg-green-600/15 border border-green-500/20 transition-colors group"
          >
            <Activity size={12} className="text-green-400 shrink-0" />
            <span className="text-[10px] text-green-300 font-medium flex-1 text-left">View in Feed</span>
            <ChevronRight size={12} className="text-green-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    );
  }

  // 5) Regular message — render with clickable links
  return renderTextWithLinks(content);
}

export default function MessagesClient() {
  return (
    <Suspense fallback={<div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-blue-400 animate-spin" /></div>}>
      <MessagesPageInner />
    </Suspense>
  );
}

function MessagesPageInner() {
  const { profile } = useUserStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('dm');
  const [conversations, setConversations] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<string|null>(null);
  const [activeGroup, setActiveGroup] = useState<string|null>(null);
  const [activeConvOtherUser, setActiveConvOtherUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [loading, setLoading] = useState(true);
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [showGroupMembers, setShowGroupMembers] = useState(false);
  const [activeGroupMessageAccess, setActiveGroupMessageAccess] = useState<string>('all');
  const [activeGroupMyRole, setActiveGroupMyRole] = useState<string>('member');
  const pollRef = useRef<ReturnType<typeof setInterval>|null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = useCallback(async () => {
    try {
      const r = await fetch('/api/messages');
      if (r.ok) {
        const d = await r.json();
        setConversations(Array.isArray(d) ? d : d.conversations || []);
      }
    } catch {}
  }, []);

  const fetchGroups = useCallback(async () => {
    try {
      const r = await fetch('/api/groups');
      if (r.ok) {
        const d = await r.json();
        setGroups(Array.isArray(d) ? d : d.groups || []);
      }
    } catch {}
  }, []);

  const [discoverGroups, setDiscoverGroups] = useState<any[]>([]);
  const [showDiscoverGroups, setShowDiscoverGroups] = useState(false);

  const fetchDiscoverGroups = useCallback(async () => {
    try {
      const r = await fetch('/api/discover?type=groups');
      if (r.ok) {
        const d = await r.json();
        const allGroups = Array.isArray(d) ? d : d.groups || [];
        // Filter out groups user is already in
        const myGroupIds = new Set(groups.map((g: any) => g.id));
        setDiscoverGroups(allGroups.filter((g: any) => !myGroupIds.has(g.id)));
      }
    } catch {}
  }, [groups]);

  async function joinGroup(groupId: string) {
    try {
      const r = await fetch(`/api/groups/${groupId}/join`, { method: 'POST' });
      if (r.ok) {
        toast.success('Joined group!');
        fetchGroups();
        setDiscoverGroups(prev => prev.filter(g => g.id !== groupId));
      } else {
        const d = await r.json();
        toast.error(d.error || 'Failed to join group');
      }
    } catch {
      toast.error('Failed to join group');
    }
  }

  useEffect(() => { fetchConversations(); fetchGroups(); setLoading(false); }, [fetchConversations, fetchGroups]);

  // Auto-start DM when navigated from friends tab with ?userId=xxx
  const dmInitRef = useRef<string|null>(null); // Track which userId we've already init'd
  useEffect(() => {
    const targetUserId = searchParams.get('userId');
    if (!targetUserId) return;
    if (dmInitRef.current === targetUserId) return; // Already init'd this user
    if (!profile?.userId) return; // Wait for profile to load
    dmInitRef.current = targetUserId;
    // Fetch target user's profile FIRST to ensure we have the name
    (async () => {
      try {
        // Fetch user profile for display name
        const userRes = await fetch(`/api/user/public/${targetUserId}`);
        let otherUser = { id: targetUserId, name: 'User', username: '' };
        if (userRes.ok) {
          const ud = await userRes.json();
          otherUser = { id: targetUserId, name: ud.profile?.name || ud.username || 'User', username: ud.username || '' };
        }

        // Check if conversation already exists
        const convs = await (await fetch('/api/messages')).json();
        const allConvs = Array.isArray(convs) ? convs : convs.conversations || [];
        const existing = allConvs.find((c: any) => c.otherUser?.id === targetUserId);
        if (existing) {
          // Use the otherUser from our fetch (more reliable name) merged with existing conv data
          const mergedOtherUser = { ...existing.otherUser, ...otherUser, name: otherUser.name || existing.otherUser?.name || 'User' };
          openConversation(existing.id, mergedOtherUser);
        } else {
          // Create conversation with a greeting
          const r = await fetch('/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ receiverId: targetUserId, content: 'Hi!' }),
          });
          if (r.ok) {
            const data = await r.json();
            await fetchConversations();
            if (data.conversationId) {
              openConversation(data.conversationId, otherUser);
            }
          }
        }
        // Clean up URL so refresh doesn't re-trigger — use replaceState to avoid navigation
        if (typeof window !== 'undefined') {
          window.history.replaceState(null, '', '/messages');
        }
      } catch {}
    })();
  }, [searchParams, profile?.userId]);

  // Refetch conversations periodically for DM persistence
  useEffect(() => {
    const interval = setInterval(() => { fetchConversations(); }, 10000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  // Sync activeConvOtherUser name from conversations list when conversations update
  useEffect(() => {
    if (!activeConv || !activeConvOtherUser) return;
    const conv = conversations.find((c: any) => c.id === activeConv);
    // Only update if conversations list has a better name than what we currently have
    if (conv?.otherUser?.name && conv.otherUser.name !== 'User' && (!activeConvOtherUser.name || activeConvOtherUser.name === 'User')) {
      setActiveConvOtherUser((prev: any) => prev ? { ...prev, name: conv.otherUser.name, username: conv.otherUser.username || prev.username } : prev);
    }
  }, [conversations, activeConv, activeConvOtherUser]);

  // Polling
  useEffect(() => {
    pollRef.current = setInterval(() => {
      if (activeConv) {
        fetch(`/api/messages/${activeConv}`).then(r => r.ok ? r.json() : []).then(d => setMessages(Array.isArray(d) ? d : d.messages || [])).catch(() => {});
      }
      if (activeGroup) {
        fetch(`/api/groups/${activeGroup}/messages`).then(r => r.ok ? r.json() : {}).then((d: any) => setMessages(Array.isArray(d) ? d : d.messages || [])).catch(() => {});
      }
    }, 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [activeConv, activeGroup]);

  // Sync active group messageAccess & myRole when groups array changes (e.g. after fetchGroups)
  useEffect(() => {
    if (!activeGroup) return;
    const grp = groups.find(g => g.id === activeGroup);
    if (grp) {
      if (grp.messageAccess) setActiveGroupMessageAccess(grp.messageAccess);
      const myMember = (grp.members || []).find((m: any) => m.userId === profile?.userId);
      if (myMember?.role) setActiveGroupMyRole(myMember.role);
    }
  }, [groups, activeGroup, profile?.userId]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function openConversation(convId: string, otherUser?: any) {
    setActiveConv(convId);
    setActiveGroup(null);
    setMobileShowChat(true);
    // Set otherUser immediately with whatever we have
    const initialUser = otherUser || conversations.find((c: any) => c.id === convId)?.otherUser;
    if (initialUser) {
      setActiveConvOtherUser(initialUser);
    }
    // Always fetch real name from API to avoid showing "User" placeholder
    const otherUserId = initialUser?.id || otherUser?.id;
    if (otherUserId) {
      try {
        const userRes = await fetch(`/api/user/public/${otherUserId}`);
        if (userRes.ok) {
          const ud = await userRes.json();
          const realName = ud.profile?.name || ud.username || 'User';
          const realUsername = ud.username || '';
          // Only update if we got a better name than what we had
          if (realName !== 'User' || !initialUser?.name) {
            setActiveConvOtherUser(prev => {
              // Don't overwrite if we already have a good name
              if (prev && prev.name && prev.name !== 'User') return prev;
              return { id: otherUserId, name: realName, username: realUsername };
            });
          }
        }
      } catch {}
    }
    try {
      const r = await fetch(`/api/messages/${convId}`);
      if (r.ok) {
        const d = await r.json();
        setMessages(Array.isArray(d) ? d : d.messages || []);
      }
    } catch {}
  }

  async function openGroupChat(groupId: string) {
    setActiveGroup(groupId);
    setActiveConv(null);
    setActiveConvOtherUser(null);
    setMobileShowChat(true);
    try {
      // Fetch group details for access control
      const gr = await fetch(`/api/groups/${groupId}`);
      if (gr.ok) {
        const gd = await gr.json();
        const grp = gd.group || gd;
        setActiveGroupMessageAccess(grp.messageAccess || 'all');
        const myMember = (grp.members || []).find((m: any) => m.userId === profile?.userId);
        setActiveGroupMyRole(myMember?.role || 'member');
      }
      // Fetch messages
      const r = await fetch(`/api/groups/${groupId}/messages`);
      if (r.ok) {
        const d = await r.json();
        setMessages(Array.isArray(d) ? d : d.messages || []);
      }
    } catch {}
  }

  async function sendMessage() {
    if (!newMessage.trim()) return;
    const msgContent = newMessage.trim();
    setNewMessage('');
    try {
      if (activeConv) {
        // For DMConversation-based conversations
        const conv = conversations.find((c: any) => c.id === activeConv);
        const receiverId = conv?.otherUser?.id || activeConv.replace('legacy_', '');
        await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ receiverId, content: msgContent }),
        });
        // Refetch messages
        const r = await fetch(`/api/messages/${activeConv}`);
        if (r.ok) {
          const d = await r.json();
          setMessages(Array.isArray(d) ? d : d.messages || []);
        }
      } else if (activeGroup) {
        await fetch(`/api/groups/${activeGroup}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: msgContent }),
        });
        const r = await fetch(`/api/groups/${activeGroup}/messages`);
        if (r.ok) {
          const d = await r.json();
          setMessages(Array.isArray(d) ? d : d.messages || []);
        }
      }
    } catch {}
  }

  async function searchUsers() {
    if (!searchQuery.trim()) return;
    try {
      const r = await fetch(`/api/discover?type=users&q=${encodeURIComponent(searchQuery)}`);
      if (r.ok) {
        const d = await r.json();
        setSearchResults(Array.isArray(d) ? d : d.users || []);
      }
    } catch {}
  }

  async function startDM(userId: string) {
    try {
      // Fetch target user's profile for display name
      const userRes = await fetch(`/api/user/public/${userId}`);
      let otherUser: any = { id: userId, name: 'User', username: '' };
      if (userRes.ok) {
        const ud = await userRes.json();
        otherUser = { id: userId, name: ud.profile?.name || ud.username || 'User', username: ud.username || '' };
      }
      const r = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId: userId, content: 'Hi!' }),
      });
      if (r.ok) {
        const data = await r.json();
        await fetchConversations();
        setSearchQuery('');
        setSearchResults([]);
        // Open the new conversation with the fetched user info
        if (data.conversationId) {
          openConversation(data.conversationId, otherUser);
        }
      }
    } catch {}
  }

  async function createGroup() {
    if (!newGroupName.trim()) return;
    try {
      const r = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newGroupName, description: newGroupDesc, isPublic: true }),
      });
      if (r.ok) {
        setCreateGroupOpen(false);
        setNewGroupName('');
        setNewGroupDesc('');
        fetchGroups();
        toast.success('Group created!');
      }
    } catch {
      toast.error('Failed to create group');
    }
  }

  async function deleteGroup(groupId: string) {
    if (!confirm('Delete this group? This cannot be undone.')) return;
    try {
      const r = await fetch(`/api/groups/${groupId}`, { method: 'DELETE' });
      if (r.ok) {
        setActiveGroup(null);
        setMobileShowChat(false);
        fetchGroups();
        toast.success('Group deleted');
      } else {
        const d = await r.json();
        toast.error(d.error || 'Failed to delete group');
      }
    } catch {
      toast.error('Failed to delete group');
    }
  }

  async function toggleGroupVisibility(groupId: string, isPublic: boolean) {
    try {
      const r = await fetch(`/api/groups/${groupId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: !isPublic }),
      });
      if (r.ok) { fetchGroups(); toast.success(`Group is now ${!isPublic ? 'public' : 'private'}`); }
      else { const d = await r.json(); toast.error(d.error || 'Failed'); }
    } catch {
      toast.error('Failed');
    }
  }

  async function toggleGroupMessageAccess(groupId: string, currentAccess: string) {
    try {
      const newAccess = currentAccess === 'all' ? 'admins_only' : 'all';
      const r = await fetch(`/api/groups/${groupId}/admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'change_message_access', value: newAccess }),
      });
      if (r.ok) {
        setActiveGroupMessageAccess(newAccess);
        fetchGroups();
        toast.success('Message access updated');
      }
      else { const d = await r.json(); toast.error(d.error || 'Failed'); }
    } catch {
      toast.error('Failed');
    }
  }

  async function removeGroupMember(groupId: string, userId: string) {
    try {
      const r = await fetch(`/api/groups/${groupId}/members`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (r.ok) { fetchGroups(); toast.success('Member removed'); }
      else { const d = await r.json(); toast.error(d.error || 'Failed'); }
    } catch {
      toast.error('Failed');
    }
  }

  async function promoteToAdmin(groupId: string, userId: string) {
    try {
      const r = await fetch(`/api/groups/${groupId}/admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'appoint_admin', targetUserId: userId }),
      });
      if (r.ok) { fetchGroups(); toast.success('Promoted to admin'); }
      else { const d = await r.json(); toast.error(d.error || 'Failed'); }
    } catch {
      toast.error('Failed');
    }
  }

  async function demoteFromAdmin(groupId: string, userId: string) {
    try {
      const r = await fetch(`/api/groups/${groupId}/admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'remove_admin', targetUserId: userId }),
      });
      if (r.ok) { fetchGroups(); toast.success('Demoted to member'); }
      else { const d = await r.json(); toast.error(d.error || 'Failed'); }
    } catch {
      toast.error('Failed');
    }
  }

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-blue-400 animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto">
      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setMobileShowChat(false); }}>
        <TabsList className="bg-accent border border-border w-full flex">
          <TabsTrigger value="dm" className="text-muted-foreground data-[state=active]:text-blue-400 data-[state=active]:bg-blue-600/20 flex-1">{t('messages.direct')}</TabsTrigger>
          <TabsTrigger value="groups" className="text-muted-foreground data-[state=active]:text-emerald-400 data-[state=active]:bg-emerald-600/20 flex-1">{t('messages.groups')}</TabsTrigger>
        </TabsList>

        <TabsContent value="dm" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Conversation List */}
            <div className={`space-y-2 ${mobileShowChat ? 'hidden lg:block' : ''}`}>
              <div className="flex gap-2 mb-2">
                <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && searchUsers()} placeholder="Search users..." className="bg-accent border-border text-foreground text-xs" />
                <Button onClick={searchUsers} size="sm" className="gradient-blue"><Search size={14} /></Button>
              </div>
              {searchResults.map((u: any) => (
                <GlassCard key={u.id} className="p-2 flex items-center justify-between cursor-pointer" onClick={() => startDM(u.id)}>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-7 w-7"><AvatarFallback className="bg-blue-600/30 text-blue-300 text-[10px]">{u.name?.[0] || u.username?.[0] || '?'}</AvatarFallback></Avatar>
                    <span className="text-xs text-foreground">{u.name || u.username}</span>
                  </div>
                </GlassCard>
              ))}
              {conversations.map((conv: any) => (
                <GlassCard key={conv.id} className={`p-3 cursor-pointer ${activeConv === conv.id ? 'border-blue-500/40 bg-blue-600/10' : ''}`} onClick={() => openConversation(conv.id, conv.otherUser)}>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8"><AvatarFallback className="bg-blue-600/30 text-blue-300 text-xs">{conv.otherUser?.name?.[0] || '?'}</AvatarFallback></Avatar>
                    <div className="min-w-0">
                      <p className="text-sm text-foreground truncate">{conv.otherUser?.name || conv.otherUser?.username || 'User'}</p>
                      <p className="text-[10px] text-muted-foreground/70 truncate max-w-[150px]">{conv.lastMessage || ''}</p>
                    </div>
                  </div>
                </GlassCard>
              ))}
              {conversations.length === 0 && searchResults.length === 0 && (
                <p className="text-xs text-muted-foreground/50 text-center py-4">No conversations yet. Search for users to start a DM!</p>
              )}
            </div>
            {/* Chat Area */}
            <div className={`lg:col-span-2 ${!mobileShowChat ? 'hidden lg:block' : ''}`}>
              {activeConv ? (
                <GlassCard className="p-4 h-[500px] flex flex-col">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
                    <button onClick={() => setMobileShowChat(false)} className="lg:hidden text-muted-foreground hover:text-foreground"><ArrowLeft size={18} /></button>
                    <Avatar className="h-7 w-7"><AvatarFallback className="bg-blue-600/30 text-blue-300 text-xs">{activeConvOtherUser?.name?.[0] || '?'}</AvatarFallback></Avatar>
                    <span className="text-sm font-medium text-foreground">{activeConvOtherUser?.name || activeConvOtherUser?.username || 'User'}</span>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-3 mb-3">
                    {messages.map((m: any, i: number) => (
                      <div key={m.id || i} className={`flex ${m.senderId === profile?.userId ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${m.senderId === profile?.userId ? 'bg-blue-600 text-white rounded-br-md' : 'bg-accent text-foreground rounded-bl-md'}`}>
                          {renderMessageContent(m.content, router)}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                  <div className="flex gap-2">
                    <Input value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()} placeholder="Message..." className="bg-accent border-border text-foreground" />
                    <Button onClick={sendMessage} className="gradient-blue shrink-0"><Send size={16} /></Button>
                  </div>
                </GlassCard>
              ) : (
                <GlassCard className="p-8 h-[500px] flex items-center justify-center">
                  <p className="text-muted-foreground/60 text-sm">{t('messages.newConversation')}</p>
                </GlassCard>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="groups" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className={`space-y-2 ${mobileShowChat ? 'hidden lg:block' : ''}`}>
              <Button onClick={() => setCreateGroupOpen(true)} className="gradient-blue w-full text-xs mb-2"><Plus size={14} className="mr-1" />{t('messages.createGroup')}</Button>
              <Button onClick={() => { setShowDiscoverGroups(true); fetchDiscoverGroups(); }} variant="outline" className="w-full text-xs mb-2 border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/10"><Search size={14} className="mr-1" />Discover Groups</Button>

              {showDiscoverGroups && discoverGroups.length > 0 && (
                <div className="space-y-2 mb-3 p-3 rounded-xl bg-emerald-600/5 border border-emerald-500/20">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-emerald-400">Public Groups</p>
                    <button onClick={() => setShowDiscoverGroups(false)} className="text-muted-foreground/50 hover:text-foreground"><X size={14} /></button>
                  </div>
                  {discoverGroups.map((g: any) => (
                    <GlassCard key={g.id} className="p-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-600/20 flex items-center justify-center"><Users size={12} className="text-emerald-400" /></div>
                        <div>
                          <p className="text-xs text-foreground">{g.name}</p>
                          <p className="text-[10px] text-muted-foreground/70">{g.memberCount || g._count?.members || 0} members</p>
                        </div>
                      </div>
                      <Button onClick={() => joinGroup(g.id)} size="sm" className="text-[10px] h-7 bg-emerald-600 hover:bg-emerald-700 text-white">Join</Button>
                    </GlassCard>
                  ))}
                </div>
              )}

              {groups.map((g: any) => (
                <GlassCard key={g.id} className={`p-3 cursor-pointer ${activeGroup === g.id ? 'border-emerald-500/40 bg-emerald-600/10' : ''}`} onClick={() => openGroupChat(g.id)}>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-600/20 flex items-center justify-center"><Users size={14} className="text-emerald-400" /></div>
                    <div className="min-w-0">
                      <p className="text-sm text-foreground truncate">{g.name}</p>
                      <p className="text-[10px] text-muted-foreground/70">{g.memberCount || g._count?.members || 0} members</p>
                    </div>
                  </div>
                </GlassCard>
              ))}
              {groups.length === 0 && (
                <p className="text-xs text-muted-foreground/50 text-center py-4">No groups yet. Create one!</p>
              )}
            </div>
            <div className={`lg:col-span-2 ${!mobileShowChat ? 'hidden lg:block' : ''}`}>
              {activeGroup ? (
                <GlassCard className="p-4 h-[500px] flex flex-col">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
                    <button onClick={() => { setMobileShowChat(false); setActiveGroup(null); }} className="lg:hidden text-muted-foreground hover:text-foreground"><ArrowLeft size={18} /></button>
                    <div className="w-7 h-7 rounded-full bg-emerald-600/20 flex items-center justify-center"><Users size={12} className="text-emerald-400" /></div>
                    <span className="text-sm font-medium text-foreground">{groups.find(g => g.id === activeGroup)?.name || 'Group'}</span>
                    {(() => {
                      const isCreatorOrAdmin = activeGroupMyRole === 'creator' || activeGroupMyRole === 'admin';
                      const grp = groups.find(g => g.id === activeGroup);
                      return isCreatorOrAdmin ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><button className="text-muted-foreground/50 hover:text-foreground p-1"><Settings size={14} /></button></DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-background border-border">
                            <DropdownMenuItem onClick={() => toggleGroupVisibility(activeGroup, grp?.isPublic !== false)} className="cursor-pointer">
                              {grp?.isPublic ? 'Make Private' : 'Make Public'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleGroupMessageAccess(activeGroup, activeGroupMessageAccess)} className="cursor-pointer">
                              {activeGroupMessageAccess === 'all' ? 'Admins Only Chat' : 'Everyone Can Chat'}
                            </DropdownMenuItem>
                            {activeGroupMyRole === 'creator' && (
                              <DropdownMenuItem onClick={() => deleteGroup(activeGroup)} className="text-red-400 cursor-pointer">
                                Delete Group
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : null;
                    })()}
                  </div>
                  {/* Group Members Section */}
                  {(() => {
                    const grp = groups.find(g => g.id === activeGroup);
                    const myMembership = grp?.members?.find((m: any) => m.userId === profile?.userId);
                    const isCreatorOrAdmin = myMembership?.role === 'creator' || myMembership?.role === 'admin';
                    const isCreator = myMembership?.role === 'creator';
                    return isCreatorOrAdmin && grp?.members ? (
                      <div className="mb-2">
                        <button onClick={() => setShowGroupMembers(!showGroupMembers)} className="text-xs text-muted-foreground/60 hover:text-foreground flex items-center gap-1">
                          <Users size={12} /> {grp.members.length} members {showGroupMembers ? '▲' : '▼'}
                        </button>
                        {showGroupMembers && (
                          <div className="mt-1 space-y-1 max-h-32 overflow-y-auto">
                            {grp.members.map((m: any) => (
                              <div key={m.userId} className="flex items-center justify-between text-xs px-1 py-0.5">
                                <span className={`${m.role === 'creator' ? 'text-amber-400' : m.role === 'admin' ? 'text-blue-400' : 'text-muted-foreground'}`}>
                                  {m.role === 'creator' ? '👑 ' : m.role === 'admin' ? '🛡 ' : ''}{m.name || m.username}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  {isCreator && m.role === 'member' && (
                                    <button onClick={() => promoteToAdmin(activeGroup, m.userId)} className="text-blue-400/60 hover:text-blue-400 text-[10px]">Make Admin</button>
                                  )}
                                  {isCreator && m.role === 'admin' && (
                                    <button onClick={() => demoteFromAdmin(activeGroup, m.userId)} className="text-amber-400/60 hover:text-amber-400 text-[10px]">Remove Admin</button>
                                  )}
                                  {isCreator && m.role !== 'creator' && (
                                    <button onClick={() => removeGroupMember(activeGroup, m.userId)} className="text-red-400/60 hover:text-red-400 text-[10px]">Remove</button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : null;
                  })()}
                  <div className="flex-1 overflow-y-auto space-y-3 mb-3">
                    {messages.map((m: any, i: number) => (
                      <div key={m.id || i} className={`flex ${m.senderId === profile?.userId || m.isOwn ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${m.senderId === profile?.userId || m.isOwn ? 'bg-emerald-600 text-white rounded-br-md' : 'bg-accent text-foreground rounded-bl-md'}`}>
                          {(m.senderId !== profile?.userId && !m.isOwn) && <p className="text-[10px] text-muted-foreground/70 mb-0.5">{m.senderName || m.sender?.username || 'User'}</p>}
                          {renderMessageContent(m.content, router)}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                  {/* Message input - hidden for members when admins_only */}
                  {(() => {
                    const isAdminOrCreator = activeGroupMyRole === 'creator' || activeGroupMyRole === 'admin';
                    const canSendMessage = activeGroupMessageAccess === 'all' || isAdminOrCreator;
                    return canSendMessage ? (
                      <div className="flex gap-2">
                        <Input value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()} placeholder="Message..." className="bg-accent border-border text-foreground" />
                        <Button onClick={sendMessage} className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"><Send size={16} /></Button>
                      </div>
                    ) : (
                      <div className="text-center py-2">
                        <p className="text-[10px] text-muted-foreground/50 flex items-center justify-center gap-1"><Shield size={10} /> Only admins can send messages</p>
                      </div>
                    );
                  })()}
                </GlassCard>
              ) : (
                <GlassCard className="p-8 h-[500px] flex items-center justify-center">
                  <p className="text-muted-foreground/60 text-sm">Select a group to start chatting</p>
                </GlassCard>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={createGroupOpen} onOpenChange={setCreateGroupOpen}>
        <DialogContent className="bg-background border-border"><DialogHeader><DialogTitle className="text-foreground">{t('messages.createGroup')}</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-4"><Input value={newGroupName} onChange={e => setNewGroupName(e.target.value)} placeholder="Group name" className="bg-accent border-border text-foreground" /><Textarea value={newGroupDesc} onChange={e => setNewGroupDesc(e.target.value)} placeholder="Description" className="bg-accent border-border text-foreground" rows={2} /><Button onClick={createGroup} className="gradient-blue w-full">{t('common.submit')}</Button></div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
