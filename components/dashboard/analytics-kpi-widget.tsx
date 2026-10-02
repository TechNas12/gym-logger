'use client';

import React from 'react';
import Link from 'next/link';
import type { DashboardAnalyticsKpi } from '@/lib/types/analytics';
import {
  TrendingUp,
  Dumbbell,
  Flame,
  Trophy,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Layers,
} from 'lucide-react';

interface AnalyticsKpiWidgetProps {
  kpi: DashboardAnalyticsKpi;
}

export function AnalyticsKpiWidget({ kpi }: AnalyticsKpiWidgetProps) {
  const maxSparkVolume = Math.max(...kpi.sparkline.map((s) => s.volumeKg), 100);

  return (
    <section className="w-full rounded-3xl bg-surface border border-border p-5 sm:p-7 transition-all">
      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border/70 mb-5 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-surface-raised border border-border text-emerald-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-text-primary">
                Training Analytics
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                KPIs
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Weekly volume velocity, consistency streak, and strength milestones.
            </p>
          </div>
        </div>

        <Link
          href="/analytics"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-raised border border-border hover:border-emerald-500/50 hover:bg-surface-hover text-emerald-400 text-xs font-semibold focus-ring transition-all cursor-pointer self-start sm:self-auto group"
        >
          <span>Full Analytics & 1RM Trajectory</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {kpi.hasWorkouts ? (
        <div className="space-y-4">
          {/* 4 KPI Pillars */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Weekly Volume */}
            <div className="p-3.5 rounded-2xl bg-surface-raised border border-border/70 flex flex-col justify-between">
              <div className="flex items-center justify-between text-text-subtle mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider font-mono">
                  Weekly Volume
                </span>
                <Dumbbell className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
                {kpi.thisWeekVolumeKg.toLocaleString()}{' '}
                <span className="text-xs font-normal text-text-subtle">kg</span>
              </div>
              <div className="mt-1.5 text-[11px] text-text-subtle flex items-center">
                {kpi.volumeChangePercent !== null ? (
                  kpi.volumeChangePercent >= 0 ? (
                    <span className="text-emerald-400 font-semibold flex items-center">
                      <ArrowUpRight className="w-3 h-3 mr-0.5" />+{kpi.volumeChangePercent}%
                    </span>
                  ) : (
                    <span className="text-rose-400 font-semibold flex items-center">
                      <ArrowDownRight className="w-3 h-3 mr-0.5" />{kpi.volumeChangePercent}%
                    </span>
                  )
                ) : (
                  <span>This week</span>
                )}
                <span className="ml-1 text-text-subtle">vs last week</span>
              </div>
            </div>

            {/* Sessions & Streak */}
            <div className="p-3.5 rounded-2xl bg-surface-raised border border-border/70 flex flex-col justify-between">
              <div className="flex items-center justify-between text-text-subtle mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider font-mono">
                  Weekly Streak
                </span>
                <Flame className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono text-amber-400 flex items-baseline gap-1">
                {kpi.currentStreakWeeks}
                <span className="text-xs font-normal text-text-subtle font-sans">
                  {kpi.currentStreakWeeks === 1 ? 'week' : 'weeks'}
                </span>
              </div>
              <div className="mt-1.5 text-[11px] text-text-subtle truncate">
                <strong className="text-text-primary font-mono">{kpi.thisWeekWorkoutsCount}</strong>{' '}
                {kpi.thisWeekWorkoutsCount === 1 ? 'workout' : 'workouts'} logged this week
              </div>
            </div>

            {/* Primary Muscle Group */}
            <div className="p-3.5 rounded-2xl bg-surface-raised border border-border/70 flex flex-col justify-between">
              <div className="flex items-center justify-between text-text-subtle mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider font-mono">
                  Muscle Focus
                </span>
                <Layers className="w-3.5 h-3.5 text-sky-400" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-text-primary truncate">
                {kpi.topMuscleGroup || 'Full Body'}
              </div>
              <div className="mt-1.5 text-[11px] text-text-subtle">
                {kpi.topMusclePercentage ? (
                  <span>
                    <strong className="text-sky-400 font-mono">{kpi.topMusclePercentage}%</strong> of weekly sets
                  </span>
                ) : (
                  <span>Balanced training</span>
                )}
              </div>
            </div>

            {/* Top Personal Record */}
            <div className="p-3.5 rounded-2xl bg-surface-raised border border-border/70 flex flex-col justify-between">
              <div className="flex items-center justify-between text-text-subtle mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider font-mono">
                  Top Record
                </span>
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-base sm:text-lg font-bold text-text-primary truncate">
                {kpi.latestPr ? kpi.latestPr.exerciseName : 'No PRs yet'}
              </div>
              <div className="mt-1.5 text-[11px] text-text-subtle truncate">
                {kpi.latestPr ? (
                  <span className="font-mono text-amber-400 font-semibold">
                    {kpi.latestPr.weightKg} kg × {kpi.latestPr.reps} ({kpi.latestPr.est1rmKg} kg 1RM)
                  </span>
                ) : (
                  <span>Ready for personal bests</span>
                )}
              </div>
            </div>
          </div>

          {/* 7-Day Sparkline Bar Indicator */}
          <div className="p-3.5 rounded-2xl bg-surface-raised border border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-text-muted">
              <span className="font-semibold text-text-primary mr-1">Weekly Activity:</span>
              Daily volume distribution (Mon - Sun)
            </div>

            <div className="flex items-end gap-2 h-9 px-2">
              {kpi.sparkline.map((s, idx) => {
                const heightPct = s.volumeKg > 0 ? Math.max(15, (s.volumeKg / maxSparkVolume) * 100) : 8;
                return (
                  <div key={idx} className="flex flex-col items-center gap-1 group/bar relative">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-4 rounded-sm transition-all duration-200 ${
                        s.workoutCount > 0
                          ? 'bg-emerald-400 group-hover/bar:bg-emerald-300'
                          : 'bg-surface border border-border/60'
                      }`}
                    />
                    <span className="text-[9px] font-mono text-text-subtle font-semibold">
                      {s.day}
                    </span>

                    {/* Mini tooltip */}
                    {s.volumeKg > 0 && (
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-surface border border-border text-[9px] font-mono text-emerald-400 whitespace-nowrap opacity-0 group-hover/bar:opacity-100 pointer-events-none transition-opacity">
                        {s.volumeKg} kg
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Empty State with direct link to preview */
        <div className="p-6 rounded-2xl bg-surface-raised border border-dashed border-border/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary">
                Unlock Training Analytics & 1RM Progression
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                Log your first workout to see volume velocity, symmetry distribution, and PR milestones.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/analytics"
              className="px-3.5 py-2 rounded-xl bg-surface border border-border hover:border-emerald-500/40 text-text-primary text-xs font-semibold focus-ring transition-colors cursor-pointer"
            >
              Explore Preview
            </Link>
            <Link
              href="/workout/active"
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold active:scale-[0.98] transition-colors cursor-pointer"
            >
              Start Workout
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
