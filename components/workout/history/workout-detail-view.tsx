'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Dumbbell,
  CheckCircle2,
  Trophy,
  Pencil,
  Trash2,
  BookmarkPlus,
  Loader2,
  Sparkles,
  Link as LinkIcon,
} from 'lucide-react';
import type { WorkoutDetail, DbExercise } from '@/lib/types/workout';
import { deleteWorkoutAction, createRoutineFromWorkoutAction } from '@/app/workout/actions';
import { ExerciseDetailModal } from '@/components/workout/exercise-detail-modal';
import { formatWorkoutDetailDate } from '@/lib/date-format';

interface WorkoutDetailViewProps {
  workout: WorkoutDetail;
}

export function WorkoutDetailView({ workout }: WorkoutDetailViewProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingRoutine, setIsSavingRoutine] = useState(false);
  const [routineMessage, setRoutineMessage] = useState<string | null>(null);
  const [inspectExercise, setInspectExercise] = useState<DbExercise | null>(null);

  const formatDuration = (secs: number) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (hrs > 0) return `${hrs}h ${mins}m ${s}s`;
    return `${mins}m ${s}s`;
  };

  const formattedDate = formatWorkoutDetailDate(workout.started_at);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${workout.name}"?`)) return;

    setIsDeleting(true);
    try {
      const res = await deleteWorkoutAction(workout.id);
      if (res.success) {
        router.push('/workout/history');
      } else {
        alert(res.error || 'Failed to delete workout');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting workout');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveAsRoutine = async () => {
    setIsSavingRoutine(true);
    try {
      const res = await createRoutineFromWorkoutAction(workout.id);
      if (res.success && res.data) {
        const routineId = res.data.routineId;
        setRoutineMessage('Saved as routine template!');
        setTimeout(() => {
          router.push(`/routines/${routineId}`);
        }, 1200);
      } else {
        alert(res.error || 'Failed to create routine');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving routine');
    } finally {
      setIsSavingRoutine(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Nav */}
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/workout/history"
          className="flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to History</span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Save as Routine */}
          <button
            type="button"
            onClick={handleSaveAsRoutine}
            disabled={isSavingRoutine}
            className="min-h-[38px] px-3 rounded-xl bg-surface border border-border/80 hover:border-blue-500/50 text-text-primary text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {isSavingRoutine ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <BookmarkPlus className="w-3.5 h-3.5 text-blue-400" />
            )}
            <span className="hidden sm:inline">Save as Routine</span>
          </button>

          {/* Edit Workout */}
          <Link
            href={`/workout/${workout.id}/edit`}
            className="min-h-[38px] px-3 rounded-xl bg-surface border border-border/80 hover:border-accent/40 text-text-primary text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5 text-accent" />
            <span className="hidden sm:inline">Edit</span>
          </Link>

          {/* Delete Workout */}
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="min-h-[38px] px-3 rounded-xl bg-surface border border-border/80 hover:bg-danger-bg/20 text-danger text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {isDeleting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>
      </div>

      {routineMessage && (
        <div className="p-3 rounded-xl bg-accent/15 border border-accent/40 text-accent text-xs font-semibold text-center animate-in fade-in">
          {routineMessage}
        </div>
      )}

      {/* Main Stats Header Card */}
      <div className="p-6 sm:p-7 rounded-3xl bg-surface/90 border border-border/80 shadow-xl space-y-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span suppressHydrationWarning className="text-xs font-mono text-text-subtle flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-accent" />
              {formattedDate}
            </span>
            {workout.routine && (
              <Link
                href={`/routines/${workout.routine.id}`}
                className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 hover:underline"
              >
                Routine: {workout.routine.name}
              </Link>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">
            {workout.name}
          </h1>

          {workout.notes && (
            <p className="text-xs sm:text-sm text-text-muted mt-2 italic">
              &ldquo;{workout.notes}&rdquo;
            </p>
          )}
        </div>

        {/* 3 Metric Badges */}
        <div className="grid grid-cols-3 gap-2.5 pt-4 border-t border-border/60">
          <div className="p-3 rounded-2xl bg-surface-raised border border-border/80 text-center">
            <Clock className="w-4 h-4 text-accent mx-auto mb-1 opacity-90" />
            <div className="text-[11px] text-text-subtle">Duration</div>
            <div className="text-xs sm:text-sm font-bold font-mono text-text-primary mt-0.5">
              {formatDuration(workout.stats.durationSeconds)}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-surface-raised border border-border/80 text-center">
            <Dumbbell className="w-4 h-4 text-blue-400 mx-auto mb-1 opacity-90" />
            <div className="text-[11px] text-text-subtle">Total Volume</div>
            <div className="text-xs sm:text-sm font-bold font-mono text-text-primary mt-0.5">
              {workout.stats.totalVolumeKg.toLocaleString()} <span className="text-[10px] text-text-subtle">kg</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-surface-raised border border-border/80 text-center">
            <CheckCircle2 className="w-4 h-4 text-warning mx-auto mb-1 opacity-90" />
            <div className="text-[11px] text-text-subtle">Completed Sets</div>
            <div className="text-xs sm:text-sm font-bold font-mono text-text-primary mt-0.5">
              {workout.stats.completedSetsCount}
            </div>
          </div>
        </div>

        {/* PRs if any */}
        {workout.stats.prs.length > 0 && (
          <div className="p-4 rounded-2xl bg-accent/10 border border-accent/30 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-accent">
              <Sparkles className="w-4 h-4" />
              <span>Personal Records Recorded</span>
            </div>
            <div className="space-y-1 text-xs">
              {workout.stats.prs.map((pr, i) => (
                <div key={i} className="flex items-center justify-between text-text-primary">
                  <span className="font-semibold truncate">{pr.exerciseName}</span>
                  <span className="font-mono text-accent font-bold">
                    {pr.weightKg} kg × {pr.reps} (1RM ~{pr.est1rmKg} kg)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Exercises Breakdown */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-text-primary">
          Exercises & Sets
        </h2>

        {workout.workout_exercises.map((we, idx) => {
          const isInSuperset = we.superset_group !== null;

          return (
            <div
              key={we.id}
              className={`rounded-2xl sm:rounded-3xl bg-surface/90 border border-border/80 shadow-md p-4 sm:p-5 ${
                isInSuperset ? 'border-l-4 border-l-blue-400' : ''
              }`}
            >
              <div className="flex items-start justify-between pb-3 border-b border-border/60 gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    onClick={() => setInspectExercise(we.exercise)}
                    className="relative w-12 h-12 rounded-xl bg-black border border-border/80 overflow-hidden flex items-center justify-center shrink-0 cursor-pointer hover:border-accent/60 transition-all shadow-xs"
                    title="Click to view technique guide & animation"
                  >
                    {we.exercise.image_url || we.exercise.gif_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={we.exercise.image_url || we.exercise.gif_url!}
                        alt={we.exercise.name}
                        className="w-full h-full object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <Dumbbell className="w-5 h-5 text-text-subtle" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono font-bold text-text-subtle">
                        #{idx + 1}
                      </span>
                      <h3
                        onClick={() => setInspectExercise(we.exercise)}
                        className="text-sm sm:text-base font-bold text-text-primary hover:text-accent cursor-pointer transition-colors truncate"
                      >
                        {we.exercise.name}
                      </h3>
                      {isInSuperset && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 font-semibold">
                          Superset {we.superset_group}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-subtle capitalize mt-0.5">
                      {we.exercise.target || we.exercise.body_part} • {we.exercise.equipment || 'Any Gear'}
                    </p>
                  </div>
                </div>
              </div>

              {we.notes && (
                <p className="text-xs text-text-muted italic mb-3">
                  Note: {we.notes}
                </p>
              )}

              {/* Sets Table */}
              <div className="grid grid-cols-12 gap-2 text-[11px] font-mono uppercase tracking-wider text-text-subtle font-semibold px-2 mb-2">
                <div className="col-span-2 text-center">SET</div>
                <div className="col-span-3 text-center">TYPE</div>
                <div className="col-span-3 text-center">WEIGHT</div>
                <div className="col-span-2 text-center">REPS</div>
                <div className="col-span-2 text-center">1RM EST</div>
              </div>

              <div className="space-y-1.5">
                {(we.sets || []).map((s) => (
                  <div
                    key={s.id}
                    className={`grid grid-cols-12 gap-2 items-center p-2 rounded-xl border text-xs font-mono ${
                      s.is_completed
                        ? 'bg-surface-raised/80 border-border/70 text-text-primary'
                        : 'bg-surface/50 border-border/40 text-text-subtle'
                    }`}
                  >
                    <div className="col-span-2 text-center font-bold">
                      {s.set_number}
                    </div>

                    <div className="col-span-3 text-center capitalize">
                      {s.set_type}
                    </div>

                    <div className="col-span-3 text-center font-semibold">
                      {s.weight_kg !== null ? `${s.weight_kg} kg` : '—'}
                    </div>

                    <div className="col-span-2 text-center font-semibold">
                      {s.reps !== null ? `${s.reps}` : '—'}
                    </div>

                    <div className="col-span-2 text-center text-accent font-bold">
                      {s.est_1rm_kg ? `~${s.est_1rm_kg}` : '—'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Exercise Detail Guide Modal */}
      <ExerciseDetailModal
        exercise={inspectExercise}
        onClose={() => setInspectExercise(null)}
      />
    </div>
  );
}
