import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ShieldX Security Scanner | Secrets, Dependencies, APIs, Cloud, CI/CD",
  description:
    "ShieldX by SecureCodeReviews helps teams scan source code, dependencies, APIs, cloud posture, logs, and CI/CD pipelines with paid Pro and Enterprise workspaces plus a separate free demo.",
  keywords: [
    "ShieldX security scanner",
    "application security platform",
    "API security scanner",
    "dependency vulnerability scanner",
    "secrets scanning",
    "cloud security assessment",
    "CI/CD security scanning",
    "DevSecOps platform",
    "enterprise security scanner",
    "ShieldX",
  ],
  alternates: {
    canonical: "/shieldx",
  },
  openGraph: {
    title: "ShieldX Security Scanner | SecureCodeReviews",
    description:
      "Run security scans for code, dependencies, APIs, cloud posture, and CI/CD. Free demo available; Pro and Enterprise unlock the full workspace.",
    url: "https://securecodereviews.com/shieldx",
    siteName: "SecureCodeReviews",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ShieldX security scanner by SecureCodeReviews",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ShieldX Security Scanner | SecureCodeReviews",
    description:
      "Security scanning workspace for secrets, dependencies, APIs, cloud posture, and CI/CD with a free demo path.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
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
    applicationCategory: "SecurityApplication",
    operatingSystem: "Web",
    url: "https://securecodereviews.com/shieldx",
    creator: {
      "@type": "Organization",
      name: "SecureCodeReviews",
      url: "https://securecodereviews.com",
    },
    description:
      "ShieldX is a web-based security scanning platform for secrets, dependencies, APIs, cloud posture, logs, and CI/CD workflows.",
    offers: [
      {
        "@type": "Offer",
        name: "ShieldX Free Demo",
        price: "0",
        priceCurrency: "USD",
      },
      // Pro and Enterprise offers hidden until billing integration is live
    ],
    featureList: [
      "Secrets scanner",
      "Dependency vulnerability scanning",
      "API security scanning",
      "Cloud security assessment",
      "Threat log analysis",
      "CI/CD integration",
      // "Alerts and notifications",  // Hidden — re-enable when alerts are live
      "Security score dashboard",
    ],
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
