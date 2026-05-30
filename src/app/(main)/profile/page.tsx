import type { Metadata } from 'next';
import { Suspense } from 'react';
import ProfileClient from './ProfileClient';

export const metadata: Metadata = {
  title: 'Profile — Your SRE Track Journey',
  description: 'View and manage your SRE Track profile, stats, and achievements.',
  alternates: { canonical: 'https://sretrack.vercel.app/profile' },
};

export default function ProfilePage() {
  return (
    <main>
      <h1 className="sr-only">Profile</h1>
      <p className="sr-only">View and manage your SRE Track profile, stats, and achievements.</p>
      <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" /></div>}>
        <ProfileClient />
      </Suspense>
    </main>
  );
}
