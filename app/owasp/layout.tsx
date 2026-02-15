import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OWASP Security Resources — Top 10, AI Risks & Best Practices",
  description:
    "Comprehensive OWASP resources: Top 10 2021, Top 10 2025, Top 10 for AI/LLM applications, historical versions, and detailed vulnerability prevention guides with secure code examples.",
  keywords: [
    "OWASP Top 10",
    "OWASP 2025",
    "OWASP AI security",
    "OWASP LLM Top 10",
    "web application security risks",
    "OWASP vulnerability prevention",
    "OWASP security guide",
    "application security framework",
    "OWASP compliance",
    "secure development lifecycle",
  ],
  openGraph: {
    title: "OWASP Security Resources | SecureCodeReviews",
    description:
      "Complete OWASP guides: Top 10 2021, 2025, AI/LLM risks, historical versions, and vulnerability prevention strategies.",
    url: "https://securecodereviews.com/owasp",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OWASP Resources | SecureCodeReviews",
    description:
      "OWASP Top 10 guides, AI security risks, and application security best practices.",
  },
  alternates: {
    canonical: "/owasp",
  },
};

export default function OWASPLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
