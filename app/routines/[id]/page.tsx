import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getRoutineDetailAction } from '@/app/workout/actions';
import { RoutineDetailView } from '@/components/routines/routine-detail';

interface RoutinePageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: RoutinePageProps) {
  const { id } = await params;
  const res = await getRoutineDetailAction(id);
  if (!res.success || !res.data) {
    return { title: 'Routine Not Found | GymLogger' };
  }
  return {
    title: `${res.data.name} | GymLogger`,
    description: res.data.notes || 'Workout routine template',
  };
}

export default async function RoutineDetailPage({ params }: RoutinePageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const { id } = await params;
    redirect(`/login?next=/routines/${id}`);
  }

  const { id } = await params;
  const res = await getRoutineDetailAction(id);

  if (!res.success || !res.data) {
    notFound();
  }

  const routine = res.data;
  const isOwner = routine.user_id === user.id;

  return (
    <div className="min-h-screen bg-background text-text-primary pb-24">
      <RoutineDetailView routine={routine} isOwner={isOwner} />
    </div>
  );
}
