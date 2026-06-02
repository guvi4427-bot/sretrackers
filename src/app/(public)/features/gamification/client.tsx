'use client';

import { GlassCard } from '@/components/glass-card';
import { Button } from '@/components/ui/button';
import { SITE_NAME } from '@/lib/site-config';
import { useRouter } from 'next/navigation';
import {
  Trophy,
  Flame,
  Star,
  Swords,
  ArrowLeft,
  Target,
  Crown,
  CheckCircle2,
  ChevronDown,
  Link2,
} from 'lucide-react';
import { useState } from 'react';

const features = [
  {
    icon: Star,
    title: 'XP Earning System',
    description:
      'Every action on SRE Track earns XP. Complete a workout? XP. Log a meal? XP. Finish a study session? XP. Publish a blog post? Big XP. The XP system is the backbone of gamification — it quantifies every positive action and turns your self-improvement journey into a measurable, rewarding progression. XP is earned across all tracking features: fitness, learning, content, and productivity. There is no ceiling on how much XP you can earn, and every point reflects real effort you put into growing.',
  },
  {
    icon: Crown,
    title: 'Level Progression System',
    description:
      'XP accumulates into levels. Each level requires more XP than the last, creating a satisfying progression curve that mirrors real skill development. Early levels come quickly to reward new users and build momentum. Higher levels require sustained consistency — you cannot rush to level 50 in a weekend. Your level is displayed on your profile and in the community, serving as a visible marker of your commitment and experience. Leveling up triggers a celebration animation and often unlocks new achievements.',
  },
  {
    icon: Flame,
    title: 'Streaks & Daily Quests',
    description:
      'Streaks are the engine of consistency. Log at least one activity every day to maintain your streak. The longer your streak, the higher your XP multiplier climbs — a 7-day streak gives you a 1.5x multiplier, 30 days gives 2x, and 100 days gives 3x. Daily quests give you three fresh challenges each day: complete a workout, log a meal, finish a focus session, study for 30 minutes, or publish content. Completing all three daily quests triggers a bonus XP reward and extends your streak.',
  },
  {
    icon: Swords,
    title: 'Challenges & Competitions',
    description:
      'Participate in weekly and monthly challenges that push you beyond your comfort zone. Challenges might include "Log 5 workouts this week," "Study 10 hours this month," or "Publish 3 blog posts." Each challenge has its own XP reward and often includes leaderboard rankings so you can compete with friends or the entire community. Seasonal challenges bring themed achievements and limited-time rewards that keep the experience fresh and exciting throughout the year.',
  },
];

const useCases = [
  {
    title: 'The Motivation-Seeking Beginner',
    description:
      'You start habits enthusiastically but lose steam after a week. SRE Track gamification is built for you. Early levels come fast, daily quests give you clear manageable targets, and the streak system creates a compelling reason to show up every day. The XP multiplier rewards consistency above intensity — you earn more by doing a little every day than by doing a lot sporadically. Before you know it, three weeks have passed and you have a streak you do not want to break.',
  },
  {
    title: 'The Competitive Self-Improver',
    description:
      'You thrive on competition and comparison. The leaderboard system ranks you against friends and the global community across multiple categories: total XP, longest streak, most workouts, study hours, and more. Weekly challenges give you a fresh battleground every week. You push harder because you can see exactly where you stand and who you need to surpass. Healthy competition drives consistent effort.',
  },
  {
    title: 'The All-or-Nothing Thinker',
    description:
      'You tend to go all-in for a few days and then quit entirely when you miss a day. SRE Track gamification is designed to break this pattern. The daily quests are intentionally small and achievable — they meet you where you are, not where you wish you were. Even on your worst day, completing one quest and maintaining your streak is doable. The system rewards showing up, not being perfect. Over time, this shifts your mindset from all-or-nothing to something-is-always-better-than-nothing.',
  },
  {
    title: 'The Long-Term Growth Hacker',
    description:
      'You are committed to self-improvement for the long haul and want to see a measurable record of your journey. The XP system provides that record. Two years of tracked activity translates to a massive XP total, a high level, and hundreds of achievements. You can look back and see exactly how much you have grown. The gamification system does not just motivate — it documents. Your level and XP tell the story of your consistency over time.',
  },
];

const benefits = [
  'XP system quantifies every positive action across fitness, learning, content, and productivity',
  'Level progression creates a satisfying long-term growth curve',
  'Streaks with XP multipliers reward consistency above all else',
  'Daily quests provide clear, achievable targets every single day',
  'Weekly and monthly challenges push you beyond your comfort zone',
  'Achievement system with 100+ milestones to unlock and claim',
  'Leaderboards for friendly competition with friends and the global community',
  'Completely free — no pay-to-win mechanics or premium advantages',
];

const faqs = [
  {
    question: 'How is XP calculated across different activities?',
    answer:
      'XP is earned proportionally to the effort and impact of each activity. A completed workout earns more XP than logging a meal, and publishing content earns more than starting a draft. Focus sessions earn XP based on duration. Study sessions earn XP based on time and topic complexity. The system is balanced so that all types of self-improvement contribute meaningfully to your progression — you do not need to be a fitness person or a content creator specifically to level up effectively.',
  },
  {
    question: 'What happens if I break my streak?',
    answer:
      'When you break a streak, your XP multiplier resets to 1x. However, SRE Track includes a streak recovery mechanic — if you log activity the very next day after a break, your streak is partially restored at a reduced multiplier instead of a full reset. The AI assistant can also help you with streak recovery strategies and motivation to get back on track. The goal is to make missing a day feel like a setback, not a catastrophe.',
  },
  {
    question: 'Are daily quests the same for everyone?',
    answer:
      'Daily quests are personalized based on your activity patterns and goals. If you are primarily a fitness user, your quests will lean toward workout and nutrition activities. If you are a content creator, you will see more writing and publishing quests. The system ensures you always have three achievable quests that are relevant to your self-improvement journey. Quests refresh every day at midnight.',
  },
  {
    question: 'Can I see how my XP compares to others?',
    answer:
      'Yes! The leaderboard system shows your ranking among friends and the global community. You can view leaderboards filtered by total XP, weekly XP gains, longest active streak, and category-specific rankings like fitness XP or learning XP. The leaderboards update in real time, so you can watch your ranking change as you earn XP throughout the day.',
  },
  {
    question: 'Is the gamification system fair for new users?',
    answer:
      'Absolutely. While long-term users have higher total XP, the weekly XP leaderboard and streak-based multipliers level the playing field. A new user with a 7-day streak and a 1.5x multiplier can compete effectively on weekly rankings against veteran users. The system rewards current effort, not just accumulated history. Daily quests and challenges are also calibrated to your level, so newcomers get achievable targets that build momentum.',
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

export default function GamificationFeatureClient() {
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border border-amber-500/20">
            <Trophy className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Gamification System
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            XP, levels, streaks, daily quests, and achievements that turn
            self-improvement into an addictive game. {SITE_NAME} makes
            consistency rewarding and growth visible — because the best habit is
            the one you actually want to keep.
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
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <feature.icon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
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
                  <Target className="h-4 w-4 text-amber-600 dark:text-amber-400" />
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
            Why Gamification Works on {SITE_NAME}
          </h2>
          <GlassCard variant="liquid" className="p-6">
            <ul className="space-y-3">
              {benefits.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-start gap-3 text-sm leading-relaxed"
                >
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-amber-600 dark:text-amber-400 shrink-0" />
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
              { href: '/features/achievements', label: 'Achievement System' },
              { href: '/features/leaderboards', label: 'Leaderboards' },
              { href: '/features/analytics', label: 'Progress Analytics' },
              { href: '/features/community', label: 'Community & Social' },
              { href: '/features/fitness', label: 'Fitness Tracker' },
              { href: '/features/learning', label: 'Learning Tracker' },
              { href: '/blog', label: 'Blog & Tips' },
              { href: '/showcase', label: 'User Showcase' },
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
            <Trophy className="h-10 w-10 mx-auto text-amber-600 dark:text-amber-400" />
            <h2 className="text-2xl font-bold">
              Turn Growth Into a Game You Win
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
              XP, levels, streaks, and achievements make consistency addictive on{' '}
              {SITE_NAME}. Start earning today and watch your self-improvement
              journey transform into the most rewarding game you have ever
              played. Free forever.
            </p>
            <Button
              size="lg"
              className="bg-amber-600 hover:bg-amber-700 text-white"
              onClick={() => router.push('/signup')}
            >
              Start Earning XP
            </Button>
          </GlassCard>
        </section>
      </div>
    </div>
  );
}
