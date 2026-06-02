'use client';

import { GlassCard } from '@/components/glass-card';
import { Button } from '@/components/ui/button';
import { SITE_NAME } from '@/lib/site-config';
import { useRouter } from 'next/navigation';
import {
  Award,
  Dumbbell,
  BookOpen,
  PenTool,
  Clock,
  ArrowLeft,
  Target,
  Gem,
  CheckCircle2,
  ChevronDown,
  Link2,
} from 'lucide-react';
import { useState } from 'react';

const features = [
  {
    icon: Award,
    title: '100+ Unlockable Achievements',
    description:
      'SRE Track features over 100 achievements spanning every aspect of self-improvement. From your first logged workout to a 365-day streak, from publishing your first blog post to completing 100 study sessions, there is an achievement for every milestone. Each achievement has clear unlock criteria so you always know what to aim for next. Some achievements are straightforward — log 10 workouts. Others require sustained effort — maintain a 90-day streak across any category. The variety ensures that both new and veteran users always have achievements within reach and aspirational goals to pursue.',
  },
  {
    icon: Gem,
    title: '4 Categories with Tiered Progression',
    description:
      'Achievements are organized into four categories: Fitness, Learning, Content Creation, and Productivity. Each category has achievements at four tiers — Bronze, Silver, Gold, and Platinum. Bronze achievements are entry-level milestones that unlock quickly. Silver requires more sustained effort. Gold demands significant commitment. Platinum achievements are rare and prestigious, earned by less than one percent of users. The tiered system creates a natural progression within each category and gives you clear long-term goals to chase. Completing all achievements in a category at Gold tier or above unlocks a special Mastery badge.',
  },
  {
    icon: Award,
    title: 'Claimable XP Rewards',
    description:
      'Unlike passive achievement systems, SRE Track makes achievements claimable. When you unlock an achievement, you receive a notification, but the XP bonus is not automatically applied. You must visit your achievements page and claim each one. This might seem like an extra step, but it creates a moment of deliberate recognition — you actively acknowledge your accomplishment and receive the reward. Bronze achievements grant small XP bonuses, Silver grants more, Gold grants substantial rewards, and Platinum achievements deliver massive XP payouts that can significantly boost your level. Claiming an achievement also posts it to the community feed for celebration.',
  },
  {
    icon: BookOpen,
    title: 'Hidden & Seasonal Achievements',
    description:
      'Not all achievements are visible from the start. Hidden achievements have secret unlock criteria that are only revealed after you earn them. These create delightful surprise moments when you discover you have unlocked something you did not know existed. Seasonal achievements are available only during specific time periods — complete a holiday challenge, join a summer fitness event, or participate in a new-year goal-setting sprint. Seasonal achievements are time-limited and will not return once the season ends, making them exclusive badges of honor for users who were active during that period.',
  },
];

const useCases = [
  {
    title: 'The Completionist',
    description:
      'You need to check every box and fill every progress bar. The 100+ achievement system on SRE Track is your playground. Browse the achievement list, identify the next unlockable milestone, and pursue it deliberately. The clear criteria and tiered progression give you an endless roadmap of goals. When you finally complete that Platinum achievement that took three months of consistent effort, the satisfaction is unmatched. The claimable reward system ensures every unlock feels like a genuine prize, not just a notification.',
  },
  {
    title: 'The Motivation-Seeking Newcomer',
    description:
      'You just started using SRE Track and need early wins to build momentum. Bronze achievements are designed for exactly this moment. Your first workout, first study session, first meal log — each triggers an achievement notification and a claimable XP bonus. These early rewards create a positive feedback loop that keeps you coming back. Within your first week, you will have claimed 5-10 achievements and earned enough XP to level up several times. The system is designed to make starting feel rewarding.',
  },
  {
    title: 'The Multi-Disciplinary Grower',
    description:
      'You track fitness, learning, content, and productivity — and you want recognition for your balanced approach. The four-category achievement system rewards diversification. While specialists can earn Gold in a single category, achieving Silver across all four categories earns a special Balanced Growth badge. This encourages you to develop in multiple areas rather than hyper-focusing on one, leading to more well-rounded self-improvement.',
  },
  {
    title: 'The Streak Guardian',
    description:
      'Your streak is your pride, and the achievement system validates that commitment. Streak-specific achievements unlock at 7, 14, 30, 60, 90, 180, and 365 days. Each streak milestone is a claimable achievement with an escalating XP reward. The 365-day streak achievement is Platinum-tier and one of the rarest on the platform. These achievements give streak-keepers something tangible to show for their extraordinary consistency — not just a number, but a badge of honor displayed on their profile.',
  },
];

const benefits = [
  'Over 100 achievements covering every aspect of self-improvement',
  'Four clear categories with Bronze, Silver, Gold, and Platinum tiers',
  'Claimable XP rewards that make every achievement feel like a prize',
  'Hidden achievements create surprise delight moments',
  'Seasonal achievements provide exclusive time-limited goals',
  'Profile badges that showcase your accomplishments to the community',
  'Mastery badges for completing all achievements in a category',
  'Completely free — no achievement is locked behind a paywall',
];

const faqs = [
  {
    question: 'How many achievements are there in total?',
    answer:
      'SRE Track currently features over 100 achievements, and new ones are added regularly. Achievements are distributed across four categories: Fitness, Learning, Content Creation, and Productivity. Each category contains achievements at four tiers (Bronze, Silver, Gold, Platinum), plus cross-category achievements, streak achievements, and special hidden achievements. The total count grows as seasonal and community achievements are added throughout the year.',
  },
  {
    question: 'What is the difference between claimable and automatic achievements?',
    answer:
      'All achievements on SRE Track are claimable. When you meet the unlock criteria, you receive a notification, but the XP reward is held until you visit the achievements page and claim it. This creates a moment of deliberate recognition and makes the reward feel more meaningful. Unclaimed achievements are highlighted on your dashboard so you never miss a claim. Once claimed, the XP is added to your total and the achievement appears on your profile.',
  },
  {
    question: 'How do hidden achievements work?',
    answer:
      'Hidden achievements have unlock criteria that are not displayed in the achievement list. They appear as question marks or silhouettes until you earn them. When you meet the hidden criteria through normal activity, the achievement is revealed with a surprise notification. Hidden achievements range from quirky Easter eggs to challenging feats that reward creative use of the platform. Once unlocked, they display normally on your profile alongside your other achievements.',
  },
  {
    question: 'Can I show off my achievements on my profile?',
    answer:
      'Absolutely. Your profile features a showcase section where you can pin your proudest achievements. Other users viewing your profile see your achievement count, tier breakdown, and featured badges. Platinum and Mastery achievements are especially prominent and serve as visible proof of your commitment. You can also share achievement unlocks to the community feed, where friends can like and comment to celebrate your milestone.',
  },
  {
    question: 'Will I run out of achievements to pursue?',
    answer:
      'New achievements are added regularly through seasonal events, community challenges, and platform updates. Platinum-tier achievements in each category require months of consistent effort, so long-term users always have aspirational goals. Additionally, as SRE Track introduces new features, new achievement categories and milestones follow. The achievement system is designed to grow with the platform and with you, ensuring there is always a next milestone to chase.',
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

export default function AchievementsFeatureClient() {
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-600/20 border border-amber-500/20">
            <Award className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Achievement System
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Over 100 unlockable milestones across four categories with bronze,
            silver, gold, and platinum tiers. Claimable XP rewards, hidden
            surprises, and seasonal exclusives make every achievement feel
            earned on {SITE_NAME}.
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

        {/* Achievement Categories */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight text-center">
            4 Achievement Categories
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Dumbbell, label: 'Fitness', color: 'text-green-600 dark:text-green-400' },
              { icon: BookOpen, label: 'Learning', color: 'text-blue-600 dark:text-blue-400' },
              { icon: PenTool, label: 'Content', color: 'text-orange-600 dark:text-orange-400' },
              { icon: Clock, label: 'Productivity', color: 'text-violet-600 dark:text-violet-400' },
            ].map((cat) => (
              <GlassCard key={cat.label} variant="default" className="p-4 text-center space-y-2">
                <cat.icon className={`h-8 w-8 mx-auto ${cat.color}`} />
                <p className="font-semibold text-sm">{cat.label}</p>
                <p className="text-xs text-muted-foreground">Bronze → Platinum</p>
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
            Why Achievements Matter on {SITE_NAME}
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
              { href: '/features/gamification', label: 'Gamification & XP System' },
              { href: '/features/leaderboards', label: 'Leaderboards' },
              { href: '/features/community', label: 'Community & Social' },
              { href: '/features/fitness', label: 'Fitness Tracker' },
              { href: '/features/learning', label: 'Learning Tracker' },
              { href: '/features/content', label: 'Content Creation Tracker' },
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
            <Award className="h-10 w-10 mx-auto text-amber-600 dark:text-amber-400" />
            <h2 className="text-2xl font-bold">
              Unlock Your Potential, One Achievement at a Time
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Over 100 achievements waiting to be unlocked on {SITE_NAME}.
              Start earning Bronze milestones today and work your way up to
              Platinum prestige. Every achievement is a step forward in your
              self-improvement journey. Free forever.
            </p>
            <Button
              size="lg"
              className="bg-amber-600 hover:bg-amber-700 text-white"
              onClick={() => router.push('/signup')}
            >
              Start Unlocking
            </Button>
          </GlassCard>
        </section>
      </div>
    </div>
  );
}
