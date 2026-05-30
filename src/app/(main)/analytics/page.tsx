import type { Metadata } from 'next';
import { Suspense } from 'react';
import AnalyticsClient from './AnalyticsClient';

export const metadata: Metadata = {
  title: 'Analytics — Growth Insights & Progress Charts',
  description: 'Track your growth with detailed analytics, progress charts, and insights on SRE Track.',
  alternates: { canonical: 'https://sretrack.vercel.app/analytics' },
};

export default function AnalyticsPage() {
  return (
    <main>
      <h1 className="sr-only">Analytics</h1>
      <p className="sr-only">Track your growth with detailed analytics, progress charts, and insights on SRE Track.</p>
      <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" /></div>}>
        <AnalyticsClient />
      </Suspense>
    </main>
  );
}
