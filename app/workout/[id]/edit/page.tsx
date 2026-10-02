import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getWorkoutDetailAction, getLastPerformanceAction } from '@/app/workout/actions';
import { ActiveWorkoutTracker } from '@/components/workout/active-workout-tracker';
import type { ActiveWorkoutState, ActiveExercise } from '@/lib/types/workout';

interface EditWorkoutPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const metadata = {
  title: 'Edit Workout | GymLogger',
  description: 'Modify weights, reps, exercises, or set types of a past workout session.',
};

export default async function EditWorkoutPage({ params }: EditWorkoutPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { id } = await params;

  if (!user) {
    redirect(`/login?next=/workout/${id}/edit`);
  }

  const res = await getWorkoutDetailAction(id);
  if (!res.success || !res.data) {
    notFound();
  }

  const workout = res.data;

  // Exercise IDs for previous performance
  const exerciseIds = workout.workout_exercises.map((we) => we.exercise_id);
  const perfRes = await getLastPerformanceAction(exerciseIds);
  const perfMap = perfRes.success && perfRes.data ? perfRes.data : {};

  const mappedExercises: ActiveExercise[] = workout.workout_exercises.map((we, idx) => {
    const lastSets = perfMap[we.exercise_id] || [];

    return {
      clientId: crypto.randomUUID(),
      exerciseId: we.exercise_id,
      exercise: we.exercise,
      position: idx + 1,
      supersetGroup: we.superset_group,
      notes: we.notes || '',
      sets: (we.sets || []).map((s, sIdx) => {
        const matchedPrev = lastSets[sIdx] || lastSets[lastSets.length - 1];
        const prevText = matchedPrev && (matchedPrev.weight_kg !== null || matchedPrev.reps !== null)
          ? `${matchedPrev.weight_kg ?? 0} kg × ${matchedPrev.reps ?? 0}`
          : null;

        return {
          clientId: crypto.randomUUID(),
          setNumber: s.set_number,
          setType: s.set_type,
          reps: s.reps,
          weightKg: s.weight_kg ? Number(s.weight_kg) : null,
          durationSec: s.duration_sec,
          distanceM: s.distance_m ? Number(s.distance_m) : null,
          rpe: s.rpe ? Number(s.rpe) : null,
          isCompleted: s.is_completed,
          completedAt: s.completed_at,
          previous: prevText,
        };
      }),
    };
  });

  const initialWorkoutState: ActiveWorkoutState = {
    workoutId: workout.id,
    routineId: workout.routine_id,
    name: workout.name,
    startedAt: workout.started_at,
    endedAt: workout.ended_at,
    notes: workout.notes || '',
    exercises: mappedExercises,
  };

  return (
    <ActiveWorkoutTracker initialWorkoutState={initialWorkoutState} />
  );
}
