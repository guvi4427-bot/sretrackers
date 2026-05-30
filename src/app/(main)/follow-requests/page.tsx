import type { Metadata } from 'next';
import { Suspense } from 'react';
import FollowRequestsClient from './FollowRequestsClient';

export const metadata: Metadata = {
  title: 'Follow Requests',
  description: 'Manage your follow requests on SRE Track.',
  alternates: { canonical: 'https://sretrack.vercel.app/follow-requests' },
};

export default function FollowRequestsPage() {
  return (
    <main>
      <h1 className="sr-only">Follow Requests</h1>
      <p className="sr-only">Manage your follow requests on SRE Track.</p>
      <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" /></div>}>
        <FollowRequestsClient />
      </Suspense>
    </main>
  );
}
