'use client';

import React, { useState } from 'react';
import type { PersonalRecordItem } from '@/lib/types/analytics';
import { Trophy, Sparkles, Calendar, Award } from 'lucide-react';

interface PrTrophyRoomProps {
  records: PersonalRecordItem[];
}

export function PrTrophyRoom({ records }: PrTrophyRoomProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  // Categories available for filtering
  const filterOptions = [
    { id: 'all', label: 'All Records' },
    { id: 'chest', label: 'Chest' },
    { id: 'back', label: 'Back' },
    { id: 'legs', label: 'Legs' },
    { id: 'shoulders', label: 'Shoulders' },
    { id: 'arms', label: 'Arms' },
  ];

  const filteredRecords = records.filter((rec) => {
    if (selectedFilter === 'all') return true;
    const bodyPart = (rec.bodyPart || '').toLowerCase();
    if (selectedFilter === 'chest') return bodyPart.includes('chest');
    if (selectedFilter === 'back') return bodyPart.includes('back');
    if (selectedFilter === 'legs') return bodyPart.includes('leg');
    if (selectedFilter === 'shoulders') return bodyPart.includes('shoulder');
    if (selectedFilter === 'arms') return bodyPart.includes('arm');
    return true;
  });

  return (
    <div className="rounded-3xl bg-surface border border-border p-5 sm:p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/70">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-text-primary tracking-tight">
              Personal Records Hall of Fame
            </h3>
          </div>
          <p className="text-xs text-text-muted mt-0.5">
            All-time strength milestones and peak estimated single-rep records.
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold font-mono self-start sm:self-auto">
          <Award className="w-3.5 h-3.5" />
          <span>{records.length} Records</span>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
        {filterOptions.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => setSelectedFilter(opt.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedFilter === opt.id
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm'
                : 'bg-surface-raised border border-border/70 text-text-muted hover:text-text-primary'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* PR Cards Grid - strictly 2 columns for optimal readability */}
      {filteredRecords.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {filteredRecords.map((record) => (
            <div
              key={record.id}
              className="relative group rounded-2xl bg-surface-raised border border-border/80 hover:border-amber-500/40 p-4 transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-sm"
            >
              <div>
                {/* Muscle category tag & Recent PR badge */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-subtle font-mono px-2 py-0.5 rounded-md bg-surface border border-border/80 truncate">
                    {record.bodyPart || record.category || 'Strength'}
                  </span>

                  {record.isRecent ? (
                    <span className="shrink-0 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-bold font-mono uppercase flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" /> Recent
                    </span>
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-surface border border-border text-amber-400/70 flex items-center justify-center shrink-0">
                      <Trophy className="w-2.5 h-2.5" />
                    </div>
                  )}
                </div>

                {/* Full Exercise Name without truncation */}
                <h4 className="text-sm font-bold text-text-primary leading-snug min-h-[2.5rem] flex items-center group-hover:text-amber-400 transition-colors">
                  {record.exerciseName}
                </h4>

                {/* Est. 1RM Highlight Box */}
                <div className="my-2.5 p-3 rounded-xl bg-surface border border-border/70 flex items-baseline justify-between">
                  <span className="text-xs text-text-muted font-medium">Est. 1RM</span>
                  <div className="text-xl sm:text-2xl font-black font-mono text-amber-400">
                    {record.bestEst1rmKg}{' '}
                    <span className="text-xs font-normal text-text-subtle font-sans">kg</span>
                  </div>
                </div>

                {/* Best Set Breakdown on a single clean line */}
                <div className="flex items-center justify-between text-xs text-text-muted pt-1">
                  <span>Record Set:</span>
                  <span className="font-mono font-bold text-text-primary">
                    {record.weightKg} kg × {record.reps} {record.reps === 1 ? 'rep' : 'reps'}
                  </span>
                </div>
              </div>

              {/* Date & Workout Footer */}
              <div className="mt-3.5 pt-2.5 border-t border-border/60 flex items-center justify-between text-[11px] text-text-subtle">
                <span suppressHydrationWarning className="flex items-center gap-1 font-mono">
                  <Calendar className="w-3 h-3 text-text-subtle shrink-0" />
                  {new Date(record.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <span className="truncate max-w-[130px] text-right text-text-muted">
                  {record.workoutName}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center text-text-muted text-xs rounded-2xl bg-surface-raised border border-border/60 flex flex-col items-center justify-center gap-2">
          <Trophy className="w-8 h-8 text-text-subtle" />
          <h4 className="font-bold text-text-primary text-sm">No Personal Records Yet</h4>
          <p className="text-[11px] text-text-muted max-w-xs">
            Complete sets in your workouts to automatically detect breakthroughs and showcase all-time PRs.
          </p>
        </div>
      )}
    </div>
  );
}
