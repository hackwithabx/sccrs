import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Application Security Services | Secure Code Review, Pen Testing & DevSecOps",
  description:
    "Application security services for startups and enterprises: secure code review, penetration testing, DevSecOps consulting, cloud security assessments, API security testing, AI security audits, and compliance support.",
  keywords: [
    "SecureCodeReviews services",
    "application security services",
    "secure code review service",
    "application security consulting",
    "penetration testing service",
    "penetration testing company",
    "DevSecOps consulting",
    "DevSecOps implementation",
    "cloud security assessment",
    "API security testing",
    "AI security audit",
    "LLM security assessment",
    "OWASP compliance audit",
    "web application security",
    "vulnerability assessment",
    "security consulting firm",
  ],
  openGraph: {
    title: "Application Security Services | SecureCodeReviews",
    description:
      "Secure code review, penetration testing, DevSecOps consulting, cloud security assessments, and AI security audits from SecureCodeReviews.",
    url: "https://securecodereviews.com/services",
    type: "website",
    siteName: "SecureCodeReviews",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "AppSec Services | SecureCodeReviews",
    description:
      "Secure code review, penetration testing, DevSecOps consulting, cloud security assessments, and AI security audits.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "/services",
  },
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "SecureCodeReviews — Application Security Services",
    description: "Application security services including secure code review, penetration testing, DevSecOps consulting, cloud security assessments, API security testing, and AI security audits.",
    url: "https://securecodereviews.com/services",
    provider: { "@type": "Organization", name: "SecureCodeReviews", url: "https://securecodereviews.com" },
    serviceType: ["Secure Code Review", "Penetration Testing", "DevSecOps Consulting", "Cloud Security Assessment", "API Security Testing", "AI / LLM Security Audit"],
    areaServed: "Worldwide",
  };

  const offerCatalogJsonLd = {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    name: "SecureCodeReviews Security Services",
    url: "https://securecodereviews.com/services",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Secure Code Review" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Penetration Testing" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "DevSecOps Consulting" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Cloud Security Assessment" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "API Security Testing" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "AI / LLM Security Audit" } },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(offerCatalogJsonLd) }} />
      {children}
    </>
  );
}
