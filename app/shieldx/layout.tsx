import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "ShieldX — Free SAST Scanner with 14 Security Modules | Static Code Analysis, Secrets, API, Cloud & CI/CD",
  description:
    "ShieldX is a free online SAST security scanner with 14 built-in modules: AST-based static code analysis, secrets detection, dependency CVE scanning, API security testing, cloud posture assessment, threat log analysis, license compliance, and CI/CD pipeline gates. Try the free demo or upgrade to Pro ($79/mo) for unlimited scans.",
  keywords: [
    "ShieldX",
    "ShieldX security scanner",
    "free SAST scanner",
    "free SAST tool online",
    "static application security testing",
    "SAST code analyzer",
    "AST-based code analysis",
    "secrets scanner",
    "secrets detection tool",
    "dependency vulnerability scanner",
    "CVE scanner",
    "API security scanner",
    "API security testing tool",
    "cloud security scanner",
    "cloud posture assessment",
    "CI/CD security gate",
    "DevSecOps scanner",
    "DevSecOps platform",
    "application security platform",
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
    title: "ShieldX — Free SAST Scanner with 14 Security Modules",
    description:
      "Scan your code for vulnerabilities with 14 security modules: SAST, secrets, dependencies, APIs, cloud posture, CI/CD gates & more. Free demo available — no credit card required.",
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
    title: "ShieldX — Free SAST Scanner | 14 Security Modules",
    description:
      "Free online SAST scanner with secrets detection, dependency CVE scanning, API security, cloud posture, and CI/CD gates. Try it free.",
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
      "ShieldX is a web-based security scanning platform with 14 modules including AST-based SAST analysis, secrets scanning, dependency CVE auditing, API security testing, cloud posture assessment, threat log analysis, license compliance checking, and CI/CD pipeline gates. Free demo available.",
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
