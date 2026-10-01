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
  created_at: string | null;
}

export interface DbRoutine {
  id: string;
  user_id: string | null;
  name: string;
  description: string | null;
  is_system: boolean;
  created_at: string;
  updated_at: string;
  routine_exercises?: DbRoutineExercise[];
}

export interface DbRoutineExercise {
  id: string;
  routine_id: string;
  exercise_id: string;
  order_index: number;
  target_sets: number;
  target_reps: number;
  created_at: string;
  exercise?: DbExercise;
}

export interface DbWorkoutSession {
  id: string;
  user_id: string;
  routine_id: string | null;
  name: string;
  status: 'in_progress' | 'completed' | 'cancelled';
  started_at: string;
  completed_at: string | null;
  duration_seconds: number;
  total_volume_kg: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbWorkoutSet {
  id: string;
  workout_session_id: string;
  exercise_id: string;
  set_number: number;
  weight_kg: number;
  reps: number;
  rpe: number | null;
  is_completed: boolean;
  created_at: string;
}

export interface ActiveWorkoutSet {
  id?: string;
  setNumber: number;
  weightKg: number;
  reps: number;
  rpe?: number | null;
  isCompleted: boolean;
  previous?: string;
}

export interface ActiveWorkoutExercise {
  exerciseId: string;
  exercise: DbExercise;
  sets: ActiveWorkoutSet[];
}

export interface ActiveWorkoutState {
  sessionId?: string;
  routineId?: string | null;
  routineName?: string;
  name: string;
  startedAt: string;
  exercises: ActiveWorkoutExercise[];
}
