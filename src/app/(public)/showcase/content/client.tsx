'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  PenTool, Video, Share2, Calendar, Clock, Eye, Heart,
  Zap, Target, ChevronRight, BarChart3, FileText, Image,
  Trophy, ArrowRight, CheckCircle2, TrendingUp, Bookmark,
  MessageCircle, Star,
} from 'lucide-react';
import { GlassCard } from '@/components/glass-card';
import { Button } from '@/components/ui/button';
import { SITE_NAME } from '@/lib/site-config';

const DEMO_ENTRIES = [
  {
    id: 1,
    title: 'How I Built a 30-Day Habit Streak',
    type: 'Blog',
    status: 'Published',
    wordCount: 1240,
    readTime: 6,
    views: 342,
    likes: 28,
    comments: 7,
    date: '2 days ago',
    xp: 25,
    tags: ['Growth', 'Habits'],
  },
  {
    id: 2,
    title: 'Morning Routine for Maximum Productivity',
    type: 'Video',
    status: 'Published',
    wordCount: 0,
    readTime: 12,
    views: 890,
    likes: 64,
    comments: 15,
    date: '5 days ago',
    xp: 30,
    tags: ['Productivity', 'Routine'],
  },
  {
    id: 3,
    title: 'Why Consistency Beats Motivation',
    type: 'Post',
    status: 'Published',
    wordCount: 380,
    readTime: 2,
    views: 156,
    likes: 22,
    comments: 4,
    date: '1 week ago',
    xp: 15,
    tags: ['Mindset'],
  },
  {
    id: 4,
    title: 'Complete Guide to Meal Prep',
    type: 'Blog',
    status: 'Draft',
    wordCount: 650,
    readTime: 0,
    views: 0,
    likes: 0,
    comments: 0,
    date: 'Today',
    xp: 0,
    tags: ['Fitness', 'Nutrition'],
  },
  {
    id: 5,
    title: 'My 100-Day Learning Challenge Recap',
    type: 'Video',
    status: 'Editing',
    wordCount: 0,
    readTime: 18,
    views: 0,
    likes: 0,
    comments: 0,
    date: 'Yesterday',
    xp: 0,
    tags: ['Learning', 'Challenge'],
  },
];

const DEMO_SERIES = [
  { name: 'Habit Building Series', count: 5, progress: 80, icon: Target },
  { name: 'Fitness Fundamentals', count: 8, progress: 37, icon: BarChart3 },
  { name: 'Productivity Hacks', count: 3, progress: 100, icon: Zap },
];

const DEMO_STATS = {
  totalEntries: 23,
  published: 18,
  drafts: 3,
  editing: 2,
  totalViews: 4520,
  totalLikes: 312,
  weeklyXP: 85,
  totalXP: 1560,
  consistency: 78,
};

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export default function ContentShowcaseClient() {
  const router = useRouter();

  const statusColor = (status: string) => {
    switch (status) {
      case 'Published': return 'bg-emerald-600/15 text-emerald-400';
      case 'Draft': return 'bg-amber-600/15 text-amber-400';
      case 'Editing': return 'bg-blue-600/15 text-blue-400';
      default: return 'bg-accent/50 text-muted-foreground';
    }
  };

  const typeIcon = (type: string) => {
    switch (type) {
      case 'Blog': return PenTool;
      case 'Video': return Video;
      case 'Post': return Share2;
      default: return FileText;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/80 to-slate-100 dark:from-[#0A0F1E] dark:to-[#1A0F2E] relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <motion.div {...fadeIn} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-600/10 border border-purple-500/20 text-purple-400 text-xs font-medium mb-4">
            <PenTool size={14} /> Demo Preview
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Content Creation Tracker
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Manage your entire content pipeline in one place. Track blog posts, videos, and social media updates from draft to published. Earn XP for every piece of content you create and build consistency as a creator with {SITE_NAME}.
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div {...fadeIn} transition={{ delay: 0.1 }} className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Total Content', value: DEMO_STATS.totalEntries, icon: FileText, color: 'text-purple-400', bg: 'bg-purple-600/10' },
            { label: 'Published', value: DEMO_STATS.published, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-600/10' },
            { label: 'Total Views', value: `${(DEMO_STATS.totalViews / 1000).toFixed(1)}k`, icon: Eye, color: 'text-blue-400', bg: 'bg-blue-600/10' },
            { label: 'Creator XP', value: DEMO_STATS.totalXP, icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-600/10' },
          ].map((stat) => (
            <GlassCard key={stat.label} variant="default" className="p-4 text-center">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mx-auto mb-2`}>
                <stat.icon size={20} className={stat.color} />
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </GlassCard>
          ))}
        </motion.div>

        {/* Content Pipeline */}
        <motion.div {...fadeIn} transition={{ delay: 0.15 }} className="mb-8">
          <GlassCard variant="glassmorphism" className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={18} className="text-purple-400" />
              <h2 className="text-lg font-semibold text-foreground">Content Pipeline</h2>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center mb-4">
              <div className="p-3 rounded-xl bg-amber-600/10 border border-amber-500/20">
                <p className="text-2xl font-bold text-amber-400">{DEMO_STATS.drafts}</p>
                <p className="text-xs text-muted-foreground">Drafts</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-600/10 border border-blue-500/20">
                <p className="text-2xl font-bold text-blue-400">{DEMO_STATS.editing}</p>
                <p className="text-xs text-muted-foreground">In Editing</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-600/10 border border-emerald-500/20">
                <p className="text-2xl font-bold text-emerald-400">{DEMO_STATS.published}</p>
                <p className="text-xs text-muted-foreground">Published</p>
              </div>
            </div>
            <div className="w-full h-3 rounded-full bg-accent/30 overflow-hidden">
              <div className="flex h-full">
                <div className="bg-emerald-500 h-full" style={{ width: '78%' }} />
                <div className="bg-blue-500 h-full" style={{ width: '9%' }} />
                <div className="bg-amber-500 h-full" style={{ width: '13%' }} />
              </div>
            </div>
            <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Published</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Editing</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Drafts</span>
            </div>
          </GlassCard>
        </motion.div>

        {/* Content Entries */}
        <motion.div {...fadeIn} transition={{ delay: 0.2 }} className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <FileText size={18} className="text-purple-400" /> Content Entries
            </h2>
            <span className="text-xs text-muted-foreground">Demo data</span>
          </div>
          <div className="space-y-3">
            {DEMO_ENTRIES.map((entry) => {
              const Icon = typeIcon(entry.type);
              return (
                <GlassCard key={entry.id} variant="default" hoverGlow="xp" className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Icon size={14} className={entry.type === 'Blog' ? 'text-blue-400' : entry.type === 'Video' ? 'text-rose-400' : 'text-green-400'} />
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/50 text-muted-foreground">{entry.type}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColor(entry.status)}`}>{entry.status}</span>
                        <span className="text-[10px] text-muted-foreground/50">{entry.date}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-foreground mb-1 truncate">{entry.title}</h3>
                      <div className="flex flex-wrap gap-1 mb-1">
                        {entry.tags.map((tag) => (
                          <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-accent/50 text-muted-foreground">#{tag}</span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      {entry.status === 'Published' ? (
                        <>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                            <Eye size={12} /> {entry.views}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-rose-400 mb-1">
                            <Heart size={12} /> {entry.likes}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-amber-400">
                            <Zap size={12} /> +{entry.xp} XP
                          </div>
                        </>
                      ) : (
                        <>
                          {entry.wordCount > 0 && (
                            <div className="text-xs text-muted-foreground mb-1">{entry.wordCount} words</div>
                          )}
                          <div className="text-xs text-muted-foreground/50">{entry.status}</div>
                        </>
                      )}
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </motion.div>

        {/* Series */}
        <motion.div {...fadeIn} transition={{ delay: 0.25 }} className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Bookmark size={18} className="text-purple-400" /> Content Series
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {DEMO_SERIES.map((series) => (
              <GlassCard key={series.name} variant="default" className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <series.icon size={16} className="text-purple-400" />
                  <h3 className="text-sm font-semibold text-foreground truncate">{series.name}</h3>
                </div>
                <div className="w-full h-2 rounded-full bg-accent/30 overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full ${series.progress === 100 ? 'bg-emerald-500' : 'bg-purple-500'}`}
                    style={{ width: `${series.progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{series.count} entries</span>
                  <span className={series.progress === 100 ? 'text-emerald-400' : 'text-purple-400'}>{series.progress}%</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </motion.div>

        {/* Features */}
        <motion.div {...fadeIn} transition={{ delay: 0.3 }} className="mb-8">
          <GlassCard variant="liquid" className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Star size={18} className="text-purple-400" /> Creator Features
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: PenTool, title: 'Blog Editor', desc: 'Write and publish long-form blog posts with tags and cover images.' },
                { icon: Video, title: 'Video Tracking', desc: 'Log video projects from scripting to editing to published.' },
                { icon: Share2, title: 'Social Posts', desc: 'Track social media content and cross-platform publishing.' },
                { icon: Zap, title: 'XP for Creating', desc: 'Earn XP for every piece of content you publish consistently.' },
                { icon: Bookmark, title: 'Content Series', desc: 'Organize related content into series for easy navigation.' },
                { icon: TrendingUp, title: 'Creator Analytics', desc: 'Views, likes, and engagement metrics at a glance.' },
              ].map((f) => (
                <div key={f.title} className="flex items-start gap-3 p-3 rounded-xl bg-accent/20">
                  <div className="w-8 h-8 rounded-lg bg-purple-600/10 flex items-center justify-center shrink-0">
                    <f.icon size={16} className="text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{f.title}</p>
                    <p className="text-xs text-muted-foreground">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* CTA */}
        <motion.div {...fadeIn} transition={{ delay: 0.35 }}>
          <GlassCard variant="glowing" className="p-6 text-center">
            <CheckCircle2 size={28} className="mx-auto mb-3 text-purple-400" />
            <h2 className="text-xl font-bold text-foreground mb-2">Start Creating & Tracking</h2>
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              Join {SITE_NAME} for free and manage your content pipeline with gamified tracking. Publish consistently, earn XP, and grow as a creator.
            </p>
            <Button onClick={() => router.push('/signup')} className="gradient-blue">
              Get Started Free <ArrowRight size={14} className="ml-1" />
            </Button>
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
              <button onClick={() => router.push('/showcase/fitness')} className="hover:text-foreground transition-colors flex items-center gap-1">
                Fitness Demo <ChevronRight size={12} />
              </button>
              <button onClick={() => router.push('/showcase/productivity')} className="hover:text-foreground transition-colors flex items-center gap-1">
                Productivity Demo <ChevronRight size={12} />
              </button>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
