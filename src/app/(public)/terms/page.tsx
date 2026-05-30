import { Zap, FileText, Scale, DollarSign, Mail } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL, CANONICAL_URL } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: `Read the Terms and Conditions for ${SITE_NAME}, the free gamified self-growth platform for fitness tracking, learning progression, and community.`,
  alternates: { canonical: `${CANONICAL_URL}/terms` },
  openGraph: {
    title: `Terms & Conditions — ${SITE_NAME}`,
    description: `Read the Terms and Conditions for ${SITE_NAME}, the free gamified self-growth platform.`,
    url: `${CANONICAL_URL}/terms`,
    type: 'website',
    siteName: SITE_NAME,
  },
  twitter: {
    card: 'summary',
    title: `Terms & Conditions — ${SITE_NAME}`,
    description: `Read the Terms and Conditions for ${SITE_NAME}.`,
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 dark:from-[#0A0F1E] dark:to-[#1E3A5F] relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="relative z-10 max-w-3xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <Logo size={40} />
          <h1 className="text-2xl font-bold text-foreground">Terms &amp; Conditions</h1>
        </div>

        <div className="glass-card p-6 sm:p-8 space-y-6 text-sm text-muted-foreground leading-relaxed">
          <p className="text-xs text-muted-foreground">Last updated: May 25, 2026</p>

          <section>
            <div className="flex items-center gap-2 mb-2">
              <FileText size={18} className="text-blue-400" />
              <h2 className="text-lg font-semibold text-foreground">1. Acceptance of Terms</h2>
            </div>
            <p>By accessing or using the S/R/E Gamified Self-Growth Platform (&quot;Platform&quot;), you agree to be bound by these Terms and Conditions (&quot;Terms&quot;). If you do not agree with any part of these Terms, you must not use the Platform. These Terms constitute a legally binding agreement between you and S/R/E, effective from the date you first access or use the Platform. We recommend that you print or save a copy of these Terms for your records.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">2. Description of Service</h2>
            <p>S/R/E (Start / Restart / Explore) is a gamified self-growth platform that helps users track and improve their Study (S), Routine (R), and Exercise (E) habits. The Platform provides features including but not limited to habit tracking, streak management, XP and leveling systems, social features (friend connections, messaging, leaderboards), AI-powered assistance and chatbot, fitness tracking and nutrition logging, learning management and journaling, content creation and sharing tools, time management features, achievement and badge systems, and community feed. The Platform is provided free of charge and is supported by advertising revenue through Google AdSense.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">3. User Accounts</h2>
            <p>You must create an account to use the Platform. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must provide accurate and complete information when creating your account and update such information to keep it accurate and complete. You are responsible for ensuring that your password is strong and not shared with any third party.</p>
            <p className="mt-2">You must be at least 13 years of age to use this Platform. If you are under 18, you must have parental or guardian consent to use the Platform. Parents or guardians who permit their children to use the Platform are responsible for their children&apos;s online activity and safety.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">4. User Conduct</h2>
            <p>You agree not to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Use the Platform for any unlawful purpose or in violation of any applicable laws</li>
              <li>Harass, bully, intimidate, or threaten other users</li>
              <li>Post content that is offensive, discriminatory, hateful, or explicit</li>
              <li>Impersonate another person or entity</li>
              <li>Attempt to gain unauthorized access to other users&apos; accounts or the Platform&apos;s systems</li>
              <li>Use automated scripts or bots to manipulate the Platform&apos;s gamification systems</li>
              <li>Share or distribute another user&apos;s personal information without consent</li>
              <li>Create multiple accounts for the purpose of manipulating the Platform</li>
              <li>Reverse-engineer, decompile, or disassemble any part of the Platform</li>
              <li>Click on advertisements fraudulently or encourage others to do so</li>
              <li>Interfere with or disrupt the Platform&apos;s advertising systems</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">5. Content</h2>
            <p>You retain ownership of any content you submit, post, or display on or through the Platform. By posting content, you grant S/R/E a worldwide, non-exclusive, royalty-free license to use, reproduce, and distribute such content in connection with the Platform&apos;s services. This license persists even after you stop using the Platform, but only to the extent necessary to provide the services.</p>
            <p className="mt-2">You are solely responsible for the content you share. You represent and warrant that you have all rights necessary to grant us the license described above, and that your content does not violate any third-party intellectual property rights. S/R/E reserves the right to remove any content that violates these Terms or our Community Guidelines, without prior notice.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">6. Privacy</h2>
            <p>Your use of the Platform is also governed by our <Link href="/privacy" className="text-blue-400 hover:underline">Privacy Policy</Link>, which describes how we collect, use, and share your information, including how we use Google AdSense and cookies. By using the Platform, you consent to our collection and use of data as outlined in our Privacy Policy. We encourage you to review the Privacy Policy carefully to understand our data practices.</p>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={18} className="text-emerald-400" />
              <h2 className="text-lg font-semibold text-foreground">7. Advertising</h2>
            </div>
            <p className="mb-2">The Platform is supported by advertising revenue through Google AdSense. By using the Platform, you acknowledge and agree that:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Advertisements may be displayed on the Platform in various formats, including banners, in-feed ads, and in-article ads</li>
              <li>Google AdSense uses cookies and web beacons to serve ads based on your prior visits to our Platform and other websites</li>
              <li>You may see both personalized and non-personalized ads while using the Platform</li>
              <li>You can opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Google Ads Settings</a></li>
              <li>S/R/E does not control the content of advertisements served by Google and is not responsible for the accuracy, legality, or appropriateness of ad content</li>
              <li>Any interactions with advertisements, including purchases, are between you and the advertiser, and S/R/E is not liable for any issues arising from such interactions</li>
              <li>You must not click on ads in a fraudulent manner or encourage others to do so, as this violates both these Terms and Google AdSense policies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">8. Gamification &amp; Virtual Rewards</h2>
            <p>The Platform includes gamification features such as XP, levels, streaks, achievements, and leaderboards. These virtual rewards have no real monetary value and cannot be exchanged for cash, cryptocurrency, or other real-world compensation. S/R/E reserves the right to modify, adjust, or reset gamification metrics at its discretion to maintain fairness and integrity of the system. We are not obligated to provide advance notice of such changes, though we will make reasonable efforts to do so.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">9. AI-Powered Features</h2>
            <p>The Platform uses artificial intelligence to provide recommendations, insights, and assistance through an AI chatbot and other features. AI-generated content may not always be accurate, complete, or appropriate for your specific situation. You should not rely solely on AI recommendations for health, fitness, financial, or other critical decisions. Always consult qualified professionals for medical, nutritional, psychological, or other professional advice. S/R/E is not liable for any decisions you make based on AI-generated content.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">10. Intellectual Property</h2>
            <p>The Platform and its original content (excluding user-generated content), features, and functionality are and will remain the exclusive property of S/R/E and its licensors. The Platform is protected by copyright, trademark, and other laws. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of S/R/E. You are granted a limited, non-exclusive, non-transferable, revocable license to access and use the Platform for personal, non-commercial purposes.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">11. Termination</h2>
            <p>S/R/E reserves the right to suspend or terminate your account at any time for violation of these Terms or for any other reason at our discretion. Upon termination, your right to use the Platform will immediately cease. You may delete your account at any time through the Platform&apos;s settings. Provisions of these Terms that by their nature should survive termination shall survive, including but not limited to provisions regarding content licenses, disclaimers, limitations of liability, and dispute resolution.</p>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-2">
              <Scale size={18} className="text-rose-400" />
              <h2 className="text-lg font-semibold text-foreground">12. Disclaimers</h2>
            </div>
            <p>The Platform is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, either express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, and non-infringement. S/R/E does not warrant that the Platform will be uninterrupted, timely, secure, or error-free. Use of the Platform is at your own risk. Any advice or information obtained through the Platform is used at your own risk, and S/R/E is not responsible for any outcomes resulting from such advice.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">13. Limitation of Liability</h2>
            <p>To the maximum extent permitted by applicable law, S/R/E and its founders, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the Platform. This includes, but is not limited to, damages for loss of data, goodwill, or other intangible losses, even if S/R/E has been advised of the possibility of such damages. In no event shall S/R/E&apos;s total liability exceed the amount of one hundred US dollars ($100) or the equivalent in your local currency.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">14. Indemnification</h2>
            <p>You agree to defend, indemnify, and hold harmless S/R/E and its founders, employees, and agents from and against any and all claims, damages, obligations, losses, liabilities, costs, or debt arising from your use of the Platform, your violation of these Terms, or your violation of any rights of another party. This indemnification obligation will survive the termination of your relationship with S/R/E.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">15. Changes to Terms</h2>
            <p>S/R/E may update these Terms from time to time. We will notify you of any material changes by posting the updated Terms on the Platform with an updated &quot;Last updated&quot; date. Your continued use of the Platform after such changes constitutes your acceptance of the updated Terms. We encourage you to review these Terms periodically for any changes.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">16. Governing Law</h2>
            <p>These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law provisions. Any disputes arising from these Terms or your use of the Platform shall be resolved in the courts of the applicable jurisdiction.</p>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-2">
              <Mail size={18} className="text-blue-400" />
              <h2 className="text-lg font-semibold text-foreground">17. Contact</h2>
            </div>
            <p>If you have any questions about these Terms, please contact us:</p>
            <ul className="list-none mt-2 space-y-1">
              <li>Email: <a href="mailto:myselfgowtham140707@gmail.com" className="text-blue-400 hover:underline">myselfgowtham140707@gmail.com</a></li>
              <li>Instagram: <a href="https://www.instagram.com/myselfgowtham07?igsh=c2JudTYzYWg1bWx4" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">@myselfgowtham07</a></li>
              <li>YouTube: <a href="https://www.youtube.com/@myselfgowtham_07" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">@myselfgowtham_07</a></li>
            </ul>
          </section>

          <div className="pt-4 border-t border-border flex items-center flex-wrap gap-4">
            <Link href="/privacy" className="text-blue-400 hover:underline text-sm">Privacy Policy</Link>
            <Link href="/community-guidelines" className="text-blue-400 hover:underline text-sm">Community Guidelines</Link>
            <Link href="/about" className="text-blue-400 hover:underline text-sm">About</Link>
            <Link href="/contact" className="text-blue-400 hover:underline text-sm">Contact</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
