import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getWorkoutDetailAction } from '@/app/workout/actions';
import { WorkoutDetailView } from '@/components/workout/history/workout-detail-view';

interface WorkoutDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: WorkoutDetailPageProps) {
  const { id } = await params;
  const res = await getWorkoutDetailAction(id);
  if (!res.success || !res.data) {
    return { title: 'Workout Not Found | GymLogger' };
  }
  return {
    title: `${res.data.name} | GymLogger`,
    description: `Workout session with ${res.data.workout_exercises.length} exercises.`,
  };
}

export default async function WorkoutDetailPage({ params }: WorkoutDetailPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { id } = await params;

  if (!user) {
    redirect(`/login?next=/workout/${id}`);
  }

  const res = await getWorkoutDetailAction(id);

  if (!res.success || !res.data) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background text-text-primary pb-24">
      <WorkoutDetailView workout={res.data} />
    </div>
  );
}
