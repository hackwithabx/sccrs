import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ShieldX Pricing - Choose Your Security Plan | SecureCodeReviews",
  description:
    "Compare ShieldX Free, Pro, and Enterprise plans. Free stays demo-only, Pro unlocks real scans, and Enterprise adds team seats, onboarding, and advanced support.",
  alternates: {
    canonical: "/shieldx/pricing",
  },
  openGraph: {
    title: "ShieldX Pricing - Choose Your Security Plan",
    description:
      "Free demo workspace, Pro live scanning, and Enterprise team onboarding with billing-backed access control.",
    url: "https://securecodereviews.com/shieldx/pricing",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "ShieldX Pricing | SecureCodeReviews",
    description:
      "Compare Free, Pro, and Enterprise ShieldX subscriptions for paid security scanning workspaces.",
    images: ["/og-image.png"],
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
