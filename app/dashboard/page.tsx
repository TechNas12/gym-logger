import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  CheckCircle2,
  Target,
  Dumbbell,
  Settings,
  Scale,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { SignOutButton } from '@/components/auth/sign-out-button';
import { WorkoutHub } from '@/components/dashboard/workout-hub';
import { AnalyticsKpiWidget } from '@/components/dashboard/analytics-kpi-widget';
import { WorkoutCard } from '@/components/workout/history/workout-card';
import { InstallAppButton } from '@/components/pwa/install-button';
import { getWorkoutHistoryAction } from '@/app/workout/actions';
import { getDashboardAnalyticsKpiAction } from '@/app/analytics/actions';
import {
  ACTIVITY_LEVEL_DETAILS,
  FITNESS_GOAL_DETAILS,
  type ActivityLevel,
  type FitnessGoal,
} from '@/lib/fitness-calculations';

export const metadata: Metadata = {
  title: 'Dashboard | GymLogger',
  description: 'Your personalized workout and nutrition dashboard.',
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/dashboard');
  }

  // Fetch full user profile from public.users table
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  // If user has not completed onboarding, route them to onboarding
  if (!profile?.is_onboarded) {
    redirect('/onboarding');
  }

  const firstName = profile?.first_name || user.user_metadata?.first_name || 'Athlete';

  // Fetch recent workouts for dashboard display
  const historyRes = await getWorkoutHistoryAction({ limit: 2 });
  const recentWorkouts = historyRes.success && historyRes.data ? historyRes.data : [];

  // Fetch training analytics KPI for dashboard glimpse
  const kpiRes = await getDashboardAnalyticsKpiAction();
  const analyticsKpi =
    kpiRes.success && kpiRes.data
      ? kpiRes.data
      : {
          hasWorkouts: false,
          thisWeekVolumeKg: 0,
          volumeChangePercent: null,
          thisWeekWorkoutsCount: 0,
          currentStreakWeeks: 0,
          topMuscleGroup: null,
          topMusclePercentage: null,
          latestPr: null,
          sparkline: [],
        };

  const goal = (profile.fitness_goal as FitnessGoal) || 'maintain';
  const goalDetails = FITNESS_GOAL_DETAILS[goal];

  const activity = (profile.activity_level as ActivityLevel) || 'moderate';
  const activityDetails = ACTIVITY_LEVEL_DETAILS[activity];

  const bmi = profile.bmi ? Number(profile.bmi) : null;
  const targetCalories = profile.target_calories ? Number(profile.target_calories) : null;
  const bmr = profile.bmr ? Number(profile.bmr) : null;
  const tdee = profile.tdee ? Number(profile.tdee) : null;
  const adjustment = profile.caloric_adjustment !== null ? Number(profile.caloric_adjustment) : 0;
  const proteinG = profile.protein_g ? Number(profile.protein_g) : null;
  const carbsG = profile.carbs_g ? Number(profile.carbs_g) : null;
  const fatG = profile.fat_g ? Number(profile.fat_g) : null;

  return (
    <main className="min-h-screen bg-background selection:bg-accent/30 selection:text-text-primary p-4 sm:p-6 lg:p-10 flex flex-col justify-between">
      {/* Top Bar */}
      <header className="w-full max-w-4xl mx-auto flex items-center justify-between pb-6 border-b border-border/60">
        <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-surface-raised border border-border text-accent group-hover:border-accent/60 transition-colors">
            <Dumbbell className="w-4 h-4 text-accent" />
          </div>
          <span className="text-base sm:text-lg font-bold tracking-tight text-text-primary">
            Gym<span className="text-accent">Logger</span>
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <InstallAppButton />
          <Link
            href="/analytics"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-raised border border-border/80 hover:bg-surface-hover text-emerald-400 text-xs font-semibold focus-ring transition-colors cursor-pointer min-h-[36px]"
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Analytics</span>
          </Link>
          <Link
            href="/onboarding?edit=true"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-raised border border-border/80 hover:bg-surface-hover text-text-primary text-xs font-semibold focus-ring transition-colors cursor-pointer min-h-[36px]"
          >
            <Settings className="w-3.5 h-3.5 text-accent" />
            <span className="hidden sm:inline">Update Stats & Goals</span>
            <span className="sm:hidden">Update</span>
          </Link>
          <SignOutButton />
        </div>
      </header>

      {/* Main Content Area */}
      <div className="w-full max-w-4xl mx-auto my-auto py-6 sm:py-8 space-y-6">
        {/* Welcome Banner Card */}
        <div className="relative rounded-3xl bg-surface border border-border p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/70">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-surface-raised border border-border text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
                    Welcome, {firstName}!
                  </h1>
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-accent/15 text-accent border border-accent/30">
                    Active Plan
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-text-muted mt-0.5">
                  Here are your daily caloric and macronutrient targets.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full border ${goalDetails.badgeColor}`}
              >
                {goalDetails.label}
              </span>
            </div>
          </div>

          {/* User Baseline Summary Pill */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 text-center">
            <div className="p-3 rounded-2xl bg-surface-raised border border-border/70">
              <span className="text-[10px] text-text-subtle uppercase tracking-wider block font-semibold">
                Height
              </span>
              <span className="text-sm sm:text-base font-bold font-mono text-text-primary">
                {profile.height_cm ? `${profile.height_cm} cm` : '—'}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-surface-raised border border-border/70">
              <span className="text-[10px] text-text-subtle uppercase tracking-wider block font-semibold">
                Weight
              </span>
              <span className="text-sm sm:text-base font-bold font-mono text-text-primary">
                {profile.weight_kg ? `${profile.weight_kg} kg` : '—'}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-surface-raised border border-border/70">
              <span className="text-[10px] text-text-subtle uppercase tracking-wider block font-semibold">
                BMI Score
              </span>
              <span className="text-sm sm:text-base font-bold font-mono text-accent">
                {bmi ? `${bmi} (${profile.bmi_category || 'Normal'})` : '—'}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-surface-raised border border-border/70">
              <span className="text-[10px] text-text-subtle uppercase tracking-wider block font-semibold">
                Activity
              </span>
              <span className="text-sm sm:text-base font-bold text-text-primary truncate block">
                {activityDetails.label}
              </span>
            </div>
          </div>
        </div>

        {/* Workout Tracker Entry Section (Start Workout & Start Routine) */}
        <WorkoutHub userName={firstName} />

        {/* Training Analytics KPI Placement (Glimpse of Analytics) */}
        <AnalyticsKpiWidget kpi={analyticsKpi} />

        {/* Recent Workouts Activity (if any) */}
        {recentWorkouts.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-accent" />
                <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                  Recent Workouts
                </h2>
              </div>
              <Link
                href="/workout/history"
                className="text-xs font-semibold text-accent hover:underline"
              >
                View All History →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentWorkouts.map((w) => (
                <WorkoutCard key={w.id} workout={w} />
              ))}
            </div>
          </section>
        )}

        {/* Daily Targets & Calorie Breakdown Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Main Daily Calorie Target Card */}
          <div className="sm:col-span-1 rounded-3xl bg-surface border border-border p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-accent">
                  <Target className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-wider font-bold">Daily Target</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface-raised border border-border text-emerald-400 font-bold">
                  {adjustment > 0 ? `+${adjustment}` : adjustment < 0 ? `${adjustment}` : 'Balance'}
                </span>
              </div>

              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="text-4xl sm:text-5xl font-black font-mono text-emerald-400">
                  {targetCalories ? targetCalories.toLocaleString() : '—'}
                </span>
                <span className="text-sm font-semibold text-text-muted">kcal / day</span>
              </div>

              <p className="mt-2 text-xs text-text-muted leading-relaxed">
                {goal === 'lose_weight' && profile.weekly_goal_rate_kg
                  ? `Calibrated for a fat loss rate of ${profile.weekly_goal_rate_kg} kg / week (${adjustment} kcal/day deficit).`
                  : goal === 'gain_muscle' && profile.weekly_goal_rate_kg
                  ? `Calibrated for a lean surplus rate of +${profile.weekly_goal_rate_kg} kg / week (+${adjustment} kcal/day surplus).`
                  : goalDetails.shortDesc}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-border/60 space-y-1.5 text-xs">
              <div className="flex justify-between text-text-muted">
                <span>Basal Rate (BMR):</span>
                <span className="font-mono text-text-primary font-semibold">
                  {bmr ? `${bmr.toLocaleString()} kcal` : '—'}
                </span>
              </div>
              <div className="flex justify-between text-text-muted">
                <span>Maintenance (TDEE):</span>
                <span className="font-mono text-text-primary font-semibold">
                  {tdee ? `${tdee.toLocaleString()} kcal` : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Daily Macros Card */}
          <div className="sm:col-span-2 rounded-3xl bg-surface border border-border p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-accent" />
                  <h2 className="text-sm uppercase tracking-wider font-bold text-text-primary">
                    Daily Macronutrient Targets
                  </h2>
                </div>
                <span className="text-xs text-text-subtle font-mono">100% of energy</span>
              </div>

              {/* 3 Macro Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Protein */}
                <div className="p-4 rounded-2xl bg-surface-raised border border-sky-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-sky-400">Protein</span>
                    <span className="w-2 h-2 rounded-full bg-sky-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-text-primary">
                    {proteinG || 0}
                    <span className="text-xs text-text-subtle font-normal ml-1">g</span>
                  </div>
                  <div className="text-[11px] text-text-subtle font-mono mt-1">
                    {proteinG ? `${proteinG * 4} kcal` : '—'}
                  </div>
                </div>

                {/* Carbohydrates */}
                <div className="p-4 rounded-2xl bg-surface-raised border border-amber-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-amber-400">Carbs</span>
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-text-primary">
                    {carbsG || 0}
                    <span className="text-xs text-text-subtle font-normal ml-1">g</span>
                  </div>
                  <div className="text-[11px] text-text-subtle font-mono mt-1">
                    {carbsG ? `${carbsG * 4} kcal` : '—'}
                  </div>
                </div>

                {/* Fats */}
                <div className="p-4 rounded-2xl bg-surface-raised border border-rose-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-rose-400">Fats</span>
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-text-primary">
                    {fatG || 0}
                    <span className="text-xs text-text-subtle font-normal ml-1">g</span>
                  </div>
                  <div className="text-[11px] text-text-subtle font-mono mt-1">
                    {fatG ? `${fatG * 9} kcal` : '—'}
                  </div>
                </div>
              </div>
            </div>

            {/* Micro reminder */}
            <div className="mt-5 pt-3.5 border-t border-border/60 flex items-center justify-between text-xs text-text-subtle">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                Targets adapt when you update body weight in Settings.
              </span>
              <Link
                href="/onboarding?edit=true"
                className="text-accent hover:underline font-semibold"
              >
                Edit Stats →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-4xl mx-auto pt-4 text-center text-xs text-text-subtle flex items-center justify-center gap-4 flex-wrap">
        <span>GymLogger v0.1</span>
        <span>•</span>
        <span>FOSS Fitness Tracking</span>
        <span>•</span>
        <span>Standardized Metric System</span>
      </footer>
    </main>
  );
}
