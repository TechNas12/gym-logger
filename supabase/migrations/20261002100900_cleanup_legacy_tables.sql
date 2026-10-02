-- Migration 9: Clean up legacy tables
DROP TABLE IF EXISTS public.workout_sets CASCADE;
DROP TABLE IF EXISTS public.workout_sessions CASCADE;
