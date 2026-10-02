'use client';

import React, { useState, useTransition } from 'react';
import type { FullAnalyticsData, AnalyticsTimeRange } from '@/lib/types/analytics';
import { getAnalyticsDataAction } from '@/app/analytics/actions';
import { AnalyticsKpis } from './analytics-kpis';
import { VolumeTrendChart } from './volume-trend-chart';
import { MuscleBalanceChart } from './muscle-balance-chart';
import { ExerciseProgression } from './exercise-progression';
import { PrTrophyRoom } from './pr-trophy-room';
import {
  TrendingUp,
  Sparkles,
  Dumbbell,
  Play,
  RotateCcw,
  Layers,
  Award,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

interface AnalyticsDashboardProps {
  initialData: FullAnalyticsData;
}

export function AnalyticsDashboard({ initialData }: AnalyticsDashboardProps) {
  const [data, setData] = useState<FullAnalyticsData>(initialData);
  const [timeRange, setTimeRange] = useState<AnalyticsTimeRange>(initialData.timeRange);
  const [isPending, startTransition] = useTransition();

  const handleTimeRangeChange = (newRange: AnalyticsTimeRange) => {
    setTimeRange(newRange);
    startTransition(async () => {
      const res = await getAnalyticsDataAction(newRange);
      if (res.success && res.data) {
        setData(res.data);
      }
    });
  };

  const timeRangeLabels: Record<AnalyticsTimeRange, string> = {
    '7d': 'Last 7 Days',
    '30d': 'Last 30 Days',
    '90d': 'Last 90 Days',
    '1y': 'Past 1 Year',
    all: 'All-Time',
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Time Range Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl bg-surface border border-border">
        {/* Time Range Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-1 rounded-2xl bg-surface-raised border border-border/70 self-start sm:self-auto no-scrollbar">
          {(['7d', '30d', '90d', '1y', 'all'] as AnalyticsTimeRange[]).map((range) => (
            <button
              key={range}
              type="button"
              disabled={isPending}
              onClick={() => handleTimeRangeChange(range)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                timeRange === range
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {range}
            </button>
          ))}
        </div>

        {/* Real Data Status Badge */}
        <div className="flex items-center gap-2 text-xs font-mono text-text-subtle self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>
            {data.totalRecordedWorkoutsCount}{' '}
            {data.totalRecordedWorkoutsCount === 1 ? 'session' : 'sessions'} logged
          </span>
        </div>
      </div>

      {/* Empty State Banner if user has 0 workouts logged */}
      {!data.hasRealWorkouts && (
        <div className="relative rounded-3xl bg-surface-raised border border-border/80 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-text-primary">
                No Workouts Recorded Yet
              </h3>
              <p className="text-xs text-text-muted mt-0.5 max-w-xl leading-relaxed">
                Log your first workout to track volume trajectory, symmetry balance, and personal record milestones.
              </p>
            </div>
          </div>

          <Link
            href="/workout/active"
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm active:scale-[0.98] transition-all flex items-center gap-2 shrink-0 self-start sm:self-auto cursor-pointer shadow-lg shadow-emerald-900/30"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start Workout</span>
          </Link>
        </div>
      )}

      {/* Loading Overlay State Indicator */}
      <div className={`transition-opacity duration-200 ${isPending ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <AnalyticsKpis kpi={data.kpi} />

          {/* Volume Trajectory Chart */}
          <VolumeTrendChart
            data={data.volumeTrends}
            timeRangeLabel={timeRangeLabels[timeRange]}
          />

          {/* 2-Column Responsive Split: Muscle Distribution & PR Trophy Room */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Muscle Group Balance */}
            <MuscleBalanceChart distribution={data.muscleDistribution} />

            {/* PR Hall of Fame */}
            <PrTrophyRoom records={data.personalRecords} />
          </div>

          {/* Exercise Specific 1RM & Progression Tracker */}
          <ExerciseProgression exercises={data.exercises} />
        </div>
      </div>
    </div>
  );
}
