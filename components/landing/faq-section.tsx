'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { HelpCircle, ChevronDown, ArrowRight } from 'lucide-react';
import { ScrollReveal } from './scroll-reveal';

const FAQS = [
  {
    question: 'Is GymLogger truly 100% free?',
    answer:
      'Yes! GymLogger is released under the permissive MIT Open-Source license. There are no hidden paywalls, no trial expirations, and no premium features locked behind in-app purchases. Everything is unlocked for everyone.',
  },
  {
    question: 'How do I get started?',
    answer:
      'Simply click "Register Now" to create your free account with your email and password. Once signed up, you can start logging workouts immediately, customize routines, and track your 1RM progression.',
  },
  {
    question: 'Can I export all of my training data?',
    answer:
      'Yes, 100% data sovereignty is a core philosophy of GymLogger. You can export your entire workout history, exercises, weights, reps, and RPE notes in standard JSON or CSV formats at any time.',
  },
  {
    question: 'Can I self-host GymLogger on my own VPS or homelab?',
    answer:
      'Absolutely. GymLogger is built with Next.js, React, and Supabase. You can clone the repo, connect your own Supabase project, and deploy it to Vercel, Docker, Fly.io, or your own hosting provider.',
  },
  {
    question: 'Does it work smoothly on mobile browsers inside the gym?',
    answer:
      'Yes. The interface is specifically designed with athletic mobile workflows in mind: large touch targets, rapid keypad numeric inputs, high contrast in harsh gym lighting, and minimal battery consumption.',
  },
  {
    question: 'How does 1RM calculation work?',
    answer:
      'GymLogger uses clinically validated Brzycki and Epley estimation formulas. Whenever you log a set with 1 to 10 reps, it automatically computes your estimated 1RM and alerts you if you achieved a new milestone.',
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-12 sm:py-20 lg:py-28 relative bg-surface-raised/30 border-t border-border/60">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal delayMs={0} direction="up">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-semibold uppercase tracking-wider mb-4">
              <HelpCircle className="w-3.5 h-3.5" />
              Frequently Asked Questions
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-text-primary">
              Got Questions? We Have Answers.
            </h2>
            <p className="mt-3 sm:mt-4 text-sm sm:text-lg text-text-muted">
              Everything you need to know about GymLogger, privacy, features, and self-hosting.
            </p>
          </div>
        </ScrollReveal>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <ScrollReveal key={faq.question} delayMs={idx * 60} direction="up">
                <div
                  className="rounded-2xl bg-surface border border-border/80 overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggleAccordion(idx)}
                    className="w-full p-4 sm:p-6 min-h-[52px] text-left flex items-center justify-between gap-3 sm:gap-4 cursor-pointer hover:bg-surface-raised/60 active:bg-surface-raised transition-colors focus-ring"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm sm:text-lg font-semibold text-text-primary pr-2">
                      {faq.question}
                    </span>
                    <div
                      className={`w-9 h-9 sm:w-8 sm:h-8 rounded-lg bg-surface-raised flex items-center justify-center shrink-0 text-text-muted transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-accent' : ''
                      }`}
                    >
                      <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-4 sm:px-6 pb-5 sm:pb-6 pt-1 text-sm sm:text-base text-text-muted leading-relaxed border-t border-border/40 animate-in fade-in duration-150">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        <ScrollReveal delayMs={150} direction="up">
          <div className="mt-12 text-center">
            <p className="text-sm text-text-muted">
              Have more questions or want to request an exercise?{' '}
              <Link
                href="/register"
                className="text-accent font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                Register now and get in touch
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
