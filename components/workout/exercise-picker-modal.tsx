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
  Flame,
  Globe,
  RotateCcw,
} from 'lucide-react';
import type { DbExercise } from '@/lib/types/workout';
import { getExercisesAction } from '@/app/workout/actions';
import {
  parseExerciseSteps,
  getAvailableInstructionLanguages,
} from '@/lib/exercise-format';

interface ExercisePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExercise: (exercise: DbExercise) => void;
  alreadySelectedIds?: string[];
}

const MUSCLE_GROUPS = [
  { id: 'all', label: 'All Muscles' },
  { id: 'chest', label: 'Chest' },
  { id: 'back', label: 'Back' },
  { id: 'upper legs', label: 'Quads & Glutes' },
  { id: 'lower legs', label: 'Calves' },
  { id: 'shoulders', label: 'Shoulders' },
  { id: 'upper arms', label: 'Arms (Biceps/Triceps)' },
  { id: 'lower arms', label: 'Forearms' },
  { id: 'waist', label: 'Abs & Core' },
  { id: 'cardio', label: 'Cardio' },
];

const EQUIPMENT_LIST = [
  { id: 'all', label: 'All Gear' },
  { id: 'barbell', label: 'Barbell' },
  { id: 'dumbbell', label: 'Dumbbell' },
  { id: 'cable', label: 'Cable' },
  { id: 'machine', label: 'Machine' },
  { id: 'body weight', label: 'Bodyweight' },
  { id: 'kettlebell', label: 'Kettlebell' },
  { id: 'band', label: 'Band' },
];

export function ExercisePickerModal({
  isOpen,
  onClose,
  onSelectExercise,
  alreadySelectedIds = [],
}: ExercisePickerModalProps) {
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('all');
  const [selectedEquipment, setSelectedEquipment] = useState('all');
  const [exercises, setExercises] = useState<DbExercise[]>([]);
  const [isPending, startTransition] = useTransition();

  // Preview & inspection state
  const [previewExercise, setPreviewExercise] = useState<DbExercise | null>(null);
  const [previewLanguage, setPreviewLanguage] = useState('en');

  // Fetch exercises when filters change
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      startTransition(async () => {
        const res = await getExercisesAction({
          query: search,
          bodyPart: selectedMuscle !== 'all' ? selectedMuscle : undefined,
          equipment: selectedEquipment !== 'all' ? selectedEquipment : undefined,
          limit: 60,
        });

        if (res.success && res.data) {
          setExercises(res.data);
        }
      });
    }, 150);

    return () => clearTimeout(timer);
  }, [isOpen, search, selectedMuscle, selectedEquipment]);

  if (!isOpen) return null;

  const hasActiveFilters =
    selectedMuscle !== 'all' || selectedEquipment !== 'all' || search.trim() !== '';

  const handleResetFilters = () => {
    setSearch('');
    setSelectedMuscle('all');
    setSelectedEquipment('all');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal Container */}
      <div className="relative z-10 w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[86vh] flex flex-col bg-surface border-t sm:border border-border rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-250">
        {/* Mobile handle indicator */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Modal Header */}
        <div className="px-5 pt-3 sm:pt-4 pb-3 border-b border-border/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center shadow-xs">
              <Dumbbell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-text-primary tracking-tight">
                Add Exercise
              </h2>
              <p className="text-[11px] text-text-subtle">
                Browse or search 1,300+ illustrated movements
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

        {/* Search Input Bar */}
        <div className="p-3.5 sm:p-4 border-b border-border/60 bg-surface-raised/40 space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-subtle pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search exercise by name (e.g. Bench Press, Squat, Curl)..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-surface border border-border/90 text-xs sm:text-sm text-text-primary placeholder:text-text-subtle focus-ring"
              autoFocus
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle hover:text-text-primary"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Level 1: Major Muscle Groups Filter Chips (NO scrollbar) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {MUSCLE_GROUPS.map((mg) => {
              const isActive = selectedMuscle === mg.id;
              return (
                <button
                  key={mg.id}
                  type="button"
                  onClick={() => setSelectedMuscle(mg.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-accent text-accent-foreground shadow-xs'
                      : 'bg-surface border border-border/80 text-text-muted hover:text-text-primary hover:bg-surface-hover'
                  }`}
                >
                  {mg.label}
                </button>
              );
            })}
          </div>

          {/* Level 2: Equipment Filter Chips (NO scrollbar) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {EQUIPMENT_LIST.map((eq) => {
              const isActive = selectedEquipment === eq.id;
              return (
                <button
                  key={eq.id}
                  type="button"
                  onClick={() => setSelectedEquipment(eq.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40 font-bold'
                      : 'bg-surface/70 border border-border/70 text-text-subtle hover:text-text-primary'
                  }`}
                >
                  {eq.label}
                </button>
              );
            })}

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-2 py-1 rounded-lg text-[11px] font-mono text-text-subtle hover:text-accent flex items-center gap-1 cursor-pointer shrink-0 ml-auto"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Results Counter / Filter Indicator */}
        <div className="px-5 py-2 bg-surface-raised/20 border-b border-border/40 flex items-center justify-between text-[11px] font-mono text-text-subtle">
          <span>
            {isPending ? 'Searching...' : `Found ${exercises.length} movements`}
          </span>
          {selectedMuscle !== 'all' && (
            <span className="capitalize text-accent font-semibold">
              Filter: {selectedMuscle}
            </span>
          )}
        </div>

        {/* Exercises List (NO scrollbar, mobile-first card list) */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-3.5 sm:p-4 space-y-2.5">
          {isPending ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-text-subtle">
              <Loader2 className="w-6 h-6 animate-spin text-accent mb-2" />
              <span className="text-xs">Loading illustrated exercises...</span>
            </div>
          ) : exercises.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-text-subtle">
              <Dumbbell className="w-8 h-8 stroke-[1.5] text-text-subtle mb-2" />
              <p className="text-sm font-semibold text-text-primary">
                No matching exercises found
              </p>
              <p className="text-xs text-text-muted mt-1 max-w-xs mb-3">
                Try searching for a different keyword or resetting your muscle/equipment filters.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3.5 py-1.5 rounded-xl bg-surface-raised border border-border text-xs font-semibold text-accent hover:underline cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            exercises.map((ex) => {
              const isAlreadyAdded = alreadySelectedIds.includes(ex.id);
              const thumbUrl = ex.image_url || ex.gif_url;

              return (
                <div
                  key={ex.id}
                  className={`p-2.5 sm:p-3 rounded-2xl bg-surface-raised border transition-all duration-150 flex items-center justify-between gap-3 group ${
                    isAlreadyAdded
                      ? 'border-accent/30 bg-accent/5'
                      : 'border-border/80 hover:border-accent/40 hover:bg-surface-hover/80'
                  }`}
                >
                  {/* Left: Exercise Thumbnail (Clickable to preview) */}
                  <div
                    onClick={() => {
                      setPreviewExercise(ex);
                      setPreviewLanguage('en');
                    }}
                    className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-black border border-border/80 overflow-hidden flex items-center justify-center shrink-0 cursor-pointer group-hover:scale-105 transition-transform"
                    title="Click to view animation and technique steps"
                  >
                    {thumbUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={thumbUrl}
                        alt={ex.name}
                        className="w-full h-full object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <Dumbbell className="w-6 h-6 text-text-subtle" />
                    )}
                    {/* Play/Eye overlay hint */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Info className="w-4 h-4 text-accent" />
                    </div>
                  </div>

                  {/* Middle: Exercise Title & Muscle / Equipment Badges */}
                  <div
                    onClick={() => {
                      setPreviewExercise(ex);
                      setPreviewLanguage('en');
                    }}
                    className="min-w-0 flex-1 cursor-pointer"
                  >
                    <h3 className="text-xs sm:text-sm font-bold text-text-primary capitalize truncate group-hover:text-accent transition-colors">
                      {ex.name}
                    </h3>

                    <div className="flex items-center gap-1.5 flex-wrap mt-1">
                      <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-surface border border-border/70 text-text-primary capitalize">
                        {ex.target || ex.body_part || 'Full Body'}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-surface/60 border border-border/50 text-text-subtle capitalize">
                        {ex.equipment || 'Any Gear'}
                      </span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewExercise(ex);
                        setPreviewLanguage('en');
                      }}
                      className="p-2 rounded-xl text-text-subtle hover:text-text-primary hover:bg-surface transition-colors cursor-pointer"
                      title="Exercise Form Guide"
                    >
                      <Info className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onSelectExercise(ex);
                        onClose();
                      }}
                      className={`min-h-[38px] px-3.5 sm:px-4 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                        isAlreadyAdded
                          ? 'bg-accent/20 text-accent border border-accent/40 hover:bg-accent hover:text-accent-foreground'
                          : 'bg-emerald-600 text-white hover:bg-emerald-500 active:scale-95'
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

        {/* ----------------------------------------------------------------- */}
        {/* Full Exercise Preview & Technique Guide Modal                     */}
        {/* ----------------------------------------------------------------- */}
        {previewExercise && (
          <div className="absolute inset-0 z-20 bg-surface/98 backdrop-blur-md p-4 sm:p-6 flex flex-col justify-between overflow-hidden animate-in fade-in duration-150">
            {/* Modal Sub-Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border/70 shrink-0">
              <div className="min-w-0 flex-1 pr-3">
                <h3 className="text-base sm:text-lg font-bold text-text-primary capitalize truncate">
                  {previewExercise.name}
                </h3>
                <p className="text-xs text-text-subtle capitalize">
                  {previewExercise.target || previewExercise.body_part} • {previewExercise.equipment || 'Bodyweight'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setPreviewExercise(null)}
                className="w-8 h-8 rounded-lg bg-surface-raised border border-border text-text-muted hover:text-text-primary flex items-center justify-center shrink-0 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content Area (NO scrollbar) */}
            <div className="flex-1 overflow-y-auto no-scrollbar py-3 space-y-4">
              {/* Animated GIF demonstration */}
              {(previewExercise.gif_url || previewExercise.image_url) && (
                <div className="rounded-2xl overflow-hidden border border-border/80 bg-black flex justify-center max-h-60 sm:max-h-64 shadow-inner">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewExercise.gif_url || previewExercise.image_url!}
                    alt={previewExercise.name}
                    className="object-contain max-h-60 sm:max-h-64"
                    loading="lazy"
                  />
                </div>
              )}

              {/* Language Selector Chips */}
              {(() => {
                const availableLangs = getAvailableInstructionLanguages(
                  previewExercise.instruction_steps,
                  previewExercise.instructions
                );

                if (availableLangs.length <= 1) return null;

                return (
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                    <span className="text-[10px] uppercase font-mono text-text-subtle font-semibold flex items-center gap-1 shrink-0 mr-1">
                      <Globe className="w-3 h-3 text-accent" />
                      Lang:
                    </span>
                    {availableLangs.map((lang) => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => setPreviewLanguage(lang.code)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                          previewLanguage === lang.code
                            ? 'bg-accent text-accent-foreground'
                            : 'bg-surface-raised border border-border/80 text-text-muted hover:text-text-primary'
                        }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                );
              })()}

              {/* Form & Technique Steps */}
              <div>
                <h4 className="font-semibold text-text-primary uppercase tracking-wider text-[11px] mb-2.5 flex items-center gap-1.5 font-mono">
                  <Flame className="w-3.5 h-3.5 text-accent" />
                  <span>Execution & Technique</span>
                </h4>

                {(() => {
                  const steps = parseExerciseSteps(
                    previewExercise.instruction_steps,
                    previewExercise.instructions,
                    previewLanguage
                  );

                  if (steps.length === 0) {
                    return (
                      <p className="text-xs text-text-muted italic">
                        No technique cues provided for this exercise.
                      </p>
                    );
                  }

                  return (
                    <div className="space-y-2">
                      {steps.map((step, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2.5 p-2.5 rounded-xl bg-surface-raised/70 border border-border/60"
                        >
                          <span className="w-5 h-5 rounded-md bg-accent/20 border border-accent/40 text-accent font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                          </span>
                          <p className="text-xs text-text-primary leading-relaxed">
                            {step}
                          </p>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Bottom Modal Actions */}
            <div className="pt-3 border-t border-border/70 flex gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setPreviewExercise(null)}
                className="flex-1 min-h-[42px] rounded-xl bg-surface-raised border border-border text-xs font-semibold text-text-primary hover:bg-surface-hover cursor-pointer"
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
                className="flex-1 min-h-[42px] rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 active:scale-[0.98] transition-colors cursor-pointer"
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
