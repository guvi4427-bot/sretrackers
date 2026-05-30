import type { Metadata } from 'next';
import { Suspense } from 'react';
import UserProfileClient from './UserProfileClient';

export const metadata: Metadata = {
  title: 'User Profile — SRE Track',
  description: 'View user profiles, stats, and achievements on SRE Track.',
  alternates: { canonical: 'https://sretrack.vercel.app/profile' },
};

export default function PublicProfilePage() {
  return (
    <main>
      <h1 className="sr-only">User Profile</h1>
      <p className="sr-only">View user profiles, stats, and achievements on SRE Track.</p>
      <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" /></div>}>
        <UserProfileClient />
      </Suspense>
    </main>
  );
}
