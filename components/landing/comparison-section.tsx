'use client';

import React from 'react';
import Link from 'next/link';
import { Check, X, Shield, ArrowRight, Sparkles } from 'lucide-react';
import { ScrollReveal } from './scroll-reveal';

const COMPARISON_ROWS = [
  {
    feature: 'In-App Advertisements',
    gymLogger: '0 Ads Ever (Pure Focus)',
    others: 'Popups & unskippable video ads',
    isAdvantage: true,
  },
  {
    feature: 'Data Privacy & Telemetry',
    gymLogger: '0 Trackers (100% Private)',
    others: 'Advertising IDs & tracking pixels',
    isAdvantage: true,
  },
  {
    feature: 'Ease of Use & Simplicity',
    gymLogger: 'Instant 2-tap set logging',
    others: 'Cluttered UI & promotional popups',
    isAdvantage: true,
  },
  {
    feature: 'Custom Workout Routines',
    gymLogger: 'Unlimited (Free)',
    others: 'Capped at 3 routines on free tier',
    isAdvantage: true,
  },
  {
    feature: 'Complete Workout History',
    gymLogger: 'Lifetime storage, zero limits',
    others: 'Locked behind paywall after 3 months',
    isAdvantage: true,
  },
  {
    feature: '1RM & Progressive Analytics',
    gymLogger: 'Full Brzycki & Epley calculations',
    others: 'Requires "Pro" subscription',
    isAdvantage: true,
  },
  {
    feature: 'Data Export (CSV / JSON)',
    gymLogger: '1-click export anytime',
    others: 'Locked or restricted',
    isAdvantage: true,
  },
  {
    feature: 'Monthly / Annual Cost',
    gymLogger: '$0 (MIT Open-Source Forever)',
    others: '$49.99 – $99.99 / year',
    isAdvantage: true,
  },
];

export function ComparisonSection() {
  return (
    <section id="comparison" className="py-12 sm:py-20 lg:py-28 relative bg-surface-raised/40 border-y border-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <ScrollReveal delayMs={0} direction="up">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-semibold uppercase tracking-wider mb-4">
              <Shield className="w-3.5 h-3.5" />
              True Value Comparison
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-text-primary">
              Why Lifters Are Switching To{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-emerald-400">
                Open Source
              </span>
            </h2>
            <p className="mt-3 sm:mt-4 text-sm sm:text-lg text-text-muted">
              See how GymLogger compares against typical subscription-based workout tracker apps.
            </p>
          </div>
        </ScrollReveal>

        {/* Comparison Container */}
        <ScrollReveal delayMs={150} direction="up">
          <div className="max-w-4xl mx-auto rounded-3xl bg-surface border border-border/80 shadow-2xl overflow-hidden">
            {/* Desktop Table (hidden on mobile < sm) */}
            <div className="hidden sm:block">
              <div className="grid grid-cols-12 bg-surface-raised border-b border-border/80 p-4 sm:p-6 text-sm font-bold">
                <div className="col-span-6 text-text-muted uppercase text-xs tracking-wider">
                  Feature
                </div>
                <div className="col-span-3 text-accent flex items-center gap-1.5 font-bold">
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  GymLogger
                </div>
                <div className="col-span-3 text-text-subtle font-medium">
                  Commercial Apps
                </div>
              </div>

              <div className="divide-y divide-border/60">
                {COMPARISON_ROWS.map((row) => (
                  <div
                    key={row.feature}
                    className="grid grid-cols-12 p-4 sm:p-5 text-sm items-center hover:bg-surface-raised/40 transition-colors"
                  >
                    {/* Feature Name */}
                    <div className="col-span-6 font-medium text-text-primary pr-2">
                      {row.feature}
                    </div>

                    {/* GymLogger */}
                    <div className="col-span-3 flex items-center gap-2 text-text-primary font-semibold text-sm">
                      <div className="w-5 h-5 rounded-full bg-accent/20 text-accent flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                      <span className="text-accent">{row.gymLogger}</span>
                    </div>

                    {/* Commercial Apps */}
                    <div className="col-span-3 flex items-center gap-2 text-text-subtle text-sm">
                      <div className="w-5 h-5 rounded-full bg-danger-bg text-danger flex items-center justify-center shrink-0">
                        <X className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                      <span className="line-through text-text-subtle/80">{row.others}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Cards (visible on < sm) */}
            <div className="sm:hidden p-3.5 space-y-3">
              {COMPARISON_ROWS.map((row) => (
                <div 
                  key={row.feature} 
                  className="bg-surface-raised/70 p-3.5 rounded-2xl border border-border/80 shadow-sm"
                >
                  <h4 className="text-xs uppercase tracking-wider font-bold text-text-muted mb-2.5">
                    {row.feature}
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-accent/10 border border-accent/25">
                      <div className="flex items-center gap-2 text-xs font-bold text-accent">
                        <div className="w-5 h-5 rounded-full bg-accent/20 text-accent flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        </div>
                        <span>GymLogger</span>
                      </div>
                      <span className="text-xs font-semibold text-text-primary text-right">
                        {row.gymLogger}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface border border-border/60">
                      <div className="flex items-center gap-2 text-xs font-medium text-text-subtle">
                        <div className="w-5 h-5 rounded-full bg-danger-bg text-danger flex items-center justify-center shrink-0">
                          <X className="w-3.5 h-3.5 stroke-[2.5]" />
                        </div>
                        <span>Other Apps</span>
                      </div>
                      <span className="text-xs text-text-subtle line-through text-right">
                        {row.others}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Table Bottom Call to Action */}
            <div className="p-4 sm:p-6 bg-gradient-to-r from-surface via-surface-raised to-surface border-t border-border/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <p className="text-sm font-bold text-text-primary">
                  Stop paying $60+/year to track your squats and deadlifts.
                </p>
                <p className="text-xs text-text-muted mt-0.5">
                  Join thousands of athletes owning their fitness journey.
                </p>
              </div>
              <Link
                href="/register"
                className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-accent text-accent-foreground font-bold text-sm hover:bg-accent-hover shadow-lg active:scale-98 transition-all duration-200 cursor-pointer whitespace-nowrap"
              >
                <span>Register Now For Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
