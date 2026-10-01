'use client';

import React from 'react';
import Link from 'next/link';
import { Dumbbell, Heart, Shield } from 'lucide-react';
import { GithubIcon } from './icons';

export function Footer() {
  return (
    <footer className="border-t border-border/70 bg-surface/70 text-text-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-accent/20 border border-accent/40 text-accent">
                <Dumbbell className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-text-primary tracking-tight">
                Gym<span className="text-accent">Logger</span>
              </span>
            </Link>
            <p className="text-sm text-text-muted max-w-sm leading-relaxed">
              The high-performance, open-source workout tracker designed for lifters who take progressive overload seriously. Zero paywalls, zero ads, and 100% data sovereignty.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-surface-raised hover:bg-surface-hover text-text-muted hover:text-text-primary border border-border transition-all cursor-pointer flex items-center justify-center active:scale-95"
                aria-label="GitHub Repository"
              >
                <GithubIcon className="w-5 h-5" />
              </a>
              <span className="text-xs font-mono text-text-subtle">
                Licensed under MIT • Free Forever
              </span>
            </div>
          </div>

          {/* Links: 2 columns on mobile, clean side-by-side */}
          <div className="grid grid-cols-2 gap-6 sm:gap-8 md:col-span-2">
            {/* Quick links */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-text-primary mb-3 sm:mb-4">
                Navigation
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm">
                <li>
                  <a href="#features" className="hover:text-text-primary transition-colors cursor-pointer py-1 inline-block">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#interactive-demo" className="hover:text-text-primary transition-colors cursor-pointer py-1 inline-block">
                    Demo Sandbox
                  </a>
                </li>
                <li>
                  <a href="#comparison" className="hover:text-text-primary transition-colors cursor-pointer py-1 inline-block">
                    Comparison
                  </a>
                </li>
                <li>
                  <a href="#tech-stack" className="hover:text-text-primary transition-colors cursor-pointer py-1 inline-block">
                    Self-Hosting
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-text-primary transition-colors cursor-pointer py-1 inline-block">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            {/* Get Started / Account */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-text-primary mb-3 sm:mb-4">
                Get Started
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm">
                <li>
                  <Link
                    href="/register"
                    className="text-accent font-semibold hover:underline cursor-pointer py-1 inline-block"
                  >
                    Register Now
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="hover:text-text-primary transition-colors cursor-pointer py-1 inline-block"
                  >
                    Sign In
                  </Link>
                </li>
                <li>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-text-primary transition-colors cursor-pointer py-1 inline-block"
                  >
                    Source Code
                  </a>
                </li>
                <li className="pt-1">
                  <span className="text-[11px] sm:text-xs text-text-subtle block leading-tight">
                    Next.js 16 • React 19 • Supabase PostgreSQL
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-subtle">
          <p>© {new Date().getFullYear()} GymLogger. Open-source under the MIT license.</p>
          <p className="flex items-center gap-1.5">
            Designed for lifters worldwide
          </p>
        </div>
      </div>
    </footer>
  );
}
