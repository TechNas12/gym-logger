import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Dumbbell, ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard';
import type { InitialProfileData } from '@/components/onboarding/onboarding-wizard';

export const metadata: Metadata = {
  title: 'Setup Your Fitness Profile | GymLogger',
  description:
    'Calculate your BMI, maintenance calories, daily targets, and macronutrient requirements.',
};

interface OnboardingPageProps {
  searchParams: Promise<{ edit?: string }>;
}

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/onboarding');
  }

  // Fetch current user row from public.users table
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  const resolvedParams = await searchParams;
  const isEditMode = resolvedParams?.edit === 'true';

  // If already onboarded and not explicitly in edit mode, redirect to target view
  if (profile?.is_onboarded && !isEditMode) {
    redirect('/dashboard');
  }

  const initialProfile: InitialProfileData = {
    gender: profile?.gender || null,
    dateOfBirth: profile?.date_of_birth || null,
    heightCm: profile?.height_cm ? Number(profile.height_cm) : null,
    weightKg: profile?.weight_kg ? Number(profile.weight_kg) : null,
    activityLevel: profile?.activity_level || null,
    fitnessGoal: profile?.fitness_goal || null,
    weeklyGoalRateKg: profile?.weekly_goal_rate_kg ? Number(profile.weekly_goal_rate_kg) : null,
    firstName:
      profile?.first_name ||
      (typeof user.user_metadata?.first_name === 'string'
        ? user.user_metadata.first_name
        : null),
  };

  const displayName = initialProfile.firstName || 'Athlete';

  return (
    <main className="min-h-screen bg-background selection:bg-accent/30 selection:text-text-primary flex flex-col justify-between p-4 sm:p-6 lg:p-10 relative overflow-x-hidden">
      {/* Top Navbar */}
      <header className="w-full max-w-2xl mx-auto flex items-center justify-between pb-4 sm:pb-6 relative z-10">
        <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-surface-raised border border-border text-accent group-hover:border-accent/60 transition-colors">
            <Dumbbell className="w-4 h-4 text-accent" />
          </div>
          <span className="text-base sm:text-lg font-bold tracking-tight text-text-primary">
            Gym<span className="text-accent">Logger</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {profile?.is_onboarded && (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-text-muted hover:text-text-primary bg-surface-raised border border-border transition-colors cursor-pointer min-h-[36px]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </Link>
          )}
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-raised border border-border/70 text-[11px] font-mono text-text-subtle">
            <ShieldCheck className="w-3 h-3 text-accent" />
            100% Private
          </span>
        </div>
      </header>

      {/* Centered Main Wizard Card */}
      <section className="w-full max-w-2xl mx-auto my-auto relative z-10 py-2 sm:py-6">
        <div className="relative rounded-3xl bg-surface border border-border p-5 sm:p-8 lg:p-9">

          {/* Card Header */}
          <div className="mb-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              {isEditMode ? 'Update Your Profile' : 'Personalized Setup'}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
              Welcome, {displayName}!
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-text-muted leading-relaxed">
              Let&apos;s calculate your exact energy requirements, BMI, and daily macronutrient targets.
            </p>
          </div>

          {/* Injected Wizard */}
          <OnboardingWizard initialProfile={initialProfile} />
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full max-w-2xl mx-auto pt-6 text-center text-xs text-text-subtle relative z-10 flex items-center justify-center gap-4 flex-wrap">
        <span>Scientific Mifflin-St Jeor formula</span>
        <span>•</span>
        <span>Standardized Metric Engine</span>
        <span>•</span>
        <span>Encrypted & Private</span>
      </footer>
    </main>
  );
}
