'use client';

import { GlassCard } from '@/components/glass-card';
import { Button } from '@/components/ui/button';
import { SITE_NAME } from '@/lib/site-config';
import { useRouter } from 'next/navigation';
import {
  Clock,
  ListTodo,
  CalendarDays,
  Brain,
  ArrowLeft,
  Target,
  Rocket,
  CheckCircle2,
  ChevronDown,
  Link2,
} from 'lucide-react';
import { useState } from 'react';

const features = [
  {
    icon: Clock,
    title: 'Focus Session Timer',
    description:
      'Start a focus session and dive into deep work. The timer supports Pomodoro-style intervals, custom session lengths, and break reminders. Track how many focus hours you log each day, week, and month. Every completed focus session earns XP proportional to its duration, rewarding sustained concentration. The timer runs cleanly in the background so you can focus on what matters without distractions.',
  },
  {
    icon: ListTodo,
    title: 'Task Tracking & Management',
    description:
      'Create tasks with priorities, deadlines, and categories. Organize your to-do list into today, upcoming, and backlog views. Mark tasks complete with a satisfying check-off that earns instant XP. Track your task completion rate over time and watch your productivity score climb. The task system integrates with focus sessions — start a focus session specifically for a task and log exactly how long it took to finish.',
  },
  {
    icon: CalendarDays,
    title: 'Day Planning & Scheduling',
    description:
      'Plan your day intentionally every morning. Drag tasks into time blocks, schedule focus sessions in advance, and set daily goals for what you want to accomplish. The day planner gives you a clear roadmap so you never sit down at your desk wondering what to work on first. At the end of each day, review what you completed versus what you planned and earn bonus XP for hitting your daily targets.',
  },
  {
    icon: Brain,
    title: 'Focus Analytics & Insights',
    description:
      'Understand your productivity patterns with detailed analytics. See which days of the week you are most focused, what times of day yield the best sessions, and how your focus time trends over weeks and months. These insights help you schedule important work during your peak hours and protect your most productive time blocks from interruptions. Knowledge of your own patterns is the foundation of lasting productivity improvement.',
  },
];

const useCases = [
  {
    title: 'The Deep Work Practitioner',
    description:
      'You believe in the power of deep, uninterrupted focus sessions but struggle to maintain consistency. SRE Track gives you a dedicated focus timer that logs every session, tracks your weekly deep work hours, and rewards sustained concentration with XP. The analytics show you when you do your best work, and the streak system makes you want to protect your focus time day after day.',
  },
  {
    title: 'The Overwhelmed Student',
    description:
      'You have assignments, exam prep, readings, and projects all competing for attention. SRE Track lets you capture every task, prioritize what matters most, and schedule focus sessions for each subject. The day planner ensures nothing falls through the cracks, and the XP system turns studying into a game where every completed task feels like a victory.',
  },
  {
    title: 'The Remote Worker',
    description:
      'Working from home blurs the line between work and personal time. SRE Track helps you set clear boundaries with structured focus sessions and planned breaks. Log your productive hours, track when you actually stop working each day, and use the day planner to create a routine that respects both your work goals and your need for rest. The XP system rewards balance as much as intensity.',
  },
  {
    title: 'The Side Project Builder',
    description:
      'You are building a side project alongside a full-time job and need to make every spare minute count. SRE Track helps you plan focused work blocks in the evenings and weekends, track tasks specific to your project, and see how many hours per week you are actually investing. The streak system keeps you showing up even on days when motivation is low, and the progress analytics prove that small consistent efforts add up over time.',
  },
];

const benefits = [
  'Built-in focus timer with Pomodoro and custom session support',
  'Task management with priorities, deadlines, and categories',
  'Day planner that turns vague intentions into concrete schedules',
  'Focus analytics reveal your most productive patterns and peak hours',
  'Gamified with XP, streaks, and achievements to make productivity addictive',
  'Completely free — no premium paywalls for timer or planning features',
  'Integrates with fitness, learning, and content tracking for whole-life productivity',
  'Mobile-friendly for planning and tracking on the go',
];

const faqs = [
  {
    question: 'Does the focus timer support the Pomodoro Technique?',
    answer:
      'Yes! The focus timer supports traditional Pomodoro intervals — 25 minutes of focus followed by a 5-minute break, with a longer 15-minute break after four sessions. You can also customize session and break lengths to fit your personal rhythm. Whether you prefer 25-minute sprints or 50-minute deep work blocks, the timer adapts to your style.',
  },
  {
    question: 'How do tasks connect to focus sessions?',
    answer:
      'You can link a focus session to a specific task. When you start a focus session, optionally select the task you are working on. When the session ends, the time is automatically logged against that task. This gives you precise data on how long tasks actually take versus your estimates, helping you plan more accurately over time.',
  },
  {
    question: 'Can I plan my week in advance, not just my day?',
    answer:
      'Yes. While the day planner focuses on today, you can also create tasks with future due dates and schedule focus sessions for upcoming days. The weekly view shows your planned workload at a glance, and the analytics track whether you are hitting your weekly goals. Planning ahead and following through earns you weekly consistency bonuses.',
  },
  {
    question: 'How much XP do I earn for focus sessions?',
    answer:
      'XP scales with the duration of your focus session. A standard 25-minute Pomodoro earns base XP, while longer deep work sessions of 50 or 90 minutes earn proportionally more. Completing tasks also earns XP, and hitting daily or weekly targets triggers bonus XP. Your focus streak — consecutive days with at least one focus session — multiplies all productivity XP earnings.',
  },
  {
    question: 'Is this suitable for team productivity tracking?',
    answer:
      'SRE Track is primarily designed for individual productivity, but community features let you share focus achievements and compare productivity stats with friends. Team-specific features like shared task boards and collaborative planning are on the roadmap. For now, it excels as a personal productivity companion that keeps you accountable through gamification and social motivation.',
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

export default function ProductivityFeatureClient() {
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/20">
            <Clock className="h-8 w-8 text-violet-600 dark:text-violet-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Productivity Tracker
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Master your time with focus sessions, task tracking, and daily
            planning. {SITE_NAME} gamifies productivity so every focused hour
            earns XP and every completed task moves you forward.
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
                  <div className="p-2 rounded-lg bg-violet-500/10">
                    <feature.icon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
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
                  <Target className="h-4 w-4 text-violet-600 dark:text-violet-400" />
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
            Why Track Productivity with {SITE_NAME}?
          </h2>
          <GlassCard variant="liquid" className="p-6">
            <ul className="space-y-3">
              {benefits.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-start gap-3 text-sm leading-relaxed"
                >
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-violet-600 dark:text-violet-400 shrink-0" />
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
              { href: '/features/ai', label: 'AI Assistants' },
              { href: '/features/analytics', label: 'Progress Analytics' },
              { href: '/features/learning', label: 'Learning Tracker' },
              { href: '/features/fitness', label: 'Fitness Tracker' },
              { href: '/features/achievements', label: 'Achievement System' },
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
            <Rocket className="h-10 w-10 mx-auto text-violet-600 dark:text-violet-400" />
            <h2 className="text-2xl font-bold">
              Own Your Time, Level Up Your Day
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Start tracking focus sessions, completing tasks, and planning your
              days with {SITE_NAME}. Every productive minute earns XP. Free,
              gamified, and built to make consistency effortless.
            </p>
            <Button
              size="lg"
              className="bg-violet-600 hover:bg-violet-700 text-white"
              onClick={() => router.push('/signup')}
            >
              Start Being Productive
            </Button>
          </GlassCard>
        </section>
      </div>
    </div>
  );
}
