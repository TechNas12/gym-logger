'use client';

import React, { useState, useEffect } from 'react';
import { Smartphone, Download, CheckCircle2, X, Sparkles, Zap } from 'lucide-react';
import { usePwa } from './pwa-provider';

const SECTION_DISMISS_KEY = 'gymlogger_install_section_dismissed';

export function InstallAppSection() {
  const { isStandalone, isInstalled, isIOS, promptInstall, openIOSInstructions } = usePwa();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(SECTION_DISMISS_KEY);
      if (dismissed === 'true') {
        setIsDismissed(true);
      }
    } catch {
      // Storage unavailable fallback
    }
  }, []);

  // If already installed or running in standalone mode, hide completely
  if (isStandalone || isInstalled || isDismissed) {
    return null;
  }

  const handleInstallClick = async () => {
    setIsInstalling(true);
    try {
      if (isIOS) {
        openIOSInstructions();
      } else {
        await promptInstall();
      }
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem(SECTION_DISMISS_KEY, 'true');
    } catch {
      // Storage fallback
    }
  };

  return (
    <section
      aria-label="Install App"
      className="relative rounded-3xl bg-gradient-to-r from-surface via-surface-raised to-surface border border-accent/30 p-5 sm:p-6 lg:p-7 shadow-lg shadow-black/20 overflow-hidden group transition-all"
    >
      {/* Background Accent Subtle Glow */}
      <div
        className="absolute -right-12 -bottom-12 w-48 h-48 bg-accent/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      {/* Dismiss Button */}
      <button
        type="button"
        onClick={handleDismiss}
        title="Dismiss installation banner"
        className="absolute top-4 right-4 p-1.5 rounded-lg text-text-subtle hover:text-text-primary hover:bg-surface-raised border border-transparent hover:border-border transition-colors focus-ring cursor-pointer"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10 pr-6 md:pr-0">
        {/* Left Info Column */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center shrink-0 shadow-inner">
            <Smartphone className="w-6 h-6" />
          </div>

          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-extrabold tracking-tight text-text-primary">
                Install GymLogger on your Device
              </h2>
              <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-accent/20 text-accent border border-accent/40 font-mono">
                <Sparkles className="w-3 h-3" />
                Native App Mode
              </span>
            </div>

            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              Add GymLogger to your home screen for instantaneous 1-tap launch, distraction-free logging, and a clean full-screen experience without browser toolbars.
            </p>

            {/* Feature Pills */}
            <div className="flex items-center gap-2.5 pt-1 flex-wrap text-[11px] text-text-subtle font-medium">
              <span className="inline-flex items-center gap-1">
                <Zap className="w-3 h-3 text-accent" />
                1-Tap Instant Launch
              </span>
              <span className="text-text-subtle/50">•</span>
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Full-Screen Mode (No Browser Bars)
              </span>
              <span className="text-text-subtle/50">•</span>
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-sky-400" />
                No App Store Needed
              </span>
            </div>
          </div>
        </div>

        {/* Right Action Column */}
        <div className="flex items-center gap-3 shrink-0 self-start md:self-center w-full md:w-auto">
          <button
            type="button"
            onClick={handleInstallClick}
            disabled={isInstalling}
            className="w-full md:w-auto min-h-[44px] px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-accent-foreground text-xs sm:text-sm font-bold shadow-md shadow-accent/20 transition-all active:scale-[0.98] cursor-pointer inline-flex items-center justify-center gap-2 focus-ring"
          >
            <Download className="w-4 h-4" />
            <span>Install App Now</span>
          </button>
        </div>
      </div>
    </section>
  );
}
