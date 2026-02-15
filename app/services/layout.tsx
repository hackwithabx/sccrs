import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Application Security Services — Code Review, Pen Testing, DevSecOps",
  description:
    "Professional application security services: secure code review, penetration testing, DevSecOps consulting, cloud security assessments, API security testing, and compliance audits. Protect your applications from OWASP Top 10 vulnerabilities.",
  keywords: [
    "application security services",
    "secure code review service",
    "penetration testing company",
    "DevSecOps consulting",
    "cloud security assessment",
    "API security testing",
    "OWASP compliance audit",
    "web application security",
    "vulnerability assessment",
    "security consulting firm",
  ],
  openGraph: {
    title: "Application Security Services | SecureCodeReviews",
    description:
      "Professional AppSec services: code review, pen testing, DevSecOps consulting, and cloud security assessments.",
    url: "https://securecodereviews.com/services",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AppSec Services | SecureCodeReviews",
    description:
      "Secure code review, penetration testing, DevSecOps, and cloud security services.",
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
  return children;
}
