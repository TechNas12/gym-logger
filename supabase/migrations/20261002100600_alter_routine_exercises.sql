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

-- Create routine_sets table if it does not already exist
CREATE TABLE IF NOT EXISTS public.routine_sets (
  id                    uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  routine_exercise_id   uuid NOT NULL REFERENCES public.routine_exercises(id) ON DELETE CASCADE,
  user_id               uuid REFERENCES public.users(id) ON DELETE CASCADE,
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

-- Ensure user_id constraint is relaxed on routine_sets so system routines can be seeded / copied
ALTER TABLE public.routine_sets
  ALTER COLUMN user_id DROP NOT NULL;

-- Migrate existing target_sets and target_reps to routine_sets before dropping source columns
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'routine_exercises' AND column_name = 'target_sets'
  ) THEN
    INSERT INTO public.routine_sets (
      routine_exercise_id,
      user_id,
      set_number,
      set_type,
      target_reps_min,
      target_reps_max
    )
    SELECT
      re.id,
      re.user_id,
      s.set_number::smallint,
      'normal',
      CASE WHEN re.target_reps >= 0 THEN re.target_reps::smallint ELSE NULL END,
      CASE WHEN re.target_reps >= 0 THEN re.target_reps::smallint ELSE NULL END
    FROM public.routine_exercises re
    CROSS JOIN LATERAL generate_series(1, GREATEST(COALESCE(re.target_sets, 1)::int, 1)) AS s(set_number)
    ON CONFLICT (routine_exercise_id, set_number) DO NOTHING;
  END IF;
END $$;

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
    EXISTS (
      SELECT 1 FROM public.routines r
      WHERE r.id = routine_id AND r.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.routines r
      WHERE r.id = routine_id AND r.user_id = (SELECT auth.uid())
    )
  );
