-- Migration 1: Alter exercises table for custom exercises & tracking types
ALTER TABLE public.exercises
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.exercises
  ADD COLUMN IF NOT EXISTS tracking_type text NOT NULL DEFAULT 'weight_reps';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_exercises_tracking_type'
  ) THEN
    ALTER TABLE public.exercises
      ADD CONSTRAINT chk_exercises_tracking_type
      CHECK (tracking_type IN ('weight_reps', 'reps_only', 'duration', 'distance_duration'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_exercises_user_id ON public.exercises(user_id)
  WHERE user_id IS NOT NULL;

ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Exercises: read global or own" ON public.exercises;
CREATE POLICY "Exercises: read global or own"
  ON public.exercises FOR SELECT
  USING (user_id IS NULL OR user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Exercises: insert own" ON public.exercises;
CREATE POLICY "Exercises: insert own"
  ON public.exercises FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Exercises: update own" ON public.exercises;
CREATE POLICY "Exercises: update own"
  ON public.exercises FOR UPDATE
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Exercises: delete own" ON public.exercises;
CREATE POLICY "Exercises: delete own"
  ON public.exercises FOR DELETE
  USING (user_id = (SELECT auth.uid()));
