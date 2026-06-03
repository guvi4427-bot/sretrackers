import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL, CANONICAL_URL } from '@/lib/site-config';
import FAQClient from './client';

const PAGE_SLUG = 'faq';
const PAGE_TITLE = `Frequently Asked Questions — ${SITE_NAME}`;
const PAGE_DESCRIPTION =
  'Get answers to common questions about SRE Track — how XP works, streaks, achievements, AI features, fitness tracking, learning tools, and more. Everything you need to know about the gamified self-growth platform.';

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    'SRE FAQ',
    'frequently asked questions',
    'how XP works',
    'how streaks work',
    'achievements system',
    'AI features',
    'fitness tracking FAQ',
    'learning tracker FAQ',
    'self-growth platform FAQ',
    'gamification FAQ',
  ],
  alternates: { canonical: `${CANONICAL_URL}/${PAGE_SLUG}` },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: `${SITE_URL}/${PAGE_SLUG}`,
    siteName: SITE_NAME,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },
};

const FAQ_DATA = [
  {
    question: 'What is SRE?',
    answer: 'SRE stands for Start, Restart, Explore — a free gamified self-growth platform that helps you build better habits, track your progress, and stay motivated. Whether you are starting a new habit, restarting after a setback, or exploring new areas of growth, SRE provides the tools, community, and gamification to make self-improvement feel like an adventure rather than a chore.',
  },
  {
    question: 'How does the XP system work?',
    answer: 'XP (Experience Points) are earned for every positive action you take on the platform. Logging a workout earns 15-30 XP, completing a study session earns 10-25 XP, publishing content earns 15-30 XP, and daily logins earn 5 XP. As you accumulate XP, you level up and unlock new titles. XP also determines your position on the leaderboard, making growth both personal and social.',
  },
  {
    question: 'How do streaks work?',
    answer: 'Streaks track your consecutive days of activity. You can build separate streaks for daily logins, workouts, study sessions, and content creation. Each streak has a current count and a personal best. Maintaining streaks earns you bonus XP multipliers — the longer your streak, the bigger the multiplier. If you miss a day, your streak resets, but your personal best is always saved for motivation.',
  },
  {
    question: 'How do achievements work?',
    answer: 'Achievements are milestone rewards that unlock when you hit specific goals. They come in rarities from Common to Mythic, with higher-rarity achievements giving more XP. Examples include "First Step" (Common, 10 XP) for completing your first task, "Iron Will" (Epic, 100 XP) for a 30-day streak, and "Unstoppable" (Mythic, 500 XP) for a 365-day streak. You can view all achievements and track your progress toward unlocking them.',
  },
  {
    question: 'How does the AI assistant work?',
    answer: 'SRE includes an AI-powered chatbot that provides personalized recommendations, progress check-ins, and motivation. The AI can estimate calorie burns for workouts, suggest optimal posting times for content, classify tasks by priority, and review your daily productivity. It understands your goals and habits to give relevant, actionable advice tailored to your self-growth journey.',
  },
  {
    question: 'How does fitness tracking work?',
    answer: 'The fitness tracker lets you log workouts with exercises, duration, and calories burned. You can also track meals with detailed macro breakdowns (protein, carbs, fat) and monitor your weight over time with visual progress charts. AI-powered features include calorie burn estimates and daily health ratings. Every workout and meal earns XP, turning your fitness journey into a gamified experience.',
  },
  {
    question: 'How does the learning tracker work?',
    answer: 'The learning tracker helps you organize study topics, log study entries with notes and reflections, and visualize your learning progress. You can bookmark topics for quick access, share your learning journey with the community, and track streaks for consistent study habits. AI-powered progress checks provide personalized insights on your knowledge growth. Every study session earns XP.',
  },
  {
    question: 'Is SRE free to use?',
    answer: 'Yes, SRE is completely free to use. There are no paywalls blocking your progress or limiting features. The core platform — fitness tracking, learning tools, content creation, gamification, AI assistant, and community features — is available to all users at no cost. We believe self-improvement should be accessible to everyone.',
  },
  {
    question: 'What is StudiCate?',
    answer: 'StudiCate is an upcoming feature within the SRE ecosystem designed specifically for students. It will offer structured study plans, exam preparation tools, collaborative study groups, and AI-powered tutoring. StudiCate aims to make academic success feel achievable and engaging by applying the same gamification principles that make SRE effective for self-growth.',
  },
  {
    question: 'What is MentoLance?',
    answer: 'MentoLance is a planned feature that will connect users with mentors and coaches in their areas of interest. Whether you need guidance on fitness, career development, or creative skills, MentoLance will match you with experienced mentors who can provide personalized advice and accountability. It extends the SRE philosophy of community-driven growth into structured mentorship.',
  },
];

export default function FAQPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_DATA.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <FAQClient faqs={FAQ_DATA} />
    </>
  );
}
