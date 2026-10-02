-- Migration 7: Create routine_sets table
CREATE TABLE IF NOT EXISTS public.routine_sets (
  id                    uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  routine_exercise_id   uuid NOT NULL REFERENCES public.routine_exercises(id) ON DELETE CASCADE,
  user_id               uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  set_number            smallint NOT NULL,
  set_type              text NOT NULL DEFAULT 'normal',
  target_reps_min       smallint,
  target_reps_max       smallint,
  target_weight_kg      numeric(7,2),
  rest_sec              smallint,
  created_at            timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT chk_rs_set_type
    CHECK (set_type IN ('normal', 'warmup', 'dropset', 'failure')),
  CONSTRAINT chk_rs_reps
    CHECK (target_reps_min IS NULL OR target_reps_min >= 0),
  CONSTRAINT chk_rs_reps_range
    CHECK (target_reps_max IS NULL OR target_reps_max >= COALESCE(target_reps_min, 0)),
  CONSTRAINT uq_routine_sets_number
    UNIQUE (routine_exercise_id, set_number)
);

ALTER TABLE public.routine_sets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "RoutineSets: read via routine" ON public.routine_sets;
CREATE POLICY "RoutineSets: read via routine"
  ON public.routine_sets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.routine_exercises re
      JOIN public.routines r ON r.id = re.routine_id
      WHERE re.id = routine_exercise_id
        AND (r.user_id IS NULL OR r.user_id = (SELECT auth.uid()))
    )
  );

DROP POLICY IF EXISTS "RoutineSets: write own" ON public.routine_sets;
CREATE POLICY "RoutineSets: write own"
  ON public.routine_sets FOR ALL
  USING (
    user_id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.routine_exercises re
      WHERE re.id = routine_exercise_id AND re.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    user_id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.routine_exercises re
      WHERE re.id = routine_exercise_id AND re.user_id = (SELECT auth.uid())
    )
  );
