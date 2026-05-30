'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { AppShell } from '@/components/app-shell';
import { GuestShell } from '@/components/guest-shell';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status: sessionStatus } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // CRITICAL: If user is authenticated, ALWAYS clear guest flags and use AppShell.
  // This prevents the bug where logged-in users are treated as guests
  // because sre_guest persists in localStorage/cookie from a previous guest session.
  useEffect(() => {
    if (sessionStatus === 'authenticated') {
      localStorage.removeItem('sre_guest');
      document.cookie = 'sre_guest=; path=/; max-age=0';
    }
  }, [sessionStatus]);

  // Wait for both mount and session resolution before rendering
  if (!mounted || sessionStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400" />
      </div>
    );
  }

  // Authenticated users ALWAYS get AppShell — never GuestShell
  if (sessionStatus === 'authenticated') {
    return <AppShell>{children}</AppShell>;
  }

  // Unauthenticated: check if guest mode is active
  const isGuest = localStorage.getItem('sre_guest') === 'true';
  if (isGuest) {
    return <GuestShell>{children}</GuestShell>;
  }

  // Not authenticated and not guest — AppShell will redirect to login
  return <AppShell>{children}</AppShell>;
}
