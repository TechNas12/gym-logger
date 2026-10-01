import type { Metadata } from 'next';
import { AuthCard } from '@/components/auth/auth-card';
import { RegisterForm } from '@/components/auth/register-form';

export const metadata: Metadata = {
  title: 'Create Account | Gym Logger',
  description: 'Create a new Gym Logger account',
};

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-background">
      <AuthCard
        title="Create an account"
        subtitle="Sign up with email to start logging workouts"
        footerText="Already have an account?"
        footerLinkText="Sign in"
        footerLinkHref="/login"
      >
        <RegisterForm />
      </AuthCard>
    </main>
  );
}
