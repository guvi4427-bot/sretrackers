'use client';

import { GlassCard } from '@/components/glass-card';
import { Button } from '@/components/ui/button';
import { SITE_NAME } from '@/lib/site-config';
import { useRouter } from 'next/navigation';
import {
  Medal,
  Globe,
  Users,
  TrendingUp,
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
    icon: Globe,
    title: 'Global Leaderboards',
    description:
      'See how you stack up against every user on SRE Track. The global leaderboard ranks all users by total XP, with separate tabs for weekly XP gains, longest active streak, and category-specific rankings like fitness, learning, content, and productivity. The global view shows the top performers and your position relative to them. Even if you are not in the top 100, you can see your global rank and how many users you have surpassed. The global leaderboard resets weekly for the weekly view, creating fresh competition every Monday.',
  },
  {
    icon: Users,
    title: 'Friend Leaderboards',
    description:
      'Compete directly with people you know and follow. The friend leaderboard shows rankings among your mutual follows, making competition personal and motivating. See who earned the most XP this week, who maintained the longest streak, and who dominated in specific categories. Friend leaderboards update in real time, so you can watch your ranking change as you and your friends earn XP throughout the day. This is where friendly rivalries are born and accountability partnerships are strengthened.',
  },
  {
    icon: Medal,
    title: 'Category-Specific Rankings',
    description:
      'Not everyone excels at the same thing, and the leaderboard system reflects that. Separate rankings exist for fitness XP, learning XP, content creation XP, and productivity XP. A fitness enthusiast can top the workout leaderboard without needing to be a content creator. A student can dominate the learning rankings without logging gym sessions. Category rankings let you find your competitive niche and see how you compare to others who share your focus. It also encourages cross-category exploration — seeing your lower ranking in a secondary category might motivate you to diversify your self-improvement.',
  },
  {
    icon: TrendingUp,
    title: 'Time-Based Leaderboards',
    description:
      'Leaderboards are not just about all-time rankings. Weekly and monthly views create fresh competitive cycles where everyone starts relatively equal each period. The weekly leaderboard rewards current effort over accumulated history — a new user who grinds hard this week can beat a veteran who coasted. Monthly leaderboards track sustained effort over a longer period. Time-based views ensure that the competitive landscape stays dynamic and that new users always have a chance to shine. Historical leaderboard snapshots are archived so you can look back at your past performances.',
  },
];

const useCases = [
  {
    title: 'The Competitive Athlete',
    description:
      'You push harder when someone is ahead of you. The fitness leaderboard on SRE Track shows you exactly who is logging more workouts, earning more fitness XP, and maintaining longer workout streaks. Seeing a friend 500 fitness XP ahead of you is the exact motivation you need to hit the gym today instead of skipping. The friendly rivalry pushes both of you to be better, and the weekly reset means you never fall too far behind to catch up.',
  },
  {
    title: 'The Study Group Competitor',
    description:
      'You and your study group all use SRE Track, and the learning leaderboard has become your weekly battleground. Who can log the most study hours? Who can maintain the longest study streak? The competition is fun, but the result is serious — everyone studies more because nobody wants to be at the bottom of the leaderboard on Sunday. The friend leaderboard turns your study group into a supportive competition that benefits everyone.',
  },
  {
    title: 'The Content Creator with Something to Prove',
    description:
      'You just started creating content and want to prove you can be consistent. The content creation leaderboard shows you how your output compares to other creators at your level. Climbing the weekly content leaderboard becomes a game — publish one more piece and you pass the person above you. The leaderboard does not just rank total output; it ranks consistency, which means showing up every week matters more than occasional bursts of productivity.',
  },
  {
    title: 'The New User Looking for Motivation',
    description:
      'You just joined SRE Track and feel like you are starting from zero. The weekly leaderboard levels the playing field — everyone starts fresh each week. Your first-week effort can land you on the weekly leaderboard even if you have zero accumulated XP. Seeing your name on a leaderboard, even at position 47 out of 200, is surprisingly motivating. It proves that your effort is real and measurable and that you are part of a community of people trying to improve.',
  },
];

const benefits = [
  'Global and friend leaderboards create multiple competitive contexts',
  'Category-specific rankings let you compete in your area of focus',
  'Weekly and monthly views ensure fresh competition cycles for everyone',
  'Real-time updates let you watch your ranking change as you earn XP',
  'Friend leaderboards strengthen accountability partnerships',
  'Rank badges and icons provide visible status markers',
  'Archived historical leaderboards let you track competitive progress over time',
  'Completely free — no pay-to-win mechanics or premium ranking advantages',
];

const faqs = [
  {
    question: 'How are leaderboard rankings calculated?',
    answer:
      'Rankings are based on XP earned in the relevant category and time period. The global all-time leaderboard ranks by total accumulated XP. The weekly leaderboard ranks by XP earned since Monday. Category leaderboards rank by XP earned in that specific category (fitness, learning, content, productivity). Streak leaderboards rank by longest currently active streak. All rankings update in real time as users earn XP throughout the day.',
  },
  {
    question: 'Can I hide my ranking from others?',
    answer:
      'Yes. You can opt out of public leaderboard appearances in your privacy settings. When opted out, your rank will not be visible to other users, though you can still see your own position. Friend leaderboards require mutual follows, so only people you follow back can see you on their friend leaderboard. You have full control over your competitive visibility.',
  },
  {
    question: 'Do weekly leaderboards reset every Monday?',
    answer:
      'Yes, the weekly leaderboard resets every Monday at midnight UTC. All weekly XP counters return to zero, and the competitive cycle starts fresh. This means new users can compete on equal footing with veterans each week. Your all-time XP and global ranking are unaffected by weekly resets — they continue to accumulate permanently.',
  },
  {
    question: 'Are there rewards for topping the leaderboard?',
    answer:
      'Yes! Top performers on weekly and monthly leaderboards earn bonus XP and exclusive achievement badges. The top 3 users on any weekly leaderboard receive a podium achievement. Monthly top performers earn seasonal badges that display on their profile. These rewards provide extra motivation to push for the top without creating a pay-to-win dynamic — leaderboard success is purely based on effort and consistency.',
  },
  {
    question: 'How do friend leaderboards work if I have few followers?',
    answer:
      'Friend leaderboards require at least one mutual follow to display. As you grow your network on SRE Track, the friend leaderboard becomes more populated and competitive. The discover feature helps you find users with similar goals to follow, and the community feed naturally leads to mutual connections. Even with just 2-3 friends, the friend leaderboard creates meaningful, personal competition that is often more motivating than the global view.',
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

export default function LeaderboardsFeatureClient() {
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20">
            <Crown className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Leaderboards
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Global and friend ranking systems that turn self-improvement into
            healthy competition. See where you stand, climb the ranks, and earn
            rewards for topping the charts on {SITE_NAME}.
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
                  <div className="p-2 rounded-lg bg-indigo-500/10">
                    <feature.icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
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
                  <Target className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
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
            Why Leaderboards Work on {SITE_NAME}
          </h2>
          <GlassCard variant="liquid" className="p-6">
            <ul className="space-y-3">
              {benefits.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-start gap-3 text-sm leading-relaxed"
                >
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
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
              { href: '/features/achievements', label: 'Achievement System' },
              { href: '/features/community', label: 'Community & Social' },
              { href: '/features/analytics', label: 'Progress Analytics' },
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
            <Crown className="h-10 w-10 mx-auto text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-2xl font-bold">
              Claim Your Rank
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
              See where you stand and climb the leaderboards on {SITE_NAME}.
              Compete with friends, challenge the global community, and earn
              rewards for topping the charts. Your effort deserves recognition.
              Free forever.
            </p>
            <Button
              size="lg"
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={() => router.push('/signup')}
            >
              Start Climbing
            </Button>
          </GlassCard>
        </section>
      </div>
    </div>
  );
}
