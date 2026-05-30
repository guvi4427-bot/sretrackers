import { Zap, Shield, Eye, Database, Cookie, Globe, Lock, Users, Mail } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL, CANONICAL_URL } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `Read the Privacy Policy for ${SITE_NAME}. Learn how we collect, use, and protect your data on our gamified self-growth platform.`,
  alternates: { canonical: `${CANONICAL_URL}/privacy` },
  openGraph: {
    title: `Privacy Policy — ${SITE_NAME}`,
    description: `Learn how ${SITE_NAME} collects, uses, and protects your data on our gamified self-growth platform.`,
    url: `${CANONICAL_URL}/privacy`,
    type: 'website',
    siteName: SITE_NAME,
  },
  twitter: {
    card: 'summary',
    title: `Privacy Policy — ${SITE_NAME}`,
    description: `Learn how ${SITE_NAME} collects, uses, and protects your data.`,
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 dark:from-[#0A0F1E] dark:to-[#1E3A5F] relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="relative z-10 max-w-3xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <Logo size={40} />
          <h1 className="text-2xl font-bold text-foreground">Privacy Policy</h1>
        </div>

        <div className="glass-card p-6 sm:p-8 space-y-6 text-sm text-muted-foreground leading-relaxed">
          <p className="text-xs text-muted-foreground">Last updated: May 25, 2026</p>

          <div className="bg-blue-600/10 border border-blue-500/20 rounded-xl p-4">
            <p className="text-foreground font-medium">Your Privacy Matters</p>
            <p className="mt-1">S/R/E (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our gamified self-growth platform at workspace-extract.vercel.app (the &quot;Platform&quot;). Please read this policy carefully to understand our practices regarding your personal data.</p>
          </div>

          <section>
            <div className="flex items-center gap-2 mb-2">
              <Database size={18} className="text-blue-400" />
              <h2 className="text-lg font-semibold text-foreground">1. Information We Collect</h2>
            </div>
            <p className="mb-2">We collect information in the following ways when you use our Platform:</p>

            <h3 className="text-base font-semibold text-foreground mt-3 mb-1">a) Information You Provide Directly</h3>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Account Information:</strong> When you register, we collect your email address, name, username, and password (stored in encrypted form).</li>
              <li><strong>Profile Information:</strong> Age, gender, fitness goals, learning preferences, and other onboarding data you choose to provide.</li>
              <li><strong>User Content:</strong> Posts, comments, messages, journal entries, fitness logs, learning notes, and other content you create on the Platform.</li>
              <li><strong>Feedback and Reports:</strong> When you submit feedback, bug reports, or report other users.</li>
            </ul>

            <h3 className="text-base font-semibold text-foreground mt-3 mb-1">b) Information Collected Automatically</h3>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Usage Data:</strong> Pages visited, features used, time spent on the Platform, streak data, and gamification metrics (XP, levels, achievements).</li>
              <li><strong>Device Information:</strong> Browser type, operating system, device type, and screen resolution.</li>
              <li><strong>Log Data:</strong> IP address, access times, and referring URLs collected automatically by our servers.</li>
            </ul>

            <h3 className="text-base font-semibold text-foreground mt-3 mb-1">c) Information from Third Parties</h3>
            <p>We may receive information from authentication providers when you sign in. We do not currently integrate with third-party social login providers, but if we do in the future, we will update this policy accordingly.</p>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-2">
              <Eye size={18} className="text-emerald-400" />
              <h2 className="text-lg font-semibold text-foreground">2. How We Use Your Information</h2>
            </div>
            <p className="mb-2">We use the information we collect for the following purposes:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Providing, maintaining, and improving the Platform&apos;s features and functionality</li>
              <li>Personalizing your experience, including AI-powered recommendations and insights</li>
              <li>Tracking your progress, streaks, XP, and achievements within the gamification system</li>
              <li>Facilitating social features such as friend connections, messaging, leaderboards, and content sharing</li>
              <li>Sending you notifications about your activities, achievements, and platform updates</li>
              <li>Monitoring for fraud, abuse, and policy violations</li>
              <li>Analyzing usage patterns to improve user experience and platform performance</li>
              <li>Complying with legal obligations and enforcing our Terms and Conditions</li>
            </ul>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-2">
              <Globe size={18} className="text-amber-400" />
              <h2 className="text-lg font-semibold text-foreground">3. Google AdSense and Advertising</h2>
            </div>
            <p className="mb-2">We use Google AdSense to display advertisements on the Platform. Google AdSense may use cookies and similar technologies to serve ads based on your prior visits to our Platform or other websites. Google&apos;s use of advertising cookies enables it and its partners to serve ads based on your visit to our Platform and/or other sites on the Internet.</p>

            <h3 className="text-base font-semibold text-foreground mt-3 mb-1">Google AdSense Specifics</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Google AdSense uses a DoubleClick DART cookie to serve ads based on your browsing history</li>
              <li>Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Google Ads Settings</a></li>
              <li>Google may collect your IP address, browser type, and browsing behavior on our Platform to serve relevant ads</li>
              <li>We do not have access to Google&apos;s cookies, nor do we control the ads served by Google</li>
              <li>Ad content is the responsibility of Google and its advertisers, not S/R/E</li>
            </ul>

            <p className="mt-3">For more information about how Google uses your data, please review <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Google&apos;s Privacy Policy</a> and <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Google&apos;s Advertising Privacy information</a>.</p>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-2">
              <Cookie size={18} className="text-orange-400" />
              <h2 className="text-lg font-semibold text-foreground">4. Cookies and Tracking Technologies</h2>
            </div>
            <p className="mb-2">We use cookies and similar tracking technologies to track activity on our Platform and hold certain information. Cookies are files with small amounts of data that are sent to your browser from a website and stored on your device. We use the following types of cookies:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Essential Cookies:</strong> Required for the Platform to function properly (session authentication, security features)</li>
              <li><strong>Functional Cookies:</strong> Remember your preferences (theme, language settings)</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how users interact with the Platform</li>
              <li><strong>Advertising Cookies:</strong> Used by Google AdSense to serve personalized advertisements</li>
            </ul>
            <p className="mt-2">You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, some portions of the Platform may not function properly. We use NextAuth for session management, which relies on cookies for authentication.</p>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-2">
              <Lock size={18} className="text-rose-400" />
              <h2 className="text-lg font-semibold text-foreground">5. Data Security</h2>
            </div>
            <p className="mb-2">We implement reasonable security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. These measures include:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Encryption of passwords using industry-standard hashing algorithms</li>
              <li>Secure HTTPS connections for all data transmitted between your browser and our servers</li>
              <li>Authentication-based access control to protect user accounts</li>
              <li>Regular monitoring for unauthorized access and security vulnerabilities</li>
              <li>Database hosted on Neon (Vercel Postgres) with built-in encryption at rest and in transit</li>
            </ul>
            <p className="mt-2">However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your information, we cannot guarantee its absolute security.</p>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-2">
              <Users size={18} className="text-violet-400" />
              <h2 className="text-lg font-semibold text-foreground">6. Information Sharing and Disclosure</h2>
            </div>
            <p className="mb-2">We do not sell your personal information. We may share your information in the following circumstances:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Public Profiles:</strong> Information you choose to make public on your profile (name, username, achievements, streaks) is visible to other users</li>
              <li><strong>Leaderboards:</strong> Your ranking, XP, and level may be displayed on public leaderboards</li>
              <li><strong>Social Features:</strong> Content you post in the feed, comments, and shared items are visible according to your privacy settings</li>
              <li><strong>Service Providers:</strong> We share data with third-party service providers who assist in operating the Platform (hosting on Vercel, database on Neon, advertising via Google AdSense)</li>
              <li><strong>Legal Requirements:</strong> We may disclose information if required by law, regulation, or legal process</li>
              <li><strong>Safety:</strong> We may disclose information to protect the rights, property, or safety of S/R/E, our users, or the public</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">7. Data Retention</h2>
            <p>We retain your personal information for as long as your account is active or as needed to provide you services. If you wish to delete your account, you may do so through the Platform&apos;s settings page. Upon account deletion, we will remove your personal data from our active database within 30 days, except where we are required to retain certain information by law. Anonymous, aggregated data (such as overall platform usage statistics) may be retained indefinitely.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">8. Your Rights</h2>
            <p className="mb-2">Depending on your location, you may have the following rights regarding your personal data:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete personal data</li>
              <li><strong>Deletion:</strong> Request deletion of your personal data</li>
              <li><strong>Portability:</strong> Request a copy of your data in a structured, machine-readable format</li>
              <li><strong>Opt-out:</strong> Opt out of personalized advertising through Google Ads Settings</li>
              <li><strong>Restriction:</strong> Request restriction of processing of your personal data</li>
            </ul>
            <p className="mt-2">To exercise any of these rights, please contact us at myselfgowtham140707@gmail.com. We will respond to your request within 30 days.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">9. Children&apos;s Privacy</h2>
            <p>The Platform is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information. Users between 13 and 18 years of age must have parental or guardian consent to use the Platform.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">10. Third-Party Links</h2>
            <p>The Platform may contain links to third-party websites or services that are not owned or controlled by S/R/E. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services. We encourage you to review the privacy policies of any third-party sites you visit.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">11. International Data Transfers</h2>
            <p>Your information may be transferred to and processed in countries other than your own. Our Platform is hosted on Vercel and Neon, which may process data in the United States and other countries. By using the Platform, you consent to the transfer of your information to these countries, which may have different data protection laws than your jurisdiction.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">12. Changes to This Privacy Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date. Your continued use of the Platform after any changes constitutes your acceptance of the updated Privacy Policy.</p>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-2">
              <Mail size={18} className="text-blue-400" />
              <h2 className="text-lg font-semibold text-foreground">13. Contact Us</h2>
            </div>
            <p>If you have any questions or concerns about this Privacy Policy, please contact us:</p>
            <ul className="list-none mt-2 space-y-1">
              <li>Email: <a href="mailto:myselfgowtham140707@gmail.com" className="text-blue-400 hover:underline">myselfgowtham140707@gmail.com</a></li>
              <li>Instagram: <a href="https://www.instagram.com/myselfgowtham07?igsh=c2JudTYzYWg1bWx4" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">@myselfgowtham07</a></li>
              <li>YouTube: <a href="https://www.youtube.com/@myselfgowtham_07" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">@myselfgowtham_07</a></li>
            </ul>
          </section>

          <div className="pt-4 border-t border-border flex items-center flex-wrap gap-4">
            <Link href="/terms" className="text-blue-400 hover:underline text-sm">Terms &amp; Conditions</Link>
            <Link href="/community-guidelines" className="text-blue-400 hover:underline text-sm">Community Guidelines</Link>
            <Link href="/about" className="text-blue-400 hover:underline text-sm">About</Link>
            <Link href="/contact" className="text-blue-400 hover:underline text-sm">Contact</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
