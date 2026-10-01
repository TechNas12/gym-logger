'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  Flame, 
  Database
} from 'lucide-react';
import { GithubIcon } from './icons';
import { ScrollReveal } from './scroll-reveal';

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
      {/* Background glowing gradients */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[450px] bg-gradient-to-tr from-accent/20 via-emerald-500/10 to-orange-500/10 blur-[130px] rounded-full pointer-events-none -z-10 animate-pulse duration-1000"
        aria-hidden="true"
      />
      <div 
        className="absolute top-10 right-10 w-72 h-72 bg-accent/15 blur-[100px] rounded-full pointer-events-none -z-10"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Release / FOSS Pill Banner */}
        <ScrollReveal delayMs={0} direction="down">
          <div className="inline-flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-surface-raised/90 border border-border hover:border-accent/40 text-[11px] sm:text-xs text-text-muted transition-all duration-200 shadow-lg mb-6 sm:mb-8 max-w-full">
            <span className="flex h-2 w-2 rounded-full bg-accent animate-pulse shrink-0" />
            <span className="font-semibold text-text-primary">GymLogger 1.0</span>
            <span className="text-border">|</span>
            <span className="text-accent font-medium">100% Free Forever • MIT</span>
            <span className="text-border hidden sm:inline">|</span>
            <span className="text-text-subtle hidden sm:inline font-mono">No paywalls</span>
          </div>
        </ScrollReveal>

        {/* Main Athletic Headline */}
        <ScrollReveal delayMs={100} direction="up">
          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-text-primary max-w-5xl mx-auto leading-[1.12] sm:leading-[1.08]">
            Log Every Set.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-emerald-400 to-lime-300">
              Crush Every PR.
            </span>
            <br className="hidden sm:inline" />
            {' '}Own Your Training Data.
          </h1>
        </ScrollReveal>

        {/* Subtitle */}
        <ScrollReveal delayMs={200} direction="up">
          <p className="mt-4 sm:mt-6 text-base sm:text-xl text-text-muted max-w-3xl mx-auto leading-relaxed font-normal">
            Tired of gym apps that lock your progress charts behind expensive subscriptions? 
            <span className="text-text-primary font-medium"> GymLogger</span> is the high-performance, open-source workout tracker built for lifters who take progressive overload seriously.
          </p>
        </ScrollReveal>

        {/* Action Buttons */}
        <ScrollReveal delayMs={300} direction="up">
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md sm:max-w-none mx-auto">
            {/* Primary CTA: Register Now */}
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-accent text-accent-foreground font-bold text-sm sm:text-base shadow-[0_0_30px_rgba(34,197,94,0.4)] hover:shadow-[0_0_40px_rgba(34,197,94,0.6)] hover:bg-accent-hover transition-all duration-200 cursor-pointer group"
            >
              <span>Register Now — Free Forever</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>

            {/* Secondary CTA: Interactive Live Demo */}
            <a
              href="#interactive-demo"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3.5 sm:py-4 rounded-xl bg-surface-raised hover:bg-surface-hover text-text-primary font-semibold text-sm sm:text-base border border-border hover:border-accent/40 transition-all duration-200 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
              <span>Try Interactive Demo</span>
            </a>

            {/* Source Code */}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3.5 sm:py-4 rounded-xl bg-surface hover:bg-surface-raised text-text-muted hover:text-text-primary font-medium text-sm sm:text-base border border-border transition-all duration-200 cursor-pointer"
            >
              <GithubIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Star on GitHub</span>
            </a>
          </div>
        </ScrollReveal>

        {/* Trust & Transparency Badges */}
        <div className="mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-border/60 max-w-4xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6 text-left">
          <ScrollReveal delayMs={350} direction="up">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-surface/50 border border-border/60 hover:border-accent/30 transition-colors">
              <div className="p-2 rounded-lg bg-accent/10 text-accent">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">Zero Paywalls</p>
                <p className="text-xs text-text-subtle">All features unlocked</p>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delayMs={450} direction="up">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-surface/50 border border-border/60 hover:border-emerald-500/30 transition-colors">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">Data Sovereignty</p>
                <p className="text-xs text-text-subtle">Export CSV / JSON anytime</p>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delayMs={550} direction="up">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-surface/50 border border-border/60 hover:border-orange-500/30 transition-colors">
              <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">Auto 1RM Math</p>
                <p className="text-xs text-text-subtle">Instant PR calculations</p>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delayMs={650} direction="up">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-surface/50 border border-border/60 hover:border-sky-500/30 transition-colors">
              <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">Self-Hostable</p>
                <p className="text-xs text-text-subtle">Next.js + Supabase + SQLite</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
