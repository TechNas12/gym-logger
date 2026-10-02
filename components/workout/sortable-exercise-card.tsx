'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Plus,
  Trash2,
  Info,
  Check,
  MoreVertical,
  Clock,
  Link as LinkIcon,
  Unlink,
  Dumbbell,
} from 'lucide-react';
import type { ActiveExercise, ActiveSet, DbExercise } from '@/lib/types/workout';
import { SetTypeBadge } from './set-type-badge';

interface SortableExerciseCardProps {
  exercise: ActiveExercise;
  exerciseIndex: number;
  onUpdateSet: (exerciseClientId: string, setClientId: string, fields: Partial<ActiveSet>) => void;
  onAddSet: (exerciseClientId: string) => void;
  onRemoveSet: (exerciseClientId: string, setClientId: string) => void;
  onToggleComplete: (exerciseClientId: string, setClientId: string) => void;
  onRemoveExercise: (exerciseClientId: string) => void;
  onUpdateNotes: (exerciseClientId: string, notes: string) => void;
  onInspectExercise: (exercise: DbExercise) => void;
  onToggleSuperset: (exerciseClientId: string) => void;
  onTriggerRestTimer?: (seconds: number) => void;
  isFirstInSuperset?: boolean;
  isInSuperset?: boolean;
  supersetColorClass?: string;
}

const REST_TIMER_OPTIONS = [
  { label: 'OFF', seconds: 0 },
  { label: '30s', seconds: 30 },
  { label: '60s', seconds: 60 },
  { label: '90s', seconds: 90 },
  { label: '2m', seconds: 120 },
  { label: '3m', seconds: 180 },
];

export function SortableExerciseCard({
  exercise,
  exerciseIndex,
  onUpdateSet,
  onAddSet,
  onRemoveSet,
  onToggleComplete,
  onRemoveExercise,
  onUpdateNotes,
  onInspectExercise,
  onToggleSuperset,
  onTriggerRestTimer,
  isInSuperset = false,
  supersetColorClass = 'border-l-accent',
}: SortableExerciseCardProps) {
  const [restDuration, setRestDuration] = useState<number>(0); // 0 = OFF by default unless toggled
  const [isRestMenuOpen, setIsRestMenuOpen] = useState(false);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);

  const actionMenuRef = useRef<HTMLDivElement>(null);
  const restMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target as Node)) {
        setIsActionMenuOpen(false);
      }
      if (restMenuRef.current && !restMenuRef.current.contains(e.target as Node)) {
        setIsRestMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleSetCompletion = (setClientId: string, priorIsCompleted: boolean) => {
    onToggleComplete(exercise.clientId, setClientId);
    // If set was incomplete and is now being completed, trigger rest timer if restDuration > 0
    if (!priorIsCompleted && restDuration > 0 && onTriggerRestTimer) {
      onTriggerRestTimer(restDuration);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`pb-5 mb-5 border-b border-[#1c1c1e] text-white transition-all duration-150 ${
        isInSuperset ? `border-l-4 pl-3 ${supersetColorClass}` : ''
      }`}
    >
      {/* 1. Exercise Top Bar (Avatar, Green Title, 3-dots) */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Circular Thumbnail Avatar */}
          <div
            onClick={() => onInspectExercise(exercise.exercise)}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white p-0.5 overflow-hidden flex items-center justify-center shrink-0 border border-white/20 cursor-pointer shadow-sm hover:scale-105 active:scale-95 transition-transform"
            title="Click to view animated demo and technique"
          >
            {exercise.exercise.image_url || exercise.exercise.gif_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={exercise.exercise.image_url || exercise.exercise.gif_url!}
                alt={exercise.exercise.name}
                className="w-full h-full object-contain"
                loading="lazy"
              />
            ) : (
              <Dumbbell className="w-5 h-5 text-[#1c1c1e]" />
            )}
          </div>

          {/* Exercise Title */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3
                onClick={() => onInspectExercise(exercise.exercise)}
                className="text-base sm:text-lg font-bold text-white hover:text-emerald-400 truncate cursor-pointer transition-colors"
                title={exercise.exercise.name}
              >
                {exercise.exercise.name}
              </h3>
              {isInSuperset && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold flex items-center gap-1 shrink-0">
                  <LinkIcon className="w-2.5 h-2.5" />
                  Superset
                </span>
              )}
            </div>

            {/* Inline Notes input (Hevy style "Add notes here...") */}
            <input
              type="text"
              value={exercise.notes}
              onChange={(e) => onUpdateNotes(exercise.clientId, e.target.value)}
              placeholder="Add notes here..."
              className="w-full bg-transparent border-0 p-0 text-xs sm:text-sm text-[#8e8e93] placeholder:text-[#8e8e93]/50 focus:outline-none focus:text-white transition-colors"
            />
          </div>
        </div>

        {/* Right side: Reorder handle + 3-dots Menu */}
        <div className="flex items-center gap-1 shrink-0 pt-0.5">
          {/* Drag to reorder */}
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="p-1.5 text-[#8e8e93] hover:text-white rounded-lg cursor-grab active:cursor-grabbing hover:bg-white/5 transition-colors touch-none"
            aria-label="Drag to reorder"
            title="Drag to reorder"
          >
            <GripVertical className="w-4 h-4" />
          </button>

          {/* 3-dots Menu */}
          <div className="relative" ref={actionMenuRef}>
            <button
              type="button"
              onClick={() => setIsActionMenuOpen((prev) => !prev)}
              className="p-1.5 text-[#8e8e93] hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              aria-label="Exercise options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {isActionMenuOpen && (
              <div className="absolute right-0 mt-1 w-48 py-1.5 bg-[#1c1c1e] border border-white/10 rounded-xl shadow-2xl z-40 animate-in fade-in zoom-in-95 duration-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsActionMenuOpen(false);
                    onInspectExercise(exercise.exercise);
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-white hover:bg-white/10 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Info className="w-3.5 h-3.5 text-accent" />
                  <span>Form Guide & Demo</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsActionMenuOpen(false);
                    onToggleSuperset(exercise.clientId);
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-white hover:bg-white/10 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  {isInSuperset ? (
                    <>
                      <Unlink className="w-3.5 h-3.5 text-[#8e8e93]" />
                      <span>Remove from Superset</span>
                    </>
                  ) : (
                    <>
                      <LinkIcon className="w-3.5 h-3.5 text-accent" />
                      <span>Group in Superset</span>
                    </>
                  )}
                </button>

                <div className="h-px bg-white/10 my-1" />

                <button
                  type="button"
                  onClick={() => {
                    setIsActionMenuOpen(false);
                    onRemoveExercise(exercise.clientId);
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Exercise</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Rest Timer Row (Hevy style "Rest Timer: OFF" in green) */}
      <div className="relative mb-3 flex items-center" ref={restMenuRef}>
        <button
          type="button"
          onClick={() => setIsRestMenuOpen((prev) => !prev)}
          className="text-xs font-semibold text-accent hover:text-accent-hover flex items-center gap-1.5 cursor-pointer py-0.5 select-none transition-colors"
        >
          <Clock className="w-3.5 h-3.5" />
          <span>
            Rest Timer: {restDuration === 0 ? 'OFF' : `${restDuration}s`}
          </span>
        </button>

        {isRestMenuOpen && (
          <div className="absolute left-0 top-full mt-1 py-1.5 px-1 bg-[#1c1c1e] border border-white/10 rounded-xl shadow-2xl z-40 flex items-center gap-1 animate-in fade-in zoom-in-95 duration-100">
            {REST_TIMER_OPTIONS.map((opt) => (
              <button
                key={opt.seconds}
                type="button"
                onClick={() => {
                  setRestDuration(opt.seconds);
                  setIsRestMenuOpen(false);
                  if (opt.seconds > 0 && onTriggerRestTimer) {
                    onTriggerRestTimer(opt.seconds);
                  }
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                  restDuration === opt.seconds
                    ? 'bg-accent text-accent-foreground font-bold'
                    : 'text-[#8e8e93] hover:text-white hover:bg-white/10'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. Sets Table Header (SET, PREVIOUS, + KG, REPS, ✓) */}
      <div className="grid grid-cols-[38px_1fr_68px_68px_44px] sm:grid-cols-[44px_1fr_80px_80px_48px] gap-2 items-center px-1 mb-1 text-[11px] font-bold text-[#8e8e93] uppercase tracking-wider select-none">
        <div className="text-center">SET</div>
        <div className="text-center truncate">PREVIOUS</div>
        <div className="text-center flex items-center justify-center gap-1">
          <Dumbbell className="w-3 h-3 text-[#8e8e93]" />
          <span>KG</span>
        </div>
        <div className="text-center">REPS</div>
        <div className="text-center flex justify-center">
          <Check className="w-3.5 h-3.5 text-[#8e8e93] stroke-[3]" />
        </div>
      </div>

      {/* 4. Set Rows */}
      <div className="space-y-1">
        {exercise.sets.map((set, setIdx) => {
          const isCompleted = set.isCompleted;

          return (
            <div
              key={set.clientId}
              className={`grid grid-cols-[38px_1fr_68px_68px_44px] sm:grid-cols-[44px_1fr_80px_80px_48px] gap-2 items-center py-1 px-1 rounded-lg transition-colors group ${
                isCompleted
                  ? 'bg-[#133816] text-white'
                  : 'bg-transparent hover:bg-white/[0.02]'
              }`}
            >
              {/* Col 1: Set Number / Type Badge */}
              <div className="flex items-center justify-center">
                <SetTypeBadge
                  setNumber={setIdx + 1}
                  setType={set.setType}
                  isCompleted={isCompleted}
                  onChangeType={(newType) =>
                    onUpdateSet(exercise.clientId, set.clientId, { setType: newType })
                  }
                />
              </div>

              {/* Col 2: Previous Stats */}
              <div className="text-center truncate px-1">
                <span
                  className={`text-xs sm:text-sm font-mono truncate select-none ${
                    isCompleted ? 'text-white font-medium' : 'text-[#8e8e93]'
                  }`}
                  title={set.previous || 'No prior record'}
                >
                  {set.previous || '—'}
                </span>
              </div>

              {/* Col 3: Weight (KG) input */}
              <div>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.5"
                  min="0"
                  value={set.weightKg === null || set.weightKg === 0 ? '' : set.weightKg}
                  onChange={(e) => {
                    const val = e.target.value === '' ? null : parseFloat(e.target.value);
                    onUpdateSet(exercise.clientId, set.clientId, {
                      weightKg: val !== null && !isNaN(val) ? val : null,
                    });
                  }}
                  placeholder="0"
                  className={`w-full text-center font-mono font-bold text-xs sm:text-sm py-1.5 px-1 rounded-lg focus:outline-none transition-colors ${
                    isCompleted
                      ? 'bg-transparent text-white border-0 focus:bg-[#1a4a1f]'
                      : 'bg-[#1c1c1e] text-white border border-white/10 focus:border-accent focus:bg-[#2c2c2e]'
                  }`}
                />
              </div>

              {/* Col 4: Reps input */}
              <div>
                <input
                  type="number"
                  inputMode="numeric"
                  step="1"
                  min="0"
                  value={set.reps === null || set.reps === 0 ? '' : set.reps}
                  onChange={(e) => {
                    const val = e.target.value === '' ? null : parseInt(e.target.value, 10);
                    onUpdateSet(exercise.clientId, set.clientId, {
                      reps: val !== null && !isNaN(val) ? val : null,
                    });
                  }}
                  placeholder="0"
                  className={`w-full text-center font-mono font-bold text-xs sm:text-sm py-1.5 px-1 rounded-lg focus:outline-none transition-colors ${
                    isCompleted
                      ? 'bg-transparent text-white border-0 focus:bg-[#1a4a1f]'
                      : 'bg-[#1c1c1e] text-white border border-white/10 focus:border-accent focus:bg-[#2c2c2e]'
                  }`}
                />
              </div>

              {/* Col 5: Complete Checkmark Button */}
              <div className="flex items-center justify-center relative">
                <button
                  type="button"
                  onClick={() => handleSetCompletion(set.clientId, isCompleted)}
                  className={`w-9 h-8 sm:w-10 sm:h-8.5 rounded-lg flex items-center justify-center transition-all cursor-pointer active:scale-90 select-none ${
                    isCompleted
                      ? 'bg-[#34c759] text-white shadow-sm'
                      : 'bg-[#2c2c2e] hover:bg-[#3a3a3c] text-[#8e8e93] hover:text-white'
                  }`}
                  aria-label={`Toggle set ${setIdx + 1} completed`}
                >
                  <Check
                    className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${
                      isCompleted ? 'stroke-[3] text-white' : 'stroke-[2.5] text-white/40'
                    }`}
                  />
                </button>

                {/* Subtle delete set on hover if more than 1 set */}
                {exercise.sets.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onRemoveSet(exercise.clientId, set.clientId)}
                    className="absolute -right-5 opacity-0 group-hover:opacity-100 text-[#8e8e93] hover:text-rose-400 p-1 transition-opacity cursor-pointer hidden sm:block"
                    title="Delete set"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. Add Set Button (Wide dark rounded button "+ Add Set") */}
      <div className="mt-3">
        <button
          type="button"
          onClick={() => onAddSet(exercise.clientId)}
          className="w-full py-2.5 rounded-xl bg-[#1c1c1e] hover:bg-[#2c2c2e] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 border border-white/5 active:scale-[0.99] transition-all cursor-pointer shadow-xs select-none"
        >
          <Plus className="w-4 h-4 text-white stroke-[2.5]" />
          <span>Add Set</span>
        </button>
      </div>
    </div>
  );
}
