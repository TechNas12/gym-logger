import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { RoutineEditor } from '@/components/routines/routine-editor';

export const metadata = {
  title: 'Create Routine | GymLogger',
  description: 'Design a new workout routine template with planned exercises and rep ranges.',
};

export default async function NewRoutinePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/routines/new');
  }

  return (
    <div className="min-h-screen bg-background text-text-primary pb-24">
      <RoutineEditor />
    </div>
  );
}
