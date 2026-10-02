'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ListFilter,
  X,
  Play,
  Dumbbell,
  Loader2,
  Sparkles,
  Layers,
  Flame,
} from 'lucide-react';
import type { DbRoutine } from '@/lib/types/workout';
import { getRoutinesAction } from '@/app/workout/actions';

interface RoutinePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRoutine?: (routine: DbRoutine) => void;
}

export function RoutinePickerModal({
  isOpen,
  onClose,
  onSelectRoutine,
}: RoutinePickerModalProps) {
  const router = useRouter();
  const [routines, setRoutines] = useState<DbRoutine[]>([]);
  const [activeTab, setActiveTab] = useState<'templates' | 'custom'>('templates');
  const [isLoading, setIsLoading] = useState(true);
  const [startingRoutineId, setStartingRoutineId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoading(true);

    getRoutinesAction().then((res) => {
      if (isMounted) {
        if (res.success && res.data) {
          setRoutines(res.data);
        }
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  const handleStartRoutine = (routine: DbRoutine) => {
    setStartingRoutineId(routine.id);
    onClose();
    if (onSelectRoutine) {
      onSelectRoutine(routine);
    } else {
      router.push(`/workout/active?routine=${routine.id}`);
    }
  };

  if (!isOpen) return null;

  const systemTemplates = routines.filter((r) => r.is_system || r.user_id === null);
  const customRoutines = routines.filter((r) => !r.is_system && r.user_id !== null);
  const currentList = activeTab === 'templates' ? systemTemplates : customRoutines;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal Container */}
      <div className="relative z-10 w-full sm:max-w-xl max-h-[92vh] sm:max-h-[85vh] flex flex-col bg-surface border-t sm:border border-border rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-250">
        {/* Mobile handle indicator */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Modal Header */}
        <div className="px-5 pt-3 sm:pt-5 pb-3 border-b border-border/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center shadow-sm">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-text-primary tracking-tight">
                Start a Routine
              </h2>
              <p className="text-[11px] text-text-subtle">
                Choose a structured workout plan with pre-loaded exercises
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

        {/* Tabs switcher: Templates vs Custom */}
        <div className="p-3 border-b border-border/60 bg-surface-raised/40 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('templates')}
            className={`flex-1 min-h-[38px] py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'templates'
                ? 'bg-accent text-accent-foreground shadow-sm'
                : 'bg-surface text-text-muted hover:text-text-primary border border-border/70'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Templates ({systemTemplates.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`flex-1 min-h-[38px] py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'custom'
                ? 'bg-accent text-accent-foreground shadow-sm'
                : 'bg-surface text-text-muted hover:text-text-primary border border-border/70'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>My Routines ({customRoutines.length})</span>
          </button>
        </div>

        {/* Routine Cards Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-text-subtle">
              <Loader2 className="w-6 h-6 animate-spin text-accent mb-2" />
              <span className="text-xs">Loading routines...</span>
            </div>
          ) : currentList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-text-subtle">
              <Dumbbell className="w-8 h-8 stroke-[1.5] text-text-subtle mb-2" />
              <p className="text-sm font-semibold text-text-primary">
                {activeTab === 'custom' ? 'No custom routines yet' : 'No templates found'}
              </p>
              <p className="text-xs text-text-muted mt-1 max-w-xs">
                {activeTab === 'custom'
                  ? 'You can create custom routines or save completed workouts as routines.'
                  : 'Check back soon for curated routines.'}
              </p>
            </div>
          ) : (
            currentList.map((routine) => {
              const exercises = routine.routine_exercises || [];
              const isStarting = startingRoutineId === routine.id;

              return (
                <div
                  key={routine.id}
                  className="p-4 sm:p-5 rounded-2xl bg-surface-raised border border-border/80 hover:border-accent/40 transition-all duration-200 shadow-sm flex flex-col justify-between gap-3 group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h3 className="text-sm sm:text-base font-bold text-text-primary group-hover:text-accent transition-colors">
                        {routine.name}
                      </h3>
                      {routine.is_system || routine.user_id === null ? (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30 font-semibold shrink-0">
                          Template
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface border border-border text-text-subtle shrink-0">
                          Custom
                        </span>
                      )}
                    </div>

                    {routine.notes && (
                      <p className="text-xs text-text-muted leading-relaxed line-clamp-2 mb-3">
                        {routine.notes}
                      </p>
                    )}

                    {/* Exercise pills preview */}
                    <div className="space-y-1.5 mt-2">
                      <span className="text-[10px] text-text-subtle uppercase tracking-wider font-semibold block">
                        Included Exercises ({exercises.length}):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {exercises.map((re) => {
                          const setCount = re.routine_sets?.length || 3;
                          return (
                            <span
                              key={re.id}
                              className="text-[11px] px-2.5 py-0.5 rounded-lg bg-surface border border-border/80 text-text-primary capitalize font-medium"
                            >
                              {re.exercise?.name || 'Exercise'} • {setCount} sets
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Start Routine Button */}
                  <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                    <span className="text-xs text-text-subtle flex items-center gap-1 font-mono">
                      <Flame className="w-3.5 h-3.5 text-accent" />
                      ~{Math.max(15, exercises.length * 10)} mins
                    </span>

                    <button
                      type="button"
                      disabled={isStarting}
                      onClick={() => handleStartRoutine(routine)}
                      className="min-h-[40px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs active:scale-[0.98] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isStarting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Starting...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Start This Routine</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
