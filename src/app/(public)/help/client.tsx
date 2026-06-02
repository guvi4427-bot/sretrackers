'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  HelpCircle, ArrowRight, BookOpen, Dumbbell,
  Zap, Settings, Shield, Users, ChevronRight,
  Rocket, CheckCircle2, AlertCircle, MessageCircle,
  Search, RefreshCw, Key, Smartphone, Globe,
  Sparkles, Target, Brain, Award,
} from 'lucide-react';
import { GlassCard } from '@/components/glass-card';
import { Button } from '@/components/ui/button';
import { SITE_NAME } from '@/lib/site-config';

const GETTING_STARTED_STEPS = [
  { step: 1, title: 'Create Your Account', desc: 'Sign up for free with just an email and username. No credit card required — ever. Your account gives you access to all features including fitness tracking, learning tools, content creation, and the full gamification system.', icon: Rocket },
  { step: 2, title: 'Complete Onboarding', desc: 'Set up your profile, choose your primary goals (fitness, learning, content, or productivity), and customize your preferences. The onboarding process takes about 2 minutes and helps personalize your dashboard and XP recommendations.', icon: Settings },
  { step: 3, title: 'Start Tracking', desc: 'Log your first workout, study session, or content entry. Each action earns XP and starts building your streaks. Try to log at least one activity per day to build consistency — even a quick 5-minute entry counts.', icon: Target },
  { step: 4, title: 'Explore Gamification', desc: 'Check your XP, view achievements, and see your position on the leaderboard. Gamification is designed to keep you motivated — the more consistently you track, the more rewards you earn. Look for the achievement panel to see what milestones are within reach.', icon: Sparkles },
  { step: 5, title: 'Join the Community', desc: 'Follow other users, share your progress, and participate in the social feed. The community is one of the most powerful motivators on the platform. You can also use the AI assistant for personalized tips and recommendations.', icon: Users },
];

const COMMON_ISSUES = [
  {
    category: 'Account & Login',
    icon: Key,
    color: 'text-blue-400',
    bg: 'bg-blue-600/10',
    issues: [
      { q: 'I cannot log in to my account', a: 'Make sure you are using the correct email and password. If you signed up with Google, use the "Sign in with Google" button. You can also try the "Forgot Password" option to reset your credentials via email.' },
      { q: 'How do I change my username?', a: 'Go to Settings → Profile and update your username. Usernames must be unique and between 3-20 characters. Note that changing your username does not affect your XP, streaks, or achievements.' },
      { q: 'How do I delete my account?', a: 'Navigate to Settings → Account → Delete Account. This action is permanent and will remove all your data, including XP, achievements, and content. Please export any data you want to keep before deleting.' },
    ],
  },
  {
    category: 'Tracking & Data',
    icon: RefreshCw,
    color: 'text-emerald-400',
    bg: 'bg-emerald-600/10',
    issues: [
      { q: 'My workout did not save', a: 'Ensure you have a stable internet connection before saving. If the app seems unresponsive, try refreshing the page. Workouts are saved to your profile immediately upon submission. If the issue persists, check your browser console for errors.' },
      { q: 'Streak count seems wrong', a: 'Streaks reset at midnight in your local timezone. Make sure you are logging activities before the daily reset. If you believe there is an error, note the specific dates and contact support for investigation.' },
      { q: 'XP was not awarded', a: 'XP is awarded immediately after completing an action. If you do not see the update, try refreshing the page. Some actions may have a brief delay. If XP is still missing after a few minutes, please report the issue through the feedback form.' },
    ],
  },
  {
    category: 'Technical Issues',
    icon: Smartphone,
    color: 'text-purple-400',
    bg: 'bg-purple-600/10',
    issues: [
      { q: 'The app is slow or not loading', a: 'Try clearing your browser cache and cookies, then reload the page. Ensure you are using a modern browser (Chrome, Firefox, Safari, or Edge). If the issue persists, check our status page for any ongoing maintenance.' },
      { q: 'Notifications are not working', a: 'Make sure browser notifications are enabled in your browser settings. You can also check notification preferences in Settings → Notifications. Mobile users should ensure the browser has notification permissions enabled.' },
      { q: 'Dark mode is not working correctly', a: 'Toggle the theme setting in Settings → Appearance. If the issue persists, try clearing your browser cache. The app supports system-level dark mode detection as well as manual toggle.' },
    ],
  },
];

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export default function HelpClient() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50/80 to-slate-100 dark:from-[#0A0F1E] dark:to-[#0F1A20] relative overflow-hidden">
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-cyan-600/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-blue-600/8 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <motion.div {...fadeIn} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-600/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium mb-4">
            <HelpCircle size={14} /> Support
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Help Center
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Welcome to the {SITE_NAME} Help Center. Whether you are just getting started or troubleshooting an issue, we have the resources to help you make the most of your self-growth journey.
          </p>
        </motion.div>

        {/* Getting Started */}
        <motion.div {...fadeIn} transition={{ delay: 0.1 }} className="mb-10">
          <div className="flex items-center gap-2 mb-6">
            <Rocket size={20} className="text-cyan-400" />
            <h2 className="text-xl font-bold text-foreground">Getting Started</h2>
          </div>
          <div className="space-y-4">
            {GETTING_STARTED_STEPS.map((step, index) => (
              <GlassCard key={step.step} variant="default" className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-600/10 flex items-center justify-center shrink-0 relative">
                    <step.icon size={18} className="text-cyan-400" />
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-cyan-600 text-[10px] font-bold text-white flex items-center justify-center">
                      {step.step}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-1">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                </div>
                {index < GETTING_STARTED_STEPS.length - 1 && (
                  <div className="ml-5 mt-3 border-l-2 border-dashed border-cyan-600/20 h-3" />
                )}
              </GlassCard>
            ))}
          </div>
        </motion.div>

        {/* Common Issues */}
        <motion.div {...fadeIn} transition={{ delay: 0.15 }} className="mb-10">
          <div className="flex items-center gap-2 mb-6">
            <AlertCircle size={20} className="text-amber-400" />
            <h2 className="text-xl font-bold text-foreground">Common Issues & Solutions</h2>
          </div>
          <div className="space-y-6">
            {COMMON_ISSUES.map((category) => (
              <div key={category.category}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-7 h-7 rounded-lg ${category.bg} flex items-center justify-center`}>
                    <category.icon size={14} className={category.color} />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">{category.category}</h3>
                </div>
                <div className="space-y-2 ml-9">
                  {category.issues.map((issue) => (
                    <GlassCard key={issue.q} variant="sm" className="p-4">
                      <p className="text-sm font-medium text-foreground mb-1 flex items-center gap-2">
                        <MessageCircle size={12} className="text-muted-foreground shrink-0" />
                        {issue.q}
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed ml-5">{issue.a}</p>
                    </GlassCard>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div {...fadeIn} transition={{ delay: 0.2 }} className="mb-10">
          <GlassCard variant="liquid" className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Globe size={18} className="text-cyan-400" /> Quick Links
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: 'FAQ', desc: 'Answers to the most common questions about SRE.', path: '/faq', icon: HelpCircle, color: 'text-blue-400' },
                { label: 'Documentation', desc: 'Detailed feature guides and API references.', path: '/docs', icon: BookOpen, color: 'text-purple-400' },
                { label: 'Roadmap', desc: 'See what features are coming next.', path: '/roadmap', icon: Rocket, color: 'text-emerald-400' },
                { label: 'Contact Us', desc: 'Reach our support team directly.', path: '/contact', icon: MessageCircle, color: 'text-amber-400' },
              ].map((link) => (
                <button
                  key={link.label}
                  onClick={() => router.push(link.path)}
                  className="flex items-start gap-3 p-3 rounded-xl bg-accent/20 hover:bg-accent/30 transition-colors text-left"
                >
                  <link.icon size={16} className={`${link.color} shrink-0 mt-0.5`} />
                  <div>
                    <p className="text-sm font-medium text-foreground">{link.label}</p>
                    <p className="text-xs text-muted-foreground">{link.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Tips */}
        <motion.div {...fadeIn} transition={{ delay: 0.25 }} className="mb-10">
          <GlassCard variant="glassmorphism" className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={18} className="text-amber-400" />
              <h2 className="text-lg font-semibold text-foreground">Pro Tips for Success</h2>
            </div>
            <div className="space-y-3">
              {[
                { tip: 'Log activities daily to build unbreakable streaks. Even a 5-minute entry counts toward your consistency.', icon: CheckCircle2 },
                { tip: 'Use the AI assistant for personalized recommendations. It learns your patterns and suggests optimal times for activities.', icon: Brain },
                { tip: 'Focus on one area at a time. Trying to improve everything simultaneously often leads to burnout. Start with fitness OR learning, then expand.', icon: Target },
                { tip: 'Join the community feed for accountability. Sharing your progress publicly creates positive social pressure that keeps you going.', icon: Users },
                { tip: 'Check achievements regularly. Knowing what milestones are close can provide the extra motivation you need to push through.', icon: Award },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-accent/20">
                  <item.icon size={16} className="text-cyan-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.tip}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* CTA */}
        <motion.div {...fadeIn} transition={{ delay: 0.3 }}>
          <GlassCard variant="glowing" className="p-6 text-center">
            <CheckCircle2 size={28} className="mx-auto mb-3 text-cyan-400" />
            <h2 className="text-xl font-bold text-foreground mb-2">Need More Help?</h2>
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              Join {SITE_NAME} for free and experience all the features firsthand. Our community and AI assistant are always available to help you on your self-growth journey.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button onClick={() => router.push('/signup')} className="gradient-blue">
                Get Started Free <ArrowRight size={14} className="ml-1" />
              </Button>
              <Button onClick={() => router.push('/faq')} variant="outline">
                View FAQ
              </Button>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
