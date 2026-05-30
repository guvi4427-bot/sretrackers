'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Home, BookOpen, Dumbbell, PenTool, Clock, Rss, Trophy, Award,
  BarChart3, MessageCircle, User, Settings, Menu, Search, Bell,
  Shield, LogOut, Zap, Compass, X, Send, Bot, Sparkles,
  Sun, Moon, MessageSquare, Bookmark, Users, UserCheck,
  Plus, Trash2, ArrowLeft, Loader2
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { AIMessage } from '@/components/ai-message';
import { XPBar } from '@/components/xp-bar';
import { StreakBadge } from '@/components/streak-badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { ErrorBoundary } from '@/components/error-boundary';
import { Logo, LogoSpinner } from '@/components/logo';
import { useUserStore } from '@/stores/user-store';
import { t } from '@/lib/i18n';
import { SITE_NAME } from '@/lib/site-config';
import { useTheme } from 'next-themes';

const BOTTOM_TABS = [
  { nameKey: 'nav.home', href: '/home', icon: Home },
  { nameKey: 'nav.feed', href: '/feed', icon: Rss },
  { nameKey: 'nav.discover', href: '/discover', icon: Compass },
  { nameKey: 'nav.messages', href: '/messages', icon: MessageCircle },
  { nameKey: 'nav.more', href: '#more', icon: Menu },
];

const MORE_ITEMS = [
  { nameKey: 'nav.aiHub', href: '/ai-hub', icon: Bot },
  { nameKey: 'nav.learning', href: '/learn', icon: BookOpen },
  { nameKey: 'nav.fitness', href: '/fitness', icon: Dumbbell },
  { nameKey: 'nav.content', href: '/content', icon: PenTool },
  { nameKey: 'nav.time', href: '/time', icon: Clock },
  { nameKey: 'nav.requests', href: '/follow-requests', icon: UserCheck },
  { nameKey: 'nav.leaderboard', href: '/leaderboard', icon: Trophy },
  { nameKey: 'nav.achievements', href: '/achievements', icon: Award },
  { nameKey: 'nav.analytics', href: '/analytics', icon: BarChart3 },
  { nameKey: 'nav.notifications', href: '/notifications', icon: Bell },
  { nameKey: 'nav.friends', href: '/friends', icon: Users },
  { nameKey: 'nav.profile', href: '/profile', icon: User },
  { nameKey: 'nav.settings', href: '/settings', icon: Settings },
  { nameKey: 'feedback.title', href: '/feedback', icon: MessageSquare },
  { nameKey: 'nav.bookmarks', href: '/feed?tab=bookmarks', icon: Bookmark },
];

function AppShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const { profile, fetchProfile, loading } = useUserStore();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatConversationId, setChatConversationId] = useState<string | null>(null);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [chatConversations, setChatConversations] = useState<any[]>([]);
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [pendingRequestCount, setPendingRequestCount] = useState(0);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const prevXpRef = useRef<number>(0);
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Reusable function to refresh notification count (with cache-busting)
  const refreshNotificationCount = useCallback(() => {
    fetch('/api/notifications?unread=true&limit=1&_t=' + Date.now(), { cache: 'no-store' }).then(r => r.ok ? r.json() : { total: 0 }).then(d => {
      setUnreadNotificationCount(typeof d.total === 'number' ? d.total : 0);
    }).catch(() => {});
  }, []);

  // Burst-poll notification count: rapid checks right after an XP event
  // to catch achievement notifications that arrive asynchronously
  const burstPollNotifications = useCallback(() => {
    const delays = [300, 800, 1500, 2500];
    delays.forEach(ms => {
      setTimeout(() => { refreshNotificationCount(); }, ms);
    });
  }, [refreshNotificationCount]);

  useEffect(() => {
    if (sessionStatus === 'authenticated') {
      fetchProfile();
      // Fetch pending follow request count
      fetch('/api/follow?type=requests').then(r => r.ok ? r.json() : []).then(d => {
        setPendingRequestCount(Array.isArray(d) ? d.length : 0);
      }).catch(() => {});
      // Fetch unread notification count immediately
      refreshNotificationCount();
      // Periodic refresh every 5 seconds (fast enough for near-real-time feel)
      refreshIntervalRef.current = setInterval(() => {
        fetchProfile();
        refreshNotificationCount();
      }, 5000);
      return () => { if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current); };
    } else if (sessionStatus === 'unauthenticated') {
      router.push('/login');
    }
  }, [sessionStatus, fetchProfile, router, refreshNotificationCount]);

  // Listen for xp-updated and notification-updated events to immediately refresh notification count
  useEffect(() => {
    function handleNotificationRefresh() {
      refreshNotificationCount();
    }
    function handleXpUpdated() {
      // Immediately refresh profile + notification count, then burst-poll
      // to catch achievement notifications that arrive asynchronously.
      // No redundant check-eligible call — the server already runs it
      // in the background when awardXP() fires.
      fetchProfile();
      refreshNotificationCount();
      burstPollNotifications();
    }
    window.addEventListener('xp-updated', handleXpUpdated);
    window.addEventListener('notification-updated', handleNotificationRefresh);
    return () => {
      window.removeEventListener('xp-updated', handleXpUpdated);
      window.removeEventListener('notification-updated', handleNotificationRefresh);
    };
  }, [refreshNotificationCount, burstPollNotifications, fetchProfile]);

  // Refresh notification count when tab becomes visible (catches up after tab switch)
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        refreshNotificationCount();
        fetchProfile();
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => { document.removeEventListener('visibilitychange', handleVisibilityChange); };
  }, [refreshNotificationCount, fetchProfile]);

  useEffect(() => {
    if (profile && prevXpRef.current > 0 && profile.xp > prevXpRef.current) {
      const gained = profile.xp - prevXpRef.current;
      toast.success(`+${gained} ${t('xp.earned')}`, { description: t('xp.keepUp') });
    }
    if (profile) prevXpRef.current = profile.xp;
  }, [profile?.xp]);

  useEffect(() => {
    if (profile && !profile.onboardingComplete && !pathname.startsWith('/onboarding')) {
      router.push('/onboarding');
    }
  }, [profile?.onboardingComplete, pathname, router]);

  const isAdmin = profile?.isAdmin || profile?.isSuperAdmin;

  const isActive = (href: string) => {
    if (href === '/home' || href === '/') return pathname === '/' || pathname === '/home';
    return pathname.startsWith(href);
  };

  const initials = (name?: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const loadChatConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/ai/chat-history');
      if (res.ok) {
        const data = await res.json();
        setChatConversations(data.conversations || []);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (showChatHistory) loadChatConversations();
  }, [showChatHistory, loadChatConversations]);

  const startNewConversation = () => {
    setChatMessages([]);
    setChatConversationId(null);
    setShowChatHistory(false);
  };

  const loadConversation = async (convId: string) => {
    try {
      const res = await fetch('/api/ai/chat-history');
      if (res.ok) {
        const data = await res.json();
        const conv = data.conversations?.find((c: any) => c.id === convId);
        if (conv) {
          setChatConversationId(convId);
          setChatMessages([]);
          setShowChatHistory(false);
        }
      }
    } catch { /* ignore */ }
  };

  const deleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/ai/chat-history?id=${convId}`, { method: 'DELETE' });
      setChatConversations(prev => prev.filter(c => c.id !== convId));
      if (convId === chatConversationId) {
        setChatMessages([]);
        setChatConversationId(null);
      }
    } catch { /* ignore */ }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = { role: 'user', content: chatInput.trim() };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);
    setShowChatHistory(false);
    try {
      const res = await fetch('/api/ai/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.content, botType: 'navigation', conversationId: chatConversationId, history: chatMessages.slice(-30) }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.conversationId) setChatConversationId(data.conversationId);
        setChatMessages(prev => [...prev, { role: 'assistant', content: data.response || data.reply || 'I\'m here to help you navigate SRE!' }]);
      }
    } catch {
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'I\'m having trouble connecting. Please try again.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

  // Loading state
  if (sessionStatus === 'loading' || (loading && !profile)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LogoSpinner size={56} label={`Loading ${SITE_NAME}...`} />
      </div>
    );
  }

  // Not authenticated
  if (sessionStatus === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LogoSpinner size={56} label="Redirecting..." />
      </div>
    );
  }

  const safeProfile = profile || {
    name: 'User',
    username: 'user',
    level: 1,
    xp: 0,
    currentStreak: 0,
    isAdmin: false,
    isSuperAdmin: false,
    onboardingComplete: false,
    activePhases: [],
    phaseActivityMap: {},
  };

  // Build More items list with admin button included for admins
  const visibleMoreItems = isAdmin
    ? [...MORE_ITEMS, { nameKey: 'nav.admin', href: '/admin', icon: Shield }]
    : MORE_ITEMS;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Header */}
      <header className="sticky top-0 z-30 h-14 flex items-center justify-between px-4 glass-glowing">
        <div className="flex items-center gap-2">
          <Logo size={28} showText />
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="text-muted-foreground hover:text-foreground transition-colors p-2">
            {mounted && (theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />)}
          </button>
          <button onClick={() => router.push('/notifications')} className="relative text-muted-foreground hover:text-foreground transition-colors p-2">
            <Bell size={18} />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold px-1">{unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}</span>
            )}
          </button>
          <Avatar className="h-8 w-8 border border-border cursor-pointer" onClick={() => router.push('/profile')}>
            <AvatarFallback className="bg-blue-600/30 text-blue-300 dark:text-blue-300 text-xs">{initials(safeProfile.name)}</AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 p-4 pb-28">
        <ErrorBoundary>
          <AnimatePresence mode="popLayout">
            <motion.div key={pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15, ease: 'easeOut' }}>
              {children}
            </motion.div>
          </AnimatePresence>
        </ErrorBoundary>
        {/* Footer Links */}
        <div className="mt-4 pt-4 border-t border-border flex items-center justify-center flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground/50">
          <a href="/blog" className="hover:text-muted-foreground transition-colors">Blog</a>
          <span>·</span>
          <a href="/about" className="hover:text-muted-foreground transition-colors">About</a>
          <span>·</span>
          <a href="/contact" className="hover:text-muted-foreground transition-colors">Contact</a>
          <span>·</span>
          <a href="/privacy" className="hover:text-muted-foreground transition-colors">Privacy Policy</a>
          <span>·</span>
          <a href="/terms" className="hover:text-muted-foreground transition-colors">Terms & Conditions</a>
          <span>·</span>
          <a href="/community-guidelines" className="hover:text-muted-foreground transition-colors">Community Guidelines</a>
        </div>
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-4 left-4 right-4 z-40 max-w-lg mx-auto">
        <div className="glass-glowing backdrop-blur-2xl bg-background/80 dark:bg-[#0B1120]/70 border border-border rounded-[1.75rem] shadow-lg shadow-blue-900/10 dark:shadow-blue-900/20 px-2">
          <div className="flex items-center justify-around h-16">
            {BOTTOM_TABS.map((tab) => {
              const Icon = tab.icon;
              const active = tab.href !== '#more' && isActive(tab.href);

              if (tab.href === '#more') {
                return (
                  <Sheet key={tab.nameKey} open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                    <SheetTrigger asChild>
                      <button className="flex flex-col items-center justify-center gap-0.5 py-1 px-3 text-muted-foreground transition-colors hover:text-foreground rounded-xl">
                        <Icon size={22} /><span className="text-[10px] font-medium">{t(tab.nameKey)}</span>
                      </button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="bg-background border-border rounded-t-3xl max-h-[80vh]">
                      <SheetHeader><SheetTitle className="text-foreground text-left">{t('nav.more')}</SheetTitle></SheetHeader>
                      <div className="grid grid-cols-3 gap-3 py-3">
                        {visibleMoreItems.map((item) => {
                          const ItemIcon = item.icon;
                          const itemActive = isActive(item.href);
                          const isAdminItem = item.nameKey === 'nav.admin';
                          const isRequestsItem = item.nameKey === 'nav.requests';
                          const isNotifItem = item.nameKey === 'nav.notifications';
                          const badgeCount = isRequestsItem ? pendingRequestCount : isNotifItem ? unreadNotificationCount : 0;
                          return (
                            <button key={item.href} onClick={() => { router.push(item.href); setMobileMenuOpen(false); }}
                              className={`relative flex flex-col items-center gap-2 rounded-xl p-4 transition-all overflow-hidden ${itemActive ? (isAdminItem ? 'bg-purple-600/20 text-purple-400' : 'bg-blue-600/20 text-blue-400') : (isAdminItem ? 'bg-purple-600/10 text-purple-400/70 hover:bg-purple-600/20' : 'bg-accent text-muted-foreground hover:bg-accent/80')}`}>
                              <div className="relative">
                                <ItemIcon size={22} />
                                {badgeCount > 0 && (
                                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold px-1">{badgeCount > 9 ? '9+' : badgeCount}</span>
                                )}
                              </div>
                              <span className="text-xs font-medium truncate w-full text-center">{t(item.nameKey)}</span>
                            </button>
                          );
                        })}
                      </div>
                      <Separator className="bg-border" />
                      <button onClick={() => { setTheme(theme === 'dark' ? 'light' : 'dark'); }} className="flex items-center gap-3 w-full p-4 text-muted-foreground hover:bg-accent rounded-lg transition-colors">
                        {mounted && (theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />)}
                        <span className="text-sm font-medium">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                      </button>
                      <button onClick={() => { signOut({ redirect: false }).then(() => router.push('/login')); setMobileMenuOpen(false); }}
                        className="flex items-center gap-3 w-full p-4 text-red-400 hover:bg-red-600/10 rounded-lg transition-colors">
                        <LogOut size={20} /><span className="text-sm font-medium">{t('nav.signOut')}</span>
                      </button>
                    </SheetContent>
                  </Sheet>
                );
              }

              return (
                <button key={tab.nameKey} onClick={() => router.push(tab.href)}
                  className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 transition-colors rounded-xl ${active ? 'text-blue-400 bg-blue-600/10' : 'text-muted-foreground hover:text-foreground'}`}>
                  <Icon size={22} /><span className="text-[10px] font-medium">{t(tab.nameKey)}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* AI Chat Bubble - Navigation AI positioned above bottom nav */}
      {!chatOpen ? (
        <motion.button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-24 right-4 z-[55] w-14 h-14 rounded-full gradient-gold flex items-center justify-center shadow-lg glow-gold glass-glowing"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.5 }}
        >
          <Compass size={24} className="text-gray-900" />
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="fixed bottom-24 right-4 z-[55] w-[calc(100vw-2rem)] sm:w-[380px] h-[480px] backdrop-blur-2xl bg-background/90 dark:bg-[#0B1120]/80 border border-border flex flex-col overflow-hidden rounded-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              {showChatHistory ? (
                <button onClick={() => setShowChatHistory(false)} className="text-muted-foreground hover:text-foreground transition-colors p-1"><ArrowLeft size={16} /></button>
              ) : (
                <div className="w-8 h-8 rounded-full gradient-gold flex items-center justify-center"><Compass size={16} className="text-gray-900" /></div>
              )}
              <div>
                <p className="text-sm font-semibold text-foreground">{showChatHistory ? 'Chat History' : 'SRE Navigator'}</p>
                <p className="text-[10px] text-muted-foreground">{showChatHistory ? `${chatConversations.length} conversations` : 'Your platform guide'}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {!showChatHistory && (
                <>
                  <button onClick={startNewConversation} className="text-muted-foreground hover:text-foreground transition-colors p-1" title="New conversation"><Plus size={16} /></button>
                  <button onClick={() => setShowChatHistory(true)} className="text-muted-foreground hover:text-foreground transition-colors p-1" title="Chat history"><MessageSquare size={16} /></button>
                </>
              )}
              <button onClick={() => { setChatOpen(false); setShowChatHistory(false); }} className="text-muted-foreground hover:text-foreground transition-colors p-1"><X size={18} /></button>
            </div>
          </div>

          {showChatHistory ? (
            /* ── Chat History Panel ── */
            <ScrollArea className="flex-1">
              <div className="p-3 space-y-1">
                {/* Search */}
                <div className="relative mb-2">
                  <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                  <input
                    type="text"
                    value={chatSearchQuery}
                    onChange={(e) => setChatSearchQuery(e.target.value)}
                    placeholder="Search conversations..."
                    className="w-full h-8 rounded-lg bg-accent border border-border pl-7 pr-3 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-blue-500/40"
                  />
                </div>
                {/* Conversation List */}
                {chatConversations.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageSquare className="w-6 h-6 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">No conversations yet</p>
                  </div>
                ) : (
                  chatConversations
                    .filter(c => !chatSearchQuery || c.title?.toLowerCase().includes(chatSearchQuery.toLowerCase()))
                    .map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => loadConversation(conv.id)}
                        className={`w-full text-left p-2.5 rounded-lg hover:bg-accent transition-colors group ${chatConversationId === conv.id ? 'bg-accent' : ''}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-foreground truncate">{conv.title}</p>
                            <p className="text-[10px] text-muted-foreground/60 truncate mt-0.5">{conv.preview}</p>
                            <p className="text-[10px] text-muted-foreground/40 mt-1">
                              {conv.messageCount} messages
                            </p>
                          </div>
                          <button
                            onClick={(e) => deleteConversation(conv.id, e)}
                            className="text-muted-foreground/30 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1 shrink-0"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </button>
                    ))
                )}
              </div>
            </ScrollArea>
          ) : (
            /* ── Chat Panel ── */
            <>
              <ScrollArea className="flex-1 p-3">
                {chatMessages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <Compass className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm font-medium">SRE Navigator</p>
                    <p className="text-xs mt-1 text-muted-foreground/50">Ask me how to navigate the platform!</p>
                    <div className="mt-3 space-y-1">
                      {["Where do I log workouts?", "How do I track learning?", "Where are my achievements?", "How do I create a content series?"].map(s => (
                        <button key={s} onClick={() => setChatInput(s)} className="block w-full text-left text-xs text-muted-foreground/60 hover:text-muted-foreground bg-accent/50 hover:bg-accent rounded-lg px-3 py-1.5 transition-colors">{s}</button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {chatMessages.map((msg, i) => (
                      <div key={i} className={`flex items-start w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'assistant' && (
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0 mr-1.5 mt-0.5 shadow-md shadow-violet-500/20">
                            <Compass size={11} className="text-white" />
                          </div>
                        )}
                        <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm overflow-hidden ${msg.role === 'user' ? 'gradient-blue text-white rounded-br-md' : 'bg-gradient-to-br from-violet-600/20 to-indigo-600/10 dark:from-violet-500/25 dark:to-indigo-500/15 text-foreground rounded-bl-md border border-violet-400/20 dark:border-violet-400/30'}`}>
                          {msg.role === 'assistant' ? <div className="min-w-0 w-full overflow-hidden"><AIMessage content={msg.content} /></div> : <span className="break-words">{msg.content}</span>}
                        </div>
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="flex justify-start items-end">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0 mr-1.5 shadow-md shadow-violet-500/20">
                          <Compass size={11} className="text-white" />
                        </div>
                        <div className="bg-gradient-to-br from-violet-600/20 to-indigo-600/10 dark:from-violet-500/25 dark:to-indigo-500/15 rounded-2xl px-4 py-2 text-sm text-muted-foreground border border-violet-400/20 dark:border-violet-400/30">
                          <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }}>{t('ai.thinking')}</motion.span>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                )}
              </ScrollArea>
              <div className="p-3 border-t border-border">
                <div className="flex gap-2">
                  <Input value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendChatMessage()}
                    placeholder="Ask how to navigate SRE..." className="bg-accent border-border text-foreground" />
                  <Button onClick={sendChatMessage} size="icon" className="gradient-gold border-0 shrink-0 text-gray-900" disabled={chatLoading}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <AppShellInner>{children}</AppShellInner>
    </ErrorBoundary>
  );
}
