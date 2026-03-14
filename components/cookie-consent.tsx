"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Cookie, X, ChevronDown, ChevronUp } from "lucide-react";

type CookieConsent = "all" | "essential" | null;

interface CookiePreferences {
  analytics: boolean;
  marketing: boolean;
}

const CONSENT_KEY = "scr-cookie-consent";
const PREFERENCES_KEY = "scr-cookie-preferences";

function getStoredConsent(): CookieConsent {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(CONSENT_KEY);
  if (stored === "all" || stored === "essential") return stored;
  return null;
}

function getStoredPreferences(): CookiePreferences {
  if (typeof window === "undefined") return { analytics: false, marketing: false };
  try {
    const stored = localStorage.getItem(PREFERENCES_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { analytics: false, marketing: false };
}

/* eslint-disable @typescript-eslint/no-explicit-any */
const win = () => window as any;

// Disable GA tracking
function revokeAnalyticsConsent() {
  if (typeof window === "undefined") return;
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (gaId) {
    // Tell GA to stop collecting
    win()[`ga-disable-${gaId}`] = true;
  }
}

// Enable GA tracking
function grantAnalyticsConsent() {
  if (typeof window === "undefined") return;
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (gaId) {
    win()[`ga-disable-${gaId}`] = false;
    // Update consent mode if gtag is available
    if (typeof win().gtag === "function") {
      win().gtag("consent", "update", {
        analytics_storage: "granted",
        ad_storage: "granted",
      });
    }
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    analytics: true,
    marketing: true,
  });

  useEffect(() => {
    const consent = getStoredConsent();
    if (!consent) {
      // Small delay so page content loads first
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
    // Apply stored consent
    if (consent === "all") {
      grantAnalyticsConsent();
    } else {
      const prefs = getStoredPreferences();
      if (!prefs.analytics) revokeAnalyticsConsent();
    }
  }, []);

  const acceptAll = useCallback(() => {
    localStorage.setItem(CONSENT_KEY, "all");
    localStorage.setItem(
      PREFERENCES_KEY,
      JSON.stringify({ analytics: true, marketing: true })
    );
    grantAnalyticsConsent();
    setVisible(false);
  }, []);

  const rejectNonEssential = useCallback(() => {
    localStorage.setItem(CONSENT_KEY, "essential");
    localStorage.setItem(
      PREFERENCES_KEY,
      JSON.stringify({ analytics: false, marketing: false })
    );
    revokeAnalyticsConsent();
    setVisible(false);
  }, []);

  const savePreferences = useCallback(() => {
    localStorage.setItem(CONSENT_KEY, preferences.analytics && preferences.marketing ? "all" : "essential");
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
    if (preferences.analytics) {
      grantAnalyticsConsent();
    } else {
      revokeAnalyticsConsent();
    }
    setVisible(false);
  }, [preferences]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] animate-in slide-in-from-bottom-full duration-500">
      {/* Backdrop blur edge */}
      <div className="mx-auto max-w-5xl px-4 pb-4 sm:px-6">
        <div className="rounded-xl border border-border/60 bg-background/95 backdrop-blur-xl shadow-2xl shadow-black/20">
          {/* Main banner */}
          <div className="p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Cookie className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm leading-relaxed text-foreground/90">
                  By clicking &quot;Accept All Cookies&quot;, you agree to the storing of cookies on
                  your device to enhance site navigation, analyze site usage, and assist in our
                  marketing efforts. For more information about how SecureCodeReviews handles your
                  personal information and how we use cookies, please review our{" "}
                  <Link
                    href="/privacy-policy"
                    className="font-medium text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
                  >
                    Privacy Policy
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy-policy#cookies"
                    className="font-medium text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
                  >
                    Cookie Policy
                  </Link>
                  .
                </p>

                {/* Action buttons */}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setShowPreferences(!showPreferences)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground/80 transition-all hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    Cookie Preferences
                    {showPreferences ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <button
                    onClick={rejectNonEssential}
                    className="inline-flex items-center rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground/80 transition-all hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    Reject Non-Essential
                  </button>
                  <button
                    onClick={acceptAll}
                    className="inline-flex items-center rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    Accept All Cookies
                  </button>
                </div>
              </div>

              {/* Close button (acts as reject) */}
              <button
                onClick={rejectNonEssential}
                className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label="Close cookie banner"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Preferences panel */}
            {showPreferences && (
              <div className="mt-5 rounded-lg border border-border/60 bg-muted/30 p-4 animate-in fade-in-0 slide-in-from-top-2 duration-200">
                <h4 className="text-sm font-semibold text-foreground mb-3">
                  Manage Cookie Preferences
                </h4>
                <div className="space-y-3">
                  {/* Essential - always on */}
                  <label className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">Essential Cookies</p>
                      <p className="text-xs text-muted-foreground">
                        Required for the website to function. Cannot be disabled.
                      </p>
                    </div>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked
                        disabled
                        className="sr-only peer"
                      />
                      <div className="h-5 w-9 rounded-full bg-primary/70 cursor-not-allowed" />
                      <div className="absolute top-0.5 left-[18px] h-4 w-4 rounded-full bg-white shadow transition-all" />
                    </div>
                  </label>

                  {/* Analytics */}
                  <label className="flex items-center justify-between gap-3 cursor-pointer">
                    <div>
                      <p className="text-sm font-medium text-foreground">Analytics Cookies</p>
                      <p className="text-xs text-muted-foreground">
                        Help us understand how visitors interact with our website (Google Analytics).
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={preferences.analytics}
                      onClick={() =>
                        setPreferences((p) => ({ ...p, analytics: !p.analytics }))
                      }
                      className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                        preferences.analytics ? "bg-primary" : "bg-muted-foreground/30"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform mt-0.5 ${
                          preferences.analytics ? "translate-x-[18px]" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </label>

                  {/* Marketing */}
                  <label className="flex items-center justify-between gap-3 cursor-pointer">
                    <div>
                      <p className="text-sm font-medium text-foreground">Marketing Cookies</p>
                      <p className="text-xs text-muted-foreground">
                        Used to deliver relevant advertisements and track campaign performance (Google AdSense).
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={preferences.marketing}
                      onClick={() =>
                        setPreferences((p) => ({ ...p, marketing: !p.marketing }))
                      }
                      className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                        preferences.marketing ? "bg-primary" : "bg-muted-foreground/30"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform mt-0.5 ${
                          preferences.marketing ? "translate-x-[18px]" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </label>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={savePreferences}
                    className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
