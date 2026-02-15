import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OWASP Top 10 for AI/LLM Applications — Security Risks & Mitigations",
  description:
    "OWASP Top 10 for Large Language Models and AI applications: prompt injection, data poisoning, model theft, insecure output handling, and more. Comprehensive guide to securing AI/ML systems.",
  keywords: [
    "OWASP Top 10 AI",
    "OWASP LLM Top 10",
    "AI security risks",
    "prompt injection prevention",
    "LLM security",
    "AI model security",
    "data poisoning attacks",
    "generative AI security",
    "machine learning security",
    "AI application security",
  ],
  openGraph: {
    title: "OWASP Top 10 for AI/LLM | SecureCodeReviews",
    description:
      "Security risks for AI and LLM applications — prompt injection, data poisoning, model theft, and prevention strategies.",
    url: "https://securecodereviews.com/owasp/top-10-ai",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "OWASP AI/LLM Top 10 | SecureCodeReviews",
    description:
      "Comprehensive guide to securing AI and LLM applications against OWASP Top 10 risks.",
  },
  alternates: {
    canonical: "/owasp/top-10-ai",
  },
};

export default function OWASPAILayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
