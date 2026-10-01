import { Suspense } from 'react';
import type { Metadata } from 'next';
import { AuthCard } from '@/components/auth/auth-card';
import { LoginForm } from '@/components/auth/login-form';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Sign In | GymLogger — Simple, Ad-Free Workout Tracker',
  description: 'Sign in to GymLogger. Simple, fast, and completely free workout logging without ads or trackers.',
};

function LoginFormFallback() {
  return (
    <div className="flex items-center justify-center py-16 text-text-subtle">
      <Loader2 className="w-7 h-7 animate-spin text-accent" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-background">
      <AuthCard
        mode="login"
        title="Welcome back"
        subtitle="Fast, distraction-free logging. No ads, no bloat. Sign in to your training logs."
        footerText="New to GymLogger?"
        footerLinkText="Get started free (100% ad-free)"
        footerLinkHref="/register"
      >
        <Suspense fallback={<LoginFormFallback />}>
          <LoginForm />
        </Suspense>
      </AuthCard>
    </main>
  );
}
