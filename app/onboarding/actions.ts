'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { onboardingSchema, type OnboardingFormData } from '@/lib/validations/onboarding';
import { computeFitnessMetrics } from '@/lib/fitness-calculations';

export interface OnboardingActionResult {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  redirectUrl?: string;
}

export async function submitOnboarding(
  formData: OnboardingFormData
): Promise<OnboardingActionResult> {
  try {
    const supabase = await createClient();

    // 1. Verify user session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: 'You must be signed in to complete your onboarding profile.',
      };
    }

    // 2. Validate input schema
    const parsed = onboardingSchema.safeParse(formData);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as string;
        if (!fieldErrors[key]) {
          fieldErrors[key] = issue.message;
        }
      }
      return {
        success: false,
        error: 'Please check your inputs and try again.',
        fieldErrors,
      };
    }

    const validData = parsed.data;

    // 3. Compute accurate fitness metrics server-side
    const metrics = computeFitnessMetrics({
      gender: validData.gender,
      dateOfBirth: validData.dateOfBirth,
      heightCm: validData.heightCm,
      weightKg: validData.weightKg,
      activityLevel: validData.activityLevel,
      fitnessGoal: validData.fitnessGoal,
      weeklyGoalRateKg: validData.weeklyGoalRateKg,
    });

    // 4. Upsert into public.users
    const { error: dbError } = await supabase.from('users').upsert(
      {
        id: user.id,
        email: user.email,
        first_name:
          typeof user.user_metadata?.first_name === 'string'
            ? user.user_metadata.first_name
            : null,
        last_name:
          typeof user.user_metadata?.last_name === 'string'
            ? user.user_metadata.last_name
            : null,
        gender: validData.gender,
        date_of_birth: validData.dateOfBirth,
        height_cm: metrics.heightCm,
        weight_kg: metrics.weightKg,
        activity_level: validData.activityLevel,
        fitness_goal: validData.fitnessGoal,
        weekly_goal_rate_kg: metrics.weeklyGoalRateKg,
        bmi: metrics.bmi,
        bmi_category: metrics.bmiCategory,
        bmr: metrics.bmr,
        tdee: metrics.tdee,
        target_calories: metrics.targetCalories,
        caloric_adjustment: metrics.caloricAdjustment,
        protein_g: metrics.macros.protein.grams,
        carbs_g: metrics.macros.carbs.grams,
        fat_g: metrics.macros.fat.grams,
        is_onboarded: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

    if (dbError) {
      console.error('[Onboarding Action] Database error:', dbError);
      return {
        success: false,
        error: 'Failed to save your profile to the database. Please try again.',
      };
    }

    // 5. Update user_metadata as a fast cached flag
    await supabase.auth.updateUser({
      data: {
        is_onboarded: true,
        fitness_goal: validData.fitnessGoal,
      },
    });

    // 6. Revalidate cache
    revalidatePath('/dashboard');
    revalidatePath('/onboarding');

    return {
      success: true,
      redirectUrl: '/dashboard',
    };
  } catch (err: unknown) {
    console.error('[Onboarding Action] Unexpected error:', err);
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred while completing onboarding.',
    };
  }
}
