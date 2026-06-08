import type { Metadata } from 'next';
import { Suspense } from 'react';
import AIHubClient from './AIHubClient';
import { CANONICAL_URL } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'AI Hub — 5 Specialized AI Assistants for Self-Growth',
  description: 'Access 5 AI assistants: Learning AI, Fitness AI, Content AI, Time AI, and Navigator AI — all built for your personal growth journey.',
  alternates: { canonical: `${CANONICAL_URL}/ai-hub` },
  openGraph: { title: 'SRE Track AI Hub', description: 'Access 5 AI assistants: Learning AI, Fitness AI, Content AI, Time AI, and Navigator AI — all built for your personal growth journey.', url: `${CANONICAL_URL}/ai-hub` },
};

export default function AIHubPage() {
  return (
    <main>
      <h1 className="sr-only">AI Hub</h1>
      <p className="sr-only">Access 5 specialized AI assistants for learning, fitness, content, productivity, and navigation on SRE Track.</p>
      <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" /></div>}>
        <AIHubClient />
      </Suspense>
    </main>
  );
}
