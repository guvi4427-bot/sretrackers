import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL, SITE_SHORT_NAME } from '@/lib/site-config';

export const metadata: Metadata = {
  title: `Contact Us — ${SITE_SHORT_NAME} Platform`,
  description: `Get in touch with the ${SITE_SHORT_NAME} team. Reach out for support, feedback, partnership inquiries, or any questions about the platform.`,
  alternates: { canonical: `${SITE_URL}/contact` },
  openGraph: {
    title: `Contact Us — ${SITE_SHORT_NAME} Platform`,
    description: `Get in touch with the ${SITE_SHORT_NAME} team for support, feedback, or questions.`,
    url: `${SITE_URL}/contact`,
  },
  robots: { index: true, follow: true },
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
        <p className="text-muted-foreground leading-relaxed mb-8">
          We would love to hear from you. Whether you have a question about the platform, need technical support, want to report an issue, or have suggestions for improvement, please reach out to us through any of the channels below. We aim to respond to all inquiries within 48 hours.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <a
            href="mailto:myselfgowtham140707@gmail.com"
            className="p-6 rounded-xl bg-gradient-to-br from-blue-600/10 to-cyan-600/10 border border-blue-500/20 hover:border-blue-500/40 transition-colors block"
          >
            <div className="text-2xl mb-3">&#9993;</div>
            <h2 className="text-lg font-bold mb-2">Email</h2>
            <p className="text-sm text-muted-foreground mb-4">
              For general inquiries, support requests, and partnership opportunities, email us directly. We monitor this inbox regularly and prioritize urgent issues.
            </p>
            <p className="text-blue-400 font-medium">myselfgowtham140707@gmail.com</p>
          </a>

          <a
            href="https://www.instagram.com/myselfgowtham07?igsh=c2JudTYzYWg1bWx4"
            target="_blank"
            rel="noopener noreferrer"
            className="p-6 rounded-xl bg-gradient-to-br from-pink-600/10 to-purple-600/10 border border-pink-500/20 hover:border-pink-500/40 transition-colors block"
          >
            <div className="text-2xl mb-3">&#128247;</div>
            <h2 className="text-lg font-bold mb-2">Instagram</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Follow us for updates, community highlights, motivation, and tips on making the most of your {SITE_SHORT_NAME} journey. DMs are open for quick questions.
            </p>
            <p className="text-pink-400 font-medium">@myselfgowtham07</p>
          </a>
        </div>

        <a
          href="https://www.youtube.com/@myselfgowtham_07"
          target="_blank"
          rel="noopener noreferrer"
          className="p-6 rounded-xl bg-gradient-to-br from-red-600/10 to-red-800/10 border border-red-500/20 hover:border-red-500/40 transition-colors block mb-8"
        >
          <div className="text-2xl mb-3">&#9654;</div>
          <h2 className="text-lg font-bold mb-2">YouTube</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Subscribe to our channel for tutorials, feature walkthroughs, community spotlights, and motivational content to support your self-growth journey.
          </p>
          <p className="text-red-400 font-medium">@myselfgowtham_07</p>
        </a>

        <div className="p-6 rounded-xl border border-border mb-8">
          <h2 className="text-lg font-bold mb-3">Feedback and Bug Reports</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            Found a bug? Have a feature suggestion? Want to share how {SITE_SHORT_NAME} has helped your journey? We actively seek user feedback to improve the platform. You can submit feedback directly through the platform using the feedback feature, or email us with detailed descriptions of any issues you encounter.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            When reporting bugs, please include: your browser and device, steps to reproduce the issue, any error messages you saw, and screenshots if possible. This helps us resolve issues faster and improve the platform for everyone.
          </p>
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            For privacy-related inquiries, please see our <a href="/privacy" className="text-blue-400 hover:text-blue-300 underline">Privacy Policy</a>.
            For content concerns, see our <a href="/community-guidelines" className="text-blue-400 hover:text-blue-300 underline">Community Guidelines</a>.
          </p>
        </div>
      </div>
    </main>
  );
}
