'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Play,
  Layers,
  Dumbbell,
  Plus,
  ArrowRight,
  History,
  Sparkles,
} from 'lucide-react';
import { RoutinePickerModal } from '@/components/workout/routine-picker-modal';

interface WorkoutHubProps {
  userName?: string;
}

export function WorkoutHub({ userName }: WorkoutHubProps) {
  const router = useRouter();
  const [isRoutinePickerOpen, setIsRoutinePickerOpen] = useState(false);
  const displayName = userName || 'Athlete';

  return (
    <section className="w-full relative rounded-3xl bg-surface border border-border p-5 sm:p-7 transition-all">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border/70 mb-5 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-surface-raised border border-border text-emerald-400 flex items-center justify-center shrink-0">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-text-primary">
                Workout Tracker
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-surface-raised text-emerald-400 border border-border font-mono">
                Live
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Ready to train, {displayName}? Log your sets, track weights and reps, or follow saved splits.
            </p>
          </div>
        </div>

        {/* Quick links to History and Routines */}
        <div className="flex items-center gap-2">
          <Link
            href="/workout/history"
            className="flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text-primary bg-surface-raised hover:bg-surface-hover px-3 py-1.5 rounded-xl border border-border/70 transition-colors"
          >
            <History className="w-3.5 h-3.5 text-emerald-400" />
            <span>History</span>
          </Link>

          <Link
            href="/routines"
            className="flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text-primary bg-surface-raised hover:bg-surface-hover px-3 py-1.5 rounded-xl border border-border/70 transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>Routines</span>
          </Link>
        </div>
      </div>

      {/* 2 Primary Action Cards (Stacked on Mobile, 2-Columns on Desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* OPTION 1: START WORKOUT (Quick / Empty Session) */}
        <div className="relative group rounded-2xl bg-surface-raised border border-border/90 hover:border-emerald-500/50 p-5 sm:p-6 transition-all duration-200 flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <div className="w-11 h-11 rounded-2xl bg-surface border border-border text-emerald-400 flex items-center justify-center">
                <Plus className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-surface border border-border text-emerald-400">
                Quick Start
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-text-primary group-hover:text-emerald-400 transition-colors">
              Start Workout
            </h3>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              Begin an ad-hoc session on the fly. Add exercises from 1,300+ database movements, track sets, warmups, dropsets, and time rest.
            </p>
          </div>

          <div className="mt-5 pt-3.5 border-t border-border/60">
            <button
              type="button"
              onClick={() => router.push('/workout/active')}
              className="w-full min-h-[46px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm active:scale-[0.99] transition-colors flex items-center justify-center gap-2 cursor-pointer group/btn"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Workout</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* OPTION 2: START ROUTINE (Structured / Template) */}
        <div className="relative group rounded-2xl bg-surface-raised border border-border/90 hover:border-blue-500/50 p-5 sm:p-6 transition-all duration-200 flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <div className="w-11 h-11 rounded-2xl bg-surface border border-border text-blue-400 flex items-center justify-center">
                <Layers className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-surface border border-border text-blue-400">
                Templates & Splits
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-text-primary group-hover:text-blue-400 transition-colors">
              Start Routine
            </h3>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              Select structured training splits like Push, Pull, Legs, Upper, Lower, or pick from your own custom workout templates.
            </p>
          </div>

          <div className="mt-5 pt-3.5 border-t border-border/60">
            <button
              type="button"
              onClick={() => setIsRoutinePickerOpen(true)}
              className="w-full min-h-[46px] rounded-xl bg-surface border border-border/90 hover:border-blue-500/60 hover:bg-surface-hover text-text-primary font-bold text-xs sm:text-sm active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm group/btn"
            >
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Start Routine</span>
              <ArrowRight className="w-3.5 h-3.5 text-text-subtle group-hover/btn:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Routine Picker Modal */}
      <RoutinePickerModal
        isOpen={isRoutinePickerOpen}
        onClose={() => setIsRoutinePickerOpen(false)}
      />
    </section>
  );
}
