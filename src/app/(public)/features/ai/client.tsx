'use client';

import { GlassCard } from '@/components/glass-card';
import { Button } from '@/components/ui/button';
import { SITE_NAME } from '@/lib/site-config';
import { useRouter } from 'next/navigation';
import {
  Bot,
  MessageSquare,
  ScanSearch,
  Utensils,
  ArrowLeft,
  Target,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  Link2,
} from 'lucide-react';
import { useState } from 'react';

const features = [
  {
    icon: MessageSquare,
    title: 'Smart AI Chatbot',
    description:
      'Ask the AI chatbot anything about your self-growth journey — from workout recommendations to study strategies to productivity tips. The chatbot understands your context: your current streaks, recent activities, goals, and XP level. It does not give generic advice. It gives you personalized guidance based on your actual data. Need motivation? Ask for it. Stuck on what to study next? The AI can suggest topics based on your learning history. It is like having a personal coach who knows everything about your progress.',
  },
  {
    icon: ScanSearch,
    title: 'AI Progress Checks',
    description:
      'The AI progress check feature evaluates your understanding of any topic you have been studying. Tell it what you learned, and it asks targeted questions to gauge your comprehension. It identifies knowledge gaps, suggests areas to revisit, and rates your mastery level. This is not a simple quiz — it is a dynamic assessment that adapts based on your responses and your learning history on the platform. Use progress checks after study sessions to solidify knowledge and earn bonus XP for demonstrated understanding.',
  },
  {
    icon: Utensils,
    title: 'AI Macro Estimation',
    description:
      'Describe your meal in plain language and let AI estimate the macros instantly. "Chicken stir-fry with vegetables and rice" becomes a detailed breakdown of protein, carbs, fats, and calories. The AI considers typical portion sizes and preparation methods. It learns from your corrections over time, so the more you use it, the more accurate it becomes. This eliminates the most tedious part of nutrition tracking and makes meal logging something you actually want to do instead of something you dread.',
  },
  {
    icon: Bot,
    title: 'AI Script Review for Creators',
    description:
      'Content creators can submit draft scripts to the AI for review. The AI analyzes your script for clarity, engagement hooks, pacing, and SEO optimization. It suggests improvements for titles, intros, and calls to action. Whether you are writing a YouTube script, a blog post outline, or a social media thread, the AI helps you refine your message before you invest time in production. Think of it as a first-pass editor that catches weak spots and amplifies your strongest points.',
  },
];

const useCases = [
  {
    title: 'The Self-Taught Learner',
    description:
      'You are learning programming on your own and have no one to check if you really understand the concepts. Use the AI progress check after each study session. The AI asks questions that test your grasp of the material, identifies gaps in your understanding, and suggests specific topics to revisit. It is like having a tutor available 24/7 who already knows what you have studied and where you might be struggling.',
  },
  {
    title: 'The Meal Prep Enthusiast',
    description:
      'You meal prep every Sunday but hate calculating macros for each container. With AI macro estimation, just describe your meal prep — "six ounces of grilled salmon with a cup of quinoa and roasted asparagus" — and get instant nutritional data. Save your common meals for even faster logging next time. The AI remembers your typical portions and gets more accurate with every use.',
  },
  {
    title: 'The YouTube Creator Who Writes Their Own Scripts',
    description:
      'You write all your video scripts but sometimes wonder if the intro is engaging enough or the pacing drags in the middle. Submit your draft to the AI script reviewer and get specific, actionable feedback. The AI points out where viewers might drop off, suggests stronger hooks, and helps you tighten your narrative. It does not rewrite your script — it makes your writing better while keeping your voice intact.',
  },
  {
    title: 'The Consistency Seeker',
    description:
      'You start strong every January but lose momentum by February. The AI chatbot knows your history — every streak you have started and broken, every goal you have set and abandoned. Ask it for motivation, and it does not give you generic quotes. It reminds you of your specific progress, highlights how close you are to your next milestone, and suggests a minimal achievable action for today. The AI meets you where you are, not where you wish you were.',
  },
];

const benefits = [
  'AI chatbot that understands your personal context and history — not generic advice',
  'Progress checks that validate learning and identify knowledge gaps in real time',
  'Macro estimation that saves 10+ minutes per day on nutrition tracking',
  'Script review that helps creators improve content before publishing',
  'All AI features are free — no premium AI tier or usage limits',
  'AI learns from your data and gets more personalized over time',
  'Earn bonus XP for completing AI progress checks and using AI features',
  'Seamlessly integrated with all tracking features — fitness, learning, content, productivity',
];

const faqs = [
  {
    question: 'How does the AI know my personal context?',
    answer:
      'The AI has access to your activity data on SRE Track — your logged workouts, study sessions, meals, content production, streaks, and goals. When you ask a question, the AI uses this context to give you personalized advice. For example, if you ask about workout recommendations, it considers your recent training history, not generic fitness tips. Your data stays private and is only used to improve your experience.',
  },
  {
    question: 'Is the AI macro estimation accurate?',
    answer:
      'The AI macro estimation provides reliable estimates based on nutritional databases and typical portion sizes. It is designed for quick, convenient logging — not clinical precision. For most users, the estimates are accurate enough for effective macro tracking. You can always adjust the estimates if you weigh your food precisely, and the AI learns from your corrections to improve future estimates.',
  },
  {
    question: 'What can the AI chatbot help with?',
    answer:
      'The chatbot can help with a wide range of self-growth topics: workout programming, study strategies, productivity techniques, meal planning suggestions, motivation and mindset coaching, goal setting, and streak recovery strategies. It can also explain features of SRE Track and help you get the most out of the platform. Think of it as a knowledgeable friend who always has time to help.',
  },
  {
    question: 'Are there limits on how much I can use the AI features?',
    answer:
      'No. All AI features on SRE Track are free and unlimited. There are no usage caps, no premium tiers for AI access, and no paywalls. We believe AI should enhance everyone\'s self-growth journey equally, regardless of their ability to pay. Use the chatbot, progress checks, macro estimation, and script review as much as you need.',
  },
  {
    question: 'How does the AI script review work for content creators?',
    answer:
      'Submit your draft script or outline to the AI, and it analyzes the content for clarity, engagement, pacing, and structure. It identifies weak openings, pacing issues, unclear transitions, and missed opportunities for calls to action. It provides specific suggestions for improvement — not vague feedback like "make it better." The AI understands different content formats and adjusts its review criteria accordingly, whether you are writing a YouTube script, blog post, or social media thread.',
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

export default function AIFeatureClient() {
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-cyan-500/20">
            <Sparkles className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            AI Assistants
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Smart AI that knows your progress, checks your learning, estimates
            your macros, and reviews your scripts. {SITE_NAME} brings
            AI-powered intelligence to every part of your self-growth journey —
            completely free.
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
            Why Use AI on {SITE_NAME}?
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
              { href: '/features/fitness', label: 'Fitness Tracker' },
              { href: '/features/learning', label: 'Learning Tracker' },
              { href: '/features/content', label: 'Content Creation Tracker' },
              { href: '/features/productivity', label: 'Productivity Tracker' },
              { href: '/features/gamification', label: 'Gamification & XP' },
              { href: '/features/analytics', label: 'Progress Analytics' },
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
            <Sparkles className="h-10 w-10 mx-auto text-cyan-600 dark:text-cyan-400" />
            <h2 className="text-2xl font-bold">
              Let AI Accelerate Your Growth
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Experience AI that actually knows your journey. Progress checks,
              macro estimation, script review, and personalized guidance — all
              free on {SITE_NAME}. Your AI-powered self-growth companion is
              waiting.
            </p>
            <Button
              size="lg"
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
              onClick={() => router.push('/signup')}
            >
              Try AI Features Free
            </Button>
          </GlassCard>
        </section>
      </div>
    </div>
  );
}
