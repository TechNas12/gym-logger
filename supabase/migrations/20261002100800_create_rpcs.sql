-- Migration 8: Create transactional RPCs for atomic save and routine cloning
-- ============================================================
-- RPC 1: save_workout(payload jsonb) → uuid
-- ============================================================
CREATE OR REPLACE FUNCTION public.save_workout(payload jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_user_id     uuid := (SELECT auth.uid());
  v_workout_id  uuid;
  v_we_id       uuid;
  v_ex          jsonb;
  v_set         jsonb;
  v_idx         int;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  v_workout_id := (payload->>'id')::uuid;

  IF v_workout_id IS NOT NULL THEN
    UPDATE public.workouts SET
      name       = COALESCE(payload->>'name', name),
      notes      = payload->>'notes',
      routine_id = CASE WHEN payload ? 'routine_id' THEN (payload->>'routine_id')::uuid ELSE routine_id END,
      started_at = CASE WHEN payload ? 'started_at' THEN (payload->>'started_at')::timestamptz ELSE started_at END,
      ended_at   = CASE WHEN payload ? 'ended_at' THEN (payload->>'ended_at')::timestamptz ELSE ended_at END,
      updated_at = now()
    WHERE id = v_workout_id AND user_id = v_user_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Workout not found or access denied';
    END IF;

    DELETE FROM public.workout_exercises WHERE workout_id = v_workout_id;
  ELSE
    INSERT INTO public.workouts (user_id, routine_id, name, started_at, ended_at, notes)
    VALUES (
      v_user_id,
      (payload->>'routine_id')::uuid,
      COALESCE(payload->>'name', 'Workout'),
      COALESCE((payload->>'started_at')::timestamptz, now()),
      (payload->>'ended_at')::timestamptz,
      payload->>'notes'
    )
    RETURNING id INTO v_workout_id;
  END IF;

  v_idx := 0;
  IF payload ? 'exercises' AND jsonb_typeof(payload->'exercises') = 'array' THEN
    FOR v_ex IN SELECT * FROM jsonb_array_elements(payload->'exercises')
    LOOP
      v_idx := v_idx + 1;

      INSERT INTO public.workout_exercises (
        workout_id, user_id, exercise_id, position, superset_group, notes
      ) VALUES (
        v_workout_id,
        v_user_id,
        v_ex->>'exercise_id',
        COALESCE((v_ex->>'position')::smallint, v_idx::smallint),
        (v_ex->>'superset_group')::smallint,
        v_ex->>'notes'
      )
      RETURNING id INTO v_we_id;

      IF v_ex ? 'sets' AND jsonb_typeof(v_ex->'sets') = 'array' THEN
        FOR v_set IN SELECT * FROM jsonb_array_elements(v_ex->'sets')
        LOOP
          INSERT INTO public.sets (
            workout_exercise_id, user_id, exercise_id,
            set_number, set_type, reps, weight_kg,
            duration_sec, distance_m, rpe,
            is_completed, completed_at
          ) VALUES (
            v_we_id,
            v_user_id,
            v_ex->>'exercise_id',
            (v_set->>'set_number')::smallint,
            COALESCE(v_set->>'set_type', 'normal'),
            (v_set->>'reps')::smallint,
            (v_set->>'weight_kg')::numeric,
            (v_set->>'duration_sec')::integer,
            (v_set->>'distance_m')::numeric,
            (v_set->>'rpe')::numeric,
            COALESCE((v_set->>'is_completed')::boolean, false),
            (v_set->>'completed_at')::timestamptz
          );
        END LOOP;
      END IF;
    END LOOP;
  END IF;

  RETURN v_workout_id;
END;
$$;

-- ============================================================
-- RPC 2: save_routine(payload jsonb) → uuid
-- ============================================================
CREATE OR REPLACE FUNCTION public.save_routine(payload jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_user_id      uuid := (SELECT auth.uid());
  v_routine_id   uuid;
  v_re_id        uuid;
  v_ex           jsonb;
  v_set          jsonb;
  v_idx          int;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  v_routine_id := (payload->>'id')::uuid;

  IF v_routine_id IS NOT NULL THEN
    UPDATE public.routines SET
      name       = COALESCE(payload->>'name', name),
      notes      = payload->>'notes',
      updated_at = now()
    WHERE id = v_routine_id AND user_id = v_user_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Routine not found or access denied';
    END IF;

    DELETE FROM public.routine_exercises WHERE routine_id = v_routine_id;
  ELSE
    INSERT INTO public.routines (user_id, name, notes)
    VALUES (
      v_user_id,
      COALESCE(payload->>'name', 'My Routine'),
      payload->>'notes'
    )
    RETURNING id INTO v_routine_id;
  END IF;

  v_idx := 0;
  IF payload ? 'exercises' AND jsonb_typeof(payload->'exercises') = 'array' THEN
    FOR v_ex IN SELECT * FROM jsonb_array_elements(payload->'exercises')
    LOOP
      v_idx := v_idx + 1;

      INSERT INTO public.routine_exercises (
        routine_id, user_id, exercise_id, position, superset_group, notes
      ) VALUES (
        v_routine_id,
        v_user_id,
        v_ex->>'exercise_id',
        COALESCE((v_ex->>'position')::smallint, v_idx::smallint),
        (v_ex->>'superset_group')::smallint,
        v_ex->>'notes'
      )
      RETURNING id INTO v_re_id;

      IF v_ex ? 'sets' AND jsonb_typeof(v_ex->'sets') = 'array' THEN
        FOR v_set IN SELECT * FROM jsonb_array_elements(v_ex->'sets')
        LOOP
          INSERT INTO public.routine_sets (
            routine_exercise_id, user_id, set_number, set_type,
            target_reps_min, target_reps_max, target_weight_kg, rest_sec
          ) VALUES (
            v_re_id,
            v_user_id,
            (v_set->>'set_number')::smallint,
            COALESCE(v_set->>'set_type', 'normal'),
            (v_set->>'target_reps_min')::smallint,
            (v_set->>'target_reps_max')::smallint,
            (v_set->>'target_weight_kg')::numeric,
            (v_set->>'rest_sec')::smallint
          );
        END LOOP;
      END IF;
    END LOOP;
  END IF;

  RETURN v_routine_id;
END;
$$;

-- ============================================================
-- RPC 3: create_routine_from_workout(p_workout_id uuid) → uuid
-- ============================================================
CREATE OR REPLACE FUNCTION public.create_routine_from_workout(p_workout_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_user_id      uuid := (SELECT auth.uid());
  v_workout      record;
  v_routine_id   uuid;
  v_re_id        uuid;
  v_we           record;
  v_set          record;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_workout
    FROM public.workouts
    WHERE id = p_workout_id AND user_id = v_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Workout not found or access denied';
  END IF;

  INSERT INTO public.routines (user_id, name, notes)
  VALUES (v_user_id, v_workout.name || ' (Template)', v_workout.notes)
  RETURNING id INTO v_routine_id;

  FOR v_we IN
    SELECT * FROM public.workout_exercises
    WHERE workout_id = p_workout_id
    ORDER BY position
  LOOP
    INSERT INTO public.routine_exercises (
      routine_id, user_id, exercise_id, position, superset_group, notes
    ) VALUES (
      v_routine_id, v_user_id, v_we.exercise_id,
      v_we.position, v_we.superset_group, v_we.notes
    )
    RETURNING id INTO v_re_id;

    FOR v_set IN
      SELECT * FROM public.sets
      WHERE workout_exercise_id = v_we.id AND is_completed = true
      ORDER BY set_number
    LOOP
      INSERT INTO public.routine_sets (
        routine_exercise_id, user_id, set_number, set_type,
        target_reps_min, target_reps_max, target_weight_kg, rest_sec
      ) VALUES (
        v_re_id, v_user_id, v_set.set_number, v_set.set_type,
        v_set.reps, v_set.reps,
        v_set.weight_kg, NULL
      );
    END LOOP;
  END LOOP;

  RETURN v_routine_id;
END;
$$;
