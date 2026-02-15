import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Application Security Blog — Latest Cybersecurity Insights & Guides",
  description:
    "Expert application security articles covering OWASP Top 10, API security, DevSecOps, cloud security, AI/ML security, zero trust architecture, and secure coding best practices. Updated weekly.",
  keywords: [
    "application security blog",
    "cybersecurity articles",
    "OWASP Top 10 guide",
    "API security best practices",
    "DevSecOps pipeline",
    "cloud security AWS Azure GCP",
    "secure coding tutorials",
    "web application security",
    "penetration testing guide",
    "security code review",
  ],
  openGraph: {
    title: "Application Security Blog | SecureCodeReviews",
    description:
      "Expert cybersecurity articles on OWASP, API security, DevSecOps, cloud security, and secure coding best practices.",
    url: "https://securecodereviews.com/blog",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AppSec Blog | SecureCodeReviews",
    description:
      "Latest application security insights, OWASP guides, and secure coding tutorials.",
  },
  alternates: {
    canonical: "/blog",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
