import type { Metadata } from 'next';
import { Suspense } from 'react';
import DiscoverClient from './DiscoverClient';

export const metadata: Metadata = {
  title: 'Discover — Topics, Users, Posts & Groups',
  description: 'Discover self-growth topics, connect with users, explore posts, and join groups on SRE Track.',
  alternates: { canonical: 'https://sretrack.vercel.app/discover' },
  openGraph: { title: 'Discover on SRE Track', description: 'Discover self-growth topics, connect with users, explore posts, and join groups on SRE Track.', url: 'https://sretrack.vercel.app/discover' },
};

export default function DiscoverPage() {
  return (
    <main>
      <h1 className="sr-only">Discover</h1>
      <p className="sr-only">Discover self-growth topics, connect with users, explore posts, and join groups on SRE Track.</p>
      <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" /></div>}>
        <DiscoverClient />
      </Suspense>
    </main>
  );
}
