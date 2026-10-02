'use client';

import React, { useState, useEffect, useTransition } from 'react';
import {
  Search,
  X,
  Dumbbell,
  Filter,
  Check,
  Loader2,
  Info,
} from 'lucide-react';
import type { DbExercise } from '@/lib/types/workout';
import { getExercisesAction } from '@/app/workout/actions';

interface ExercisePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExercise: (exercise: DbExercise) => void;
  alreadySelectedIds?: string[];
}

const BODY_PARTS = [
  { id: 'all', label: 'All Muscles' },
  { id: 'chest', label: 'Chest' },
  { id: 'back', label: 'Back' },
  { id: 'upper legs', label: 'Quads & Glutes' },
  { id: 'lower legs', label: 'Calves' },
  { id: 'shoulders', label: 'Shoulders' },
  { id: 'upper arms', label: 'Arms (Biceps/Triceps)' },
  { id: 'waist', label: 'Abs & Core' },
];

const EQUIPMENT_LIST = [
  { id: 'all', label: 'All Equipment' },
  { id: 'barbell', label: 'Barbell' },
  { id: 'dumbbell', label: 'Dumbbell' },
  { id: 'cable', label: 'Cable' },
  { id: 'body weight', label: 'Bodyweight' },
  { id: 'machine', label: 'Machine' },
  { id: 'smith machine', label: 'Smith' },
];

export function ExercisePickerModal({
  isOpen,
  onClose,
  onSelectExercise,
  alreadySelectedIds = [],
}: ExercisePickerModalProps) {
  const [search, setSearch] = useState('');
  const [selectedBodyPart, setSelectedBodyPart] = useState('all');
  const [selectedEquipment, setSelectedEquipment] = useState('all');
  const [exercises, setExercises] = useState<DbExercise[]>([]);
  const [isPending, startTransition] = useTransition();
  const [previewExercise, setPreviewExercise] = useState<DbExercise | null>(null);

  // Fetch exercises when filters change
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      startTransition(async () => {
        const res = await getExercisesAction({
          query: search,
          bodyPart: selectedBodyPart,
          equipment: selectedEquipment,
          limit: 50,
        });

        if (res.success && res.data) {
          setExercises(res.data);
        }
      });
    }, 150);

    return () => clearTimeout(timer);
  }, [isOpen, search, selectedBodyPart, selectedEquipment]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal Container (Bottom sheet on mobile, rounded card on desktop) */}
      <div className="relative z-10 w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[85vh] flex flex-col bg-surface border-t sm:border border-border/90 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-250">
        {/* Subtle accent top border */}
        <div
          className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-90"
          aria-hidden="true"
        />

        {/* Mobile handle indicator */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Modal Header */}
        <div className="px-5 pt-3 sm:pt-5 pb-3 border-b border-border/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center shadow-sm">
              <Dumbbell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-text-primary tracking-tight">
                Select Exercise
              </h2>
              <p className="text-[11px] text-text-subtle">
                Search 1,300+ exercises in the database
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-surface-raised border border-border/80 flex items-center justify-center text-text-muted hover:text-text-primary transition-colors focus-ring cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar Input */}
        <div className="p-4 border-b border-border/60 bg-surface-raised/40">
          <div className="relative">
            <Search className="w-4 h-4 text-text-subtle absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search exercise by name (e.g. Bench press, Squat, Curl)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-surface border border-border/80 text-text-primary text-sm placeholder:text-text-subtle focus-ring min-h-[44px]"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle hover:text-text-primary p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Muscle Group Filter Pills (Horizontal scrollable on mobile) */}
          <div className="mt-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
            <span className="text-[10px] text-text-subtle uppercase tracking-wider font-semibold mr-1 shrink-0 flex items-center gap-1">
              <Filter className="w-3 h-3 text-accent" /> Muscle:
            </span>
            {BODY_PARTS.map((bp) => {
              const isSelected = selectedBodyPart === bp.id;
              return (
                <button
                  key={bp.id}
                  type="button"
                  onClick={() => setSelectedBodyPart(bp.id)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-accent text-accent-foreground font-semibold shadow-sm'
                      : 'bg-surface border border-border/70 text-text-muted hover:text-text-primary hover:border-border'
                  }`}
                >
                  {bp.label}
                </button>
              );
            })}
          </div>

          {/* Equipment Filter Pills */}
          <div className="mt-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
            <span className="text-[10px] text-text-subtle uppercase tracking-wider font-semibold mr-1 shrink-0">
              Gear:
            </span>
            {EQUIPMENT_LIST.map((eq) => {
              const isSelected = selectedEquipment === eq.id;
              return (
                <button
                  key={eq.id}
                  type="button"
                  onClick={() => setSelectedEquipment(eq.id)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-accent text-accent-foreground font-semibold shadow-sm'
                      : 'bg-surface border border-border/70 text-text-muted hover:text-text-primary hover:border-border'
                  }`}
                >
                  {eq.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Exercises Scroll List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 divide-y divide-border/40 space-y-1">
          {isPending ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-text-subtle">
              <Loader2 className="w-6 h-6 animate-spin text-accent mb-2" />
              <span className="text-xs">Searching database...</span>
            </div>
          ) : exercises.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-text-subtle">
              <Dumbbell className="w-8 h-8 stroke-[1.5] text-text-subtle mb-2" />
              <p className="text-sm font-semibold text-text-primary">No exercises found</p>
              <p className="text-xs text-text-muted mt-1">
                Try searching with different keywords or clear muscle/equipment filters.
              </p>
            </div>
          ) : (
            exercises.map((exercise) => {
              const isAlreadyAdded = alreadySelectedIds.includes(exercise.id);

              return (
                <div
                  key={exercise.id}
                  className="pt-2 first:pt-0 pb-2 flex items-center justify-between gap-3 group rounded-xl hover:bg-surface-raised/80 px-2 transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => {
                      onSelectExercise(exercise);
                      onClose();
                    }}
                    className="flex-1 flex items-center gap-3 text-left cursor-pointer min-h-[46px]"
                  >
                    <div className="w-10 h-10 rounded-xl bg-surface-raised border border-border/80 flex items-center justify-center text-accent shrink-0 group-hover:border-accent/40 transition-colors">
                      <Dumbbell className="w-5 h-5" />
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-text-primary capitalize truncate group-hover:text-accent transition-colors">
                        {exercise.name}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        {exercise.target && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface border border-border/80 text-text-muted capitalize">
                            {exercise.target}
                          </span>
                        )}
                        {exercise.equipment && (
                          <span className="text-[10px] text-text-subtle capitalize">
                            • {exercise.equipment}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>

                  <div className="flex items-center gap-2">
                    {/* Info button to preview instructions/gif */}
                    <button
                      type="button"
                      onClick={() => setPreviewExercise(exercise)}
                      className="p-1.5 rounded-lg text-text-subtle hover:text-text-primary hover:bg-surface transition-colors cursor-pointer"
                      title="View details"
                    >
                      <Info className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onSelectExercise(exercise);
                        onClose();
                      }}
                      className={`min-h-[36px] px-3 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                        isAlreadyAdded
                          ? 'bg-surface border border-accent/40 text-accent'
                          : 'bg-accent text-accent-foreground hover:bg-accent-hover active:scale-[0.98]'
                      }`}
                    >
                      {isAlreadyAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Added</span>
                        </>
                      ) : (
                        <span>Add</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Exercise Preview Modal (if info clicked) */}
        {previewExercise && (
          <div className="absolute inset-0 z-20 bg-surface/98 backdrop-blur-md p-5 flex flex-col justify-between overflow-y-auto animate-in fade-in duration-150">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-border/70">
                <div>
                  <h3 className="text-base font-bold text-text-primary capitalize">
                    {previewExercise.name}
                  </h3>
                  <p className="text-xs text-text-subtle capitalize">
                    Target: {previewExercise.target} • {previewExercise.equipment}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewExercise(null)}
                  className="p-1.5 rounded-lg bg-surface-raised border border-border text-text-muted hover:text-text-primary"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {previewExercise.gif_url && (
                <div className="my-4 rounded-2xl overflow-hidden border border-border/80 bg-black flex justify-center max-h-56">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewExercise.gif_url}
                    alt={previewExercise.name}
                    className="object-contain max-h-56"
                    loading="lazy"
                  />
                </div>
              )}

              {previewExercise.instructions && (
                <div className="mt-3 text-xs text-text-muted space-y-1.5">
                  <h4 className="font-semibold text-text-primary uppercase tracking-wider text-[10px]">
                    Instructions:
                  </h4>
                  <p className="leading-relaxed whitespace-pre-line">
                    {previewExercise.instructions}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-border/70 flex gap-2">
              <button
                type="button"
                onClick={() => setPreviewExercise(null)}
                className="flex-1 py-2.5 rounded-xl bg-surface-raised border border-border text-xs font-semibold text-text-primary"
              >
                Back to List
              </button>
              <button
                type="button"
                onClick={() => {
                  onSelectExercise(previewExercise);
                  setPreviewExercise(null);
                  onClose();
                }}
                className="flex-1 py-2.5 rounded-xl bg-accent text-accent-foreground text-xs font-bold shadow-md"
              >
                Add This Exercise
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
