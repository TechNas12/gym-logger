'use client';

import React from 'react';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps?: number;
  steps: {
    number: number;
    title: string;
    description?: string;
  }[];
}

export function StepIndicator({
  currentStep,
  totalSteps = 3,
  steps,
}: StepIndicatorProps) {
  return (
    <nav aria-label="Onboarding Progress" className="w-full mb-6 sm:mb-8">
      {/* Mobile view (< 640px): Compact progress bar & step pill */}
      <div className="sm:hidden space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-text-primary">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-accent font-medium">
            {steps[currentStep - 1]?.title}
          </span>
        </div>
        {/* Progress bar line */}
        <div className="h-1.5 w-full bg-surface-raised rounded-full overflow-hidden border border-border/60">
          <div
            className="h-full bg-accent transition-all duration-300 ease-out shadow-[0_0_12px_rgba(34,197,94,0.6)]"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Tablet & Desktop view (>= 640px): Step nodes connected by track */}
      <div className="hidden sm:flex items-center justify-center">
        <ol className="flex items-center w-full max-w-md">
          {steps.map((step, idx) => {
            const isCompleted = currentStep > step.number;
            const isCurrent = currentStep === step.number;

            return (
              <li
                key={step.number}
                className={`flex items-center ${
                  idx !== steps.length - 1 ? 'w-full' : ''
                }`}
              >
                <div className="flex flex-col items-center relative">
                  {/* Step Circle Node */}
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 border ${
                      isCompleted
                        ? 'bg-accent border-accent text-accent-foreground shadow-[0_0_16px_rgba(34,197,94,0.4)]'
                        : isCurrent
                        ? 'bg-surface border-accent text-accent ring-4 ring-accent/20 shadow-[0_0_20px_rgba(34,197,94,0.3)]'
                        : 'bg-surface-raised border-border text-text-subtle'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4 stroke-[3]" aria-hidden="true" />
                    ) : (
                      <span>{step.number}</span>
                    )}
                  </div>

                  {/* Step Label below */}
                  <div className="absolute -bottom-5 w-24 text-center">
                    <span
                      className={`text-[11px] font-semibold tracking-tight transition-colors block truncate ${
                        isCurrent
                          ? 'text-accent'
                          : isCompleted
                          ? 'text-text-primary'
                          : 'text-text-subtle'
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                </div>

                {/* Connecting track between steps */}
                {idx !== steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2.5 transition-colors duration-300 ${
                      currentStep > step.number ? 'bg-accent' : 'bg-border/80'
                    }`}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
