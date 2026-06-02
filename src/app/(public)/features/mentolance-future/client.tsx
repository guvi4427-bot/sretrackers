'use client';

import { GlassCard } from '@/components/glass-card';
import { Button } from '@/components/ui/button';
import { SITE_NAME } from '@/lib/site-config';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  Handshake,
  Search,
  BadgeCheck,
  ArrowLeft,
  Target,
  Rocket,
  CheckCircle2,
  ChevronDown,
  Link2,
  Clock,
} from 'lucide-react';
import { useState } from 'react';

const features = [
  {
    icon: Search,
    title: 'Mentor Discovery & Matching',
    description:
      'Finding the right mentor should not be left to chance. MentoLance will feature a smart discovery system that matches mentees with mentors based on goals, experience level, category focus, and availability. Whether you need a fitness mentor who has been through a weight loss journey, a learning mentor who has mastered the study techniques you want to adopt, or a productivity mentor who can help you build better systems — the matching algorithm considers your profile, activity history, and stated goals to recommend mentors who are uniquely qualified to help you grow. You can also browse mentors by category, read their profiles, and reach out directly.',
  },
  {
    icon: Handshake,
    title: 'One-on-One Mentorship Sessions',
    description:
      'MentoLance will support structured one-on-one mentorship between experienced users and newcomers. Mentors can schedule regular check-in sessions with their mentees — weekly video calls, messaging check-ins, or progress reviews. The mentorship is integrated with SRE Track tracking, so mentors can see their mentee\'s activity data (with permission) and provide data-informed guidance. Instead of generic advice, mentors can say "I see you have not logged a workout in three days — let\'s talk about what is getting in the way." This level of personalized attention accelerates growth in ways that self-directed effort alone cannot match.',
  },
  {
    icon: BadgeCheck,
    title: 'Verified Mentor System',
    description:
      'Not everyone can be a mentor on MentoLance — it is a privilege earned through demonstrated expertise and consistency. Mentors will be verified based on their track record on SRE Track: level, streaks, achievements, and category-specific milestones. A fitness mentor must have reached a certain fitness XP threshold. A learning mentor must have logged substantial study hours. The verification system ensures that mentees receive guidance from users who have genuinely walked the path they want to follow. Verified mentors receive a special badge on their profile and access to mentorship-specific tools and analytics.',
  },
  {
    icon: GraduationCap,
    title: 'Group Mentorship & Masterminds',
    description:
      'Beyond one-on-one pairings, MentoLance will support group mentorship formats where one experienced mentor guides a small cohort of mentees through a structured program. Imagine a 4-week fitness kickoff program led by a verified mentor, or a 6-week study skills bootcamp, or a content creation mastermind group. Group mentorship creates peer support within the mentorship structure, letting mentees learn from each other as well as from their mentor. These programs will be scheduled on the platform with clear start dates, session plans, and expected outcomes.',
  },
];

const useCases = [
  {
    title: 'The Beginner Who Needs Direction',
    description:
      'You are new to self-improvement and overwhelmed by options. Should you focus on fitness first? Start with productivity? How do you even build a study habit? A MentoLance mentor who has been where you are can help you prioritize, create a realistic starting plan, and guide you through the inevitable early struggles. Instead of guessing, you follow a proven path with personal adjustments from someone who has already succeeded at what you are trying to do.',
  },
  {
    title: 'The Experienced User Who Wants to Give Back',
    description:
      'You have been using SRE Track for months and have made genuine progress. You remember how hard the beginning was and wish someone had guided you. MentoLance gives you the tools to become that guide. Share your experience, help newcomers avoid the mistakes you made, and earn special XP rewards for mentorship activities. Mentorship is one of the most fulfilling ways to reinforce your own learning and growth while making a meaningful difference in someone else\'s journey.',
  },
  {
    title: 'The Plateaued Grower Seeking Expertise',
    description:
      'You have made solid progress but hit a plateau you cannot break through alone. Your workouts have stagnated, your study efficiency has flatlined, or your content growth has stalled. A mentor with deeper expertise can see what you cannot — subtle adjustments to your routine, nutrition strategy, study methods, or content approach that unlock the next level. Sometimes growth requires an outside perspective from someone further down the path.',
  },
  {
    title: 'The Accountability Seeker with a Personal Coach',
    description:
      'You thrive with personal accountability but cannot afford a professional coach. MentoLance mentorship provides structured accountability from a peer who understands your journey because they have lived it. Regular check-ins, progress reviews, and gentle but firm encouragement from someone who genuinely wants to see you succeed. The integration with SRE Track data means your mentor always knows where you stand without you having to explain everything from scratch each session.',
  },
];

const benefits = [
  'Smart matching connects you with mentors who have relevant experience',
  'One-on-one mentorship provides personalized, data-informed guidance',
  'Verified mentor system ensures quality and credibility',
  'Group mentorship programs offer structured learning with peer support',
  'Mentors earn special XP rewards and exclusive achievements',
  'Mentees accelerate their growth with expert guidance',
  'Free mentorship matching — no paid coaching tiers',
  'Integrated with SRE Track data for informed mentorship sessions',
];

const faqs = [
  {
    question: 'When will MentoLance be available?',
    answer:
      'MentoLance is currently in the planning and development phase. We are building the mentor verification system, matching algorithm, and session tools that will make mentorship seamless on SRE Track. While we do not have a specific launch date yet, you can start preparing now by building your track record on the platform — your XP, achievements, and streaks will all factor into mentor verification when MentoLance launches. Follow our blog for development updates.',
  },
  {
    question: 'How can I become a verified mentor?',
    answer:
      'When MentoLance launches, mentor verification will be based on your demonstrated track record on SRE Track. Requirements will include reaching a minimum level, achieving specific category milestones, maintaining a consistent streak, and receiving positive community interactions. The exact thresholds are being determined, but the core principle is clear: mentors must have genuinely walked the path they want to guide others on. Start building your credentials now so you are ready on day one.',
  },
  {
    question: 'Will mentorship be free?',
    answer:
      'Yes. The core mentorship matching and communication features on MentoLance will be free for all SRE Track users. Our mission is to make self-improvement accessible, and that includes access to experienced guidance. Mentors volunteer their time and earn special XP rewards and achievements for their contributions. There are no paid coaching tiers or premium mentorship plans on the roadmap.',
  },
  {
    question: 'How does data sharing work between mentors and mentees?',
    answer:
      'Mentees will have full control over what data they share with their mentor. You can grant your mentor view access to specific categories — fitness logs, study sessions, content pipeline, or productivity data — or keep certain areas private. Data sharing is always opt-in and can be revoked at any time. The purpose of sharing is to enable data-informed mentorship, but your privacy is never compromised in the process.',
  },
  {
    question: 'Can I be both a mentor and a mentee?',
    answer:
      'Absolutely. Many users will be mentors in their area of expertise while simultaneously seeking mentorship in areas where they are still growing. You might mentor someone in fitness while being mentored in content creation. MentoLance supports these dual roles, and the matching system considers your mentor and mentee profiles separately. Growth is a lifelong journey, and even the most experienced users can benefit from guidance in new areas.',
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

export default function MentolanceFutureFeatureClient() {
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

        {/* Coming Soon Banner */}
        <GlassCard variant="glowing" className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-sm font-medium">
            <Clock className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            <span className="text-teal-700 dark:text-teal-300">Upcoming Feature — Currently in Development</span>
          </div>
        </GlassCard>

        {/* Header */}
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 border border-teal-500/20">
            <GraduationCap className="h-8 w-8 text-teal-600 dark:text-teal-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            MentoLance
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            A mentorship marketplace where experienced {SITE_NAME} users guide
            newcomers on their self-improvement journey. Connect with verified
            mentors for fitness, learning, productivity, and content creation —
            coming soon.
          </p>
        </div>

        {/* Feature Cards */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight text-center">
            Planned Features
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {features.map((feature) => (
              <GlassCard
                key={feature.title}
                variant="glassmorphism"
                className="p-6 space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-teal-500/10">
                    <feature.icon className="h-5 w-5 text-teal-600 dark:text-teal-400" />
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
            How MentoLance Will Help You
          </h2>
          <div className="space-y-4">
            {useCases.map((useCase) => (
              <GlassCard key={useCase.title} variant="default" className="p-6 space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Target className="h-4 w-4 text-teal-600 dark:text-teal-400" />
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
            Why MentoLance Matters
          </h2>
          <GlassCard variant="liquid" className="p-6">
            <ul className="space-y-3">
              {benefits.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-start gap-3 text-sm leading-relaxed"
                >
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-teal-600 dark:text-teal-400 shrink-0" />
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
            Explore Current Features
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { href: '/features/community', label: 'Community & Social' },
              { href: '/features/gamification', label: 'Gamification & XP' },
              { href: '/features/achievements', label: 'Achievement System' },
              { href: '/features/leaderboards', label: 'Leaderboards' },
              { href: '/features/fitness', label: 'Fitness Tracker' },
              { href: '/features/learning', label: 'Learning Tracker' },
              { href: '/features/studicate-future', label: 'StudiCate (Upcoming)' },
              { href: '/blog', label: 'Blog & Updates' },
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
            <Rocket className="h-10 w-10 mx-auto text-teal-600 dark:text-teal-400" />
            <h2 className="text-2xl font-bold">
              Get Ready for MentoLance
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
              MentoLance is coming to {SITE_NAME}. Start building your track
              record now — your XP, achievements, and streaks will qualify you
              as a mentor from day one. Join the platform today and be ready when
              mentorship launches. Free forever.
            </p>
            <Button
              size="lg"
              className="bg-teal-600 hover:bg-teal-700 text-white"
              onClick={() => router.push('/signup')}
            >
              Start Building Your Profile
            </Button>
          </GlassCard>
        </section>
      </div>
    </div>
  );
}
