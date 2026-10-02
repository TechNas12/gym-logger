'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Play,
  Copy,
  Pencil,
  Trash2,
  Layers,
  Dumbbell,
  Clock,
  Flame,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import type { RoutineDetail, DbExercise } from '@/lib/types/workout';
import { deleteRoutineAction, duplicateRoutineAction } from '@/app/workout/actions';
import { ExerciseDetailModal } from '@/components/workout/exercise-detail-modal';

interface RoutineDetailViewProps {
  routine: RoutineDetail;
  isOwner: boolean;
}

export function RoutineDetailView({ routine, isOwner }: RoutineDetailViewProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [inspectExercise, setInspectExercise] = useState<DbExercise | null>(null);

  const exercises = routine.routine_exercises || [];
  const isTemplate = routine.is_system || routine.user_id === null;

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${routine.name}"?`)) return;

    setIsDeleting(true);
    try {
      const res = await deleteRoutineAction(routine.id);
      if (res.success) {
        router.push('/routines');
      } else {
        alert(res.error || 'Failed to delete routine');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting routine');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDuplicate = async () => {
    setIsDuplicating(true);
    try {
      const res = await duplicateRoutineAction(routine.id);
      if (res.success && res.data) {
        router.push(`/routines/${res.data.routineId}`);
      } else {
        alert(res.error || 'Failed to duplicate routine');
      }
    } catch (err) {
      console.error(err);
      alert('Error duplicating routine');
    } finally {
      setIsDuplicating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/routines"
          className="flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Routines</span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Duplicate button */}
          <button
            type="button"
            onClick={handleDuplicate}
            disabled={isDuplicating}
            className="min-h-[38px] px-3 rounded-xl bg-surface border border-border/80 hover:bg-surface-hover text-text-primary text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {isDuplicating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">Duplicate</span>
          </button>

          {/* Edit (if owner) */}
          {isOwner && (
            <Link
              href={`/routines/${routine.id}/edit`}
              className="min-h-[38px] px-3 rounded-xl bg-surface border border-border/80 hover:bg-surface-hover text-text-primary text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Edit</span>
            </Link>
          )}

          {/* Delete (if owner) */}
          {isOwner && (
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
          )}

          {/* Start Routine CTA */}
          <button
            type="button"
            onClick={() => router.push(`/workout/active?routine=${routine.id}`)}
            className="min-h-[38px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm active:scale-[0.98] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Start Routine</span>
          </button>
        </div>
      </div>

      {/* Routine Info Header Card */}
      <div className="p-6 sm:p-7 rounded-3xl bg-surface/90 border border-border/80 shadow-xl space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            {isTemplate ? (
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30 font-semibold">
                Starter Template
              </span>
            ) : (
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 font-semibold">
                Custom Routine
              </span>
            )}
            <span className="text-xs font-mono text-text-subtle">
              {exercises.length} Exercises
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">
            {routine.name}
          </h1>

          {routine.notes && (
            <p className="text-xs sm:text-sm text-text-muted mt-2 leading-relaxed">
              {routine.notes}
            </p>
          )}
        </div>

        <div className="pt-3 border-t border-border/60 flex items-center gap-4 text-xs font-mono text-text-subtle">
          <span className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-accent" />
            ~{Math.max(20, exercises.length * 10)} mins estimated
          </span>
          <span>•</span>
          <span>
            {exercises.reduce((acc, e) => acc + (e.routine_sets?.length || 3), 0)} Total Sets
          </span>
        </div>
      </div>

      {/* Planned Exercises List */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-text-primary">
          Exercises & Planned Sets
        </h2>

        {exercises.map((re, idx) => {
          const sets = re.routine_sets || [];
          const isInSuperset = re.superset_group !== null;

          return (
            <div
              key={re.id}
              className={`rounded-2xl sm:rounded-3xl bg-surface/90 border border-border/80 shadow-md p-4 sm:p-5 ${
                isInSuperset ? 'border-l-4 border-l-blue-400' : ''
              }`}
            >
              <div className="flex items-start justify-between pb-3 border-b border-border/60 gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Exercise Thumbnail image/gif */}
                  <div
                    onClick={() => re.exercise && setInspectExercise(re.exercise)}
                    className="relative w-12 h-12 rounded-xl bg-black border border-border/80 overflow-hidden flex items-center justify-center shrink-0 cursor-pointer hover:border-accent/60 transition-all shadow-xs"
                    title="Click to view technique guide & animation"
                  >
                    {re.exercise?.image_url || re.exercise?.gif_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={re.exercise.image_url || re.exercise.gif_url!}
                        alt={re.exercise.name}
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
                        onClick={() => re.exercise && setInspectExercise(re.exercise)}
                        className="text-sm sm:text-base font-bold text-text-primary hover:text-accent cursor-pointer transition-colors truncate"
                      >
                        {re.exercise?.name || 'Exercise'}
                      </h3>
                      {isInSuperset && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 font-semibold">
                          Superset {re.superset_group}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-subtle capitalize mt-0.5">
                      {re.exercise?.target || re.exercise?.body_part} • {re.exercise?.equipment || 'Any Gear'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Planned Sets Table */}
              <div className="grid grid-cols-12 gap-2 text-[11px] font-mono uppercase tracking-wider text-text-subtle font-semibold px-2 mb-2">
                <div className="col-span-2 text-center">SET</div>
                <div className="col-span-4 text-center">TARGET REPS</div>
                <div className="col-span-3 text-center">WEIGHT</div>
                <div className="col-span-3 text-center">REST</div>
              </div>

              <div className="space-y-1.5">
                {sets.map((s, sIdx) => (
                  <div
                    key={s.id}
                    className="grid grid-cols-12 gap-2 items-center p-2 rounded-xl bg-surface-raised/70 border border-border/70 text-xs font-mono"
                  >
                    <div className="col-span-2 text-center font-bold text-text-primary">
                      {s.set_type === 'normal' ? sIdx + 1 : s.set_type.toUpperCase()}
                    </div>
                    <div className="col-span-4 text-center text-text-primary font-semibold">
                      {s.target_reps_min === s.target_reps_max
                        ? `${s.target_reps_min ?? 10} reps`
                        : `${s.target_reps_min ?? 8} - ${s.target_reps_max ?? 12} reps`}
                    </div>
                    <div className="col-span-3 text-center text-text-muted">
                      {s.target_weight_kg != null ? `${s.target_weight_kg} kg` : '—'}
                    </div>
                    <div className="col-span-3 text-center text-text-subtle">
                      {s.rest_sec != null ? `${s.rest_sec}s` : '90s'}
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
