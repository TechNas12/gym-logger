import { z } from 'zod';
import { calculateAge } from '@/lib/fitness-calculations';

export const genderSchema = z.enum(['male', 'female', 'other']);

export const dateOfBirthSchema = z
  .string()
  .min(1, 'Date of birth is required')
  .refine((val) => !isNaN(Date.parse(val)), {
    message: 'Please enter a valid date of birth',
  })
  .refine(
    (val) => {
      const age = calculateAge(val);
      return age >= 13 && age <= 120;
    },
    {
      message: 'You must be between 13 and 120 years old',
    }
  );

export const heightCmSchema = z
  .number()
  .min(50, 'Height must be at least 50 cm')
  .max(300, 'Height must be at most 300 cm');

export const weightKgSchema = z
  .number()
  .min(20, 'Weight must be at least 20 kg')
  .max(500, 'Weight must be at most 500 kg');

export const activityLevelSchema = z.enum([
  'sedentary',
  'light',
  'moderate',
  'active',
  'very_active',
]);

export const fitnessGoalSchema = z.enum([
  'lose_weight',
  'maintain',
  'gain_muscle',
]);

export const weeklyGoalRateKgSchema = z
  .number()
  .min(0, 'Weekly rate cannot be negative')
  .max(2, 'Maximum safe weekly rate is 2 kg')
  .optional();

// Full onboarding schema
export const onboardingSchema = z.object({
  gender: genderSchema,
  dateOfBirth: dateOfBirthSchema,
  heightCm: heightCmSchema,
  weightKg: weightKgSchema,
  activityLevel: activityLevelSchema,
  fitnessGoal: fitnessGoalSchema,
  weeklyGoalRateKg: weeklyGoalRateKgSchema,
});

// Step 1 schema
export const stepBasicInfoSchema = z.object({
  gender: genderSchema,
  dateOfBirth: dateOfBirthSchema,
  heightCm: heightCmSchema,
  weightKg: weightKgSchema,
});

// Step 2 schema
export const stepActivitySchema = z.object({
  activityLevel: activityLevelSchema,
  fitnessGoal: fitnessGoalSchema,
  weeklyGoalRateKg: weeklyGoalRateKgSchema,
});

export type OnboardingFormData = z.infer<typeof onboardingSchema>;
export type StepBasicInfoData = z.infer<typeof stepBasicInfoSchema>;
export type StepActivityData = z.infer<typeof stepActivitySchema>;
