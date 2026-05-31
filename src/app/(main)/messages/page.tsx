import type { Metadata } from 'next';
import { Suspense } from 'react';
import MessagesClient from './MessagesClient';

export const metadata: Metadata = {
  title: 'Messages — Direct & Group Chats',
  description: 'Chat with friends and groups on SRE Track.',
  alternates: { canonical: 'https://sretrack.vercel.app/messages' },
};

export default function MessagesPage() {
  return (
    <main>
      <h1 className="sr-only">Messages</h1>
      <p className="sr-only">Chat with friends and groups on SRE Track.</p>
      <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" /></div>}>
        <MessagesClient />
      </Suspense>
    </main>
  );
}
