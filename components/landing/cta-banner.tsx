'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Dumbbell, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { ScrollReveal } from './scroll-reveal';

export function CtaBanner() {
  return (
    <section className="py-12 sm:py-20 lg:py-28 relative overflow-hidden">
      {/* Background glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-accent/20 to-emerald-500/10 blur-[120px] rounded-full pointer-events-none -z-10"
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal delayMs={0} direction="up">
          <div className="relative rounded-3xl bg-gradient-to-b from-surface via-surface-raised to-surface border border-border/90 p-6 sm:p-10 lg:p-14 text-center shadow-2xl overflow-hidden">
          {/* Top subtle highlight line */}
          <div
            className="absolute -top-px left-8 sm:left-12 right-8 sm:right-12 h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-80"
            aria-hidden="true"
          />

          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-accent/20 border border-accent/40 text-accent mb-5 sm:mb-6 shadow-[0_0_25px_rgba(34,197,94,0.3)]">
            <Dumbbell className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-text-primary max-w-3xl mx-auto leading-tight">
            Ready To Crush Your Next Training Cycle?
          </h2>

          <p className="mt-3 sm:mt-4 text-sm sm:text-lg text-text-muted max-w-2xl mx-auto leading-relaxed">
            Join thousands of lifters who left overpriced apps behind. Build custom workouts, track PRs, and log your progress with zero restrictions.
          </p>

          {/* Action CTAs */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-accent text-accent-foreground font-bold text-sm sm:text-base shadow-[0_0_30px_rgba(34,197,94,0.4)] hover:shadow-[0_0_40px_rgba(34,197,94,0.6)] hover:bg-accent-hover transition-all duration-200 cursor-pointer group"
            >
              <span>Register Now — Free Forever</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3.5 sm:py-4 rounded-xl bg-surface hover:bg-surface-raised text-text-primary font-semibold text-sm sm:text-base border border-border hover:border-accent/40 transition-all duration-200 cursor-pointer"
            >
              <span>Sign In To Account</span>
            </Link>
          </div>

          {/* Bullet proofs */}
          <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-text-subtle font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-accent" />
              No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-accent" />
              Instant 30-second setup
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-accent" />
              100% Free & Open-Source (MIT)
            </span>
          </div>
        </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
