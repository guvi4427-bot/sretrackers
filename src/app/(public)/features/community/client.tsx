'use client';

import { GlassCard } from '@/components/glass-card';
import { Button } from '@/components/ui/button';
import { SITE_NAME } from '@/lib/site-config';
import { useRouter } from 'next/navigation';
import {
  Users,
  Rss,
  Compass,
  Heart,
  ArrowLeft,
  Target,
  Handshake,
  CheckCircle2,
  ChevronDown,
  Link2,
} from 'lucide-react';
import { useState } from 'react';

const features = [
  {
    icon: Rss,
    title: 'Social Activity Feed',
    description:
      'Your personalized feed shows activity from users you follow and trending posts from the wider community. See workout completions, learning milestones, content publications, streak celebrations, and achievement unlocks as they happen. The feed is designed around positive reinforcement — every post celebrates progress, not perfection. Unlike toxic social media that makes you feel inadequate, the SRE Track feed inspires you by showing real people making real progress on goals that matter to them.',
  },
  {
    icon: Compass,
    title: 'Discover & Explore',
    description:
      'Find users who share your goals, interests, and journey stage. The discover page recommends accounts based on your activity patterns — if you are into fitness, you see other fitness enthusiasts. If you are learning to code, you find fellow learners. Filter by category, streak length, level, and more to find exactly the kind of accountability partners and inspiration sources you need. Discovery is how this community grows beyond your existing network.',
  },
  {
    icon: Heart,
    title: 'Comments, Likes & Encouragement',
    description:
      'Every shared milestone can receive likes and comments from the community. The comment system is built around encouragement and support — not criticism or comparison. When someone hits a 30-day streak, the community celebrates. When someone publishes their first blog post, they get genuine congratulations. This positive reinforcement loop is what makes SRE Track different from other social platforms. Every interaction is designed to motivate, not to judge.',
  },
  {
    icon: Users,
    title: 'Follow System & Accountability',
    description:
      'Follow other users to see their progress in your feed and on your dashboard. When you follow someone, you become part of their support network — they know you are watching and cheering them on. This creates gentle accountability that drives consistency. You can also form accountability partnerships where you and a mutual follow commit to specific goals and check in with each other regularly. The follow system is not about popularity — it is about building a network of people who genuinely help each other grow.',
  },
];

const useCases = [
  {
    title: 'The Solo Striver Seeking Connection',
    description:
      'You have been working on yourself alone and it feels isolating. Nobody in your immediate circle understands why you track every workout or study session. On SRE Track, you find thousands of people who get it. Follow users with similar goals, share your progress, and receive genuine encouragement from people on the same journey. The community transforms solitary self-improvement into a shared experience.',
  },
  {
    title: 'The Accountability Partner Seeker',
    description:
      'You know you do better when someone is watching. The follow system and accountability partnership features on SRE Track create the social pressure you need. When you know your followers will see if you break your streak, you think twice before skipping a day. When you have a partner checking in on your goals, you show up even when motivation is low. Accountability through community is more sustainable than willpower alone.',
  },
  {
    title: 'The Inspiration Hunter',
    description:
      'You want to see what is possible before you believe it is possible for you. Browse the discover page and find users who have maintained 100-day streaks, published 50 blog posts, or hit their weight goals. Their journeys — visible through shared milestones and achievements — show you the path. Real people with real results provide better motivation than any motivational quote or influencer highlight reel.',
  },
  {
    title: 'The Encourager Who Wants to Give Back',
    description:
      'You have made progress and want to help others do the same. SRE Track gives you a platform to share your wins openly — not to brag, but to show what consistency looks like. Your shared milestones inspire newcomers. Your comments on their progress keep them going. The community thrives when experienced users give back, and the recognition system ensures your contributions are valued and visible.',
  },
];

const benefits = [
  'Progression-focused social feed that celebrates growth, not comparison',
  'Discover system that connects you with users on similar journeys',
  'Comments and likes built around encouragement, not criticism',
  'Follow system creates gentle accountability that drives consistency',
  'Accountability partnerships for structured mutual support',
  'Positive community culture that motivates rather than demoralizes',
  'Completely free social features with no ads or algorithmic manipulation',
  'Integrates with all tracking features so sharing progress is effortless',
];

const faqs = [
  {
    question: 'Is the community moderated?',
    answer:
      'Yes. SRE Track maintains a positive, supportive community culture through active moderation. Posts and comments that are abusive, discouraging, or spammy are removed. The community guidelines emphasize encouragement, respect, and constructive interaction. Our goal is to create the most positive social platform on the internet — one where every interaction makes you want to keep growing.',
  },
  {
    question: 'Can I control who sees my progress?',
    answer:
      'Absolutely. You have full control over your privacy settings. You can choose to share progress publicly, with followers only, or keep it private. Each type of activity — workouts, meals, study sessions, content — can have its own visibility setting. Share what you are comfortable sharing and keep the rest private. Your data, your choice.',
  },
  {
    question: 'How is this different from sharing progress on Instagram or Twitter?',
    answer:
      'SRE Track is purpose-built for self-improvement progress. Unlike Instagram where posts are curated highlights designed to impress, SRE Track celebrates the process — the daily logs, the streaks, the incremental gains. The community understands the journey because everyone is on one. There is no pressure to look perfect. There is only encouragement to keep going. The feed algorithm also prioritizes genuine progress over engagement bait.',
  },
  {
    question: 'How do accountability partnerships work?',
    answer:
      'You can send an accountability request to any user you follow (and who follows you back). Once accepted, you both commit to specific goals — for example, maintaining a daily streak, completing 3 workouts per week, or studying 5 hours per week. The partnership dashboard shows both partners\' progress toward their commitments, and you can check in with each other through direct messages. If one partner misses a goal, the other gets notified to offer encouragement.',
  },
  {
    question: 'Can I share achievements and milestones automatically?',
    answer:
      'Yes. You can enable automatic sharing for achievement unlocks, streak milestones, level-ups, and other significant events. When you hit a 30-day streak or unlock a rare achievement, it appears in the community feed automatically. You can also manually share specific workouts, study sessions, or content publications with a personal comment about the experience. Automatic sharing makes it easy to stay visible in the community without extra effort.',
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

export default function CommunityFeatureClient() {
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 border border-rose-500/20">
            <Users className="h-8 w-8 text-rose-600 dark:text-rose-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Community & Social
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            A progression-focused social platform where self-improvement is
            celebrated, not compared. Share your journey, follow others, and
            grow together with {SITE_NAME}&apos;s positive, accountability-driven
            community.
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
                  <div className="p-2 rounded-lg bg-rose-500/10">
                    <feature.icon className="h-5 w-5 text-rose-600 dark:text-rose-400" />
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
                  <Target className="h-4 w-4 text-rose-600 dark:text-rose-400" />
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
            Why Join the {SITE_NAME} Community?
          </h2>
          <GlassCard variant="liquid" className="p-6">
            <ul className="space-y-3">
              {benefits.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-start gap-3 text-sm leading-relaxed"
                >
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-rose-600 dark:text-rose-400 shrink-0" />
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
              { href: '/features/leaderboards', label: 'Leaderboards' },
              { href: '/features/gamification', label: 'Gamification & XP' },
              { href: '/features/achievements', label: 'Achievement System' },
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
            <Handshake className="h-10 w-10 mx-auto text-rose-600 dark:text-rose-400" />
            <h2 className="text-2xl font-bold">
              Grow Better, Together
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Join a community that celebrates every step forward. Share your
              progress, find accountability partners, and discover inspiring
              journeys on {SITE_NAME}. Self-improvement is better when it is
              shared. Free forever.
            </p>
            <Button
              size="lg"
              className="bg-rose-600 hover:bg-rose-700 text-white"
              onClick={() => router.push('/signup')}
            >
              Join the Community
            </Button>
          </GlassCard>
        </section>
      </div>
    </div>
  );
}
