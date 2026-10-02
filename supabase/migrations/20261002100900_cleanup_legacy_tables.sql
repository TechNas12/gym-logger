-- Migration 9: Data migration and cleanup for legacy workout tables
-- Migrate legacy workout_sessions and workout_sets into workouts, workout_exercises, and sets

DO $$
BEGIN
  -- 1. Migrate legacy workout_sessions to workouts if the table exists
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'workout_sessions'
  ) THEN
    INSERT INTO public.workouts (
      id,
      user_id,
      routine_id,
      name,
      started_at,
      ended_at,
      notes,
      created_at,
      updated_at
    )
    SELECT
      ws.id,
      ws.user_id,
      CASE WHEN r.id IS NOT NULL THEN ws.routine_id ELSE NULL END,
      COALESCE(ws.name, 'Workout'),
      COALESCE(ws.started_at, ws.created_at, now()),
      ws.completed_at,
      ws.notes,
      COALESCE(ws.created_at, now()),
      COALESCE(ws.updated_at, now())
    FROM public.workout_sessions ws
    JOIN public.users u ON u.id = ws.user_id
    LEFT JOIN public.routines r ON r.id = ws.routine_id
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- 2. Migrate legacy workout_sets to workout_exercises and sets if both tables exist
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'workout_sets'
  ) THEN
    -- First create workout_exercises for each distinct exercise in the workout session
    WITH legacy_exercises AS (
      SELECT
        ws.workout_session_id AS workout_id,
        w.user_id,
        ws.exercise_id,
        ROW_NUMBER() OVER (
          PARTITION BY ws.workout_session_id 
          ORDER BY MIN(ws.created_at), MIN(ws.set_number)
        )::smallint AS position
      FROM public.workout_sets ws
      JOIN public.workouts w ON w.id = ws.workout_session_id
      JOIN public.exercises e ON e.id = ws.exercise_id
      WHERE NOT EXISTS (
        SELECT 1 FROM public.workout_exercises existing_we
        WHERE existing_we.workout_id = ws.workout_session_id
          AND existing_we.exercise_id = ws.exercise_id
      )
      GROUP BY ws.workout_session_id, w.user_id, ws.exercise_id
    )
    INSERT INTO public.workout_exercises (
      id,
      workout_id,
      user_id,
      exercise_id,
      position,
      created_at
    )
    SELECT
      gen_random_uuid(),
      le.workout_id,
      le.user_id,
      le.exercise_id,
      le.position,
      now()
    FROM legacy_exercises le
    ON CONFLICT (workout_id, position) DO NOTHING;

    -- Then insert individual sets into sets table
    INSERT INTO public.sets (
      workout_exercise_id,
      user_id,
      exercise_id,
      set_number,
      set_type,
      reps,
      weight_kg,
      rpe,
      is_completed,
      completed_at,
      created_at
    )
    SELECT
      we.id,
      we.user_id,
      ws.exercise_id,
      ws.set_number::smallint,
      'normal',
      CASE WHEN ws.reps >= 0 THEN ws.reps::smallint ELSE NULL END,
      CASE WHEN ws.weight_kg >= 0 THEN ws.weight_kg::numeric(7,2) ELSE NULL END,
      CASE WHEN ws.rpe >= 1.0 AND ws.rpe <= 10.0 THEN ws.rpe::numeric(3,1) ELSE NULL END,
      COALESCE(ws.is_completed, false),
      CASE WHEN ws.is_completed THEN COALESCE(ws.created_at, now()) ELSE NULL END,
      COALESCE(ws.created_at, now())
    FROM public.workout_sets ws
    JOIN public.workout_exercises we
      ON we.workout_id = ws.workout_session_id
     AND we.exercise_id = ws.exercise_id
    ON CONFLICT (workout_exercise_id, set_number) DO NOTHING;
  END IF;
END $$;

-- Clean up legacy tables after migration
DROP TABLE IF EXISTS public.workout_sets CASCADE;
DROP TABLE IF EXISTS public.workout_sessions CASCADE;
