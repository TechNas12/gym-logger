-- Migration 4: Create sets table with generated est_1rm_kg and analytics constraints
CREATE TABLE IF NOT EXISTS public.sets (
  id                  uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_exercise_id uuid NOT NULL REFERENCES public.workout_exercises(id) ON DELETE CASCADE,
  user_id             uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  exercise_id         text NOT NULL REFERENCES public.exercises(id) ON DELETE RESTRICT,
  set_number          smallint NOT NULL,
  set_type            text NOT NULL DEFAULT 'normal',
  reps                smallint,
  weight_kg           numeric(7,2),
  duration_sec        integer,
  distance_m          numeric(10,2),
  rpe                 numeric(3,1),
  is_completed        boolean NOT NULL DEFAULT false,
  completed_at        timestamptz,
  est_1rm_kg          numeric(7,2) GENERATED ALWAYS AS (
    CASE
      WHEN set_type IN ('normal', 'dropset', 'failure')
        AND weight_kg IS NOT NULL AND weight_kg > 0
        AND reps IS NOT NULL AND reps > 0 AND reps <= 30
      THEN ROUND(weight_kg * (1 + reps::numeric / 30.0), 2)
      ELSE NULL
    END
  ) STORED,
  created_at          timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT chk_sets_set_type
    CHECK (set_type IN ('normal', 'warmup', 'dropset', 'failure')),
  CONSTRAINT chk_sets_rpe
    CHECK (rpe IS NULL OR (rpe >= 1.0 AND rpe <= 10.0)),
  CONSTRAINT chk_sets_reps
    CHECK (reps IS NULL OR reps >= 0),
  CONSTRAINT chk_sets_weight
    CHECK (weight_kg IS NULL OR weight_kg >= 0),
  CONSTRAINT uq_sets_number
    UNIQUE (workout_exercise_id, set_number) DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS idx_sets_we ON public.sets(workout_exercise_id);
CREATE INDEX IF NOT EXISTS idx_sets_exercise_user
  ON public.sets(exercise_id, user_id, completed_at DESC)
  WHERE is_completed = true;

CREATE INDEX IF NOT EXISTS idx_sets_pr_lookup
  ON public.sets(user_id, exercise_id, est_1rm_kg DESC NULLS LAST)
  WHERE is_completed = true AND set_type IN ('normal', 'dropset', 'failure');

ALTER TABLE public.sets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Sets: user owns" ON public.sets;
CREATE POLICY "Sets: user owns"
  ON public.sets FOR ALL
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.workout_exercises we
      WHERE we.id = workout_exercise_id AND we.user_id = (SELECT auth.uid())
    )
  );
