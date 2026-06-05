import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL, SITE_SHORT_NAME } from '@/lib/site-config';

export const metadata: Metadata = {
  title: `Community Guidelines — ${SITE_SHORT_NAME} Platform`,
  description: `Community guidelines for ${SITE_SHORT_NAME}. Learn about our standards for respectful interaction, content policies, and how we maintain a supportive self-improvement community.`,
  alternates: { canonical: `${SITE_URL}/community-guidelines` },
  openGraph: {
    title: `Community Guidelines — ${SITE_SHORT_NAME} Platform`,
    description: `Community guidelines and standards for the ${SITE_SHORT_NAME} self-improvement community.`,
    url: `${SITE_URL}/community-guidelines`,
  },
  robots: { index: true, follow: true },
};

export default function CommunityGuidelinesPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">Community Guidelines</h1>
        <p className="text-muted-foreground mb-8">
          {SITE_SHORT_NAME} is a community built around progression, accountability, and mutual support. These guidelines help us maintain a positive environment where everyone can grow together.
        </p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Be Respectful</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Treat every member of the {SITE_SHORT_NAME} community with respect and kindness. We are all on different points of our self-improvement journeys, and everyone&apos;s progress is valid regardless of pace or scale. Dismissive, condescending, or discouraging comments have no place in this community.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Constructive feedback is welcome when it is offered respectfully and with genuine intent to help. However, unsolicited criticism that tears down rather than builds up is not acceptable. Remember that behind every profile is a real person putting in effort to improve themselves, and that effort deserves recognition.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Celebrate Progress, Not Perfection</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            {SITE_SHORT_NAME} is about consistency, not perfection. A 5-minute study session is worth celebrating. A single push-up is progress. Restarting after a break is a victory. We encourage members to share their authentic journey, including the struggles and setbacks, not just the highlights.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Do not compare your chapter 1 to someone else&apos;s chapter 20. The progression feed is designed to inspire and motivate, not to create feelings of inadequacy. If you find yourself feeling discouraged by others&apos; progress, remember that everyone starts somewhere and that consistency compounds over time.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">No Spam or Misinformation</h2>
          <p className="text-muted-foreground leading-relaxed">
            Do not post spam, promotional content, misleading information, or content that is not related to self-improvement, learning, fitness, or content creation. This includes unsolicited advertisements, fake progress updates, plagiarized content, and any material designed to mislead or manipulate other users. Such content will be removed, and repeat offenders will face account suspension.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Zero Tolerance for Harmful Content</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We have zero tolerance for hate speech, harassment, bullying, threats, or any form of discrimination based on race, ethnicity, gender, sexual orientation, religion, disability, or any other personal characteristic. Content that promotes eating disorders, self-harm, or dangerous activities will be removed immediately.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            If you encounter content that violates these guidelines, please use the report feature available on every profile and post. Our moderation team reviews all reports promptly and takes appropriate action, which may include content removal, warnings, temporary suspensions, or permanent account bans depending on the severity of the violation.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Privacy and Consent</h2>
          <p className="text-muted-foreground leading-relaxed">
            Respect the privacy of other community members. Do not share personal information about others without their explicit consent. Do not screenshot and repost private conversations or shared content that was intended to be private. If someone has a private account, respect their choice to limit their audience and do not attempt to circumvent their privacy settings.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Reporting and Enforcement</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            If you see content or behavior that violates these community guidelines, please report it using the built-in reporting tools. Reports are reviewed by our moderation team, and appropriate action is taken based on the severity and context of the violation. We strive to be fair and consistent in our enforcement while prioritizing the safety and well-being of our community.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Enforcement actions may include: content removal, formal warnings, temporary account suspension, or permanent account ban. Appeals can be submitted through the contact page if you believe an enforcement action was taken in error. We are committed to maintaining a safe and supportive community for all members.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Contact</h2>
          <p className="text-muted-foreground leading-relaxed">
            For questions about these community guidelines or to report a violation, please visit our <a href="/contact" className="text-blue-400 hover:text-blue-300 underline">Contact Page</a> or use the in-app reporting feature.
          </p>
        </section>
      </div>
    </main>
  );
}
