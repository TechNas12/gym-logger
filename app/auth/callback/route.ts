import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSafeRedirectUrl } from '@/lib/redirect';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next');

  const destination = getSafeRedirectUrl(next, '/login-success');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  // If code exchange failed or wasn't provided, redirect to login
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
