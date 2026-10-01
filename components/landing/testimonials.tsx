'use client';

import React from 'react';
import { Star, ShieldCheck, Dumbbell, UserCheck } from 'lucide-react';
import { ScrollReveal } from './scroll-reveal';

const REVIEWS = [
  {
    author: 'Marcus Vance',
    role: 'Competitive Powerlifter',
    location: 'Austin, TX',
    comment:
      'I got tired of mainstream apps putting basic routine limits behind a $70/year paywall. GymLogger does everything right: fast set logging, accurate 1RM calculations, and instant loading between heavy sets.',
    stars: 5,
    tag: 'Squat 230kg • Bench 165kg',
  },
  {
    author: 'Elena Rostova',
    role: 'Physique Competitor & Coach',
    location: 'London, UK',
    comment:
      'The RPE tracking and rest timer stopwatch are game-changers for hypertrophy programming. It has zero fluff, zero advertisements, and saves battery life during two-hour sessions.',
    stars: 5,
    tag: 'Hypertrophy Focus',
  },
  {
    author: 'David Chen',
    role: 'Senior Software Engineer & Lifter',
    location: 'Seattle, WA',
    comment:
      'Finding an open-source fitness app built with Next.js and Supabase that actually feels polished is rare. I exported all my historical data to JSON in seconds. 10/10.',
    stars: 5,
    tag: 'Self-Hosted Lifter',
  },
];

export function Testimonials() {
  return (
    <section className="py-12 sm:py-20 lg:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal delayMs={0} direction="up">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-semibold uppercase tracking-wider mb-4">
              <UserCheck className="w-3.5 h-3.5" />
              Athlete Tested
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-text-primary">
              Loved By Serious Lifters & Builders
            </h2>
            <p className="mt-3 sm:mt-4 text-sm sm:text-lg text-text-muted">
              From competitive barbell athletes to weekend gym enthusiasts, here is what athletes say about GymLogger.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REVIEWS.map((review, idx) => (
            <ScrollReveal key={review.author} delayMs={idx * 100} direction="up">
              <div
                className="h-full p-6 sm:p-8 rounded-2xl bg-surface border border-border/80 shadow-lg hover:border-accent/40 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 text-accent mb-4">
                    {[...Array(review.stars)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-accent" />
                    ))}
                  </div>
                  <p className="text-text-muted text-sm sm:text-base leading-relaxed italic">
                    &ldquo;{review.comment}&rdquo;
                  </p>
                </div>

                <div className="mt-6 pt-5 border-t border-border/60">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-text-primary">
                        {review.author}
                      </h4>
                      <p className="text-xs text-text-subtle">
                        {review.role} • {review.location}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono font-medium px-2 py-1 rounded bg-surface-raised text-text-muted border border-border">
                      {review.tag}
                    </span>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
