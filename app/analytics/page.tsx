import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getAnalyticsDataAction } from '@/app/analytics/actions';
import { AnalyticsDashboard } from '@/components/analytics/analytics-dashboard';
import {
  ArrowLeft,
  Plus,
  TrendingUp,
  Dumbbell,
  Layers,
  History,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Training Analytics & Performance | GymLogger',
  description:
    'Comprehensive volume progression, estimated 1RM trajectories, symmetry distribution, and PR achievements.',
};

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/analytics');
  }

  // Fetch initial analytics (default 30 days)
  const analyticsRes = await getAnalyticsDataAction('30d');
  const analyticsData = analyticsRes.success && analyticsRes.data ? analyticsRes.data : null;

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-background text-text-primary p-6 flex items-center justify-center">
        <p className="text-rose-400">Failed to load analytics. Please refresh the page.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text-primary pb-24">
      {/* Sticky Header */}
      <header className="sticky top-0 z-20 bg-surface/95 backdrop-blur-xl border-b border-border/80 px-4 py-3.5 sm:px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text-primary transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>

            <span className="hidden sm:inline-block text-border text-sm">/</span>

            <div className="hidden sm:flex items-center gap-1 text-xs text-text-subtle">
              <Link href="/workout/history" className="hover:text-text-primary transition-colors">
                History
              </Link>
              <span>•</span>
              <Link href="/routines" className="hover:text-text-primary transition-colors">
                Routines
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/workout/active"
              className="min-h-[36px] px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs active:scale-[0.98] transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm shadow-emerald-900/40"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Start Workout</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Banner Section */}
        <div className="relative rounded-3xl bg-surface-raised border border-border/80 p-6 sm:p-8 overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">
                    Training Analytics & Performance
                  </h1>
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    Pro Metrics
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-text-muted mt-0.5">
                  Volume progression, 1RM trajectory models, symmetry distribution, and PR milestones.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Link
                href="/workout/history"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface border border-border hover:bg-surface-hover text-text-primary text-xs font-semibold focus-ring transition-colors cursor-pointer"
              >
                <History className="w-3.5 h-3.5 text-text-muted" />
                <span>Session Logs</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Client Interactive Analytics Suite */}
        <AnalyticsDashboard initialData={analyticsData} />
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto pt-8 text-center text-xs text-text-subtle flex items-center justify-center gap-4 flex-wrap">
        <span>GymLogger v0.1</span>
        <span>•</span>
        <span>Brzycki Formula 1RM Modeling</span>
        <span>•</span>
        <span>Metric Volume Standard (kg)</span>
      </footer>
    </div>
  );
}
