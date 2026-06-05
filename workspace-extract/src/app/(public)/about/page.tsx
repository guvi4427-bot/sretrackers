import { Zap, Target, Sparkles, Code, Heart, Users, Rocket, Lightbulb, Shield, Globe } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL, CANONICAL_URL } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'About',
  description: `Learn about ${SITE_NAME} — a free gamified self-growth platform for fitness tracking, learning progression, content creation tracking, and a progression-focused social community. Start, Restart, and Explore your journey.`,
  alternates: { canonical: `${CANONICAL_URL}/about` },
  openGraph: {
    title: `About ${SITE_NAME}`,
    description: `${SITE_NAME} helps you build better habits with gamification, community, and AI-powered tools. Track fitness, learning, and content creation.`,
    url: `${CANONICAL_URL}/about`,
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 dark:from-[#0A0F1E] dark:to-[#1E3A5F] relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-3/4 left-1/2 w-72 h-72 bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="relative z-10 max-w-3xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <Logo size={40} />
          <h1 className="text-2xl font-bold text-foreground">About S/R/E</h1>
        </div>

        {/* Hero Section */}
        <div className="glass-card p-6 sm:p-8 mb-6">
          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-2xl mx-auto mb-4 glow-blue overflow-hidden">
              <Logo size={80} />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Start / Restart / Explore</h2>
            <p className="text-muted-foreground">Your gamified journey to self-improvement</p>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            S/R/E is a gamified self-growth platform designed to help you build better habits, track your progress, and stay motivated on your personal development journey. Whether you want to study more effectively, build consistent daily routines, or improve your fitness, S/R/E provides the tools and community to make growth feel like an adventure rather than a chore.
          </p>
        </div>

        {/* Our Story */}
        <div className="glass-card p-6 sm:p-8 mb-6 space-y-4 text-sm text-muted-foreground leading-relaxed">
          <div className="flex items-center gap-2 mb-2">
            <Rocket size={20} className="text-blue-400" />
            <h2 className="text-lg font-semibold text-foreground">Our Story</h2>
          </div>
          <p>
            S/R/E was founded by <strong className="text-foreground">Gowtham</strong>, a passionate self-improvement enthusiast who believed that personal growth should be accessible, engaging, and rewarding for everyone. The idea was born from a simple observation: traditional habit trackers and goal-setting apps often fail because they lack the elements that make us stick with things — fun, community, and a sense of achievement.
          </p>
          <p>
            Built with the assistance of modern AI tools, S/R/E combines cutting-edge technology with thoughtful design to create a platform that feels less like a chore tracker and more like a game where the real prize is becoming a better version of yourself. The platform was crafted from the ground up with the help of AI-assisted development, enabling rapid iteration and a feature-rich experience that would have been impossible for a solo founder to achieve alone.
          </p>
          <p>
            What started as a personal project has grown into a platform that aims to help thousands of people worldwide build the habits that matter most to them — whether that is studying consistently, maintaining healthy routines, or staying physically active.
          </p>
        </div>

        {/* What We Offer */}
        <div className="glass-card p-6 sm:p-8 mb-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Target size={20} className="text-emerald-400" />
            <h2 className="text-lg font-semibold text-foreground">What We Offer</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-blue-600/10 border border-blue-500/20 rounded-xl p-4">
              <Target size={24} className="text-blue-400 mb-2" />
              <h3 className="text-foreground font-semibold mb-1">Habit Tracking</h3>
              <p className="text-xs text-muted-foreground">Track your Study, Routine, and Exercise habits with daily check-ins, streaks, and progress visualization to keep you accountable and consistent.</p>
            </div>
            <div className="bg-purple-600/10 border border-purple-500/20 rounded-xl p-4">
              <Sparkles size={24} className="text-purple-400 mb-2" />
              <h3 className="text-foreground font-semibold mb-1">Gamification</h3>
              <p className="text-xs text-muted-foreground">Earn XP, level up, unlock achievements, and compete on leaderboards. Turn your self-improvement journey into an engaging game with real rewards.</p>
            </div>
            <div className="bg-emerald-600/10 border border-emerald-500/20 rounded-xl p-4">
              <Users size={24} className="text-emerald-400 mb-2" />
              <h3 className="text-foreground font-semibold mb-1">Community</h3>
              <p className="text-xs text-muted-foreground">Connect with like-minded individuals, share your progress, follow friends, exchange messages, and support each other on your growth journeys.</p>
            </div>
            <div className="bg-amber-600/10 border border-amber-500/20 rounded-xl p-4">
              <Lightbulb size={24} className="text-amber-400 mb-2" />
              <h3 className="text-foreground font-semibold mb-1">AI Assistant</h3>
              <p className="text-xs text-muted-foreground">Get personalized recommendations, insights, and motivation from our AI-powered chatbot that understands your goals and helps you stay on track.</p>
            </div>
            <div className="bg-rose-600/10 border border-rose-500/20 rounded-xl p-4">
              <Heart size={24} className="text-rose-400 mb-2" />
              <h3 className="text-foreground font-semibold mb-1">Fitness &amp; Health</h3>
              <p className="text-xs text-muted-foreground">Log workouts, track nutrition, monitor your fitness progress, and set health goals with detailed tracking and analytics tools.</p>
            </div>
            <div className="bg-cyan-600/10 border border-cyan-500/20 rounded-xl p-4">
              <Code size={24} className="text-cyan-400 mb-2" />
              <h3 className="text-foreground font-semibold mb-1">Learning &amp; Content</h3>
              <p className="text-xs text-muted-foreground">Create and share content, manage learning phases, write journal entries, and organize your knowledge in one unified platform.</p>
            </div>
          </div>
        </div>

        {/* S/R/E Pillars */}
        <div className="glass-card p-6 sm:p-8 mb-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={20} className="text-amber-400" />
            <h2 className="text-lg font-semibold text-foreground">The S/R/E Pillars</h2>
          </div>
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center shrink-0">
                <span className="text-xl font-bold text-blue-400">S</span>
              </div>
              <div>
                <h3 className="text-foreground font-semibold">Study</h3>
                <p className="text-xs text-muted-foreground mt-1">Build consistent study habits with tracked sessions, learning phases, and knowledge management tools. Whether you are a student preparing for exams or a professional learning new skills, S/R/E helps you stay disciplined and organized in your learning journey.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-xl bg-emerald-600/20 flex items-center justify-center shrink-0">
                <span className="text-xl font-bold text-emerald-400">R</span>
              </div>
              <div>
                <h3 className="text-foreground font-semibold">Routine</h3>
                <p className="text-xs text-muted-foreground mt-1">Establish and maintain daily routines that support your goals. Track your morning rituals, sleep schedules, daily habits, and time management. Consistency is the key to transformation, and S/R/E makes it easy to build routines that stick.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-xl bg-purple-600/20 flex items-center justify-center shrink-0">
                <span className="text-xl font-bold text-purple-400">E</span>
              </div>
              <div>
                <h3 className="text-foreground font-semibold">Exercise</h3>
                <p className="text-xs text-muted-foreground mt-1">Stay active and track your fitness journey with workout logging, nutrition tracking, and progress analytics. From casual walks to intense gym sessions, S/R/E celebrates every step you take toward a healthier lifestyle.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Built with AI */}
        <div className="glass-card p-6 sm:p-8 mb-6 space-y-4 text-sm text-muted-foreground leading-relaxed">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={20} className="text-violet-400" />
            <h2 className="text-lg font-semibold text-foreground">Built with AI</h2>
          </div>
          <p>
            S/R/E is a testament to what is possible when human creativity meets artificial intelligence. The entire platform was built by Gowtham using AI-assisted development tools, demonstrating that one person with a vision and the right technology can create a production-grade web application that serves thousands of users.
          </p>
          <p>
            The platform leverages modern web technologies including Next.js, Prisma, PostgreSQL, and cutting-edge AI models for its intelligent features. Every line of code, every design decision, and every feature was shaped through collaboration between human insight and AI capabilities, proving that the future of software development is a partnership between people and technology.
          </p>
        </div>

        {/* Our Values */}
        <div className="glass-card p-6 sm:p-8 mb-6 space-y-4 text-sm text-muted-foreground leading-relaxed">
          <div className="flex items-center gap-2 mb-2">
            <Globe size={20} className="text-cyan-400" />
            <h2 className="text-lg font-semibold text-foreground">Our Values</h2>
          </div>
          <ul className="space-y-3">
            <li className="flex gap-3 items-start">
              <span className="text-blue-400 font-bold shrink-0">01</span>
              <div><strong className="text-foreground">Growth is for everyone.</strong> We believe self-improvement should be accessible, inclusive, and free. No paywalls blocking your progress.</div>
            </li>
            <li className="flex gap-3 items-start">
              <span className="text-emerald-400 font-bold shrink-0">02</span>
              <div><strong className="text-foreground">Community over competition.</strong> While we have leaderboards, the real goal is lifting each other up, not tearing each other down.</div>
            </li>
            <li className="flex gap-3 items-start">
              <span className="text-purple-400 font-bold shrink-0">03</span>
              <div><strong className="text-foreground">Consistency beats intensity.</strong> A small daily habit is more powerful than an occasional burst of effort. We celebrate streaks, not just milestones.</div>
            </li>
            <li className="flex gap-3 items-start">
              <span className="text-amber-400 font-bold shrink-0">04</span>
              <div><strong className="text-foreground">Privacy matters.</strong> Your data belongs to you. We are transparent about what we collect and why, and we will never sell your personal information.</div>
            </li>
            <li className="flex gap-3 items-start">
              <span className="text-rose-400 font-bold shrink-0">05</span>
              <div><strong className="text-foreground">Progress, not perfection.</strong> Everyone starts somewhere, and every step forward counts. There is no &quot;perfect&quot; score on S/R/E — only your personal best.</div>
            </li>
          </ul>
        </div>

        {/* CTA */}
        <div className="glass-card p-6 sm:p-8 text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">Ready to Start Your Journey?</h2>
          <p className="text-sm text-muted-foreground mb-4">Join S/R/E today and transform your habits into an adventure.</p>
          <Link href="/signup" className="inline-block px-6 py-3 rounded-xl gradient-blue text-white font-semibold hover:opacity-90 transition-opacity">
            Get Started Free
          </Link>
        </div>

        <div className="mt-6 flex items-center justify-center flex-wrap gap-4 text-sm">
          <Link href="/privacy" className="text-blue-400 hover:underline">Privacy Policy</Link>
          <Link href="/terms" className="text-blue-400 hover:underline">Terms &amp; Conditions</Link>
          <Link href="/community-guidelines" className="text-blue-400 hover:underline">Community Guidelines</Link>
          <Link href="/contact" className="text-blue-400 hover:underline">Contact</Link>
        </div>
      </div>
    </div>
  );
}
