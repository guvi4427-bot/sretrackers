import type { Metadata } from 'next';
import { Suspense } from 'react';
import EntryClient from './EntryClient';

export const metadata: Metadata = {
  title: 'Learning Entry — SRE Track',
  description: 'View a learning entry detail on SRE Track.',
  alternates: { canonical: 'https://sretrack.vercel.app/learn' },
};

export default function EntryDetailPage() {
  return (
    <main>
      <h1 className="sr-only">Learning Entry</h1>
      <p className="sr-only">View a learning entry detail on SRE Track.</p>
      <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" /></div>}>
        <EntryClient />
      </Suspense>
    </main>
  );
}
