'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { StepIndicator } from './step-indicator';
import { StepBasicInfo } from './step-basic-info';
import { StepActivity } from './step-activity';
import { StepReview } from './step-review';
import type {
  Gender,
  ActivityLevel,
  FitnessGoal,
} from '@/lib/fitness-calculations';
import { submitOnboarding } from '@/app/onboarding/actions';

export interface InitialProfileData {
  gender?: Gender | null;
  dateOfBirth?: string | null;
  heightCm?: number | null;
  weightKg?: number | null;
  activityLevel?: ActivityLevel | null;
  fitnessGoal?: FitnessGoal | null;
  weeklyGoalRateKg?: number | null;
  firstName?: string | null;
}

interface OnboardingWizardProps {
  initialProfile?: InitialProfileData;
}

const STEPS = [
  { number: 1, title: 'Basic Info' },
  { number: 2, title: 'Activity & Goals' },
  { number: 3, title: 'Review Plan' },
];

export function OnboardingWizard({ initialProfile }: OnboardingWizardProps) {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [gender, setGender] = useState<Gender>(initialProfile?.gender || 'male');
  const [dateOfBirth, setDateOfBirth] = useState<string>(
    initialProfile?.dateOfBirth || '1998-05-15'
  );
  const [heightCm, setHeightCm] = useState<number>(
    initialProfile?.heightCm && initialProfile.heightCm > 0
      ? initialProfile.heightCm
      : 175
  );
  const [weightKg, setWeightKg] = useState<number>(
    initialProfile?.weightKg && initialProfile.weightKg > 0
      ? initialProfile.weightKg
      : 72
  );
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(
    initialProfile?.activityLevel || 'moderate'
  );
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>(
    initialProfile?.fitnessGoal || 'maintain'
  );
  const [weeklyGoalRateKg, setWeeklyGoalRateKg] = useState<number>(
    initialProfile?.weeklyGoalRateKg && initialProfile.weeklyGoalRateKg > 0
      ? initialProfile.weeklyGoalRateKg
      : initialProfile?.fitnessGoal === 'gain_muscle'
      ? 0.25
      : 0.5
  );

  const [isPending, setIsPending] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Update handlers
  const handleUpdate = (fields: {
    gender?: Gender;
    dateOfBirth?: string;
    heightCm?: number;
    weightKg?: number;
    activityLevel?: ActivityLevel;
    fitnessGoal?: FitnessGoal;
    weeklyGoalRateKg?: number;
  }) => {
    if (fields.gender !== undefined) setGender(fields.gender);
    if (fields.dateOfBirth !== undefined) setDateOfBirth(fields.dateOfBirth);
    if (fields.heightCm !== undefined) setHeightCm(fields.heightCm);
    if (fields.weightKg !== undefined) setWeightKg(fields.weightKg);
    if (fields.activityLevel !== undefined) setActivityLevel(fields.activityLevel);
    if (fields.fitnessGoal !== undefined) setFitnessGoal(fields.fitnessGoal);
    if (fields.weeklyGoalRateKg !== undefined) setWeeklyGoalRateKg(fields.weeklyGoalRateKg);
  };

  const handleNext = () => {
    setStep((prev) => (prev < 3 ? ((prev + 1) as 1 | 2 | 3) : prev));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setStep((prev) => (prev > 1 ? ((prev - 1) as 1 | 2 | 3) : prev));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    setIsPending(true);
    setSubmitError(null);

    try {
      const result = await submitOnboarding({
        gender,
        dateOfBirth,
        heightCm,
        weightKg,
        activityLevel,
        fitnessGoal,
        weeklyGoalRateKg,
      });

      if (!result.success) {
        setSubmitError(result.error || 'Failed to complete onboarding');
        setIsPending(false);
        return;
      }

      router.push(result.redirectUrl || '/dashboard');
      router.refresh();
    } catch (err: unknown) {
      setSubmitError(
        err instanceof Error ? err.message : 'An unexpected error occurred.'
      );
      setIsPending(false);
    }
  };

  return (
    <div className="w-full">
      {/* Step Indicator */}
      <StepIndicator currentStep={step} totalSteps={3} steps={STEPS} />

      {/* Step Components */}
      {step === 1 && (
        <StepBasicInfo
          gender={gender}
          dateOfBirth={dateOfBirth}
          heightCm={heightCm}
          weightKg={weightKg}
          onChange={handleUpdate}
          onNext={handleNext}
        />
      )}

      {step === 2 && (
        <StepActivity
          activityLevel={activityLevel}
          fitnessGoal={fitnessGoal}
          weeklyGoalRateKg={weeklyGoalRateKg}
          onChange={handleUpdate}
          onNext={handleNext}
          onBack={handleBack}
        />
      )}

      {step === 3 && (
        <StepReview
          gender={gender}
          dateOfBirth={dateOfBirth}
          heightCm={heightCm}
          weightKg={weightKg}
          activityLevel={activityLevel}
          fitnessGoal={fitnessGoal}
          weeklyGoalRateKg={weeklyGoalRateKg}
          onBack={handleBack}
          onSubmit={handleSubmit}
          isPending={isPending}
          error={submitError}
        />
      )}
    </div>
  );
}
