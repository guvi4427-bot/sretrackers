import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL, SITE_SHORT_NAME } from '@/lib/site-config';

export const metadata: Metadata = {
  title: `Privacy Policy — ${SITE_SHORT_NAME} Platform`,
  description: `How ${SITE_SHORT_NAME} collects, uses, and protects your personal information. Learn about our data practices, cookie usage, and third-party services.`,
  alternates: { canonical: `${SITE_URL}/privacy` },
  openGraph: {
    title: `Privacy Policy — ${SITE_SHORT_NAME} Platform`,
    description: `How ${SITE_SHORT_NAME} collects, uses, and protects your personal information.`,
    url: `${SITE_URL}/privacy`,
  },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8"><strong>Last updated:</strong> 2025</p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Information We Collect</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We collect information you provide when creating an account, posting updates, or using platform features. This includes your name, email address, profile bio, and progression content such as learning entries, workout logs, and content creation updates. We also collect information about your interactions with the platform, including pages visited, features used, and time spent on various activities.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            When you use the fitness tracking features, we collect workout data, weight logs, and calorie information that you voluntarily enter. When you use the learning features, we collect topic selections, study session logs, and progress data. All of this information is tied to your account and is used to provide you with a personalized experience and accurate progression tracking.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">How We Use Your Information</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We use collected information to operate the platform, improve features, personalize your experience, and display relevant advertising through Google AdSense. Your data is used to calculate your XP, level, streaks, and achievements in our gamification system. It is also used to populate your public profile, progression feed, and shared updates when you choose to make them visible.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            We may use aggregated, anonymized data to analyze platform usage patterns, improve our recommendation algorithms, and enhance the overall user experience. We will never sell your personal information to third parties. Your data remains yours, and you can request deletion at any time by contacting us through our contact page.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Google AdSense and Advertising</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            This site uses Google AdSense to display advertisements. Google may use cookies to serve ads based on your prior visits to this and other websites. Google&apos;s use of advertising cookies enables it and its partners to serve ads based on your visit to this site and/or other sites on the Internet. You may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" className="text-blue-400 hover:text-blue-300 underline">Google Ads Settings</a>.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            AdSense ads are displayed on public pages including the feed, discover page, and public profiles. Ads are not displayed behind authentication walls, ensuring compliance with Google AdSense policies. The presence of advertising allows us to keep the platform free for all users while continuing to develop and improve features.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Cookies</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We use cookies to maintain sessions, remember preferences, and serve personalized ads via Google AdSense. Essential cookies are required for authentication, session management, and security features. These cookies cannot be disabled as the platform cannot function without them.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Analytics cookies help us understand how users interact with the platform, which features are most popular, and where we can make improvements. Advertising cookies are used by Google AdSense to deliver relevant ads. You can manage your cookie preferences through your browser settings at any time. Please note that disabling certain cookies may affect the functionality of the platform.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Third-Party Services</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We use Google AdSense for advertising, Google Analytics for usage analytics, and Vercel for infrastructure and hosting. Each of these third-party services has its own privacy policy governing the collection and use of your data. We encourage you to review their respective privacy policies for more detailed information about their data practices.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            We use NextAuth for authentication, which may process your email address and basic profile information during sign-up and login. We do not share your personal data with any other third parties beyond what is necessary to operate the platform and deliver the services described in this privacy policy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Data Security</h2>
          <p className="text-muted-foreground leading-relaxed">
            We implement industry-standard security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. All data is transmitted over HTTPS, passwords are hashed and never stored in plain text, and access to personal data is restricted to authorized personnel only. While no system is completely secure, we continuously work to protect your information and promptly address any potential vulnerabilities that may be identified.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Your Rights</h2>
          <p className="text-muted-foreground leading-relaxed">
            You have the right to access, correct, or delete your personal data at any time. You can update your profile information through the settings page. If you wish to delete your account and all associated data, you can do so through the settings page or by contacting us directly. Upon account deletion, your personal data will be removed from our systems within 30 days, except where retention is required by law.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Contact</h2>
          <p className="text-muted-foreground leading-relaxed">
            For privacy questions, concerns, or data requests, please contact us through our <a href="/contact" className="text-blue-400 hover:text-blue-300 underline">Contact Page</a>. We aim to respond to all privacy-related inquiries within 48 hours.
          </p>
        </section>
      </div>
    </main>
  );
}
