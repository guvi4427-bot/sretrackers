'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Shield, Users, AlertTriangle, MessageSquare, BadgeCheck, Monitor, ChevronLeft, FileText, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ErrorBoundary } from '@/components/error-boundary';

const ADMIN_NAV = [
  { label: 'Dashboard', href: '/admin', icon: Shield },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Reports', href: '/admin/reports', icon: AlertTriangle },
  { label: 'Feedback', href: '/admin/feedback', icon: MessageSquare },
  { label: 'Admins', href: '/admin/admins', icon: BadgeCheck },
  { label: 'Audit Log', href: '/admin/audit-log', icon: FileText },
  { label: 'DM Monitor', href: '/admin/dm-monitor', icon: Monitor },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || !(session.user as any)?.isAdmin) {
      router.push('/home');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen"><Shield className="w-8 h-8 text-purple-400 animate-pulse" /></div>;
  }

  if (!session || !(session.user as any)?.isAdmin) return null;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Admin Sidebar */}
      <aside className="hidden md:flex flex-col w-56 border-r border-border p-3 gap-1">
        <div className="flex items-center gap-2 px-3 py-4 mb-2">
          <Shield size={20} className="text-purple-400" />
          <span className="font-bold text-foreground">Admin Panel</span>
        </div>
        {ADMIN_NAV.map(item => {
          const Icon = item.icon;
          const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
          return (
            <button key={item.href} onClick={() => router.push(item.href)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-purple-600/20 text-purple-400' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}`}>
              <Icon size={16} />{item.label}
            </button>
          );
        })}
        <div className="mt-auto">
          <Button variant="ghost" size="sm" onClick={() => router.push('/home')} className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground">
            <ChevronLeft size={16} />Back to Tracker
          </Button>
        </div>
      </aside>

      {/* Mobile: Top bar with Back to Tracker */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between h-12 px-3">
          <Button variant="ghost" size="sm" onClick={() => router.push('/home')} className="text-muted-foreground hover:text-foreground gap-1 text-xs">
            <ArrowLeft size={16} />Tracker
          </Button>
          <div className="flex items-center gap-1.5">
            <Shield size={16} className="text-purple-400" />
            <span className="text-sm font-bold text-foreground">Admin</span>
          </div>
          <div className="w-16" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Mobile Admin Bottom Nav */}
      <div className="md:hidden fixed bottom-3 left-3 right-3 z-50 glass-card rounded-3xl border-b-0 max-w-lg mx-auto">
        <div className="flex items-center justify-around h-14">
          {ADMIN_NAV.slice(0, 5).map(item => {
            const Icon = item.icon;
            const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
            return (
              <button key={item.href} onClick={() => router.push(item.href)}
                className={`flex flex-col items-center gap-0.5 py-1 px-2 ${active ? 'text-purple-400' : 'text-muted-foreground'}`}>
                <Icon size={18} /><span className="text-[9px]">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 p-6 pt-16 md:pt-6 pb-24 md:pb-6 overflow-y-auto">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>
    </div>
  );
}
