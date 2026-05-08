import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ShieldX Documentation | SAST Scanner, Secrets, SBOM, API & Cloud Security Guides",
  description:
    "ShieldX documentation for SAST scanning, secrets detection, dependency auditing, SBOM generation, API security testing, cloud posture checks, and CI/CD security integration.",
  keywords: [
    "ShieldX documentation",
    "ShieldX manual",
    "ShieldX docs",
    "security scanner documentation",
    "ShieldX user guide",
    "SAST scanner documentation",
    "secrets scanner guide",
    "dependency scanner guide",
    "SBOM generator guide",
    "cloud security checklist",
    "API security testing",
  ],
  alternates: {
    canonical: "/shieldx/docs",
  },
  openGraph: {
    title: "ShieldX Documentation | SecureCodeReviews",
    description:
      "Documentation for ShieldX modules including SAST, secrets, SBOM, API, cloud, and CI/CD security workflows.",
    url: "https://securecodereviews.com/shieldx/docs",
    siteName: "SecureCodeReviews",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "ShieldX Documentation | SecureCodeReviews",
    description:
      "Learn how to use ShieldX SAST, secrets, dependency, SBOM, API, cloud, and CI/CD security features.",
    images: ["/og-image.png"],
  },
};

export default function ShieldXDocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const docsJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "ShieldX Documentation",
    description: "Documentation for ShieldX SAST scanning, secrets detection, dependency audits, SBOM generation, API security, cloud posture, and CI/CD workflows.",
    url: "https://securecodereviews.com/shieldx/docs",
    isPartOf: { "@type": "WebSite", name: "SecureCodeReviews", url: "https://securecodereviews.com" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(docsJsonLd) }} />
      {children}
    </>
  );
}
