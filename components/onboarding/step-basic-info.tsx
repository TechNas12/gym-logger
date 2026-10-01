'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Ruler,
  Weight,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import type { Gender } from '@/lib/fitness-calculations';
import {
  calculateAge,
  lbsToKg,
  kgToLbs,
  ftInToCm,
  cmToFtIn,
} from '@/lib/fitness-calculations';
import { stepBasicInfoSchema } from '@/lib/validations/onboarding';

interface StepBasicInfoProps {
  gender: Gender;
  dateOfBirth: string;
  heightCm: number;
  weightKg: number;
  onChange: (fields: {
    gender?: Gender;
    dateOfBirth?: string;
    heightCm?: number;
    weightKg?: number;
  }) => void;
  onNext: () => void;
}

export function StepBasicInfo({
  gender,
  dateOfBirth,
  heightCm,
  weightKg,
  onChange,
  onNext,
}: StepBasicInfoProps) {
  // Height unit mode
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm');
  const initialFtIn = heightCm > 0 ? cmToFtIn(heightCm) : { feet: 5, inches: 9 };
  const [feet, setFeet] = useState<string>(String(initialFtIn.feet));
  const [inches, setInches] = useState<string>(String(initialFtIn.inches));
  const [rawHeightCm, setRawHeightCm] = useState<string>(
    heightCm > 0 ? String(heightCm) : '175'
  );

  // Weight unit mode
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const [rawWeightKg, setRawWeightKg] = useState<string>(
    weightKg > 0 ? String(weightKg) : '72'
  );
  const [rawWeightLbs, setRawWeightLbs] = useState<string>(
    weightKg > 0 ? String(kgToLbs(weightKg)) : '160'
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle Height changes
  const handleCmChange = (val: string) => {
    setRawHeightCm(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      onChange({ heightCm: num });
      const { feet: f, inches: i } = cmToFtIn(num);
      setFeet(String(f));
      setInches(String(i));
    }
  };

  const handleFtInChange = (newFeet: string, newInches: string) => {
    setFeet(newFeet);
    setInches(newInches);
    const f = parseInt(newFeet, 10) || 0;
    const i = parseFloat(newInches) || 0;
    if (f > 0 || i > 0) {
      const computedCm = ftInToCm(f, i);
      setRawHeightCm(String(computedCm));
      onChange({ heightCm: computedCm });
    }
  };

  // Handle Weight changes
  const handleKgChange = (val: string) => {
    setRawWeightKg(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      onChange({ weightKg: num });
      setRawWeightLbs(String(kgToLbs(num)));
    }
  };

  const handleLbsChange = (val: string) => {
    setRawWeightLbs(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      const computedKg = lbsToKg(num);
      setRawWeightKg(String(computedKg));
      onChange({ weightKg: computedKg });
    }
  };

  const calculatedAge = dateOfBirth ? calculateAge(dateOfBirth) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const currentHeight = parseFloat(rawHeightCm) || heightCm;
    const currentWeight = parseFloat(rawWeightKg) || weightKg;

    const result = stepBasicInfoSchema.safeParse({
      gender,
      dateOfBirth,
      heightCm: currentHeight,
      weightKg: currentWeight,
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

    // Pass valid numbers
    onChange({
      gender: result.data.gender,
      dateOfBirth: result.data.dateOfBirth,
      heightCm: result.data.heightCm,
      weightKg: result.data.weightKg,
    });

    onNext();
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* 1. GENDER SELECTION */}
      <div>
        <label className="block text-xs uppercase tracking-wider font-semibold text-text-primary mb-2.5">
          Biological Sex / Gender
        </label>
        <p className="text-xs text-text-subtle mb-3">
          Used to accurately compute Basal Metabolic Rate (Mifflin-St Jeor formula).
        </p>

        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          {(
            [
              { id: 'male', label: 'Male', sub: '♂' },
              { id: 'female', label: 'Female', sub: '♀' },
              { id: 'other', label: 'Other', sub: '⚥' },
            ] as const
          ).map((item) => {
            const isSelected = gender === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onChange({ gender: item.id });
                  setErrors((prev) => ({ ...prev, gender: '' }));
                }}
                className={`flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl border text-center transition-all duration-200 cursor-pointer min-h-[58px] focus-ring ${
                  isSelected
                    ? 'bg-accent/15 border-accent text-accent shadow-[0_0_20px_rgba(34,197,94,0.2)]'
                    : 'bg-surface-raised border-border/80 text-text-muted hover:border-border hover:bg-surface-hover hover:text-text-primary'
                }`}
              >
                <span className="text-base sm:text-lg mb-0.5">{item.sub}</span>
                <span className="text-xs sm:text-sm font-semibold">{item.label}</span>
              </button>
            );
          })}
        </div>
        {errors.gender && (
          <p className="mt-1.5 text-xs text-danger font-medium animate-in fade-in">
            • {errors.gender}
          </p>
        )}
      </div>

      {/* 2. DATE OF BIRTH */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label
            htmlFor="onboarding-dob"
            className="block text-xs uppercase tracking-wider font-semibold text-text-primary"
          >
            Date of Birth
          </label>
          {calculatedAge !== null && !isNaN(calculatedAge) && calculatedAge > 0 && (
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30 font-semibold">
              {calculatedAge} years old
            </span>
          )}
        </div>

        <div className="relative">
          <Calendar
            className="w-4 h-4 text-text-subtle absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            id="onboarding-dob"
            type="date"
            required
            value={dateOfBirth}
            onChange={(e) => {
              onChange({ dateOfBirth: e.target.value });
              setErrors((prev) => ({ ...prev, dateOfBirth: '' }));
            }}
            max={new Date().toISOString().split('T')[0]}
            className={`w-full pl-10 pr-3.5 py-3 rounded-xl bg-surface-raised border text-text-primary text-sm transition-all focus-ring min-h-[48px] ${
              errors.dateOfBirth
                ? 'border-danger focus-visible:ring-danger bg-danger-bg/20'
                : 'border-border/80 hover:border-border-focus/60'
            }`}
          />
        </div>
        {errors.dateOfBirth && (
          <p className="mt-1.5 text-xs text-danger font-medium animate-in fade-in">
            • {errors.dateOfBirth}
          </p>
        )}
      </div>

      {/* 3. HEIGHT & WEIGHT (Responsive: Stack on mobile, 2-col on sm+) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Height Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="onboarding-height"
              className="block text-xs uppercase tracking-wider font-semibold text-text-primary"
            >
              Height
            </label>
            {/* Unit switch toggle pill */}
            <div className="flex items-center rounded-lg bg-surface-raised border border-border p-0.5 text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setHeightUnit('cm')}
                className={`px-2 py-0.5 rounded-md transition-colors ${
                  heightUnit === 'cm'
                    ? 'bg-accent text-accent-foreground shadow-sm'
                    : 'text-text-subtle hover:text-text-primary'
                }`}
              >
                cm
              </button>
              <button
                type="button"
                onClick={() => setHeightUnit('ft')}
                className={`px-2 py-0.5 rounded-md transition-colors ${
                  heightUnit === 'ft'
                    ? 'bg-accent text-accent-foreground shadow-sm'
                    : 'text-text-subtle hover:text-text-primary'
                }`}
              >
                ft / in
              </button>
            </div>
          </div>

          {heightUnit === 'cm' ? (
            <div className="relative">
              <Ruler
                className="w-4 h-4 text-text-subtle absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                id="onboarding-height"
                type="number"
                step="0.5"
                min="50"
                max="260"
                placeholder="175"
                value={rawHeightCm}
                onChange={(e) => {
                  handleCmChange(e.target.value);
                  setErrors((prev) => ({ ...prev, heightCm: '' }));
                }}
                className={`w-full pl-10 pr-12 py-3 rounded-xl bg-surface-raised border text-text-primary text-sm font-mono transition-all focus-ring min-h-[48px] ${
                  errors.heightCm
                    ? 'border-danger focus-visible:ring-danger bg-danger-bg/20'
                    : 'border-border/80 hover:border-border-focus/60'
                }`}
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-text-subtle pointer-events-none font-semibold">
                cm
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <input
                  type="number"
                  min="2"
                  max="8"
                  placeholder="5"
                  value={feet}
                  onChange={(e) => handleFtInChange(e.target.value, inches)}
                  className="w-full pl-3.5 pr-8 py-3 rounded-xl bg-surface-raised border border-border/80 text-text-primary text-sm font-mono focus-ring min-h-[48px]"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-subtle pointer-events-none">
                  ft
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="11"
                  placeholder="9"
                  value={inches}
                  onChange={(e) => handleFtInChange(feet, e.target.value)}
                  className="w-full pl-3.5 pr-8 py-3 rounded-xl bg-surface-raised border border-border/80 text-text-primary text-sm font-mono focus-ring min-h-[48px]"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-subtle pointer-events-none">
                  in
                </span>
              </div>
            </div>
          )}

          {heightUnit === 'ft' && (
            <p className="mt-1 text-[11px] text-text-subtle font-mono">
              Converted: <strong className="text-accent">{rawHeightCm} cm</strong> ({((parseFloat(rawHeightCm) || 0) / 100).toFixed(2)} m)
            </p>
          )}

          {errors.heightCm && (
            <p className="mt-1.5 text-xs text-danger font-medium animate-in fade-in">
              • {errors.heightCm}
            </p>
          )}
        </div>

        {/* Weight Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="onboarding-weight"
              className="block text-xs uppercase tracking-wider font-semibold text-text-primary"
            >
              Weight
            </label>
            {/* Unit switch toggle pill */}
            <div className="flex items-center rounded-lg bg-surface-raised border border-border p-0.5 text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setWeightUnit('kg')}
                className={`px-2 py-0.5 rounded-md transition-colors ${
                  weightUnit === 'kg'
                    ? 'bg-accent text-accent-foreground shadow-sm'
                    : 'text-text-subtle hover:text-text-primary'
                }`}
              >
                kg
              </button>
              <button
                type="button"
                onClick={() => setWeightUnit('lbs')}
                className={`px-2 py-0.5 rounded-md transition-colors ${
                  weightUnit === 'lbs'
                    ? 'bg-accent text-accent-foreground shadow-sm'
                    : 'text-text-subtle hover:text-text-primary'
                }`}
              >
                lbs
              </button>
            </div>
          </div>

          <div className="relative">
            <Weight
              className="w-4 h-4 text-text-subtle absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            {weightUnit === 'kg' ? (
              <input
                id="onboarding-weight"
                type="number"
                step="0.1"
                min="20"
                max="350"
                placeholder="72.5"
                value={rawWeightKg}
                onChange={(e) => {
                  handleKgChange(e.target.value);
                  setErrors((prev) => ({ ...prev, weightKg: '' }));
                }}
                className={`w-full pl-10 pr-12 py-3 rounded-xl bg-surface-raised border text-text-primary text-sm font-mono transition-all focus-ring min-h-[48px] ${
                  errors.weightKg
                    ? 'border-danger focus-visible:ring-danger bg-danger-bg/20'
                    : 'border-border/80 hover:border-border-focus/60'
                }`}
              />
            ) : (
              <input
                id="onboarding-weight"
                type="number"
                step="0.5"
                min="45"
                max="750"
                placeholder="160"
                value={rawWeightLbs}
                onChange={(e) => {
                  handleLbsChange(e.target.value);
                  setErrors((prev) => ({ ...prev, weightKg: '' }));
                }}
                className={`w-full pl-10 pr-12 py-3 rounded-xl bg-surface-raised border text-text-primary text-sm font-mono transition-all focus-ring min-h-[48px] ${
                  errors.weightKg
                    ? 'border-danger focus-visible:ring-danger bg-danger-bg/20'
                    : 'border-border/80 hover:border-border-focus/60'
                }`}
              />
            )}
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-text-subtle pointer-events-none font-semibold">
              {weightUnit}
            </span>
          </div>

          {weightUnit === 'lbs' && (
            <p className="mt-1 text-[11px] text-text-subtle font-mono">
              Converted: <strong className="text-accent">{rawWeightKg} kg</strong>
            </p>
          )}

          {errors.weightKg && (
            <p className="mt-1.5 text-xs text-danger font-medium animate-in fade-in">
              • {errors.weightKg}
            </p>
          )}
        </div>
      </div>

      {/* Helpful context footnote */}
      <div className="pt-1 flex items-center gap-2 text-xs text-text-subtle">
        <Sparkles className="w-3.5 h-3.5 text-accent shrink-0" />
        <span>Metrics are always saved in standardized metric units (kg & cm).</span>
      </div>

      {/* Continue CTA Button */}
      <div className="pt-2">
        <button
          type="submit"
          className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-accent text-accent-foreground font-bold text-sm sm:text-base hover:bg-accent-hover active:bg-accent-active active:scale-[0.99] transition-all duration-200 focus-ring shadow-[0_0_25px_rgba(34,197,94,0.35)] hover:shadow-[0_0_35px_rgba(34,197,94,0.5)] cursor-pointer group"
        >
          <span>Continue to Activity & Goals</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </form>
  );
}
