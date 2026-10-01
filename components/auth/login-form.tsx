'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { loginSchema } from '@/lib/validations/auth';
import { mapAuthError, type AuthErrorDetails } from '@/lib/auth-errors';
import { getSafeRedirectUrl } from '@/lib/redirect';
import { FormErrorBanner } from './form-error-banner';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get('next');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [errorDetails, setErrorDetails] = useState<AuthErrorDetails | null>(null);
  const [isPending, setIsPending] = useState(false);

  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleResendConfirmation = async () => {
    if (!email) return;
    setIsResending(true);
    setResendSuccess(false);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim().toLowerCase(),
      });

      if (error) {
        setErrorDetails(mapAuthError(error));
      } else {
        setResendSuccess(true);
      }
    } catch (err) {
      setErrorDetails(mapAuthError(err));
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFieldErrors({});
    setErrorDetails(null);
    setResendSuccess(false);

    // 1. Client-side Zod validation
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const errors: { email?: string; password?: string } = {};
      for (const issue of parsed.error.issues) {
        const fieldName = issue.path[0] as 'email' | 'password';
        if (!errors[fieldName]) {
          errors[fieldName] = issue.message;
        }
      }
      setFieldErrors(errors);
      return;
    }

    // 2. Perform Supabase authentication
    setIsPending(true);
    const normalizedEmail = parsed.data.email;

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        const mapped = mapAuthError(error);
        setErrorDetails(mapped);

        // Preserve email, clear password field on failed attempt
        setPassword('');
        setIsPending(false);
        return;
      }

      if (data.session) {
        const destination = getSafeRedirectUrl(nextParam, '/login-success');
        router.push(destination);
        router.refresh();
      }
    } catch (err) {
      setErrorDetails(mapAuthError(err));
      setPassword('');
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {/* Form-level Error Banner */}
      <FormErrorBanner
        error={errorDetails?.message || null}
        isEmailNotConfirmed={errorDetails?.isEmailNotConfirmed}
        onResendConfirmation={handleResendConfirmation}
        isResending={isResending}
        resendSuccess={resendSuccess}
      />

      {/* Email Input */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-text-primary mb-1.5"
        >
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isPending}
          placeholder="you@example.com"
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? 'email-error' : undefined}
          className={`w-full px-3.5 py-2.5 rounded-lg bg-surface-raised border text-text-primary text-sm placeholder:text-text-subtle transition-all duration-150 focus-ring ${
            fieldErrors.email
              ? 'border-danger focus-visible:ring-danger'
              : 'border-border hover:border-border-focus/60'
          }`}
        />
        {fieldErrors.email && (
          <p
            id="email-error"
            role="alert"
            className="mt-1.5 text-xs text-danger font-medium animate-in fade-in"
          >
            {fieldErrors.email}
          </p>
        )}
      </div>

      {/* Password Input */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-text-primary"
          >
            Password
          </label>
        </div>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isPending}
            placeholder="••••••••"
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={fieldErrors.password ? 'password-error' : undefined}
            className={`w-full pl-3.5 pr-11 py-2.5 rounded-lg bg-surface-raised border text-text-primary text-sm placeholder:text-text-subtle transition-all duration-150 focus-ring ${
              fieldErrors.password
                ? 'border-danger focus-visible:ring-danger'
                : 'border-border hover:border-border-focus/60'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            tabIndex={0}
            disabled={isPending}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-text-subtle hover:text-text-primary rounded-md focus-ring"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Eye className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
        </div>
        {fieldErrors.password && (
          <p
            id="password-error"
            role="alert"
            className="mt-1.5 text-xs text-danger font-medium animate-in fade-in"
          >
            {fieldErrors.password}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-accent text-accent-foreground font-semibold text-sm hover:bg-accent-hover active:bg-accent-active disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 focus-ring shadow-lg shadow-accent/20 cursor-pointer"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              <span>Signing in...</span>
            </>
          ) : (
            <span>Sign In</span>
          )}
        </button>
      </div>
    </form>
  );
}
