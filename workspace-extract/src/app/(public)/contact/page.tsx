import { Zap, Mail, Camera, Tv, MessageCircle, Clock, Send } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL, CANONICAL_URL } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Contact',
  description: `Get in touch with the ${SITE_NAME} team. Reach out for support, partnerships, feature requests, or general inquiries about our gamified self-growth platform.`,
  alternates: { canonical: `${CANONICAL_URL}/contact` },
  openGraph: {
    title: `Contact ${SITE_NAME}`,
    description: `Reach out to the ${SITE_NAME} team for support, partnerships, or feedback.`,
    url: `${CANONICAL_URL}/contact`,
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 dark:from-[#0A0F1E] dark:to-[#1E3A5F] relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="relative z-10 max-w-3xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <Logo size={40} />
          <h1 className="text-2xl font-bold text-foreground">Contact Us</h1>
        </div>

        <div className="glass-card p-6 sm:p-8 space-y-6 text-sm text-muted-foreground leading-relaxed">
          <p className="text-base">We would love to hear from you! Whether you have a question, feedback, partnership inquiry, or just want to say hello, feel free to reach out through any of the channels below.</p>

          {/* Contact Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Email */}
            <a
              href="mailto:myselfgowtham140707@gmail.com"
              className="block bg-gradient-to-br from-blue-600/10 to-cyan-600/10 border border-blue-500/20 rounded-xl p-6 hover:border-blue-400/40 transition-colors group"
            >
              <Mail size={32} className="text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-bold text-foreground mb-1">Email</h3>
              <p className="text-xs text-muted-foreground mb-3">For general inquiries, support, and partnerships</p>
              <span className="text-blue-400 text-sm font-medium group-hover:underline break-all">myselfgowtham140707@gmail.com</span>
            </a>

            {/* Instagram */}
            <a
              href="https://www.instagram.com/myselfgowtham07?igsh=c2JudTYzYWg1bWx4"
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-gradient-to-br from-pink-600/10 to-purple-600/10 border border-pink-500/20 rounded-xl p-6 hover:border-pink-400/40 transition-colors group"
            >
              <Camera size={32} className="text-pink-400 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-bold text-foreground mb-1">Instagram</h3>
              <p className="text-xs text-muted-foreground mb-3">Follow for updates, tips, and community highlights</p>
              <span className="text-pink-400 text-sm font-medium group-hover:underline">@myselfgowtham07</span>
            </a>

            {/* YouTube */}
            <a
              href="https://www.youtube.com/@myselfgowtham_07"
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-gradient-to-br from-red-600/10 to-red-800/10 border border-red-500/20 rounded-xl p-6 hover:border-red-400/40 transition-colors group"
            >
              <Tv size={32} className="text-red-400 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-bold text-foreground mb-1">YouTube</h3>
              <p className="text-xs text-muted-foreground mb-3">Watch tutorials, walkthroughs, and growth content</p>
              <span className="text-red-400 text-sm font-medium group-hover:underline">@myselfgowtham_07</span>
            </a>
          </div>

          {/* Response Time */}
          <div className="bg-blue-600/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
            <Clock size={20} className="text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-foreground font-medium">Response Time</p>
              <p className="mt-1">We typically respond to emails within 24 to 48 hours. For urgent matters, please include &quot;URGENT&quot; in the subject line and we will prioritize your message. We appreciate your patience and will get back to you as soon as possible.</p>
            </div>
          </div>

          {/* Common Topics */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-3">Common Topics We Can Help With</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-start gap-2">
                <MessageCircle size={16} className="text-emerald-400 shrink-0 mt-1" />
                <div>
                  <p className="text-foreground font-medium text-sm">Technical Support</p>
                  <p className="text-xs text-muted-foreground">Bugs, errors, and account issues</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MessageCircle size={16} className="text-blue-400 shrink-0 mt-1" />
                <div>
                  <p className="text-foreground font-medium text-sm">Feature Requests</p>
                  <p className="text-xs text-muted-foreground">Ideas to improve the platform</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MessageCircle size={16} className="text-purple-400 shrink-0 mt-1" />
                <div>
                  <p className="text-foreground font-medium text-sm">Partnerships</p>
                  <p className="text-xs text-muted-foreground">Collaboration and business inquiries</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MessageCircle size={16} className="text-amber-400 shrink-0 mt-1" />
                <div>
                  <p className="text-foreground font-medium text-sm">Privacy &amp; Data</p>
                  <p className="text-xs text-muted-foreground">Data requests and privacy concerns</p>
                </div>
              </div>
            </div>
          </div>

          {/* Feedback CTA */}
          <div className="bg-emerald-600/10 border border-emerald-500/20 rounded-xl p-4 flex items-start gap-3">
            <Send size={20} className="text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-foreground font-medium">In-App Feedback</p>
              <p className="mt-1">Already a user? You can also submit feedback directly within the platform through the <Link href="/feedback" className="text-blue-400 hover:underline">Feedback page</Link> after logging in. This is the fastest way to share your thoughts with us.</p>
            </div>
          </div>

          <div className="pt-4 border-t border-border flex items-center flex-wrap gap-4">
            <Link href="/privacy" className="text-blue-400 hover:underline text-sm">Privacy Policy</Link>
            <Link href="/terms" className="text-blue-400 hover:underline text-sm">Terms &amp; Conditions</Link>
            <Link href="/community-guidelines" className="text-blue-400 hover:underline text-sm">Community Guidelines</Link>
            <Link href="/about" className="text-blue-400 hover:underline text-sm">About</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
