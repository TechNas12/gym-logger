'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  Zap,
  Shuffle,
  Activity,
  LineChart,
  ChevronRight,
} from 'lucide-react';

interface AnalyticsKpiWidgetProps {
  kpi: DashboardAnalyticsKpi;
}

interface UsefulKpiItem {
  id: string;
  category: string;
  title: string;
  value: string;
  unit?: string;
  badge: string;
  badgeType: 'emerald' | 'amber' | 'sky' | 'purple' | 'rose' | 'neutral';
  badgeIcon?: React.ReactNode;
  icon: React.ReactNode;
  iconBg: string;
  description: string;
}

export function AnalyticsKpiWidget({ kpi }: AnalyticsKpiWidgetProps) {
  // Construct the pool of available useful KPIs based on user's real training data
  const availableKpis = useMemo<UsefulKpiItem[]>(() => {
    if (!kpi.hasWorkouts) {
      return [
        {
          id: 'baseline',
          category: 'Training Baseline',
          title: 'Training Baseline',
          value: 'Day 1 Ready',
          badge: 'Ready to Lift',
          badgeType: 'emerald',
          badgeIcon: <Sparkles className="w-3 h-3" />,
          icon: <Dumbbell className="w-5 h-5 text-accent" />,
          iconBg: 'bg-accent/15 border-accent/30',
          description: 'Log your first workout to unlock automated 1RM velocity and volume tracking.',
        },
        {
          id: 'streak-start',
          category: 'Consistency',
          title: 'Weekly Streak',
          value: '0 Weeks',
          badge: 'Start Your Streak',
          badgeType: 'amber',
          badgeIcon: <Flame className="w-3 h-3" />,
          icon: <Flame className="w-5 h-5 text-amber-400" />,
          iconBg: 'bg-amber-500/15 border-amber-500/30',
          description: 'Consistency beats intensity. Set your schedule and start building your momentum.',
        },
      ];
    }

    const list: UsefulKpiItem[] = [];

    // 1. Weekly Volume
    const volumeChange = kpi.volumeChangePercent;
    list.push({
      id: 'volume',
      category: 'Volume Velocity',
      title: 'Weekly Volume',
      value: kpi.thisWeekVolumeKg.toLocaleString(),
      unit: 'kg',
      badge:
        volumeChange !== null
          ? volumeChange >= 0
            ? `+${volumeChange}% vs last week`
            : `${volumeChange}% vs last week`
          : 'Current Week',
      badgeType: volumeChange !== null ? (volumeChange >= 0 ? 'emerald' : 'rose') : 'neutral',
      badgeIcon:
        volumeChange !== null ? (
          volumeChange >= 0 ? (
            <ArrowUpRight className="w-3 h-3" />
          ) : (
            <ArrowDownRight className="w-3 h-3" />
          )
        ) : undefined,
      icon: <Dumbbell className="w-5 h-5 text-emerald-400" />,
      iconBg: 'bg-emerald-500/15 border-emerald-500/30',
      description: 'Total weight tonnage lifted across all completed sets this calendar week.',
    });

    // 2. Consistency Streak
    list.push({
      id: 'streak',
      category: 'Workout Streak',
      title: 'Active Consistency',
      value: `${kpi.currentStreakWeeks}`,
      unit: kpi.currentStreakWeeks === 1 ? 'week streak' : 'weeks streak',
      badge: `${kpi.thisWeekWorkoutsCount} ${kpi.thisWeekWorkoutsCount === 1 ? 'session' : 'sessions'} this week`,
      badgeType: 'amber',
      badgeIcon: <Flame className="w-3 h-3" />,
      icon: <Flame className="w-5 h-5 text-amber-400" />,
      iconBg: 'bg-amber-500/15 border-amber-500/30',
      description: 'Consecutive active training weeks. Consistent repetition drives progressive overload.',
    });

    // 3. Top Personal Record (if achieved)
    if (kpi.latestPr) {
      list.push({
        id: 'top-pr',
        category: 'Personal Record',
        title: kpi.latestPr.exerciseName,
        value: `${kpi.latestPr.weightKg} kg`,
        unit: `× ${kpi.latestPr.reps} reps`,
        badge: `${kpi.latestPr.est1rmKg} kg Est. 1RM`,
        badgeType: 'amber',
        badgeIcon: <Trophy className="w-3 h-3" />,
        icon: <Trophy className="w-5 h-5 text-amber-400" />,
        iconBg: 'bg-amber-500/15 border-amber-500/30',
        description: 'Your top personal strength milestone recorded in your recent workouts.',
      });
    }

    // 4. Muscle Focus
    if (kpi.topMuscleGroup) {
      list.push({
        id: 'muscle-focus',
        category: 'Muscle Focus',
        title: 'Target Focus',
        value: kpi.topMuscleGroup,
        badge: kpi.topMusclePercentage
          ? `${kpi.topMusclePercentage}% of weekly sets`
          : 'Hypertrophy Focus',
        badgeType: 'sky',
        badgeIcon: <Layers className="w-3 h-3" />,
        icon: <Layers className="w-5 h-5 text-sky-400" />,
        iconBg: 'bg-sky-500/15 border-sky-500/30',
        description: 'The dominant muscle group receiving the highest targeted volume distribution.',
      });
    }

    // 5. Training Frequency / Sessions
    list.push({
      id: 'frequency',
      category: 'Workout Frequency',
      title: 'Weekly Workouts',
      value: `${kpi.thisWeekWorkoutsCount}`,
      unit: kpi.thisWeekWorkoutsCount === 1 ? 'session' : 'sessions',
      badge: kpi.thisWeekWorkoutsCount >= 3 ? 'On Track' : 'Building Momentum',
      badgeType: kpi.thisWeekWorkoutsCount >= 3 ? 'emerald' : 'purple',
      badgeIcon: <Zap className="w-3 h-3" />,
      icon: <Activity className="w-5 h-5 text-purple-400" />,
      iconBg: 'bg-purple-500/15 border-purple-500/30',
      description: 'Completed workouts registered in the system during the current weekly cycle.',
    });

    return list;
  }, [kpi]);

  // Random KPI selection on client mount
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRotating, setIsRotating] = useState(false);

  useEffect(() => {
    if (availableKpis.length > 1) {
      // Pick random initial index on mount
      const randomIndex = Math.floor(Math.random() * availableKpis.length);
      setCurrentIndex(randomIndex);
    }
  }, [availableKpis.length]);

  const handleShuffle = () => {
    setIsRotating(true);
    setCurrentIndex((prev) => (prev + 1) % availableKpis.length);
    setTimeout(() => setIsRotating(false), 300);
  };

  const currentKpi = availableKpis[currentIndex] || availableKpis[0];

  const getBadgeClasses = (type: UsefulKpiItem['badgeType']) => {
    switch (type) {
      case 'emerald':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'amber':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'sky':
        return 'bg-sky-500/15 text-sky-400 border-sky-500/30';
      case 'purple':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      case 'rose':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      default:
        return 'bg-surface-raised text-text-subtle border-border';
    }
  };

  return (
    <section
      aria-label="Training Analytics Overview"
      className="w-full rounded-3xl bg-surface border border-border p-5 sm:p-6 lg:p-7 shadow-sm transition-all"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border/70 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-text-primary uppercase tracking-wider">
              Training Analytics
            </h2>
          </div>
        </div>

        <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-surface-raised border border-border text-text-subtle">
          Real-Time KPIs
        </span>
      </div>

      {/* 2-Column Responsive Layout: Random KPI on Left, CTA on Right */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5 items-stretch">
        {/* LEFT COLUMN: Random Useful KPI Card */}
        <div className="rounded-2xl bg-surface-raised border border-border/80 p-5 sm:p-6 flex flex-col justify-between relative group hover:border-border-focus/60 transition-all">
          <div>
            {/* Top Bar inside Left Card */}
            <div className="flex items-center justify-between gap-2 mb-3.5">
              <div className="flex items-center gap-2">
                <div
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${currentKpi.iconBg}`}
                >
                  {currentKpi.icon}
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-subtle block">
                    {currentKpi.category}
                  </span>
                  <span className="text-xs font-semibold text-text-primary">
                    {currentKpi.title}
                  </span>
                </div>
              </div>

              {/* Shuffle / Randomize Button */}
              {availableKpis.length > 1 && (
                <button
                  type="button"
                  onClick={handleShuffle}
                  title="Show another random KPI"
                  className="p-1.5 rounded-lg text-text-subtle hover:text-text-primary hover:bg-surface border border-transparent hover:border-border transition-all focus-ring cursor-pointer flex items-center gap-1 text-[11px] font-medium"
                >
                  <Shuffle
                    className={`w-3.5 h-3.5 transition-transform duration-300 ${
                      isRotating ? 'rotate-180' : ''
                    }`}
                  />
                  <span className="hidden sm:inline text-[10px]">Shuffle</span>
                </button>
              )}
            </div>

            {/* Main KPI Stat Display */}
            <div className="my-3">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-text-primary">
                  {currentKpi.value}
                </span>
                {currentKpi.unit && (
                  <span className="text-sm font-semibold text-text-subtle font-mono">
                    {currentKpi.unit}
                  </span>
                )}
              </div>

              {/* Dynamic KPI Badge */}
              <div className="mt-2.5">
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getBadgeClasses(
                    currentKpi.badgeType
                  )}`}
                >
                  {currentKpi.badgeIcon}
                  <span>{currentKpi.badge}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Context Insight Sentence */}
          <div className="pt-3.5 border-t border-border/60 mt-3 text-xs text-text-muted leading-relaxed">
            {currentKpi.description}
          </div>
        </div>

        {/* RIGHT COLUMN: Dedicated CTA for Analytics Page */}
        <div className="rounded-2xl bg-gradient-to-br from-surface-raised via-surface-raised/80 to-surface border border-emerald-500/25 p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          {/* Subtle Ambient Background Gradient */}
          <div
            className="absolute -right-8 -top-8 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider font-mono">
                <LineChart className="w-3 h-3" />
                Performance Suite
              </div>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-text-primary tracking-tight">
                Deep Training Analytics
              </h3>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                Analyze your progressive overload trajectory, 1RM milestones, and muscle group volume balance.
              </p>
            </div>

            {/* Feature Bullets */}
            <div className="space-y-1.5 pt-1 text-xs text-text-subtle font-medium">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Brzycki 1RM progression curve over time</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                <span>Hypertrophy volume distribution &amp; symmetry</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>All-time Personal Record trophy showcase</span>
              </div>
            </div>
          </div>

          {/* Primary CTA Link Button */}
          <div className="pt-5 mt-3 relative z-10">
            <Link
              href="/analytics"
              className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-950/40 transition-all active:scale-[0.98] cursor-pointer inline-flex items-center justify-center gap-2 focus-ring group/btn"
            >
              <span>View Full Analytics Dashboard</span>
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
