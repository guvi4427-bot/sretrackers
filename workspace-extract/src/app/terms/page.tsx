import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL, SITE_SHORT_NAME } from '@/lib/site-config';

export const metadata: Metadata = {
  title: `Terms of Service — ${SITE_SHORT_NAME} Platform`,
  description: `Terms and conditions for using ${SITE_SHORT_NAME}. Read about acceptable use, user responsibilities, content policies, and platform guidelines.`,
  alternates: { canonical: `${SITE_URL}/terms` },
  openGraph: {
    title: `Terms of Service — ${SITE_SHORT_NAME} Platform`,
    description: `Terms and conditions for using ${SITE_SHORT_NAME}.`,
    url: `${SITE_URL}/terms`,
  },
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        <p className="text-muted-foreground mb-8"><strong>Last updated:</strong> 2025</p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Acceptance of Terms</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            By accessing and using {SITE_SHORT_NAME}, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by these terms, please do not use this platform. These terms apply to all visitors, users, and others who access or use {SITE_SHORT_NAME}.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            We reserve the right to modify these terms at any time. We will always try to notify users of significant changes. Your continued use of the platform after any such changes constitutes your acceptance of the new terms. We encourage you to review this page periodically for the latest information on our terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">User Accounts</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account. You must immediately notify us of any unauthorized use of your account. We shall not be liable for any loss or damage arising from your failure to comply with this section.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            You must provide accurate and complete information when creating an account. Creating multiple accounts, impersonating other users, or using automated systems to create accounts is strictly prohibited and may result in immediate account termination.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Acceptable Use</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            You agree to use {SITE_SHORT_NAME} only for lawful purposes and in a way that does not infringe the rights of, restrict, or inhibit anyone else&apos;s use and enjoyment of the platform. Prohibited behavior includes harassing or causing distress or inconvenience to any other user, transmitting obscene or offensive content, disrupting the normal flow of dialogue within the platform, and any other conduct that would be considered inappropriate in a community-focused self-improvement platform.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Content posted on {SITE_SHORT_NAME} should be related to self-improvement, learning, fitness, content creation, or community building. Spam, misinformation, hate speech, and illegal content are strictly prohibited and will be removed. Repeat offenders will have their accounts suspended or permanently banned.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Content Ownership</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            You retain ownership of all content you create and post on {SITE_SHORT_NAME}. By posting content, you grant us a non-exclusive, worldwide, royalty-free license to use, reproduce, modify, and display the content in connection with providing and promoting the platform. This license continues as long as your content remains on the platform.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            You are solely responsible for the content you post. We do not endorse, verify, or guarantee the accuracy of user-generated content. Any content that violates these terms or applicable laws may be removed at our discretion without prior notice.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Disclaimer</h2>
          <p className="text-muted-foreground leading-relaxed">
            {SITE_SHORT_NAME} is provided on an &quot;as is&quot; and &quot;as available&quot; basis. We make no warranties, expressed or implied, and hereby disclaim all warranties, including without limitation, implied warranties of merchantability and fitness for a particular purpose. We do not warrant that the platform will be uninterrupted, timely, secure, or error-free. The fitness and health-related information provided on this platform is for informational purposes only and should not be considered medical advice.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Limitation of Liability</h2>
          <p className="text-muted-foreground leading-relaxed">
            In no event shall {SITE_SHORT_NAME}, its directors, employees, partners, agents, suppliers, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the platform, any conduct or content of any third party on the platform, or any content obtained from the platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Contact</h2>
          <p className="text-muted-foreground leading-relaxed">
            For questions about these terms, please contact us through our <a href="/contact" className="text-blue-400 hover:text-blue-300 underline">Contact Page</a>.
          </p>
        </section>
      </div>
    </main>
  );
}
