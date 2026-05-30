import type { Metadata } from 'next';
import { Suspense } from 'react';
import SettingsClient from './SettingsClient';

export const metadata: Metadata = {
  title: 'Settings — Account Preferences',
  description: 'Manage your account settings, notifications, and preferences on SRE Track.',
  alternates: { canonical: 'https://sretrack.vercel.app/settings' },
};

export default function SettingsPage() {
  return (
    <main>
      <h1 className="sr-only">Settings</h1>
      <p className="sr-only">Manage your account settings, notifications, and preferences on SRE Track.</p>
      <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" /></div>}>
        <SettingsClient />
      </Suspense>
    </main>
  );
}
