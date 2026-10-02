'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Dumbbell, Menu, X, ArrowRight, Sparkles } from 'lucide-react';
import { GithubIcon } from './icons';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer on Escape key and prevent background scroll when open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 w-full px-3 sm:px-6 lg:px-8 pt-3 sm:pt-4 pb-2">
        <nav
          aria-label="Main Navigation"
          className="max-w-7xl mx-auto flex items-center justify-between px-3.5 sm:px-6 py-2.5 sm:py-3 rounded-2xl bg-surface/90 backdrop-blur-md border border-border/80 shadow-2xl transition-all duration-200"
        >
          {/* Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 sm:gap-2.5 group cursor-pointer shrink-0 min-h-[44px]"
          >
            <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-surface-raised border border-border text-accent group-hover:border-accent/60 transition-colors">
              <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-bold tracking-tight text-text-primary flex items-center gap-1.5">
                Gym<span className="text-accent">Logger</span>
              </span>
              <span className="text-[10px] text-text-subtle font-mono hidden md:inline">
                Ad-Free, Simple & 100% Free
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            <a
              href="#features"
              className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors duration-200 cursor-pointer"
            >
              Features
            </a>
            <a
              href="#interactive-demo"
              className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors duration-200 cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              Live Preview
            </a>
            <a
              href="#comparison"
              className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors duration-200 cursor-pointer"
            >
              Why Open Source
            </a>
            <a
              href="#tech-stack"
              className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors duration-200 cursor-pointer"
            >
              Self-Host
            </a>
            <a
              href="#faq"
              className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors duration-200 cursor-pointer"
            >
              FAQ
            </a>
          </div>

          {/* Action CTAs Desktop */}
          <div className="hidden sm:flex items-center gap-2.5">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl text-text-muted hover:text-text-primary bg-surface-raised/80 hover:bg-surface-hover border border-border transition-all duration-200 cursor-pointer min-h-[44px]"
              aria-label="View on GitHub"
            >
              <GithubIcon className="w-4 h-4" />
              <span className="font-mono hidden md:inline">GitHub</span>
            </a>

            <Link
              href="/login"
              className="px-3.5 py-2 text-xs sm:text-sm font-medium text-text-muted hover:text-text-primary transition-colors duration-200 cursor-pointer min-h-[44px] flex items-center justify-center"
            >
              Sign In
            </Link>

            <Link
              href="/register"
              className="relative inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors duration-200 cursor-pointer group whitespace-nowrap min-h-[44px]"
            >
              <span>Register Now</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-200" />
            </Link>
          </div>

          {/* Mobile menu trigger + Compact Register */}
          <div className="flex sm:hidden items-center gap-2">
            <Link
              href="/register"
              className="min-h-[44px] px-3.5 flex items-center justify-center text-xs font-bold rounded-xl bg-accent text-accent-foreground hover:bg-accent-hover cursor-pointer whitespace-nowrap shadow-sm active:scale-95 transition-transform"
            >
              Register
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="min-w-[44px] min-h-[44px] rounded-xl text-text-muted hover:text-text-primary bg-surface-raised border border-border cursor-pointer focus-ring flex items-center justify-center active:bg-surface-hover transition-colors"
              aria-label={mobileMenuOpen ? "Close Navigation Menu" : "Open Navigation Menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-accent" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile dropdown sheet */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-2 mx-auto max-w-7xl px-4 py-5 rounded-2xl bg-surface/95 border border-border/90 shadow-2xl backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-1">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="min-h-[44px] flex items-center px-4 py-2.5 text-sm font-medium text-text-muted hover:text-text-primary hover:bg-surface-raised rounded-xl transition-colors cursor-pointer"
              >
                Features
              </a>
              <a
                href="#interactive-demo"
                onClick={() => setMobileMenuOpen(false)}
                className="min-h-[44px] flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-text-muted hover:text-text-primary hover:bg-surface-raised rounded-xl transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-accent" />
                <span>Live Interactive Sandbox</span>
              </a>
              <a
                href="#comparison"
                onClick={() => setMobileMenuOpen(false)}
                className="min-h-[44px] flex items-center px-4 py-2.5 text-sm font-medium text-text-muted hover:text-text-primary hover:bg-surface-raised rounded-xl transition-colors cursor-pointer"
              >
                Why Open Source
              </a>
              <a
                href="#tech-stack"
                onClick={() => setMobileMenuOpen(false)}
                className="min-h-[44px] flex items-center px-4 py-2.5 text-sm font-medium text-text-muted hover:text-text-primary hover:bg-surface-raised rounded-xl transition-colors cursor-pointer"
              >
                Self-Hosting & Tech Stack
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="min-h-[44px] flex items-center px-4 py-2.5 text-sm font-medium text-text-muted hover:text-text-primary hover:bg-surface-raised rounded-xl transition-colors cursor-pointer"
              >
                Frequently Asked Questions
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="min-h-[44px] flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-text-muted hover:text-text-primary hover:bg-surface-raised rounded-xl transition-colors cursor-pointer"
              >
                <GithubIcon className="w-4 h-4" />
                <span>Star on GitHub (Open Source)</span>
              </a>
              <div className="pt-4 mt-2 border-t border-border/80 flex flex-col gap-2.5">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="min-h-[48px] w-full flex items-center justify-center text-sm font-medium text-text-primary bg-surface-raised hover:bg-surface-hover rounded-xl border border-border cursor-pointer transition-colors active:scale-[0.99]"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="min-h-[48px] w-full flex items-center justify-center text-sm font-bold text-accent-foreground bg-accent hover:bg-accent-hover rounded-xl cursor-pointer shadow-lg transition-colors active:scale-[0.99]"
                >
                  Register Now — Free Forever
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Backdrop overlay for mobile menu */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-in fade-in duration-200"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
