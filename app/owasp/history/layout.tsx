import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OWASP Top 10 — Historical Versions (2007-2025) | SecureCodeReviews",
  description:
    "Complete archive of all OWASP Top 10 versions from 2007 to 2025 — see how web application security risks have evolved over nearly two decades.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
