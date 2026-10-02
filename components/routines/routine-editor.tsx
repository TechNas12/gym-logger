'use client';

import React, { useState } from 'react';
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
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Loader2,
  Dumbbell,
  Link as LinkIcon,
  Unlink,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import type {
  DbExercise,
  SaveRoutinePayload,
  SetType,
  RoutineDetail,
} from '@/lib/types/workout';
import { SetTypeBadge } from '@/components/workout/set-type-badge';
import { ExercisePickerModal } from '@/components/workout/exercise-picker-modal';
import { saveRoutineAction } from '@/app/workout/actions';

interface RoutineEditorSet {
  clientId: string;
  setNumber: number;
  setType: SetType;
  targetRepsMin: number;
  targetRepsMax: number;
  targetWeightKg: number | null;
  restSec: number;
}

interface RoutineEditorExercise {
  clientId: string;
  exerciseId: string;
  exercise: DbExercise;
  position: number;
  supersetGroup: number | null;
  notes: string;
  sets: RoutineEditorSet[];
}

interface RoutineEditorProps {
  initialRoutine?: RoutineDetail;
}

function SortableRoutineExerciseItem({
  exercise,
  index,
  onUpdateSet,
  onAddSet,
  onRemoveSet,
  onRemoveExercise,
  onToggleSuperset,
}: {
  exercise: RoutineEditorExercise;
  index: number;
  onUpdateSet: (exerciseClientId: string, setClientId: string, fields: Partial<RoutineEditorSet>) => void;
  onAddSet: (exerciseClientId: string) => void;
  onRemoveSet: (exerciseClientId: string, setClientId: string) => void;
  onRemoveExercise: (exerciseClientId: string) => void;
  onToggleSuperset: (exerciseClientId: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: exercise.clientId });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.6 : 1,
  };

  const isInSuperset = exercise.supersetGroup !== null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-2xl sm:rounded-3xl bg-surface/90 border border-border/80 shadow-md p-4 sm:p-5 transition-all ${
        isInSuperset ? 'border-l-4 border-l-blue-400' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border/60 gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="p-1.5 -ml-1 text-text-subtle hover:text-text-primary rounded-lg cursor-grab active:cursor-grabbing hover:bg-surface-hover touch-none shrink-0"
            aria-label="Reorder exercise"
          >
            <GripVertical className="w-4 h-4" />
          </button>

          {/* Exercise Thumbnail image/gif */}
          <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-black border border-border/80 overflow-hidden flex items-center justify-center shrink-0 shadow-xs">
            {exercise.exercise.image_url || exercise.exercise.gif_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={exercise.exercise.image_url || exercise.exercise.gif_url!}
                alt={exercise.exercise.name}
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
                #{index + 1}
              </span>
              <h4 className="text-sm sm:text-base font-bold text-text-primary truncate">
                {exercise.exercise.name}
              </h4>
              {isInSuperset && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 font-semibold flex items-center gap-1">
                  <LinkIcon className="w-3 h-3" />
                  Superset {exercise.supersetGroup}
                </span>
              )}
            </div>
            <p className="text-[11px] text-text-subtle capitalize truncate">
              {exercise.exercise.target || exercise.exercise.body_part} • {exercise.exercise.equipment || 'Any Gear'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onToggleSuperset(exercise.clientId)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isInSuperset
                ? 'text-blue-400 bg-blue-500/15 hover:bg-blue-500/25'
                : 'text-text-subtle hover:text-text-primary hover:bg-surface-hover'
            }`}
            title={isInSuperset ? 'Remove from Superset' : 'Group into Superset'}
          >
            {isInSuperset ? <Unlink className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => onRemoveExercise(exercise.clientId)}
            className="p-1.5 rounded-lg text-text-subtle hover:text-danger hover:bg-danger-bg/20 transition-colors cursor-pointer"
            title="Remove Exercise"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sets list header */}
      <div className="grid grid-cols-12 gap-1.5 sm:gap-2 mb-2 px-1 text-[11px] font-mono uppercase tracking-wider text-text-subtle font-semibold">
        <div className="col-span-2 text-center">SET</div>
        <div className="col-span-4 text-center">REPS (MIN - MAX)</div>
        <div className="col-span-3 text-center">KG (OPTIONAL)</div>
        <div className="col-span-2 text-center">REST (S)</div>
        <div className="col-span-1 text-center">DEL</div>
      </div>

      {/* Sets */}
      <div className="space-y-2">
        {exercise.sets.map((set, setIdx) => (
          <div
            key={set.clientId}
            className="grid grid-cols-12 gap-1.5 sm:gap-2 items-center p-1.5 sm:p-2 rounded-xl bg-surface-raised/70 border border-border/70"
          >
            {/* Set Type badge */}
            <div className="col-span-2 flex justify-center">
              <SetTypeBadge
                setNumber={setIdx + 1}
                setType={set.setType}
                onChangeType={(newType) =>
                  onUpdateSet(exercise.clientId, set.clientId, { setType: newType })
                }
              />
            </div>

            {/* Reps min - max */}
            <div className="col-span-4 flex items-center gap-1 justify-center">
              <input
                type="number"
                min="0"
                value={set.targetRepsMin}
                onChange={(e) =>
                  onUpdateSet(exercise.clientId, set.clientId, {
                    targetRepsMin: parseInt(e.target.value, 10) || 0,
                  })
                }
                className="w-12 text-center font-mono font-bold text-xs py-1.5 bg-surface border border-border/80 rounded-lg text-text-primary focus-ring"
              />
              <span className="text-text-subtle text-xs">-</span>
              <input
                type="number"
                min="0"
                value={set.targetRepsMax}
                onChange={(e) =>
                  onUpdateSet(exercise.clientId, set.clientId, {
                    targetRepsMax: parseInt(e.target.value, 10) || 0,
                  })
                }
                className="w-12 text-center font-mono font-bold text-xs py-1.5 bg-surface border border-border/80 rounded-lg text-text-primary focus-ring"
              />
            </div>

            {/* Target Weight */}
            <div className="col-span-3">
              <input
                type="number"
                step="0.5"
                min="0"
                value={set.targetWeightKg ?? ''}
                onChange={(e) =>
                  onUpdateSet(exercise.clientId, set.clientId, {
                    targetWeightKg: e.target.value === '' ? null : parseFloat(e.target.value),
                  })
                }
                placeholder="Optional"
                className="w-full text-center font-mono text-xs py-1.5 bg-surface border border-border/80 rounded-lg text-text-primary placeholder:text-text-subtle focus-ring"
              />
            </div>

            {/* Rest Sec */}
            <div className="col-span-2">
              <input
                type="number"
                step="15"
                min="0"
                value={set.restSec}
                onChange={(e) =>
                  onUpdateSet(exercise.clientId, set.clientId, {
                    restSec: parseInt(e.target.value, 10) || 0,
                  })
                }
                className="w-full text-center font-mono text-xs py-1.5 bg-surface border border-border/80 rounded-lg text-text-primary focus-ring"
              />
            </div>

            {/* Delete Set */}
            <div className="col-span-1 flex justify-center">
              {exercise.sets.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveSet(exercise.clientId, set.clientId)}
                  className="p-1 text-text-subtle hover:text-danger cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Set */}
      <div className="mt-3">
        <button
          type="button"
          onClick={() => onAddSet(exercise.clientId)}
          className="w-full py-1.5 rounded-xl bg-surface-raised border border-border/70 hover:border-accent/40 text-text-primary text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-3 h-3 text-accent" />
          <span>Add Planned Set</span>
        </button>
      </div>
    </div>
  );
}

export function RoutineEditor({ initialRoutine }: RoutineEditorProps) {
  const router = useRouter();

  const [name, setName] = useState(initialRoutine?.name || '');
  const [notes, setNotes] = useState(initialRoutine?.notes || '');
  const [exercises, setExercises] = useState<RoutineEditorExercise[]>(() => {
    if (!initialRoutine?.routine_exercises) return [];

    return initialRoutine.routine_exercises.map((re, idx) => ({
      clientId: crypto.randomUUID(),
      exerciseId: re.exercise_id,
      exercise: re.exercise!,
      position: idx + 1,
      supersetGroup: re.superset_group,
      notes: re.notes || '',
      sets: (re.routine_sets && re.routine_sets.length > 0)
        ? re.routine_sets.map((rs, sIdx) => ({
            clientId: crypto.randomUUID(),
            setNumber: sIdx + 1,
            setType: rs.set_type,
            targetRepsMin: rs.target_reps_min ?? 8,
            targetRepsMax: rs.target_reps_max ?? 12,
            targetWeightKg: rs.target_weight_kg != null ? Number(rs.target_weight_kg) : null,
            restSec: rs.rest_sec ?? 90,
          }))
        : [
            {
              clientId: crypto.randomUUID(),
              setNumber: 1,
              setType: 'normal',
              targetRepsMin: 8,
              targetRepsMax: 12,
              targetWeightKg: null,
              restSec: 90,
            },
            {
              clientId: crypto.randomUUID(),
              setNumber: 2,
              setType: 'normal',
              targetRepsMin: 8,
              targetRepsMax: 12,
              targetWeightKg: null,
              restSec: 90,
            },
            {
              clientId: crypto.randomUUID(),
              setNumber: 3,
              setType: 'normal',
              targetRepsMin: 8,
              targetRepsMax: 12,
              targetWeightKg: null,
              restSec: 90,
            },
          ],
    }));
  });

  const [isExercisePickerOpen, setIsExercisePickerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

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

  const handleAddExercise = (exercise: DbExercise) => {
    const newEx: RoutineEditorExercise = {
      clientId: crypto.randomUUID(),
      exerciseId: exercise.id,
      exercise,
      position: exercises.length + 1,
      supersetGroup: null,
      notes: '',
      sets: [
        {
          clientId: crypto.randomUUID(),
          setNumber: 1,
          setType: 'normal',
          targetRepsMin: 8,
          targetRepsMax: 12,
          targetWeightKg: null,
          restSec: 90,
        },
        {
          clientId: crypto.randomUUID(),
          setNumber: 2,
          setType: 'normal',
          targetRepsMin: 8,
          targetRepsMax: 12,
          targetWeightKg: null,
          restSec: 90,
        },
        {
          clientId: crypto.randomUUID(),
          setNumber: 3,
          setType: 'normal',
          targetRepsMin: 8,
          targetRepsMax: 12,
          targetWeightKg: null,
          restSec: 90,
        },
      ],
    };
    setExercises((prev) => [...prev, newEx]);
    setErrorMsg(null);
  };

  const handleRemoveExercise = (exerciseClientId: string) => {
    setExercises((prev) =>
      prev
        .filter((e) => e.clientId !== exerciseClientId)
        .map((e, idx) => ({ ...e, position: idx + 1 }))
    );
  };

  const handleAddSet = (exerciseClientId: string) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.clientId !== exerciseClientId) return ex;
        const lastSet = ex.sets[ex.sets.length - 1];
        const newSet: RoutineEditorSet = {
          clientId: crypto.randomUUID(),
          setNumber: ex.sets.length + 1,
          setType: 'normal',
          targetRepsMin: lastSet?.targetRepsMin ?? 8,
          targetRepsMax: lastSet?.targetRepsMax ?? 12,
          targetWeightKg: lastSet?.targetWeightKg ?? null,
          restSec: lastSet?.restSec ?? 90,
        };
        return { ...ex, sets: [...ex.sets, newSet] };
      })
    );
  };

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

  const handleUpdateSet = (
    exerciseClientId: string,
    setClientId: string,
    fields: Partial<RoutineEditorSet>
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

  const handleToggleSuperset = (exerciseClientId: string) => {
    setExercises((prev) => {
      const targetIndex = prev.findIndex((e) => e.clientId === exerciseClientId);
      if (targetIndex === -1) return prev;
      const target = prev[targetIndex];

      if (target.supersetGroup !== null) {
        return prev.map((e, idx) => (idx === targetIndex ? { ...e, supersetGroup: null } : e));
      } else {
        const nextGroup = Math.max(0, ...prev.map((e) => e.supersetGroup || 0)) + 1;
        const prevEx = prev[targetIndex - 1];
        const nextEx = prev[targetIndex + 1];
        const groupNum = prevEx?.supersetGroup || nextEx?.supersetGroup || nextGroup;

        return prev.map((e, idx) => {
          if (idx === targetIndex) return { ...e, supersetGroup: groupNum };
          if ((idx === targetIndex - 1 || idx === targetIndex + 1) && e.supersetGroup === null) {
            return { ...e, supersetGroup: groupNum };
          }
          return e;
        });
      }
    });
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setErrorMsg('Please enter a routine name');
      return;
    }

    if (exercises.length === 0) {
      setErrorMsg('Please add at least one exercise to the routine');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    try {
      const payload: SaveRoutinePayload = {
        id: initialRoutine?.id || null,
        name: name.trim(),
        notes: notes.trim() || null,
        exercises: exercises.map((ex, exIdx) => ({
          exercise_id: ex.exerciseId,
          position: exIdx + 1,
          superset_group: ex.supersetGroup,
          notes: ex.notes || null,
          sets: ex.sets.map((s, sIdx) => ({
            set_number: sIdx + 1,
            set_type: s.setType,
            target_reps_min: s.targetRepsMin,
            target_reps_max: s.targetRepsMax,
            target_weight_kg: s.targetWeightKg,
            rest_sec: s.restSec,
          })),
        })),
      };

      const res = await saveRoutineAction(payload);
      if (res.success && res.data) {
        router.push(`/routines/${res.data.routineId}`);
      } else {
        setErrorMsg(res.error || 'Failed to save routine');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('An error occurred while saving the routine');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/routines"
          className="flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Routines</span>
        </Link>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="min-h-[42px] px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm active:scale-[0.98] transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4 stroke-[2.5]" />
          )}
          <span>Save Routine</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-danger-bg/20 border border-danger-border text-danger text-xs sm:text-sm">
          {errorMsg}
        </div>
      )}

      {/* Routine Metadata Card */}
      <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-surface/90 border border-border/80 shadow-lg space-y-3.5">
        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-text-subtle font-semibold mb-1">
            Routine Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Upper Body Power, Legs Hypertrophy"
            className="w-full text-base sm:text-lg font-bold text-text-primary bg-surface-raised border border-border/80 rounded-xl px-4 py-2.5 focus-ring"
          />
        </div>

        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-text-subtle font-semibold mb-1">
            Notes / Goals (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Focus on progressive overload on bench, 90s rest intervals..."
            rows={2}
            className="w-full text-xs text-text-primary bg-surface-raised border border-border/80 rounded-xl px-4 py-2 focus-ring resize-none"
          />
        </div>
      </div>

      {/* Exercises Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-accent" />
            <span>Routine Exercises ({exercises.length})</span>
          </h3>
          <span className="text-[11px] text-text-subtle">Drag handle to reorder</span>
        </div>

        {exercises.length === 0 ? (
          <div className="py-12 px-6 text-center rounded-3xl bg-surface/80 border border-dashed border-border/80 flex flex-col items-center justify-center">
            <Dumbbell className="w-8 h-8 text-text-subtle mb-2" />
            <p className="text-sm font-semibold text-text-primary">No exercises in this routine yet</p>
            <p className="text-xs text-text-muted mt-0.5 mb-4">
              Add movements to define target sets and rep ranges.
            </p>
            <button
              type="button"
              onClick={() => setIsExercisePickerOpen(true)}
              className="py-2.5 px-5 rounded-xl bg-accent text-accent-foreground font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Add Exercise</span>
            </button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={exercises.map((e) => e.clientId)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {exercises.map((exercise, index) => (
                  <SortableRoutineExerciseItem
                    key={exercise.clientId}
                    exercise={exercise}
                    index={index}
                    onUpdateSet={handleUpdateSet}
                    onAddSet={handleAddSet}
                    onRemoveSet={handleRemoveSet}
                    onRemoveExercise={handleRemoveExercise}
                    onToggleSuperset={handleToggleSuperset}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {exercises.length > 0 && (
          <button
            type="button"
            onClick={() => setIsExercisePickerOpen(true)}
            className="w-full py-3 rounded-2xl bg-surface border-2 border-dashed border-border/90 hover:border-accent/60 hover:bg-surface-hover text-text-primary font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-accent" />
            <span>Add Exercise</span>
          </button>
        )}
      </div>

      <ExercisePickerModal
        isOpen={isExercisePickerOpen}
        onClose={() => setIsExercisePickerOpen(false)}
        onSelectExercise={handleAddExercise}
        alreadySelectedIds={exercises.map((e) => e.exerciseId)}
      />
    </div>
  );
}
