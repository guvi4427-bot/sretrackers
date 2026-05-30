'use client';

import { cn } from '@/lib/utils';
import { GlassCard } from '@/components/glass-card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, X, Send, Loader2, Sparkles } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { t } from '@/lib/i18n';
import { AIMessage } from '@/components/ai-message';

type BotType = 'general' | 'learning' | 'fitness' | 'content' | 'time' | 'navigation';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatBubbleProps {
  botType?: BotType;
  /** Override position: bottom offset in px (default 24) */
  bottomOffset?: number;
  /** Override position: right offset in px (default 24) */
  rightOffset?: number;
}

export function AIChatBubble({
  botType = 'general',
  bottomOffset = 24,
  rightOffset = 24,
}: AIChatBubbleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          botType,
          history: messages.slice(-10).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.reply || data.response || data.message || 'Sorry, I could not process that.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
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

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="fixed z-50 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-shadow"
            style={{ bottom: bottomOffset, right: rightOffset }}
            onClick={() => setIsOpen(true)}
            aria-label={t('ai.assistant')}
          >
            <Bot size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={cn(
              'fixed z-50 flex flex-col',
              // Full screen on mobile
              'inset-0 sm:inset-auto',
              // Fixed size on desktop
              'sm:rounded-2xl sm:overflow-hidden'
            )}
            style={{
              ...(typeof window !== 'undefined' && window.innerWidth >= 640
                ? { bottom: bottomOffset + 64, right: rightOffset, width: 380, height: 520 }
                : {}),
            }}
          >
            <GlassCard
              variant="intense"
              className="flex flex-col h-full sm:rounded-2xl !bg-[#0A0F1E]/95 !border-white/15"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700">
                    <Bot size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t('ai.assistant')}</p>
                    <p className="text-[10px] text-white/30">{t('ai.poweredBy')}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white/40 hover:text-white/70"
                  onClick={() => setIsOpen(false)}
                >
                  <X size={16} />
                </Button>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 min-h-0">
                <div className="p-4 space-y-3">
                  {messages.length === 0 ? (
                    <div className="text-center text-white/30 py-8">
                      <Sparkles className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">{t('ai.askAnything')}</p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.15 }}
                        className={cn(
                          'flex',
                          msg.role === 'user' ? 'justify-end' : 'justify-start'
                        )}
                      >
                        <div
                          className={cn(
                            'max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                            msg.role === 'user'
                              ? 'bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-br-md'
                              : 'bg-white/10 text-white/80 rounded-bl-md'
                          )}
                        >
                          {msg.role === 'assistant' ? (
                            <AIMessage content={msg.content} />
                          ) : (
                            msg.content
                          )}
                        </div>
                      </motion.div>
                    ))
                  )}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white/10 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
                        <Loader2 size={14} className="animate-spin text-white/40" />
                        <span className="text-sm text-white/40">{t('ai.thinking')}</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="px-4 py-3 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t('ai.askAnything')}
                    className="flex-1 h-10 rounded-xl bg-white/5 border border-white/10 px-3.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20 transition-all"
                    disabled={isLoading}
                  />
                  <Button
                    size="icon"
                    className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 shrink-0 border-0"
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                  >
                    <Send size={16} />
                  </Button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
