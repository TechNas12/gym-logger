'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type {
  DbExercise,
  DbRoutine,
  DbWorkout,
  SaveWorkoutPayload,
  SaveRoutinePayload,
  WorkoutSummary,
  WorkoutDetail,
  RoutineDetail,
  LastPerformanceSet,
} from '@/lib/types/workout';
import {
  saveWorkoutSchema,
  saveRoutineSchema,
} from '@/lib/validations/workout';

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Save a workout atomically using the save_workout RPC.
 * Used for both completing a new workout and editing an existing one.
 */
export async function saveWorkoutAction(
  payload: SaveWorkoutPayload
): Promise<ActionResult<{ workoutId: string }>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized. Please sign in.' };
    }

    const validation = saveWorkoutSchema.safeParse(payload);
    if (!validation.success) {
      const message = validation.error.issues.map((e: any) => e.message).join(', ');
      return { success: false, error: `Invalid workout data: ${message}` };
    }

    // Call the transactional save_workout RPC
    const { data: workoutId, error: rpcError } = await supabase.rpc('save_workout', {
      payload: validation.data,
    });

    if (rpcError) {
      console.error('[saveWorkoutAction] RPC error:', rpcError);
      return { success: false, error: rpcError.message || 'Failed to save workout' };
    }

    revalidatePath('/dashboard');
    revalidatePath('/workout/history');
    revalidatePath('/workout');

    return { success: true, data: { workoutId: workoutId as string } };
  } catch (err: unknown) {
    console.error('[saveWorkoutAction] Exception:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to save workout',
    };
  }
}

/**
 * Discard an in-progress workout draft if it exists.
 */
export async function discardWorkoutAction(
  workoutId?: string
): Promise<ActionResult> {
  try {
    if (!workoutId) {
      return { success: true };
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const { error } = await supabase
      .from('workouts')
      .delete()
      .eq('id', workoutId)
      .eq('user_id', user.id)
      .is('ended_at', null);

    if (error) {
      console.error('[discardWorkoutAction] Error:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard');
    return { success: true };
  } catch (err: unknown) {
    console.error('[discardWorkoutAction] Exception:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to discard workout',
    };
  }
}

/**
 * Fetch paginated workout history with summary statistics.
 */
export async function getWorkoutHistoryAction(params?: {
  limit?: number;
  offset?: number;
}): Promise<ActionResult<WorkoutSummary[]>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const limit = params?.limit || 20;
    const offset = params?.offset || 0;

    const { data: workoutsData, error } = await supabase
      .from('workouts')
      .select(`
        id,
        name,
        started_at,
        ended_at,
        notes,
        routine_id,
        routines ( name ),
        workout_exercises (
          id,
          exercise_id,
          sets (
            id,
            set_type,
            reps,
            weight_kg,
            is_completed,
            est_1rm_kg
          )
        )
      `)
      .eq('user_id', user.id)
      .not('ended_at', 'is', null)
      .order('started_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('[getWorkoutHistoryAction] Error:', error);
      return { success: false, error: error.message };
    }

    // Collect all exercise IDs to query historical bests
    const allExerciseIds = Array.from(
      new Set(
        (workoutsData || []).flatMap((w: any) =>
          (w.workout_exercises || []).map((we: any) => we.exercise_id)
        )
      )
    );

    const historicalByExercise = new Map<
      string,
      Array<{ workoutId: string; startedAtMs: number; est1rmKg: number }>
    >();

    if (allExerciseIds.length > 0) {
      const { data: histData, error: histError } = await supabase
        .from('sets')
        .select(`
          exercise_id,
          est_1rm_kg,
          workout_exercise:workout_exercises!inner (
            workout:workouts!inner (
              id,
              started_at
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('is_completed', true)
        .not('est_1rm_kg', 'is', null)
        .in('exercise_id', allExerciseIds);

      if (!histError && histData) {
        for (const s of histData) {
          if (s.est_1rm_kg === null || s.est_1rm_kg === undefined) continue;
          const we: any = Array.isArray(s.workout_exercise)
            ? s.workout_exercise[0]
            : s.workout_exercise;
          const w: any = Array.isArray(we?.workout)
            ? we?.workout[0]
            : we?.workout;

          if (w?.id && w?.started_at) {
            const startedAtMs = new Date(w.started_at).getTime();
            if (!isNaN(startedAtMs)) {
              const list = historicalByExercise.get(s.exercise_id) || [];
              list.push({
                workoutId: w.id,
                startedAtMs,
                est1rmKg: Number(s.est_1rm_kg),
              });
              historicalByExercise.set(s.exercise_id, list);
            }
          }
        }
      }
    }

    // Compute aggregations in application layer
    const summaries: WorkoutSummary[] = (workoutsData || []).map((w: any) => {
      let totalVolumeKg = 0;
      let completedSetsCount = 0;
      let prsCount = 0;

      const wStartMs = w.started_at ? new Date(w.started_at).getTime() : NaN;
      const exercises = w.workout_exercises || [];

      for (const we of exercises) {
        // Calculate user's best for this exercise before this workout's started_at
        let earlierBest: number | null = null;
        if (!isNaN(wStartMs)) {
          const priorList = historicalByExercise.get(we.exercise_id) || [];
          for (const item of priorList) {
            if (item.workoutId !== w.id && item.startedAtMs < wStartMs) {
              if (earlierBest === null || item.est1rmKg > earlierBest) {
                earlierBest = item.est1rmKg;
              }
            }
          }
        }

        const sets = we.sets || [];
        for (const s of sets) {
          if (s.is_completed) {
            completedSetsCount++;
            // Analytics rule: volume excludes warmups
            if (s.set_type !== 'warmup' && s.weight_kg && s.reps) {
              totalVolumeKg += Number(s.weight_kg) * Number(s.reps);
            }
            if (
              s.est_1rm_kg &&
              earlierBest !== null &&
              Number(s.est_1rm_kg) > earlierBest
            ) {
              prsCount++;
            }
          }
        }
      }

      let durationSeconds = 0;
      if (w.started_at && w.ended_at) {
        const start = new Date(w.started_at).getTime();
        const end = new Date(w.ended_at).getTime();
        durationSeconds = Math.max(0, Math.floor((end - start) / 1000));
      }

      return {
        id: w.id,
        name: w.name,
        started_at: w.started_at,
        ended_at: w.ended_at,
        notes: w.notes,
        routine_name: w.routines?.name || null,
        exercise_count: exercises.length,
        completed_sets_count: completedSetsCount,
        total_volume_kg: Math.round(totalVolumeKg * 100) / 100,
        duration_seconds: durationSeconds,
        prs_count: prsCount,
      };
    });

    return { success: true, data: summaries };
  } catch (err: unknown) {
    console.error('[getWorkoutHistoryAction] Exception:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to fetch workout history',
    };
  }
}

/**
 * Fetch detailed workout information for viewing or editing.
 */
export async function getWorkoutDetailAction(
  workoutId: string
): Promise<ActionResult<WorkoutDetail>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const { data: workout, error } = await supabase
      .from('workouts')
      .select(`
        *,
        routine:routines ( id, name ),
        workout_exercises (
          id,
          workout_id,
          user_id,
          exercise_id,
          position,
          superset_group,
          notes,
          created_at,
          exercise:exercises (*),
          sets (*)
        )
      `)
      .eq('id', workoutId)
      .eq('user_id', user.id)
      .single();

    if (error || !workout) {
      console.error('[getWorkoutDetailAction] Error:', error);
      return { success: false, error: 'Workout not found' };
    }

    // Sort exercises by position, and their sets by set_number
    const sortedExercises = (workout.workout_exercises || [])
      .sort((a: any, b: any) => a.position - b.position)
      .map((we: any) => ({
        ...we,
        sets: (we.sets || []).sort((a: any, b: any) => a.set_number - b.set_number),
      }));

    // Find the user's best est_1rm_kg for each exercise prior to this workout's started_at
    const exerciseIds = sortedExercises.map((we: any) => we.exercise_id);
    const earlierBestMap = new Map<string, number>();

    if (exerciseIds.length > 0 && workout.started_at) {
      const workoutStartTime = new Date(workout.started_at).getTime();

      if (!isNaN(workoutStartTime)) {
        const { data: priorSetsData, error: priorError } = await supabase
          .from('sets')
          .select(`
            exercise_id,
            est_1rm_kg,
            workout_exercise:workout_exercises!inner (
              workout:workouts!inner (
                id,
                started_at
              )
            )
          `)
          .eq('user_id', user.id)
          .eq('is_completed', true)
          .not('est_1rm_kg', 'is', null)
          .in('exercise_id', exerciseIds);

        if (!priorError && priorSetsData) {
          for (const s of priorSetsData) {
            const we: any = Array.isArray(s.workout_exercise)
              ? s.workout_exercise[0]
              : s.workout_exercise;
            const w: any = Array.isArray(we?.workout)
              ? we?.workout[0]
              : we?.workout;

            if (w?.id && w.id !== workout.id && w.started_at) {
              const priorStartTime = new Date(w.started_at).getTime();
              if (priorStartTime < workoutStartTime && s.est_1rm_kg !== null) {
                const val = Number(s.est_1rm_kg);
                const currentMax = earlierBestMap.get(s.exercise_id);
                if (currentMax === undefined || val > currentMax) {
                  earlierBestMap.set(s.exercise_id, val);
                }
              }
            }
          }
        }
      }
    }

    let totalVolumeKg = 0;
    let completedSetsCount = 0;
    const prsByExercise = new Map<
      string,
      { exerciseName: string; weightKg: number; reps: number; est1rmKg: number }
    >();

    for (const we of sortedExercises) {
      const earlierBest = earlierBestMap.get(we.exercise_id);

      for (const s of we.sets) {
        if (s.is_completed) {
          completedSetsCount++;
          if (s.set_type !== 'warmup' && s.weight_kg && s.reps) {
            totalVolumeKg += Number(s.weight_kg) * Number(s.reps);
          }
          if (
            s.est_1rm_kg &&
            we.exercise &&
            earlierBest !== undefined &&
            earlierBest !== null &&
            Number(s.est_1rm_kg) > earlierBest
          ) {
            const currentEst1rm = Number(s.est_1rm_kg);
            const existing = prsByExercise.get(we.exercise_id);
            if (!existing || currentEst1rm > existing.est1rmKg) {
              prsByExercise.set(we.exercise_id, {
                exerciseName: we.exercise.name,
                weightKg: Number(s.weight_kg),
                reps: Number(s.reps),
                est1rmKg: currentEst1rm,
              });
            }
          }
        }
      }
    }

    const prs = Array.from(prsByExercise.values());

    let durationSeconds = 0;
    if (workout.started_at && workout.ended_at) {
      const start = new Date(workout.started_at).getTime();
      const end = new Date(workout.ended_at).getTime();
      durationSeconds = Math.max(0, Math.floor((end - start) / 1000));
    }

    const detail: WorkoutDetail = {
      ...workout,
      workout_exercises: sortedExercises,
      stats: {
        totalVolumeKg: Math.round(totalVolumeKg * 100) / 100,
        durationSeconds,
        completedSetsCount,
        prs,
      },
    };

    return { success: true, data: detail };
  } catch (err: unknown) {
    console.error('[getWorkoutDetailAction] Exception:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to fetch workout details',
    };
  }
}

/**
 * Fetch last performance for a list of exercises to display in "Previous" columns.
 */
export async function getLastPerformanceAction(
  exerciseIds: string[]
): Promise<ActionResult<Record<string, LastPerformanceSet[]>>> {
  try {
    if (!exerciseIds || exerciseIds.length === 0) {
      return { success: true, data: {} };
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Query sets for the specified exercises completed by the user
    const { data: setsData, error } = await supabase
      .from('sets')
      .select(`
        exercise_id,
        set_number,
        set_type,
        weight_kg,
        reps,
        completed_at,
        created_at,
        workout_exercise:workout_exercises (
          workout:workouts (
            id,
            ended_at,
            started_at
          )
        )
      `)
      .eq('user_id', user.id)
      .in('exercise_id', exerciseIds)
      .eq('is_completed', true)
      .order('completed_at', { ascending: false });

    if (error) {
      console.error('[getLastPerformanceAction] Error:', error);
      return { success: false, error: error.message };
    }

    // Group sets by exercise_id and find the most recent session's sets
    const result: Record<string, LastPerformanceSet[]> = {};

    for (const exId of exerciseIds) {
      const exSets = (setsData || []).filter((s: any) => s.exercise_id === exId);
      if (exSets.length === 0) continue;

      // Group by workout ID to isolate the last session
      const workoutGroups = new Map<string, any[]>();
      for (const s of exSets) {
        const we: any = Array.isArray(s.workout_exercise)
          ? s.workout_exercise[0]
          : s.workout_exercise;
        const w: any = Array.isArray(we?.workout)
          ? we?.workout[0]
          : we?.workout;
        const wId = w?.id || 'unknown';
        if (!workoutGroups.has(wId)) {
          workoutGroups.set(wId, []);
        }
        workoutGroups.get(wId)!.push(s);
      }

      // Pick the workout with the latest completed set
      let latestWorkoutSets: any[] = [];
      let latestTime = 0;

      for (const [, group] of workoutGroups.entries()) {
        const time = Math.max(
          ...group.map((s) => new Date(s.completed_at || s.created_at).getTime())
        );
        if (time > latestTime) {
          latestTime = time;
          latestWorkoutSets = group;
        }
      }

      // Sort sets by set_number
      latestWorkoutSets.sort((a, b) => a.set_number - b.set_number);

      result[exId] = latestWorkoutSets.map((s) => ({
        set_number: s.set_number,
        set_type: s.set_type,
        weight_kg: s.weight_kg ? Number(s.weight_kg) : null,
        reps: s.reps ? Number(s.reps) : null,
      }));
    }

    return { success: true, data: result };
  } catch (err: unknown) {
    console.error('[getLastPerformanceAction] Exception:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to fetch last performance',
    };
  }
}

/**
 * Delete a past workout and all its exercises/sets (cascades).
 */
export async function deleteWorkoutAction(
  workoutId: string
): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const { error } = await supabase
      .from('workouts')
      .delete()
      .eq('id', workoutId)
      .eq('user_id', user.id);

    if (error) {
      console.error('[deleteWorkoutAction] Error:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard');
    revalidatePath('/workout/history');
    return { success: true };
  } catch (err: unknown) {
    console.error('[deleteWorkoutAction] Exception:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to delete workout',
    };
  }
}

/**
 * Fetch all available routines (system templates + user custom routines)
 */
export async function getRoutinesAction(): Promise<ActionResult<DbRoutine[]>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const { data, error } = await supabase
      .from('routines')
      .select(`
        *,
        routine_exercises (
          id,
          routine_id,
          user_id,
          exercise_id,
          position,
          superset_group,
          notes,
          created_at,
          exercise:exercises (*),
          routine_sets (
            id,
            routine_exercise_id,
            user_id,
            set_number,
            set_type,
            target_reps_min,
            target_reps_max,
            target_weight_kg,
            rest_sec,
            created_at
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[getRoutinesAction] Error:', error);
      return { success: false, error: error.message };
    }

    // Sort routine_exercises by position, and routine_sets by set_number
    const routines = (data as DbRoutine[]).map((routine) => ({
      ...routine,
      routine_exercises: (routine.routine_exercises || [])
        .sort((a, b) => a.position - b.position)
        .map((re) => ({
          ...re,
          routine_sets: (re.routine_sets || []).sort(
            (a, b) => a.set_number - b.set_number
          ),
        })),
    }));

    return { success: true, data: routines };
  } catch (err: unknown) {
    console.error('[getRoutinesAction] Exception:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to fetch routines',
    };
  }
}

/**
 * Fetch single routine detail by id with its exercises and sets.
 */
export async function getRoutineDetailAction(
  routineId: string
): Promise<ActionResult<RoutineDetail>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const { data: routine, error } = await supabase
      .from('routines')
      .select(`
        *,
        routine_exercises (
          id,
          routine_id,
          user_id,
          exercise_id,
          position,
          superset_group,
          notes,
          created_at,
          exercise:exercises (*),
          routine_sets (*)
        )
      `)
      .eq('id', routineId)
      .single();

    if (error || !routine) {
      console.error('[getRoutineDetailAction] Error:', error);
      return { success: false, error: 'Routine not found' };
    }

    const sortedExercises = (routine.routine_exercises || [])
      .sort((a: any, b: any) => a.position - b.position)
      .map((re: any) => ({
        ...re,
        routine_sets: (re.routine_sets || []).sort(
          (a: any, b: any) => a.set_number - b.set_number
        ),
      }));

    return {
      success: true,
      data: {
        ...routine,
        routine_exercises: sortedExercises,
      },
    };
  } catch (err: unknown) {
    console.error('[getRoutineDetailAction] Exception:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to fetch routine detail',
    };
  }
}

/**
 * Save or update a custom routine via save_routine RPC.
 */
export async function saveRoutineAction(
  payload: SaveRoutinePayload
): Promise<ActionResult<{ routineId: string }>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const validation = saveRoutineSchema.safeParse(payload);
    if (!validation.success) {
      const message = validation.error.issues.map((e: any) => e.message).join(', ');
      return { success: false, error: `Invalid routine data: ${message}` };
    }

    const { data: routineId, error: rpcError } = await supabase.rpc('save_routine', {
      payload: validation.data,
    });

    if (rpcError) {
      console.error('[saveRoutineAction] RPC error:', rpcError);
      return { success: false, error: rpcError.message || 'Failed to save routine' };
    }

    revalidatePath('/routines');
    revalidatePath('/dashboard');
    return { success: true, data: { routineId: routineId as string } };
  } catch (err: unknown) {
    console.error('[saveRoutineAction] Exception:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to save routine',
    };
  }
}

/**
 * Delete a routine (past workouts will retain routine_id = NULL).
 */
export async function deleteRoutineAction(
  routineId: string
): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const { error } = await supabase
      .from('routines')
      .delete()
      .eq('id', routineId)
      .eq('user_id', user.id);

    if (error) {
      console.error('[deleteRoutineAction] Error:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/routines');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (err: unknown) {
    console.error('[deleteRoutineAction] Exception:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to delete routine',
    };
  }
}

/**
 * Duplicate an existing routine into a user routine.
 */
export async function duplicateRoutineAction(
  routineId: string
): Promise<ActionResult<{ routineId: string }>> {
  try {
    const detailRes = await getRoutineDetailAction(routineId);
    if (!detailRes.success || !detailRes.data) {
      return { success: false, error: detailRes.error || 'Failed to fetch source routine' };
    }

    const source = detailRes.data;
    const newPayload: SaveRoutinePayload = {
      name: `${source.name} (Copy)`,
      notes: source.notes,
      exercises: source.routine_exercises.map((re, index) => ({
        exercise_id: re.exercise_id,
        position: index + 1,
        superset_group: re.superset_group,
        notes: re.notes,
        sets: (re.routine_sets || []).map((rs) => ({
          set_number: rs.set_number,
          set_type: rs.set_type,
          target_reps_min: rs.target_reps_min,
          target_reps_max: rs.target_reps_max,
          target_weight_kg: rs.target_weight_kg ? Number(rs.target_weight_kg) : null,
          rest_sec: rs.rest_sec,
        })),
      })),
    };

    return await saveRoutineAction(newPayload);
  } catch (err: unknown) {
    console.error('[duplicateRoutineAction] Exception:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to duplicate routine',
    };
  }
}

/**
 * Create a new routine from a completed workout using the RPC.
 */
export async function createRoutineFromWorkoutAction(
  workoutId: string
): Promise<ActionResult<{ routineId: string }>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const { data: routineId, error: rpcError } = await supabase.rpc(
      'create_routine_from_workout',
      { p_workout_id: workoutId }
    );

    if (rpcError) {
      console.error('[createRoutineFromWorkoutAction] RPC error:', rpcError);
      return {
        success: false,
        error: rpcError.message || 'Failed to create routine from workout',
      };
    }

    revalidatePath('/routines');
    revalidatePath('/dashboard');
    return { success: true, data: { routineId: routineId as string } };
  } catch (err: unknown) {
    console.error('[createRoutineFromWorkoutAction] Exception:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to create routine from workout',
    };
  }
}

/**
 * Search and filter exercises from the database.
 */
export async function getExercisesAction(params?: {
  query?: string;
  bodyPart?: string;
  equipment?: string;
  target?: string;
  category?: string;
  limit?: number;
  offset?: number;
}): Promise<ActionResult<DbExercise[]>> {
  try {
    const supabase = await createClient();
    const limit = params?.limit || 40;
    const offset = params?.offset || 0;

    let query = supabase
      .from('exercises')
      .select('*')
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1);

    if (params?.query && params.query.trim()) {
      query = query.ilike('name', `%${params.query.trim()}%`);
    }

    if (params?.bodyPart && params.bodyPart !== 'all') {
      query = query.eq('body_part', params.bodyPart);
    }

    if (params?.equipment && params.equipment !== 'all') {
      const eq = params.equipment.toLowerCase().trim();
      if (eq === 'machine') {
        // In database, machines are categorized as "leverage machine", "smith machine", "sled machine", etc.
        query = query.ilike('equipment', '%machine%');
      } else if (eq === 'barbell') {
        query = query.ilike('equipment', '%barbell%');
      } else if (eq === 'band') {
        query = query.ilike('equipment', '%band%');
      } else if (eq === 'body weight' || eq === 'bodyweight') {
        query = query.ilike('equipment', '%body%weight%');
      } else {
        query = query.ilike('equipment', `%${eq}%`);
      }
    }

    if (params?.target && params.target !== 'all') {
      query = query.eq('target', params.target);
    }

    if (params?.category && params.category !== 'all') {
      query = query.eq('category', params.category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[getExercisesAction] Error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as DbExercise[] };
  } catch (err: unknown) {
    console.error('[getExercisesAction] Exception:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to fetch exercises',
    };
  }
}
