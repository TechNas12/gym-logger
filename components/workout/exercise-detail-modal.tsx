'use client';

import React, { useState } from 'react';
import { X, Flame, Globe, Dumbbell, Sparkles } from 'lucide-react';
import type { DbExercise } from '@/lib/types/workout';
import {
  parseExerciseSteps,
  getAvailableInstructionLanguages,
} from '@/lib/exercise-format';

interface ExerciseDetailModalProps {
  exercise: DbExercise | null;
  onClose: () => void;
  onAddExercise?: (exercise: DbExercise) => void;
  isAlreadyAdded?: boolean;
}

export function ExerciseDetailModal({
  exercise,
  onClose,
  onAddExercise,
  isAlreadyAdded = false,
}: ExerciseDetailModalProps) {
  const [selectedLang, setSelectedLang] = useState('en');

  if (!exercise) return null;

  const availableLangs = getAvailableInstructionLanguages(
    exercise.instruction_steps,
    exercise.instructions
  );

  const steps = parseExerciseSteps(
    exercise.instruction_steps,
    exercise.instructions,
    selectedLang
  );

  const mediaUrl = exercise.gif_url || exercise.image_url;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 w-full max-w-lg bg-surface border border-border rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col justify-between">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-3.5 border-b border-border/70 shrink-0 gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap mb-1">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30 font-semibold capitalize">
                {exercise.target || exercise.body_part || 'Full Body'}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface-raised border border-border/70 text-text-subtle capitalize">
                {exercise.equipment || 'Any Gear'}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-text-primary capitalize truncate">
              {exercise.name}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-surface-raised border border-border/80 text-text-muted hover:text-text-primary flex items-center justify-center shrink-0 cursor-pointer transition-colors"
            aria-label="Close details"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content (NO scrollbar) */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-3.5 space-y-4">
          {/* Animated GIF / Image demonstration */}
          {mediaUrl ? (
            <div className="rounded-2xl overflow-hidden border border-border/80 bg-black flex justify-center max-h-56 sm:max-h-64 shadow-inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mediaUrl}
                alt={exercise.name}
                className="w-full h-full object-contain max-h-56 sm:max-h-64"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="h-44 rounded-2xl bg-surface-raised border border-dashed border-border flex flex-col items-center justify-center text-text-subtle">
              <Dumbbell className="w-8 h-8 mb-2" />
              <span className="text-xs">No preview demonstration available</span>
            </div>
          )}

          {/* Multilingual Selector Chips (NO scrollbar) */}
          {availableLangs.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              <span className="text-[10px] uppercase font-mono text-text-subtle font-semibold flex items-center gap-1 shrink-0 mr-1">
                <Globe className="w-3 h-3 text-accent" />
                Language:
              </span>
              {availableLangs.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setSelectedLang(lang.code)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                    selectedLang === lang.code
                      ? 'bg-accent text-accent-foreground font-bold shadow-xs'
                      : 'bg-surface-raised border border-border/80 text-text-muted hover:text-text-primary'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          )}

          {/* Form & Technique Step-by-Step Instructions */}
          <div>
            <h4 className="font-semibold text-text-primary uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5 font-mono">
              <Flame className="w-3.5 h-3.5 text-accent" />
              <span>Step-by-Step Form & Technique</span>
            </h4>

            {steps.length === 0 ? (
              <p className="text-xs text-text-muted italic">
                No step-by-step instructions available for this exercise.
              </p>
            ) : (
              <div className="space-y-2">
                {steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-3 rounded-xl bg-surface-raised/70 border border-border/70"
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
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="pt-3 border-t border-border/70 flex gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 min-h-[42px] rounded-xl bg-surface-raised border border-border text-xs font-semibold text-text-primary hover:bg-surface-hover cursor-pointer"
          >
            Close
          </button>

          {onAddExercise && (
            <button
              type="button"
              onClick={() => {
                onAddExercise(exercise);
                onClose();
              }}
              className="flex-1 min-h-[42px] rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 active:scale-[0.98] transition-colors cursor-pointer"
            >
              {isAlreadyAdded ? 'Already Added' : 'Add to Workout'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
