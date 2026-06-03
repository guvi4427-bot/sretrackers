'use client';

import { GlassCard } from '@/components/glass-card';
import { Button } from '@/components/ui/button';
import { SITE_NAME } from '@/lib/site-config';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Users,
  FolderOpen,
  MessageCircle,
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
    icon: Users,
    title: 'Study Group Creation & Discovery',
    description:
      'StudiCate will let you create study groups for any topic or join existing ones that match your learning goals. Groups can be public (discoverable by anyone) or private (invite-only). Each group has a dedicated page with a description, focus topics, member list, and shared resources. The discovery system recommends groups based on your current learning topics and interests — if you are studying JavaScript, you will see JavaScript study groups. If you are preparing for a certification exam, you will find groups focused on that specific exam. No more studying in isolation when a community of learners is just a search away.',
  },
  {
    icon: BookOpen,
    title: 'Shared Study Sessions',
    description:
      'The core of StudiCate is shared study sessions where group members study together in real time. Schedule a group study session and members receive notifications to join. During the session, a shared timer tracks the collective focus time, and all participants earn XP simultaneously. The virtual study room creates accountability — you are less likely to get distracted when others are studying alongside you. After the session, the group can debrief together, discuss challenging concepts, and log what was covered. Shared sessions make studying social, focused, and fun.',
  },
  {
    icon: FolderOpen,
    title: 'Resource Sharing & Knowledge Base',
    description:
      'Every study group will have a shared resource library where members can save links, documents, notes, and recommendations. Found a great tutorial? Share it with the group. Created a summary of chapter 5? Upload it to the knowledge base. The shared library becomes a collective brain that benefits everyone, especially new members who can immediately access the best resources the group has curated over time. Resources can be upvoted by members, so the most useful materials float to the top. No more digging through bookmarks and chat history to find that one link someone shared three weeks ago.',
  },
  {
    icon: MessageCircle,
    title: 'Group Chat & Discussion',
    description:
      'Each study group will have a dedicated discussion space for questions, explanations, and conversation. Stuck on a concept? Post a question and get help from group members who have already mastered it. Understand something well? Answer questions and reinforce your own learning by teaching others. The discussion space supports threaded conversations so topics stay organized. Group moderators can pin important discussions, schedule study sessions, and manage the resource library. The chat creates a persistent learning community that exists beyond individual study sessions.',
  },
];

const useCases = [
  {
    title: 'The Self-Learner Seeking Community',
    description:
      'You are learning to code on your own through online courses and documentation, and it gets lonely. StudiCate study groups connect you with other self-learners on the same path. Join a JavaScript study group, attend shared study sessions, ask questions when you are stuck, and help others when you understand something they do not. The social element transforms isolated learning into a collaborative experience that keeps you motivated and helps you learn faster through teaching and discussion.',
  },
  {
    title: 'The Exam Preparation Squad',
    description:
      'You and your classmates are preparing for the same certification exam. Create a private StudiCate study group, schedule daily study sessions leading up to the exam, share practice questions and resources, and hold each other accountable to the study plan. The group XP system rewards consistent attendance and contribution, making exam prep feel less like a grind and more like a team mission. When exam day comes, you are prepared — and you did it together.',
  },
  {
    title: 'The Language Learning Circle',
    description:
      'You are learning a new language and need conversation practice and cultural context that textbooks cannot provide. A StudiCate language study group brings together learners at similar levels for practice sessions, vocabulary challenges, and resource sharing. The group format means you always have study partners available, and the scheduled sessions ensure you practice consistently rather than sporadically. Group members share native language insights and learning strategies that accelerate everyone\'s progress.',
  },
  {
    title: 'The Accountability-Focused Learner',
    description:
      'You know you study better when others are watching. StudiCate provides exactly the social accountability you need. Join a study group and commit to attending three shared sessions per week. When you skip, your absence is visible. When you show up, your consistency earns group XP and the respect of your peers. The gentle pressure of group expectations, combined with the gamification of study sessions, creates a powerful motivation system that transforms good intentions into actual study hours.',
  },
];

const benefits = [
  'Study group discovery connects you with learners on the same topic',
  'Shared study sessions create real-time accountability and focus',
  'Resource libraries become a curated knowledge base for every group',
  'Discussion spaces enable questions, explanations, and peer teaching',
  'Group XP and achievements reward collaborative learning',
  'Scheduled sessions ensure consistent study habits',
  'Private and public groups for different learning contexts',
  'Completely free — no premium group features or limits',
];

const faqs = [
  {
    question: 'When will StudiCate be available?',
    answer:
      'StudiCate is currently in the planning phase. We are designing the group infrastructure, shared session mechanics, and resource management system that will make collaborative learning seamless on SRE Track. While we do not have a specific launch date, you can start building your learning track record now — your study sessions and topic progress will integrate naturally with StudiCate when it launches. Follow our blog for development updates and early access opportunities.',
  },
  {
    question: 'How many members can a study group have?',
    answer:
      'We are designing StudiCate to support groups of various sizes. Small focused groups of 3-5 members will work well for intensive study, while larger groups of 20-50 can serve as topic communities with multiple sub-sessions. The platform will likely support groups up to 100 members. The key is that group size affects the experience — smaller groups enable deeper interaction, while larger groups offer more diverse perspectives and flexible scheduling. You can choose the group size that fits your learning style.',
  },
  {
    question: 'Will study groups earn collective XP?',
    answer:
      'Yes! StudiCate will feature a group XP system where the group earns XP collectively based on member participation, session attendance, and resource contributions. Individual members also earn their own XP from study sessions, so group participation accelerates your personal progression while contributing to the group total. Group achievements — like completing 50 shared study hours or maintaining a 30-day group streak — will unlock special badges that all members can display on their profiles.',
  },
  {
    question: 'Can I be in multiple study groups at once?',
    answer:
      'Absolutely. You can join multiple study groups across different topics. You might be in a JavaScript study group, a fitness certification prep group, and a language learning circle simultaneously. Each group has its own schedule, resources, and discussion space, so there is no confusion between them. Your study session data flows into your personal analytics regardless of which group you are studying with, giving you a complete picture of your learning activity.',
  },
  {
    question: 'How will group moderation work?',
    answer:
      'Each study group will have at least one group moderator — typically the group creator or someone they designate. Moderators can manage group settings, approve membership requests, schedule study sessions, pin important discussions, and curate the resource library. For larger groups, multiple moderators can share responsibilities. Group members can also report inappropriate content or behavior, and SRE Track community guidelines apply to all group interactions. The goal is to keep study groups productive, supportive, and focused on learning.',
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

export default function StudicateFutureFeatureClient() {
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
            <Clock className="h-4 w-4 text-pink-600 dark:text-pink-400" />
            <span className="text-pink-700 dark:text-pink-300">Upcoming Feature — Currently in Development</span>
          </div>
        </GlassCard>

        {/* Header */}
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500/20 to-fuchsia-500/20 border border-pink-500/20">
            <BookOpen className="h-8 w-8 text-pink-600 dark:text-pink-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            StudiCate
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Collaborative study groups where users learn together, share
            resources, hold each other accountable, and earn group XP. Form or
            join study groups for any topic on {SITE_NAME} — coming soon.
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
                  <div className="p-2 rounded-lg bg-pink-500/10">
                    <feature.icon className="h-5 w-5 text-pink-600 dark:text-pink-400" />
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
            How StudiCate Will Help You
          </h2>
          <div className="space-y-4">
            {useCases.map((useCase) => (
              <GlassCard key={useCase.title} variant="default" className="p-6 space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Target className="h-4 w-4 text-pink-600 dark:text-pink-400" />
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
            Why StudiCate Matters
          </h2>
          <GlassCard variant="liquid" className="p-6">
            <ul className="space-y-3">
              {benefits.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-start gap-3 text-sm leading-relaxed"
                >
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-pink-600 dark:text-pink-400 shrink-0" />
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
              { href: '/features/learning', label: 'Learning Tracker' },
              { href: '/features/community', label: 'Community & Social' },
              { href: '/features/gamification', label: 'Gamification & XP' },
              { href: '/features/ai', label: 'AI Assistants' },
              { href: '/features/analytics', label: 'Progress Analytics' },
              { href: '/features/mentolance-future', label: 'MentoLance (Upcoming)' },
              { href: '/blog', label: 'Blog & Updates' },
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
            <Rocket className="h-10 w-10 mx-auto text-pink-600 dark:text-pink-400" />
            <h2 className="text-2xl font-bold">
              Get Ready for StudiCate
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
              StudiCate is coming to {SITE_NAME}. Start logging study sessions
              now — your learning history will integrate with study groups from
              day one. Join the platform today and be first in line when
              collaborative learning launches. Free forever.
            </p>
            <Button
              size="lg"
              className="bg-pink-600 hover:bg-pink-700 text-white"
              onClick={() => router.push('/signup')}
            >
              Start Tracking Your Learning
            </Button>
          </GlassCard>
        </section>
      </div>
    </div>
  );
}
