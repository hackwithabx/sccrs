import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Security Reports — Download Free AppSec Reports & Whitepapers",
  description:
    "Download free application security reports, whitepapers, and research: OWASP Top 10 analysis, vulnerability trend reports, DevSecOps maturity assessments, and cloud security benchmarks.",
  keywords: [
    "security reports download",
    "application security whitepaper",
    "OWASP report PDF",
    "vulnerability trend report",
    "DevSecOps maturity assessment",
    "cybersecurity research",
    "cloud security benchmark",
    "security audit report",
  ],
  openGraph: {
    title: "Security Reports | SecureCodeReviews",
    description:
      "Free application security reports, whitepapers, and vulnerability trend analysis.",
    url: "https://securecodereviews.com/reports",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Security Reports | SecureCodeReviews",
    description:
      "Download free AppSec reports, OWASP analysis, and security research.",
  },
  alternates: {
    canonical: "/reports",
  },
};

export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Security Reports & Whitepapers",
    description: "Download free application security reports, whitepapers, OWASP Top 10 analysis, and vulnerability trend reports.",
    url: "https://securecodereviews.com/reports",
    isPartOf: { "@type": "WebSite", name: "SecureCodeReviews", url: "https://securecodereviews.com" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  );
}
