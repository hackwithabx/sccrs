import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OWASP Top 10 — Historical Versions (2007-2025) | SecureCodeReviews",
  description:
    "Complete archive of all OWASP Top 10 versions from 2007 to 2025 — see how web application security risks have evolved over nearly two decades.",
  keywords: [
    "OWASP Top 10 history",
    "OWASP versions comparison",
    "OWASP 2007 to 2025",
    "web security evolution",
    "OWASP historical data",
  ],
  openGraph: {
    title: "OWASP Top 10 History (2007-2025) | SecureCodeReviews",
    description:
      "How OWASP Top 10 web security risks have evolved from 2007 to 2025.",
    url: "https://securecodereviews.com/owasp/history",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "OWASP Top 10 History | SecureCodeReviews",
    description:
      "Complete archive of OWASP Top 10 versions from 2007 to 2025.",
  },
  alternates: {
    canonical: "/owasp/history",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
