'use client';

import React from 'react';
import { Check, X } from 'lucide-react';
import { checkPasswordRequirements } from '@/lib/validations/auth';

interface PasswordRequirementsProps {
  password: string;
  showAlways?: boolean;
}

export function PasswordRequirements({
  password,
  showAlways = false,
}: PasswordRequirementsProps) {
  const rules = checkPasswordRequirements(password);
  const hasStartedTyping = password.length > 0;

  if (!showAlways && !hasStartedTyping) {
    return null;
  }

  return (
    <div
      className="mt-2.5 p-3 rounded-lg bg-surface-raised border border-border/70 text-xs space-y-1.5"
      aria-label="Password requirements"
    >
      <p className="font-medium text-text-muted mb-1 text-[11px] uppercase tracking-wider">
        Password Requirements
      </p>
      <ul className="space-y-1">
        {rules.map((rule) => (
          <li
            key={rule.id}
            className={`flex items-center gap-2 transition-colors duration-150 ${
              rule.met
                ? 'text-accent'
                : hasStartedTyping
                ? 'text-text-subtle'
                : 'text-text-muted'
            }`}
          >
            {rule.met ? (
              <Check className="w-3.5 h-3.5 flex-shrink-0 text-accent" aria-hidden="true" />
            ) : (
              <X className="w-3.5 h-3.5 flex-shrink-0 text-text-subtle" aria-hidden="true" />
            )}
            <span className={rule.met ? 'font-medium' : ''}>{rule.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
