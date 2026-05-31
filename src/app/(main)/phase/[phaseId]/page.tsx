import type { Metadata } from 'next';
import { Suspense } from 'react';
import PhaseClient from './PhaseClient';

export const metadata: Metadata = {
  title: 'Phase — SRE Track',
  description: 'View and manage your active phases on SRE Track.',
  alternates: { canonical: 'https://sretrack.vercel.app/phase' },
};

export default function PhaseDetailPage({ params }: { params: Promise<{ phaseId: string }> }) {
  return (
    <main>
      <h1 className="sr-only">Phase</h1>
      <p className="sr-only">View and manage your active phases on SRE Track.</p>
      <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" /></div>}>
        <PhaseClient params={params} />
      </Suspense>
    </main>
  );
}
