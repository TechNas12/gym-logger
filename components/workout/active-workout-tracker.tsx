'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  Timer,
  Plus,
  X,
  Loader2,
  Play,
  RotateCcw,
  CheckCircle2,
  Dumbbell,
  AlertCircle,
  Clock,
  Sparkles,
  Layers,
} from 'lucide-react';
import type {
  DbExercise,
  ActiveExercise,
  ActiveSet,
  ActiveWorkoutState,
  SaveWorkoutPayload,
  WorkoutDetailStatPR,
  SetType,
} from '@/lib/types/workout';
import { ExercisePickerModal } from './exercise-picker-modal';
import { SortableExerciseCard } from './sortable-exercise-card';
import { ExerciseDetailModal } from './exercise-detail-modal';
import { WorkoutCelebrationModal } from './workout-celebration-modal';
import {
  saveWorkoutAction,
  discardWorkoutAction,
  getLastPerformanceAction,
} from '@/app/workout/actions';

interface ActiveWorkoutTrackerProps {
  initialWorkoutState?: ActiveWorkoutState;
}

const STORAGE_KEY = 'gymlogger_active_workout_v2';

export function ActiveWorkoutTracker({
  initialWorkoutState,
}: ActiveWorkoutTrackerProps) {
  const router = useRouter();

  // State
  const [workoutId, setWorkoutId] = useState<string | null>(
    initialWorkoutState?.workoutId || null
  );
  const [routineId, setRoutineId] = useState<string | null>(
    initialWorkoutState?.routineId || null
  );
  const [name, setName] = useState<string>(
    initialWorkoutState?.name || 'Quick Workout'
  );
  const [notes, setNotes] = useState<string>(initialWorkoutState?.notes || '');
  const [startedAt, setStartedAt] = useState<string>(
    initialWorkoutState?.startedAt || new Date().toISOString()
  );
  const [exercises, setExercises] = useState<ActiveExercise[]>(
    initialWorkoutState?.exercises || []
  );

  // Time & Timer
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Rest Timer (default 90s)
  const [restSecondsRemaining, setRestSecondsRemaining] = useState<number | null>(null);
  const [isRestTimerActive, setIsRestTimerActive] = useState(false);

  // Modals & Pending states
  const [isExercisePickerOpen, setIsExercisePickerOpen] = useState(false);
  const [inspectExercise, setInspectExercise] = useState<DbExercise | null>(null);
  const [isFinishPending, setIsFinishPending] = useState(false);
  const [isDiscardPending, setIsDiscardPending] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [completedWorkoutId, setCompletedWorkoutId] = useState<string | null>(null);
  const [summaryStats, setSummaryStats] = useState<{
    duration: number;
    volume: number;
    completedSets: number;
    prs: WorkoutDetailStatPR[];
  }>({ duration: 0, volume: 0, completedSets: 0, prs: [] });

  // dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 1. Elapsed timer
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

  // 2. Rest timer
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

  // 3. Restore draft from sessionStorage if not provided via initial props
  useEffect(() => {
    if (initialWorkoutState && initialWorkoutState.exercises.length > 0) {
      return;
    }

    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: ActiveWorkoutState = JSON.parse(saved);
        if (parsed.exercises && parsed.exercises.length > 0) {
          setName(parsed.name || 'Quick Workout');
          setNotes(parsed.notes || '');
          setRoutineId(parsed.routineId || null);
          setWorkoutId(parsed.workoutId || null);
          setStartedAt(parsed.startedAt || new Date().toISOString());
          setExercises(parsed.exercises);

          // Calculate elapsed seconds from startedAt
          const start = new Date(parsed.startedAt).getTime();
          const now = Date.now();
          if (!isNaN(start)) {
            setSecondsElapsed(Math.max(0, Math.floor((now - start) / 1000)));
          }
        }
      }
    } catch (e) {
      console.warn('Failed to parse sessionStorage workout draft:', e);
    }
  }, [initialWorkoutState]);

  // 4. Debounce-save state to sessionStorage
  useEffect(() => {
    if (exercises.length === 0 && name === 'Quick Workout') return;

    const timer = setTimeout(() => {
      try {
        const state: ActiveWorkoutState = {
          workoutId,
          routineId,
          name,
          startedAt,
          notes,
          exercises,
        };
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (e) {
        console.warn('Failed to save workout draft to sessionStorage:', e);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [workoutId, routineId, name, startedAt, notes, exercises]);

  // 5. Fetch previous performance for exercises
  const fetchPreviousPerformance = useCallback(async (exerciseIds: string[]) => {
    if (exerciseIds.length === 0) return;
    try {
      const res = await getLastPerformanceAction(exerciseIds);
      if (res.success && res.data) {
        const perfMap = res.data;
        setExercises((prev) =>
          prev.map((ex) => {
            const lastSets = perfMap[ex.exerciseId];
            if (!lastSets || lastSets.length === 0) return ex;

            const updatedSets = ex.sets.map((s, idx) => {
              const matchedPrev = lastSets[idx] || lastSets[lastSets.length - 1];
              if (matchedPrev && (matchedPrev.weight_kg !== null || matchedPrev.reps !== null)) {
                return {
                  ...s,
                  previous: `${matchedPrev.weight_kg ?? 0} kg × ${matchedPrev.reps ?? 0}`,
                };
              }
              return s;
            });

            return { ...ex, sets: updatedSets };
          })
        );
      }
    } catch (err) {
      console.error('Failed to fetch previous performance:', err);
    }
  }, []);

  // Format seconds to string
  const formatTime = (secs: number) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (hrs > 0) {
      return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  // Rest timer triggers
  const triggerRestTimer = (seconds = 90) => {
    setRestSecondsRemaining(seconds);
    setIsRestTimerActive(true);
  };

  // Add exercise to active session
  const handleAddExercise = async (exercise: DbExercise) => {
    const newExerciseClientId = crypto.randomUUID();
    const newSets: ActiveSet[] = [
      {
        clientId: crypto.randomUUID(),
        setNumber: 1,
        setType: 'normal',
        weightKg: null,
        reps: 10,
        isCompleted: false,
      },
      {
        clientId: crypto.randomUUID(),
        setNumber: 2,
        setType: 'normal',
        weightKg: null,
        reps: 10,
        isCompleted: false,
      },
      {
        clientId: crypto.randomUUID(),
        setNumber: 3,
        setType: 'normal',
        weightKg: null,
        reps: 10,
        isCompleted: false,
      },
    ];

    const newExercise: ActiveExercise = {
      clientId: newExerciseClientId,
      exerciseId: exercise.id,
      exercise,
      position: exercises.length + 1,
      supersetGroup: null,
      notes: '',
      sets: newSets,
    };

    setExercises((prev) => [...prev, newExercise]);
    setValidationError(null);

    // Fetch previous performance for this exercise
    fetchPreviousPerformance([exercise.id]);
  };

  // Remove exercise
  const handleRemoveExercise = (exerciseClientId: string) => {
    setExercises((prev) =>
      prev
        .filter((e) => e.clientId !== exerciseClientId)
        .map((e, idx) => ({ ...e, position: idx + 1 }))
    );
  };

  // Add a set
  const handleAddSet = (exerciseClientId: string) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.clientId !== exerciseClientId) return ex;
        const lastSet = ex.sets[ex.sets.length - 1];
        const newSet: ActiveSet = {
          clientId: crypto.randomUUID(),
          setNumber: ex.sets.length + 1,
          setType: 'normal',
          weightKg: lastSet?.weightKg ?? null,
          reps: lastSet?.reps ?? 10,
          isCompleted: false,
          previous: lastSet?.previous ?? null,
        };
        return { ...ex, sets: [...ex.sets, newSet] };
      })
    );
  };

  // Remove a set
  const handleRemoveSet = (exerciseClientId: string, setClientId: string) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.clientId !== exerciseClientId) return ex;
        const filtered = ex.sets.filter((s) => s.clientId !== setClientId);
        const reindexed = filtered.map((s, idx) => ({ ...s, setNumber: idx + 1 }));
        return { ...ex, sets: reindexed };
      })
    );
  };

  // Update set fields
  const handleUpdateSet = (
    exerciseClientId: string,
    setClientId: string,
    fields: Partial<ActiveSet>
  ) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.clientId !== exerciseClientId) return ex;
        return {
          ...ex,
          sets: ex.sets.map((s) => (s.clientId === setClientId ? { ...s, ...fields } : s)),
        };
      })
    );
  };

  // Toggle set completion
  const handleToggleComplete = (exerciseClientId: string, setClientId: string) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.clientId !== exerciseClientId) return ex;
        return {
          ...ex,
          sets: ex.sets.map((s) => {
            if (s.clientId === setClientId) {
              const nextState = !s.isCompleted;
              if (nextState) {
                // Trigger 90s rest timer on completing set
                triggerRestTimer(90);
              }
              return {
                ...s,
                isCompleted: nextState,
                completedAt: nextState ? new Date().toISOString() : null,
              };
            }
            return s;
          }),
        };
      })
    );
    setValidationError(null);
  };

  // Update exercise notes
  const handleUpdateNotes = (exerciseClientId: string, newNotes: string) => {
    setExercises((prev) =>
      prev.map((ex) => (ex.clientId === exerciseClientId ? { ...ex, notes: newNotes } : ex))
    );
  };

  // Superset grouping toggle
  const handleToggleSuperset = (exerciseClientId: string) => {
    setExercises((prev) => {
      const targetIndex = prev.findIndex((e) => e.clientId === exerciseClientId);
      if (targetIndex === -1) return prev;

      const target = prev[targetIndex];

      if (target.supersetGroup !== null) {
        // Remove from superset
        return prev.map((e, idx) =>
          idx === targetIndex ? { ...e, supersetGroup: null } : e
        );
      } else {
        // Group with adjacent exercise or assign next group number
        const nextGroupNumber =
          Math.max(0, ...prev.map((e) => e.supersetGroup || 0)) + 1;

        // If next or previous exercise has a superset, join it
        const prevEx = prev[targetIndex - 1];
        const nextEx = prev[targetIndex + 1];
        const targetGroup = prevEx?.supersetGroup || nextEx?.supersetGroup || nextGroupNumber;

        return prev.map((e, idx) => {
          if (idx === targetIndex) {
            return { ...e, supersetGroup: targetGroup };
          }
          if (
            (idx === targetIndex - 1 || idx === targetIndex + 1) &&
            e.supersetGroup === null
          ) {
            return { ...e, supersetGroup: targetGroup };
          }
          return e;
        });
      }
    });
  };

  // Handle Drag Reorder
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setExercises((items) => {
      const oldIndex = items.findIndex((i) => i.clientId === active.id);
      const newIndex = items.findIndex((i) => i.clientId === over.id);
      const reordered = arrayMove(items, oldIndex, newIndex);
      return reordered.map((item, idx) => ({ ...item, position: idx + 1 }));
    });
  };

  // Finish Workout
  const handleFinishWorkout = async () => {
    // 1. Validation: At least one exercise with at least one completed set
    const totalCompletedSets = exercises.reduce(
      (acc, ex) => acc + ex.sets.filter((s) => s.isCompleted).length,
      0
    );

    if (totalCompletedSets === 0) {
      setValidationError('Please complete at least one set before finishing the workout.');
      return;
    }

    setIsFinishPending(true);
    setIsTimerRunning(false);

    try {
      // Calculate Volume (excluding warmup sets)
      let totalVolume = 0;
      const prList: WorkoutDetailStatPR[] = [];

      for (const ex of exercises) {
        for (const s of ex.sets) {
          if (s.isCompleted) {
            if (s.setType !== 'warmup' && s.weightKg && s.reps) {
              totalVolume += s.weightKg * s.reps;
            }
            // Epley 1RM calculation: weight * (1 + reps / 30)
            if (
              ['normal', 'dropset', 'failure'].includes(s.setType) &&
              s.weightKg &&
              s.reps &&
              s.reps <= 30
            ) {
              const est1rm = Math.round(s.weightKg * (1 + s.reps / 30.0) * 10) / 10;
              prList.push({
                exerciseName: ex.exercise.name,
                weightKg: s.weightKg,
                reps: s.reps,
                est1rmKg: est1rm,
              });
            }
          }
        }
      }

      const payload: SaveWorkoutPayload = {
        id: workoutId,
        routine_id: routineId,
        name: name.trim() || 'Workout',
        started_at: startedAt,
        ended_at: new Date().toISOString(),
        notes: notes.trim() || null,
        exercises: exercises.map((ex, exIdx) => ({
          exercise_id: ex.exerciseId,
          position: exIdx + 1,
          superset_group: ex.supersetGroup,
          notes: ex.notes || null,
          sets: ex.sets.map((s, sIdx) => ({
            set_number: sIdx + 1,
            set_type: s.setType,
            reps: s.reps,
            weight_kg: s.weightKg,
            duration_sec: s.durationSec || null,
            distance_m: s.distanceM || null,
            rpe: s.rpe || null,
            is_completed: s.isCompleted,
            completed_at: s.completedAt || (s.isCompleted ? new Date().toISOString() : null),
          })),
        })),
      };

      const res = await saveWorkoutAction(payload);

      if (res.success && res.data) {
        sessionStorage.removeItem(STORAGE_KEY);
        setCompletedWorkoutId(res.data.workoutId);
        setSummaryStats({
          duration: secondsElapsed,
          volume: Math.round(totalVolume),
          completedSets: totalCompletedSets,
          prs: prList.slice(0, 3), // highlight top 3
        });
        setShowCelebration(true);
      } else {
        setValidationError(res.error || 'Failed to save workout');
        setIsTimerRunning(true);
      }
    } catch (err) {
      console.error('Error saving workout:', err);
      setValidationError('Unexpected error saving workout. Please try again.');
      setIsTimerRunning(true);
    } finally {
      setIsFinishPending(false);
    }
  };

  // Discard Workout
  const handleDiscard = async () => {
    if (
      !confirm(
        'Are you sure you want to discard this workout session? All logged sets will be lost.'
      )
    ) {
      return;
    }

    setIsDiscardPending(true);
    try {
      if (workoutId) {
        await discardWorkoutAction(workoutId);
      }
      sessionStorage.removeItem(STORAGE_KEY);
      router.push('/dashboard');
    } catch (err) {
      console.error('Failed to discard workout:', err);
    } finally {
      setIsDiscardPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pb-36">
      {/* 1. STICKY TOP APP BAR (Clean flat matte header) */}
      <header className="sticky top-0 z-30 bg-black/95 backdrop-blur-xl border-b border-[#27272a] px-4 py-2.5 sm:px-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          {/* Cancel Button */}
          <button
            type="button"
            onClick={handleDiscard}
            disabled={isDiscardPending}
            className="px-4 py-1.5 rounded-full bg-[#1c1c1e] hover:bg-[#2c2c2e] text-[#a1a1aa] hover:text-white font-medium text-sm transition-colors cursor-pointer select-none"
          >
            Cancel
          </button>

          {/* Centered Workout Title */}
          <h1 className="text-white font-bold text-base sm:text-lg tracking-tight select-none">
            {initialWorkoutState?.workoutId ? 'Edit Workout' : 'Edit Workout'}
          </h1>

          {/* Save Button */}
          <button
            type="button"
            onClick={handleFinishWorkout}
            disabled={isFinishPending}
            className="px-5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-colors cursor-pointer disabled:opacity-50 select-none flex items-center gap-1.5"
          >
            {isFinishPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Save</span>
            )}
          </button>
        </div>
      </header>

      {/* 2. REST TIMER FLOATING BANNER (if active) */}
      {isRestTimerActive && restSecondsRemaining !== null && (
        <aside
          role="region"
          aria-label="Rest timer"
          className="sticky top-[52px] z-20 bg-[#18181b] border-b border-[#27272a] py-2.5 px-4 animate-in slide-in-from-top-2 duration-200"
        >
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs text-[#8e8e93]">Rest Interval:</span>
                <span className="text-sm font-bold font-mono text-emerald-400 ml-1.5">
                  {formatTime(restSecondsRemaining)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setRestSecondsRemaining((prev) => (prev ? prev + 30 : 30))}
                className="px-2.5 py-1 rounded-lg bg-[#2c2c2e] border border-white/10 text-[11px] font-mono font-semibold text-white hover:bg-white/10 cursor-pointer"
              >
                +30s
              </button>
              <button
                type="button"
                onClick={() =>
                  setRestSecondsRemaining((prev) => (prev && prev > 15 ? prev - 15 : 0))
                }
                className="px-2.5 py-1 rounded-lg bg-[#2c2c2e] border border-white/10 text-[11px] font-mono font-semibold text-white hover:bg-white/10 cursor-pointer"
              >
                -15s
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsRestTimerActive(false);
                  setRestSecondsRemaining(null);
                }}
                className="px-2.5 py-1 rounded-lg bg-[#2c2c2e] border border-white/10 text-[11px] font-semibold text-[#8e8e93] hover:text-white cursor-pointer"
              >
                Skip
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* 3. MAIN WORKOUT CONTAINER */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-3 space-y-4">
        {/* Validation Error banner */}
        {validationError && (
          <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center gap-3 text-rose-400 text-xs sm:text-sm animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Workout Title & Duration Sub-row */}
        <div className="flex items-center justify-between gap-3 pb-2 border-b border-[#27272a]">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Workout Title"
            className="text-base sm:text-lg font-bold text-white bg-transparent border-0 focus:outline-none placeholder:text-[#8e8e93]/50 flex-1 truncate"
          />

          <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-[#a1a1aa] bg-[#1c1c1e] px-2.5 py-1 rounded-full border border-white/5 shrink-0 select-none">
            <Timer className="w-3.5 h-3.5 text-emerald-400" />
            <span>{formatTime(secondsElapsed)}</span>
          </div>
        </div>

        {/* Empty State */}
        {exercises.length === 0 ? (
          <div className="py-14 px-6 text-center rounded-2xl bg-[#1c1c1e]/60 border border-dashed border-white/10 flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-[#1c1c1e] border border-[#27272a] text-emerald-400 flex items-center justify-center mb-3">
              <Dumbbell className="w-7 h-7 stroke-[1.8]" />
            </div>
            <h2 className="text-base font-bold text-white">
              Your workout is empty
            </h2>
            <p className="text-xs text-[#8e8e93] mt-1 max-w-sm mb-5">
              Add your first exercise to begin logging weight, reps, and sets.
            </p>
            <button
              type="button"
              onClick={() => setIsExercisePickerOpen(true)}
              className="py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm transition-colors flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Exercise</span>
            </button>
          </div>
        ) : (
          /* DnD Exercises List */
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={exercises.map((e) => e.clientId)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-1">
                {exercises.map((exercise, index) => (
                  <SortableExerciseCard
                    key={exercise.clientId}
                    exercise={exercise}
                    exerciseIndex={index}
                    onUpdateSet={handleUpdateSet}
                    onAddSet={handleAddSet}
                    onRemoveSet={handleRemoveSet}
                    onToggleComplete={handleToggleComplete}
                    onRemoveExercise={handleRemoveExercise}
                    onUpdateNotes={handleUpdateNotes}
                    onInspectExercise={setInspectExercise}
                    onToggleSuperset={handleToggleSuperset}
                    onTriggerRestTimer={triggerRestTimer}
                    isInSuperset={exercise.supersetGroup !== null}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {/* Add Exercise Button (Flat crisp emerald button, no glow) */}
        {exercises.length > 0 && (
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsExercisePickerOpen(true)}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm sm:text-base transition-colors flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] select-none"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
              <span>Add Exercise</span>
            </button>
          </div>
        )}
      </main>

      {/* 5. EXERCISE PICKER MODAL */}
      <ExercisePickerModal
        isOpen={isExercisePickerOpen}
        onClose={() => setIsExercisePickerOpen(false)}
        onSelectExercise={handleAddExercise}
        alreadySelectedIds={exercises.map((e) => e.exerciseId)}
      />

      {/* 5. EXERCISE INSPECTION PREVIEW MODAL */}
      <ExerciseDetailModal
        exercise={inspectExercise}
        onClose={() => setInspectExercise(null)}
      />

      {/* 6. WORKOUT CELEBRATION MODAL */}
      {showCelebration && completedWorkoutId && (
        <WorkoutCelebrationModal
          workoutId={completedWorkoutId}
          workoutName={name}
          durationSeconds={summaryStats.duration}
          totalVolumeKg={summaryStats.volume}
          completedSetsCount={summaryStats.completedSets}
          prs={summaryStats.prs}
          routineId={routineId}
          exercisesForRoutineUpdate={exercises.map((ex, exIdx) => ({
            exercise_id: ex.exerciseId,
            position: exIdx + 1,
            superset_group: ex.supersetGroup,
            notes: ex.notes || null,
            sets: ex.sets.map((s, sIdx) => ({
              set_number: sIdx + 1,
              set_type: s.setType,
              reps: s.reps,
              weight_kg: s.weightKg,
            })),
          }))}
          onClose={() => router.push('/dashboard')}
        />
      )}
    </div>
  );
}
