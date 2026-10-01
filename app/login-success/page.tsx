import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { CheckCircle2, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { SignOutButton } from '@/components/auth/sign-out-button';

export const metadata: Metadata = {
  title: 'Login Successful | GymLogger',
  description: 'Authentication confirmation',
};

export default async function LoginSuccessPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/login-success');
  }

  const firstName = user.user_metadata?.first_name as string | undefined;
  const fullName = user.user_metadata?.full_name as string | undefined;

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-background selection:bg-accent/30 selection:text-text-primary">
      <div className="w-full max-w-[440px] px-4 py-8 mx-auto">
        <div className="relative rounded-3xl bg-surface border border-border/80 shadow-2xl p-6 sm:p-8 backdrop-blur-xl text-center">
          {/* Subtle green glow accent */}
          <div
            className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-80"
            aria-hidden="true"
          />

          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/20 border border-accent/40 text-accent mx-auto mb-4 shadow-[0_0_25px_rgba(34,197,94,0.3)]">
            <CheckCircle2 className="w-7 h-7" aria-hidden="true" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
            Welcome{firstName ? `, ${firstName}` : ''}!
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-text-muted leading-relaxed">
            You are securely authenticated to GymLogger.
          </p>

          <div className="mt-4 p-3.5 rounded-xl bg-surface-raised border border-border/70 text-left space-y-1">
            {fullName && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-subtle font-medium">Name:</span>
                <span className="font-semibold text-text-primary">{fullName}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-subtle font-medium">Email:</span>
              <span className="font-mono text-accent truncate max-w-[220px]">{user.email}</span>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-border/60 flex justify-center">
            <SignOutButton />
          </div>
        </div>
      </div>
    </main>
  );
}
