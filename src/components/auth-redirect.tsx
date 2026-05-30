'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

/**
 * Client component that redirects authenticated users to /home
 * and guest users to /feed. Crawlers (no JS execution) will
 * never trigger these redirects, ensuring the landing page
 * HTML is always crawlable and indexable.
 */
export function AuthRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.replace('/home');
      return;
    }
    if (status === 'unauthenticated') {
      const isGuest = document.cookie
        .split('; ')
        .some((c) => c.startsWith('sre_guest=true'));
      if (isGuest) {
        router.replace('/feed');
      }
    }
  }, [session, status, router]);

  return null;
}
