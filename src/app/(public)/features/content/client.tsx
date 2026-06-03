'use client';

import { GlassCard } from '@/components/glass-card';
import { Button } from '@/components/ui/button';
import { SITE_NAME } from '@/lib/site-config';
import { useRouter } from 'next/navigation';
import {
  PenTool,
  Video,
  FileText,
  BarChart3,
  ArrowLeft,
  Target,
  Zap,
  CheckCircle2,
  ChevronDown,
  Link2,
} from 'lucide-react';
import { useState } from 'react';

const features = [
  {
    icon: PenTool,
    title: 'Content Pipeline Management',
    description:
      'Organize every piece of content in a visual pipeline that moves from Idea to Drafting to Editing to Review to Published. See all your content at a glance with live status badges that update in real time. Never lose track of a half-finished blog post or an unedited video again. The pipeline view gives you a complete picture of your content universe and helps you prioritize what needs attention next.',
  },
  {
    icon: Video,
    title: 'Multi-Format Content Tracking',
    description:
      'Track blog posts, YouTube videos, podcast episodes, social media posts, newsletters, and more — all in one place. Each content type has tailored fields and status stages that match its unique production workflow. A blog post moves through ideation, outlining, drafting, editing, and publishing. A video goes through scripting, filming, editing, thumbnail creation, and uploading. Whatever you create, there is a workflow for it.',
  },
  {
    icon: BarChart3,
    title: 'Live Status Progression',
    description:
      'Watch your content move through production stages with a live visual progression bar. Each stage transition is tracked with timestamps so you can see exactly how long each piece of content spends in each phase. Use this data to identify bottlenecks in your workflow — are you spending too long in editing? Is the ideation phase dragging? The live status view makes your production process transparent and measurable.',
  },
  {
    icon: FileText,
    title: 'Creator Analytics & Insights',
    description:
      'Understand your content production patterns with analytics built for creators. See how many pieces you publish per week, your average production time from idea to published, which content types you produce most, and your consistency score over time. These insights help you set realistic publishing schedules, identify your most productive periods, and steadily improve your output and quality.',
  },
];

const useCases = [
  {
    title: 'The Consistent Blogger',
    description:
      'You want to publish two blog posts per week but often lose track of drafts and ideas scattered across notebooks and apps. With SRE Track, every idea enters the pipeline immediately. You see exactly which posts are in drafting, which need editing, and which are ready to publish. The visual pipeline keeps you accountable, and the publishing streak XP motivates you to maintain your schedule week after week.',
  },
  {
    title: 'The YouTube Creator',
    description:
      'Managing a YouTube channel means juggling scripts, footage, edits, thumbnails, and upload schedules simultaneously. SRE Track gives you a dedicated video production workflow that tracks each video from concept through every production stage. You can see at a glance which videos are in filming, which are being edited, and which are queued for upload. No more forgotten footage or missed upload days.',
  },
  {
    title: 'The Multi-Platform Content Creator',
    description:
      'You create content across blogs, YouTube, Twitter, and a newsletter — and keeping it all organized feels impossible. SRE Track unifies every content type in one dashboard. Plan cross-platform content campaigns, see which platforms are lagging, and ensure every channel gets consistent attention. The unified pipeline view means you never have to wonder what needs attention next.',
  },
  {
    title: 'The Aspiring Writer',
    description:
      'You are building a writing habit and want to see your progress accumulate over time. Log every writing session, track articles from first draft to final publication, and watch your output grow week by week. The gamification system turns writing into a rewarding activity — earn XP for every draft completed, every piece published, and every writing streak maintained. Writing stops being a chore and becomes a game you look forward to playing.',
  },
];

const benefits = [
  'Unified pipeline for all content types — blogs, videos, social posts, newsletters, and podcasts',
  'Live status progression shows exactly where every piece of content stands',
  'Tailored workflows for different content formats match your real production process',
  'Creator analytics reveal production patterns and help you optimize your workflow',
  'Gamified publishing rewards with XP, streaks, and achievements keep you consistent',
  'Completely free with no premium tiers or locked features',
  'Mobile-friendly interface lets you update content status from anywhere',
  'Connects seamlessly with other SRE Track features like learning and fitness tracking',
];

const faqs = [
  {
    question: 'What content types can I track?',
    answer:
      'SRE Track supports tracking for blog posts, YouTube videos, podcast episodes, social media posts (Twitter, Instagram, LinkedIn, TikTok), newsletters, and custom content types. Each format has a tailored workflow with stages specific to its production process. You can also create custom content types with your own defined stages if you have a unique workflow.',
  },
  {
    question: 'How does the live status progression work?',
    answer:
      'Each content item moves through defined stages in a pipeline — for example, Idea → Drafting → Editing → Review → Published. When you update a piece of content to the next stage, the progression bar updates instantly and records the timestamp. You can see how long each piece has been in each stage and identify bottlenecks in your workflow. The progression is visual, so you always know exactly where everything stands.',
  },
  {
    question: 'Can I collaborate with other creators on SRE Track?',
    answer:
      'Yes! SRE Track includes community and social features that support collaboration. You can share your content pipeline with co-creators, assign stages to team members, and track collaborative projects together. The community feed also lets you share published content and get feedback from other creators.',
  },
  {
    question: 'How does content tracking earn XP?',
    answer:
      'You earn XP for completing key content production milestones: moving a piece to the Drafting stage, completing a first draft, finishing edits, and especially for publishing. Publishing content earns the most XP and also extends your creator streak. Maintaining a consistent publishing schedule triggers streak bonuses that multiply your XP earnings, rewarding consistency above all else.',
  },
  {
    question: 'Is the Content Creation Tracker suitable for professional creators?',
    answer:
      'Absolutely. While SRE Track is free and accessible to beginners, the pipeline management, analytics, and workflow customization are robust enough for professional creators who need to manage high-volume content production. Many features were designed with full-time creators in mind, including detailed production time tracking, consistency analytics, and cross-platform campaign management.',
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

export default function ContentFeatureClient() {
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/20">
            <PenTool className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Content Creation Tracker
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Manage your entire content pipeline from idea to published. Track
            blogs, videos, podcasts, and social posts with live status
            progression and earn XP for every piece you ship. {SITE_NAME} turns
            content creation into a rewarding game.
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
                  <div className="p-2 rounded-lg bg-orange-500/10">
                    <feature.icon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
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
                  <Target className="h-4 w-4 text-orange-600 dark:text-orange-400" />
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
            Why Track Content with {SITE_NAME}?
          </h2>
          <GlassCard variant="liquid" className="p-6">
            <ul className="space-y-3">
              {benefits.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-start gap-3 text-sm leading-relaxed"
                >
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-orange-600 dark:text-orange-400 shrink-0" />
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
              { href: '/features/ai', label: 'AI Assistants' },
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
            <Zap className="h-10 w-10 mx-auto text-orange-600 dark:text-orange-400" />
            <h2 className="text-2xl font-bold">
              Ship More Content, Earn More XP
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Join creators who manage their content pipeline with {SITE_NAME}.
              Track every piece from idea to published, earn XP for shipping, and
              build the consistency that grows your audience. Free forever.
            </p>
            <Button
              size="lg"
              className="bg-orange-600 hover:bg-orange-700 text-white"
              onClick={() => router.push('/signup')}
            >
              Start Creating
            </Button>
          </GlassCard>
        </section>
      </div>
    </div>
  );
}
