'use client';

import { GlassCard } from '@/components/glass-card';
import { Button } from '@/components/ui/button';
import { SITE_NAME } from '@/lib/site-config';
import { useRouter } from 'next/navigation';
import {
  BarChart3,
  TrendingUp,
  CalendarRange,
  Lightbulb,
  ArrowLeft,
  Target,
  Eye,
  CheckCircle2,
  ChevronDown,
  Link2,
} from 'lucide-react';
import { useState } from 'react';

const features = [
  {
    icon: BarChart3,
    title: 'Visual Progress Charts',
    description:
      'See your self-improvement journey come alive through beautiful, interactive charts. Weight trend lines that smooth out daily noise to show the real trajectory. Workout volume charts that prove you are getting stronger. Study hour bar graphs that reveal your most productive days. Content output timelines that visualize your creative consistency. Every chart is interactive — hover for details, zoom into specific time ranges, and toggle between daily, weekly, monthly, and yearly views. The charts are not just pretty — they are tools for understanding your growth at a glance.',
  },
  {
    icon: CalendarRange,
    title: 'Weekly Summary Reports',
    description:
      'Every week, receive a comprehensive summary of your activity across all categories. The weekly report includes total XP earned, workouts completed, study hours logged, content published, and focus sessions finished. It compares this week to last week, highlights streaks maintained or broken, and flags areas where activity declined. The summary also includes your consistency score — a single metric that captures how reliably you showed up this week. Weekly summaries arrive every Sunday and are archived so you can look back and see how far you have come.',
  },
  {
    icon: TrendingUp,
    title: 'Trend Analysis & Patterns',
    description:
      'Go beyond individual data points to discover the trends that define your growth. Are your workouts getting more intense over time? Is your study consistency improving month over month? Are you publishing more content now than three months ago? The trend analysis engine identifies these patterns automatically and presents them clearly. It also detects correlations — for example, you might discover that your most productive study days follow morning workout sessions. These insights are impossible to see without analytics, and they can transform how you approach your self-improvement.',
  },
  {
    icon: Lightbulb,
    title: 'AI-Powered Insights',
    description:
      'The analytics engine goes beyond displaying data — it interprets it. AI-generated insights highlight notable patterns, flag potential issues, and suggest specific actions. "Your workout frequency has increased 20% this month, but your average session duration decreased — consider adding 10 minutes per session." "You study most effectively on Tuesday and Thursday mornings — protect those time blocks." These are not generic tips. They are data-driven recommendations based on your unique patterns and history. The AI makes your data actionable instead of just visual.',
  },
];

const useCases = [
  {
    title: 'The Data-Driven Self-Improver',
    description:
      'You believe what gets measured gets managed, and you want hard data to validate your effort. SRE Track analytics gives you the charts, trends, and numbers you crave. Watch your workout volume climb over 12 weeks. See your study hours double from month one to month three. Prove to yourself that the effort is working with data that does not lie. When motivation wavers, the data reminds you that progress is real even when it feels slow.',
  },
  {
    title: 'The Plateau Buster',
    description:
      'You have been working hard but feel stuck. The analytics dashboard reveals what your feelings cannot. Maybe your weight has not changed in three weeks, but your workout volume is up 15% and your body measurements show you are losing inches. The scale is not the whole story, and the analytics prove it. Trend analysis might also reveal that you started sleeping less or skipping meals recently — subtle changes that explain the plateau and point to specific adjustments.',
  },
  {
    title: 'The Reflective Reviewer',
    description:
      'You love the weekly summary ritual — sitting down on Sunday evening to review the week that was and plan the week ahead. The weekly report gives you a complete snapshot: what went well, what slipped, and where you stand against your goals. This reflective practice, enabled by clear analytics, is one of the most powerful habits for sustained self-improvement. Without data, review is just guesswork. With data, it is strategic planning.',
  },
  {
    title: 'The Pattern Seeker',
    description:
      'You suspect there are patterns in your behavior that you cannot see from day to day. The correlation engine in SRE Track analytics confirms or denies your hunches. Do you eat better on workout days? Are you more productive after studying? Does your content output spike at certain times of the month? The analytics surface these connections so you can design your schedule around what works and avoid what does not.',
  },
];

const benefits = [
  'Beautiful interactive charts that make progress visible and motivating',
  'Weekly summaries that create a ritual of reflection and planning',
  'Trend analysis that reveals long-term patterns invisible in daily data',
  'AI-powered insights that turn data into actionable recommendations',
  'Cross-category analytics that show how fitness, learning, content, and productivity connect',
  'Consistency scoring that captures the most important metric — showing up',
  'Completely free analytics with no premium paywall for advanced charts',
  'Data export capability so you own your information',
];

const faqs = [
  {
    question: 'What types of charts are available?',
    answer:
      'SRE Track offers line charts for trends over time, bar charts for weekly and monthly comparisons, heatmaps for daily activity patterns, pie charts for category breakdowns, and scatter plots for correlation analysis. Each chart is interactive with hover details, zoom controls, and time range selectors. You can view data across daily, weekly, monthly, and yearly timeframes.',
  },
  {
    question: 'How is the consistency score calculated?',
    answer:
      'The consistency score is a composite metric that measures how reliably you engage with your tracked activities. It factors in streak maintenance, daily activity frequency, goal completion rate, and variance in daily effort. A score of 100 means you hit every target every day. Most users score between 60 and 85, and improvements in consistency directly correlate with XP multiplier increases. It is designed to reward steady effort over sporadic intensity.',
  },
  {
    question: 'Can I compare my analytics with friends?',
    answer:
      'Yes, with mutual consent. You and a friend can enable comparison mode to see side-by-side analytics for specific categories. This is popular among accountability partners who want to see how their weeks compare. All comparison data is shared only between the two users who opt in. There is no public comparison feature — your detailed analytics remain private unless you explicitly share them.',
  },
  {
    question: 'How far back can I view my analytics?',
    answer:
      'All your historical data is available for analysis from the day you started using SRE Track. There is no time limit or data retention window. Weekly summaries are archived indefinitely, and you can view charts spanning your entire journey on the platform. The longer you use SRE Track, the more valuable your analytics become as long-term trends and patterns emerge.',
  },
  {
    question: 'Can I export my data?',
    answer:
      'Yes. You can export your activity data, analytics reports, and weekly summaries in CSV format. This ensures you own your data and can analyze it in external tools if you choose. The export includes all logged activities, XP history, streak data, and achievement records. We believe your data belongs to you, always.',
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

export default function AnalyticsFeatureClient() {
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500/20 to-blue-500/20 border border-sky-500/20">
            <BarChart3 className="h-8 w-8 text-sky-600 dark:text-sky-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Progress Analytics
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            See your growth story in data. Visual charts, trend analysis, and
            AI-powered insights across fitness, learning, content, and
            productivity. {SITE_NAME} analytics makes progress visible,
            measurable, and actionable.
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
                  <div className="p-2 rounded-lg bg-sky-500/10">
                    <feature.icon className="h-5 w-5 text-sky-600 dark:text-sky-400" />
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
                  <Target className="h-4 w-4 text-sky-600 dark:text-sky-400" />
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
            Why Analytics Matter on {SITE_NAME}
          </h2>
          <GlassCard variant="liquid" className="p-6">
            <ul className="space-y-3">
              {benefits.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-start gap-3 text-sm leading-relaxed"
                >
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-sky-600 dark:text-sky-400 shrink-0" />
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
              { href: '/features/fitness', label: 'Fitness Tracker' },
              { href: '/features/learning', label: 'Learning Tracker' },
              { href: '/features/content', label: 'Content Creation Tracker' },
              { href: '/features/productivity', label: 'Productivity Tracker' },
              { href: '/features/gamification', label: 'Gamification & XP' },
              { href: '/features/ai', label: 'AI Assistants' },
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
            <Eye className="h-10 w-10 mx-auto text-sky-600 dark:text-sky-400" />
            <h2 className="text-2xl font-bold">
              See Your Growth Story
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Your effort deserves to be seen. Visual charts, trend analysis, and
              AI insights on {SITE_NAME} make your progress undeniable. Start
              tracking and watch your data tell a story of consistent growth.
              Free forever.
            </p>
            <Button
              size="lg"
              className="bg-sky-600 hover:bg-sky-700 text-white"
              onClick={() => router.push('/signup')}
            >
              View Your Analytics
            </Button>
          </GlassCard>
        </section>
      </div>
    </div>
  );
}
