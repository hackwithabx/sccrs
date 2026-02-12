import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OWASP Top 10 2025 | SecureCodeReviews",
  description:
    "The latest OWASP Top 10 2025 — comprehensive guide to the most critical web application security risks with updated examples, code fixes, and prevention strategies.",
  openGraph: {
    title: "OWASP Top 10 2025 | SecureCodeReviews",
    description:
      "Complete guide to the OWASP Top 10 2025 web security risks with real-world examples and secure code patterns.",
    url: "https://securecodereviews.com/owasp/top-10-2025",
    type: "article",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
