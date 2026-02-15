"use client";

import Script from "next/script";
import { useEffect } from "react";

// Get AdSense Publisher ID from environment
const ADSENSE_ID = process.env.NEXT_PUBLIC_ADSENSE_ID;

// AdSense Script - Add once in layout
export function GoogleAdSenseScript() {
  if (!ADSENSE_ID) return null;

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_ID}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}

// Types for different ad formats
type AdFormat = "auto" | "fluid" | "rectangle" | "horizontal" | "vertical";
type AdLayout = "in-article" | "in-feed" | "";

interface AdUnitProps {
  slot: string;
  format?: AdFormat;
  layout?: AdLayout;
  responsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

// Reusable Ad Unit Component
export function AdUnit({
  slot,
  format = "auto",
  layout = "",
  responsive = true,
  className = "",
  style,
}: AdUnitProps) {
  useEffect(() => {
    try {
      if (typeof window !== "undefined" && ADSENSE_ID) {
        // Push ad to be displayed
        ((window as unknown as { adsbygoogle: unknown[] }).adsbygoogle =
          (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error("AdSense error:", err);
    }
  }, []);

  if (!ADSENSE_ID) {
    // Show placeholder in development
    if (process.env.NODE_ENV === "development") {
      return (
        <div
          className={`bg-muted/30 border border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center text-muted-foreground text-sm ${className}`}
          style={{ minHeight: "100px", ...style }}
        >
          [Ad Placeholder - Slot: {slot}]
        </div>
      );
    }
    return null;
  }

  return (
    <ins
      className={`adsbygoogle ${className}`}
      style={{
        display: "block",
        textAlign: "center",
        ...style,
      }}
      data-ad-client={ADSENSE_ID}
      data-ad-slot={slot}
      data-ad-format={format}
      data-ad-layout={layout || undefined}
      data-full-width-responsive={responsive ? "true" : "false"}
    />
  );
}

// Pre-configured ad types for common placements

// In-Article Ad - Best for within blog content
export function InArticleAd({ slot, className = "" }: { slot: string; className?: string }) {
  return (
    <div className={`my-8 ${className}`}>
      <p className="text-xs text-muted-foreground text-center mb-2">Advertisement</p>
      <AdUnit slot={slot} format="fluid" layout="in-article" />
    </div>
  );
}

// Horizontal Banner - Good for header/footer
export function HorizontalBannerAd({ slot, className = "" }: { slot: string; className?: string }) {
  return (
    <div className={`my-6 ${className}`}>
      <AdUnit slot={slot} format="horizontal" style={{ minHeight: "90px" }} />
    </div>
  );
}

// Sidebar Ad - Rectangle format for sidebars
export function SidebarAd({ slot, className = "" }: { slot: string; className?: string }) {
  return (
    <div className={`sticky top-24 ${className}`}>
      <p className="text-xs text-muted-foreground mb-2">Sponsored</p>
      <AdUnit slot={slot} format="rectangle" style={{ minWidth: "300px", minHeight: "250px" }} />
    </div>
  );
}

// Multiplex Ad - Native ad grid
export function MultiplexAd({ slot, className = "" }: { slot: string; className?: string }) {
  return (
    <div className={`my-8 ${className}`}>
      <p className="text-xs text-muted-foreground text-center mb-2">You May Also Like</p>
      <AdUnit slot={slot} format="auto" />
    </div>
  );
}
