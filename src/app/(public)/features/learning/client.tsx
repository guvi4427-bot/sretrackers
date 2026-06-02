'use client';

import { GlassCard } from '@/components/glass-card';
import { Button } from '@/components/ui/button';
import { SITE_NAME } from '@/lib/site-config';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Sparkles,
  ArrowLeft,
  Target,
  Flame,
  CheckCircle2,
  ChevronDown,
  Link2,
  Globe,
  Brain,
  Clock,
  BarChart3,
} from 'lucide-react';
import { useState } from 'react';

const features = [
  {
    icon: BookOpen,
    title: 'Topic Organization',
    description:
      'Create and organize learning topics that map to your interests and goals. Whether you are studying programming, languages, sciences, or any subject, topics give your learning a clear structure. Each topic becomes a dedicated space for entries, notes, and progress tracking, making it easy to pick up where you left off and see how your knowledge grows over time.',
  },
  {
    icon: Clock,
    title: 'Study Session Logging',
    description:
      'Log every study session with duration, notes, and reflections. Track how much time you spend on each topic and see your cumulative study hours build up day by day. The session logger is designed for speed — a few taps and your study time is recorded, earning you XP and building your streak. No more wondering where your study hours went.',
  },
  {
    icon: BarChart3,
    title: 'Progress Visualization',
    description:
      'Visual dashboards show your learning trajectory at a glance. See entries per topic, study time distribution, streak history, and knowledge depth metrics. The progress views make it easy to identify which topics need more attention and which ones you have mastered. Beautiful charts and stats turn abstract learning progress into concrete, motivating visuals.',
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Progress Checks',
    description:
      'The AI assistant analyzes your learning patterns and provides personalized insights. Get recommendations on which topics to revisit, suggestions for study scheduling based on your habits, and motivational check-ins that keep you on track. The AI understands your learning rhythm and offers timely nudges to maintain consistency and deepen your knowledge.',
  },
  {
    icon: Globe,
    title: 'Share Learning Collections',
    description:
      'Share your learning topics publicly to inspire and help others in the community. When you share a collection, other users can view your topic structure and entries, creating a collaborative knowledge-sharing ecosystem. Shared collections earn you bonus XP and help build your reputation as a knowledge contributor within the SRE community.',
  },
  {
    icon: Brain,
    title: 'Knowledge Depth Tracking',
    description:
      'Go beyond surface-level tracking with depth metrics that measure how thoroughly you have explored each topic. The system tracks entries per topic, note completeness, and study duration to calculate a depth score. Achievements like "Deep Diver" reward concentrated study in a single area, encouraging both breadth and depth in your learning journey.',
  },
];

const useCases = [
  {
    title: 'The Consistent Student',
    description:
      'You study every day but never track your progress. With SRE Track, log each study session and watch your knowledge graph expand over weeks and months. The visual progress charts motivate you to maintain your streak, and the XP system rewards consistency — turning daily study from a chore into a game you look forward to winning.',
  },
  {
    title: 'The Self-Taught Developer',
    description:
      'You are learning programming through online resources but struggle with direction. Create topics for each technology — React, Python, databases — and log entries for every tutorial, project, and breakthrough. The topic structure gives your self-directed learning a curriculum-like organization, and the AI progress checks help you identify gaps in your knowledge.',
  },
  {
    title: 'The Language Learner',
    description:
      'You are learning a new language and need to track vocabulary, grammar rules, and practice sessions. Organize your language learning into topics like "Vocabulary," "Grammar," "Listening Practice," and "Speaking." Log each session with notes about what you learned and struggled with. Over time, the depth tracking shows which areas need more attention.',
  },
  {
    title: 'The Academic Researcher',
    description:
      'You are deep into research and need to organize your reading and notes. Create topics for each research area, log entries for papers read, experiments conducted, and insights gained. The sharing feature lets you collaborate with research partners by making your learning collections public. Track your study hours and maintain streaks through the busiest research periods.',
  },
];

const benefits = [
  'Organized learning with topic-based structure that mirrors how you actually study',
  'Visual progress tracking that makes abstract knowledge growth concrete and motivating',
  'AI-powered insights that help you study smarter, not just harder',
  'Gamified experience with XP, streaks, and achievements keeps you consistent long-term',
  'Share your knowledge with the community and earn recognition for your learning journey',
  'Completely free with no premium paywalls or locked features',
  'Works seamlessly on mobile and desktop for logging study sessions anywhere',
  'Depth tracking encourages thorough understanding, not just surface-level completion',
];

const faqs = [
  {
    question: 'How do I organize my learning topics?',
    answer:
      'Creating a topic is simple — just give it a name and optionally assign it to a phase (Start, Restart, or Explore). Each topic becomes a dedicated space where you log study entries with notes, duration, and dates. You can have as many topics as you want, and they can cover any subject from academic studies to personal hobbies to professional skills.',
  },
  {
    question: 'Can I share my learning progress with others?',
    answer:
      'Yes! You can share any topic as a public collection. When shared, other users can view your topic structure and study entries through the community feed or direct links. Sharing your learning journey earns you bonus XP and helps others who might be studying the same subjects. It creates a collaborative learning environment where everyone benefits.',
  },
  {
    question: 'How does the AI progress check work?',
    answer:
      'The AI analyzes your learning patterns — entry frequency, topic distribution, study duration, and note completeness — to provide personalized insights. It might suggest revisiting a topic you have not studied recently, recommend increasing study time for shallow topics, or congratulate you on maintaining a strong streak. The AI acts as a study coach that understands your unique learning rhythm.',
  },
  {
    question: 'What are learning streaks and how do they work?',
    answer:
      'A learning streak counts the consecutive days you have logged at least one study entry. Maintaining a streak earns you bonus XP multipliers and unlocks streak-based achievements. If you miss a day, your streak resets, but your personal best is always saved. Streaks are one of the most powerful motivators in the SRE system — they turn daily study into a rewarding habit.',
  },
  {
    question: 'Is the learning tracker really free?',
    answer:
      'Yes, SRE Track is completely free. Every feature — topic organization, study logging, progress visualization, AI insights, sharing, and gamification — is available to all users at no cost. We believe learning tools should be accessible to everyone, regardless of their financial situation.',
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <GlassCard
      variant="default"
      className="cursor-pointer"
      onClick={() => setOpen(!open)}
    >
      <div className="p-4 flex items-start justify-between gap-3">
        <h3 className="font-semibold text-sm sm:text-base">{question}</h3>
        <ChevronDown
          className={`h-5 w-5 shrink-0 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </div>
      {open && (
        <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">
          {answer}
        </div>
      )}
    </GlassCard>
  );
}

export default function LearningFeatureClient() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-12">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/features')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Features
        </Button>

        {/* Header */}
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20">
            <BookOpen className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Learning Tracker
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Organize study topics, log sessions, track progress with visual
            insights, and earn XP for every learning milestone. {SITE_NAME}{' '}
            makes knowledge growth visible, motivating, and rewarding.
          </p>
        </div>

        {/* Feature Cards */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight text-center">
            Key Features
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {features.map((feature) => (
              <GlassCard
                key={feature.title}
                variant="glassmorphism"
                className="p-6 space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-cyan-500/10">
                    <feature.icon className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <h3 className="font-semibold">{feature.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* Use Cases */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight text-center">
            Real Use Cases
          </h2>
          <div className="space-y-4">
            {useCases.map((useCase) => (
              <GlassCard key={useCase.title} variant="default" className="p-6 space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Target className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                  {useCase.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {useCase.description}
                </p>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight text-center">
            Why Track Learning with {SITE_NAME}?
          </h2>
          <GlassCard variant="liquid" className="p-6">
            <ul className="space-y-3">
              {benefits.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-start gap-3 text-sm leading-relaxed"
                >
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </GlassCard>
        </section>

        {/* FAQ */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <FAQItem
                key={faq.question}
                question={faq.question}
                answer={faq.answer}
              />
            ))}
          </div>
        </section>

        {/* Internal Links */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight text-center">
            Explore More Features
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { href: '/features/gamification', label: 'Gamification & XP System' },
              { href: '/features/analytics', label: 'Progress Analytics' },
              { href: '/features/achievements', label: 'Achievement System' },
              { href: '/features/community', label: 'Community & Social' },
              { href: '/features/fitness', label: 'Fitness Tracker' },
              { href: '/features/productivity', label: 'Productivity Tools' },
              { href: '/blog', label: 'Blog & Tips' },
              { href: '/showcase/learning', label: 'Learning Demo' },
            ].map((link) => (
              <Button
                key={link.href}
                variant="outline"
                className="justify-start gap-2 h-auto py-3"
                onClick={() => router.push(link.href)}
              >
                <Link2 className="h-4 w-4 shrink-0" />
                {link.label}
              </Button>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center space-y-4">
          <GlassCard variant="glowing" className="p-8 space-y-4">
            <Flame className="h-10 w-10 mx-auto text-cyan-600 dark:text-cyan-400" />
            <h2 className="text-2xl font-bold">
              Start Your Learning Journey Today
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Join thousands of learners who organize topics, log sessions, and
              earn XP on {SITE_NAME}. It is free, fun, and built to make
              knowledge growth visible and rewarding.
            </p>
            <Button
              size="lg"
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
              onClick={() => router.push('/signup')}
            >
              Get Started Free
            </Button>
          </GlassCard>
        </section>
      </div>
    </div>
  );
}
