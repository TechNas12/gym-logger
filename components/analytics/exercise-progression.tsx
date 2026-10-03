'use client';

import React, { useState, useMemo, useId } from 'react';
import type { ExerciseProgressionItem } from '@/lib/types/analytics';
import {
  Dumbbell,
  Sparkles,
  Trophy,
  Search,
  ChevronDown,
  ArrowUpRight,
  Calendar,
  Check,
} from 'lucide-react';

interface ExerciseProgressionProps {
  exercises: ExerciseProgressionItem[];
}

export function ExerciseProgression({ exercises }: ExerciseProgressionProps) {
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>(
    exercises.length > 0 ? exercises[0].exerciseId : ''
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [metric, setMetric] = useState<'est1rm' | 'maxWeight' | 'volume'>('est1rm');
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);
  const gradientId = useId();

  // Filtered exercises for dropdown
  const filteredExercises = useMemo(() => {
    if (!searchQuery.trim()) return exercises;
    return exercises.filter((ex) =>
      ex.exerciseName.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );
  }, [exercises, searchQuery]);

  // Selected exercise item
  const selectedExercise =
    exercises.find((ex) => ex.exerciseId === selectedExerciseId) || exercises[0] || null;

  if (!selectedExercise) {
    return (
      <div className="rounded-3xl bg-surface border border-border p-10 text-center text-text-muted text-sm flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-surface-raised border border-border text-purple-400 flex items-center justify-center">
          <Dumbbell className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-bold text-text-primary text-base">Exercise Trajectory & 1RM Modeling</h4>
          <p className="text-xs text-text-muted mt-1 max-w-sm">
            Complete sets with weights and reps in your workouts to track 1RM strength curves and milestones over time.
          </p>
        </div>
      </div>
    );
  }

  const history = selectedExercise.history || [];

  // Values based on selected metric
  const pointsData = history.map((session) => {
    let val = 0;
    if (metric === 'est1rm') val = session.bestEst1rmKg || 0;
    else if (metric === 'maxWeight') val = session.maxWeightKg || 0;
    else val = session.volumeKg;
    return { session, val };
  });

  const values = pointsData.map((p) => p.val);
  const maxValue = Math.max(...values, 10);
  const minValue = Math.min(...values.filter((v) => v > 0), 0);

  // SVG Chart Dimensions
  const svgWidth = 600;
  const svgHeight = 220;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 35;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  // Chart coordinates
  const points = pointsData.map((p, index) => {
    const x =
      pointsData.length > 1
        ? paddingLeft + (index / (pointsData.length - 1)) * chartWidth
        : paddingLeft + chartWidth / 2;
    const yRange = maxValue - minValue || 1;
    const y =
      paddingTop +
      chartHeight -
      ((p.val - minValue) / yRange) * chartHeight;
    return { x, y, session: p.session, val: p.val };
  });

  // SVG Line path
  const linePath = points.reduce((acc, point, i, arr) => {
    if (i === 0) return `M ${point.x} ${point.y}`;
    const prev = arr[i - 1];
    const cpX1 = prev.x + (point.x - prev.x) / 2;
    const cpX2 = prev.x + (point.x - prev.x) / 2;
    return `${acc} C ${cpX1} ${prev.y}, ${cpX2} ${point.y}, ${point.x} ${point.y}`;
  }, '');

  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  const zeroY = paddingTop + chartHeight;
  const areaPath =
    points.length > 1
      ? `${linePath} L ${lastPoint.x} ${zeroY} L ${firstPoint.x} ${zeroY} Z`
      : '';

  const activePoint = hoveredPointIndex !== null ? points[hoveredPointIndex] : null;

  return (
    <div className="rounded-3xl bg-surface border border-border p-5 sm:p-7 flex flex-col gap-4">
      {/* Top Header & Exercise Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/70">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <Dumbbell className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-text-primary tracking-tight">
              Exercise 1RM & Strength Trajectory
            </h3>
          </div>
          <p className="text-xs text-text-muted mt-0.5">
            Estimated 1RM curves, personal breakthroughs, and set history.
          </p>
        </div>

        {/* Exercise Selector Dropdown / Search */}
        <div className="relative w-full sm:w-72">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-surface-raised border border-border hover:border-purple-500/50 text-text-primary text-xs font-semibold focus-ring transition-colors cursor-pointer"
          >
            <span className="truncate">{selectedExercise.exerciseName}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-text-muted transition-transform ${
                isDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-full z-30 rounded-2xl bg-surface-raised border border-border shadow-2xl p-2 animate-in fade-in">
              <div className="relative mb-2">
                <Search className="w-3.5 h-3.5 text-text-subtle absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter exercises..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-surface border border-border text-xs text-text-primary placeholder:text-text-subtle focus-ring"
                  autoFocus
                />
              </div>

              <div className="max-h-60 overflow-y-auto space-y-0.5 no-scrollbar">
                {filteredExercises.map((ex) => (
                  <button
                    key={ex.exerciseId}
                    type="button"
                    onClick={() => {
                      setSelectedExerciseId(ex.exerciseId);
                      setIsDropdownOpen(false);
                      setHoveredPointIndex(null);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                      ex.exerciseId === selectedExerciseId
                        ? 'bg-purple-500/15 text-purple-400 font-bold'
                        : 'text-text-muted hover:text-text-primary hover:bg-surface-hover'
                    }`}
                  >
                    <span className="truncate">{ex.exerciseName}</span>
                    <span className="text-[10px] font-mono text-text-subtle shrink-0">
                      {ex.sessionsCount} {ex.sessionsCount === 1 ? 'log' : 'logs'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4 Stat Cards for the Selected Exercise */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
        <div className="p-3.5 rounded-2xl bg-surface-raised border border-border/70">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-subtle block">
            All-Time 1RM
          </span>
          <div className="text-xl sm:text-2xl font-black font-mono text-purple-400 mt-1">
            {selectedExercise.allTimeBest1rmKg ? `${selectedExercise.allTimeBest1rmKg} kg` : '—'}
          </div>
          <span className="text-[11px] text-text-muted">Estimated peak single</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-surface-raised border border-border/70">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-subtle block">
            Max Weight Lifted
          </span>
          <div className="text-xl sm:text-2xl font-black font-mono text-text-primary mt-1">
            {selectedExercise.allTimeMaxWeightKg ? `${selectedExercise.allTimeMaxWeightKg} kg` : '—'}
          </div>
          <span className="text-[11px] text-text-muted">Heaviest successful set</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-surface-raised border border-border/70">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-subtle block">
            Progression Delta
          </span>
          <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400 mt-1 flex items-center">
            {selectedExercise.progressionGainPercent !== null ? (
              <>
                <ArrowUpRight className="w-5 h-5 mr-0.5 text-emerald-400" />
                +{selectedExercise.progressionGainPercent}%
              </>
            ) : (
              'Baseline'
            )}
          </div>
          <span className="text-[11px] text-text-muted">Since first recorded session</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-surface-raised border border-border/70">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-subtle block">
            Recorded Sessions
          </span>
          <div className="text-xl sm:text-2xl font-black font-mono text-text-primary mt-1">
            {selectedExercise.sessionsCount}
          </div>
          <span className="text-[11px] text-text-muted">Completed workouts</span>
        </div>
      </div>

      {/* Metric Toggle Buttons */}
      <div className="flex items-center justify-between gap-2 pb-2">
        <span className="text-xs font-semibold text-text-muted hidden sm:inline">
          Progression Curve:
        </span>
        <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-raised border border-border/80 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              setMetric('est1rm');
              setHoveredPointIndex(null);
            }}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              metric === 'est1rm'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Estimated 1RM
          </button>
          <button
            type="button"
            onClick={() => {
              setMetric('maxWeight');
              setHoveredPointIndex(null);
            }}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              metric === 'maxWeight'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Max Weight (kg)
          </button>
          <button
            type="button"
            onClick={() => {
              setMetric('volume');
              setHoveredPointIndex(null);
            }}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              metric === 'volume'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Session Volume
          </button>
        </div>
      </div>

      {/* Progression Line Chart */}
      <div className="relative mt-2 w-full aspect-[21/9] min-h-[220px] max-h-[300px]">
        {points.length > 0 ? (
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-full overflow-visible select-none"
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            {[0, 0.5, 1].map((pct, idx) => {
              const yVal = minValue + (maxValue - minValue) * pct;
              const y = paddingTop + chartHeight - pct * chartHeight;
              return (
                <g key={idx}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={svgWidth - paddingRight}
                    y2={y}
                    stroke="#27272a"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <text
                    x={paddingLeft - 8}
                    y={y + 3}
                    textAnchor="end"
                    fontSize="10"
                    fill="#71717a"
                    fontFamily="monospace"
                  >
                    {Math.round(yVal)}
                  </text>
                </g>
              );
            })}

            {/* Area Fill */}
            {areaPath && <path d={areaPath} fill={`url(#${gradientId})`} />}

            {/* Main Path */}
            {points.length > 1 && (
              <path
                d={linePath}
                fill="none"
                stroke="#a855f7"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Points & PR Indicators */}
            {points.map((p, idx) => {
              const isPr = p.session.isPr;
              return (
                <g key={idx}>
                  {isPr ? (
                    <g>
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r="7"
                        fill="#fbbf24"
                        stroke="#0a0a0a"
                        strokeWidth="2"
                      />
                      <circle cx={p.x} cy={p.y} r="2" fill="#0a0a0a" />
                    </g>
                  ) : (
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="4.5"
                      fill="#a855f7"
                      stroke="#0a0a0a"
                      strokeWidth="2"
                    />
                  )}
                </g>
              );
            })}

            {/* Hover Crosshair & Tooltip */}
            {activePoint && (
              <g>
                <line
                  x1={activePoint.x}
                  y1={paddingTop}
                  x2={activePoint.x}
                  y2={zeroY}
                  stroke="#a855f7"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <circle
                  cx={activePoint.x}
                  cy={activePoint.y}
                  r="7"
                  fill="#c084fc"
                  stroke="#0a0a0a"
                  strokeWidth="2.5"
                />
              </g>
            )}

            {/* Interactive overlay */}
            {points.map((p, idx) => (
              <circle
                key={idx}
                cx={p.x}
                cy={p.y}
                r="18"
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPointIndex(idx)}
                onTouchStart={() => setHoveredPointIndex(idx)}
              />
            ))}
          </svg>
        ) : (
          <div className="h-full flex items-center justify-center text-text-muted text-xs">
            No chartable data points.
          </div>
        )}

        {/* Hover Tooltip Box */}
        {activePoint && (
          <div className="absolute top-2 right-4 z-10 p-3 rounded-2xl bg-surface-raised/95 backdrop-blur-md border border-purple-500/30 shadow-xl pointer-events-none transition-all duration-150 animate-in fade-in">
            <div className="flex items-center gap-1.5 mb-1">
              <Calendar className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-xs font-bold text-text-primary">
                {new Date(activePoint.session.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
              {activePoint.session.isPr && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                  <Trophy className="w-2.5 h-2.5" /> PR
                </span>
              )}
            </div>
            <div className="space-y-0.5 text-xs">
              <div className="text-text-muted">Top Set: <strong className="text-text-primary">{activePoint.session.topSetDescription}</strong></div>
              <div className="text-text-muted">Est. 1RM: <strong className="text-purple-400 font-mono">{activePoint.session.bestEst1rmKg || '—'} kg</strong></div>
              <div className="text-text-muted">Session Vol: <strong className="text-text-primary font-mono">{activePoint.session.volumeKg.toLocaleString()} kg</strong></div>
            </div>
          </div>
        )}
      </div>

      {/* Historical Session Breakdown Logs */}
      <div className="mt-6 pt-4 border-t border-border/60">
        <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary mb-3">
          Session History Logs ({history.length})
        </h4>

        <div className="max-h-56 overflow-y-auto space-y-2 no-scrollbar">
          {[...history].reverse().map((session, index) => (
            <div
              key={index}
              className="p-3 rounded-xl bg-surface-raised border border-border/70 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                {session.isPr ? (
                  <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                    <Trophy className="w-3.5 h-3.5" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-surface border border-border text-text-subtle flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                )}
                <div>
                  <div className="font-semibold text-text-primary flex items-center gap-1.5">
                    <span>{session.topSetDescription}</span>
                    {session.isPr && (
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-mono">
                        PR
                      </span>
                    )}
                  </div>
                  <div suppressHydrationWarning className="text-[11px] text-text-subtle">
                    {new Date(session.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}{' '}
                    • {session.workoutName}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-mono font-bold text-purple-400">
                  {session.bestEst1rmKg ? `${session.bestEst1rmKg} kg 1RM` : '—'}
                </div>
                <div className="text-[11px] text-text-subtle font-mono">
                  {session.volumeKg.toLocaleString()} kg vol
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
