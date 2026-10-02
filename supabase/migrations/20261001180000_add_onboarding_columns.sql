-- Migration: Add onboarding and fitness profile columns to public.users
-- This stores physical attributes, lifestyle activity level, fitness goal, and derived metrics.

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS gender text,
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS height_cm numeric(5,1),
  ADD COLUMN IF NOT EXISTS weight_kg numeric(5,1),
  ADD COLUMN IF NOT EXISTS activity_level text,
  ADD COLUMN IF NOT EXISTS fitness_goal text,
  ADD COLUMN IF NOT EXISTS bmi numeric(4,1),
  ADD COLUMN IF NOT EXISTS bmi_category text,
  ADD COLUMN IF NOT EXISTS bmr integer,
  ADD COLUMN IF NOT EXISTS tdee integer,
  ADD COLUMN IF NOT EXISTS target_calories integer,
  ADD COLUMN IF NOT EXISTS caloric_adjustment integer,
  ADD COLUMN IF NOT EXISTS protein_g integer,
  ADD COLUMN IF NOT EXISTS carbs_g integer,
  ADD COLUMN IF NOT EXISTS fat_g integer,
  ADD COLUMN IF NOT EXISTS is_onboarded boolean DEFAULT false NOT NULL;

-- Safe constraint additions (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_users_gender'
  ) THEN
    ALTER TABLE public.users
      ADD CONSTRAINT chk_users_gender
      CHECK (gender IS NULL OR gender IN ('male', 'female', 'other'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_users_activity_level'
  ) THEN
    ALTER TABLE public.users
      ADD CONSTRAINT chk_users_activity_level
      CHECK (activity_level IS NULL OR activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_users_fitness_goal'
  ) THEN
    ALTER TABLE public.users
      ADD CONSTRAINT chk_users_fitness_goal
      CHECK (fitness_goal IS NULL OR fitness_goal IN ('lose_weight', 'maintain', 'gain_muscle'));
  END IF;
END $$;
