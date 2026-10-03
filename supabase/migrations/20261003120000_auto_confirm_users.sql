-- Migration: Auto-confirm users to disable email verification requirement
-- 1. Confirm any existing unconfirmed users in auth.users
UPDATE auth.users
SET email_confirmed_at = coalesce(email_confirmed_at, now())
WHERE email_confirmed_at IS NULL;

-- 2. Create trigger function to automatically set email_confirmed_at on signup
CREATE OR REPLACE FUNCTION public.auto_confirm_new_user()
RETURNS trigger AS $$
BEGIN
  IF NEW.email_confirmed_at IS NULL THEN
    NEW.email_confirmed_at := now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create BEFORE INSERT trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_auto_confirm ON auth.users;
CREATE TRIGGER on_auth_user_auto_confirm
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_confirm_new_user();
