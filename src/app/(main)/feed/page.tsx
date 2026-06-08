import type { Metadata } from 'next';
import { Suspense } from 'react';
import FeedClient from './FeedClient';
import { CANONICAL_URL } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Feed — Community Progress Updates',
  description: 'See what the SRE Track community is achieving. Share progress, celebrate wins, and stay motivated together.',
  alternates: { canonical: `${CANONICAL_URL}/feed` },
  openGraph: { title: 'SRE Track Social Feed', description: 'See what the SRE Track community is achieving. Share progress, celebrate wins, and stay motivated together.', url: `${CANONICAL_URL}/feed` },
};

export default function FeedPage() {
  return (
    <main>
      <h1 className="sr-only">Community Feed</h1>
      <p className="sr-only">See what the SRE Track community is achieving. Share progress, celebrate wins, and stay motivated together.</p>
      <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" /></div>}>
        <FeedClient />
      </Suspense>
    </main>
  );
}
