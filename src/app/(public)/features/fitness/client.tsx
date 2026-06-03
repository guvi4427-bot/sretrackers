'use client';

import { GlassCard } from '@/components/glass-card';
import { Button } from '@/components/ui/button';
import { SITE_NAME } from '@/lib/site-config';
import { useRouter } from 'next/navigation';
import {
  Dumbbell,
  Utensils,
  TrendingDown,
  Sparkles,
  ArrowLeft,
  Target,
  Flame,
  CheckCircle2,
  ChevronDown,
  Link2,
} from 'lucide-react';
import { useState } from 'react';

const features = [
  {
    icon: Dumbbell,
    title: 'Workout Logging',
    description:
      'Track every workout session with detailed exercise entries, sets, reps, and weights. Build custom routines for different training days and see your volume progress over time. Whether you prefer strength training, cardio, or flexibility work, the workout logger adapts to your style and keeps a complete history of every session you complete.',
  },
  {
    icon: Utensils,
    title: 'Meal Logging & AI Macro Estimation',
    description:
      'Log your meals quickly and let AI estimate your macros automatically. Simply describe what you ate — "grilled chicken breast with brown rice and steamed broccoli" — and the AI macro estimator breaks down the protein, carbs, fats, and total calories. No more manual searching through food databases or guessing portion sizes. The smart estimation gets more accurate the more you use it.',
  },
  {
    icon: TrendingDown,
    title: 'Weight & Body Progress Tracking',
    description:
      'Monitor your weight journey with beautiful trend charts that show the real picture beyond daily fluctuations. Track body measurements like waist, chest, arms, and thighs alongside weight to see changes the scale alone cannot show. Set target weights and receive milestone celebrations as you progress toward your goals.',
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Fitness Insights',
    description:
      'Get personalized insights based on your logged data. The AI analyzes your workout frequency, nutrition patterns, and weight trends to offer actionable suggestions. Discover which training split yields the best results for you, identify nutritional gaps in your diet, and receive weekly fitness summaries that highlight your progress and areas for improvement.',
  },
];

const useCases = [
  {
    title: 'The Consistent Lifter',
    description:
      'You hit the gym four days a week but never track your progress. With SRE Track, log each workout session and watch your lift numbers climb over weeks and months. The visual progress charts motivate you to push harder, and the XP system rewards consistency — turning discipline into a game you want to win every day.',
  },
  {
    title: 'The Nutrition-Focused Athlete',
    description:
      'You know nutrition is 80% of the results, but tracking macros feels tedious. Use the AI macro estimator to log meals in seconds instead of minutes. Just describe your meal and let the AI handle the math. Over time, you build a complete nutritional profile that reveals patterns you never noticed — like consistently under-eating protein on busy weekdays.',
  },
  {
    title: 'The Weight Loss Journey',
    description:
      'You are on a weight loss journey and need to see the big picture. Daily scale weight fluctuates, but the trend line on SRE Track shows the real story — a steady downward trend despite normal daily variance. Body measurement tracking adds another dimension of proof that your body is changing even when the scale does not move. Milestone badges and XP keep motivation high through plateaus.',
  },
  {
    title: 'The Recomposition Goal',
    description:
      'You want to lose fat and build muscle simultaneously — a slow process that requires patience and precise tracking. SRE Track lets you monitor weight, body measurements, and workout volume all in one place. When the scale stays the same but your waist shrinks and your lifts go up, you know recomposition is working. The analytics dashboard makes these subtle patterns visible.',
  },
];

const benefits = [
  'All-in-one fitness tracking: workouts, meals, weight, and body measurements in a single platform',
  'AI macro estimation saves 10+ minutes per day compared to manual food logging',
  'Gamified experience with XP, streaks, and achievements keeps you motivated long-term',
  'Visual trend charts reveal real progress beyond daily fluctuations',
  'Completely free with no premium paywalls or locked features',
  'Works seamlessly on mobile and desktop for logging anytime, anywhere',
  'Community features let you share milestones and stay accountable with friends',
];

const faqs = [
  {
    question: 'How does the AI macro estimation work?',
    answer:
      'The AI macro estimator uses natural language processing to understand your meal description. Simply type what you ate in plain English — for example, "two scrambled eggs with toast and avocado" — and the AI estimates the protein, carbohydrates, fats, and total calories based on typical portion sizes and nutritional databases. The more you use it, the better it adapts to your typical portions and eating patterns.',
  },
  {
    question: 'Can I track custom workouts and exercises?',
    answer:
      'Absolutely. SRE Track supports a comprehensive exercise library and also lets you create custom exercises. You can build personalized workout routines for different training days — push, pull, legs, upper, lower, full body, or any split you prefer. Each exercise entry supports sets, reps, weight, and notes so you can track everything with precision.',
  },
  {
    question: 'Is the fitness tracker really free?',
    answer:
      'Yes, SRE Track is completely free. There are no premium tiers, no paywalls, and no hidden fees. Every feature — workout logging, meal tracking, AI macro estimation, weight monitoring, and gamification — is available to all users at no cost. We believe self-improvement tools should be accessible to everyone.',
  },
  {
    question: 'How does fitness tracking connect to the gamification system?',
    answer:
      'Every fitness activity earns XP. Completing a workout session earns XP based on duration and intensity. Logging meals earns consistency XP. Hitting weight milestones triggers bonus XP rewards. Your fitness streak — consecutive days with logged activity — multiplies your XP earnings. All of this feeds into your overall level, achievements, and leaderboard ranking, making fitness a rewarding game.',
  },
  {
    question: 'Can I share my fitness progress with others?',
    answer:
      'Yes! SRE Track has built-in social and community features. You can share workout completions, weight milestones, and personal records to the community feed. Friends can like and comment on your progress, creating a supportive accountability network. You can also compare stats on leaderboards with friends or the global community.',
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

export default function FitnessFeatureClient() {
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/20">
            <Dumbbell className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Fitness Tracker
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Log workouts, track meals with AI macro estimation, monitor your
            weight journey, and earn XP for every step toward your fitness
            goals. {SITE_NAME} makes fitness tracking simple, smart, and
            rewarding.
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
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <feature.icon className="h-5 w-5 text-green-600 dark:text-green-400" />
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
                  <Target className="h-4 w-4 text-green-600 dark:text-green-400" />
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
            Why Track Fitness with {SITE_NAME}?
          </h2>
          <GlassCard variant="liquid" className="p-6">
            <ul className="space-y-3">
              {benefits.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-start gap-3 text-sm leading-relaxed"
                >
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600 dark:text-green-400 shrink-0" />
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
              { href: '/features/leaderboards', label: 'Leaderboards' },
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
            <Flame className="h-10 w-10 mx-auto text-green-600 dark:text-green-400" />
            <h2 className="text-2xl font-bold">
              Start Your Fitness Journey Today
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Join thousands of users who track workouts, log meals, and earn XP
              on {SITE_NAME}. It is free, fun, and built to keep you consistent.
              Your fitness goals deserve a tracker that works as hard as you do.
            </p>
            <Button
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white"
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
