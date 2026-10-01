'use client';

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface FormErrorBannerProps {
  error: string | null;
  isEmailNotConfirmed?: boolean;
  onResendConfirmation?: () => void;
  isResending?: boolean;
  resendSuccess?: boolean;
}

export function FormErrorBanner({
  error,
  isEmailNotConfirmed,
  onResendConfirmation,
  isResending,
  resendSuccess,
}: FormErrorBannerProps) {
  if (!error) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className="p-3.5 mb-5 rounded-xl bg-danger-bg border border-danger-border text-danger text-xs sm:text-sm flex items-start gap-3 animate-in fade-in duration-150 shadow-sm"
    >
      <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5 text-danger" aria-hidden="true" />
      <div className="flex-1 space-y-2">
        <p className="font-medium leading-relaxed text-red-200">{error}</p>

        {isEmailNotConfirmed && onResendConfirmation && (
          <div className="pt-1">
            {resendSuccess ? (
              <span className="text-xs text-accent font-semibold inline-flex items-center gap-1">
                ✓ Confirmation email sent! Check your inbox.
              </span>
            ) : (
              <button
                type="button"
                onClick={onResendConfirmation}
                disabled={isResending}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-accent-hover underline underline-offset-2 focus-ring rounded-lg px-2.5 py-1.5 bg-surface border border-border cursor-pointer transition-colors active:scale-95"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" aria-hidden="true" />
                    <span>Sending email...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3 h-3" aria-hidden="true" />
                    <span>Resend confirmation link</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
