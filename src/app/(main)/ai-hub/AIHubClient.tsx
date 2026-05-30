'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, BookOpen, Dumbbell, Clock, PenTool, Compass, Menu,
  Send, Loader2, Sparkles, MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GlassCard } from '@/components/glass-card';
import { AIMessage } from '@/components/ai-message';
import { ChatSidebar } from '@/components/chat-sidebar';
import { toast } from 'sonner';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

interface AgentCard {
  type: string;
  name: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  iconBg: string;
  badgeColor: string;
}

const AGENT_CARDS: AgentCard[] = [
  {
    type: 'general',
    name: 'Main Assistant',
    description: 'General-purpose AI for questions, brainstorming, and platform guidance',
    icon: Bot,
    gradient: 'from-blue-500 to-blue-700',
    iconBg: 'bg-blue-500/20 border-blue-500/30',
    badgeColor: 'text-blue-400',
  },
  {
    type: 'learning',
    name: 'Learning Tutor',
    description: 'AI tutor for study topics, progress checks, and learning strategies',
    icon: BookOpen,
    gradient: 'from-purple-500 to-purple-700',
    iconBg: 'bg-purple-500/20 border-purple-500/30',
    badgeColor: 'text-purple-400',
  },
  {
    type: 'fitness',
    name: 'Fitness Coach',
    description: 'Workout planning, macro estimation, weight tracking guidance',
    icon: Dumbbell,
    gradient: 'from-emerald-500 to-emerald-700',
    iconBg: 'bg-emerald-500/20 border-emerald-500/30',
    badgeColor: 'text-emerald-400',
  },
  {
    type: 'time',
    name: 'Productivity Coach',
    description: 'Task classification, focus strategies, and day planning insights',
    icon: Clock,
    gradient: 'from-amber-500 to-amber-700',
    iconBg: 'bg-amber-500/20 border-amber-500/30',
    badgeColor: 'text-amber-400',
  },
  {
    type: 'content',
    name: 'Content Assistant',
    description: 'Script reviews, posting time suggestions, and content strategy',
    icon: PenTool,
    gradient: 'from-pink-500 to-pink-700',
    iconBg: 'bg-pink-500/20 border-pink-500/30',
    badgeColor: 'text-pink-400',
  },
  {
    type: 'navigation',
    name: 'Platform Navigator',
    description: 'Guide to SRE features, navigation help, and how-to answers',
    icon: Compass,
    gradient: 'from-cyan-500 to-cyan-700',
    iconBg: 'bg-cyan-500/20 border-cyan-500/30',
    badgeColor: 'text-cyan-400',
  },
];

export default function AIHubClient() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [currentAgentType, setCurrentAgentType] = useState<string>('general');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const loadConversation = useCallback(async (id: string) => {
    setLoadingConversation(true);
    try {
      const res = await fetch(`/api/ai/conversations/${id}`);
      if (res.ok) {
        const data = await res.json();
        const conv = data.conversation;
        setConversationId(conv.id);
        setCurrentAgentType(conv.aiAgentType || 'general');
        setMessages(
          (conv.messages || []).map((m: any) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            createdAt: m.createdAt,
          }))
        );
      } else {
        toast.error('Failed to load conversation');
      }
    } catch {
      toast.error('Failed to load conversation');
    } finally {
      setLoadingConversation(false);
      setSidebarOpen(false);
    }
  }, []);

  const handleNewChat = useCallback(() => {
    setConversationId(null);
    setMessages([]);
    setCurrentAgentType('general');
    setSidebarOpen(false);
    inputRef.current?.focus();
  }, []);

  const handleSelectConversation = useCallback((id: string) => {
    loadConversation(id);
  }, [loadConversation]);

  const handleStartChatWithAgent = (agentType: string) => {
    setConversationId(null);
    setMessages([]);
    setCurrentAgentType(agentType);
    inputRef.current?.focus();
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          botType: currentAgentType,
          conversationId,
          history: messages.slice(-30).map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.conversationId) setConversationId(data.conversationId);

        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.response || data.reply || "I'm here to help!",
          createdAt: new Date().toISOString(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        const errorMsg: ChatMessage = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          createdAt: new Date().toISOString(),
        };
        setMessages(prev => [...prev, errorMsg]);
      }
    } catch {
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Connection issue. Please check your network and try again.',
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const activeAgent = AGENT_CARDS.find(a => a.type === currentAgentType) || AGENT_CARDS[0];
  const ActiveIcon = activeAgent.icon;

  return (
    <div className="flex h-[calc(100vh-7rem)] md:h-[calc(100vh-4rem)] overflow-hidden">
      {/* Sidebar */}
      <ChatSidebar
        agentType="all"
        currentConversationId={conversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background/50 backdrop-blur-sm">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 md:hidden text-muted-foreground"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={18} />
          </Button>
          <div className="flex items-center gap-2">
            <div className={cn('w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center', activeAgent.gradient)}>
              <ActiveIcon size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{activeAgent.name}</p>
              <p className="text-[10px] text-muted-foreground/50">
                {conversationId ? `Chat · ${messages.length} messages` : 'New conversation'}
              </p>
            </div>
          </div>
          {conversationId && (
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto text-xs text-muted-foreground hover:text-foreground"
              onClick={handleNewChat}
            >
              New Chat
            </Button>
          )}
        </div>

        {/* Messages or welcome screen */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {loadingConversation ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 size={24} className="animate-spin text-muted-foreground/40" />
            </div>
          ) : messages.length === 0 ? (
            <ScrollArea className="h-full">
              <div className="max-w-2xl mx-auto p-6">
                {/* Welcome */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mb-8"
                >
                  <div className={cn('w-16 h-16 rounded-2xl bg-gradient-to-br mx-auto mb-4 flex items-center justify-center', activeAgent.gradient)}>
                    <ActiveIcon size={28} className="text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">AI Hub</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Choose an AI assistant or start chatting
                  </p>
                </motion.div>

                {/* Agent cards grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {AGENT_CARDS.map((agent, i) => {
                    const Icon = agent.icon;
                    const isActive = agent.type === currentAgentType;
                    return (
                      <motion.div
                        key={agent.type}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <GlassCard
                          variant={isActive ? 'glassmorphism' : 'default'}
                          className={cn(
                            'p-4 cursor-pointer transition-all duration-200',
                            isActive && 'ring-1 ring-blue-400/30'
                          )}
                          onClick={() => handleStartChatWithAgent(agent.type)}
                        >
                          <div className="flex items-start gap-3">
                            <div className={cn('w-10 h-10 rounded-xl border flex items-center justify-center shrink-0', agent.iconBg)}>
                              <Icon size={20} className={agent.badgeColor} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-foreground">{agent.name}</p>
                              <p className="text-xs text-muted-foreground/60 mt-0.5 leading-relaxed">{agent.description}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={cn('w-full mt-3 text-xs font-medium', agent.badgeColor, 'hover:bg-white/5')}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartChatWithAgent(agent.type);
                            }}
                          >
                            <MessageSquare size={12} className="mr-1.5" />
                            Start Chat
                          </Button>
                        </GlassCard>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </ScrollArea>
          ) : (
            <ScrollArea className="h-full">
              <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 space-y-4">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                    className={cn(
                      'flex w-full gap-2',
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {msg.role === 'assistant' && (
                      <div className={cn('w-7 h-7 rounded-full bg-gradient-to-br flex items-center justify-center shrink-0 mt-1', activeAgent.gradient)}>
                        <ActiveIcon size={13} className="text-white" />
                      </div>
                    )}
                    <div
                      className={cn(
                        'max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 py-2.5 overflow-hidden',
                        msg.role === 'user'
                          ? 'gradient-blue text-white rounded-br-md'
                          : 'bg-accent/50 text-foreground rounded-bl-md border border-border'
                      )}
                    >
                      {msg.role === 'assistant' ? (
                        <div className="min-w-0 w-full overflow-hidden">
                          <AIMessage content={msg.content} />
                        </div>
                      ) : (
                        <p className="text-sm leading-relaxed break-words">{msg.content}</p>
                      )}
                    </div>
                  </motion.div>
                ))}

                {isLoading && (
                  <div className="flex justify-start items-end gap-2">
                    <div className={cn('w-7 h-7 rounded-full bg-gradient-to-br flex items-center justify-center shrink-0', activeAgent.gradient)}>
                      <ActiveIcon size={13} className="text-white" />
                    </div>
                    <div className="bg-accent/50 rounded-2xl rounded-bl-md px-4 py-3 border border-border">
                      <motion.span
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="text-sm text-muted-foreground"
                      >
                        {t('ai.thinking')}
                      </motion.span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Chat input */}
        <div className="p-3 border-t border-border bg-background/50 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto flex items-center gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${activeAgent.name}...`}
              className="bg-accent/50 border-border text-foreground placeholder:text-muted-foreground/40"
              disabled={isLoading}
            />
            <Button
              size="icon"
              className={cn('shrink-0 border-0 text-white bg-gradient-to-br', activeAgent.gradient)}
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
