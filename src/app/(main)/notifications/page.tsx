import type { Metadata } from 'next';
import { Suspense } from 'react';
import NotificationsClient from './NotificationsClient';
import { CANONICAL_URL } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Notifications',
  description: 'View your latest notifications on SRE Track.',
  alternates: { canonical: `${CANONICAL_URL}/notifications` },
};

export default function NotificationsPage() {
  return (
    <main>
      <h1 className="sr-only">Notifications</h1>
      <p className="sr-only">View your latest notifications on SRE Track.</p>
      <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" /></div>}>
        <NotificationsClient />
      </Suspense>
    </main>
  );
}
