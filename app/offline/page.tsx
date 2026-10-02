'use client';

import React from 'react';
import Link from 'next/link';
import { WifiOff, RotateCcw, Dumbbell, ArrowLeft } from 'lucide-react';

export default function OfflinePage() {
  const handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between p-6 sm:p-10 selection:bg-accent/30 selection:text-text-primary">
      {/* Top Bar */}
      <header className="w-full max-w-lg mx-auto flex items-center justify-between pb-6">
        <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-surface-raised border border-border text-accent group-hover:border-accent/60 transition-colors">
            <Dumbbell className="w-4 h-4 text-accent" />
          </div>
          <span className="text-base sm:text-lg font-bold tracking-tight text-text-primary">
            Gym<span className="text-accent">Logger</span>
          </span>
        </Link>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
          <WifiOff className="w-3 h-3" />
          Offline Mode
        </span>
      </header>

      {/* Main Card */}
      <main className="w-full max-w-lg mx-auto my-auto">
        <div className="relative rounded-3xl bg-surface border border-border p-6 sm:p-8 text-center space-y-6 shadow-2xl">
          {/* Animated Icon Glow */}
          <div className="relative mx-auto w-20 h-20 rounded-3xl bg-surface-raised border border-border flex items-center justify-center">
            <div className="absolute inset-0 rounded-3xl bg-amber-500/10 animate-pulse pointer-events-none" />
            <WifiOff className="w-9 h-9 text-amber-400 relative z-10" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
              No Internet Connection
            </h1>
            <p className="text-sm text-text-muted leading-relaxed max-w-sm mx-auto">
              You are currently working out off the grid. GymLogger works as a mobile PWA, but some live cloud sync features require an active network connection.
            </p>
          </div>

          {/* Offline Tips Box */}
          <div className="p-4 rounded-2xl bg-surface-raised/70 border border-border/70 text-left space-y-2 text-xs text-text-muted">
            <div className="font-semibold text-text-primary flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent" />
              Gym Lifter Tip
            </div>
            <p className="leading-relaxed">
              If your gym has weak reception in the basement or free-weights floor, install GymLogger to your mobile home screen to quickly access your workouts without reloading.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={handleReload}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-accent hover:bg-accent-hover active:bg-accent-active text-accent-foreground font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-accent/20 focus-ring"
            >
              <RotateCcw className="w-4 h-4" />
              Retry Connection
            </button>
            <Link
              href="/dashboard"
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-surface-raised hover:bg-surface-hover border border-border text-text-primary font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer focus-ring"
            >
              <ArrowLeft className="w-4 h-4" />
              Go to Dashboard
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-lg mx-auto pt-6 text-center text-xs text-text-subtle">
        GymLogger PWA • Offline Fallback Service
      </footer>
    </div>
  );
}
