import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Security Auditor — Free LLM & AI Application Security Scanner",
  description:
    "Test your AI and LLM applications for prompt injection, data leakage, PII exposure, and OWASP Top 10 for AI vulnerabilities. Generate professional security assessment reports with actionable remediation guidance.",
  keywords: [
    "AI security",
    "LLM security",
    "prompt injection",
    "AI vulnerability scanner",
    "OWASP Top 10 AI",
    "LLM penetration testing",
    "AI security audit",
    "data leakage detection",
    "PII scanner",
    "AI application security",
  ],
  openGraph: {
    title: "AI Security Auditor — Free LLM Security Scanner",
    description:
      "Scan your AI/LLM applications for prompt injection, data leakage, and OWASP AI vulnerabilities. Free enterprise-grade security assessment tool.",
    url: "https://securecodereviews.com/tools/ai-security-auditor",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AI Security Auditor — SecureCodeReviews",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Security Auditor — Free LLM Security Scanner",
    description:
      "Scan AI/LLM apps for prompt injection, data leakage & OWASP AI vulnerabilities.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "/tools/ai-security-auditor",
  },
};

export default function AISecurityAuditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
