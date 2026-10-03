'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Clock,
  Dumbbell,
  CheckCircle2,
  Trophy,
  Trash2,
  Pencil,
  Eye,
  Loader2,
  ChevronRight,
  Flame,
} from 'lucide-react';
import type { WorkoutSummary } from '@/lib/types/workout';
import { deleteWorkoutAction } from '@/app/workout/actions';
import { formatWorkoutCardDate } from '@/lib/date-format';

interface WorkoutCardProps {
  workout: WorkoutSummary;
}

export function WorkoutCard({ workout }: WorkoutCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const formatDuration = (secs: number) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  const formattedDate = formatWorkoutCardDate(workout.started_at);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete "${workout.name}"?`)) return;

    setIsDeleting(true);
    try {
      const res = await deleteWorkoutAction(workout.id);
      if (res.success) {
        router.refresh();
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

  return (
    <div className="rounded-2xl sm:rounded-3xl bg-surface/90 border border-border/80 hover:border-accent/40 shadow-lg p-5 sm:p-6 transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span suppressHydrationWarning className="text-[11px] font-mono text-text-subtle flex items-center gap-1">
                <Calendar className="w-3 h-3 text-accent" />
                {formattedDate}
              </span>
              {workout.routine_name && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 truncate max-w-[140px]">
                  {workout.routine_name}
                </span>
              )}
            </div>

            <Link
              href={`/workout/${workout.id}`}
              className="text-base sm:text-lg font-bold text-text-primary hover:text-accent transition-colors block truncate"
            >
              {workout.name}
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <Link
              href={`/workout/${workout.id}/edit`}
              className="p-1.5 rounded-lg text-text-subtle hover:text-text-primary hover:bg-surface-hover transition-colors"
              title="Edit Workout"
            >
              <Pencil className="w-4 h-4" />
            </Link>

            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-1.5 rounded-lg text-text-subtle hover:text-danger hover:bg-danger-bg/20 transition-colors cursor-pointer"
              title="Delete Workout"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin text-danger" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 py-2.5 my-2 border-y border-border/60">
          <div className="text-center">
            <div className="text-[10px] uppercase font-mono text-text-subtle font-semibold">Time</div>
            <div className="text-xs sm:text-sm font-bold font-mono text-text-primary mt-0.5">
              {formatDuration(workout.duration_seconds)}
            </div>
          </div>

          <div className="text-center">
            <div className="text-[10px] uppercase font-mono text-text-subtle font-semibold">Volume</div>
            <div className="text-xs sm:text-sm font-bold font-mono text-text-primary mt-0.5">
              {workout.total_volume_kg.toLocaleString()} <span className="text-[10px] text-text-subtle">kg</span>
            </div>
          </div>

          <div className="text-center">
            <div className="text-[10px] uppercase font-mono text-text-subtle font-semibold">Sets</div>
            <div className="text-xs sm:text-sm font-bold font-mono text-text-primary mt-0.5">
              {workout.completed_sets_count}
            </div>
          </div>
        </div>

        {/* Notes preview */}
        {workout.notes && (
          <p className="text-xs text-text-muted line-clamp-1 italic mt-2">
            &ldquo;{workout.notes}&rdquo;
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="pt-3 mt-1 flex items-center justify-between">
        <span className="text-xs text-text-subtle">
          {workout.exercise_count} {workout.exercise_count === 1 ? 'Exercise' : 'Exercises'}
        </span>

        <Link
          href={`/workout/${workout.id}`}
          className="text-xs font-bold text-accent hover:text-accent-hover flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
        >
          <span>View Details</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
