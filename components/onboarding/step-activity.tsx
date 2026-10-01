'use client';

import React, { useState } from 'react';
import {
  Armchair,
  Footprints,
  Activity,
  Dumbbell,
  Flame,
  TrendingDown,
  Scale,
  TrendingUp,
  ArrowRight,
  ArrowLeft,
  Check,
  Zap,
} from 'lucide-react';
import type { ActivityLevel, FitnessGoal } from '@/lib/fitness-calculations';
import {
  ACTIVITY_LEVEL_DETAILS,
  FITNESS_GOAL_DETAILS,
  WEIGHT_LOSS_RATES,
  WEIGHT_GAIN_RATES,
} from '@/lib/fitness-calculations';
import { stepActivitySchema } from '@/lib/validations/onboarding';

interface StepActivityProps {
  activityLevel: ActivityLevel;
  fitnessGoal: FitnessGoal;
  weeklyGoalRateKg: number;
  onChange: (fields: {
    activityLevel?: ActivityLevel;
    fitnessGoal?: FitnessGoal;
    weeklyGoalRateKg?: number;
  }) => void;
  onNext: () => void;
  onBack: () => void;
}

const ACTIVITY_ITEMS: {
  id: ActivityLevel;
  icon: React.ComponentType<{ className?: string }>;
  tag: string;
}[] = [
  { id: 'sedentary', icon: Armchair, tag: '1.2x TDEE' },
  { id: 'light', icon: Footprints, tag: '1.38x TDEE' },
  { id: 'moderate', icon: Activity, tag: '1.55x TDEE' },
  { id: 'active', icon: Dumbbell, tag: '1.73x TDEE' },
  { id: 'very_active', icon: Flame, tag: '1.9x TDEE' },
];

const GOAL_ITEMS: {
  id: FitnessGoal;
  icon: React.ComponentType<{ className?: string }>;
  detail: string;
}[] = [
  {
    id: 'lose_weight',
    icon: TrendingDown,
    detail: 'Controlled caloric deficit to burn fat while preserving strength.',
  },
  {
    id: 'maintain',
    icon: Scale,
    detail: 'Balanced calories for body recomposition, health, and consistent training.',
  },
  {
    id: 'gain_muscle',
    icon: TrendingUp,
    detail: 'Lean caloric surplus providing energy for hypertrophy and lifting heavier.',
  },
];

export function StepActivity({
  activityLevel,
  fitnessGoal,
  weeklyGoalRateKg,
  onChange,
  onNext,
  onBack,
}: StepActivityProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleGoalChange = (newGoal: FitnessGoal) => {
    let newRate = weeklyGoalRateKg;
    if (newGoal === 'lose_weight' && (weeklyGoalRateKg === 0 || weeklyGoalRateKg > 1)) {
      newRate = 0.5;
    } else if (newGoal === 'gain_muscle' && (weeklyGoalRateKg === 0 || weeklyGoalRateKg > 0.5)) {
      newRate = 0.25;
    } else if (newGoal === 'maintain') {
      newRate = 0;
    }

    onChange({
      fitnessGoal: newGoal,
      weeklyGoalRateKg: newRate,
    });
    setErrors((prev) => ({ ...prev, fitnessGoal: '' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = stepActivitySchema.safeParse({
      activityLevel,
      fitnessGoal,
      weeklyGoalRateKg,
    });

    if (!result.success) {
      const newErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as string;
        if (!newErrors[key]) {
          newErrors[key] = issue.message;
        }
      }
      setErrors(newErrors);
      return;
    }

    onNext();
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* 1. ACTIVITY LEVEL */}
      <div>
        <label className="block text-xs uppercase tracking-wider font-semibold text-text-primary mb-1.5">
          Activity Level
        </label>
        <p className="text-xs text-text-subtle mb-3">
          How much movement or training do you get in a typical week?
        </p>

        {/* Responsive grid: 1-col mobile, 2-col on sm+ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {ACTIVITY_ITEMS.map((item) => {
            const info = ACTIVITY_LEVEL_DETAILS[item.id];
            const isSelected = activityLevel === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onChange({ activityLevel: item.id });
                  setErrors((prev) => ({ ...prev, activityLevel: '' }));
                }}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer min-h-[64px] focus-ring relative ${
                  isSelected
                    ? 'bg-accent/15 border-accent shadow-[0_0_20px_rgba(34,197,94,0.2)]'
                    : 'bg-surface-raised border-border/80 hover:border-border hover:bg-surface-hover'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-surface border border-border text-text-subtle'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 pr-6">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs sm:text-sm font-bold text-text-primary">
                      {info.label}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface border border-border/80 text-text-subtle">
                      {item.tag}
                    </span>
                  </div>
                  <p className="text-[11px] text-text-muted mt-0.5 leading-snug line-clamp-2">
                    {info.description}
                  </p>
                </div>

                {isSelected && (
                  <div className="absolute right-3 top-3.5 w-5 h-5 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
        {errors.activityLevel && (
          <p className="mt-1.5 text-xs text-danger font-medium animate-in fade-in">
            • {errors.activityLevel}
          </p>
        )}
      </div>

      {/* 2. FITNESS GOAL */}
      <div className="pt-2 border-t border-border/70">
        <label className="block text-xs uppercase tracking-wider font-semibold text-text-primary mb-1.5">
          Primary Fitness Goal
        </label>
        <p className="text-xs text-text-subtle mb-3">
          Select what you want to achieve with your current training cycle.
        </p>

        {/* Responsive grid: 1-col mobile, 3-col on sm+ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {GOAL_ITEMS.map((item) => {
            const goalInfo = FITNESS_GOAL_DETAILS[item.id];
            const isSelected = fitnessGoal === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleGoalChange(item.id)}
                className={`flex flex-col justify-between p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer min-h-[110px] focus-ring relative ${
                  isSelected
                    ? 'bg-accent/15 border-accent shadow-[0_0_20px_rgba(34,197,94,0.2)]'
                    : 'bg-surface-raised border-border/80 hover:border-border hover:bg-surface-hover'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-accent text-accent-foreground'
                          : 'bg-surface border border-border text-text-subtle'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-text-primary">
                    {goalInfo.label}
                  </h3>
                  <p className="text-[11px] text-text-muted mt-1 leading-snug">
                    {item.detail}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-border/60">
                  <span
                    className={`inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${goalInfo.badgeColor}`}
                  >
                    {goalInfo.shortDesc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
        {errors.fitnessGoal && (
          <p className="mt-1.5 text-xs text-danger font-medium animate-in fade-in">
            • {errors.fitnessGoal}
          </p>
        )}
      </div>

      {/* 3. WEEKLY RATE SELECTION (Appears dynamically based on selected goal) */}
      {fitnessGoal === 'lose_weight' && (
        <div className="pt-3 border-t border-border/70 animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs uppercase tracking-wider font-semibold text-text-primary">
              Target Weekly Weight Loss Pace
            </label>
            <span className="text-[11px] font-mono font-bold text-amber-400">
              {weeklyGoalRateKg} kg / week
            </span>
          </div>
          <p className="text-xs text-text-subtle mb-3">
            Choose your target reduction rate. 1 kg of fat ≈ 7,700 kcal. Faster pace requires a steeper caloric deficit.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {WEIGHT_LOSS_RATES.map((rate) => {
              const isSelected = weeklyGoalRateKg === rate.rateKg;

              return (
                <button
                  key={rate.rateKg}
                  type="button"
                  onClick={() => onChange({ weeklyGoalRateKg: rate.rateKg })}
                  className={`p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer focus-ring relative ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                      : 'bg-surface-raised border-border/80 hover:border-border hover:bg-surface-hover'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs sm:text-sm font-bold text-text-primary">
                      {rate.label}
                    </span>
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {rate.dailyKcal} kcal/day
                    </span>
                  </div>
                  <p className="text-[11px] text-text-muted leading-snug">
                    {rate.description}
                  </p>
                  {isSelected && (
                    <div className="absolute right-3.5 bottom-3.5 w-4 h-4 rounded-full bg-amber-400 text-surface flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {fitnessGoal === 'gain_muscle' && (
        <div className="pt-3 border-t border-border/70 animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs uppercase tracking-wider font-semibold text-text-primary">
              Target Weekly Muscle Gain Pace
            </label>
            <span className="text-[11px] font-mono font-bold text-accent">
              +{weeklyGoalRateKg} kg / week
            </span>
          </div>
          <p className="text-xs text-text-subtle mb-3">
            Choose your surplus rate. Lean bulk maximizes muscle protein synthesis while keeping unwanted body fat to a minimum.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {WEIGHT_GAIN_RATES.map((rate) => {
              const isSelected = weeklyGoalRateKg === rate.rateKg;

              return (
                <button
                  key={rate.rateKg}
                  type="button"
                  onClick={() => onChange({ weeklyGoalRateKg: rate.rateKg })}
                  className={`p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer focus-ring relative ${
                    isSelected
                      ? 'bg-accent/15 border-accent shadow-[0_0_20px_rgba(34,197,94,0.2)]'
                      : 'bg-surface-raised border-border/80 hover:border-border hover:bg-surface-hover'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs sm:text-sm font-bold text-text-primary">
                      {rate.label}
                    </span>
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-accent/20 text-accent border border-accent/30">
                      +{rate.dailyKcal} kcal/day
                    </span>
                  </div>
                  <p className="text-[11px] text-text-muted leading-snug">
                    {rate.description}
                  </p>
                  {isSelected && (
                    <div className="absolute right-3.5 bottom-3.5 w-4 h-4 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {fitnessGoal === 'maintain' && (
        <div className="p-3.5 rounded-2xl bg-surface-raised border border-border/70 flex items-center gap-3 text-xs text-text-muted">
          <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-text-primary block">
              Maintenance Energy Balance
            </span>
            <span>
              Target calories will exactly match your daily energy expenditure (TDEE) with 0 deficit or surplus.
            </span>
          </div>
        </div>
      )}

      {/* Button controls (Back + Continue) */}
      <div className="pt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 sm:flex-none sm:min-w-[120px] min-h-[48px] inline-flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl bg-surface-raised border border-border/80 hover:bg-surface-hover text-text-primary font-semibold text-xs sm:text-sm transition-colors focus-ring cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          type="submit"
          className="flex-[2] min-h-[48px] inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-accent text-accent-foreground font-bold text-xs sm:text-sm hover:bg-accent-hover active:bg-accent-active active:scale-[0.99] transition-all duration-200 focus-ring shadow-[0_0_25px_rgba(34,197,94,0.35)] hover:shadow-[0_0_35px_rgba(34,197,94,0.5)] cursor-pointer group"
        >
          <span>Calculate My Targets</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </form>
  );
}
