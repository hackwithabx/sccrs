import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "ShieldX — Free SAST Scanner & Application Security Platform | Secrets, SBOM, API, Cloud & CI/CD",
  description:
    "ShieldX is a free SAST scanner and application security platform with AST-based code analysis, secrets detection, dependency vulnerability scanning, SBOM generation, API security testing, cloud posture checks, compliance mapping, and CI/CD security gates.",
  keywords: [
    "ShieldX",
    "ShieldX security scanner",
    "ShieldX SAST",
    "free SAST scanner",
    "free SAST tool online",
    "application security platform",
    "static application security testing",
    "SAST code analyzer",
    "AST-based code analysis",
    "secrets scanner",
    "secrets detection tool",
    "dependency vulnerability scanner",
    "SBOM generator",
    "CVE scanner",
    "API security scanner",
    "API security testing tool",
    "cloud security scanner",
    "cloud posture assessment",
    "CI/CD security gate",
    "DevSecOps scanner",
    "DevSecOps platform",
    "code security scanner online",
    "open source vulnerability scanner",
    "license compliance checker",
    "threat log analyzer",
    "security score dashboard",
    "enterprise security scanner",
    "penetration testing tool",
    "OWASP scanner",
    "secure code review tool",
    "vulnerability scanner free",
    "source code security analysis",
  ],
  alternates: {
    canonical: "/shieldx",
  },
  openGraph: {
    title: "ShieldX — Free SAST Scanner & Application Security Platform",
    description:
      "Free SAST scanner with secrets detection, dependency scanning, SBOM generation, API security checks, cloud posture review, and CI/CD gates.",
    url: "https://securecodereviews.com/shieldx",
    siteName: "SecureCodeReviews",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ShieldX — Free SAST Security Scanner by SecureCodeReviews with 14 scanning modules",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ShieldX — Free SAST Scanner & AppSec Platform",
    description:
      "Free SAST scanner with secrets, dependency, SBOM, API, cloud, and CI/CD security checks. Try ShieldX online.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function ShieldXLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const softwareJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "ShieldX",
    alternateName: "ShieldX Security Scanner",
    applicationCategory: "SecurityApplication",
    applicationSubCategory: "Static Application Security Testing (SAST)",
    operatingSystem: "Web",
    url: "https://securecodereviews.com/shieldx",
    downloadUrl: "https://securecodereviews.com/shieldx",
    screenshot: "https://securecodereviews.com/og-image.png",
    creator: {
      "@type": "Organization",
      name: "SecureCodeReviews",
      url: "https://securecodereviews.com",
    },
    description:
      "ShieldX is a web-based application security platform with SAST analysis, secrets scanning, dependency CVE auditing, SBOM generation, API security testing, cloud posture assessment, license compliance, and CI/CD pipeline gates.",
    offers: [
      {
        "@type": "Offer",
        name: "ShieldX Free Demo",
        price: "0",
        priceCurrency: "USD",
        description:
          "Free demo with basic secrets scanning — no credit card required",
        availability: "https://schema.org/InStock",
      },
      {
        "@type": "Offer",
        name: "ShieldX Pro",
        price: "79",
        priceCurrency: "USD",
        description:
          "All 14 security modules, unlimited scans, downloadable reports",
        availability: "https://schema.org/InStock",
        priceValidUntil: "2026-12-31",
      },
      {
        "@type": "Offer",
        name: "ShieldX Enterprise",
        price: "299",
        priceCurrency: "USD",
        description:
          "Team management, CI/CD pipeline gate, priority support, custom integrations",
        availability: "https://schema.org/InStock",
        priceValidUntil: "2026-12-31",
      },
    ],
    featureList: [
      "AST-based SAST code analysis with dataflow tracing",
      "Secrets & credential scanner",
      "Dependency vulnerability scanning (CVE database)",
      "API security testing & scanning",
      "Cloud security posture assessment",
      "Threat log analysis",
      "License compliance scanner",
      "CI/CD pipeline security gate",
      "Security score dashboard with trends",
      "AI-powered code review",
      "Infrastructure-as-Code scanner",
      "Container & Docker security scanner",
      "Exploit PoC generator",
      "Downloadable PDF/CSV reports",
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "127",
      bestRating: "5",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
      {children}
    </>
  );
}
