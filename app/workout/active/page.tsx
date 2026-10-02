import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ActiveWorkoutTracker } from '@/components/workout/active-workout-tracker';
import { getRoutineDetailAction, getLastPerformanceAction } from '@/app/workout/actions';
import type { ActiveWorkoutState, ActiveExercise } from '@/lib/types/workout';

interface ActiveWorkoutPageProps {
  searchParams: Promise<{
    routine?: string;
  }>;
}

export const metadata = {
  title: 'Active Workout | GymLogger',
  description: 'Log weights, reps, and track your workout session in real-time.',
};

export default async function ActiveWorkoutPage({
  searchParams,
}: ActiveWorkoutPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/workout/active');
  }

  const resolvedParams = await searchParams;
  let initialWorkoutState: ActiveWorkoutState | undefined = undefined;

  if (resolvedParams?.routine) {
    const routineRes = await getRoutineDetailAction(resolvedParams.routine);
    if (routineRes.success && routineRes.data) {
      const routine = routineRes.data;

      // Extract exercise IDs to preload previous performances
      const exerciseIds = routine.routine_exercises.map((re) => re.exercise_id);
      const perfRes = await getLastPerformanceAction(exerciseIds);
      const perfMap = perfRes.success && perfRes.data ? perfRes.data : {};

      const prefilledExercises: ActiveExercise[] = routine.routine_exercises.map((re, idx) => {
        const lastSets = perfMap[re.exercise_id] || [];

        const plannedSets = (re.routine_sets && re.routine_sets.length > 0)
          ? re.routine_sets
          : [
              {
                id: 'default-1',
                routine_exercise_id: re.id,
                user_id: user.id,
                set_number: 1,
                set_type: 'normal' as const,
                target_reps_min: 10,
                target_reps_max: 10,
                target_weight_kg: null,
                rest_sec: 90,
                created_at: new Date().toISOString(),
              },
              {
                id: 'default-2',
                routine_exercise_id: re.id,
                user_id: user.id,
                set_number: 2,
                set_type: 'normal' as const,
                target_reps_min: 10,
                target_reps_max: 10,
                target_weight_kg: null,
                rest_sec: 90,
                created_at: new Date().toISOString(),
              },
              {
                id: 'default-3',
                routine_exercise_id: re.id,
                user_id: user.id,
                set_number: 3,
                set_type: 'normal' as const,
                target_reps_min: 10,
                target_reps_max: 10,
                target_weight_kg: null,
                rest_sec: 90,
                created_at: new Date().toISOString(),
              },
            ];

        return {
          clientId: crypto.randomUUID(),
          exerciseId: re.exercise_id,
          exercise: re.exercise!,
          position: idx + 1,
          supersetGroup: re.superset_group,
          notes: re.notes || '',
          sets: plannedSets.map((ps, sIdx) => {
            const matchedPrev = lastSets[sIdx] || lastSets[lastSets.length - 1];
            const prevText = matchedPrev && (matchedPrev.weight_kg !== null || matchedPrev.reps !== null)
              ? `${matchedPrev.weight_kg ?? 0} kg × ${matchedPrev.reps ?? 0}`
              : null;

            return {
              clientId: crypto.randomUUID(),
              setNumber: ps.set_number,
              setType: ps.set_type,
              reps: ps.target_reps_max ?? ps.target_reps_min ?? 10,
              weightKg: ps.target_weight_kg != null ? Number(ps.target_weight_kg) : null,
              isCompleted: false,
              previous: prevText,
            };
          }),
        };
      });

      initialWorkoutState = {
        workoutId: null,
        routineId: routine.id,
        name: routine.name,
        startedAt: new Date().toISOString(),
        notes: routine.notes || '',
        exercises: prefilledExercises,
      };
    }
  }

  return (
    <ActiveWorkoutTracker initialWorkoutState={initialWorkoutState} />
  );
}
