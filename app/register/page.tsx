import type { Metadata } from 'next';
import { AuthCard } from '@/components/auth/auth-card';
import { RegisterForm } from '@/components/auth/register-form';

export const metadata: Metadata = {
  title: 'Create Account | GymLogger — Simple, Ad-Free Workout Tracker',
  description: 'Create your free GymLogger account. Pure functionality, 100% free forever, zero ads, zero trackers.',
};

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-background">
      <AuthCard
        mode="register"
        title="Get started for free"
        subtitle="Pure workout logging functionality. 100% free forever with zero ads and zero trackers."
        footerText="Already registered?"
        footerLinkText="Sign in to your account"
        footerLinkHref="/login"
      >
        <RegisterForm />
      </AuthCard>
    </main>
  );
}
