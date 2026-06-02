'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  BookOpen, Dumbbell, Zap, Trophy, Flame,
  PenTool, Clock, BarChart3, Brain, Shield,
  Users, ChevronRight, ArrowRight, Target,
  CheckCircle2, Code, Globe, Sparkles,
  FileText, Video, Share2, Calendar,
  Settings, Award, Star,
} from 'lucide-react';
import { GlassCard } from '@/components/glass-card';
import { Button } from '@/components/ui/button';
import { SITE_NAME } from '@/lib/site-config';

const DOC_SECTIONS = [
  {
    title: 'Fitness Tracker',
    desc: 'Log workouts, track meals, monitor weight, and earn XP for staying healthy.',
    icon: Dumbbell,
    color: 'text-emerald-400',
    bg: 'bg-emerald-600/10',
    topics: [
      { name: 'Workout Logging', desc: 'Record exercises, sets, reps, duration, and calories burned for each workout session. Workouts can be categorized as Strength, Cardio, or Flexibility. Each workout earns 15-30 XP based on duration and intensity.' },
      { name: 'Meal Tracking', desc: 'Log daily meals with detailed macronutrient breakdowns — protein, carbs, and fat. Track your caloric intake against daily goals and monitor nutritional balance over time. Meal logging earns XP and contributes to consistency streaks.' },
      { name: 'Weight Progress', desc: 'Track body weight over weeks with visual charts showing trends and progress toward your goal weight. The weight tracker integrates with workout and meal data to provide a holistic view of your fitness journey.' },
      { name: 'AI Health Features', desc: 'Get AI-powered calorie burn estimates for workouts and daily health ratings. The AI analyzes your logged data to provide personalized recommendations for optimizing your fitness routine.' },
    ],
  },
  {
    title: 'Learning Tracker',
    desc: 'Organize study topics, log entries, track progress, and build knowledge streaks.',
    icon: BookOpen,
    color: 'text-blue-400',
    bg: 'bg-blue-600/10',
    topics: [
      { name: 'Topic Management', desc: 'Create and organize study topics that represent areas of knowledge you want to track. Topics can be bookmarked for quick access and shared with the community to inspire others on their learning journey.' },
      { name: 'Study Entries', desc: 'Log detailed study entries within each topic, including notes, reflections, and time spent. Entries form a chronological journal of your learning progress and earn XP for each session logged.' },
      { name: 'Progress Visualization', desc: 'View visual charts showing your study activity over time, including daily, weekly, and monthly trends. Track the number of entries per topic and identify your most active study periods.' },
      { name: 'AI Progress Checks', desc: 'Receive AI-powered assessments of your learning progress, including knowledge gap analysis and personalized study recommendations. The AI understands your study patterns and suggests optimal review schedules.' },
    ],
  },
  {
    title: 'Content Creation',
    desc: 'Manage your content pipeline from draft to published with blogs, videos, and social posts.',
    icon: PenTool,
    color: 'text-purple-400',
    bg: 'bg-purple-600/10',
    topics: [
      { name: 'Blog Posts', desc: 'Write and publish long-form blog posts with rich text editing, tags, and optional cover images. Blog posts support markdown formatting and automatically calculate reading time. Publishing a blog earns 25 XP.' },
      { name: 'Video Tracking', desc: 'Track video projects from ideation through scripting, filming, editing, and publishing. Each stage can be logged separately, giving you a complete view of your video production pipeline. Video publishing earns 30 XP.' },
      { name: 'Social Posts', desc: 'Log social media content and cross-platform publishing activity. Track post types, platforms, and engagement metrics to optimize your content strategy. Social post logging earns 15 XP per entry.' },
      { name: 'Content Series', desc: 'Organize related content into series for better navigation and thematic grouping. Series track progress toward completion and help readers discover related content in sequence.' },
    ],
  },
  {
    title: 'Productivity & Time',
    desc: 'Manage tasks, run focus sessions, plan your day, and track productivity with XP rewards.',
    icon: Clock,
    color: 'text-amber-400',
    bg: 'bg-amber-600/10',
    topics: [
      { name: 'Task Management', desc: 'Create, organize, and complete tasks with AI-assisted priority and category classification. Tasks can be high, medium, or low priority and are categorized as Work, Learning, Content, Fitness, or Personal. Each completed task earns 10-20 XP.' },
      { name: 'Focus Sessions', desc: 'Run timed focus sessions for deep work, Pomodoro, or learning. Sessions track duration and earn XP based on length. A 25-minute Pomodoro earns 10 XP, while a 90-minute deep work session earns 25 XP.' },
      { name: 'Day Planning', desc: 'Time-block your day with morning, afternoon, and evening slots. The day planner helps you allocate time for different activities and tracks whether you followed through on your planned schedule.' },
      { name: 'AI Productivity Insights', desc: 'Get AI-powered analysis of your productivity patterns, including rankings of unproductive time, optimal focus periods, and personalized suggestions for improving your daily output.' },
    ],
  },
  {
    title: 'Gamification System',
    desc: 'Earn XP, unlock achievements, build streaks, level up, and compete on leaderboards.',
    icon: Trophy,
    color: 'text-rose-400',
    bg: 'bg-rose-600/10',
    topics: [
      { name: 'XP System', desc: 'Experience Points (XP) are earned for every positive action — workouts, study sessions, content creation, task completion, focus sessions, and daily logins. XP accumulates to determine your level, which unlocks new titles and social recognition.' },
      { name: 'Achievements', desc: 'Achievements are milestone rewards that unlock when you reach specific goals. They range from Common (10 XP) to Mythic (500 XP) rarity. Achievements celebrate your consistency, dedication, and growth across all areas of the platform.' },
      { name: 'Streaks', desc: 'Track consecutive days of activity across different categories — login, workout, learning, and content. Streaks provide multiplier bonuses and are one of the most powerful motivators for maintaining consistency.' },
      { name: 'Leaderboard', desc: 'Compare your XP with other users on the global leaderboard. Rankings update in real-time and provide friendly competition to keep you motivated. The leaderboard can be filtered by time period for fair comparisons.' },
    ],
  },
  {
    title: 'AI Assistant',
    desc: 'Get personalized recommendations, insights, and motivation from our AI-powered chatbot.',
    icon: Brain,
    color: 'text-cyan-400',
    bg: 'bg-cyan-600/10',
    topics: [
      { name: 'AI Chat', desc: 'Have conversations with the AI assistant about your goals, habits, and challenges. The AI provides personalized advice based on your tracked data and can help you develop strategies for overcoming obstacles in your self-growth journey.' },
      { name: 'Macro Estimation', desc: 'Get AI-powered macronutrient estimates for meals when you do not have exact nutritional data. Simply describe what you ate, and the AI provides approximate protein, carb, and fat values.' },
      { name: 'Calorie Burn Estimates', desc: 'Receive AI-estimated calorie burn for workouts based on exercise type, duration, and intensity. These estimates help you balance energy expenditure with nutritional intake for optimal fitness results.' },
      { name: 'Progress Reviews', desc: 'The AI periodically reviews your progress across all tracked areas and provides comprehensive assessments with specific, actionable recommendations for improvement.' },
    ],
  },
];

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export default function DocsClient() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/80 to-slate-100 dark:from-[#0A0F1E] dark:to-[#12101E] relative overflow-hidden">
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-indigo-600/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-violet-600/8 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <motion.div {...fadeIn} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-4">
            <BookOpen size={14} /> Documentation
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            {SITE_NAME} Documentation
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Comprehensive documentation for every feature on the {SITE_NAME} platform. Learn how to use fitness tracking, learning tools, content creation, productivity features, the gamification system, and the AI assistant to maximize your self-growth journey.
          </p>
        </motion.div>

        {/* Quick Navigation */}
        <motion.div {...fadeIn} transition={{ delay: 0.1 }} className="mb-10">
          <GlassCard variant="glassmorphism" className="p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Quick Navigation</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {DOC_SECTIONS.map((section) => (
                <a
                  key={section.title}
                  href={`#docs-${section.title.toLowerCase().replace(/\s+&\s+/g, '-').replace(/\s+/g, '-')}`}
                  className="flex items-center gap-2 p-2.5 rounded-lg bg-accent/20 hover:bg-accent/30 transition-colors"
                >
                  <section.icon size={14} className={section.color} />
                  <span className="text-xs font-medium text-foreground">{section.title}</span>
                </a>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Doc Sections */}
        {DOC_SECTIONS.map((section, sectionIndex) => (
          <motion.div
            key={section.title}
            id={`docs-${section.title.toLowerCase().replace(/\s+&\s+/g, '-').replace(/\s+/g, '-')}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + sectionIndex * 0.05 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl ${section.bg} flex items-center justify-center`}>
                <section.icon size={20} className={section.color} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">{section.title}</h2>
                <p className="text-xs text-muted-foreground">{section.desc}</p>
              </div>
            </div>
            <div className="space-y-3 ml-0 sm:ml-13">
              {section.topics.map((topic) => (
                <GlassCard key={topic.name} variant="default" className="p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-1">{topic.name}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{topic.desc}</p>
                </GlassCard>
              ))}
            </div>
          </motion.div>
        ))}

        {/* API Concept */}
        <motion.div {...fadeIn} transition={{ delay: 0.4 }} className="mb-8">
          <GlassCard variant="liquid" className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Code size={18} className="text-indigo-400" />
              <h2 className="text-lg font-semibold text-foreground">API & Integrations</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-600/10 text-amber-400 font-medium">Coming Soon</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              We are working on a public API that will allow developers to build integrations with {SITE_NAME}. The API will provide endpoints for reading user progress data, creating entries programmatically, and integrating with third-party tools like Notion, Google Calendar, and fitness wearables. API access will be free for personal use with generous rate limits.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: 'REST API', desc: 'Standard RESTful endpoints for all platform data.' },
                { label: 'Webhooks', desc: 'Real-time notifications for XP, achievements, and streaks.' },
                { label: 'OAuth 2.0', desc: 'Secure authentication for third-party integrations.' },
                { label: 'SDKs', desc: 'Client libraries for JavaScript, Python, and more.' },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-2 p-3 rounded-xl bg-accent/20">
                  <Code size={14} className="text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-foreground">{item.label}</p>
                    <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* CTA */}
        <motion.div {...fadeIn} transition={{ delay: 0.45 }}>
          <GlassCard variant="glowing" className="p-6 text-center">
            <CheckCircle2 size={28} className="mx-auto mb-3 text-indigo-400" />
            <h2 className="text-xl font-bold text-foreground mb-2">Explore the Features</h2>
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              Join {SITE_NAME} for free and try every feature described here. From fitness tracking to AI assistance, everything is available at no cost.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button onClick={() => router.push('/signup')} className="gradient-blue">
                Get Started Free <ArrowRight size={14} className="ml-1" />
              </Button>
              <Button onClick={() => router.push('/showcase/gamification')} variant="outline">
                View Demo
              </Button>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
