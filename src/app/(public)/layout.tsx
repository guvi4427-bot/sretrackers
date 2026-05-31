'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { AppShell } from '@/components/app-shell';
import { GuestShell } from '@/components/guest-shell';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status: sessionStatus } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Clear guest flags if authenticated
  useEffect(() => {
    if (sessionStatus === 'authenticated') {
      localStorage.removeItem('sre_guest');
      document.cookie = 'sre_guest=; path=/; max-age=0';
    }
  }, [sessionStatus]);

  // During SSR and initial hydration, render children immediately so crawlers
  // receive full page HTML. The shell (AppShell/GuestShell) wraps after mount.
  if (!mounted || sessionStatus === 'loading') {
    return <>{children}</>;
  }

  // Authenticated users get AppShell
  if (sessionStatus === 'authenticated') {
    return <AppShell>{children}</AppShell>;
  }

  // Unauthenticated: check guest mode
  const isGuest = localStorage.getItem('sre_guest') === 'true';
  if (isGuest) {
    return <GuestShell>{children}</GuestShell>;
  }

  // Not authenticated and not guest — render children directly.
  // Public pages (landing, about, contact, terms, etc.) have their own
  // full-page layouts and don't need AppShell.  Using AppShell here would
  // cause an immediate client-side redirect to /login before the landing
  // page ever renders.
  return <>{children}</>;
}
