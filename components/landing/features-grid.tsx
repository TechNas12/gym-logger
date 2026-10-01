'use client';

import React from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  Trophy, 
  Timer, 
  Layers, 
  Download, 
  Calculator, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  Flame, 
  Zap, 
  Activity 
} from 'lucide-react';
import { ScrollReveal } from './scroll-reveal';

const FEATURES = [
  {
    icon: TrendingUp,
    badge: 'Progressive Overload',
    title: 'Beat Yesterday’s Numbers',
    description:
      'Previous workout targets and PR numbers automatically populate behind every set so you never guess whether to add weight or push for another rep.',
    accentColor: 'text-accent',
    bgGlow: 'group-hover:border-accent/40',
    highlight: 'Auto-fills last session values',
  },
  {
    icon: Trophy,
    badge: 'Real-Time Records',
    title: '1RM & Milestone Detection',
    description:
      'Real-time calculation of your estimated 1RM using Brzycki and Epley equations. Receive instantaneous PR banners for 1RM, 3RM, 5RM, and volume records.',
    accentColor: 'text-orange-400',
    bgGlow: 'group-hover:border-orange-500/40',
    highlight: 'Instant PR celebrations',
  },
  {
    icon: Timer,
    badge: 'Smart Stopwatch',
    title: 'Automated Rest Timers',
    description:
      'Check off a heavy set and your rest timer automatically engages. Audible and subtle vibration alerts ensure you stay disciplined between sets.',
    accentColor: 'text-emerald-400',
    bgGlow: 'group-hover:border-emerald-500/40',
    highlight: 'Quick +30s / -30s controls',
  },
  {
    icon: Layers,
    badge: 'Training Protocols',
    title: 'Supersets & Drop Sets',
    description:
      'Group paired exercises into supersets, log rest-pause clusters, track myo-reps, and add drop sets with custom percentage deltas.',
    accentColor: 'text-cyan-400',
    bgGlow: 'group-hover:border-cyan-500/40',
    highlight: 'Built for advanced lifters',
  },
  {
    icon: Calculator,
    badge: 'Gym Math',
    title: 'Olympic Plate Calculator',
    description:
      'Stop calculating plate arithmetic between deadlift sets. Tap any target weight to see the exact plate breakdown for standard 20kg or 45lb bars.',
    accentColor: 'text-yellow-400',
    bgGlow: 'group-hover:border-yellow-500/40',
    highlight: 'Supports microplates & bumpers',
  },
  {
    icon: Download,
    badge: 'Zero Vendor Lock-in',
    title: '1-Click JSON & CSV Export',
    description:
      'Your training history belongs to you, forever. Export complete workout logs, body metrics, and volume trends with zero paywalls or export fees.',
    accentColor: 'text-purple-400',
    bgGlow: 'group-hover:border-purple-500/40',
    highlight: 'Full data sovereignty',
  },
];

export function FeaturesGrid() {
  return (
    <section id="features" className="py-12 sm:py-20 lg:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <ScrollReveal delayMs={0} direction="up">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-semibold uppercase tracking-wider mb-4">
              <Zap className="w-3.5 h-3.5" />
              Built By Lifters For Lifters
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-text-primary">
              Pure Functionality.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-emerald-400">
                Zero Ads. Total Freedom.
              </span>
            </h2>
            <p className="mt-3 sm:mt-4 text-sm sm:text-lg text-text-muted">
              Engineered for effortless speed at the squat rack. Instant 2-tap set logging, automated plate and 1RM math, zero tracking scripts, and completely free forever.
            </p>
          </div>
        </ScrollReveal>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <ScrollReveal key={feat.title} delayMs={idx * 80} direction="up">
                <div
                  className={`group relative h-full rounded-2xl bg-surface border border-border/80 p-6 sm:p-8 hover:bg-surface-raised transition-all duration-300 shadow-lg ${feat.bgGlow}`}
                >
                  {/* Header row */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-surface-raised border border-border/80 group-hover:border-border transition-colors">
                      <Icon className={`w-6 h-6 ${feat.accentColor}`} />
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-surface-raised text-text-subtle border border-border/60">
                      {feat.badge}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-text-primary group-hover:text-accent transition-colors">
                    {feat.title}
                  </h3>
                  <p className="mt-3 text-sm text-text-muted leading-relaxed">
                    {feat.description}
                  </p>

                  {/* Highlight tag */}
                  <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between">
                    <span className="text-xs font-mono text-text-subtle flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                      {feat.highlight}
                    </span>
                    <span className="text-xs text-accent font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Included Free →
                    </span>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <ScrollReveal delayMs={200} direction="up">
          <div className="mt-12 text-center">
            <p className="text-sm text-text-muted">
              Ready to ditch paid workout trackers?{' '}
              <Link
                href="/register"
                className="text-accent font-bold hover:underline inline-flex items-center gap-1 ml-1 cursor-pointer"
              >
                Register now and start logging free
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
