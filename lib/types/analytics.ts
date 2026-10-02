export type AnalyticsTimeRange = '7d' | '30d' | '90d' | '1y' | 'all';

export interface AnalyticsKpiSummary {
  totalVolumeKg: number;
  volumeChangePercent: number | null; // e.g. +14.2% vs previous period
  totalWorkouts: number;
  workoutsChangeCount: number | null;
  totalSets: number;
  totalReps: number;
  avgDurationMinutes: number;
  currentStreakWeeks: number;
  totalPrsCount: number;
}

export interface VolumeTrendPoint {
  date: string; // ISO date string or formatted bucket label
  label: string; // "Mon", "Oct 12", "Wk 40", "Sep 2026"
  volumeKg: number;
  workoutCount: number;
  setsCount: number;
  avgIntensityKg: number; // Volume / total reps
}

export interface MuscleGroupDistribution {
  id: string; // 'chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'other'
  name: string; // "Chest", "Back", "Legs", etc.
  bodyParts: string[]; // matching body_part strings from exercises table
  setsCount: number;
  volumeKg: number;
  percentage: number; // 0 - 100
  color: string; // CSS color or hex (e.g. emerald, sky, purple, amber, rose)
}

export interface ExerciseSessionLog {
  workoutId: string;
  workoutName: string;
  date: string;
  bestEst1rmKg: number | null;
  maxWeightKg: number | null;
  volumeKg: number;
  completedSetsCount: number;
  topSetDescription: string; // e.g. "100 kg × 8 reps"
  isPr: boolean;
}

export interface ExerciseProgressionItem {
  exerciseId: string;
  exerciseName: string;
  bodyPart: string | null;
  target: string | null;
  category: string | null;
  sessionsCount: number;
  currentEst1rmKg: number | null;
  allTimeBest1rmKg: number | null;
  allTimeMaxWeightKg: number | null;
  progressionGainPercent: number | null; // e.g. +18.5%
  history: ExerciseSessionLog[];
}

export interface PersonalRecordItem {
  id: string;
  exerciseId: string;
  exerciseName: string;
  bodyPart: string | null;
  category: string | null;
  bestEst1rmKg: number;
  weightKg: number;
  reps: number;
  date: string;
  workoutName: string;
  isRecent: boolean; // achieved in last 30 days
}

export interface FullAnalyticsData {
  timeRange: AnalyticsTimeRange;
  kpi: AnalyticsKpiSummary;
  volumeTrends: VolumeTrendPoint[];
  muscleDistribution: MuscleGroupDistribution[];
  exercises: ExerciseProgressionItem[];
  personalRecords: PersonalRecordItem[];
  hasRealWorkouts: boolean;
  totalRecordedWorkoutsCount: number;
}

export interface DashboardAnalyticsKpi {
  hasWorkouts: boolean;
  thisWeekVolumeKg: number;
  volumeChangePercent: number | null;
  thisWeekWorkoutsCount: number;
  currentStreakWeeks: number;
  topMuscleGroup: string | null;
  topMusclePercentage: number | null;
  latestPr: {
    exerciseName: string;
    weightKg: number;
    reps: number;
    est1rmKg: number;
    date: string;
  } | null;
  sparkline: Array<{
    day: string; // "M", "T", "W", etc.
    volumeKg: number;
    workoutCount: number;
  }>;
}
