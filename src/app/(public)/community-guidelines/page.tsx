import { Zap, Heart, Shield, Users, MessageCircle, AlertTriangle, Scale, Eye } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL, CANONICAL_URL } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Community Guidelines',
  description: `Read the Community Guidelines for ${SITE_NAME}. Help us maintain a supportive, respectful, and growth-oriented community for everyone.`,
  alternates: { canonical: `${CANONICAL_URL}/community-guidelines` },
  openGraph: {
    title: `Community Guidelines — ${SITE_NAME}`,
    description: `Help us maintain a supportive, respectful, and growth-oriented community on ${SITE_NAME}.`,
    url: `${CANONICAL_URL}/community-guidelines`,
    type: 'website',
    siteName: SITE_NAME,
  },
  twitter: {
    card: 'summary',
    title: `Community Guidelines — ${SITE_NAME}`,
    description: `Help us maintain a supportive, respectful, and growth-oriented community.`,
  },
};

export default function CommunityGuidelinesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 dark:from-[#0A0F1E] dark:to-[#1E3A5F] relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="relative z-10 max-w-3xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <Logo size={40} />
          <h1 className="text-2xl font-bold text-foreground">Community Guidelines</h1>
        </div>

        <div className="glass-card p-6 sm:p-8 space-y-6 text-sm text-muted-foreground leading-relaxed">
          <p className="text-xs text-muted-foreground">Last updated: March 4, 2026</p>

          <div className="bg-blue-600/10 border border-blue-500/20 rounded-xl p-4">
            <p className="text-foreground font-medium">Our Mission</p>
            <p className="mt-1">S/R/E is built on the belief that self-improvement is a journey best shared. These guidelines exist to foster a supportive, respectful, and growth-oriented community where everyone feels welcome to pursue their goals.</p>
          </div>

          <section>
            <div className="flex items-center gap-2 mb-2">
              <Heart size={18} className="text-rose-400" />
              <h2 className="text-lg font-semibold text-foreground">1. Be Respectful</h2>
            </div>
            <p>Treat every community member with dignity and respect. This means:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>No harassment, bullying, or personal attacks</li>
              <li>No hate speech, slurs, or discriminatory language based on race, ethnicity, gender, sexuality, religion, disability, or any other characteristic</li>
              <li>No doxxing or sharing others&apos; private information without consent</li>
              <li>Respect boundaries — if someone asks you to stop, stop</li>
            </ul>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-2">
              <Users size={18} className="text-blue-400" />
              <h2 className="text-lg font-semibold text-foreground">2. Be Supportive</h2>
            </div>
            <p>This is a growth-oriented community. Help others succeed:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Celebrate others&apos; achievements and milestones</li>
              <li>Offer constructive feedback, not criticism</li>
              <li>Share knowledge and tips that have helped you</li>
              <li>Be patient with beginners — everyone starts somewhere</li>
              <li>Don&apos;t mock or belittle anyone&apos;s goals or progress</li>
            </ul>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle size={18} className="text-emerald-400" />
              <h2 className="text-lg font-semibold text-foreground">3. Share Authentically</h2>
            </div>
            <p>Keep the community genuine and trustworthy:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Share real experiences and honest progress</li>
              <li>Don&apos;t fabricate achievements, streaks, or results</li>
              <li>Don&apos;t use the platform to spam, advertise, or self-promote excessively</li>
              <li>Give credit when sharing others&apos; content or ideas</li>
              <li>Don&apos;t create fake accounts or use bots to inflate engagement</li>
            </ul>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-2">
              <Shield size={18} className="text-amber-400" />
              <h2 className="text-lg font-semibold text-foreground">4. Keep It Safe</h2>
            </div>
            <p>Help us maintain a safe environment for everyone:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>No content promoting self-harm, eating disorders, or dangerous activities</li>
              <li>No sexually explicit or pornographic content</li>
              <li>No content depicting or promoting violence</li>
              <li>No sharing of illegal content or instructions for illegal activities</li>
              <li>No sharing unverified medical advice as fact</li>
              <li>Report content that violates these guidelines using the report feature</li>
            </ul>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-2">
              <Scale size={18} className="text-purple-400" />
              <h2 className="text-lg font-semibold text-foreground">5. Play Fair</h2>
            </div>
            <p>The gamification features are designed to motivate genuine growth:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Don&apos;t exploit bugs or glitches to gain XP, levels, or achievements</li>
              <li>Don&apos;t manipulate streaks or other tracking features dishonestly</li>
              <li>Don&apos;t create multiple accounts to boost your own engagement</li>
              <li>Don&apos;t collude with others to manipulate leaderboards</li>
              <li>Report bugs rather than exploiting them</li>
            </ul>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-2">
              <Eye size={18} className="text-cyan-400" />
              <h2 className="text-lg font-semibold text-foreground">6. Respect Privacy</h2>
            </div>
            <p>Everyone&apos;s privacy matters:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Don&apos;t share screenshots of private messages without consent</li>
              <li>Don&apos;t share others&apos; personal information (full names, addresses, phone numbers, etc.)</li>
              <li>Respect users who choose to keep their profiles private</li>
              <li>Don&apos;t stalk or persistently contact users who don&apos;t wish to engage</li>
            </ul>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={18} className="text-red-400" />
              <h2 className="text-lg font-semibold text-foreground">7. Enforcement</h2>
            </div>
            <p>Violations of these guidelines may result in:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Content removal</li>
              <li>Warning or formal notice</li>
              <li>Temporary suspension of account features</li>
              <li>Permanent account suspension or ban</li>
            </ul>
            <p className="mt-2">The severity of the action will correspond to the severity of the violation. Repeat offenders will face progressively stronger consequences. Decisions by the moderation team are final.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">8. Reporting</h2>
            <p>If you encounter content or behavior that violates these guidelines, please use the built-in report feature. Our moderation team reviews all reports promptly. You can also reach out through the Platform&apos;s feedback system for urgent concerns.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">9. Amendments</h2>
            <p>These Community Guidelines may be updated from time to time. We will notify the community of significant changes. Continued use of the Platform constitutes acceptance of any updates.</p>
          </section>

          <div className="pt-4 border-t border-border">
            <Link href="/signup" className="text-blue-400 hover:underline text-sm">← Back to Sign Up</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
