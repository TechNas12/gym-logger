import { z } from 'zod';

export const setTypeSchema = z.enum(['normal', 'warmup', 'dropset', 'failure']);

export const saveWorkoutSetSchema = z.object({
  set_number: z.number().int().min(1).max(32767),
  set_type: setTypeSchema.default('normal'),
  reps: z.number().int().min(0).max(32767).nullable().optional(),
  weight_kg: z.number().min(0).nullable().optional(),
  duration_sec: z.number().int().min(0).nullable().optional(),
  distance_m: z.number().min(0).nullable().optional(),
  rpe: z.number().min(1).max(10).nullable().optional(),
  is_completed: z.boolean().default(false),
  completed_at: z.string().nullable().optional(),
});

export const saveWorkoutExerciseSchema = z.object({
  exercise_id: z.string().min(1, 'Exercise is required'),
  position: z.number().int().min(1).optional(),
  superset_group: z.number().int().nullable().optional(),
  notes: z.string().nullable().optional(),
  sets: z.array(saveWorkoutSetSchema),
});

export const saveWorkoutSchema = z.object({
  id: z.string().uuid().nullable().optional(),
  routine_id: z.string().uuid().nullable().optional(),
  name: z.string().min(1).max(100).default('Workout'),
  started_at: z.string().optional(),
  ended_at: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  exercises: z.array(saveWorkoutExerciseSchema),
});

export const saveRoutineSetSchema = z
  .object({
    set_number: z.number().int().min(1).max(32767),
    set_type: setTypeSchema.default('normal'),
    target_reps_min: z.number().int().min(0).max(32767).nullable().optional(),
    target_reps_max: z.number().int().min(0).max(32767).nullable().optional(),
    target_weight_kg: z.number().min(0).nullable().optional(),
    rest_sec: z.number().int().min(0).max(32767).nullable().optional(),
  })
  .refine(
    (data) => {
      if (data.target_reps_max !== null && data.target_reps_max !== undefined) {
        const min = data.target_reps_min ?? 0;
        return data.target_reps_max >= min;
      }
      return true;
    },
    {
      message: 'target_reps_max must be greater than or equal to target_reps_min',
      path: ['target_reps_max'],
    }
  );

export const saveRoutineExerciseSchema = z.object({
  exercise_id: z.string().min(1, 'Exercise is required'),
  position: z.number().int().min(1).optional(),
  superset_group: z.number().int().nullable().optional(),
  notes: z.string().nullable().optional(),
  sets: z.array(saveRoutineSetSchema),
});

export const saveRoutineSchema = z.object({
  id: z.string().uuid().nullable().optional(),
  name: z.string().min(1, 'Routine name is required').max(100),
  notes: z.string().nullable().optional(),
  exercises: z.array(saveRoutineExerciseSchema),
});

export type SaveWorkoutSchema = z.infer<typeof saveWorkoutSchema>;
export type SaveRoutineSchema = z.infer<typeof saveRoutineSchema>;
