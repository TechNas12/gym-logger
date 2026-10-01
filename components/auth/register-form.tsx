'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, MailCheck, RefreshCw } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { registerSchema } from '@/lib/validations/auth';
import { mapAuthError, type AuthErrorDetails } from '@/lib/auth-errors';
import { PasswordRequirements } from './password-requirements';
import { FormErrorBanner } from './form-error-banner';

export function RegisterForm() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [errorDetails, setErrorDetails] = useState<AuthErrorDetails | null>(null);
  const [isPending, setIsPending] = useState(false);

  // Email confirmation state (if project requires email verification)
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);
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

    // 1. Zod client validation
    const parsed = registerSchema.safeParse({ email, password, confirmPassword });
    if (!parsed.success) {
      const errors: {
        email?: string;
        password?: string;
        confirmPassword?: string;
      } = {};
      for (const issue of parsed.error.issues) {
        const fieldName = issue.path[0] as
          | 'email'
          | 'password'
          | 'confirmPassword';
        if (!errors[fieldName]) {
          errors[fieldName] = issue.message;
        }
      }
      setFieldErrors(errors);
      return;
    }

    setIsPending(true);
    const normalizedEmail = parsed.data.email;

    try {
      const supabase = createClient();

      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          emailRedirectTo:
            typeof window !== 'undefined'
              ? `${window.location.origin}/login-success`
              : undefined,
        },
      });

      if (error) {
        setErrorDetails(mapAuthError(error));
        setPassword('');
        setConfirmPassword('');
        setIsPending(false);
        return;
      }

      // Check if email confirmation is required:
      // When email confirmation is enabled, Supabase returns a user object but NO active session.
      // If user is already registered (and Supabase has "prevent email enumeration" enabled),
      // data.user.identities may be empty [].
      if (data.user && !data.session) {
        // If identities is present and empty, user already registered
        if (data.user.identities && data.user.identities.length === 0) {
          setErrorDetails({
            message:
              'An account with this email address already exists. Please log in instead.',
          });
          setPassword('');
          setConfirmPassword('');
          setIsPending(false);
          return;
        }

        // Needs email verification
        setNeedsEmailConfirmation(true);
        setIsPending(false);
        return;
      }

      // If email confirmation is disabled on the project, Supabase returns session immediately
      if (data.session) {
        router.push('/login-success');
        router.refresh();
      }
    } catch (err) {
      setErrorDetails(mapAuthError(err));
      setPassword('');
      setConfirmPassword('');
      setIsPending(false);
    }
  };

  // "Check your inbox" state
  if (needsEmailConfirmation) {
    return (
      <div className="text-center py-2 space-y-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent-glow text-accent ring-1 ring-accent/30 mx-auto">
          <MailCheck className="w-7 h-7" aria-hidden="true" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-text-primary">Check your inbox</h2>
          <p className="mt-2 text-sm text-text-muted leading-relaxed">
            We have sent a verification link to{' '}
            <strong className="text-text-primary font-semibold">{email}</strong>.
            Please click the link in that email to confirm your account.
          </p>
        </div>

        <div className="p-3.5 rounded-lg bg-surface-raised border border-border/80 text-xs text-text-subtle">
          Didn&apos;t receive the email? Check your spam folder or click below to resend.
        </div>

        <div className="pt-2 flex flex-col gap-2.5">
          {resendSuccess ? (
            <div className="p-2.5 rounded-lg bg-success-bg border border-success-border text-success text-xs font-medium">
              ✓ Verification link resent! Please check your inbox.
            </div>
          ) : (
            <button
              type="button"
              onClick={handleResendConfirmation}
              disabled={isResending}
              className="inline-flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-surface-raised border border-border hover:bg-surface-hover text-text-primary text-xs font-medium focus-ring cursor-pointer"
            >
              {isResending ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                  Resending...
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                  Resend confirmation link
                </>
              )}
            </button>
          )}

          <Link
            href="/login"
            className="text-xs font-semibold text-accent hover:text-accent-hover underline-offset-4 hover:underline focus-ring rounded py-1"
          >
            Back to login
          </Link>
        </div>
      </div>
    );
  }

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
          htmlFor="register-email"
          className="block text-sm font-medium text-text-primary mb-1.5"
        >
          Email address
        </label>
        <input
          id="register-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isPending}
          placeholder="you@example.com"
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? 'register-email-error' : undefined}
          className={`w-full px-3.5 py-2.5 rounded-lg bg-surface-raised border text-text-primary text-sm placeholder:text-text-subtle transition-all duration-150 focus-ring ${
            fieldErrors.email
              ? 'border-danger focus-visible:ring-danger'
              : 'border-border hover:border-border-focus/60'
          }`}
        />
        {fieldErrors.email && (
          <p
            id="register-email-error"
            role="alert"
            className="mt-1.5 text-xs text-danger font-medium animate-in fade-in"
          >
            {fieldErrors.email}
          </p>
        )}
      </div>

      {/* Password Input */}
      <div>
        <label
          htmlFor="register-password"
          className="block text-sm font-medium text-text-primary mb-1.5"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="register-password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isPending}
            placeholder="••••••••"
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={
              fieldErrors.password ? 'register-password-error' : undefined
            }
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
            id="register-password-error"
            role="alert"
            className="mt-1.5 text-xs text-danger font-medium animate-in fade-in"
          >
            {fieldErrors.password}
          </p>
        )}

        {/* Live password requirement feedback */}
        <PasswordRequirements password={password} />
      </div>

      {/* Confirm Password Input */}
      <div>
        <label
          htmlFor="register-confirm-password"
          className="block text-sm font-medium text-text-primary mb-1.5"
        >
          Confirm password
        </label>
        <div className="relative">
          <input
            id="register-confirm-password"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isPending}
            placeholder="••••••••"
            aria-invalid={Boolean(fieldErrors.confirmPassword)}
            aria-describedby={
              fieldErrors.confirmPassword
                ? 'register-confirm-password-error'
                : undefined
            }
            className={`w-full pl-3.5 pr-11 py-2.5 rounded-lg bg-surface-raised border text-text-primary text-sm placeholder:text-text-subtle transition-all duration-150 focus-ring ${
              fieldErrors.confirmPassword
                ? 'border-danger focus-visible:ring-danger'
                : 'border-border hover:border-border-focus/60'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            tabIndex={0}
            disabled={isPending}
            aria-label={
              showConfirmPassword ? 'Hide confirmed password' : 'Show confirmed password'
            }
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-text-subtle hover:text-text-primary rounded-md focus-ring"
          >
            {showConfirmPassword ? (
              <EyeOff className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Eye className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
        </div>
        {fieldErrors.confirmPassword && (
          <p
            id="register-confirm-password-error"
            role="alert"
            className="mt-1.5 text-xs text-danger font-medium animate-in fade-in"
          >
            {fieldErrors.confirmPassword}
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
              <span>Creating account...</span>
            </>
          ) : (
            <span>Create Account</span>
          )}
        </button>
      </div>
    </form>
  );
}
