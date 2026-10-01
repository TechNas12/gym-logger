export type Gender = 'male' | 'female' | 'other';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type FitnessGoal = 'lose_weight' | 'maintain' | 'gain_muscle';

export type BmiCategory = 'underweight' | 'normal' | 'overweight' | 'obese';

export interface WeeklyRateOption {
  rateKg: number;
  label: string;
  description: string;
  dailyKcal: number;
}

export const WEIGHT_LOSS_RATES: WeeklyRateOption[] = [
  {
    rateKg: 0.25,
    label: '0.25 kg / week',
    description: 'Slow & sustainable (~0.55 lbs/wk)',
    dailyKcal: -275,
  },
  {
    rateKg: 0.5,
    label: '0.50 kg / week',
    description: 'Recommended healthy fat loss (~1.1 lbs/wk)',
    dailyKcal: -550,
  },
  {
    rateKg: 0.75,
    label: '0.75 kg / week',
    description: 'Faster fat loss (~1.65 lbs/wk)',
    dailyKcal: -825,
  },
  {
    rateKg: 1.0,
    label: '1.00 kg / week',
    description: 'Aggressive fat loss (~2.2 lbs/wk)',
    dailyKcal: -1100,
  },
];

export const WEIGHT_GAIN_RATES: WeeklyRateOption[] = [
  {
    rateKg: 0.25,
    label: '0.25 kg / week',
    description: 'Lean bulk: minimal body fat gain (~0.55 lbs/wk)',
    dailyKcal: 275,
  },
  {
    rateKg: 0.5,
    label: '0.50 kg / week',
    description: 'Standard bulk: rapid size & strength (~1.1 lbs/wk)',
    dailyKcal: 550,
  },
];

export interface FitnessProfileInput {
  gender: Gender;
  dateOfBirth: string; // YYYY-MM-DD
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  fitnessGoal: FitnessGoal;
  weeklyGoalRateKg?: number; // e.g. 0.25, 0.5, 0.75, 1.0
}

export interface ComputedFitnessMetrics {
  age: number;
  heightCm: number;
  heightM: number;
  weightKg: number;
  bmi: number;
  bmiCategory: BmiCategory;
  bmiCategoryLabel: string;
  bmr: number;
  tdee: number;
  activityMultiplier: number;
  weeklyGoalRateKg: number;
  weeklyGoalRateLabel: string;
  caloricAdjustment: number;
  targetCalories: number;
  macros: {
    protein: {
      grams: number;
      calories: number;
      percentage: number;
    };
    carbs: {
      grams: number;
      calories: number;
      percentage: number;
    };
    fat: {
      grams: number;
      calories: number;
      percentage: number;
    };
  };
}

export const ACTIVITY_LEVEL_DETAILS: Record<
  ActivityLevel,
  { label: string; description: string; multiplier: number }
> = {
  sedentary: {
    label: 'Sedentary',
    description: 'Desk job, little to no regular exercise',
    multiplier: 1.2,
  },
  light: {
    label: 'Lightly Active',
    description: 'Light exercise or sports 1–3 days per week',
    multiplier: 1.375,
  },
  moderate: {
    label: 'Moderately Active',
    description: 'Moderate exercise or sports 3–5 days per week',
    multiplier: 1.55,
  },
  active: {
    label: 'Very Active',
    description: 'Hard exercise or sports 6–7 days per week',
    multiplier: 1.725,
  },
  very_active: {
    label: 'Extra Active',
    description: 'Very hard daily exercise, physical job, or 2x/day training',
    multiplier: 1.9,
  },
};

export const FITNESS_GOAL_DETAILS: Record<
  FitnessGoal,
  { label: string; shortDesc: string; badgeColor: string }
> = {
  lose_weight: {
    label: 'Lose Weight',
    shortDesc: 'Controlled caloric deficit to shed body fat',
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  },
  maintain: {
    label: 'Maintain Weight',
    shortDesc: 'Caloric balance for body recomp and health',
    badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  },
  gain_muscle: {
    label: 'Gain Muscle',
    shortDesc: 'Targeted caloric surplus to build lean mass',
    badgeColor: 'text-accent bg-accent/10 border-accent/30',
  },
};

/**
 * Calculate age in full years given a birthdate string (YYYY-MM-DD).
 */
export function calculateAge(dobString: string): number {
  const birthDate = new Date(dobString);
  if (isNaN(birthDate.getTime())) return 25; // default fallback

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return Math.max(1, Math.min(120, age));
}

/**
 * Calculate BMI and category
 */
export function calculateBmi(heightCm: number, weightKg: number): {
  bmi: number;
  category: BmiCategory;
  label: string;
} {
  const heightM = heightCm / 100;
  if (heightM <= 0) {
    return { bmi: 22, category: 'normal', label: 'Normal Weight' };
  }

  const rawBmi = weightKg / (heightM * heightM);
  const bmi = Math.round(rawBmi * 10) / 10;

  if (bmi < 18.5) {
    return { bmi, category: 'underweight', label: 'Underweight' };
  }
  if (bmi < 25.0) {
    return { bmi, category: 'normal', label: 'Normal Weight' };
  }
  if (bmi < 30.0) {
    return { bmi, category: 'overweight', label: 'Overweight' };
  }
  return { bmi, category: 'obese', label: 'Obese' };
}

/**
 * Calculate BMR using the Mifflin-St Jeor Equation:
 * - Men: BMR = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) + 5
 * - Women: BMR = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) - 161
 * - Other: Average of both formulas (-78)
 */
export function calculateBmr(
  gender: Gender,
  weightKg: number,
  heightCm: number,
  age: number
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  let bmr: number;

  switch (gender) {
    case 'male':
      bmr = base + 5;
      break;
    case 'female':
      bmr = base - 161;
      break;
    case 'other':
    default:
      bmr = base - 78;
      break;
  }

  return Math.max(800, Math.round(bmr));
}

/**
 * Compute all fitness metrics including BMI, BMR, TDEE, Targets and Macros.
 * Incorporates custom weekly rate of weight loss/gain (1 kg ≈ 7,700 kcal).
 */
export function computeFitnessMetrics(input: FitnessProfileInput): ComputedFitnessMetrics {
  const age = calculateAge(input.dateOfBirth);
  const heightCm = Math.round(input.heightCm * 10) / 10;
  const heightM = Math.round((heightCm / 100) * 100) / 100;
  const weightKg = Math.round(input.weightKg * 10) / 10;

  const { bmi, category: bmiCategory, label: bmiCategoryLabel } = calculateBmi(heightCm, weightKg);
  const bmr = calculateBmr(input.gender, weightKg, heightCm, age);

  const activityMultiplier = ACTIVITY_LEVEL_DETAILS[input.activityLevel]?.multiplier ?? 1.2;
  const tdee = Math.round(bmr * activityMultiplier);

  // Determine weekly goal rate in kg
  let weeklyGoalRateKg = 0;
  let weeklyGoalRateLabel = 'Maintenance';
  let caloricAdjustment = 0;

  if (input.fitnessGoal === 'lose_weight') {
    weeklyGoalRateKg = input.weeklyGoalRateKg !== undefined && input.weeklyGoalRateKg > 0
      ? input.weeklyGoalRateKg
      : 0.5;
    // 1 kg body mass ≈ 7,700 kcal -> daily deficit = (rate * 7700) / 7 = rate * 1100
    caloricAdjustment = -Math.round((weeklyGoalRateKg * 7700) / 7);
    weeklyGoalRateLabel = `-${weeklyGoalRateKg} kg / week`;
  } else if (input.fitnessGoal === 'gain_muscle') {
    weeklyGoalRateKg = input.weeklyGoalRateKg !== undefined && input.weeklyGoalRateKg > 0
      ? input.weeklyGoalRateKg
      : 0.25;
    // Daily surplus = rate * 1100
    caloricAdjustment = Math.round((weeklyGoalRateKg * 7700) / 7);
    weeklyGoalRateLabel = `+${weeklyGoalRateKg} kg / week`;
  } else {
    weeklyGoalRateKg = 0;
    weeklyGoalRateLabel = 'Maintain (0 kg/wk)';
    caloricAdjustment = 0;
  }

  // Floor target calories at minimum 1200 kcal for health safety
  const targetCalories = Math.max(1200, Math.round(tdee + caloricAdjustment));

  // Macro distribution based on fitness goal
  let proteinPct = 0.3;
  let carbsPct = 0.4;
  let fatPct = 0.3;

  if (input.fitnessGoal === 'lose_weight') {
    // High protein to preserve lean muscle tissue in deficit
    proteinPct = 0.4;
    carbsPct = 0.3;
    fatPct = 0.3;
  } else if (input.fitnessGoal === 'gain_muscle') {
    // High carbs to fuel heavy lifts + adequate protein
    proteinPct = 0.35;
    carbsPct = 0.45;
    fatPct = 0.2;
  }

  const proteinCalories = targetCalories * proteinPct;
  const carbsCalories = targetCalories * carbsPct;
  const fatCalories = targetCalories * fatPct;

  // 1g Protein = 4 kcal, 1g Carbs = 4 kcal, 1g Fat = 9 kcal
  const proteinGrams = Math.round(proteinCalories / 4);
  const carbsGrams = Math.round(carbsCalories / 4);
  const fatGrams = Math.round(fatCalories / 9);

  return {
    age,
    heightCm,
    heightM,
    weightKg,
    bmi,
    bmiCategory,
    bmiCategoryLabel,
    bmr,
    tdee,
    activityMultiplier,
    weeklyGoalRateKg,
    weeklyGoalRateLabel,
    caloricAdjustment,
    targetCalories,
    macros: {
      protein: {
        grams: proteinGrams,
        calories: Math.round(proteinCalories),
        percentage: Math.round(proteinPct * 100),
      },
      carbs: {
        grams: carbsGrams,
        calories: Math.round(carbsCalories),
        percentage: Math.round(carbsPct * 100),
      },
      fat: {
        grams: fatGrams,
        calories: Math.round(fatCalories),
        percentage: Math.round(fatPct * 100),
      },
    },
  };
}

// Unit conversion helpers
export function lbsToKg(lbs: number): number {
  return Math.round(lbs * 0.45359237 * 10) / 10;
}

export function kgToLbs(kg: number): number {
  return Math.round((kg / 0.45359237) * 10) / 10;
}

export function ftInToCm(feet: number, inches: number): number {
  const totalInches = (feet || 0) * 12 + (inches || 0);
  return Math.round(totalInches * 2.54 * 10) / 10;
}

export function cmToFtIn(cm: number): { feet: number; inches: number } {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
}
