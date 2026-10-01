'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Dumbbell, 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Star, 
  Zap, 
  Ban,
  EyeOff,
  FolderDown,
  Layers,
  Unlock
} from 'lucide-react';

interface AuthCardProps {
  mode?: 'login' | 'register';
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footerText?: string;
  footerLinkText?: string;
  footerLinkHref?: string;
}

export function AuthCard({
  mode = 'login',
  title,
  subtitle,
  children,
  footerText,
  footerLinkText,
  footerLinkHref,
}: AuthCardProps) {
  const isLogin = mode === 'login';

  return (
    <div className="w-full min-h-screen flex flex-col lg:flex-row bg-background selection:bg-accent/30 selection:text-text-primary">
      {/* LEFT SHOWCASE PANEL (Visible on lg screens) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-5/12 relative flex-col justify-between p-10 xl:p-14 bg-gradient-to-br from-surface-raised via-surface to-[#0c130e] border-r border-border/80 overflow-hidden">
        {/* Ambient Glows */}
        <div 
          className="absolute -top-24 -left-24 w-96 h-96 bg-accent/15 blur-[120px] rounded-full pointer-events-none"
          aria-hidden="true" 
        />
        <div 
          className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none"
          aria-hidden="true" 
        />

        {/* Brand Top Bar */}
        <div className="relative z-10 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/20 border border-accent/40 text-accent group-hover:scale-105 group-hover:border-accent group-hover:shadow-[0_0_20px_rgba(34,197,94,0.35)] transition-all duration-200">
              <Dumbbell className="w-5 h-5 text-accent" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-text-primary flex items-center gap-1.5">
                Gym<span className="text-accent">Logger</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30">
                  FOSS
                </span>
              </span>
              <span className="text-[10px] text-text-subtle font-mono">
                100% Free & Open Source
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-text-muted hover:text-text-primary bg-surface/60 hover:bg-surface-raised border border-border transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to site</span>
          </Link>
        </div>

        {/* Middle Showcase Content: Emphasizing Simplicity, Functionality & Freedom */}
        <div className="relative z-10 my-auto py-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-semibold uppercase tracking-wider mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            Zero Ads • Zero Trackers • 100% Free
          </div>

          <h2 className="text-3xl xl:text-4xl font-extrabold text-text-primary tracking-tight leading-tight mb-4">
            Pure Functionality.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-emerald-400">
              Zero Ads. Total Freedom.
            </span>
          </h2>

          <p className="text-sm xl:text-base text-text-muted leading-relaxed mb-6 max-w-lg">
            Built for lifters who just want a tracker that works. No unskippable video ads between sets, no tracking SDKs selling your biometric data, and no locked routines.
          </p>

          {/* The Freedom Promise Card */}
          <div className="p-5 rounded-2xl bg-surface/85 border border-border/90 shadow-xl backdrop-blur-md mb-6 max-w-lg">
            <div className="flex items-center justify-between pb-3.5 border-b border-border/70 mb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">The Freedom Promise</h3>
                  <p className="text-[10px] text-text-subtle font-mono">Simple • Functional • Independent</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-accent/15 text-accent border border-accent/30">
                MIT Licensed
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center font-mono">
              <div className="p-2.5 rounded-xl bg-surface-raised border border-border/70">
                <div className="flex items-center justify-center gap-1 text-accent mb-0.5">
                  <Ban className="w-3.5 h-3.5 text-accent" />
                  <span className="text-xs font-extrabold">0 Ads</span>
                </div>
                <span className="text-[10px] text-text-subtle block">No popups ever</span>
              </div>
              <div className="p-2.5 rounded-xl bg-surface-raised border border-border/70">
                <div className="flex items-center justify-center gap-1 text-emerald-400 mb-0.5">
                  <EyeOff className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs font-extrabold">0 Trackers</span>
                </div>
                <span className="text-[10px] text-text-subtle block">100% Private</span>
              </div>
              <div className="p-2.5 rounded-xl bg-surface-raised border border-border/70">
                <div className="flex items-center justify-center gap-1 text-orange-400 mb-0.5">
                  <Unlock className="w-3.5 h-3.5 text-orange-400" />
                  <span className="text-xs font-extrabold">$0 Forever</span>
                </div>
                <span className="text-[10px] text-text-subtle block">No paywalls</span>
              </div>
            </div>
          </div>

          {/* Key Functionality & Ease of Use Bullets */}
          <div className="space-y-3 max-w-lg">
            <div className="flex items-start gap-2.5 text-xs text-text-muted">
              <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              <span>
                <strong className="text-text-primary font-semibold">Instant 2-Tap Logging:</strong> Open app, type weights and reps, done. Zero lag or confusing sub-menus.
              </span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-text-muted">
              <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              <span>
                <strong className="text-text-primary font-semibold">Practical Gym Tools:</strong> Automatic Brzycki 1RM calculator, barbell plate math, and smart rest stopwatch.
              </span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-text-muted">
              <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              <span>
                <strong className="text-text-primary font-semibold">True Data Sovereignty:</strong> 1-click export of your full training history to CSV or JSON anytime.
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Social Proof / Quote */}
        <div className="relative z-10 pt-5 border-t border-border/60">
          <div className="flex items-center gap-1 text-accent mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-accent" />
            ))}
          </div>
          <p className="text-xs text-text-muted italic leading-relaxed">
            &ldquo;I got tired of workout apps bombarding me with full-screen video ads mid-workout and locking basic routines behind $80/year subscriptions. GymLogger gives me pure functionality, total privacy, and complete freedom.&rdquo;
          </p>
          <p className="text-[11px] font-semibold text-text-primary mt-1">
            David Chen <span className="text-text-subtle font-normal">• Senior Engineer & Lifter</span>
          </p>
        </div>
      </div>

      {/* RIGHT AUTH FORM PANEL */}
      <div className="w-full lg:w-1/2 xl:w-7/12 flex flex-col justify-between min-h-screen p-4 sm:p-8 lg:p-12 xl:p-16 relative">
        {/* Top bar on form panel */}
        <div className="flex items-center justify-between mb-6 lg:mb-8">
          {/* Mobile brand header (hidden on lg) */}
          <Link
            href="/"
            className="flex lg:hidden items-center gap-2 group cursor-pointer"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-accent/20 border border-accent/40 text-accent">
              <Dumbbell className="w-4 h-4 text-accent" />
            </div>
            <span className="text-base font-bold tracking-tight text-text-primary">
              Gym<span className="text-accent">Logger</span>
            </span>
          </Link>

          <Link
            href="/"
            className="inline-flex lg:hidden items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-text-muted hover:text-text-primary bg-surface-raised border border-border transition-colors cursor-pointer min-h-[36px]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>

          {/* Desktop Right Quick Switch Link */}
          <div className="hidden lg:flex items-center justify-end w-full text-xs text-text-muted gap-1.5">
            <span>{isLogin ? "Need a free account?" : 'Already registered?'}</span>
            <Link
              href={isLogin ? '/register' : '/login'}
              className="font-semibold text-accent hover:text-accent-hover hover:underline transition-colors px-1 py-0.5 rounded cursor-pointer"
            >
              {isLogin ? 'Get started free (No ads) →' : 'Sign in to account →'}
            </Link>
          </div>
        </div>

        {/* Center Card Content */}
        <div className="my-auto w-full max-w-[460px] mx-auto py-4">
          <div className="relative rounded-3xl bg-surface/90 border border-border/90 shadow-2xl p-6 sm:p-9 backdrop-blur-xl transition-all">
            {/* Ambient accent top highlight line */}
            <div
              className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-90"
              aria-hidden="true"
            />

            {/* Header */}
            <div className="mb-6 text-left">
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-accent/15 border border-accent/30 text-accent mb-4 shadow-[0_0_20px_rgba(34,197,94,0.25)]">
                {isLogin ? <Zap className="w-5 h-5" /> : <Dumbbell className="w-5 h-5" />}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
                {title}
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-text-muted leading-relaxed">
                {subtitle}
              </p>
            </div>

            {/* Injected Form Body */}
            {children}

            {/* Footer switcher */}
            {footerText && footerLinkHref && footerLinkText && (
              <div className="mt-6 pt-5 border-t border-border/60 text-center text-xs sm:text-sm text-text-muted">
                {footerText}{' '}
                <Link
                  href={footerLinkHref}
                  className="font-semibold text-accent hover:text-accent-hover underline-offset-4 hover:underline focus-ring rounded-sm px-1 py-0.5 transition-colors cursor-pointer"
                >
                  {footerLinkText}
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Security, Privacy & Freedom Indicator */}
        <div className="pt-6 text-center text-xs text-text-subtle flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
          <span className="flex items-center gap-1.5">
            <Ban className="w-3.5 h-3.5 text-accent" />
            Zero ads
          </span>
          <span className="text-border">•</span>
          <span className="flex items-center gap-1.5">
            <EyeOff className="w-3.5 h-3.5 text-accent" />
            Zero trackers
          </span>
          <span className="text-border">•</span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-accent" />
            100% Free Forever (MIT)
          </span>
        </div>
      </div>
    </div>
  );
}
