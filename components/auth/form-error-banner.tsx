'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';

interface FormErrorBannerProps {
  error: string | null;
  isEmailNotConfirmed?: boolean;
  onResendConfirmation?: () => void;
  isResending?: boolean;
  resendSuccess?: boolean;
}

export function FormErrorBanner({
  error,
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
      </div>
    </div>
  );
}
