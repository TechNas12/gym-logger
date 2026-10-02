-- Migration: Add weekly_goal_rate_kg to public.users table
-- Allows users to customize target rate of weight loss/gain per week (e.g. 0.25, 0.5, 0.75, 1.0 kg/week)

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS weekly_goal_rate_kg numeric(3,2) DEFAULT 0.50;
