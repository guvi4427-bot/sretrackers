import type { Metadata } from 'next';
import { Suspense } from 'react';
import LeaderboardClient from './LeaderboardClient';

export const metadata: Metadata = {
  title: 'Leaderboard — Top Achievers on SRE Track',
  description: 'See the top XP earners, streak holders, and achievement leaders in the SRE Track community.',
  alternates: { canonical: 'https://sretrack.vercel.app/leaderboard' },
  openGraph: { title: 'SRE Track Leaderboard', description: 'See the top XP earners, streak holders, and achievement leaders in the SRE Track community.', url: 'https://sretrack.vercel.app/leaderboard' },
};

export default function LeaderboardPage() {
  return (
    <main>
      <h1 className="sr-only">Leaderboard</h1>
      <p className="sr-only">See the top XP earners, streak holders, and achievement leaders in the SRE Track community.</p>
      <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" /></div>}>
        <LeaderboardClient />
      </Suspense>
    </main>
  );
}
