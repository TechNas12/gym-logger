-- Migration 6: Ensure routine_exercises table exists and has proper schema and RLS
CREATE TABLE IF NOT EXISTS public.routine_exercises (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  routine_id      uuid NOT NULL REFERENCES public.routines(id) ON DELETE CASCADE,
  user_id         uuid REFERENCES public.users(id) ON DELETE CASCADE,
  exercise_id     text NOT NULL REFERENCES public.exercises(id) ON DELETE RESTRICT,
  position        smallint NOT NULL DEFAULT 1,
  superset_group  smallint,
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'routine_exercises' AND column_name = 'order_index'
  ) THEN
    ALTER TABLE public.routine_exercises RENAME COLUMN order_index TO position;
  END IF;
END $$;

ALTER TABLE public.routine_exercises
  ADD COLUMN IF NOT EXISTS superset_group smallint,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.routine_exercises
  DROP COLUMN IF EXISTS target_sets,
  DROP COLUMN IF EXISTS target_reps;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_routine_exercises_position'
  ) THEN
    ALTER TABLE public.routine_exercises
      ADD CONSTRAINT uq_routine_exercises_position
      UNIQUE (routine_id, position) DEFERRABLE INITIALLY DEFERRED;
  END IF;
END $$;

ALTER TABLE public.routine_exercises ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "RoutineExercises: read via routine" ON public.routine_exercises;
CREATE POLICY "RoutineExercises: read via routine"
  ON public.routine_exercises FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.routines r
      WHERE r.id = routine_id
        AND (r.user_id IS NULL OR r.user_id = (SELECT auth.uid()))
    )
  );

DROP POLICY IF EXISTS "RoutineExercises: write own" ON public.routine_exercises;
CREATE POLICY "RoutineExercises: write own"
  ON public.routine_exercises FOR ALL
  USING (
    user_id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.routines r
      WHERE r.id = routine_id AND r.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    user_id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.routines r
      WHERE r.id = routine_id AND r.user_id = (SELECT auth.uid())
    )
  );
