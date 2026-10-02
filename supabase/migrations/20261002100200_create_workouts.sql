-- Migration 2: Create workouts table
CREATE TABLE IF NOT EXISTS public.workouts (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  routine_id  uuid,
  name        text NOT NULL DEFAULT 'Workout',
  started_at  timestamptz NOT NULL DEFAULT now(),
  ended_at    timestamptz,
  notes       text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workouts_user_date
  ON public.workouts(user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_workouts_user_ended
  ON public.workouts(user_id, ended_at DESC NULLS FIRST);

DROP TRIGGER IF EXISTS on_workouts_updated ON public.workouts;
CREATE TRIGGER on_workouts_updated
  BEFORE UPDATE ON public.workouts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Workouts: user owns" ON public.workouts;
CREATE POLICY "Workouts: user owns"
  ON public.workouts FOR ALL
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));
