import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CANONICAL_URL } from '@/lib/site-config';
import FitnessClient from './FitnessClient';

export const metadata: Metadata = {
  title: 'Fitness Tracker — Log Workouts, Meals & Track Progress',
  description: 'Log workouts and meals, get AI macro and calorie estimates, and track your fitness progress with charts on SRE Track.',
  alternates: { canonical: `${CANONICAL_URL}/fitness` },
  openGraph: { title: 'SRE Track Fitness Tracker', description: 'Log workouts and meals, get AI macro and calorie estimates, and track your fitness progress with charts on SRE Track.', url: `${CANONICAL_URL}/fitness` },
};

export default function FitnessPage() {
  return (
    <main>
      <h1 className="sr-only">Fitness Tracker</h1>
      <p className="sr-only">Log workouts and meals, get AI macro and calorie estimates, and track your fitness progress with charts on SRE Track.</p>
      <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" /></div>}>
        <FitnessClient />
      </Suspense>
    </main>
  );
}
