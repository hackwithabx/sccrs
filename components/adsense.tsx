"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";

// Your Google AdSense Publisher ID (get from AdSense dashboard)
const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

/**
 * Google AdSense initialization script
 * Add this once in layout.tsx or a top-level component
 */
export function AdSenseScript() {
  if (!ADSENSE_CLIENT_ID) return null;

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}

interface AdUnitProps {
  slot: string; // Ad unit slot ID from AdSense
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
  responsive?: boolean;
  className?: string;
}

/**
 * Individual Ad Unit component
 * Use this wherever you want to display an ad
 */
export function AdUnit({ slot, format = "auto", responsive = true, className = "" }: AdUnitProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const isAdLoaded = useRef(false);

  useEffect(() => {
    if (!ADSENSE_CLIENT_ID || isAdLoaded.current) return;

    try {
      // Push ad to Google
      ((window as unknown as { adsbygoogle: unknown[] }).adsbygoogle =
        (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle || []).push({});
      isAdLoaded.current = true;
    } catch (error) {
      console.error("AdSense error:", error);
    }
  }, []);

  if (!ADSENSE_CLIENT_ID) {
    // Show placeholder in development
    if (process.env.NODE_ENV === "development") {
      return (
        <div className={`bg-muted/30 border border-dashed border-muted-foreground/30 rounded-lg p-4 text-center text-muted-foreground text-sm ${className}`}>
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
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CLIENT_ID}
        data-ad-slot={slot}
        data-ad-format={format}
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
      <AdUnit slot={slot} format="horizontal" />
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
      <AdUnit slot={slot} format="rectangle" />
    </div>
  );
}
