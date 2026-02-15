import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OWASP Top 10 (2021) — Web Application Security Risks Explained",
  description:
    "Complete guide to the OWASP Top 10 2021 web application security risks: Broken Access Control, Cryptographic Failures, Injection, Insecure Design, Security Misconfiguration, and more with remediation strategies.",
  keywords: [
    "OWASP Top 10 2021",
    "web application security risks",
    "broken access control",
    "cryptographic failures",
    "injection attacks",
    "insecure design",
    "security misconfiguration",
    "OWASP vulnerability guide",
    "application security checklist",
    "OWASP remediation",
  ],
  openGraph: {
    title: "OWASP Top 10 (2021) | SecureCodeReviews",
    description:
      "Complete guide to the OWASP Top 10 2021 security risks with code examples and remediation strategies.",
    url: "https://securecodereviews.com/owasp/top-10",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "OWASP Top 10 2021 | SecureCodeReviews",
    description:
      "Understand and prevent the OWASP Top 10 2021 web application security risks.",
  },
  alternates: {
    canonical: "/owasp/top-10",
  },
};

export default function OWASPTop10Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
