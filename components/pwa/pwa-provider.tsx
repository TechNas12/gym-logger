'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import Image from 'next/image';
import {
  Download,
  Share,
  PlusSquare,
  X,
  WifiOff,
  CheckCircle2,
  Sparkles,
  Smartphone,
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PwaContextType {
  isInstallable: boolean;
  isStandalone: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  isOnline: boolean;
  promptInstall: () => Promise<boolean>;
  openIOSInstructions: () => void;
}

const PwaContext = createContext<PwaContextType>({
  isInstallable: false,
  isStandalone: false,
  isInstalled: false,
  isIOS: false,
  isOnline: true,
  promptInstall: async () => false,
  openIOSInstructions: () => {},
});

export function usePwa() {
  return useContext(PwaContext);
}

const DISMISS_STORAGE_KEY = 'gymlogger_pwa_dismissed_at';
const DISMISS_DURATION_DAYS = 7;

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [showBanner, setShowBanner] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  // 1. Service Worker Registration
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Register service worker after window load to preserve initial load performance
      const register = () => {
        navigator.serviceWorker
          .register('/sw.js', { scope: '/' })
          .then((reg) => {
            // Periodic update check every hour
            setInterval(() => {
              reg.update();
            }, 60 * 60 * 1000);
          })
          .catch((err) => {
            console.warn('[PWA] Service worker registration error:', err);
          });
      };

      if (document.readyState === 'complete') {
        register();
      } else {
        window.addEventListener('load', register);
        return () => window.removeEventListener('load', register);
      }
    }
  }, []);

  // 2. Online / Offline Status
  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 3. Standalone mode & PWA prompt detection
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const standaloneQuery = window.matchMedia('(display-mode: standalone)');
    const checkStandalone = () => {
      const isStandaloneMode =
        standaloneQuery.matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      setIsStandalone(isStandaloneMode);
      if (isStandaloneMode) {
        setIsInstalled(true);
      }
      return isStandaloneMode;
    };

    const isAppStandalone = checkStandalone();
    const installedStorage = localStorage.getItem('gymlogger_pwa_installed') === 'true';
    if (installedStorage) {
      setIsInstalled(true);
    }

    standaloneQuery.addEventListener?.('change', checkStandalone);

    const ua = window.navigator.userAgent;
    const isAppleDevice = /iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
    setIsIOS(isAppleDevice);

    // Listen for browser install completion
    const handleAppInstalled = () => {
      setIsStandalone(true);
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowBanner(false);
      try {
        localStorage.setItem('gymlogger_pwa_installed', 'true');
      } catch {
        // Storage fallback
      }
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // If already running standalone or installed, do not show banners
    if (isAppStandalone || installedStorage) return;

    // Check if user recently dismissed the banner
    const dismissedAt = localStorage.getItem(DISMISS_STORAGE_KEY);
    const isDismissed =
      dismissedAt &&
      Date.now() - parseInt(dismissedAt, 10) < DISMISS_DURATION_DAYS * 24 * 60 * 60 * 1000;

    // Capture Chrome/Android beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!isDismissed) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // On iOS Safari, if not standalone and not dismissed, show banner after a small delay
    if (isAppleDevice && !isDismissed) {
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 3500);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = async (): Promise<boolean> => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowBanner(false);
        setIsInstalled(true);
        try {
          localStorage.setItem('gymlogger_pwa_installed', 'true');
        } catch {
          // Storage fallback
        }
        return true;
      }
      return false;
    }

    if (isIOS) {
      setShowIOSModal(true);
      return false;
    }

    return false;
  };

  const openIOSInstructions = () => {
    setShowIOSModal(true);
  };

  const dismissBanner = () => {
    setShowBanner(false);
    try {
      localStorage.setItem(DISMISS_STORAGE_KEY, Date.now().toString());
    } catch {
      // Storage unavailable fallback
    }
  };

  return (
    <PwaContext.Provider
      value={{
        isInstallable: !!deferredPrompt || isIOS,
        isStandalone,
        isInstalled: isStandalone || isInstalled,
        isIOS,
        isOnline,
        promptInstall,
        openIOSInstructions,
      }}
    >
      {children}

      {/* Offline Toast Notification Banner */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-amber-950 px-4 py-2 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-md animate-in slide-in-from-top duration-300">
          <WifiOff className="w-4 h-4 shrink-0 text-amber-950" />
          <span>You are offline. Please reconnect to the internet to save and sync your workouts.</span>
        </div>
      )}

      {/* Mobile & Desktop Install Floating Banner */}
      {showBanner && !isStandalone && (
        <aside
          aria-label="Install GymLogger Progressive Web App"
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-surface/95 backdrop-blur-xl border border-border/90 rounded-2xl p-4 shadow-2xl shadow-black/80 animate-in fade-in slide-in-from-bottom-5 duration-300"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-surface-raised border border-border flex items-center justify-center shrink-0 overflow-hidden relative shadow-inner">
              <Image
                src="/icon-192x192.png"
                alt="GymLogger App Icon"
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-text-primary tracking-tight truncate">
                  Install GymLogger
                </h3>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-accent/15 text-accent border border-accent/30 shrink-0">
                  PWA
                </span>
              </div>
              <p className="text-xs text-text-muted mt-0.5 line-clamp-2 leading-relaxed">
                Add GymLogger to your home screen for instant 1-tap access and a full-screen app experience.
              </p>

              <div className="flex items-center gap-2 mt-3">
                <button
                  type="button"
                  onClick={async () => {
                    if (deferredPrompt) {
                      await promptInstall();
                    } else if (isIOS) {
                      setShowIOSModal(true);
                      setShowBanner(false);
                    }
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-accent hover:bg-accent-hover active:bg-accent-active text-accent-foreground text-xs font-bold transition-all shadow-md shadow-accent/20 cursor-pointer focus-ring"
                >
                  <Download className="w-3.5 h-3.5" />
                  Install App
                </button>
                <button
                  type="button"
                  onClick={dismissBanner}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium text-text-subtle hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
                >
                  Not now
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={dismissBanner}
              aria-label="Dismiss banner"
              className="text-text-subtle hover:text-text-primary p-1 rounded-lg hover:bg-surface-hover transition-colors -mr-1 -mt-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </aside>
      )}

      {/* iOS "Add to Home Screen" Step-by-Step Instructions Modal */}
      {showIOSModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
        >
          <div className="w-full max-w-md bg-surface border border-border rounded-3xl p-6 space-y-5 shadow-2xl relative animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setShowIOSModal(false)}
              aria-label="Close dialog"
              className="absolute top-4 right-4 p-2 rounded-xl text-text-subtle hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-surface-raised border border-border flex items-center justify-center overflow-hidden">
                <Image
                  src="/icon-192x192.png"
                  alt="GymLogger"
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-base font-bold text-text-primary">Install on iPhone / iPad</h3>
                <p className="text-xs text-text-muted">Save GymLogger as a native web app</p>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-surface-raised border border-border/80 text-xs">
                <div className="w-7 h-7 rounded-xl bg-accent/15 text-accent flex items-center justify-center font-bold font-mono shrink-0">
                  1
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-text-primary">Tap the Share Button</p>
                  <p className="text-text-muted leading-relaxed">
                    At the bottom of Safari, tap the{' '}
                    <span className="inline-flex items-center gap-1 font-semibold text-text-primary">
                      Share icon <Share className="w-3.5 h-3.5 text-accent inline" />
                    </span>
                    .
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-surface-raised border border-border/80 text-xs">
                <div className="w-7 h-7 rounded-xl bg-accent/15 text-accent flex items-center justify-center font-bold font-mono shrink-0">
                  2
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-text-primary">Select &quot;Add to Home Screen&quot;</p>
                  <p className="text-text-muted leading-relaxed">
                    Scroll down and tap{' '}
                    <span className="inline-flex items-center gap-1 font-semibold text-text-primary">
                      &quot;Add to Home Screen&quot;{' '}
                      <PlusSquare className="w-3.5 h-3.5 text-accent inline" />
                    </span>
                    .
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-surface-raised border border-border/80 text-xs">
                <div className="w-7 h-7 rounded-xl bg-accent/15 text-accent flex items-center justify-center font-bold font-mono shrink-0">
                  3
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-text-primary">Launch from your Home Screen</p>
                  <p className="text-text-muted leading-relaxed">
                    Tap <span className="font-semibold text-accent">&quot;Add&quot;</span> in the top right. GymLogger will now open in full-screen standalone mode!
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 rounded-xl bg-surface-raised hover:bg-surface-hover border border-border text-xs font-semibold text-text-primary transition-colors cursor-pointer"
            >
              Got it, close
            </button>
          </div>
        </div>
      )}
    </PwaContext.Provider>
  );
}
