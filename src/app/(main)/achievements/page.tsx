import type { Metadata } from 'next';
import { Suspense } from 'react';
import AchievementsClient from './AchievementsClient';
import { CANONICAL_URL } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Achievements — Unlocked Badges & Milestones',
  description: 'View your unlocked achievements, badges, and milestones on SRE Track.',
  alternates: { canonical: `${CANONICAL_URL}/achievements` },
};

export default function AchievementsPage() {
  return (
    <main>
      <h1 className="sr-only">Achievements</h1>
      <p className="sr-only">View your unlocked achievements, badges, and milestones on SRE Track.</p>
      <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" /></div>}>
        <AchievementsClient />
      </Suspense>
    </main>
  );
}
