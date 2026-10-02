'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Trophy,
  Clock,
  Dumbbell,
  CheckCircle2,
  BookmarkPlus,
  ArrowRight,
  Flame,
  Sparkles,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { createRoutineFromWorkoutAction, saveRoutineAction } from '@/app/workout/actions';
import type { WorkoutDetailStatPR, SaveRoutinePayload } from '@/lib/types/workout';

interface WorkoutCelebrationModalProps {
  workoutId: string;
  workoutName: string;
  durationSeconds: number;
  totalVolumeKg: number;
  completedSetsCount: number;
  prs?: WorkoutDetailStatPR[];
  routineId?: string | null;
  exercisesForRoutineUpdate?: {
    exercise_id: string;
    position: number;
    superset_group: number | null;
    notes: string | null;
    sets: {
      set_number: number;
      set_type: any;
      reps: number | null;
      weight_kg: number | null;
    }[];
  }[];
  onClose?: () => void;
}

export function WorkoutCelebrationModal({
  workoutId,
  workoutName,
  durationSeconds,
  totalVolumeKg,
  completedSetsCount,
  prs = [],
  routineId,
  exercisesForRoutineUpdate,
}: WorkoutCelebrationModalProps) {
  const router = useRouter();
  const [isSavingRoutine, setIsSavingRoutine] = useState(false);
  const [isUpdatingRoutine, setIsUpdatingRoutine] = useState(false);
  const [savedRoutineMessage, setSavedRoutineMessage] = useState<string | null>(null);

  const formatDuration = (secs: number) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (hrs > 0) return `${hrs}h ${mins}m ${s}s`;
    return `${mins}m ${s}s`;
  };

  const handleSaveAsRoutine = async () => {
    setIsSavingRoutine(true);
    try {
      const res = await createRoutineFromWorkoutAction(workoutId);
      if (res.success && res.data) {
        const routineId = res.data.routineId;
        setSavedRoutineMessage('Saved as new routine template!');
        setTimeout(() => {
          router.push(`/routines/${routineId}`);
        }, 1200);
      } else {
        alert(res.error || 'Failed to save routine');
      }
    } catch (err) {
      console.error(err);
      alert('Error creating routine');
    } finally {
      setIsSavingRoutine(false);
    }
  };

  const handleUpdateRoutine = async () => {
    if (!routineId || !exercisesForRoutineUpdate) return;
    setIsUpdatingRoutine(true);
    try {
      const payload: SaveRoutinePayload = {
        id: routineId,
        name: workoutName,
        exercises: exercisesForRoutineUpdate.map((ex) => ({
          exercise_id: ex.exercise_id,
          position: ex.position,
          superset_group: ex.superset_group,
          notes: ex.notes,
          sets: ex.sets.map((s) => ({
            set_number: s.set_number,
            set_type: s.set_type,
            target_reps_min: s.reps,
            target_reps_max: s.reps,
            target_weight_kg: s.weight_kg,
            rest_sec: 90,
          })),
        })),
      };

      const res = await saveRoutineAction(payload);
      if (res.success) {
        setSavedRoutineMessage('Routine successfully updated with these sets!');
      } else {
        alert(res.error || 'Failed to update routine');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating routine');
    } finally {
      setIsUpdatingRoutine(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-surface border border-border rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-250">
        {/* Celebration Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center animate-bounce duration-1000">
            <Trophy className="w-8 h-8 stroke-[2.2]" />
          </div>
          <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-accent bg-accent/15 px-3 py-1 rounded-full border border-accent/30 inline-block mb-1.5">
            Workout Completed
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">
            Great Session!
          </h2>
          <p className="text-xs text-text-muted mt-0.5">{workoutName}</p>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          <div className="p-3 rounded-2xl bg-surface-raised border border-border/80 text-center">
            <Clock className="w-4 h-4 text-accent mx-auto mb-1 opacity-90" />
            <div className="text-xs text-text-subtle font-medium">Duration</div>
            <div className="text-xs sm:text-sm font-bold font-mono text-text-primary mt-0.5">
              {formatDuration(durationSeconds)}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-surface-raised border border-border/80 text-center">
            <Dumbbell className="w-4 h-4 text-blue-400 mx-auto mb-1 opacity-90" />
            <div className="text-xs text-text-subtle font-medium">Volume</div>
            <div className="text-xs sm:text-sm font-bold font-mono text-text-primary mt-0.5">
              {totalVolumeKg.toLocaleString()} <span className="text-[10px] text-text-subtle">kg</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-surface-raised border border-border/80 text-center">
            <CheckCircle2 className="w-4 h-4 text-warning mx-auto mb-1 opacity-90" />
            <div className="text-xs text-text-subtle font-medium">Sets</div>
            <div className="text-xs sm:text-sm font-bold font-mono text-text-primary mt-0.5">
              {completedSetsCount}
            </div>
          </div>
        </div>

        {/* PR Highlights if any */}
        {prs.length > 0 && (
          <div className="mb-5 p-3.5 rounded-2xl bg-accent/10 border border-accent/30">
            <div className="flex items-center gap-1.5 text-xs font-bold text-accent mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personal Records Set ({prs.length})</span>
            </div>
            <div className="space-y-1">
              {prs.map((pr, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs font-medium text-text-primary"
                >
                  <span className="truncate">{pr.exerciseName}</span>
                  <span className="font-mono text-accent font-bold shrink-0 ml-2">
                    {pr.weightKg} kg × {pr.reps} (1RM ~{pr.est1rmKg} kg)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status Toast */}
        {savedRoutineMessage && (
          <div className="mb-4 p-2.5 rounded-xl bg-accent/15 border border-accent/40 text-accent text-xs font-semibold text-center animate-in fade-in">
            {savedRoutineMessage}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2.5">
          {/* Option: Update routine from this workout */}
          {routineId && exercisesForRoutineUpdate && (
            <button
              type="button"
              disabled={isUpdatingRoutine || !!savedRoutineMessage}
              onClick={handleUpdateRoutine}
              className="w-full min-h-[42px] px-4 rounded-xl bg-surface-raised border border-border/80 hover:border-accent/40 text-text-primary font-bold text-xs flex items-center justify-center gap-2 hover:bg-surface-hover active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
            >
              {isUpdatingRoutine ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5 text-accent" />
              )}
              <span>Update Routine With Today&apos;s Sets</span>
            </button>
          )}

          {/* Option: Save as new routine */}
          <button
            type="button"
            disabled={isSavingRoutine || !!savedRoutineMessage}
            onClick={handleSaveAsRoutine}
            className="w-full min-h-[42px] px-4 rounded-xl bg-surface-raised border border-border/80 hover:border-blue-500/50 text-text-primary font-bold text-xs flex items-center justify-center gap-2 hover:bg-surface-hover active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
          >
            {isSavingRoutine ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <BookmarkPlus className="w-3.5 h-3.5 text-blue-400" />
            )}
            <span>Save Workout as Routine Template</span>
          </button>

          {/* Done / Return to Dashboard */}
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="w-full min-h-[46px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm active:scale-[0.99] transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Return to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
