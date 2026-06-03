import type { Metadata } from 'next';
import { Suspense } from 'react';
import BookmarksClient from './BookmarksClient';

export const metadata: Metadata = {
  title: 'Bookmarks — Saved Content',
  description: 'View and manage your bookmarked blogs and posts on SRE Track.',
};

export default function BookmarksPage() {
  return (
    <main>
      <h1 className="sr-only">Bookmarks</h1>
      <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" /></div>}>
        <BookmarksClient />
      </Suspense>
    </main>
  );
}
