import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getWorkoutHistoryAction } from '@/app/workout/actions';
import { WorkoutCard } from '@/components/workout/history/workout-card';
import { ArrowLeft, Plus, History, Dumbbell } from 'lucide-react';

export const metadata = {
  title: 'Workout History | GymLogger',
  description: 'Review your past workout sessions, volume progressions, and personal bests.',
};

export default async function WorkoutHistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/workout/history');
  }

  const historyRes = await getWorkoutHistoryAction({ limit: 50 });
  const workouts = historyRes.success && historyRes.data ? historyRes.data : [];

  return (
    <div className="min-h-screen bg-background text-text-primary pb-24">
      {/* Sticky Sub-Header */}
      <header className="sticky top-0 z-20 bg-surface/95 backdrop-blur-xl border-b border-border/80 px-4 py-3.5 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>

          <Link
            href="/workout/active"
            className="min-h-[38px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm active:scale-[0.98] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Start Workout</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Banner */}
        <div className="relative rounded-2xl bg-surface-raised border border-border/80 p-6 sm:p-7 overflow-hidden">
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-accent/20 border border-accent/40 text-accent flex items-center justify-center shrink-0">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">
                Workout History
              </h1>
              <p className="text-xs text-text-muted mt-0.5">
                {workouts.length} {workouts.length === 1 ? 'session' : 'sessions'} completed
              </p>
            </div>
          </div>
        </div>

        {/* Workouts Grid */}
        {workouts.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-surface/70 border border-dashed border-border/80 flex flex-col items-center justify-center">
            <Dumbbell className="w-10 h-10 text-text-subtle mb-3" />
            <h2 className="text-base font-bold text-text-primary">No workouts logged yet</h2>
            <p className="text-xs text-text-muted mt-1 mb-5 max-w-sm">
              Your finished training sessions will appear here with volume, sets, and personal record tracking.
            </p>
            <Link
              href="/workout/active"
              className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm active:scale-[0.98] transition-colors"
            >
              Start Your First Workout
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workouts.map((w) => (
              <WorkoutCard key={w.id} workout={w} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
