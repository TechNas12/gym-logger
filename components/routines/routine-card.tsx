'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Play,
  Copy,
  Pencil,
  Trash2,
  Layers,
  Flame,
  Loader2,
  MoreVertical,
  Dumbbell,
} from 'lucide-react';
import type { DbRoutine } from '@/lib/types/workout';
import { deleteRoutineAction, duplicateRoutineAction } from '@/app/workout/actions';

interface RoutineCardProps {
  routine: DbRoutine;
  isOwner: boolean;
}

export function RoutineCard({ routine, isOwner }: RoutineCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  const exercises = routine.routine_exercises || [];
  const isTemplate = routine.is_system || routine.user_id === null;

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete "${routine.name}"?`)) return;

    setIsDeleting(true);
    try {
      const res = await deleteRoutineAction(routine.id);
      if (res.success) {
        router.refresh();
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

  const handleDuplicate = async (e: React.MouseEvent) => {
    e.stopPropagation();
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
    <div className="rounded-2xl sm:rounded-3xl bg-surface/90 border border-border/80 hover:border-accent/40 shadow-lg p-5 sm:p-6 transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Header & Badges */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {isTemplate ? (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30 font-semibold">
                  Starter Template
                </span>
              ) : (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 font-semibold">
                  Custom
                </span>
              )}
            </div>
            <Link
              href={`/routines/${routine.id}`}
              className="text-base sm:text-lg font-bold text-text-primary hover:text-accent transition-colors block truncate"
            >
              {routine.name}
            </Link>
          </div>

          {/* Quick Actions Menu */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Duplicate */}
            <button
              type="button"
              onClick={handleDuplicate}
              disabled={isDuplicating}
              className="p-1.5 rounded-lg text-text-subtle hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
              title="Duplicate Routine"
            >
              {isDuplicating ? (
                <Loader2 className="w-4 h-4 animate-spin text-accent" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>

            {/* Edit (only if user owned) */}
            {isOwner && (
              <Link
                href={`/routines/${routine.id}/edit`}
                className="p-1.5 rounded-lg text-text-subtle hover:text-text-primary hover:bg-surface-hover transition-colors"
                title="Edit Routine"
              >
                <Pencil className="w-4 h-4" />
              </Link>
            )}

            {/* Delete (only if user owned) */}
            {isOwner && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-1.5 rounded-lg text-text-subtle hover:text-danger hover:bg-danger-bg/20 transition-colors cursor-pointer"
                title="Delete Routine"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-danger" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Routine Notes */}
        {routine.notes && (
          <p className="text-xs text-text-muted line-clamp-2 leading-relaxed mb-3">
            {routine.notes}
          </p>
        )}

        {/* Exercises preview */}
        <div className="space-y-1.5 my-3">
          <span className="text-[10px] text-text-subtle uppercase tracking-wider font-semibold block">
            Exercises ({exercises.length}):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {exercises.slice(0, 4).map((re) => {
              const setsCount = re.routine_sets?.length || 3;
              return (
                <span
                  key={re.id}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-surface-raised border border-border/70 text-text-primary capitalize font-medium"
                >
                  {re.exercise?.name || 'Exercise'} • {setsCount} sets
                </span>
              );
            })}
            {exercises.length > 4 && (
              <span className="text-[11px] px-2 py-1 rounded-lg bg-surface-raised/50 border border-border/50 text-text-subtle font-mono">
                +{exercises.length - 4} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer: Duration estimate + Start Workout */}
      <div className="pt-3.5 mt-2 border-t border-border/60 flex items-center justify-between gap-3">
        <span className="text-xs text-text-subtle flex items-center gap-1 font-mono">
          <Flame className="w-3.5 h-3.5 text-accent" />
          ~{Math.max(20, exercises.length * 10)} mins
        </span>

        <button
          type="button"
          onClick={() => router.push(`/workout/active?routine=${routine.id}`)}
          className="min-h-[38px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs active:scale-[0.98] transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Start Workout</span>
        </button>
      </div>
    </div>
  );
}
