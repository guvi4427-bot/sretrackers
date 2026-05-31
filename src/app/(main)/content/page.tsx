import type { Metadata } from 'next';
import { Suspense } from 'react';
import ContentClient from './ContentClient';

export const metadata: Metadata = {
  title: 'Content Tracker — Manage Your Creator Pipeline',
  description: 'Track your content from idea to published. Manage series, pipeline stages, and get AI script reviews on SRE Track.',
  alternates: { canonical: 'https://sretrack.vercel.app/content' },
  openGraph: { title: 'SRE Track Content Tracker', description: 'Track your content from idea to published. Manage series, pipeline stages, and get AI script reviews on SRE Track.', url: 'https://sretrack.vercel.app/content' },
};

export default function ContentPage() {
  return (
    <main>
      <h1 className="sr-only">Content Tracker</h1>
      <p className="sr-only">Track your content from idea to published. Manage series, pipeline stages, and get AI script reviews on SRE Track.</p>
      <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" /></div>}>
        <ContentClient />
      </Suspense>
    </main>
  );
}
