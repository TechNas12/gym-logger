import React from 'react';
import Link from 'next/link';

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footerText?: string;
  footerLinkText?: string;
  footerLinkHref?: string;
}

export function AuthCard({
  title,
  subtitle,
  children,
  footerText,
  footerLinkText,
  footerLinkHref,
}: AuthCardProps) {
  return (
    <div className="w-full max-w-[420px] px-4 py-8 mx-auto">
      <div className="relative rounded-2xl bg-surface border border-border/80 shadow-2xl p-6 sm:p-8 backdrop-blur-sm">
        {/* Subtle accent glow top border */}
        <div
          className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-75"
          aria-hidden="true"
        />

        {/* Card Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent-glow text-accent mb-3 ring-1 ring-accent/30">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            {title}
          </h1>
          <p className="mt-1.5 text-sm text-text-muted">{subtitle}</p>
        </div>

        {/* Card Body */}
        {children}

        {/* Card Footer */}
        {footerText && footerLinkHref && footerLinkText && (
          <div className="mt-6 pt-5 border-t border-border/60 text-center text-sm text-text-muted">
            {footerText}{' '}
            <Link
              href={footerLinkHref}
              className="font-medium text-accent hover:text-accent-hover underline-offset-4 hover:underline focus-ring rounded-sm px-1 py-0.5"
            >
              {footerLinkText}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
