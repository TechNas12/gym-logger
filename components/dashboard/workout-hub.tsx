'use client';

import React, { useState } from 'react';
import {
  Play,
  Layers,
  Dumbbell,
  Plus,
  ArrowRight,
  Sparkles,
  Info,
  X,
} from 'lucide-react';

interface WorkoutHubProps {
  userName?: string;
}

export function WorkoutHub({ userName }: WorkoutHubProps) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const displayName = userName || 'Athlete';

  const handleDummyClick = (actionName: string) => {
    setToastMessage(`"${actionName}" is coming soon! Workout tracking is under active development.`);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  return (
    <section className="w-full relative rounded-3xl bg-surface/90 border border-border/90 shadow-2xl p-5 sm:p-7 backdrop-blur-xl transition-all">
      {/* Subtle green glow accent top highlight */}
      <div
        className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-90"
        aria-hidden="true"
      />

      {/* Floating Feedback Toast for Dummy Buttons */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="mb-5 p-3.5 sm:p-4 rounded-2xl bg-surface-raised border border-accent/40 flex items-center justify-between gap-3 shadow-[0_0_25px_rgba(34,197,94,0.25)] animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-accent/20 border border-accent/40 text-accent flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <p className="text-xs sm:text-sm text-text-primary font-medium truncate">
              {toastMessage}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors shrink-0 cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
            aria-label="Dismiss message"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border/70 mb-5 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-accent/20 border border-accent/40 text-accent flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.25)] shrink-0">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-text-primary">
                Workout Tracker
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30 font-mono">
                Preview
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Ready to train, {displayName}? Log your sessions, track weights and reps, or follow saved splits.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-text-subtle bg-surface-raised px-3 py-1.5 rounded-xl border border-border/70 self-start sm:self-auto">
          <Info className="w-3.5 h-3.5 text-accent shrink-0" />
          <span>Tracker integration preview</span>
        </div>
      </div>

      {/* 2 Primary Action Cards (Stacked on Mobile, 2-Columns on Desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* OPTION 1: START WORKOUT (Quick / Empty Session) */}
        <div className="relative group rounded-2xl bg-gradient-to-br from-surface-raised via-surface-raised to-[#0e1711] border border-border/90 hover:border-accent/60 p-5 sm:p-6 transition-all duration-300 shadow-lg flex flex-col justify-between overflow-hidden">
          {/* Subtle hover gradient glow */}
          <div
            className="absolute -top-12 -right-12 w-32 h-32 bg-accent/10 rounded-full blur-2xl group-hover:bg-accent/20 transition-all pointer-events-none"
            aria-hidden="true"
          />

          <div>
            <div className="flex items-center justify-between mb-3.5">
              <div className="w-11 h-11 rounded-2xl bg-accent/20 border border-accent/40 text-accent flex items-center justify-center group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all">
                <Plus className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-accent/15 text-accent border border-accent/30">
                Quick Start
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-text-primary group-hover:text-accent transition-colors">
              Start Workout
            </h3>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              Begin an ad-hoc session on the fly. Add exercises from the database, track sets and reps, and time rest intervals.
            </p>
          </div>

          <div className="mt-5 pt-3.5 border-t border-border/60">
            <button
              type="button"
              onClick={() => handleDummyClick('Start Workout')}
              className="w-full min-h-[46px] rounded-xl bg-accent text-accent-foreground font-bold text-xs sm:text-sm hover:bg-accent-hover active:bg-accent-active active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(34,197,94,0.35)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] cursor-pointer group/btn"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Workout</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* OPTION 2: START ROUTINE (Structured / Template) */}
        <div className="relative group rounded-2xl bg-surface-raised border border-border/90 hover:border-blue-500/50 p-5 sm:p-6 transition-all duration-300 shadow-lg flex flex-col justify-between overflow-hidden">
          {/* Subtle hover gradient glow */}
          <div
            className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all pointer-events-none"
            aria-hidden="true"
          />

          <div>
            <div className="flex items-center justify-between mb-3.5">
              <div className="w-11 h-11 rounded-2xl bg-blue-500/20 border border-blue-500/40 text-blue-400 flex items-center justify-center group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all">
                <Layers className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-400 border border-blue-500/30">
                Templates & Splits
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-text-primary group-hover:text-blue-400 transition-colors">
              Start Routine
            </h3>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              Select structured training splits like Push, Pull, Legs, Full Body, or create and save your own custom workout plans.
            </p>
          </div>

          <div className="mt-5 pt-3.5 border-t border-border/60">
            <button
              type="button"
              onClick={() => handleDummyClick('Start Routine')}
              className="w-full min-h-[46px] rounded-xl bg-surface border border-border/90 hover:border-blue-500/60 hover:bg-surface-hover text-text-primary font-bold text-xs sm:text-sm active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm group/btn"
            >
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Start Routine</span>
              <ArrowRight className="w-3.5 h-3.5 text-text-subtle group-hover/btn:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
