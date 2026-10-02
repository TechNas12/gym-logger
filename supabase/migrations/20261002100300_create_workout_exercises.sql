-- Migration 3: Create workout_exercises table
CREATE TABLE IF NOT EXISTS public.workout_exercises (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_id      uuid NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  exercise_id     text NOT NULL REFERENCES public.exercises(id) ON DELETE RESTRICT,
  position        smallint NOT NULL,
  superset_group  smallint,
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT uq_workout_exercises_position
    UNIQUE (workout_id, position) DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS idx_we_workout ON public.workout_exercises(workout_id);
CREATE INDEX IF NOT EXISTS idx_we_exercise ON public.workout_exercises(exercise_id);

ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "WorkoutExercises: user owns" ON public.workout_exercises;
CREATE POLICY "WorkoutExercises: user owns"
  ON public.workout_exercises FOR ALL
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));
