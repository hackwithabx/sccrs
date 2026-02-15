import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vulnerability Dashboard — Real-Time CVE Data & Security Insights",
  description:
    "Interactive vulnerability dashboard with real-time CVE data, severity distributions, CVSS scoring analysis, and trending exploit intelligence. Track the latest application security threats.",
  keywords: [
    "vulnerability dashboard",
    "CVE database",
    "security vulnerabilities",
    "CVSS scoring",
    "exploit intelligence",
    "vulnerability tracking",
    "application security threats",
    "security risk dashboard",
    "zero-day vulnerabilities",
    "vulnerability management",
  ],
  openGraph: {
    title: "Vulnerability Dashboard | SecureCodeReviews",
    description:
      "Real-time CVE data, severity distributions, and trending exploit intelligence in one dashboard.",
    url: "https://securecodereviews.com/vulnerabilities",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vulnerability Dashboard | SecureCodeReviews",
    description:
      "Track real-time CVE data, CVSS scoring, and trending security vulnerabilities.",
  },
  alternates: {
    canonical: "/vulnerabilities",
  },
};

export default function VulnerabilitiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
