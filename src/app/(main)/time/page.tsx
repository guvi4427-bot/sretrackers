import type { Metadata } from 'next';
import { Suspense } from 'react';
import TimeClient from './TimeClient';

export const metadata: Metadata = {
  title: 'Time Management — Focus Timer, Task Planning & AI Day Planner',
  description: 'Classify tasks smartly, run focus timers, get productivity insights, and plan your day with AI on SRE Track.',
  alternates: { canonical: 'https://sretrack.vercel.app/time' },
  openGraph: { title: 'SRE Track Time Management', description: 'Classify tasks smartly, run focus timers, get productivity insights, and plan your day with AI on SRE Track.', url: 'https://sretrack.vercel.app/time' },
};

export default function TimePage() {
  return (
    <main>
      <h1 className="sr-only">Time Management</h1>
      <p className="sr-only">Classify tasks smartly, run focus timers, get productivity insights, and plan your day with AI on SRE Track.</p>
      <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" /></div>}>
        <TimeClient />
      </Suspense>
    </main>
  );
}
