import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseEnv } from '@/lib/env';
import { getSafeRedirectUrl } from '@/lib/redirect';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const { url, anonKey } = getSupabaseEnv();

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // IMPORTANT: Do not run code between createServerClient and getUser().
  // getUser() validates the JWT with the Supabase Auth server and refreshes expired tokens.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Rewire legacy /login-success directly to /dashboard
  if (
    pathname === '/login-success' ||
    pathname.startsWith('/login-success/')
  ) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/dashboard';
    return NextResponse.redirect(redirectUrl);
  }

  // Protected route check
  if (
    !user &&
    (pathname.startsWith('/dashboard') ||
      pathname.startsWith('/onboarding') ||
      pathname.startsWith('/workout') ||
      pathname.startsWith('/routines') ||
      pathname.startsWith('/analytics'))
  ) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('next', pathname + request.nextUrl.search);
    return NextResponse.redirect(redirectUrl);
  }

  // Logged-in users should not access the landing page (/), /login, or /register; redirect to /dashboard
  if (user && (pathname === '/' || pathname === '/login' || pathname === '/register')) {
    const nextParam = request.nextUrl.searchParams.get('next');
    const targetUrl = getSafeRedirectUrl(nextParam, '/dashboard');
    const redirectUrl = new URL(targetUrl, request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}
