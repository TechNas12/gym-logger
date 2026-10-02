'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Dumbbell, 
  Check, 
  Plus, 
  Flame, 
  Trophy, 
  Timer, 
  Play, 
  Pause, 
  RotateCcw, 
  ArrowRight,
  TrendingUp,
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';
import { ScrollReveal } from './scroll-reveal';

interface WorkoutSet {
  id: number;
  setNumber: number;
  prev: string;
  weight: number;
  reps: number;
  rpe: number;
  isCompleted: boolean;
  isPR?: boolean;
}

interface ExerciseData {
  id: string;
  name: string;
  category: string;
  muscle: string;
  historyPR: number;
  defaultSets: WorkoutSet[];
}

const EXERCISES: ExerciseData[] = [
  {
    id: 'squat',
    name: 'Barbell Back Squat',
    category: 'Barbell Compound',
    muscle: 'Quads & Glutes',
    historyPR: 140,
    defaultSets: [
      { id: 1, setNumber: 1, prev: '100 kg × 8', weight: 105, reps: 8, rpe: 7.5, isCompleted: true },
      { id: 2, setNumber: 2, prev: '115 kg × 6', weight: 120, reps: 6, rpe: 8.5, isCompleted: true },
      { id: 3, setNumber: 3, prev: '125 kg × 4', weight: 130, reps: 5, rpe: 9.0, isCompleted: false, isPR: true },
      { id: 4, setNumber: 4, prev: '110 kg × 8', weight: 115, reps: 8, rpe: 8.0, isCompleted: false },
    ],
  },
  {
    id: 'bench',
    name: 'Incline Dumbbell Press',
    category: 'Dumbbell Hypertrophy',
    muscle: 'Upper Chest & Triceps',
    historyPR: 38,
    defaultSets: [
      { id: 1, setNumber: 1, prev: '32 kg × 10', weight: 34, reps: 10, rpe: 8.0, isCompleted: true },
      { id: 2, setNumber: 2, prev: '34 kg × 8', weight: 36, reps: 8, rpe: 8.5, isCompleted: true },
      { id: 3, setNumber: 3, prev: '36 kg × 7', weight: 38, reps: 7, rpe: 9.5, isCompleted: false, isPR: true },
    ],
  },
  {
    id: 'deadlift',
    name: 'Romanian Deadlift (RDL)',
    category: 'Barbell Pull',
    muscle: 'Hamstrings & Posterior Chain',
    historyPR: 160,
    defaultSets: [
      { id: 1, setNumber: 1, prev: '120 kg × 8', weight: 125, reps: 8, rpe: 7.0, isCompleted: true },
      { id: 2, setNumber: 2, prev: '135 kg × 8', weight: 140, reps: 8, rpe: 8.0, isCompleted: false },
      { id: 3, setNumber: 3, prev: '145 kg × 6', weight: 150, reps: 6, rpe: 9.0, isCompleted: false },
    ],
  },
];

export function InteractiveLoggerDemo() {
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('squat');
  const [exerciseSets, setExerciseSets] = useState<Record<string, WorkoutSet[]>>({
    squat: EXERCISES[0].defaultSets,
    bench: EXERCISES[1].defaultSets,
    deadlift: EXERCISES[2].defaultSets,
  });

  // Rest Timer state
  const [restSeconds, setRestSeconds] = useState<number>(85);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

  const currentExercise = EXERCISES.find((e) => e.id === selectedExerciseId) || EXERCISES[0];
  const currentSets = exerciseSets[selectedExerciseId] || [];

  // Toggle completion of a set
  const toggleSetComplete = (setId: number) => {
    setExerciseSets((prev) => {
      const updated = (prev[selectedExerciseId] || []).map((s) => {
        if (s.id === setId) {
          const nextState = !s.isCompleted;
          // If completing, auto-trigger a 90s rest timer demonstration
          if (nextState && !isTimerRunning) {
            setRestSeconds(90);
          }
          return { ...s, isCompleted: nextState };
        }
        return s;
      });
      return { ...prev, [selectedExerciseId]: updated };
    });
  };

  // Add set
  const handleAddSet = () => {
    setExerciseSets((prev) => {
      const list = prev[selectedExerciseId] || [];
      const lastSet = list[list.length - 1];
      const newSetNumber = list.length + 1;
      const newSet: WorkoutSet = {
        id: Date.now(),
        setNumber: newSetNumber,
        prev: lastSet ? `${lastSet.weight} kg × ${lastSet.reps}` : '100 kg × 5',
        weight: lastSet ? lastSet.weight : 100,
        reps: lastSet ? lastSet.reps : 8,
        rpe: 8.0,
        isCompleted: false,
      };
      return { ...prev, [selectedExerciseId]: [...list, newSet] };
    });
  };

  // Update set weight
  const updateWeight = (setId: number, delta: number) => {
    setExerciseSets((prev) => {
      const updated = (prev[selectedExerciseId] || []).map((s) => {
        if (s.id === setId) {
          const nextWeight = Math.max(1, s.weight + delta);
          return { ...s, weight: nextWeight };
        }
        return s;
      });
      return { ...prev, [selectedExerciseId]: updated };
    });
  };

  // Update set reps
  const updateReps = (setId: number, delta: number) => {
    setExerciseSets((prev) => {
      const updated = (prev[selectedExerciseId] || []).map((s) => {
        if (s.id === setId) {
          const nextReps = Math.max(1, s.reps + delta);
          return { ...s, reps: nextReps };
        }
        return s;
      });
      return { ...prev, [selectedExerciseId]: updated };
    });
  };

  // Stats calculation
  const completedSets = currentSets.filter((s) => s.isCompleted);
  const totalVolume = completedSets.reduce((acc, s) => acc + s.weight * s.reps, 0);

  // Highest completed set 1RM estimation via Brzycki: Weight × (36 / (37 - Reps))
  const estimated1RM = completedSets.reduce((max, s) => {
    if (s.reps >= 37) return max;
    const e1rm = Math.round(s.weight * (36 / (37 - s.reps)));
    return Math.max(max, e1rm);
  }, 0);

  // Timer controls
  const toggleTimer = () => {
    if (isTimerRunning) {
      if (timerInterval) clearInterval(timerInterval);
      setIsTimerRunning(false);
    } else {
      setIsTimerRunning(true);
      const interval = setInterval(() => {
        setRestSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setTimerInterval(interval);
    }
  };

  const resetTimer = (secs: number = 90) => {
    if (timerInterval) clearInterval(timerInterval);
    setIsTimerRunning(false);
    setRestSeconds(secs);
  };

  return (
    <section id="interactive-demo" className="py-12 sm:py-20 lg:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <ScrollReveal delayMs={0} direction="up">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-semibold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Interactive Live Sandbox
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-text-primary">
              Experience Workout Logging{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-emerald-400">
                Without The Clutter
              </span>
            </h2>
            <p className="mt-3 sm:mt-4 text-sm sm:text-lg text-text-muted">
              Click sets to log them, adjust weights, watch your 1RM calculate dynamically, and experience the rest stopwatch. Test it right here in your browser:
            </p>
          </div>
        </ScrollReveal>

        {/* Live Simulator Card */}
        <ScrollReveal delayMs={150} direction="up">
          <div className="max-w-4xl mx-auto rounded-2xl sm:rounded-3xl bg-surface border border-border/80 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-300">
          {/* Card Top Bar / Session Header */}
          <div className="p-4 sm:p-6 bg-surface-raised border-b border-border/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/40 flex items-center justify-center text-accent shrink-0">
                <Dumbbell className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-text-primary">Legs & Push Day A</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Live Session
                  </span>
                </div>
                <p className="text-xs text-text-subtle font-mono">Elapsed: 38:42 • GymLogger v1.0</p>
              </div>
            </div>

            {/* Rest Timer Widget */}
            <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-2.5 px-3.5 py-2 rounded-xl bg-surface border border-border/80 shadow-inner">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-accent shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-semibold text-text-subtle tracking-wider leading-none">
                    Rest Timer
                  </span>
                  <span className="text-sm font-mono font-bold text-text-primary">
                    {Math.floor(restSeconds / 60)}:{(restSeconds % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 ml-2">
                <button
                  type="button"
                  onClick={toggleTimer}
                  className="min-w-[40px] min-h-[40px] sm:min-w-[34px] sm:min-h-[34px] w-10 h-10 sm:w-8 sm:h-8 rounded-lg bg-surface-raised hover:bg-surface-hover text-text-primary border border-border cursor-pointer transition-all flex items-center justify-center active:scale-95"
                  aria-label={isTimerRunning ? 'Pause rest timer' : 'Start rest timer'}
                >
                  {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-accent" />}
                </button>
                <button
                  type="button"
                  onClick={() => resetTimer(90)}
                  className="min-w-[40px] min-h-[40px] sm:min-w-[34px] sm:min-h-[34px] w-10 h-10 sm:w-8 sm:h-8 rounded-lg bg-surface-raised hover:bg-surface-hover text-text-muted hover:text-text-primary border border-border cursor-pointer transition-all flex items-center justify-center active:scale-95"
                  aria-label="Reset rest timer to 90 seconds"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Exercise Selector Tabs */}
          <div className="px-3 sm:px-6 pt-3 pb-2 border-b border-border/60 bg-surface/50 overflow-x-auto flex items-center gap-2 scrollbar-none">
            {EXERCISES.map((ex) => {
              const isActive = ex.id === selectedExerciseId;
              const setsCount = (exerciseSets[ex.id] || []).length;
              const completedCount = (exerciseSets[ex.id] || []).filter((s) => s.isCompleted).length;

              return (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => setSelectedExerciseId(ex.id)}
                  className={`min-h-[44px] px-3.5 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-2 border active:scale-98 ${
                    isActive
                      ? 'bg-accent/15 text-accent border-accent/40 shadow-sm'
                      : 'bg-surface-raised/70 text-text-muted border-transparent hover:text-text-primary hover:bg-surface-raised'
                  }`}
                >
                  <span>{ex.name}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
                      isActive ? 'bg-accent text-accent-foreground font-bold' : 'bg-surface text-text-subtle'
                    }`}
                  >
                    {completedCount}/{setsCount}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Exercise Overview & Live Metrics */}
          <div className="p-4 sm:p-6 bg-surface">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-border/60">
              <div>
                <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                  {currentExercise.name}
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-surface-raised text-text-muted border border-border">
                    {currentExercise.muscle}
                  </span>
                </h3>
                <p className="text-xs text-text-subtle mt-0.5">
                  Category: {currentExercise.category} • Historical 1RM: {currentExercise.historyPR} kg
                </p>
              </div>

            {/* Dynamic Live Metrics Pill */}
              <div className="grid grid-cols-2 sm:flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
                <div className="px-3 sm:px-3.5 py-1.5 rounded-xl bg-surface-raised border border-border/80 text-left">
                  <span className="text-[10px] text-text-subtle uppercase tracking-wider block font-semibold truncate">
                    Total Volume
                  </span>
                  <span className="text-sm sm:text-base font-bold font-mono text-accent">
                    {totalVolume.toLocaleString()} kg
                  </span>
                </div>

                <div className="px-3 sm:px-3.5 py-1.5 rounded-xl bg-surface-raised border border-border/80 text-left">
                  <span className="text-[10px] text-text-subtle uppercase tracking-wider block font-semibold flex items-center gap-1 truncate">
                    <Trophy className="w-3 h-3 text-orange-400 shrink-0" />
                    Est. 1RM
                  </span>
                  <span className="text-sm sm:text-base font-bold font-mono text-orange-400">
                    {estimated1RM > 0 ? `${estimated1RM} kg` : '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile View: Touch-Friendly Set Cards (visible on < md) */}
            <div className="md:hidden mt-4 space-y-2.5">
              {currentSets.map((set) => (
                <div
                  key={set.id}
                  className={`p-3.5 rounded-xl border transition-all duration-200 ${
                    set.isCompleted
                      ? 'bg-accent/10 border-accent/40 shadow-sm'
                      : 'bg-surface-raised/60 border-border/70 hover:border-border'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-xs font-mono font-bold ${
                          set.isCompleted
                            ? 'bg-accent text-accent-foreground'
                            : 'bg-surface text-text-muted border border-border'
                        }`}
                      >
                        {set.setNumber}
                      </span>
                      <span className="text-xs text-text-subtle font-mono">
                        Prev: {set.prev}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-text-muted">
                        @{set.rpe} RPE
                      </span>
                      {set.isPR && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/15 text-orange-400 border border-orange-500/30 font-semibold uppercase">
                          PR
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    {/* Weight stepper */}
                    <div className="flex-1 flex items-center justify-between bg-surface px-1 py-1 rounded-xl border border-border/80">
                      <button
                        type="button"
                        onClick={() => updateWeight(set.id, -2.5)}
                        className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-text-muted hover:text-text-primary rounded-lg hover:bg-surface-raised active:bg-surface-hover active:scale-95 text-lg font-bold cursor-pointer transition-transform"
                        aria-label="Decrease weight"
                      >
                        -
                      </button>
                      <div className="text-center font-mono px-1">
                        <span className="font-bold text-text-primary text-sm sm:text-base">{set.weight}</span>
                        <span className="text-[10px] text-text-subtle ml-0.5">kg</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateWeight(set.id, 2.5)}
                        className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-text-muted hover:text-text-primary rounded-lg hover:bg-surface-raised active:bg-surface-hover active:scale-95 text-lg font-bold cursor-pointer transition-transform"
                        aria-label="Increase weight"
                      >
                        +
                      </button>
                    </div>

                    {/* Reps stepper */}
                    <div className="flex-1 flex items-center justify-between bg-surface px-1 py-1 rounded-xl border border-border/80">
                      <button
                        type="button"
                        onClick={() => updateReps(set.id, -1)}
                        className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-text-muted hover:text-text-primary rounded-lg hover:bg-surface-raised active:bg-surface-hover active:scale-95 text-lg font-bold cursor-pointer transition-transform"
                        aria-label="Decrease reps"
                      >
                        -
                      </button>
                      <div className="text-center font-mono px-1">
                        <span className="font-bold text-text-primary text-sm sm:text-base">{set.reps}</span>
                        <span className="text-[10px] text-text-subtle ml-0.5">reps</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateReps(set.id, 1)}
                        className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-text-muted hover:text-text-primary rounded-lg hover:bg-surface-raised active:bg-surface-hover active:scale-95 text-lg font-bold cursor-pointer transition-transform"
                        aria-label="Increase reps"
                      >
                        +
                      </button>
                    </div>

                    {/* Checkmark Button */}
                    <button
                      type="button"
                      onClick={() => toggleSetComplete(set.id)}
                      className={`w-12 h-12 min-w-[48px] min-h-[48px] rounded-xl inline-flex items-center justify-center shrink-0 transition-all duration-200 cursor-pointer active:scale-90 ${
                        set.isCompleted
                          ? 'bg-emerald-600 text-white'
                          : 'bg-surface border border-border hover:border-accent text-text-subtle hover:text-accent'
                      }`}
                      aria-label={set.isCompleted ? 'Mark set incomplete' : 'Mark set complete'}
                    >
                      <Check className="w-5 h-5 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Set Table (visible on >= md) */}
            <div className="hidden md:block mt-5 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-text-subtle text-[11px] uppercase tracking-wider font-semibold border-b border-border/60">
                    <th className="py-2.5 px-3 w-16">Set</th>
                    <th className="py-2.5 px-3 w-28">Previous</th>
                    <th className="py-2.5 px-3">Weight (kg)</th>
                    <th className="py-2.5 px-3">Reps</th>
                    <th className="py-2.5 px-3 w-20">RPE</th>
                    <th className="py-2.5 px-3 text-center w-24">Complete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {currentSets.map((set) => (
                    <tr
                      key={set.id}
                      className={`transition-colors duration-200 ${
                        set.isCompleted ? 'bg-accent/5' : 'hover:bg-surface-raised/40'
                      }`}
                    >
                      {/* Set Number */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-mono font-bold ${
                            set.isCompleted
                              ? 'bg-accent text-accent-foreground'
                              : 'bg-surface-raised text-text-muted border border-border'
                          }`}
                        >
                          {set.setNumber}
                        </span>
                      </td>

                      {/* Previous Performance */}
                      <td className="py-3 px-3 font-mono text-xs text-text-subtle">
                        {set.prev}
                      </td>

                      {/* Weight controls */}
                      <td className="py-3 px-3">
                        <div className="inline-flex items-center gap-1.5 bg-surface-raised px-2.5 py-1.5 rounded-lg border border-border/70">
                          <button
                            type="button"
                            onClick={() => updateWeight(set.id, -2.5)}
                            className="text-text-subtle hover:text-text-primary px-1 font-bold cursor-pointer"
                            aria-label="Decrease weight by 2.5 kg"
                          >
                            -
                          </button>
                          <span className="font-mono font-bold text-text-primary min-w-[44px] text-center">
                            {set.weight}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateWeight(set.id, 2.5)}
                            className="text-text-subtle hover:text-text-primary px-1 font-bold cursor-pointer"
                            aria-label="Increase weight by 2.5 kg"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* Reps controls */}
                      <td className="py-3 px-3">
                        <div className="inline-flex items-center gap-1.5 bg-surface-raised px-2.5 py-1.5 rounded-lg border border-border/70">
                          <button
                            type="button"
                            onClick={() => updateReps(set.id, -1)}
                            className="text-text-subtle hover:text-text-primary px-1 font-bold cursor-pointer"
                            aria-label="Decrease reps"
                          >
                            -
                          </button>
                          <span className="font-mono font-bold text-text-primary min-w-[28px] text-center">
                            {set.reps}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateReps(set.id, 1)}
                            className="text-text-subtle hover:text-text-primary px-1 font-bold cursor-pointer"
                            aria-label="Increase reps"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* RPE */}
                      <td className="py-3 px-3 font-mono text-xs font-semibold text-text-muted">
                        @{set.rpe}
                      </td>

                      {/* Checkbox Complete */}
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => toggleSetComplete(set.id)}
                          className={`w-9 h-9 rounded-xl inline-flex items-center justify-center transition-all duration-200 cursor-pointer ${
                            set.isCompleted
                              ? 'bg-emerald-600 text-white'
                              : 'bg-surface-raised border border-border hover:border-accent/60 text-text-subtle hover:text-accent'
                          }`}
                          aria-label={set.isCompleted ? 'Mark set incomplete' : 'Mark set complete'}
                        >
                          <Check className="w-5 h-5 stroke-[2.5]" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add Set Button */}
            <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleAddSet}
                className="min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-surface-raised hover:bg-surface-hover text-text-primary border border-border/80 hover:border-accent/40 active:scale-95 transition-all cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4 text-accent" />
                <span>Add Set</span>
              </button>

              <span className="text-[11px] sm:text-xs text-text-subtle font-mono text-center sm:text-right">
                Auto-saved locally in interactive sandbox
              </span>
            </div>
          </div>

          {/* Interactive Footer Call To Action */}
          <div className="p-4 sm:p-6 bg-gradient-to-r from-surface-raised via-surface to-surface-raised border-t border-border/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="p-2.5 rounded-xl bg-accent/10 text-accent hidden sm:flex">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-text-primary">
                  Ready to log your real workouts and unlock unlimited historical analytics?
                </p>
                <p className="text-xs text-text-muted">
                  Create your free account in 30 seconds. No credit card required.
                </p>
              </div>
            </div>

            <Link
              href="/register"
              className="min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-accent text-accent-foreground text-sm font-bold shadow-lg hover:bg-accent-hover active:scale-98 transition-all duration-200 cursor-pointer whitespace-nowrap group"
            >
              <span>Register Now</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
