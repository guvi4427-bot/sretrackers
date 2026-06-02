'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle, ChevronDown, Search, ArrowRight,
  Zap, Flame, Award, Brain, Dumbbell, BookOpen,
  Shield, Users, Sparkles, Target, ChevronRight,
} from 'lucide-react';
import { GlassCard } from '@/components/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SITE_NAME } from '@/lib/site-config';

interface FAQ {
  question: string;
  answer: string;
}

interface FAQClientProps {
  faqs: FAQ[];
}

const CATEGORY_ICONS: Record<string, { icon: typeof HelpCircle; color: string; bg: string }> = {
  'SRE': { icon: Target, color: 'text-blue-400', bg: 'bg-blue-600/10' },
  'XP': { icon: Zap, color: 'text-amber-400', bg: 'bg-amber-600/10' },
  'streak': { icon: Flame, color: 'text-orange-400', bg: 'bg-orange-600/10' },
  'achievement': { icon: Award, color: 'text-purple-400', bg: 'bg-purple-600/10' },
  'AI': { icon: Brain, color: 'text-cyan-400', bg: 'bg-cyan-600/10' },
  'fitness': { icon: Dumbbell, color: 'text-emerald-400', bg: 'bg-emerald-600/10' },
  'learning': { icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-600/10' },
  'free': { icon: Shield, color: 'text-green-400', bg: 'bg-green-600/10' },
  'StudiCate': { icon: Users, color: 'text-violet-400', bg: 'bg-violet-600/10' },
  'MentoLance': { icon: Sparkles, color: 'text-rose-400', bg: 'bg-rose-600/10' },
};

function getCategoryForQuestion(q: string): string {
  const lower = q.toLowerCase();
  if (lower.includes('sre') && !lower.includes('streak')) return 'SRE';
  if (lower.includes('xp')) return 'XP';
  if (lower.includes('streak')) return 'streak';
  if (lower.includes('achievement')) return 'achievement';
  if (lower.includes('ai')) return 'AI';
  if (lower.includes('fitness')) return 'fitness';
  if (lower.includes('learning')) return 'learning';
  if (lower.includes('free')) return 'free';
  if (lower.includes('studicate')) return 'StudiCate';
  if (lower.includes('mentolance')) return 'MentoLance';
  return 'SRE';
}

export default function FAQClient({ faqs }: FAQClientProps) {
  const router = useRouter();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = faqs.filter((faq) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return faq.question.toLowerCase().includes(q) || faq.answer.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/50 dark:from-[#0A0F1E] dark:to-[#0F1520] relative overflow-hidden">
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-blue-600/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-600/8 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-4">
            <HelpCircle size={14} /> Help & Support
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Frequently Asked Questions
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Everything you need to know about {SITE_NAME} — from how the gamification system works to details about upcoming features like StudiCate and MentoLance.
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <GlassCard variant="default" className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={16} />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions..."
                className="bg-accent border-border text-foreground pl-10"
              />
            </div>
          </GlassCard>
        </motion.div>

        {/* FAQ List */}
        <div className="space-y-2 mb-8">
          <AnimatePresence>
            {filteredFaqs.map((faq, index) => {
              const cat = getCategoryForQuestion(faq.question);
              const catInfo = CATEGORY_ICONS[cat] || CATEGORY_ICONS['SRE'];
              const isOpen = openIndex === index;

              return (
                <motion.div
                  key={faq.question}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <GlassCard variant="default" className="overflow-hidden">
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                      className="w-full p-4 flex items-center gap-3 text-left hover:bg-accent/10 transition-colors"
                    >
                      <div className={`w-8 h-8 rounded-lg ${catInfo.bg} flex items-center justify-center shrink-0`}>
                        <catInfo.icon size={16} className={catInfo.color} />
                      </div>
                      <span className="flex-1 text-sm font-medium text-foreground">{faq.question}</span>
                      <ChevronDown
                        size={16}
                        className={`text-muted-foreground shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 pl-15">
                            <div className="ml-11 text-sm text-muted-foreground leading-relaxed border-t border-border/30 pt-3">
                              {faq.answer}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </GlassCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {filteredFaqs.length === 0 && (
          <GlassCard variant="default" className="p-8 text-center mb-8">
            <HelpCircle size={32} className="mx-auto mb-3 text-muted-foreground/30" />
            <h3 className="text-lg font-bold text-foreground mb-2">No matching questions</h3>
            <p className="text-sm text-muted-foreground">Try a different search term or browse all questions.</p>
          </GlassCard>
        )}

        {/* More Help */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <GlassCard variant="liquid" className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Still Have Questions?</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Our help center has detailed guides on every feature. You can also reach out to the community or contact our support team for personalized assistance. We are here to help you get the most out of your {SITE_NAME} experience and ensure your self-growth journey is smooth and rewarding.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => router.push('/help')}
                className="flex items-center gap-2 p-3 rounded-xl bg-blue-600/10 hover:bg-blue-600/15 transition-colors text-sm text-blue-400 font-medium"
              >
                <HelpCircle size={16} /> Help Center
              </button>
              <button
                onClick={() => router.push('/docs')}
                className="flex items-center gap-2 p-3 rounded-xl bg-purple-600/10 hover:bg-purple-600/15 transition-colors text-sm text-purple-400 font-medium"
              >
                <BookOpen size={16} /> Documentation
              </button>
              <button
                onClick={() => router.push('/contact')}
                className="flex items-center gap-2 p-3 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/15 transition-colors text-sm text-emerald-400 font-medium"
              >
                <Users size={16} /> Contact Us
              </button>
            </div>
          </GlassCard>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <GlassCard variant="glowing" className="p-6 text-center">
            <Sparkles size={28} className="mx-auto mb-3 text-amber-400" />
            <h2 className="text-xl font-bold text-foreground mb-2">Ready to Start?</h2>
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              Join {SITE_NAME} for free and experience gamified self-growth firsthand. Track fitness, learning, content, and more — all while earning XP and achievements.
            </p>
            <Button onClick={() => router.push('/signup')} className="gradient-blue">
              Get Started Free <ArrowRight size={14} className="ml-1" />
            </Button>
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
              <button onClick={() => router.push('/help')} className="hover:text-foreground transition-colors flex items-center gap-1">
                Help Center <ChevronRight size={12} />
              </button>
              <button onClick={() => router.push('/roadmap')} className="hover:text-foreground transition-colors flex items-center gap-1">
                Roadmap <ChevronRight size={12} />
              </button>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
