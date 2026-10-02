'use client';

import React from 'react';
import {
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Flame,
  Activity,
  AlertCircle,
  Dumbbell,
  Target,
} from 'lucide-react';
import type {
  Gender,
  ActivityLevel,
  FitnessGoal,
} from '@/lib/fitness-calculations';
import {
  computeFitnessMetrics,
  ACTIVITY_LEVEL_DETAILS,
} from '@/lib/fitness-calculations';

interface StepReviewProps {
  gender: Gender;
  dateOfBirth: string;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  fitnessGoal: FitnessGoal;
  weeklyGoalRateKg: number;
  onBack: () => void;
  onSubmit: () => void;
  isPending: boolean;
  error?: string | null;
}

export function StepReview({
  gender,
  dateOfBirth,
  heightCm,
  weightKg,
  activityLevel,
  fitnessGoal,
  weeklyGoalRateKg,
  onBack,
  onSubmit,
  isPending,
  error,
}: StepReviewProps) {
  // Compute metrics in real-time
  const metrics = computeFitnessMetrics({
    gender,
    dateOfBirth,
    heightCm,
    weightKg,
    activityLevel,
    fitnessGoal,
    weeklyGoalRateKg,
  });

  const activityInfo = ACTIVITY_LEVEL_DETAILS[activityLevel];

  // BMI bar percentage position: scale from 15 to 35
  const clampedBmi = Math.max(15, Math.min(35, metrics.bmi));
  const bmiPercent = ((clampedBmi - 15) / (35 - 15)) * 100;

  // Category badge color
  const getBmiBadgeColor = (category: string) => {
    switch (category) {
      case 'normal':
        return 'text-accent bg-accent/15 border-accent/40 shadow-[0_0_15px_rgba(34,197,94,0.25)]';
      case 'underweight':
        return 'text-sky-400 bg-sky-500/15 border-sky-500/40';
      case 'overweight':
        return 'text-amber-400 bg-amber-500/15 border-amber-500/40';
      case 'obese':
        return 'text-rose-400 bg-rose-500/15 border-rose-500/40';
      default:
        return 'text-text-primary bg-surface border-border';
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Error alert banner */}
      {error && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-danger-bg border border-danger-border flex items-start gap-2.5 text-xs text-danger font-medium animate-in fade-in"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. Quick Stats Summary Header */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-surface-raised border border-border/80 text-xs">
        <div className="flex items-center justify-between pb-2.5 border-b border-border/70 mb-2.5">
          <span className="font-semibold text-text-primary uppercase tracking-wider text-[10px]">
            Profile Baseline
          </span>
          <span className="text-[11px] text-accent font-mono font-bold capitalize">
            {gender} • {metrics.age} yrs
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
          <div className="p-2 rounded-xl bg-surface border border-border/60">
            <span className="text-[10px] text-text-subtle block">Height</span>
            <span className="font-mono font-bold text-text-primary text-xs sm:text-sm">
              {metrics.heightCm} <span className="text-[10px] text-text-subtle">cm</span>
            </span>
          </div>
          <div className="p-2 rounded-xl bg-surface border border-border/60">
            <span className="text-[10px] text-text-subtle block">Weight</span>
            <span className="font-mono font-bold text-text-primary text-xs sm:text-sm">
              {metrics.weightKg} <span className="text-[10px] text-text-subtle">kg</span>
            </span>
          </div>
          <div className="p-2 rounded-xl bg-surface border border-border/60">
            <span className="text-[10px] text-text-subtle block">Activity</span>
            <span className="font-semibold text-text-primary text-xs truncate block">
              {activityInfo.label}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-surface border border-border/60">
            <span className="text-[10px] text-text-subtle block">Goal Pace</span>
            <span className="font-semibold text-text-primary text-xs truncate block">
              {metrics.weeklyGoalRateLabel}
            </span>
          </div>
        </div>
      </div>

      {/* 2. BMI Card with Visual Gauge Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-surface-raised border border-border/80">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-accent" />
            <h3 className="text-xs uppercase tracking-wider font-semibold text-text-primary">
              Body Mass Index (BMI)
            </h3>
          </div>
          <span
            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getBmiBadgeColor(
              metrics.bmiCategory
            )}`}
          >
            {metrics.bmiCategoryLabel}
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-text-primary">
            {metrics.bmi}
          </span>
          <span className="text-xs text-text-subtle">kg/m²</span>
        </div>

        {/* Visual Gauge Bar */}
        <div className="space-y-1.5">
          <div className="relative h-2.5 w-full rounded-full bg-gradient-to-r from-sky-500 via-emerald-500 via-amber-500 to-rose-500 overflow-visible shadow-inner">
            {/* Indicator Marker Dot */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-text-primary border-2 border-background shadow-[0_0_10px_rgba(0,0,0,0.8)] transition-all duration-500"
              style={{ left: `${bmiPercent}%` }}
              aria-label={`BMI position: ${metrics.bmi}`}
            />
          </div>

          <div className="flex justify-between text-[10px] text-text-subtle font-mono pt-1">
            <span>&lt; 18.5</span>
            <span>18.5 – 24.9</span>
            <span>25 – 29.9</span>
            <span>≥ 30</span>
          </div>
        </div>
      </div>

      {/* 3. Daily Calories & Targets Grid (2x2) */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* BMR */}
        <div className="p-3.5 rounded-2xl bg-surface-raised border border-border/80">
          <div className="flex items-center gap-1.5 text-text-subtle mb-1">
            <Flame className="w-3.5 h-3.5" />
            <span className="text-[11px] font-semibold">Basal (BMR)</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black font-mono text-text-primary">
              {metrics.bmr.toLocaleString()}
            </span>
            <span className="text-[10px] text-text-subtle">kcal</span>
          </div>
          <p className="text-[10px] text-text-muted mt-0.5">Burned at complete rest</p>
        </div>

        {/* TDEE */}
        <div className="p-3.5 rounded-2xl bg-surface-raised border border-border/80">
          <div className="flex items-center gap-1.5 text-text-subtle mb-1">
            <Activity className="w-3.5 h-3.5" />
            <span className="text-[11px] font-semibold">Maintenance</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black font-mono text-text-primary">
              {metrics.tdee.toLocaleString()}
            </span>
            <span className="text-[10px] text-text-subtle">kcal</span>
          </div>
          <p className="text-[10px] text-text-muted mt-0.5">TDEE with activity</p>
        </div>

        {/* Daily Target Calories (Highlighted Primary) */}
        <div className="p-3.5 rounded-2xl bg-accent/10 border border-accent/40 shadow-[0_0_25px_rgba(34,197,94,0.15)] col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5 text-accent">
              <Target className="w-3.5 h-3.5" />
              <span className="text-[11px] font-bold">Daily Calorie Target</span>
            </div>
            <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-accent/20 text-accent">
              Goal
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black font-mono text-accent">
              {metrics.targetCalories.toLocaleString()}
            </span>
            <span className="text-xs text-accent font-semibold">kcal / day</span>
          </div>
          <p className="text-[10px] text-text-muted mt-0.5">
            Your personalized daily energy intake
          </p>
        </div>

        {/* Caloric Adjustment */}
        <div className="p-3.5 rounded-2xl bg-surface-raised border border-border/80 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-text-subtle mb-1">
            <div className="flex items-center gap-1.5">
              <Dumbbell className="w-3.5 h-3.5" />
              <span className="text-[11px] font-semibold">Energy Adjustment</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-accent">
              {metrics.weeklyGoalRateLabel}
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span
              className={`text-2xl sm:text-3xl font-black font-mono ${
                metrics.caloricAdjustment > 0
                  ? 'text-accent'
                  : metrics.caloricAdjustment < 0
                  ? 'text-amber-400'
                  : 'text-text-primary'
              }`}
            >
              {metrics.caloricAdjustment > 0
                ? `+${metrics.caloricAdjustment}`
                : metrics.caloricAdjustment === 0
                ? '0'
                : metrics.caloricAdjustment}
            </span>
            <span className="text-[10px] text-text-subtle">kcal / day</span>
          </div>
          <p className="text-[10px] text-text-muted mt-0.5">
            {metrics.caloricAdjustment < 0
              ? `Deficit calibrated for ${metrics.weeklyGoalRateKg} kg / week loss`
              : metrics.caloricAdjustment > 0
              ? `Surplus calibrated for ${metrics.weeklyGoalRateKg} kg / week gain`
              : 'Maintenance energy balance'}
          </p>
        </div>
      </div>

      {/* 4. Macronutrient Distribution */}
      <div className="p-4 sm:p-5 rounded-2xl bg-surface-raised border border-border/80">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs uppercase tracking-wider font-semibold text-text-primary">
            Target Macronutrient Split
          </h3>
          <span className="text-[11px] text-text-subtle font-mono">100% Total</span>
        </div>

        {/* Proportional Segmented Progress Bar */}
        <div className="h-2.5 w-full rounded-full bg-surface flex overflow-hidden border border-border/60 mb-3.5">
          <div
            style={{ width: `${metrics.macros.protein.percentage}%` }}
            className="bg-sky-400 transition-all duration-500"
            title={`Protein: ${metrics.macros.protein.percentage}%`}
          />
          <div
            style={{ width: `${metrics.macros.carbs.percentage}%` }}
            className="bg-amber-400 transition-all duration-500"
            title={`Carbs: ${metrics.macros.carbs.percentage}%`}
          />
          <div
            style={{ width: `${metrics.macros.fat.percentage}%` }}
            className="bg-rose-400 transition-all duration-500"
            title={`Fat: ${metrics.macros.fat.percentage}%`}
          />
        </div>

        {/* 3 Macro Cards */}
        <div className="grid grid-cols-3 gap-2 text-left">
          {/* Protein */}
          <div className="p-2.5 rounded-xl bg-surface border border-sky-500/20">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              <span className="text-[11px] font-bold text-sky-400">Protein</span>
            </div>
            <div className="font-mono text-base sm:text-lg font-black text-text-primary">
              {metrics.macros.protein.grams}
              <span className="text-[10px] text-text-subtle font-normal ml-0.5">g</span>
            </div>
            <div className="text-[10px] text-text-subtle font-mono">
              {metrics.macros.protein.percentage}% • {metrics.macros.protein.calories} kcal
            </div>
          </div>

          {/* Carbs */}
          <div className="p-2.5 rounded-xl bg-surface border border-amber-500/20">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-[11px] font-bold text-amber-400">Carbs</span>
            </div>
            <div className="font-mono text-base sm:text-lg font-black text-text-primary">
              {metrics.macros.carbs.grams}
              <span className="text-[10px] text-text-subtle font-normal ml-0.5">g</span>
            </div>
            <div className="text-[10px] text-text-subtle font-mono">
              {metrics.macros.carbs.percentage}% • {metrics.macros.carbs.calories} kcal
            </div>
          </div>

          {/* Fat */}
          <div className="p-2.5 rounded-xl bg-surface border border-rose-500/20">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span className="text-[11px] font-bold text-rose-400">Fat</span>
            </div>
            <div className="font-mono text-base sm:text-lg font-black text-text-primary">
              {metrics.macros.fat.grams}
              <span className="text-[10px] text-text-subtle font-normal ml-0.5">g</span>
            </div>
            <div className="text-[10px] text-text-subtle font-mono">
              {metrics.macros.fat.percentage}% • {metrics.macros.fat.calories} kcal
            </div>
          </div>
        </div>
      </div>

      {/* Footnote on updating later */}
      <div className="flex items-center gap-2 text-xs text-text-subtle pt-1">
        <Sparkles className="w-3.5 h-3.5 text-accent shrink-0" />
        <span>
          You can update your body weight, activity, and goals anytime as your fitness progresses.
        </span>
      </div>

      {/* Button controls (Back to Edit + Complete Setup) */}
      <div className="pt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={isPending}
          className="flex-1 sm:flex-none sm:min-w-[120px] min-h-[48px] inline-flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl bg-surface-raised border border-border/80 hover:bg-surface-hover text-text-primary font-semibold text-xs sm:text-sm transition-colors focus-ring cursor-pointer disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Edit Details</span>
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={isPending}
          className="flex-[2] min-h-[48px] inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-accent text-accent-foreground font-bold text-xs sm:text-sm hover:bg-accent-hover active:bg-accent-active active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus-ring shadow-[0_0_25px_rgba(34,197,94,0.35)] hover:shadow-[0_0_35px_rgba(34,197,94,0.5)] cursor-pointer group"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Your Profile...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete Setup & View Plan</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
