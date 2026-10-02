import type {
  AnalyticsTimeRange,
  AnalyticsKpiSummary,
  VolumeTrendPoint,
  MuscleGroupDistribution,
  ExerciseProgressionItem,
  ExerciseSessionLog,
  PersonalRecordItem,
  FullAnalyticsData,
  DashboardAnalyticsKpi,
} from './types/analytics';

// Color map for muscle groups
const MUSCLE_COLORS: Record<string, string> = {
  chest: '#38bdf8', // sky-400
  back: '#818cf8', // indigo-400
  legs: '#34d399', // emerald-400
  shoulders: '#fbbf24', // amber-400
  arms: '#f472b6', // pink-400
  core: '#a78bfa', // purple-400
  cardio: '#fb7185', // rose-400
  other: '#94a3b8', // slate-400
};

export const MUSCLE_GROUP_DEFINITIONS = [
  { id: 'chest', name: 'Chest', keywords: ['chest', 'pectoralis', 'serratus'] },
  { id: 'back', name: 'Back', keywords: ['back', 'lat', 'trap', 'spine', 'rhomboid', 'erector'] },
  { id: 'legs', name: 'Legs', keywords: ['leg', 'quad', 'hamstring', 'glute', 'calf', 'calves', 'thigh', 'adductor', 'abductor'] },
  { id: 'shoulders', name: 'Shoulders', keywords: ['shoulder', 'delt'] },
  { id: 'arms', name: 'Arms', keywords: ['arm', 'bicep', 'tricep', 'forearm', 'brachii'] },
  { id: 'core', name: 'Core & Abs', keywords: ['waist', 'ab', 'core', 'oblique'] },
  { id: 'cardio', name: 'Cardio', keywords: ['cardio', 'conditioning', 'aerobic'] },
];

export function mapBodyPartToGroup(bodyPart?: string | null, target?: string | null): string {
  const text = `${bodyPart || ''} ${target || ''}`.toLowerCase();
  for (const group of MUSCLE_GROUP_DEFINITIONS) {
    if (group.keywords.some((kw) => text.includes(kw))) {
      return group.id;
    }
  }
  return 'other';
}

/**
 * Filter workouts by selected time range
 */
export function getTimeRangeCutoffDate(range: AnalyticsTimeRange, now: Date = new Date()): Date {
  const cutoff = new Date(now);
  switch (range) {
    case '7d':
      cutoff.setDate(cutoff.getDate() - 7);
      break;
    case '30d':
      cutoff.setDate(cutoff.getDate() - 30);
      break;
    case '90d':
      cutoff.setDate(cutoff.getDate() - 90);
      break;
    case '1y':
      cutoff.setFullYear(cutoff.getFullYear() - 1);
      break;
    case 'all':
      return new Date(0); // Epoch
  }
  return cutoff;
}

/**
 * Calculate weekly streak (how many consecutive weeks with at least 1 workout)
 */
export function calculateWeeklyStreak(workoutDates: Date[]): number {
  if (workoutDates.length === 0) return 0;

  // Sort descending
  const sorted = [...workoutDates].sort((a, b) => b.getTime() - a.getTime());

  // Get week identifier "YYYY-WW"
  const getWeekId = (d: Date) => {
    const target = new Date(d.valueOf());
    const dayNr = (d.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
    }
    const weekNr = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
    return `${target.getFullYear()}-W${weekNr.toString().padStart(2, '0')}`;
  };

  const currentWeekId = getWeekId(new Date());
  const uniqueWeeks = Array.from(new Set(sorted.map(getWeekId)));

  if (uniqueWeeks.length === 0) return 0;

  // Check if current week or previous week is in uniqueWeeks
  const now = new Date();
  const prevWeekDate = new Date();
  prevWeekDate.setDate(now.getDate() - 7);
  const prevWeekId = getWeekId(prevWeekDate);

  if (uniqueWeeks[0] !== currentWeekId && uniqueWeeks[0] !== prevWeekId) {
    return 0; // Streak broken
  }

  // Count consecutive weeks
  let streak = 0;
  let expectedDate = uniqueWeeks[0] === currentWeekId ? new Date() : prevWeekDate;

  for (const week of uniqueWeeks) {
    const expectedWeekId = getWeekId(expectedDate);
    if (week === expectedWeekId) {
      streak++;
      expectedDate.setDate(expectedDate.getDate() - 7);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Process raw workouts and generate FullAnalyticsData
 */
export function computeAnalyticsData(
  allWorkouts: any[],
  timeRange: AnalyticsTimeRange = '30d'
): FullAnalyticsData {
  const hasRealWorkouts = allWorkouts.length > 0;

  const now = new Date();
  const cutoff = getTimeRangeCutoffDate(timeRange, now);
  const rangeDurationMs = now.getTime() - cutoff.getTime();
  const prevPeriodCutoff = new Date(cutoff.getTime() - rangeDurationMs);

  // Filter workouts for current range and previous range for delta comparisons
  const workoutsInRange = allWorkouts.filter((w) => {
    if (!w.started_at) return false;
    const d = new Date(w.started_at);
    return d >= cutoff && d <= now;
  });

  const workoutsInPrevRange = allWorkouts.filter((w) => {
    if (!w.started_at) return false;
    const d = new Date(w.started_at);
    return d >= prevPeriodCutoff && d < cutoff;
  });

  // Calculate volume & sets for current period
  let currentVolumeKg = 0;
  let currentSetsCount = 0;
  let currentRepsCount = 0;
  let totalDurationMinutes = 0;
  let validDurationCount = 0;

  for (const w of workoutsInRange) {
    if (w.started_at && w.ended_at) {
      const dur = Math.max(0, (new Date(w.ended_at).getTime() - new Date(w.started_at).getTime()) / 60000);
      if (dur > 0 && dur < 360) {
        totalDurationMinutes += dur;
        validDurationCount++;
      }
    }

    for (const we of w.workout_exercises || []) {
      for (const s of we.sets || []) {
        if (s.is_completed) {
          currentSetsCount++;
          if (s.reps) currentRepsCount += Number(s.reps);
          if (s.set_type !== 'warmup' && s.weight_kg && s.reps) {
            currentVolumeKg += Number(s.weight_kg) * Number(s.reps);
          }
        }
      }
    }
  }

  // Calculate previous period volume for delta
  let prevVolumeKg = 0;
  for (const w of workoutsInPrevRange) {
    for (const we of w.workout_exercises || []) {
      for (const s of we.sets || []) {
        if (s.is_completed && s.set_type !== 'warmup' && s.weight_kg && s.reps) {
          prevVolumeKg += Number(s.weight_kg) * Number(s.reps);
        }
      }
    }
  }

  const volumeChangePercent =
    prevVolumeKg > 0 ? Math.round(((currentVolumeKg - prevVolumeKg) / prevVolumeKg) * 1000) / 10 : null;

  const workoutsChangeCount =
    workoutsInPrevRange.length > 0 ? workoutsInRange.length - workoutsInPrevRange.length : null;

  const avgDurationMinutes =
    validDurationCount > 0 ? Math.round(totalDurationMinutes / validDurationCount) : 0;

  // Streak
  const workoutDates = allWorkouts
    .filter((w) => w.started_at)
    .map((w) => new Date(w.started_at));
  const currentStreakWeeks = calculateWeeklyStreak(workoutDates);

  // -------------------------------------------------------------
  // 1. Volume & Frequency Trends (bucketing)
  // -------------------------------------------------------------
  const volumeTrends = bucketVolumeTrends(workoutsInRange, timeRange, cutoff, now);

  // -------------------------------------------------------------
  // 2. Muscle Group Distribution
  // -------------------------------------------------------------
  const muscleDistribution = computeMuscleDistribution(workoutsInRange);

  // -------------------------------------------------------------
  // 3. Exercise Progression & PRs (calculated across all time for accurate PRs)
  // -------------------------------------------------------------
  const { exercises, personalRecords, totalPrsCount } = computeExerciseProgressionAndPRs(
    allWorkouts,
    cutoff,
    now
  );

  const kpi: AnalyticsKpiSummary = {
    totalVolumeKg: Math.round(currentVolumeKg),
    volumeChangePercent,
    totalWorkouts: workoutsInRange.length,
    workoutsChangeCount,
    totalSets: currentSetsCount,
    totalReps: currentRepsCount,
    avgDurationMinutes,
    currentStreakWeeks,
    totalPrsCount,
  };

  return {
    timeRange,
    kpi,
    volumeTrends,
    muscleDistribution,
    exercises,
    personalRecords,
    hasRealWorkouts: true,
    totalRecordedWorkoutsCount: allWorkouts.length,
  };
}

/**
 * Bucket workouts into timeline data points (day / week / month)
 */
function bucketVolumeTrends(
  workouts: any[],
  timeRange: AnalyticsTimeRange,
  cutoff: Date,
  now: Date
): VolumeTrendPoint[] {
  // Sort workouts ascending
  const sorted = [...workouts].sort(
    (a, b) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime()
  );

  if (timeRange === '7d') {
    // 7 daily points
    const points: VolumeTrendPoint[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });

      const dayWorkouts = sorted.filter((w) => w.started_at && w.started_at.slice(0, 10) === dayStr);
      let vol = 0;
      let sets = 0;
      let reps = 0;

      for (const w of dayWorkouts) {
        for (const we of w.workout_exercises || []) {
          for (const s of we.sets || []) {
            if (s.is_completed) {
              sets++;
              if (s.reps) reps += Number(s.reps);
              if (s.set_type !== 'warmup' && s.weight_kg && s.reps) {
                vol += Number(s.weight_kg) * Number(s.reps);
              }
            }
          }
        }
      }

      points.push({
        date: dayStr,
        label,
        volumeKg: Math.round(vol),
        workoutCount: dayWorkouts.length,
        setsCount: sets,
        avgIntensityKg: reps > 0 ? Math.round((vol / reps) * 10) / 10 : 0,
      });
    }
    return points;
  }

  if (timeRange === '30d') {
    // Group into 6 five-day blocks or daily if fewer points
    const points: VolumeTrendPoint[] = [];
    const numBuckets = 10;
    const bucketDurationMs = (now.getTime() - cutoff.getTime()) / numBuckets;

    for (let i = 0; i < numBuckets; i++) {
      const bStart = new Date(cutoff.getTime() + i * bucketDurationMs);
      const bEnd = new Date(cutoff.getTime() + (i + 1) * bucketDurationMs);
      const label = bStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const bucketWorkouts = sorted.filter((w) => {
        const t = new Date(w.started_at).getTime();
        return t >= bStart.getTime() && t < bEnd.getTime();
      });

      let vol = 0;
      let sets = 0;
      let reps = 0;

      for (const w of bucketWorkouts) {
        for (const we of w.workout_exercises || []) {
          for (const s of we.sets || []) {
            if (s.is_completed) {
              sets++;
              if (s.reps) reps += Number(s.reps);
              if (s.set_type !== 'warmup' && s.weight_kg && s.reps) {
                vol += Number(s.weight_kg) * Number(s.reps);
              }
            }
          }
        }
      }

      points.push({
        date: bStart.toISOString(),
        label,
        volumeKg: Math.round(vol),
        workoutCount: bucketWorkouts.length,
        setsCount: sets,
        avgIntensityKg: reps > 0 ? Math.round((vol / reps) * 10) / 10 : 0,
      });
    }
    return points;
  }

  // 90d, 1y, or all -> Weekly or monthly buckets
  const points: VolumeTrendPoint[] = [];
  const numBuckets = timeRange === '90d' ? 12 : 12;
  const bucketDurationMs = (now.getTime() - cutoff.getTime()) / numBuckets;

  for (let i = 0; i < numBuckets; i++) {
    const bStart = new Date(cutoff.getTime() + i * bucketDurationMs);
    const bEnd = new Date(cutoff.getTime() + (i + 1) * bucketDurationMs);
    const label = bStart.toLocaleDateString('en-US', {
      month: 'short',
      day: timeRange === '90d' ? 'numeric' : undefined,
    });

    const bucketWorkouts = sorted.filter((w) => {
      const t = new Date(w.started_at).getTime();
      return t >= bStart.getTime() && t < bEnd.getTime();
    });

    let vol = 0;
    let sets = 0;
    let reps = 0;

    for (const w of bucketWorkouts) {
      for (const we of w.workout_exercises || []) {
        for (const s of we.sets || []) {
          if (s.is_completed) {
            sets++;
            if (s.reps) reps += Number(s.reps);
            if (s.set_type !== 'warmup' && s.weight_kg && s.reps) {
              vol += Number(s.weight_kg) * Number(s.reps);
            }
          }
        }
      }
    }

    points.push({
      date: bStart.toISOString(),
      label,
      volumeKg: Math.round(vol),
      workoutCount: bucketWorkouts.length,
      setsCount: sets,
      avgIntensityKg: reps > 0 ? Math.round((vol / reps) * 10) / 10 : 0,
    });
  }

  return points;
}

/**
 * Compute muscle group sets & volume distribution
 */
function computeMuscleDistribution(workouts: any[]): MuscleGroupDistribution[] {
  const groupStats = new Map<string, { sets: number; volume: number; bodyParts: Set<string> }>();

  for (const def of MUSCLE_GROUP_DEFINITIONS) {
    groupStats.set(def.id, { sets: 0, volume: 0, bodyParts: new Set() });
  }

  let totalSets = 0;

  for (const w of workouts) {
    for (const we of w.workout_exercises || []) {
      const ex = we.exercise;
      const groupId = mapBodyPartToGroup(ex?.body_part, ex?.target);
      const stat = groupStats.get(groupId) || { sets: 0, volume: 0, bodyParts: new Set() };

      if (ex?.body_part) stat.bodyParts.add(ex.body_part);

      for (const s of we.sets || []) {
        if (s.is_completed) {
          stat.sets++;
          totalSets++;
          if (s.set_type !== 'warmup' && s.weight_kg && s.reps) {
            stat.volume += Number(s.weight_kg) * Number(s.reps);
          }
        }
      }
      groupStats.set(groupId, stat);
    }
  }

  const result: MuscleGroupDistribution[] = [];

  for (const def of MUSCLE_GROUP_DEFINITIONS) {
    const stat = groupStats.get(def.id);
    const sets = stat ? stat.sets : 0;
    const vol = stat ? stat.volume : 0;
    const pct = totalSets > 0 ? Math.round((sets / totalSets) * 1000) / 10 : 0;

    result.push({
      id: def.id,
      name: def.name,
      bodyParts: stat ? Array.from(stat.bodyParts) : [],
      setsCount: sets,
      volumeKg: Math.round(vol),
      percentage: pct,
      color: MUSCLE_COLORS[def.id] || '#22c55e',
    });
  }

  // Sort by sets count descending
  return result.sort((a, b) => b.setsCount - a.setsCount);
}

/**
 * Compute exercise 1RM trajectories, milestones, and personal records
 */
function computeExerciseProgressionAndPRs(
  allWorkouts: any[],
  cutoff: Date,
  now: Date
): {
  exercises: ExerciseProgressionItem[];
  personalRecords: PersonalRecordItem[];
  totalPrsCount: number;
} {
  // Sort all workouts chronologically
  const sortedWorkouts = [...allWorkouts].sort(
    (a, b) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime()
  );

  const exerciseMap = new Map<
    string,
    {
      name: string;
      bodyPart: string | null;
      target: string | null;
      category: string | null;
      sessions: Map<string, ExerciseSessionLog>;
      allTimeMaxWeight: number;
      allTimeBest1rm: number;
    }
  >();

  // Track historical PR progression
  const exerciseHistoricalBest1rm = new Map<string, number>();
  let prsInScopeCount = 0;
  const prItems: PersonalRecordItem[] = [];

  for (const w of sortedWorkouts) {
    const workoutDate = w.started_at || w.created_at;
    const workoutTime = new Date(workoutDate).getTime();
    const isWithinSelectedRange = workoutTime >= cutoff.getTime() && workoutTime <= now.getTime();
    const isWithinLast30Days = workoutTime >= now.getTime() - 30 * 86400000;

    for (const we of w.workout_exercises || []) {
      const exId = we.exercise_id;
      const ex = we.exercise;
      const exName = ex?.name || 'Exercise';

      if (!exerciseMap.has(exId)) {
        exerciseMap.set(exId, {
          name: exName,
          bodyPart: ex?.body_part || null,
          target: ex?.target || null,
          category: ex?.category || null,
          sessions: new Map(),
          allTimeMaxWeight: 0,
          allTimeBest1rm: 0,
        });
      }

      const exEntry = exerciseMap.get(exId)!;
      let sessionMaxWeight = 0;
      let sessionBest1rm = 0;
      let sessionVolume = 0;
      let completedSets = 0;
      let topSetDesc = '';
      let isSessionPr = false;

      const priorBest1rm = exerciseHistoricalBest1rm.get(exId) || 0;

      for (const s of we.sets || []) {
        if (!s.is_completed) continue;
        completedSets++;

        const weight = s.weight_kg ? Number(s.weight_kg) : 0;
        const reps = s.reps ? Number(s.reps) : 0;

        if (s.set_type !== 'warmup' && weight > 0 && reps > 0) {
          sessionVolume += weight * reps;
        }

        if (weight > sessionMaxWeight) {
          sessionMaxWeight = weight;
        }

        // Est 1RM
        let est1rm = s.est_1rm_kg ? Number(s.est_1rm_kg) : 0;
        if (!est1rm && weight > 0 && reps > 0 && reps <= 30) {
          est1rm = Math.round(weight * (1 + reps / 30.0) * 100) / 100;
        }

        if (est1rm > sessionBest1rm) {
          sessionBest1rm = est1rm;
          topSetDesc = `${weight} kg × ${reps} reps`;
        }

        if (est1rm > priorBest1rm && est1rm > 0) {
          isSessionPr = true;
          exerciseHistoricalBest1rm.set(exId, est1rm);

          if (isWithinSelectedRange) {
            prsInScopeCount++;
          }

          prItems.push({
            id: `${exId}-${s.id || s.set_number}-${workoutTime}`,
            exerciseId: exId,
            exerciseName: exName,
            bodyPart: ex?.body_part || null,
            category: ex?.category || null,
            bestEst1rmKg: est1rm,
            weightKg: weight,
            reps: reps,
            date: workoutDate,
            workoutName: w.name || 'Workout',
            isRecent: isWithinLast30Days,
          });
        }
      }

      if (completedSets > 0) {
        if (sessionMaxWeight > exEntry.allTimeMaxWeight) {
          exEntry.allTimeMaxWeight = sessionMaxWeight;
        }
        if (sessionBest1rm > exEntry.allTimeBest1rm) {
          exEntry.allTimeBest1rm = sessionBest1rm;
        }

        exEntry.sessions.set(w.id, {
          workoutId: w.id,
          workoutName: w.name || 'Workout',
          date: workoutDate,
          bestEst1rmKg: sessionBest1rm > 0 ? sessionBest1rm : null,
          maxWeightKg: sessionMaxWeight > 0 ? sessionMaxWeight : null,
          volumeKg: Math.round(sessionVolume),
          completedSetsCount: completedSets,
          topSetDescription: topSetDesc || `${sessionMaxWeight} kg`,
          isPr: isSessionPr,
        });
      }
    }
  }

  // Format exercises list
  const exercisesResult: ExerciseProgressionItem[] = [];

  for (const [exId, data] of exerciseMap.entries()) {
    const history = Array.from(data.sessions.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    if (history.length === 0) continue;

    const firstValid1rm = history.find((h) => h.bestEst1rmKg && h.bestEst1rmKg > 0)?.bestEst1rmKg || null;
    const latestValid1rm =
      [...history].reverse().find((h) => h.bestEst1rmKg && h.bestEst1rmKg > 0)?.bestEst1rmKg || null;

    let progressionGainPercent: number | null = null;
    if (firstValid1rm && latestValid1rm && firstValid1rm > 0) {
      progressionGainPercent = Math.round(((latestValid1rm - firstValid1rm) / firstValid1rm) * 1000) / 10;
    }

    exercisesResult.push({
      exerciseId: exId,
      exerciseName: data.name,
      bodyPart: data.bodyPart,
      target: data.target,
      category: data.category,
      sessionsCount: history.length,
      currentEst1rmKg: latestValid1rm,
      allTimeBest1rmKg: data.allTimeBest1rm > 0 ? data.allTimeBest1rm : null,
      allTimeMaxWeightKg: data.allTimeMaxWeight > 0 ? data.allTimeMaxWeight : null,
      progressionGainPercent,
      history,
    });
  }

  // Sort exercises by number of sessions (most practiced first)
  exercisesResult.sort((a, b) => b.sessionsCount - a.sessionsCount);

  // Group PRs by exercise (keep the absolute highest PR for each exercise)
  const highestPrByExercise = new Map<string, PersonalRecordItem>();
  for (const pr of prItems) {
    const existing = highestPrByExercise.get(pr.exerciseId);
    if (!existing || pr.bestEst1rmKg > existing.bestEst1rmKg) {
      highestPrByExercise.set(pr.exerciseId, pr);
    }
  }

  const finalPrs = Array.from(highestPrByExercise.values()).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return {
    exercises: exercisesResult,
    personalRecords: finalPrs,
    totalPrsCount: prsInScopeCount,
  };
}

/**
 * Generate dashboard KPI glimpse
 */
export function computeDashboardKpi(allWorkouts: any[]): DashboardAnalyticsKpi {
  if (allWorkouts.length === 0) {
    return {
      hasWorkouts: false,
      thisWeekVolumeKg: 0,
      volumeChangePercent: null,
      thisWeekWorkoutsCount: 0,
      currentStreakWeeks: 0,
      topMuscleGroup: null,
      topMusclePercentage: null,
      latestPr: null,
      sparkline: [
        { day: 'M', volumeKg: 0, workoutCount: 0 },
        { day: 'T', volumeKg: 0, workoutCount: 0 },
        { day: 'W', volumeKg: 0, workoutCount: 0 },
        { day: 'T', volumeKg: 0, workoutCount: 0 },
        { day: 'F', volumeKg: 0, workoutCount: 0 },
        { day: 'S', volumeKg: 0, workoutCount: 0 },
        { day: 'S', volumeKg: 0, workoutCount: 0 },
      ],
    };
  }

  const now = new Date();
  const startOfWeek = new Date(now);
  const day = (now.getDay() + 6) % 7; // Monday = 0
  startOfWeek.setDate(now.getDate() - day);
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfPrevWeek = new Date(startOfWeek);
  startOfPrevWeek.setDate(startOfPrevWeek.getDate() - 7);

  let thisWeekVol = 0;
  let prevWeekVol = 0;
  let thisWeekCount = 0;
  const muscleSetsMap = new Map<string, number>();
  let totalSetsThisWeek = 0;

  // 7-day sparkline
  const sparklineMap = new Map<number, { volumeKg: number; count: number }>();
  for (let i = 0; i < 7; i++) {
    sparklineMap.set(i, { volumeKg: 0, count: 0 });
  }

  for (const w of allWorkouts) {
    if (!w.started_at) continue;
    const wDate = new Date(w.started_at);

    // Check if in current week
    if (wDate >= startOfWeek && wDate <= now) {
      thisWeekCount++;
      const dayIndex = (wDate.getDay() + 6) % 7;
      const spark = sparklineMap.get(dayIndex) || { volumeKg: 0, count: 0 };
      spark.count++;

      for (const we of w.workout_exercises || []) {
        const ex = we.exercise;
        const group = mapBodyPartToGroup(ex?.body_part, ex?.target);

        for (const s of we.sets || []) {
          if (s.is_completed) {
            totalSetsThisWeek++;
            muscleSetsMap.set(group, (muscleSetsMap.get(group) || 0) + 1);

            if (s.set_type !== 'warmup' && s.weight_kg && s.reps) {
              const v = Number(s.weight_kg) * Number(s.reps);
              thisWeekVol += v;
              spark.volumeKg += v;
            }
          }
        }
      }
      sparklineMap.set(dayIndex, spark);
    } else if (wDate >= startOfPrevWeek && wDate < startOfWeek) {
      for (const we of w.workout_exercises || []) {
        for (const s of we.sets || []) {
          if (s.is_completed && s.set_type !== 'warmup' && s.weight_kg && s.reps) {
            prevWeekVol += Number(s.weight_kg) * Number(s.reps);
          }
        }
      }
    }
  }

  const volumeChangePercent =
    prevWeekVol > 0 ? Math.round(((thisWeekVol - prevWeekVol) / prevWeekVol) * 1000) / 10 : null;

  // Streak
  const workoutDates = allWorkouts.map((w) => new Date(w.started_at));
  const currentStreakWeeks = calculateWeeklyStreak(workoutDates);

  // Top muscle group
  let topMuscleGroup: string | null = null;
  let topMuscleCount = 0;
  for (const [group, count] of muscleSetsMap.entries()) {
    if (count > topMuscleCount) {
      topMuscleCount = count;
      topMuscleGroup = group;
    }
  }

  const topMusclePercentage =
    totalSetsThisWeek > 0 && topMuscleCount > 0
      ? Math.round((topMuscleCount / totalSetsThisWeek) * 100)
      : null;

  // Latest PR
  const { personalRecords } = computeExerciseProgressionAndPRs(
    allWorkouts,
    new Date(0),
    now
  );
  const latestPr = personalRecords.length > 0 ? personalRecords[0] : null;

  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const sparkline = dayLabels.map((label, idx) => {
    const data = sparklineMap.get(idx) || { volumeKg: 0, count: 0 };
    return {
      day: label,
      volumeKg: Math.round(data.volumeKg),
      workoutCount: data.count,
    };
  });

  return {
    hasWorkouts: true,
    thisWeekVolumeKg: Math.round(thisWeekVol),
    volumeChangePercent,
    thisWeekWorkoutsCount: thisWeekCount,
    currentStreakWeeks,
    topMuscleGroup: topMuscleGroup
      ? MUSCLE_GROUP_DEFINITIONS.find((m) => m.id === topMuscleGroup)?.name || topMuscleGroup
      : null,
    topMusclePercentage,
    latestPr: latestPr
      ? {
          exerciseName: latestPr.exerciseName,
          weightKg: latestPr.weightKg,
          reps: latestPr.reps,
          est1rmKg: latestPr.bestEst1rmKg,
          date: latestPr.date,
        }
      : null,
    sparkline,
  };
}

/**
 * Realistic Demo / Sample Data for testing, empty states, or new users
 */
export function generateDemoAnalyticsData(
  timeRange: AnalyticsTimeRange,
  isDemo: boolean = true
): FullAnalyticsData {
  const now = new Date();

  const volumeTrends: VolumeTrendPoint[] = [
    { date: '1', label: 'Week 1', volumeKg: 9450, workoutCount: 3, setsCount: 36, avgIntensityKg: 62 },
    { date: '2', label: 'Week 2', volumeKg: 11200, workoutCount: 4, setsCount: 44, avgIntensityKg: 64.5 },
    { date: '3', label: 'Week 3', volumeKg: 10800, workoutCount: 4, setsCount: 42, avgIntensityKg: 66 },
    { date: '4', label: 'Week 4', volumeKg: 12900, workoutCount: 4, setsCount: 48, avgIntensityKg: 68 },
    { date: '5', label: 'Week 5', volumeKg: 14250, workoutCount: 5, setsCount: 52, avgIntensityKg: 70 },
    { date: '6', label: 'Week 6', volumeKg: 15400, workoutCount: 5, setsCount: 56, avgIntensityKg: 71.5 },
    { date: '7', label: 'Week 7', volumeKg: 16800, workoutCount: 5, setsCount: 60, avgIntensityKg: 73 },
  ];

  const muscleDistribution: MuscleGroupDistribution[] = [
    { id: 'chest', name: 'Chest', bodyParts: ['chest'], setsCount: 48, volumeKg: 18400, percentage: 26.5, color: '#38bdf8' },
    { id: 'back', name: 'Back', bodyParts: ['back', 'lats'], setsCount: 44, volumeKg: 16900, percentage: 24.3, color: '#818cf8' },
    { id: 'legs', name: 'Legs', bodyParts: ['upper legs'], setsCount: 42, volumeKg: 24600, percentage: 23.2, color: '#34d399' },
    { id: 'shoulders', name: 'Shoulders', bodyParts: ['shoulders'], setsCount: 24, volumeKg: 7400, percentage: 13.3, color: '#fbbf24' },
    { id: 'arms', name: 'Arms', bodyParts: ['upper arms'], setsCount: 23, volumeKg: 4900, percentage: 12.7, color: '#f472b6' },
  ];

  const demoBenchDates = [
    new Date(now.getTime() - 42 * 86400000).toISOString(),
    new Date(now.getTime() - 35 * 86400000).toISOString(),
    new Date(now.getTime() - 28 * 86400000).toISOString(),
    new Date(now.getTime() - 21 * 86400000).toISOString(),
    new Date(now.getTime() - 14 * 86400000).toISOString(),
    new Date(now.getTime() - 7 * 86400000).toISOString(),
    new Date(now.getTime() - 2 * 86400000).toISOString(),
  ];

  const exercises: ExerciseProgressionItem[] = [
    {
      exerciseId: 'demo-bench',
      exerciseName: 'Barbell Bench Press',
      bodyPart: 'chest',
      target: 'pectorals',
      category: 'barbell',
      sessionsCount: 7,
      currentEst1rmKg: 116.7,
      allTimeBest1rmKg: 116.7,
      allTimeMaxWeightKg: 100,
      progressionGainPercent: 19.1,
      history: [
        { workoutId: 'w1', workoutName: 'Push Day A', date: demoBenchDates[0], bestEst1rmKg: 98.0, maxWeightKg: 85, volumeKg: 2400, completedSetsCount: 4, topSetDescription: '85 kg × 5 reps', isPr: true },
        { workoutId: 'w2', workoutName: 'Push Day A', date: demoBenchDates[1], bestEst1rmKg: 101.5, maxWeightKg: 87.5, volumeKg: 2600, completedSetsCount: 4, topSetDescription: '87.5 kg × 5 reps', isPr: true },
        { workoutId: 'w3', workoutName: 'Push Day A', date: demoBenchDates[2], bestEst1rmKg: 104.0, maxWeightKg: 90, volumeKg: 2750, completedSetsCount: 4, topSetDescription: '90 kg × 5 reps', isPr: true },
        { workoutId: 'w4', workoutName: 'Push Day A', date: demoBenchDates[3], bestEst1rmKg: 107.3, maxWeightKg: 92.5, volumeKg: 2900, completedSetsCount: 4, topSetDescription: '92.5 kg × 5 reps', isPr: true },
        { workoutId: 'w5', workoutName: 'Push Day A', date: demoBenchDates[4], bestEst1rmKg: 110.0, maxWeightKg: 95, volumeKg: 3100, completedSetsCount: 4, topSetDescription: '95 kg × 5 reps', isPr: true },
        { workoutId: 'w6', workoutName: 'Push Day A', date: demoBenchDates[5], bestEst1rmKg: 113.3, maxWeightKg: 97.5, volumeKg: 3250, completedSetsCount: 4, topSetDescription: '97.5 kg × 5 reps', isPr: true },
        { workoutId: 'w7', workoutName: 'Push Day A', date: demoBenchDates[6], bestEst1rmKg: 116.7, maxWeightKg: 100, volumeKg: 3500, completedSetsCount: 4, topSetDescription: '100 kg × 5 reps', isPr: true },
      ],
    },
    {
      exerciseId: 'demo-squat',
      exerciseName: 'Barbell Back Squat',
      bodyPart: 'upper legs',
      target: 'quads',
      category: 'barbell',
      sessionsCount: 6,
      currentEst1rmKg: 151.7,
      allTimeBest1rmKg: 151.7,
      allTimeMaxWeightKg: 130,
      progressionGainPercent: 16.7,
      history: [
        { workoutId: 'w11', workoutName: 'Leg Day', date: demoBenchDates[0], bestEst1rmKg: 130.0, maxWeightKg: 110, volumeKg: 3300, completedSetsCount: 4, topSetDescription: '110 kg × 6 reps', isPr: true },
        { workoutId: 'w12', workoutName: 'Leg Day', date: demoBenchDates[2], bestEst1rmKg: 136.7, maxWeightKg: 117.5, volumeKg: 3500, completedSetsCount: 4, topSetDescription: '117.5 kg × 5 reps', isPr: true },
        { workoutId: 'w13', workoutName: 'Leg Day', date: demoBenchDates[4], bestEst1rmKg: 144.0, maxWeightKg: 122.5, volumeKg: 3750, completedSetsCount: 4, topSetDescription: '122.5 kg × 5 reps', isPr: true },
        { workoutId: 'w14', workoutName: 'Leg Day', date: demoBenchDates[6], bestEst1rmKg: 151.7, maxWeightKg: 130, volumeKg: 4100, completedSetsCount: 4, topSetDescription: '130 kg × 5 reps', isPr: true },
      ],
    },
    {
      exerciseId: 'demo-deadlift',
      exerciseName: 'Conventional Deadlift',
      bodyPart: 'back',
      target: 'glutes',
      category: 'barbell',
      sessionsCount: 5,
      currentEst1rmKg: 186.7,
      allTimeBest1rmKg: 186.7,
      allTimeMaxWeightKg: 160,
      progressionGainPercent: 13.1,
      history: [
        { workoutId: 'w21', workoutName: 'Pull Day', date: demoBenchDates[1], bestEst1rmKg: 165.0, maxWeightKg: 140, volumeKg: 2800, completedSetsCount: 3, topSetDescription: '140 kg × 5 reps', isPr: true },
        { workoutId: 'w22', workoutName: 'Pull Day', date: demoBenchDates[3], bestEst1rmKg: 175.0, maxWeightKg: 150, volumeKg: 3000, completedSetsCount: 3, topSetDescription: '150 kg × 5 reps', isPr: true },
        { workoutId: 'w23', workoutName: 'Pull Day', date: demoBenchDates[5], bestEst1rmKg: 186.7, maxWeightKg: 160, volumeKg: 3300, completedSetsCount: 3, topSetDescription: '160 kg × 5 reps', isPr: true },
      ],
    },
    {
      exerciseId: 'demo-ohp',
      exerciseName: 'Overhead Shoulder Press',
      bodyPart: 'shoulders',
      target: 'delts',
      category: 'barbell',
      sessionsCount: 5,
      currentEst1rmKg: 70.0,
      allTimeBest1rmKg: 70.0,
      allTimeMaxWeightKg: 60,
      progressionGainPercent: 12.0,
      history: [
        { workoutId: 'w31', workoutName: 'Push Day B', date: demoBenchDates[1], bestEst1rmKg: 62.5, maxWeightKg: 52.5, volumeKg: 1600, completedSetsCount: 4, topSetDescription: '52.5 kg × 6 reps', isPr: true },
        { workoutId: 'w32', workoutName: 'Push Day B', date: demoBenchDates[3], bestEst1rmKg: 66.0, maxWeightKg: 55, volumeKg: 1750, completedSetsCount: 4, topSetDescription: '55 kg × 6 reps', isPr: true },
        { workoutId: 'w33', workoutName: 'Push Day B', date: demoBenchDates[5], bestEst1rmKg: 70.0, maxWeightKg: 60, volumeKg: 1900, completedSetsCount: 4, topSetDescription: '60 kg × 5 reps', isPr: true },
      ],
    },
  ];

  const personalRecords: PersonalRecordItem[] = [
    {
      id: 'pr-dl',
      exerciseId: 'demo-deadlift',
      exerciseName: 'Conventional Deadlift',
      bodyPart: 'back',
      category: 'barbell',
      bestEst1rmKg: 186.7,
      weightKg: 160,
      reps: 5,
      date: demoBenchDates[5],
      workoutName: 'Pull Heavy Day',
      isRecent: true,
    },
    {
      id: 'pr-sq',
      exerciseId: 'demo-squat',
      exerciseName: 'Barbell Back Squat',
      bodyPart: 'upper legs',
      category: 'barbell',
      bestEst1rmKg: 151.7,
      weightKg: 130,
      reps: 5,
      date: demoBenchDates[6],
      workoutName: 'Leg Day Volume',
      isRecent: true,
    },
    {
      id: 'pr-bp',
      exerciseId: 'demo-bench',
      exerciseName: 'Barbell Bench Press',
      bodyPart: 'chest',
      category: 'barbell',
      bestEst1rmKg: 116.7,
      weightKg: 100,
      reps: 5,
      date: demoBenchDates[6],
      workoutName: 'Push Day A',
      isRecent: true,
    },
    {
      id: 'pr-ohp',
      exerciseId: 'demo-ohp',
      exerciseName: 'Overhead Shoulder Press',
      bodyPart: 'shoulders',
      category: 'barbell',
      bestEst1rmKg: 70.0,
      weightKg: 60,
      reps: 5,
      date: demoBenchDates[5],
      workoutName: 'Push Day B',
      isRecent: true,
    },
  ];

  return {
    timeRange,
    kpi: {
      totalVolumeKg: 90800,
      volumeChangePercent: 18.4,
      totalWorkouts: 29,
      workoutsChangeCount: 4,
      totalSets: 346,
      totalReps: 3120,
      avgDurationMinutes: 62,
      currentStreakWeeks: 7,
      totalPrsCount: 12,
    },
    volumeTrends,
    muscleDistribution,
    exercises,
    personalRecords,
    hasRealWorkouts: !isDemo,
    totalRecordedWorkoutsCount: isDemo ? 0 : 29,
  };
}
