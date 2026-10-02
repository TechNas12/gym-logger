'use client';

import React from 'react';
import type { AnalyticsKpiSummary } from '@/lib/types/analytics';
import {
  Dumbbell,
  TrendingUp,
  Flame,
  Clock,
  Trophy,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
} from 'lucide-react';

interface AnalyticsKpisProps {
  kpi: AnalyticsKpiSummary;
}

export function AnalyticsKpis({ kpi }: AnalyticsKpisProps) {
  // Format volume
  const formattedVolume =
    kpi.totalVolumeKg >= 1000
      ? `${(kpi.totalVolumeKg / 1000).toFixed(1)}k`
      : kpi.totalVolumeKg.toLocaleString();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {/* 1. Total Volume */}
      <div className="p-4 rounded-2xl bg-surface border border-border flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-subtle font-mono">
              Volume Lifted
            </span>
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Dumbbell className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400 tracking-tight">
            {formattedVolume}
            <span className="text-xs font-normal text-text-subtle ml-1 font-sans">kg</span>
          </div>
        </div>

        <div className="mt-2.5 pt-2 border-t border-border/60 flex items-center text-[11px]">
          {kpi.volumeChangePercent !== null ? (
            kpi.volumeChangePercent >= 0 ? (
              <span className="text-emerald-400 font-mono font-semibold flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" />
                +{kpi.volumeChangePercent}%
              </span>
            ) : (
              <span className="text-rose-400 font-mono font-semibold flex items-center gap-0.5">
                <ArrowDownRight className="w-3 h-3" />
                {kpi.volumeChangePercent}%
              </span>
            )
          ) : (
            <span className="text-text-subtle">Baseline</span>
          )}
          <span className="text-text-subtle ml-1">vs prior period</span>
        </div>
      </div>

      {/* 2. Total Workouts */}
      <div className="p-4 rounded-2xl bg-surface border border-border flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-subtle font-mono">
              Workouts
            </span>
            <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-text-primary tracking-tight">
            {kpi.totalWorkouts}
            <span className="text-xs font-normal text-text-subtle ml-1 font-sans">
              {kpi.totalWorkouts === 1 ? 'session' : 'sessions'}
            </span>
          </div>
        </div>

        <div className="mt-2.5 pt-2 border-t border-border/60 flex items-center text-[11px] text-text-subtle">
          {kpi.workoutsChangeCount !== null ? (
            <span className="text-text-primary font-mono font-semibold">
              {kpi.workoutsChangeCount >= 0 ? `+${kpi.workoutsChangeCount}` : kpi.workoutsChangeCount}
              <span className="text-text-subtle font-normal font-sans ml-1">sessions</span>
            </span>
          ) : (
            <span>Logged to date</span>
          )}
        </div>
      </div>

      {/* 3. Sets & Reps */}
      <div className="p-4 rounded-2xl bg-surface border border-border flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-subtle font-mono">
              Total Sets
            </span>
            <div className="w-6 h-6 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-text-primary tracking-tight">
            {kpi.totalSets}
            <span className="text-xs font-normal text-text-subtle ml-1 font-sans">sets</span>
          </div>
        </div>

        <div className="mt-2.5 pt-2 border-t border-border/60 text-[11px] text-text-subtle truncate">
          <strong className="text-text-primary font-mono">{kpi.totalReps.toLocaleString()}</strong> total reps
        </div>
      </div>

      {/* 4. Active Streak */}
      <div className="p-4 rounded-2xl bg-surface border border-border flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-subtle font-mono">
              Consistency
            </span>
            <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Flame className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-amber-400 tracking-tight flex items-baseline gap-1">
            {kpi.currentStreakWeeks}
            <span className="text-xs font-normal text-text-subtle font-sans">
              {kpi.currentStreakWeeks === 1 ? 'week streak' : 'weeks streak'}
            </span>
          </div>
        </div>

        <div className="mt-2.5 pt-2 border-t border-border/60 text-[11px] text-text-subtle">
          {kpi.currentStreakWeeks > 0 ? 'Active training momentum' : 'Ready to start streak'}
        </div>
      </div>

      {/* 5. PRs / Duration */}
      <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-surface border border-border flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-subtle font-mono">
              Avg Duration
            </span>
            <div className="w-6 h-6 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-text-primary tracking-tight">
            {kpi.avgDurationMinutes || '—'}
            <span className="text-xs font-normal text-text-subtle ml-1 font-sans">mins</span>
          </div>
        </div>

        <div className="mt-2.5 pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-text-subtle">
          <span>PRs Hit:</span>
          <span className="text-amber-400 font-mono font-bold">{kpi.totalPrsCount}</span>
        </div>
      </div>
    </div>
  );
}
