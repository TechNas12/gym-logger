'use client';

import React from 'react';
import type { MuscleGroupDistribution } from '@/lib/types/analytics';
import { Layers, Activity, CheckCircle2 } from 'lucide-react';

interface MuscleBalanceChartProps {
  distribution: MuscleGroupDistribution[];
}

export function MuscleBalanceChart({ distribution }: MuscleBalanceChartProps) {
  const activeGroups = distribution.filter((g) => g.setsCount > 0);
  const totalSets = activeGroups.reduce((acc, g) => acc + g.setsCount, 0);

  // Group into Push / Pull / Legs for symmetry telemetry
  const chestSets = activeGroups.find((g) => g.id === 'chest')?.setsCount || 0;
  const shoulderSets = activeGroups.find((g) => g.id === 'shoulders')?.setsCount || 0;
  const backSets = activeGroups.find((g) => g.id === 'back')?.setsCount || 0;
  const legSets = activeGroups.find((g) => g.id === 'legs')?.setsCount || 0;
  const armSets = activeGroups.find((g) => g.id === 'arms')?.setsCount || 0;

  // Push: Chest + Shoulders + approx half of arms (triceps)
  const pushSets = chestSets + shoulderSets + Math.round(armSets * 0.5);
  // Pull: Back + approx half of arms (biceps)
  const pullSets = backSets + Math.round(armSets * 0.5);
  // Legs: Legs
  const legsSets = legSets;

  const pplTotal = pushSets + pullSets + legsSets || 1;
  const pushPct = Math.round((pushSets / pplTotal) * 100);
  const pullPct = Math.round((pullSets / pplTotal) * 100);
  const legsPct = Math.round((legsSets / pplTotal) * 100);

  // Balance insight calculation
  let balanceInsight = 'Balanced full-body stimulus across all primary muscle groups.';
  if (totalSets > 0) {
    if (pushPct > 55) {
      balanceInsight = 'Push-dominant: Consider adding rowing and pull-up volume to maintain shoulder health and posture balance.';
    } else if (pullPct > 55) {
      balanceInsight = 'Pull-dominant: Great posterior chain foundation. You can safely add pressing volume.';
    } else if (legsPct < 15 && totalSets >= 12) {
      balanceInsight = 'Upper-body priority: Add squats or deadlift variations to elevate lower-body foundation.';
    } else if (legsPct >= 35) {
      balanceInsight = 'Strong lower-body priority: Excellent metabolic and foundational power.';
    }
  }

  return (
    <div className="rounded-3xl bg-surface border border-border p-5 sm:p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/70">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-text-primary tracking-tight">
              Muscle Group & Symmetry Balance
            </h3>
          </div>
          <p className="text-xs text-text-muted mt-0.5">
            Distribution of working sets and volume across primary body parts.
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-raised border border-border text-xs font-mono text-text-primary font-bold self-start sm:self-auto">
          <span>{totalSets}</span>
          <span className="text-text-subtle font-normal">total sets</span>
        </div>
      </div>

      {totalSets > 0 ? (
        <div className="flex flex-col gap-5">
          {/* Push / Pull / Legs Quick Telemetry Strip */}
          <div className="p-3.5 rounded-2xl bg-surface-raised border border-border/70 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-text-muted text-[11px] uppercase tracking-wider font-mono">
                PPL Symmetry Split
              </span>
              <span className="text-[11px] font-mono text-text-subtle">
                Push {pushPct}% • Pull {pullPct}% • Legs {legsPct}%
              </span>
            </div>

            {/* 3-Part Ratio Bar */}
            <div className="w-full h-2 rounded-full bg-surface overflow-hidden flex gap-0.5">
              <div
                style={{ width: `${pushPct}%` }}
                className="h-full bg-sky-400 rounded-l-full transition-all duration-300"
                title={`Push: ${pushSets} sets (${pushPct}%)`}
              />
              <div
                style={{ width: `${pullPct}%` }}
                className="h-full bg-indigo-400 transition-all duration-300"
                title={`Pull: ${pullSets} sets (${pullPct}%)`}
              />
              <div
                style={{ width: `${legsPct}%` }}
                className="h-full bg-emerald-400 rounded-r-full transition-all duration-300"
                title={`Legs: ${legsSets} sets (${legsPct}%)`}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-text-subtle pt-0.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                <span>Push: <strong className="text-text-primary font-mono">{pushSets}</strong> sets</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                <span>Pull: <strong className="text-text-primary font-mono">{pullSets}</strong> sets</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Legs: <strong className="text-text-primary font-mono">{legsSets}</strong> sets</span>
              </div>
            </div>
          </div>

          {/* Proportional Segmented Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-text-subtle font-mono">
              <span>Overall Distribution</span>
              <span>100% of volume</span>
            </div>
            <div className="w-full h-3 rounded-xl bg-surface-raised border border-border/80 overflow-hidden flex p-0.5 gap-0.5">
              {activeGroups.map((group) => {
                const widthPct = Math.max(2, group.percentage);
                return (
                  <div
                    key={group.id}
                    style={{
                      width: `${widthPct}%`,
                      backgroundColor: group.color,
                    }}
                    className="h-full rounded-md transition-all duration-300"
                    title={`${group.name}: ${group.setsCount} sets (${group.percentage}%)`}
                  />
                );
              })}
            </div>
          </div>

          {/* Detailed Muscle Breakdown List (Clean rows, no truncation) */}
          <div className="space-y-2.5">
            {activeGroups.map((group) => (
              <div
                key={group.id}
                className="p-3 rounded-2xl bg-surface-raised border border-border/70 hover:border-border transition-colors space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: group.color }}
                    />
                    <span className="text-xs sm:text-sm font-bold text-text-primary">
                      {group.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold" style={{ color: group.color }}>
                      {group.percentage}%
                    </span>
                  </div>
                </div>

                {/* Progress bar for this muscle group */}
                <div className="w-full h-1.5 rounded-full bg-surface overflow-hidden">
                  <div
                    style={{
                      width: `${Math.min(100, group.percentage * 2.5)}%`,
                      backgroundColor: group.color,
                    }}
                    className="h-full rounded-full transition-all duration-300"
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-text-subtle font-mono">
                  <span>
                    <strong className="text-text-primary">{group.setsCount}</strong> working sets
                  </span>
                  <span>
                    {group.volumeKg.toLocaleString()} kg volume
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Structural Balance Insight Callout */}
          <div className="p-3.5 rounded-2xl bg-surface-raised border border-sky-500/20 flex items-start gap-3">
            <Activity className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <div className="text-xs text-text-muted leading-relaxed">
              <span className="font-semibold text-text-primary mr-1">Balance Analysis:</span>
              {balanceInsight}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-10 text-center text-text-muted text-xs">
          No exercise sets recorded yet. Log your first workout to see muscle distribution.
        </div>
      )}
    </div>
  );
}
