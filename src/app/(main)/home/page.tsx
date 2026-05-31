import type { Metadata } from 'next';
import { Suspense } from 'react';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: 'Home — Dashboard',
  description: 'Your SRE Track dashboard with XP, streaks, achievements, and daily quests.',
  alternates: { canonical: 'https://sretrack.vercel.app/home' },
  openGraph: { title: 'SRE Track Dashboard', description: 'Your SRE Track dashboard with XP, streaks, achievements, and daily quests.', url: 'https://sretrack.vercel.app/home' },
};

export default function HomePage() {
  return (
    <main>
      <h1 className="sr-only">SRE Track Dashboard</h1>
      <p className="sr-only">Your personal dashboard showing XP, streaks, achievements, and daily quests for self-growth.</p>
      <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" /></div>}>
        <HomeClient />
      </Suspense>
    </main>
  );
}
