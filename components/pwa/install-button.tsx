'use client';

import React from 'react';
import { Download, CheckCircle2 } from 'lucide-react';
import { usePwa } from './pwa-provider';

interface InstallButtonProps {
  className?: string;
  variant?: 'primary' | 'subtle' | 'outline';
  showWhenInstalled?: boolean;
}

export function InstallAppButton({
  className = '',
  variant = 'subtle',
  showWhenInstalled = false,
}: InstallButtonProps) {
  const { isStandalone, isInstallable, promptInstall, isIOS, openIOSInstructions } = usePwa();

  if (isStandalone) {
    if (!showWhenInstalled) return null;
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent/10 border border-accent/30 text-accent text-xs font-semibold">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>Installed</span>
      </span>
    );
  }

  const handleClick = async () => {
    if (isIOS) {
      openIOSInstructions();
    } else {
      await promptInstall();
    }
  };

  const baseStyles =
    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer focus-ring';

  let variantStyles = '';
  if (variant === 'primary') {
    variantStyles = 'bg-accent hover:bg-accent-hover text-accent-foreground shadow-sm shadow-accent/20';
  } else if (variant === 'outline') {
    variantStyles =
      'bg-transparent hover:bg-surface-hover border border-accent/40 text-accent hover:border-accent';
  } else {
    variantStyles =
      'bg-surface-raised hover:bg-surface-hover border border-border/80 text-text-primary hover:border-border';
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      title="Install GymLogger PWA on your device"
      className={`${baseStyles} ${variantStyles} ${className}`}
    >
      <Download className="w-3.5 h-3.5 text-accent" />
      <span>Install App</span>
    </button>
  );
}
