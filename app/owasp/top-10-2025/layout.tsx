import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OWASP Top 10 2025 | SecureCodeReviews",
  description:
    "The latest OWASP Top 10 2025 — comprehensive guide to the most critical web application security risks with updated examples, code fixes, and prevention strategies.",
  keywords: [
    "OWASP Top 10 2025",
    "web application security risks 2025",
    "OWASP 2025 changes",
    "application security vulnerabilities",
    "OWASP prevention strategies",
    "secure code patterns",
  ],
  openGraph: {
    title: "OWASP Top 10 2025 | SecureCodeReviews",
    description:
      "Complete guide to the OWASP Top 10 2025 web security risks with real-world examples and secure code patterns.",
    url: "https://securecodereviews.com/owasp/top-10-2025",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "OWASP Top 10 2025 | SecureCodeReviews",
    description:
      "Complete guide to the OWASP Top 10 2025 web application security risks.",
  },
  alternates: {
    canonical: "/owasp/top-10-2025",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
