'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { AppShell } from '@/components/app-shell';
import { GuestShell } from '@/components/guest-shell';

interface Props {
  children: React.ReactNode;
  isAuthenticated: boolean;
}

export default function PublicLayoutClient({ children, isAuthenticated }: Props) {
  const { status: sessionStatus } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (sessionStatus === 'authenticated') {
      localStorage.removeItem('sre_guest');
      document.cookie = 'sre_guest=; path=/; max-age=0';
    }
  }, [sessionStatus]);

  if (!mounted || sessionStatus === 'loading') {
    if (isAuthenticated) return <AppShell>{children}</AppShell>;
    return <>{children}</>;
  }

  if (sessionStatus === 'authenticated') return <AppShell>{children}</AppShell>;

  const isGuest = localStorage.getItem('sre_guest') === 'true';
  if (isGuest) return <GuestShell>{children}</GuestShell>;

  return <>{children}</>;
}
