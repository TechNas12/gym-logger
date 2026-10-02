'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Timer,
  Check,
  Plus,
  Trash2,
  Dumbbell,
  X,
  Trophy,
  Loader2,
  Info,
} from 'lucide-react';
import type { DbExercise, ActiveWorkoutExercise, ActiveWorkoutSet } from '@/lib/types/workout';
import { ExercisePickerModal } from './exercise-picker-modal';
import {
  finishWorkoutSessionAction,
  cancelWorkoutSessionAction,
} from '@/app/workout/actions';

interface ActiveWorkoutTrackerProps {
  initialSessionId: string;
  initialName?: string;
  initialExercises?: ActiveWorkoutExercise[];
}

export function ActiveWorkoutTracker({
  initialSessionId,
  initialName = 'Quick Workout',
  initialExercises = [],
}: ActiveWorkoutTrackerProps) {
  const router = useRouter();

  // Workout state
  const [workoutName, setWorkoutName] = useState(initialName);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [exercises, setExercises] = useState<ActiveWorkoutExercise[]>(initialExercises);

  // Time elapsed state
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Smart Rest Timer state
  const [restSecondsRemaining, setRestSecondsRemaining] = useState<number | null>(null);
  const [isRestTimerActive, setIsRestTimerActive] = useState(false);

  // Modals & UI states
  const [isExercisePickerOpen, setIsExercisePickerOpen] = useState(false);
  const [isFinishPending, setIsFinishPending] = useState(false);
  const [isDiscardPending, setIsDiscardPending] = useState(false);
  const [completedSummary, setCompletedSummary] = useState<{
    durationSeconds: number;
    totalVolumeKg: number;
    totalSetsCompleted: number;
  } | null>(null);

  // Selected exercise for detail preview
  const [inspectExercise, setInspectExercise] = useState<DbExercise | null>(null);

  // 1. Elapsed Time Ticker
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  // 2. Rest Timer Countdown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRestTimerActive && restSecondsRemaining !== null && restSecondsRemaining > 0) {
      interval = setInterval(() => {
        setRestSecondsRemaining((prev) => {
          if (prev === null || prev <= 1) {
            setIsRestTimerActive(false);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRestTimerActive, restSecondsRemaining]);

  // Format seconds to HH:MM:SS or MM:SS
  const formatTime = (secs: number) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (hrs > 0) {
      return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  // Trigger Rest Timer (default 90s)
  const triggerRestTimer = (durationSeconds = 90) => {
    setRestSecondsRemaining(durationSeconds);
    setIsRestTimerActive(true);
  };

  // Add exercise to active session
  const handleAddExercise = (exercise: DbExercise) => {
    setExercises((prev) => {
      const alreadyExists = prev.some((e) => e.exerciseId === exercise.id);
      if (alreadyExists) return prev;

      return [
        ...prev,
        {
          exerciseId: exercise.id,
          exercise,
          sets: [
            { setNumber: 1, weightKg: 0, reps: 10, isCompleted: false },
            { setNumber: 2, weightKg: 0, reps: 10, isCompleted: false },
            { setNumber: 3, weightKg: 0, reps: 10, isCompleted: false },
          ],
        },
      ];
    });
  };

  // Remove exercise
  const handleRemoveExercise = (exerciseId: string) => {
    setExercises((prev) => prev.filter((e) => e.exerciseId !== exerciseId));
  };

  // Add a set to an exercise
  const handleAddSet = (exerciseId: string) => {
    setExercises((prev) =>
      prev.map((item) => {
        if (item.exerciseId !== exerciseId) return item;
        const lastSet = item.sets[item.sets.length - 1];
        const nextSetNum = item.sets.length + 1;
        const newSet: ActiveWorkoutSet = {
          setNumber: nextSetNum,
          weightKg: lastSet ? lastSet.weightKg : 0,
          reps: lastSet ? lastSet.reps : 10,
          isCompleted: false,
        };
        return {
          ...item,
          sets: [...item.sets, newSet],
        };
      })
    );
  };

  // Remove set
  const handleRemoveSet = (exerciseId: string, setNumber: number) => {
    setExercises((prev) =>
      prev.map((item) => {
        if (item.exerciseId !== exerciseId) return item;
        const filtered = item.sets.filter((s) => s.setNumber !== setNumber);
        // re-index set numbers
        const reindexed = filtered.map((s, idx) => ({ ...s, setNumber: idx + 1 }));
        return { ...item, sets: reindexed };
      })
    );
  };

  // Update set details (weight, reps)
  const handleUpdateSet = (
    exerciseId: string,
    setNumber: number,
    fields: Partial<ActiveWorkoutSet>
  ) => {
    setExercises((prev) =>
      prev.map((item) => {
        if (item.exerciseId !== exerciseId) return item;
        return {
          ...item,
          sets: item.sets.map((s) =>
            s.setNumber === setNumber ? { ...s, ...fields } : s
          ),
        };
      })
    );
  };

  // Toggle set completion
  const handleToggleSetComplete = (exerciseId: string, setNumber: number) => {
    setExercises((prev) =>
      prev.map((item) => {
        if (item.exerciseId !== exerciseId) return item;
        return {
          ...item,
          sets: item.sets.map((s) => {
            if (s.setNumber === setNumber) {
              const nextState = !s.isCompleted;
              // If completing set, trigger rest timer!
              if (nextState) {
                triggerRestTimer(90);
              }
              return { ...s, isCompleted: nextState };
            }
            return s;
          }),
        };
      })
    );
  };

  // Compute Volume & Sets
  const totalVolumeKg = exercises.reduce((acc, ex) => {
    return (
      acc +
      ex.sets.reduce((setAcc, s) => {
        return setAcc + (s.isCompleted ? s.weightKg * s.reps : 0);
      }, 0)
    );
  }, 0);

  const totalSetsCompleted = exercises.reduce((acc, ex) => {
    return acc + ex.sets.filter((s) => s.isCompleted).length;
  }, 0);

  // Finish Workout
  const handleFinishWorkout = async () => {
    if (exercises.length === 0) {
      alert('Please add at least one exercise before completing the workout.');
      return;
    }

    setIsFinishPending(true);
    setIsTimerRunning(false);

    try {
      const res = await finishWorkoutSessionAction({
        sessionId: initialSessionId,
        name: workoutName,
        durationSeconds: secondsElapsed,
        totalVolumeKg: Math.round(totalVolumeKg),
        exercises: exercises.map((e) => ({
          exerciseId: e.exerciseId,
          sets: e.sets,
        })),
      });

      if (res.success) {
        localStorage.removeItem('gymlogger_active_workout');
        setCompletedSummary({
          durationSeconds: secondsElapsed,
          totalVolumeKg: Math.round(totalVolumeKg),
          totalSetsCompleted,
        });
      }
    } catch (err) {
      console.error('Failed to finish workout:', err);
      setIsTimerRunning(true);
    } finally {
      setIsFinishPending(false);
    }
  };

  // Discard / Cancel Workout
  const handleDiscardWorkout = async () => {
    if (confirm('Are you sure you want to discard this workout session? Your logged sets will be lost.')) {
      setIsDiscardPending(true);
      try {
        await cancelWorkoutSessionAction(initialSessionId);
        localStorage.removeItem('gymlogger_active_workout');
        router.push('/dashboard');
      } catch (err) {
        console.error('Failed to cancel workout:', err);
      } finally {
        setIsDiscardPending(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary selection:bg-accent/30 selection:text-text-primary pb-28">
      {/* 1. STICKY TOP BAR (Optimized for Mobile Gym Tracking) */}
      <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur-xl border-b border-border/80 px-4 py-3 sm:px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          {/* Left: Back / Discard */}
          <button
            type="button"
            onClick={handleDiscardWorkout}
            disabled={isDiscardPending}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-text-muted hover:text-danger hover:bg-danger-bg/20 transition-colors cursor-pointer"
            title="Discard workout"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Discard</span>
          </button>

          {/* Center: Live Timer Badge */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent font-mono font-bold text-xs sm:text-sm shadow-sm">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span>{formatTime(secondsElapsed)}</span>
            </div>
          </div>

          {/* Right: Finish Button */}
          <button
            type="button"
            onClick={handleFinishWorkout}
            disabled={isFinishPending || isDiscardPending}
            className="min-h-[40px] px-4 rounded-xl bg-accent text-accent-foreground font-bold text-xs sm:text-sm hover:bg-accent-hover active:scale-[0.98] disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-[0_0_20px_rgba(34,197,94,0.35)] cursor-pointer"
          >
            {isFinishPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Finish</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* 2. FLOATING REST TIMER PILL (when active) */}
      {isRestTimerActive && restSecondsRemaining !== null && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-40 animate-in slide-in-from-bottom duration-200">
          <div className="p-3 sm:p-3.5 rounded-2xl bg-surface border border-accent/40 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-4 max-w-sm ml-auto">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-accent/20 text-accent flex items-center justify-center font-mono font-bold text-xs animate-pulse">
                <Timer className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-text-subtle uppercase tracking-wider block font-semibold">
                  Rest Timer
                </span>
                <span className="text-sm font-black font-mono text-accent">
                  {formatTime(restSecondsRemaining)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setRestSecondsRemaining((prev) => (prev || 0) + 30)}
                className="px-2.5 py-1 rounded-lg bg-surface-raised border border-border/80 text-[11px] font-semibold text-text-primary hover:bg-surface-hover"
              >
                +30s
              </button>
              <button
                type="button"
                onClick={() => setIsRestTimerActive(false)}
                className="p-1 rounded-lg text-text-subtle hover:text-text-primary"
                aria-label="Skip rest timer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. MAIN WORKOUT CONTAINER */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-5 space-y-5">
        {/* Workout Title & Quick Stats */}
        <div className="p-4 sm:p-5 rounded-3xl bg-surface/90 border border-border/80 shadow-md">
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                autoFocus
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                className="text-lg sm:text-xl font-extrabold bg-surface-raised border border-accent rounded-xl px-3 py-1.5 text-text-primary w-full"
              />
              <button
                type="button"
                onClick={() => setIsEditingTitle(false)}
                className="px-3 py-1.5 rounded-xl bg-accent text-accent-foreground text-xs font-bold"
              >
                Save
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <h1
                onClick={() => setIsEditingTitle(true)}
                className="text-xl sm:text-2xl font-extrabold tracking-tight text-text-primary cursor-pointer hover:text-accent transition-colors flex items-center gap-2"
                title="Tap to rename workout"
              >
                <span>{workoutName}</span>
                <span className="text-xs text-text-subtle font-normal font-mono">(tap to edit)</span>
              </h1>
            </div>
          )}

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 mt-4 text-center">
            <div className="p-2.5 rounded-xl bg-surface-raised border border-border/60">
              <span className="text-[10px] text-text-subtle uppercase tracking-wider block font-semibold">
                Duration
              </span>
              <span className="font-mono font-bold text-xs sm:text-sm text-text-primary">
                {formatTime(secondsElapsed)}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-surface-raised border border-border/60">
              <span className="text-[10px] text-text-subtle uppercase tracking-wider block font-semibold">
                Total Volume
              </span>
              <span className="font-mono font-bold text-xs sm:text-sm text-accent">
                {Math.round(totalVolumeKg).toLocaleString()} kg
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-surface-raised border border-border/60">
              <span className="text-[10px] text-text-subtle uppercase tracking-wider block font-semibold">
                Sets Done
              </span>
              <span className="font-mono font-bold text-xs sm:text-sm text-text-primary">
                {totalSetsCompleted}
              </span>
            </div>
          </div>
        </div>

        {/* 4. EXERCISES LIST */}
        <div className="space-y-4">
          {exercises.length === 0 ? (
            <div className="p-8 sm:p-12 text-center rounded-3xl bg-surface-raised/60 border border-dashed border-border/80 flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-2xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center mb-3">
                <Dumbbell className="w-7 h-7 stroke-[1.8]" />
              </div>
              <h3 className="text-base font-bold text-text-primary">
                No exercises added yet
              </h3>
              <p className="text-xs text-text-muted mt-1 max-w-xs">
                Tap the button below to search and add exercises from the 1,300+ database!
              </p>
              <button
                type="button"
                onClick={() => setIsExercisePickerOpen(true)}
                className="mt-5 min-h-[44px] px-5 rounded-xl bg-accent text-accent-foreground font-bold text-xs sm:text-sm hover:bg-accent-hover transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Add First Exercise</span>
              </button>
            </div>
          ) : (
            exercises.map((item, exIdx) => {
              const ex = item.exercise;

              return (
                <div
                  key={item.exerciseId}
                  className="rounded-3xl bg-surface/90 border border-border/90 shadow-md p-4 sm:p-5 overflow-hidden"
                >
                  {/* Exercise Header */}
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-border/60">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-surface-raised border border-border flex items-center justify-center text-xs font-mono font-bold text-text-subtle">
                        {exIdx + 1}
                      </span>
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-text-primary capitalize">
                          {ex.name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-[11px] text-text-subtle mt-0.5">
                          <span className="capitalize">{ex.target || ex.body_part}</span>
                          <span>•</span>
                          <span className="capitalize">{ex.equipment || 'Gym'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setInspectExercise(ex)}
                        className="p-1.5 rounded-lg text-text-subtle hover:text-text-primary transition-colors cursor-pointer"
                        title="Exercise info"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveExercise(item.exerciseId)}
                        className="p-1.5 rounded-lg text-text-subtle hover:text-danger hover:bg-danger-bg/20 transition-colors cursor-pointer"
                        title="Remove exercise"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Sets Table */}
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="text-[10px] text-text-subtle uppercase tracking-wider border-b border-border/40">
                          <th className="pb-2 w-12 text-center">Set</th>
                          <th className="pb-2">Weight (kg)</th>
                          <th className="pb-2">Reps</th>
                          <th className="pb-2 w-12 text-center">Done</th>
                          <th className="pb-2 w-8"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {item.sets.map((s) => (
                          <tr
                            key={s.setNumber}
                            className={`transition-colors ${
                              s.isCompleted ? 'bg-accent/5' : 'hover:bg-surface-raised/40'
                            }`}
                          >
                            {/* Set # */}
                            <td className="py-2.5 text-center font-mono font-bold text-text-subtle text-xs">
                              {s.setNumber}
                            </td>

                            {/* Weight (kg) Input */}
                            <td className="py-2 pr-2">
                              <input
                                type="number"
                                step="0.5"
                                min="0"
                                value={s.weightKg === 0 ? '' : s.weightKg}
                                onChange={(e) =>
                                  handleUpdateSet(item.exerciseId, s.setNumber, {
                                    weightKg: parseFloat(e.target.value) || 0,
                                  })
                                }
                                placeholder="0"
                                className="w-20 sm:w-24 px-2.5 py-1.5 rounded-xl bg-surface-raised border border-border/80 text-text-primary font-mono font-bold text-xs sm:text-sm text-center focus-ring min-h-[38px]"
                              />
                            </td>

                            {/* Reps Input */}
                            <td className="py-2 pr-2">
                              <input
                                type="number"
                                min="0"
                                value={s.reps === 0 ? '' : s.reps}
                                onChange={(e) =>
                                  handleUpdateSet(item.exerciseId, s.setNumber, {
                                    reps: parseInt(e.target.value, 10) || 0,
                                  })
                                }
                                placeholder="10"
                                className="w-16 sm:w-20 px-2.5 py-1.5 rounded-xl bg-surface-raised border border-border/80 text-text-primary font-mono font-bold text-xs sm:text-sm text-center focus-ring min-h-[38px]"
                              />
                            </td>

                            {/* Complete Checkmark Button */}
                            <td className="py-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleToggleSetComplete(item.exerciseId, s.setNumber)}
                                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                                  s.isCompleted
                                    ? 'bg-accent text-accent-foreground shadow-[0_0_15px_rgba(34,197,94,0.4)]'
                                    : 'bg-surface-raised border border-border/80 text-text-subtle hover:border-accent/40'
                                }`}
                                aria-label={`Toggle completion of set ${s.setNumber}`}
                              >
                                <Check className={`w-4 h-4 ${s.isCompleted ? 'stroke-[3]' : 'opacity-40'}`} />
                              </button>
                            </td>

                            {/* Remove Set Button */}
                            <td className="py-2 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveSet(item.exerciseId, s.setNumber)}
                                className="p-1 text-text-subtle hover:text-danger opacity-50 hover:opacity-100 transition-opacity"
                                aria-label="Remove set"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Add Set Button */}
                  <div className="mt-3 pt-2 flex justify-start">
                    <button
                      type="button"
                      onClick={() => handleAddSet(item.exerciseId)}
                      className="px-3 py-1.5 rounded-xl bg-surface-raised border border-border/80 hover:bg-surface-hover text-text-primary text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer min-h-[36px]"
                    >
                      <Plus className="w-3.5 h-3.5 text-accent" />
                      <span>Add Set</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 5. ADD EXERCISE BUTTON */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setIsExercisePickerOpen(true)}
            className="w-full min-h-[50px] rounded-2xl bg-surface-raised border border-dashed border-border/90 hover:border-accent/60 hover:bg-surface-hover text-text-primary font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-lg bg-accent/15 text-accent flex items-center justify-center group-hover:scale-105 transition-transform">
              <Plus className="w-4 h-4 stroke-[3]" />
            </div>
            <span>Add Exercise</span>
          </button>
        </div>
      </main>

      {/* Exercise Picker Modal */}
      <ExercisePickerModal
        isOpen={isExercisePickerOpen}
        onClose={() => setIsExercisePickerOpen(false)}
        onSelectExercise={handleAddExercise}
        alreadySelectedIds={exercises.map((e) => e.exerciseId)}
      />

      {/* Exercise Info Modal */}
      {inspectExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-surface border border-border/90 rounded-3xl p-5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <h3 className="font-bold text-text-primary capitalize">{inspectExercise.name}</h3>
              <button
                type="button"
                onClick={() => setInspectExercise(null)}
                className="p-1 rounded-lg text-text-subtle hover:text-text-primary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {inspectExercise.gif_url && (
              <div className="my-3 rounded-2xl overflow-hidden bg-black flex justify-center max-h-48 border border-border/70">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={inspectExercise.gif_url}
                  alt={inspectExercise.name}
                  className="object-contain max-h-48"
                />
              </div>
            )}

            {inspectExercise.instructions && (
              <p className="text-xs text-text-muted mt-2 leading-relaxed">
                {inspectExercise.instructions}
              </p>
            )}

            <button
              type="button"
              onClick={() => setInspectExercise(null)}
              className="mt-4 w-full py-2.5 rounded-xl bg-accent text-accent-foreground font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* 6. WORKOUT COMPLETED CELEBRATION MODAL */}
      {completedSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-md animate-in zoom-in-95 duration-250">
          <div className="w-full max-w-md bg-surface border border-accent/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-center relative overflow-hidden">
            {/* Subtle glow accent */}
            <div
              className="absolute -top-12 -left-12 w-48 h-48 bg-accent/20 rounded-full blur-3xl pointer-events-none"
              aria-hidden="true"
            />

            <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-accent/20 border border-accent/40 text-accent mb-4 shadow-[0_0_30px_rgba(34,197,94,0.35)]">
              <Trophy className="w-8 h-8 stroke-[2]" />
            </div>

            <h2 className="text-2xl font-extrabold text-text-primary tracking-tight">
              Workout Crushed!
            </h2>
            <p className="text-xs sm:text-sm text-text-muted mt-1">
              Outstanding work. Your workout has been saved to your training history.
            </p>

            <div className="grid grid-cols-3 gap-2.5 my-6 text-center">
              <div className="p-3 rounded-2xl bg-surface-raised border border-border/70">
                <span className="text-[10px] text-text-subtle uppercase tracking-wider block font-semibold">
                  Time
                </span>
                <span className="font-mono font-bold text-sm sm:text-base text-text-primary">
                  {formatTime(completedSummary.durationSeconds)}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-surface-raised border border-border/70">
                <span className="text-[10px] text-text-subtle uppercase tracking-wider block font-semibold">
                  Volume
                </span>
                <span className="font-mono font-bold text-sm sm:text-base text-accent">
                  {completedSummary.totalVolumeKg.toLocaleString()} kg
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-surface-raised border border-border/70">
                <span className="text-[10px] text-text-subtle uppercase tracking-wider block font-semibold">
                  Sets Done
                </span>
                <span className="font-mono font-bold text-sm sm:text-base text-text-primary">
                  {completedSummary.totalSetsCompleted}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="w-full min-h-[46px] rounded-xl bg-accent text-accent-foreground font-bold text-sm hover:bg-accent-hover transition-all shadow-[0_0_20px_rgba(34,197,94,0.35)] cursor-pointer"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
