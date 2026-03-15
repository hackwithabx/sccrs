import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ShieldX Pricing — Choose Your Security Plan | SecureCodeReviews",
  description:
    "Compare ShieldX plans: Free demo with basic scanning, Pro with all 8 modules & CI/CD integration, and Enterprise with dedicated support. Start free, upgrade anytime.",
  openGraph: {
    title: "ShieldX Pricing — Choose Your Security Plan",
    description:
      "Free demo scanning, Pro with full 8-module platform, Enterprise with dedicated support. Protect your code today.",
    url: "https://securecodereviews.com/shieldx/pricing",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
