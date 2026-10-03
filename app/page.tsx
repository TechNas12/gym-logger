import React from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/landing/navbar';
import { ScrollProgress } from '@/components/landing/scroll-progress';
import { Hero } from '@/components/landing/hero';
import { InteractiveLoggerDemo } from '@/components/landing/interactive-logger-demo';
import { FeaturesGrid } from '@/components/landing/features-grid';
import { ComparisonSection } from '@/components/landing/comparison-section';
import { TechStackSection } from '@/components/landing/tech-stack-section';
import { Testimonials } from '@/components/landing/testimonials';
import { FaqSection } from '@/components/landing/faq-section';
import { CtaBanner } from '@/components/landing/cta-banner';
import { Footer } from '@/components/landing/footer';

export const metadata: Metadata = {
  title: 'GymLogger — Open-Source Workout Tracker & Gym Log',
  description:
    'The 100% free, open-source workout tracker for serious lifters. Track progressive overload, calculate 1RM, manage rest intervals, and own your fitness data without subscription fees.',
};

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-accent selection:text-accent-foreground">
      {/* Real-time Reading/Scroll Progress Bar */}
      <ScrollProgress />

      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <Hero />

        {/* Live Interactive Logger Sandbox */}
        <InteractiveLoggerDemo />

        {/* Features Bento Grid */}
        <FeaturesGrid />

        {/* Value Comparison: Open-Source vs Subscription Apps */}
        <ComparisonSection />

        {/* Tech Stack & Self-Hosting */}
        <TechStackSection />

        {/* Athlete Testimonials */}
        <Testimonials />

        {/* Frequently Asked Questions */}
        <FaqSection />

        {/* High-Impact CTA Banner */}
        <CtaBanner />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
