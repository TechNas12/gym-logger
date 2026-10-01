'use client';

import React from 'react';
import { Check } from 'lucide-react';
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
      className="mt-3 p-3.5 rounded-xl bg-surface border border-border/80 text-xs space-y-2 animate-in fade-in duration-150"
      aria-label="Password requirements"
    >
      <div className="flex items-center justify-between text-[11px] uppercase tracking-wider font-semibold text-text-subtle">
        <span>Security Requirements</span>
        <span className="text-[10px] font-mono font-bold text-accent">
          {rules.filter((r) => r.met).length}/{rules.length} completed
        </span>
      </div>
      <ul className="space-y-1.5">
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
            <div
              className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px] transition-colors ${
                rule.met
                  ? 'bg-accent/20 text-accent border border-accent/40 shadow-sm'
                  : 'bg-surface-raised text-text-subtle border border-border'
              }`}
            >
              {rule.met ? (
                <Check className="w-2.5 h-2.5 stroke-[3]" aria-hidden="true" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-text-subtle/50" />
              )}
            </div>
            <span className={`text-xs ${rule.met ? 'font-medium text-text-primary' : ''}`}>
              {rule.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
