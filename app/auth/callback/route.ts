import { type EmailOtpType } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSafeRedirectUrl } from '@/lib/redirect';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next');

  const destination = getSafeRedirectUrl(next, '/dashboard');

  const supabase = await createClient();

  // Helper to determine destination based on onboarding status
  const getOnboardingAwareDestination = async (fallback: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('is_onboarded')
          .eq('id', user.id)
          .maybeSingle();

        if (!profile?.is_onboarded) {
          return '/onboarding';
        }
      }
    } catch {
      // Fallback if check fails
    }
    return fallback;
  };

  // 1. Handle PKCE code exchange
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const target = await getOnboardingAwareDestination(destination);
      return NextResponse.redirect(`${origin}${target}`);
    }
  }

  // 2. Handle token hash / OTP verification
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      const target = await getOnboardingAwareDestination(destination);
      return NextResponse.redirect(`${origin}${target}`);
    }
  }

  // If code exchange or token verification failed, redirect to login
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
