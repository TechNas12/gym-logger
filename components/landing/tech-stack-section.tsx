'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Terminal, 
  Copy, 
  Check, 
  Server, 
  Database, 
  Cpu, 
  Layers, 
  Code2, 
  ArrowRight 
} from 'lucide-react';
import { ScrollReveal } from './scroll-reveal';

const STACK_ITEMS = [
  {
    name: 'Next.js 16',
    role: 'Fullstack App Framework',
    description: 'Lightning-fast Turbopack, App Router, and server components.',
    badge: 'Turbopack',
  },
  {
    name: 'React 19',
    role: 'Modern Client UI',
    description: 'Concurrent rendering and instant UI micro-interactions.',
    badge: 'v19.2',
  },
  {
    name: 'Supabase SSR',
    role: 'Secure Authentication',
    description: 'JWT session management, secure cookies, and row-level security.',
    badge: 'Auth Ready',
  },
  {
    name: 'Prisma ORM 7',
    role: 'Type-Safe Data Layer',
    description: 'Zero-overhead queries with full SQLite and PostgreSQL portability.',
    badge: 'Type-Safe',
  },
  {
    name: 'Tailwind CSS v4',
    role: 'Engineered Styles',
    description: 'Clean inline theme tokens with high-contrast accessibility.',
    badge: 'Modern CSS',
  },
  {
    name: 'Data Portability',
    role: 'Homelab & Docker',
    description: 'Run locally on your laptop, Raspberry Pi, VPS, or deploy to Vercel.',
    badge: 'Self-Host',
  },
];

const CODE_SNIPPET = `# 1. Clone the repository
git clone https://github.com/open-gym/gym-logger.git
cd gym-logger

# 2. Install dependencies
npm install

# 3. Configure your local environment
cp .env.example .env.local

# 4. Launch your local dev server
npm run dev`;

export function TechStackSection() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(CODE_SNIPPET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="tech-stack" className="py-12 sm:py-20 lg:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <ScrollReveal delayMs={0} direction="up">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-semibold uppercase tracking-wider mb-4">
              <Code2 className="w-3.5 h-3.5" />
              Developer & Hacker Friendly
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-text-primary">
              Built On A Modern,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-emerald-400">
                Rock-Solid Stack
              </span>
            </h2>
            <p className="mt-3 sm:mt-4 text-sm sm:text-lg text-text-muted">
              Inspect every line of code, self-host on your own infrastructure, or contribute features to the community.
            </p>
          </div>
        </ScrollReveal>

        {/* Stack grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {STACK_ITEMS.map((item, idx) => (
            <ScrollReveal key={item.name} delayMs={idx * 80} direction="up">
              <div className="h-full p-6 rounded-2xl bg-surface border border-border/80 hover:border-accent/40 transition-all duration-200 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-base font-bold text-text-primary">{item.name}</span>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-surface-raised text-accent border border-accent/20">
                    {item.badge}
                  </span>
                </div>
                <p className="text-xs font-semibold text-text-subtle uppercase tracking-wider mb-2">
                  {item.role}
                </p>
                <p className="text-sm text-text-muted leading-relaxed">
                  {item.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Terminal / Code Box */}
        <ScrollReveal delayMs={150} direction="up">
          <div className="max-w-3xl mx-auto rounded-2xl bg-[#090d13] border border-border/80 shadow-2xl overflow-hidden">
            {/* Terminal Title Bar */}
            <div className="px-4 py-3 bg-surface-raised/80 border-b border-border/70 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="ml-2 text-xs font-mono text-text-subtle flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-accent" />
                  bash - quickstart
                </span>
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className="min-h-[44px] inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono text-text-muted hover:text-text-primary bg-surface hover:bg-surface-raised active:bg-surface-hover border border-border cursor-pointer transition-colors active:scale-95"
                aria-label="Copy installation command"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-accent" />
                    <span className="text-accent">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Terminal Code Content */}
            <div className="p-4 sm:p-6 overflow-x-auto text-xs sm:text-sm font-mono text-slate-300 leading-relaxed scrollbar-none">
              <pre>
                <code>{CODE_SNIPPET}</code>
              </pre>
            </div>
          </div>
        </ScrollReveal>

        {/* CTA banner below stack */}
        <ScrollReveal delayMs={200} direction="up">
          <div className="mt-12 text-center">
            <p className="text-sm text-text-muted mb-4">
              Prefer using the hosted web version? No setup required.
            </p>
            <Link
              href="/register"
              className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-accent text-accent-foreground font-bold text-sm hover:bg-accent-hover active:scale-98 transition-all duration-200 cursor-pointer shadow-lg"
            >
              <span>Register Now & Start Immediately</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
