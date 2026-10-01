'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function SignOutButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handleSignOut = async () => {
    setIsPending(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Error signing out:', err);
      setIsPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isPending}
      className="inline-flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-surface-raised border border-border hover:bg-surface-hover text-text-muted hover:text-text-primary text-sm font-medium transition-all duration-150 focus-ring cursor-pointer disabled:opacity-50"
    >
      {isPending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-accent" aria-hidden="true" />
          <span>Signing out...</span>
        </>
      ) : (
        <>
          <LogOut className="w-4 h-4" aria-hidden="true" />
          <span>Sign Out</span>
        </>
      )}
    </button>
  );
}
