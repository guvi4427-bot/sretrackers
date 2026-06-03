import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CANONICAL_URL, SITE_NAME } from '@/lib/site-config';
import LandingClient from './LandingClient';

export const metadata: Metadata = {
  title: `${SITE_NAME} — Start, Restart, Explore | Self-Growth Platform`,
  description: 'Join SRE Track free. Track habits, learn new skills, get fit, manage time, and grow with AI-powered tools and a supportive community.',
  alternates: { canonical: CANONICAL_URL },
  openGraph: {
    title: `${SITE_NAME} — Start, Restart, Explore`,
    description: 'Join SRE Track free. Track habits, learn new skills, get fit, manage time, and grow with AI-powered tools and a supportive community.',
    url: CANONICAL_URL,
  },
};

export default function LandingPage() {
  return (
    <main>
      <div className="sr-only">
        <h1>{SITE_NAME} — Start, Restart, Explore | Self-Growth Platform</h1>
        <p>SRE Track is a free self-growth platform to track learning, fitness, content creation, and time management — with AI assistants, gamification, and a social feed. Join thousands building consistent habits and achieving personal growth goals.</p>
        <section>
          <h2>Platform Features</h2>
          <ul>
            <li><strong>Learning Tracker</strong> — Create study topics, log entries, track progress with AI tutoring and visual insights.</li>
            <li><strong>Fitness Tracker</strong> — Log workouts and meals, AI macro estimation, weight progress charts, PPL split support.</li>
            <li><strong>Content Creator Tracker</strong> — Plan videos, track production pipeline stages, manage your content calendar.</li>
            <li><strong>Time Manager</strong> — Pomodoro timer, daily time blocks, focus sessions, productivity analytics.</li>
            <li><strong>Social Feed</strong> — Share progress updates, follow friends, cheer community milestones.</li>
            <li><strong>AI Assistants</strong> — 5 specialized AI tools for learning, fitness, content creation, time management, and habits.</li>
            <li><strong>Gamification</strong> — XP system, 100+ achievements, streaks, leaderboards, and level progression.</li>
          </ul>
        </section>
        <section>
          <h2>Who is SRE Track for?</h2>
          <p>SRE Track is for students, creators, and professionals who want to build consistent habits across learning, fitness, and content creation — all in one place, completely free.</p>
        </section>
        <nav aria-label="Quick links">
          <a href="/login">Sign In</a>
          <a href="/signup">Sign Up Free</a>
          <a href="/about">About SRE Track</a>
          <a href="/features/learning">Learning Tracker</a>
          <a href="/features/fitness">Fitness Tracker</a>
          <a href="/features/content">Content Tracker</a>
          <a href="/faq">FAQ</a>
          <a href="/blog">Blog</a>
        </nav>
      </div>
      <Suspense fallback={<div className="min-h-screen bg-[#0F172A]" />}>
        <LandingClient />
      </Suspense>
    </main>
  );
}
