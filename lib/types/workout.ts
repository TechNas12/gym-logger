export type SetType = 'normal' | 'warmup' | 'dropset' | 'failure';
export type TrackingType = 'weight_reps' | 'reps_only' | 'duration' | 'distance_duration';

export interface DbExercise {
  id: string;
  name: string;
  category: string | null;
  body_part: string | null;
  equipment: string | null;
  muscle_group: string | null;
  target: string | null;
  secondary_muscles: string[] | null;
  instructions: string | null;
  instruction_steps: string[] | null;
  media_id: string | null;
  image_url: string | null;
  gif_url: string | null;
  attribution: string | null;
  user_id?: string | null;
  tracking_type?: TrackingType;
  created_at: string | null;
}

export interface DbWorkout {
  id: string;
  user_id: string;
  routine_id: string | null;
  name: string;
  started_at: string;
  ended_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbWorkoutExercise {
  id: string;
  workout_id: string;
  user_id: string;
  exercise_id: string;
  position: number;
  superset_group: number | null;
  notes: string | null;
  created_at: string;
  exercise?: DbExercise;
  sets?: DbSet[];
}

export interface DbSet {
  id: string;
  workout_exercise_id: string;
  user_id: string;
  exercise_id: string;
  set_number: number;
  set_type: SetType;
  reps: number | null;
  weight_kg: number | null;
  duration_sec: number | null;
  distance_m: number | null;
  rpe: number | null;
  is_completed: boolean;
  completed_at: string | null;
  est_1rm_kg: number | null;
  created_at: string;
}

export interface DbRoutine {
  id: string;
  user_id: string | null;
  name: string;
  notes: string | null;
  is_system?: boolean;
  created_at: string;
  updated_at: string;
  routine_exercises?: DbRoutineExercise[];
}

export interface DbRoutineExercise {
  id: string;
  routine_id: string;
  user_id?: string | null;
  exercise_id: string;
  position: number;
  superset_group: number | null;
  notes: string | null;
  created_at: string;
  exercise?: DbExercise;
  routine_sets?: DbRoutineSet[];
}

export interface DbRoutineSet {
  id: string;
  routine_exercise_id: string;
  user_id: string;
  set_number: number;
  set_type: SetType;
  target_reps_min: number | null;
  target_reps_max: number | null;
  target_weight_kg: number | null;
  rest_sec: number | null;
  created_at: string;
}

// Payload types for RPC calls
export interface SaveWorkoutSetPayload {
  set_number: number;
  set_type: SetType;
  reps: number | null;
  weight_kg: number | null;
  duration_sec?: number | null;
  distance_m?: number | null;
  rpe?: number | null;
  is_completed: boolean;
  completed_at?: string | null;
}

export interface SaveWorkoutExercisePayload {
  exercise_id: string;
  position?: number;
  superset_group?: number | null;
  notes?: string | null;
  sets: SaveWorkoutSetPayload[];
}

export interface SaveWorkoutPayload {
  id?: string | null;
  routine_id?: string | null;
  name?: string;
  started_at?: string;
  ended_at?: string | null;
  notes?: string | null;
  exercises: SaveWorkoutExercisePayload[];
}

export interface SaveRoutineSetPayload {
  set_number: number;
  set_type: SetType;
  target_reps_min?: number | null;
  target_reps_max?: number | null;
  target_weight_kg?: number | null;
  rest_sec?: number | null;
}

export interface SaveRoutineExercisePayload {
  exercise_id: string;
  position?: number;
  superset_group?: number | null;
  notes?: string | null;
  sets: SaveRoutineSetPayload[];
}

export interface SaveRoutinePayload {
  id?: string | null;
  name: string;
  notes?: string | null;
  exercises: SaveRoutineExercisePayload[];
}

// Active workout state (UI state)
export interface ActiveSet {
  clientId: string;
  setNumber: number;
  setType: SetType;
  reps: number | null;
  weightKg: number | null;
  durationSec?: number | null;
  distanceM?: number | null;
  rpe?: number | null;
  isCompleted: boolean;
  completedAt?: string | null;
  previous?: string | null;
}

export interface ActiveExercise {
  clientId: string;
  exerciseId: string;
  exercise: DbExercise;
  position: number;
  supersetGroup: number | null;
  notes: string;
  sets: ActiveSet[];
}

export interface ActiveWorkoutState {
  workoutId: string | null;
  routineId: string | null;
  name: string;
  startedAt: string;
  notes: string;
  exercises: ActiveExercise[];
}

// Summary and performance views
export interface WorkoutSummary {
  id: string;
  name: string;
  started_at: string;
  ended_at: string | null;
  notes: string | null;
  routine_name?: string | null;
  exercise_count: number;
  completed_sets_count: number;
  total_volume_kg: number;
  duration_seconds: number;
  prs_count?: number;
}

export interface WorkoutDetailStatPR {
  exerciseName: string;
  weightKg: number;
  reps: number;
  est1rmKg: number;
}

export interface WorkoutDetail extends DbWorkout {
  routine?: { id: string; name: string } | null;
  workout_exercises: (DbWorkoutExercise & {
    exercise: DbExercise;
    sets: DbSet[];
  })[];
  stats: {
    totalVolumeKg: number;
    durationSeconds: number;
    completedSetsCount: number;
    prs: WorkoutDetailStatPR[];
  };
}

export interface RoutineDetail extends DbRoutine {
  routine_exercises: (DbRoutineExercise & {
    exercise: DbExercise;
    routine_sets: DbRoutineSet[];
  })[];
}

export interface LastPerformanceSet {
  set_number: number;
  set_type: SetType;
  weight_kg: number | null;
  reps: number | null;
}

export interface LastPerformance {
  exercise_id: string;
  workout_date: string;
  sets: LastPerformanceSet[];
}

// Backward compatibility aliases if any component still references old types
export type DbWorkoutSession = DbWorkout;
export type DbWorkoutSet = DbSet;
export type ActiveWorkoutSet = ActiveSet;
export type ActiveWorkoutExercise = ActiveExercise;
