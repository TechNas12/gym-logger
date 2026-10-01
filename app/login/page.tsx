import { Suspense } from 'react';
import type { Metadata } from 'next';
import { AuthCard } from '@/components/auth/auth-card';
import { LoginForm } from '@/components/auth/login-form';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Sign In | Gym Logger',
  description: 'Sign in to your Gym Logger account',
};

function LoginFormFallback() {
  return (
    <div className="flex items-center justify-center py-12 text-text-subtle">
      <Loader2 className="w-6 h-6 animate-spin text-accent" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-background">
      <AuthCard
        title="Welcome back"
        subtitle="Sign in with your email and password"
        footerText="Don't have an account?"
        footerLinkText="Create account"
        footerLinkHref="/register"
      >
        <Suspense fallback={<LoginFormFallback />}>
          <LoginForm />
        </Suspense>
      </AuthCard>
    </main>
  );
}
