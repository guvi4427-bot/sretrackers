import type { Metadata } from 'next';
import { Suspense } from 'react';
import FriendsClient from './FriendsClient';
import { CANONICAL_URL } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Friends — Your Growth Circle',
  description: 'Connect with friends and build your growth circle on SRE Track.',
  alternates: { canonical: `${CANONICAL_URL}/friends` },
};

export default function FriendsPage() {
  return (
    <main>
      <h1 className="sr-only">Friends</h1>
      <p className="sr-only">Connect with friends and build your growth circle on SRE Track.</p>
      <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" /></div>}>
        <FriendsClient />
      </Suspense>
    </main>
  );
}
