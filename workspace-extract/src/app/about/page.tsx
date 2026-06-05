import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL, SITE_SHORT_NAME, SITE_TAGLINE } from '@/lib/site-config';

export const metadata: Metadata = {
  title: `About ${SITE_SHORT_NAME} — What Is Start, Restart, Explore?`,
  description: `${SITE_SHORT_NAME} is a self-growth ecosystem platform. Learn what ${SITE_SHORT_NAME} stands for, who it helps, and how the progression philosophy works. Start, Restart, and Explore your self-improvement journey.`,
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    title: `About ${SITE_SHORT_NAME} — What Is Start, Restart, Explore?`,
    description: `Learn what ${SITE_SHORT_NAME} stands for, who it helps, and how the progression philosophy works.`,
    url: `${SITE_URL}/about`,
  },
  robots: { index: true, follow: true },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">About {SITE_SHORT_NAME} — Start, Restart, Explore</h1>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">What is {SITE_SHORT_NAME}?</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            {SITE_SHORT_NAME} is a self-growth ecosystem platform built around the philosophy of progression, accountability, consistency, and community-driven improvement. It unifies learning progression, fitness tracking, content creation journeys, social discovery, AI-assisted learning, and live updates into a single, cohesive platform designed to help you become the best version of yourself through consistent, visible progress.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Unlike traditional habit trackers or to-do list apps, {SITE_SHORT_NAME} makes your growth journey public and community-driven. Every learning session you log, every workout you complete, and every piece of content you create becomes a visible milestone on your profile. This public accountability system is rooted in research showing that sharing progress significantly increases follow-through rates and long-term consistency.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The platform uses a gamification system with XP (experience points), levels, streaks, and achievements to make self-improvement engaging and rewarding. Whether you are starting a completely new skill, restarting an abandoned goal, or exploring a new domain entirely, {SITE_SHORT_NAME} provides the structure, community, and motivation to keep you moving forward.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">What does {SITE_SHORT_NAME} stand for?</h2>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-blue-600/10 border border-blue-500/20">
              <h3 className="font-semibold text-blue-400 mb-1">Start</h3>
              <p className="text-sm text-muted-foreground">
                Begin a new journey. Whether it is learning to code, starting a fitness routine, or launching a creative project — every great achievement begins with the decision to start. {SITE_SHORT_NAME} gives you the tools and community support to take that first step and track your progress from day one.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-amber-600/10 border border-amber-500/20">
              <h3 className="font-semibold text-amber-400 mb-1">Restart</h3>
              <p className="text-sm text-muted-foreground">
                Pick up where you left off. Life happens, and goals get paused. Restarting is not failure — it is resilience. {SITE_SHORT_NAME} is designed to welcome you back without judgment. Your previous progress is preserved, your streaks can be rebuilt, and the community is there to encourage you every step of the way.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-purple-600/10 border border-purple-500/20">
              <h3 className="font-semibold text-purple-400 mb-1">Explore</h3>
              <p className="text-sm text-muted-foreground">
                Discover new domains and interests. Growth is not just about sticking to one path — it is about curiosity and exploration. {SITE_SHORT_NAME} helps you discover new topics, connect with people on similar journeys, and find communities that share your passions through its discover system and hashtag-based search.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Who is {SITE_SHORT_NAME} for?</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            {SITE_SHORT_NAME} is built for anyone on a self-improvement journey who wants visible, trackable, and community-supported progress. This includes students building study habits and tracking their learning across multiple subjects, self-improvement enthusiasts who want a structured way to measure personal growth over time, and beginners who are just starting to learn new skills and need guidance and motivation.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            It is also for fitness learners who want to log workouts, track calorie balance, and share their physical transformation journey with a supportive community. Content creators can benefit from documenting their creative process publicly, tracking their publishing pipeline, and building an audience through consistent output. Productivity-focused individuals will find value in the gamification system that turns daily habits into rewarding progression milestones.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Whether you are a college student learning programming, a working professional restarting your fitness routine, a YouTuber tracking your upload consistency, or simply someone who wants to build better habits — {SITE_SHORT_NAME} provides the ecosystem to make your journey visible, accountable, and rewarding.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Core Features</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2"><span className="text-blue-400 mt-1">&#8226;</span><span><strong className="text-foreground">Learning Progression Tracker</strong> — Log study sessions, track topics, and visualize your learning journey over time with detailed entry logs and topic-based organization.</span></li>
            <li className="flex items-start gap-2"><span className="text-amber-400 mt-1">&#8226;</span><span><strong className="text-foreground">Fitness Journey Logger</strong> — Record workouts, track weight trends, monitor calorie balance, and share your fitness milestones with the community.</span></li>
            <li className="flex items-start gap-2"><span className="text-purple-400 mt-1">&#8226;</span><span><strong className="text-foreground">Content Creation Tracker</strong> — Document your creative process with series-based tracking, live status pipelines, and publishing workflow management.</span></li>
            <li className="flex items-start gap-2"><span className="text-green-400 mt-1">&#8226;</span><span><strong className="text-foreground">Public Progression Feed</strong> — Share live updates from your learning, fitness, and content creation journeys. See real-time progress from the community.</span></li>
            <li className="flex items-start gap-2"><span className="text-pink-400 mt-1">&#8226;</span><span><strong className="text-foreground">Gamification System</strong> — Earn XP, level up, build streaks, unlock achievements, and complete daily quests that keep you motivated and consistent.</span></li>
            <li className="flex items-start gap-2"><span className="text-cyan-400 mt-1">&#8226;</span><span><strong className="text-foreground">AI-Assisted Learning</strong> — Get personalized guidance, topic exploration, and study recommendations powered by AI to accelerate your growth.</span></li>
            <li className="flex items-start gap-2"><span className="text-orange-400 mt-1">&#8226;</span><span><strong className="text-foreground">Community and Discovery</strong> — Find people, topics, groups, and trending content. Connect with others on similar journeys and build accountability partnerships.</span></li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Our Philosophy</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We believe that consistency beats intensity. A 15-minute daily learning session logged consistently will outperform a 5-hour binge study session followed by weeks of inactivity. {SITE_SHORT_NAME} is designed to reward consistency through its streak system, daily quests, and public progression feed that celebrates showing up every day.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We also believe in the power of public accountability. When your progress is visible to others, you are more likely to follow through. This is not about comparison or competition — it is about creating an environment where growth is normalized, celebrated, and supported by a community of people on similar paths.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Finally, we believe that starting over is not failing. The Restart philosophy is at the core of {SITE_SHORT_NAME}. Life gets in the way, goals get paused, and motivation wanes. What matters is that you come back. {SITE_SHORT_NAME} is built to make restarting as easy and encouraging as starting for the first time.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Who runs {SITE_SHORT_NAME}?</h2>
          <p className="text-muted-foreground leading-relaxed">
            {SITE_SHORT_NAME} is independently developed and maintained by a small team passionate about self-improvement technology. The platform is free to use and will always remain free at its core. We believe that tools for self-growth should be accessible to everyone, regardless of their financial situation. If you have questions, feedback, or want to contribute ideas, you can reach us through our <a href="/contact" className="text-blue-400 hover:text-blue-300 underline">contact page</a>.
          </p>
        </section>
      </div>
    </main>
  );
}
