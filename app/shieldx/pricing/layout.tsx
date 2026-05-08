import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ShieldX Pricing | Free SAST Scanner, Pro Security Scans & Enterprise Plans",
  description:
    "Compare ShieldX Free, Pro, and Enterprise plans for SAST scanning, dependency checks, secrets detection, SBOM generation, cloud posture review, and CI/CD security workflows.",
  keywords: [
    "ShieldX pricing",
    "ShieldX plans",
    "free SAST scanner pricing",
    "application security platform pricing",
    "SAST scanner subscription",
    "DevSecOps scanner pricing",
    "SBOM generator pricing",
    "CI/CD security platform pricing",
  ],
  alternates: {
    canonical: "/shieldx/pricing",
  },
  openGraph: {
    title: "ShieldX Pricing | Free, Pro & Enterprise Plans",
    description:
      "Compare ShieldX Free, Pro, and Enterprise plans for application security scanning and CI/CD security workflows.",
    url: "https://securecodereviews.com/shieldx/pricing",
    siteName: "SecureCodeReviews",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "ShieldX Pricing | SecureCodeReviews",
    description:
      "Compare ShieldX Free, Pro, and Enterprise subscriptions for security scanning, SBOMs, and CI/CD workflows.",
    images: ["/og-image.png"],
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pricingJsonLd = {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    name: "ShieldX Pricing Plans",
    url: "https://securecodereviews.com/shieldx/pricing",
    itemListElement: [
      {
        "@type": "Offer",
        name: "ShieldX Free Demo",
        price: "0",
        priceCurrency: "USD",
      },
      {
        "@type": "Offer",
        name: "ShieldX Pro",
        price: "79",
        priceCurrency: "USD",
      },
      {
        "@type": "Offer",
        name: "ShieldX Enterprise",
        price: "299",
        priceCurrency: "USD",
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingJsonLd) }} />
      {children}
    </>
  );
}
