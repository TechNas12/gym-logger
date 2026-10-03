'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
  User,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { registerSchema } from '@/lib/validations/auth';
import { mapAuthError, type AuthErrorDetails } from '@/lib/auth-errors';
import { PasswordRequirements } from './password-requirements';
import { FormErrorBanner } from './form-error-banner';

export function RegisterForm() {
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [errorDetails, setErrorDetails] = useState<AuthErrorDetails | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFieldErrors({});
    setErrorDetails(null);

    // 1. Zod client validation
    const parsed = registerSchema.safeParse({
      firstName,
      lastName,
      email,
      password,
      confirmPassword
    });

    if (!parsed.success) {
      const errors: {
        firstName?: string;
        lastName?: string;
        email?: string;
        password?: string;
        confirmPassword?: string;
      } = {};
      for (const issue of parsed.error.issues) {
        const fieldName = issue.path[0] as
          | 'firstName'
          | 'lastName'
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

      // Sign up the new user
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            first_name: parsed.data.firstName,
            last_name: parsed.data.lastName,
            full_name: `${parsed.data.firstName} ${parsed.data.lastName}`.trim(),
          },
        },
      });

      if (error) {
        setErrorDetails(mapAuthError(error));
        setPassword('');
        setConfirmPassword('');
        setIsPending(false);
        return;
      }

      let session = data.session;

      // If signUp did not automatically return a session, sign in directly with password
      if (!session && data.user) {
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

        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

        if (signInError) {
          setErrorDetails(mapAuthError(signInError));
          setPassword('');
          setConfirmPassword('');
          setIsPending(false);
          return;
        }

        session = signInData.session;
      }

      if (session) {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      setErrorDetails(mapAuthError(err));
      setPassword('');
      setConfirmPassword('');
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {/* Form-level Error Banner */}
      <FormErrorBanner error={errorDetails?.message || null} />

      {/* First Name & Last Name (Split into 2 parts) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* First Name Input */}
        <div>
          <label
            htmlFor="register-firstname"
            className="block text-xs uppercase tracking-wider font-semibold text-text-primary mb-2"
          >
            First name
          </label>
          <div className="relative">
            <User
              className="w-4 h-4 text-text-subtle absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="register-firstname"
              name="firstName"
              type="text"
              autoComplete="given-name"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={isPending}
              placeholder="Sanket"
              aria-invalid={Boolean(fieldErrors.firstName)}
              aria-describedby={fieldErrors.firstName ? 'register-firstname-error' : undefined}
              className={`w-full pl-10 pr-3.5 py-3 rounded-xl bg-surface-raised border text-text-primary text-sm placeholder:text-text-subtle transition-all duration-200 focus-ring min-h-[46px] ${fieldErrors.firstName
                  ? 'border-danger focus-visible:ring-danger bg-danger-bg/20'
                  : 'border-border/80 hover:border-border-focus/60'
                }`}
            />
          </div>
          {fieldErrors.firstName && (
            <p
              id="register-firstname-error"
              role="alert"
              className="mt-1.5 text-xs text-danger font-medium animate-in fade-in flex items-center gap-1.5"
            >
              <span>•</span> {fieldErrors.firstName}
            </p>
          )}
        </div>

        {/* Last Name Input */}
        <div>
          <label
            htmlFor="register-lastname"
            className="block text-xs uppercase tracking-wider font-semibold text-text-primary mb-2"
          >
            Last name
          </label>
          <div className="relative">
            <User
              className="w-4 h-4 text-text-subtle absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="register-lastname"
              name="lastName"
              type="text"
              autoComplete="family-name"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={isPending}
              placeholder="Dahotre"
              aria-invalid={Boolean(fieldErrors.lastName)}
              aria-describedby={fieldErrors.lastName ? 'register-lastname-error' : undefined}
              className={`w-full pl-10 pr-3.5 py-3 rounded-xl bg-surface-raised border text-text-primary text-sm placeholder:text-text-subtle transition-all duration-200 focus-ring min-h-[46px] ${fieldErrors.lastName
                  ? 'border-danger focus-visible:ring-danger bg-danger-bg/20'
                  : 'border-border/80 hover:border-border-focus/60'
                }`}
            />
          </div>
          {fieldErrors.lastName && (
            <p
              id="register-lastname-error"
              role="alert"
              className="mt-1.5 text-xs text-danger font-medium animate-in fade-in flex items-center gap-1.5"
            >
              <span>•</span> {fieldErrors.lastName}
            </p>
          )}
        </div>
      </div>

      {/* Email Input */}
      <div>
        <label
          htmlFor="register-email"
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
            id="register-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isPending}
            placeholder="athlete@gymlogger.com"
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? 'register-email-error' : undefined}
            className={`w-full pl-10 pr-3.5 py-3 rounded-xl bg-surface-raised border text-text-primary text-sm placeholder:text-text-subtle transition-all duration-200 focus-ring min-h-[46px] ${fieldErrors.email
                ? 'border-danger focus-visible:ring-danger bg-danger-bg/20'
                : 'border-border/80 hover:border-border-focus/60'
              }`}
          />
        </div>
        {fieldErrors.email && (
          <p
            id="register-email-error"
            role="alert"
            className="mt-1.5 text-xs text-danger font-medium animate-in fade-in flex items-center gap-1.5"
          >
            <span>•</span> {fieldErrors.email}
          </p>
        )}
      </div>

      {/* Password Input */}
      <div>
        <label
          htmlFor="register-password"
          className="block text-xs uppercase tracking-wider font-semibold text-text-primary mb-2"
        >
          Password
        </label>
        <div className="relative">
          <Lock
            className="w-4 h-4 text-text-subtle absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            id="register-password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isPending}
            placeholder="Create a strong password"
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={
              fieldErrors.password ? 'register-password-error' : undefined
            }
            className={`w-full pl-10 pr-12 py-3 rounded-xl bg-surface-raised border text-text-primary text-sm placeholder:text-text-subtle transition-all duration-200 focus-ring min-h-[46px] ${fieldErrors.password
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
            id="register-password-error"
            role="alert"
            className="mt-1.5 text-xs text-danger font-medium animate-in fade-in flex items-center gap-1.5"
          >
            <span>•</span> {fieldErrors.password}
          </p>
        )}

        {/* Live password requirement feedback */}
        <PasswordRequirements password={password} />
      </div>

      {/* Confirm Password Input */}
      <div>
        <label
          htmlFor="register-confirm-password"
          className="block text-xs uppercase tracking-wider font-semibold text-text-primary mb-2"
        >
          Confirm password
        </label>
        <div className="relative">
          <Lock
            className="w-4 h-4 text-text-subtle absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            id="register-confirm-password"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isPending}
            placeholder="Repeat password"
            aria-invalid={Boolean(fieldErrors.confirmPassword)}
            aria-describedby={
              fieldErrors.confirmPassword
                ? 'register-confirm-password-error'
                : undefined
            }
            className={`w-full pl-10 pr-12 py-3 rounded-xl bg-surface-raised border text-text-primary text-sm placeholder:text-text-subtle transition-all duration-200 focus-ring min-h-[46px] ${fieldErrors.confirmPassword
                ? 'border-danger focus-visible:ring-danger bg-danger-bg/20'
                : 'border-border/80 hover:border-border-focus/60'
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
            className="absolute right-1 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] flex items-center justify-center text-text-subtle hover:text-text-primary rounded-lg focus-ring transition-colors cursor-pointer"
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
            className="mt-1.5 text-xs text-danger font-medium animate-in fade-in flex items-center gap-1.5"
          >
            <span>•</span> {fieldErrors.confirmPassword}
          </p>
        )}
      </div>

      {/* Trust pill */}
      <div className="pt-1 flex items-center gap-2 text-[11px] text-text-subtle">
        <ShieldCheck className="w-3.5 h-3.5 text-accent shrink-0" />
        <span>No credit card required. MIT Open-source forever.</span>
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-emerald-600 text-white font-bold text-sm sm:text-base hover:bg-emerald-500 active:bg-emerald-700 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 focus-ring shadow-sm cursor-pointer group"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              <span>Creating your account...</span>
            </>
          ) : (
            <>
              <span>Create Free Lifetime Account</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
