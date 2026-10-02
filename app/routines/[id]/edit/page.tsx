import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getRoutineDetailAction } from '@/app/workout/actions';
import { RoutineEditor } from '@/components/routines/routine-editor';

interface EditRoutinePageProps {
  params: Promise<{
    id: string;
  }>;
}

export const metadata = {
  title: 'Edit Routine | GymLogger',
  description: 'Modify workout routine exercises and target sets.',
};

export default async function EditRoutinePage({ params }: EditRoutinePageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { id } = await params;

  if (!user) {
    redirect(`/login?next=/routines/${id}/edit`);
  }

  const res = await getRoutineDetailAction(id);
  if (!res.success || !res.data) {
    notFound();
  }

  const routine = res.data;

  // Only the owner can edit custom routines
  if (routine.user_id !== user.id) {
    redirect(`/routines/${id}`);
  }

  return (
    <div className="min-h-screen bg-background text-text-primary pb-24">
      <RoutineEditor initialRoutine={routine} />
    </div>
  );
}
