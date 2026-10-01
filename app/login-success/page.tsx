import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { SignOutButton } from '@/components/auth/sign-out-button';

export const metadata: Metadata = {
  title: 'Login Successful | Gym Logger',
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

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-[420px] px-4 py-8 mx-auto">
        <div className="relative rounded-2xl bg-surface border border-border/80 shadow-2xl p-6 sm:p-8 backdrop-blur-sm text-center">
          {/* Subtle green glow accent */}
          <div
            className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-75"
            aria-hidden="true"
          />

          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent-glow text-accent ring-1 ring-accent/30 mx-auto mb-4">
            <CheckCircle2 className="w-7 h-7" aria-hidden="true" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Login successful
          </h1>

          <p className="mt-2 text-sm text-text-muted leading-relaxed">
            You are securely authenticated as:
          </p>

          <div className="mt-3 p-2.5 rounded-lg bg-surface-raised border border-border/70 text-sm font-mono text-text-primary truncate">
            {user.email}
          </div>

          <div className="mt-6 pt-5 border-t border-border/60 flex justify-center">
            <SignOutButton />
          </div>
        </div>
      </div>
    </main>
  );
}
