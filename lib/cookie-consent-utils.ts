// Shared cookie consent utilities
// Used by cookie-consent.tsx, google-analytics.tsx, and adsense.tsx

export const CONSENT_KEY = "scr-cookie-consent";
export const PREFERENCES_KEY = "scr-cookie-preferences";
export const CONSENT_EVENT = "scr-consent-change";

export type ConsentLevel = "all" | "essential" | null;

export interface CookiePreferences {
  analytics: boolean;
  marketing: boolean;
}

export function getStoredConsent(): ConsentLevel {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(CONSENT_KEY);
  if (stored === "all" || stored === "essential") return stored;
  return null;
}

export function getStoredPreferences(): CookiePreferences {
  if (typeof window === "undefined") return { analytics: false, marketing: false };
  try {
    const stored = localStorage.getItem(PREFERENCES_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  return { analytics: false, marketing: false };
}

/** Returns true if user has given analytics consent */
export function hasAnalyticsConsent(): boolean {
  const consent = getStoredConsent();
  if (consent === "all") return true;
  if (consent === "essential") {
    return getStoredPreferences().analytics;
  }
  return false; // no consent given yet → don't load
}

/** Returns true if user has given marketing consent */
export function hasMarketingConsent(): boolean {
  const consent = getStoredConsent();
  if (consent === "all") return true;
  if (consent === "essential") {
    return getStoredPreferences().marketing;
  }
  return false;
}

/** Dispatch a custom event so GA/AdSense components re-check consent */
export function emitConsentChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT));
  }
}
