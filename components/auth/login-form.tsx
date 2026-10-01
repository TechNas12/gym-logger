'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Loader2, Mail, Lock, ArrowRight } from 'lucide-react';
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
  const [rememberMe, setRememberMe] = useState(true);

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
          className="block text-xs uppercase tracking-wider font-semibold text-text-primary mb-2"
        >
          Email address
        </label>
        <div className="relative">
          <Mail 
            className="w-4 h-4 text-text-subtle absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" 
            aria-hidden="true" 
          />
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isPending}
            placeholder="athlete@gymlogger.com"
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? 'email-error' : undefined}
            className={`w-full pl-10 pr-3.5 py-3 rounded-xl bg-surface-raised border text-text-primary text-sm placeholder:text-text-subtle transition-all duration-200 focus-ring min-h-[46px] ${
              fieldErrors.email
                ? 'border-danger focus-visible:ring-danger bg-danger-bg/20'
                : 'border-border/80 hover:border-border-focus/60'
            }`}
          />
        </div>
        {fieldErrors.email && (
          <p
            id="email-error"
            role="alert"
            className="mt-1.5 text-xs text-danger font-medium animate-in fade-in flex items-center gap-1.5"
          >
            <span>•</span> {fieldErrors.email}
          </p>
        )}
      </div>

      {/* Password Input */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label
            htmlFor="password"
            className="block text-xs uppercase tracking-wider font-semibold text-text-primary"
          >
            Password
          </label>
        </div>
        <div className="relative">
          <Lock 
            className="w-4 h-4 text-text-subtle absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" 
            aria-hidden="true" 
          />
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isPending}
            placeholder="••••••••••••"
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={fieldErrors.password ? 'password-error' : undefined}
            className={`w-full pl-10 pr-12 py-3 rounded-xl bg-surface-raised border text-text-primary text-sm placeholder:text-text-subtle transition-all duration-200 focus-ring min-h-[46px] ${
              fieldErrors.password
                ? 'border-danger focus-visible:ring-danger bg-danger-bg/20'
                : 'border-border/80 hover:border-border-focus/60'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            tabIndex={0}
            disabled={isPending}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-1 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] flex items-center justify-center text-text-subtle hover:text-text-primary rounded-lg focus-ring transition-colors cursor-pointer"
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
            className="mt-1.5 text-xs text-danger font-medium animate-in fade-in flex items-center gap-1.5"
          >
            <span>•</span> {fieldErrors.password}
          </p>
        )}
      </div>

      {/* Remember me row */}
      <div className="flex items-center justify-between pt-1">
        <label className="flex items-center gap-2 cursor-pointer group select-none min-h-[32px]">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded border-border text-accent focus:ring-accent bg-surface-raised accent-accent cursor-pointer"
          />
          <span className="text-xs text-text-muted group-hover:text-text-primary transition-colors">
            Keep me signed in
          </span>
        </label>
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-accent text-accent-foreground font-bold text-sm sm:text-base hover:bg-accent-hover active:bg-accent-active active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus-ring shadow-[0_0_25px_rgba(34,197,94,0.35)] hover:shadow-[0_0_35px_rgba(34,197,94,0.5)] cursor-pointer group"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <span>Sign In To GymLogger</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
