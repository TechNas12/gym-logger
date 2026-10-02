import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getRoutinesAction } from '@/app/workout/actions';
import { RoutineCard } from '@/components/routines/routine-card';
import { Plus, Layers, ArrowLeft, Dumbbell, Sparkles } from 'lucide-react';

export const metadata = {
  title: 'Workout Routines & Splits | GymLogger',
  description: 'Browse curated starter templates or build your own custom workout splits.',
};

export default async function RoutinesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/routines');
  }

  const routinesRes = await getRoutinesAction();
  const routines = routinesRes.success && routinesRes.data ? routinesRes.data : [];

  const templates = routines.filter((r) => r.is_system || r.user_id === null);
  const customRoutines = routines.filter((r) => !r.is_system && r.user_id !== null);

  return (
    <div className="min-h-screen bg-background text-text-primary pb-24">
      {/* Sticky Sub-Header */}
      <header className="sticky top-0 z-20 bg-surface/95 backdrop-blur-xl border-b border-border/80 px-4 py-3.5 sm:px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>

          <Link
            href="/routines/new"
            className="min-h-[38px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm active:scale-[0.98] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Routine</span>
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-8">
        {/* Page Banner */}
        <div className="relative rounded-2xl bg-surface-raised border border-border/80 p-6 sm:p-8 overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-8 h-8 rounded-xl bg-accent/20 border border-accent/40 text-accent flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">
                  Workout Routines
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-text-muted max-w-xl">
                Follow structured training templates or create custom workout routines with planned exercises, set types, and target rep ranges.
              </p>
            </div>
          </div>
        </div>

        {/* Section 1: My Custom Routines */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-text-primary">
                My Custom Routines
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 font-semibold">
                {customRoutines.length}
              </span>
            </div>
            <Link
              href="/routines/new"
              className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>Create</span>
            </Link>
          </div>

          {customRoutines.length === 0 ? (
            <div className="p-8 text-center rounded-3xl bg-surface/70 border border-dashed border-border/80 flex flex-col items-center justify-center">
              <Dumbbell className="w-8 h-8 text-text-subtle mb-2" />
              <p className="text-sm font-semibold text-text-primary">
                No custom routines yet
              </p>
              <p className="text-xs text-text-muted mt-0.5 mb-4 max-w-sm">
                Build your own workout plan from scratch, or duplicate one of the starter templates below.
              </p>
              <Link
                href="/routines/new"
                className="py-2.5 px-4 rounded-xl bg-surface-raised border border-border/80 hover:border-accent/40 text-text-primary text-xs font-bold transition-all shadow-sm"
              >
                Create First Routine
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customRoutines.map((routine) => (
                <RoutineCard
                  key={routine.id}
                  routine={routine}
                  isOwner={routine.user_id === user.id}
                />
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Starter Templates */}
        <div className="space-y-4 pt-4 border-t border-border/60">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            <h2 className="text-base sm:text-lg font-bold text-text-primary">
              Starter Templates
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30 font-semibold">
              {templates.length}
            </span>
          </div>

          {templates.length === 0 ? (
            <div className="p-6 text-center rounded-2xl bg-surface/60 border border-border text-xs text-text-subtle">
              No template routines available at this time.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((routine) => (
                <RoutineCard
                  key={routine.id}
                  routine={routine}
                  isOwner={false}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
