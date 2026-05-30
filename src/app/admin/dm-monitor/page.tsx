'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/glass-card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Monitor, MessageCircle, Users, RefreshCw } from 'lucide-react';

export default function DMMonitorPage() {
  const [dmConversations, setDmConversations] = useState<any[]>([]);
  const [groupChats, setGroupChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMessages, setViewMessages] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/dm');
      if (r.ok) {
        const data = await r.json();
        setDmConversations(data.dmConversations || []);
        setGroupChats(data.groupChats || []);
      }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const fetchMessages = async (type: 'dm' | 'group', id: string) => {
    try {
      const r = await fetch(`/api/admin/dm?type=${type}&id=${id}`);
      if (r.ok) {
        const data = await r.json();
        setMessages(data.messages || []);
        setViewMessages({ type, id });
      }
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">DM & Group Chat Monitor</h1>
          <p className="text-sm text-muted-foreground mt-1">Monitor all conversations</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData}><RefreshCw size={14} className="mr-2" />Refresh</Button>
      </div>

      {/* DM Conversations */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2"><MessageCircle size={18} />Direct Messages ({dmConversations.length})</h2>
        {dmConversations.length === 0 ? (
          <GlassCard className="p-6 text-center text-muted-foreground">No DM conversations yet</GlassCard>
        ) : (
          <div className="space-y-2">
            {dmConversations.map((dm: any) => (
              <GlassCard key={dm.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <Avatar className="h-8 w-8 border-2 border-background"><AvatarFallback className="bg-blue-600/30 text-blue-300 text-xs">{dm.p1name?.[0] || '?'}</AvatarFallback></Avatar>
                    <Avatar className="h-8 w-8 border-2 border-background"><AvatarFallback className="bg-purple-600/30 text-purple-300 text-xs">{dm.p2name?.[0] || '?'}</AvatarFallback></Avatar>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{dm.p1name || 'User'} ↔ {dm.p2name || 'User'}</p>
                    <p className="text-xs text-muted-foreground">{dm.messageCount || 0} messages</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => fetchMessages('dm', dm.id)}>View</Button>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      {/* Group Chats */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2"><Users size={18} />Group Chats ({groupChats.length})</h2>
        {groupChats.length === 0 ? (
          <GlassCard className="p-6 text-center text-muted-foreground">No group chats yet</GlassCard>
        ) : (
          <div className="space-y-2">
            {groupChats.map((gc: any) => (
              <GlassCard key={gc.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{gc.name}</p>
                  <p className="text-xs text-muted-foreground">{gc.memberCount || 0} members · {gc.messageCount || 0} messages</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => fetchMessages('group', gc.id)}>View</Button>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      {/* Message Viewer Dialog */}
      <Dialog open={!!viewMessages} onOpenChange={() => setViewMessages(null)}>
        <DialogContent className="bg-background border-border max-w-2xl">
          <DialogHeader><DialogTitle className="text-foreground">Messages</DialogTitle></DialogHeader>
          <ScrollArea className="max-h-[500px]">
            <div className="space-y-2 p-2">
              {messages.map((msg: any, i: number) => (
                <div key={i} className="flex gap-2 p-2 rounded-lg bg-accent">
                  <Avatar className="h-6 w-6"><AvatarFallback className="bg-blue-600/30 text-blue-300 text-[10px]">{msg.senderName?.[0] || '?'}</AvatarFallback></Avatar>
                  <div>
                    <p className="text-xs font-medium text-foreground">{msg.senderName || 'User'}</p>
                    <p className="text-sm text-muted-foreground">{msg.content}</p>
                    <p className="text-[10px] text-muted-foreground">{msg.createdAt ? new Date(msg.createdAt).toLocaleString() : ''}</p>
                  </div>
                </div>
              ))}
              {messages.length === 0 && <p className="text-center text-muted-foreground py-8">No messages</p>}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
