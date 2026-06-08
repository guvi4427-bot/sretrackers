import type { Metadata } from 'next';
import { Suspense } from 'react';
import LearnClient from './LearnClient';
import { CANONICAL_URL } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Learning Tracker — Study Topics, Log Progress & AI Tutoring',
  description: 'Create study topics, log learning entries, track progress with charts, and get AI tutoring on SRE Track.',
  alternates: { canonical: `${CANONICAL_URL}/learn` },
  openGraph: { title: 'SRE Track Learning Tracker', description: 'Create study topics, log learning entries, track progress with charts, and get AI tutoring on SRE Track.', url: `${CANONICAL_URL}/learn` },
};

export default function LearnPage() {
  return (
    <main>
      <h1 className="sr-only">Learning Tracker</h1>
      <p className="sr-only">Create study topics, log learning entries, track progress with charts, and get AI tutoring on SRE Track.</p>
      <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" /></div>}>
        <LearnClient />
      </Suspense>
    </main>
  );
}
