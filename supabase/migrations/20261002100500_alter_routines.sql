-- Migration 5: Ensure routines table exists and configure columns, triggers, and RLS
CREATE TABLE IF NOT EXISTS public.routines (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid REFERENCES public.users(id) ON DELETE CASCADE,
  name        text NOT NULL,
  notes       text,
  is_system   boolean DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.routines
  ADD COLUMN IF NOT EXISTS notes text;

ALTER TABLE public.routines
  ALTER COLUMN user_id DROP NOT NULL;

-- Ensure workouts.routine_id references routines(id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_workouts_routine'
  ) THEN
    ALTER TABLE public.workouts
      ADD CONSTRAINT fk_workouts_routine
      FOREIGN KEY (routine_id) REFERENCES public.routines(id) ON DELETE SET NULL;
  END IF;
END $$;

DROP TRIGGER IF EXISTS on_routines_updated ON public.routines;
CREATE TRIGGER on_routines_updated
  BEFORE UPDATE ON public.routines
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Routines: read global or own" ON public.routines;
CREATE POLICY "Routines: read global or own"
  ON public.routines FOR SELECT
  USING (user_id IS NULL OR user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Routines: insert own" ON public.routines;
CREATE POLICY "Routines: insert own"
  ON public.routines FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Routines: update own" ON public.routines;
CREATE POLICY "Routines: update own"
  ON public.routines FOR UPDATE
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Routines: delete own" ON public.routines;
CREATE POLICY "Routines: delete own"
  ON public.routines FOR DELETE
  USING (user_id = (SELECT auth.uid()));
