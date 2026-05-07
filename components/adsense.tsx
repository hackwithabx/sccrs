"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { hasMarketingConsent, CONSENT_EVENT } from "@/lib/cookie-consent-utils";

// Your Google AdSense Publisher ID (get from AdSense dashboard)
const ADSENSE_CLIENT_ID =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-9959434931890692";

/**
 * Google AdSense initialization script
 * Always loads so Google can verify the site; ad units remain consent-gated.
 */
export function AdSenseScript() {
  if (!ADSENSE_CLIENT_ID) return null;

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
      crossOrigin="anonymous"
      strategy="beforeInteractive"
    />
  );
}

interface AdUnitProps {
  slot: string; // Ad unit slot ID from AdSense
  format?: "auto" | "rectangle" | "horizontal" | "vertical" | "fluid";
  layout?: "in-article" | "in-feed" | "";
  responsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Individual Ad Unit component
 * Only renders when marketing consent is granted
 */
export function AdUnit({
  slot,
  format = "auto",
  layout = "",
  responsive = true,
  className = "",
  style,
}: AdUnitProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const isAdLoaded = useRef(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    setAllowed(hasMarketingConsent());
    const handler = () => setAllowed(hasMarketingConsent());
    window.addEventListener(CONSENT_EVENT, handler);
    return () => window.removeEventListener(CONSENT_EVENT, handler);
  }, []);

  useEffect(() => {
    if (!ADSENSE_CLIENT_ID || isAdLoaded.current || !allowed) return;

    try {
      // Push ad to Google
      ((window as unknown as { adsbygoogle: unknown[] }).adsbygoogle =
        (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle || []).push({});
      isAdLoaded.current = true;
    } catch (error) {
      console.error("AdSense error:", error);
    }
  }, [allowed]);

  if (!slot || !ADSENSE_CLIENT_ID || !allowed) {
    // Show placeholder in development
    if (process.env.NODE_ENV === "development") {
      return (
        <div
          className={`bg-muted/30 border border-dashed border-muted-foreground/30 rounded-lg p-4 text-center text-muted-foreground text-sm ${className}`}
          style={style}
        >
          Ad Placeholder (slot: {slot})
        </div>
      );
    }
    return null;
  }

  return (
    <div ref={adRef} className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: "block", ...style }}
        data-ad-client={ADSENSE_CLIENT_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-ad-layout={layout || undefined}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
}

/**
 * In-article ad unit - appears between content sections
 */
export function InArticleAd({ slot, className = "" }: { slot: string; className?: string }) {
  return (
    <div className={`my-8 ${className}`}>
      <p className="text-xs text-muted-foreground mb-2 text-center">Advertisement</p>
      <AdUnit slot={slot} format="fluid" layout="in-article" />
    </div>
  );
}

export function HorizontalBannerAd({ slot, className = "" }: { slot: string; className?: string }) {
  return (
    <div className={`my-8 ${className}`}>
      <p className="mb-2 text-center text-xs text-muted-foreground">Advertisement</p>
      <AdUnit slot={slot} format="horizontal" style={{ minHeight: "90px" }} />
    </div>
  );
}

/**
 * Sidebar ad unit - appears in sidebar
 */
export function SidebarAd({ slot, className = "" }: { slot: string; className?: string }) {
  return (
    <div className={`sticky top-24 ${className}`}>
      <p className="text-xs text-muted-foreground mb-2">Sponsored</p>
      <AdUnit slot={slot} format="rectangle" style={{ minWidth: "300px", minHeight: "250px" }} />
    </div>
  );
}

export function MultiplexAd({ slot, className = "" }: { slot: string; className?: string }) {
  return (
    <div className={`my-8 ${className}`}>
      <p className="mb-2 text-center text-xs text-muted-foreground">Recommended resources</p>
      <AdUnit slot={slot} format="auto" />
    </div>
  );
}
