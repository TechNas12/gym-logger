'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type {
  DbExercise,
  DbRoutine,
  ActiveWorkoutExercise,
} from '@/lib/types/workout';

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Fetch all available routines (system starter routines + user custom routines)
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
          exercise_id,
          order_index,
          target_sets,
          target_reps,
          created_at,
          exercise:exercises (*)
        )
      `)
      .order('is_system', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[getRoutinesAction] Error:', error);
      return { success: false, error: error.message };
    }

    // Sort routine_exercises by order_index
    const routines = (data as DbRoutine[]).map((routine) => ({
      ...routine,
      routine_exercises: (routine.routine_exercises || []).sort(
        (a, b) => a.order_index - b.order_index
      ),
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
 * Search and filter exercises from the database (1,325 available)
 */
export async function getExercisesAction(params?: {
  query?: string;
  bodyPart?: string;
  equipment?: string;
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
      query = query.eq('equipment', params.equipment);
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

/**
 * Start a new workout session (Empty or from a Routine)
 */
export async function startWorkoutAction(params: {
  name?: string;
  routineId?: string | null;
}): Promise<
  ActionResult<{
    sessionId: string;
    name: string;
    routineId?: string | null;
    initialExercises: ActiveWorkoutExercise[];
  }>
> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized. Please sign in.' };
    }

    const defaultName = params.name || 'Quick Workout';

    // 1. Create workout session row
    const { data: session, error: sessionError } = await supabase
      .from('workout_sessions')
      .insert({
        user_id: user.id,
        routine_id: params.routineId || null,
        name: defaultName,
        status: 'in_progress',
        started_at: new Date().toISOString(),
      })
      .select('id, name, routine_id')
      .single();

    if (sessionError || !session) {
      console.error('[startWorkoutAction] Session creation failed:', sessionError);
      return { success: false, error: 'Failed to start workout session.' };
    }

    // 2. If started from a routine, pre-load exercises with sets
    let initialExercises: ActiveWorkoutExercise[] = [];

    if (params.routineId) {
      const { data: routineData } = await supabase
        .from('routine_exercises')
        .select(`
          order_index,
          target_sets,
          target_reps,
          exercise:exercises (*)
        `)
        .eq('routine_id', params.routineId)
        .order('order_index', { ascending: true });

      if (routineData && routineData.length > 0) {
        initialExercises = routineData
          .filter((item) => item.exercise)
          .map((item) => {
            const ex = item.exercise as unknown as DbExercise;
            const targetSets = item.target_sets || 3;
            const targetReps = item.target_reps || 10;

            const sets = Array.from({ length: targetSets }, (_, i) => ({
              setNumber: i + 1,
              weightKg: 0,
              reps: targetReps,
              isCompleted: false,
            }));

            return {
              exerciseId: ex.id,
              exercise: ex,
              sets,
            };
          });
      }
    }

    revalidatePath('/dashboard');
    revalidatePath('/login-success');

    return {
      success: true,
      data: {
        sessionId: session.id,
        name: session.name,
        routineId: session.routine_id,
        initialExercises,
      },
    };
  } catch (err: unknown) {
    console.error('[startWorkoutAction] Exception:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to start workout',
    };
  }
}

/**
 * Finish and persist a completed workout session with its sets
 */
export async function finishWorkoutSessionAction(params: {
  sessionId: string;
  name: string;
  durationSeconds: number;
  totalVolumeKg: number;
  notes?: string;
  exercises: {
    exerciseId: string;
    sets: {
      setNumber: number;
      weightKg: number;
      reps: number;
      rpe?: number | null;
      isCompleted: boolean;
    }[];
  }[];
}): Promise<ActionResult<{ sessionId: string }>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized.' };
    }

    const { sessionId, name, durationSeconds, totalVolumeKg, notes, exercises } =
      params;

    // 1. Update workout_sessions row
    const { error: sessionUpdateError } = await supabase
      .from('workout_sessions')
      .update({
        name,
        status: 'completed',
        completed_at: new Date().toISOString(),
        duration_seconds: durationSeconds,
        total_volume_kg: totalVolumeKg,
        notes: notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId)
      .eq('user_id', user.id);

    if (sessionUpdateError) {
      console.error('[finishWorkoutSessionAction] Update error:', sessionUpdateError);
      return { success: false, error: 'Failed to update workout status.' };
    }

    // 2. Prepare sets batch insert
    const setsToInsert = [];
    for (const ex of exercises) {
      for (const s of ex.sets) {
        setsToInsert.push({
          workout_session_id: sessionId,
          exercise_id: ex.exerciseId,
          set_number: s.setNumber,
          weight_kg: s.weightKg,
          reps: s.reps,
          rpe: s.rpe || null,
          is_completed: s.isCompleted,
        });
      }
    }

    if (setsToInsert.length > 0) {
      const { error: setsInsertError } = await supabase
        .from('workout_sets')
        .insert(setsToInsert);

      if (setsInsertError) {
        console.error('[finishWorkoutSessionAction] Sets insert error:', setsInsertError);
      }
    }

    revalidatePath('/dashboard');
    revalidatePath('/login-success');
    revalidatePath('/workout');

    return {
      success: true,
      data: { sessionId },
    };
  } catch (err: unknown) {
    console.error('[finishWorkoutSessionAction] Exception:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to finish workout',
    };
  }
}

/**
 * Cancel or discard an in-progress workout session
 */
export async function cancelWorkoutSessionAction(
  sessionId: string
): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized.' };
    }

    const { error } = await supabase
      .from('workout_sessions')
      .delete()
      .eq('id', sessionId)
      .eq('user_id', user.id);

    if (error) {
      console.error('[cancelWorkoutSessionAction] Error:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard');
    revalidatePath('/login-success');
    return { success: true };
  } catch (err: unknown) {
    console.error('[cancelWorkoutSessionAction] Exception:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to cancel workout',
    };
  }
}

/**
 * Create a new custom routine with selected exercises
 */
export async function createRoutineAction(params: {
  name: string;
  description?: string;
  exercises: {
    exerciseId: string;
    targetSets: number;
    targetReps: number;
  }[];
}): Promise<ActionResult<{ routineId: string }>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized.' };
    }

    const { data: routine, error: routineError } = await supabase
      .from('routines')
      .insert({
        user_id: user.id,
        name: params.name.trim(),
        description: params.description?.trim() || null,
        is_system: false,
      })
      .select('id')
      .single();

    if (routineError || !routine) {
      return { success: false, error: 'Failed to create routine.' };
    }

    if (params.exercises.length > 0) {
      const routineExercises = params.exercises.map((item, index) => ({
        routine_id: routine.id,
        exercise_id: item.exerciseId,
        order_index: index + 1,
        target_sets: item.targetSets,
        target_reps: item.targetReps,
      }));

      await supabase.from('routine_exercises').insert(routineExercises);
    }

    revalidatePath('/dashboard');
    revalidatePath('/login-success');
    return { success: true, data: { routineId: routine.id } };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to create routine',
    };
  }
}
