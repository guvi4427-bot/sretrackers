import type { Metadata } from 'next';
import { Suspense } from 'react';
import MyBlogsClient from './MyBlogsClient';

export const metadata: Metadata = {
  title: 'My Blogs — Manage Your Articles',
  description: 'View, edit, and manage your blog articles on SRE Track.',
};

export default function MyBlogsPage() {
  return (
    <main>
      <h1 className="sr-only">My Blogs</h1>
      <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" /></div>}>
        <MyBlogsClient />
      </Suspense>
    </main>
  );
}
