import type { Metadata } from "next";
import { aiAuditorFaqs } from "@/lib/ai-security-auditor";

export const metadata: Metadata = {
  title: "AI Security Auditor | Prompt Injection & LLM Risk Scanner",
  description:
    "Free AI security auditor for prompt injection, data leakage, unsafe tool use, and insecure LLM output. Audit prompts, outputs, and agent context in your browser.",
  keywords: [
    "AI security",
    "LLM security",
    "AI security auditor",
    "prompt injection",
    "LLM security scanner",
    "agent security review",
    "AI vulnerability scanner",
    "OWASP LLM",
    "AI security audit",
    "data leakage detection",
    "unsafe tool use",
    "AI application security",
  ],
  openGraph: {
    title: "AI Security Auditor | Prompt Injection & LLM Risk Scanner",
    description:
      "Audit prompts, outputs, and agent workflows for prompt injection, unsafe tool access, and sensitive data leakage.",
    url: "https://www.securecodereviews.com/tools/ai-security-auditor",
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
    title: "AI Security Auditor | Prompt Injection & LLM Risk Scanner",
    description:
      "Free browser-based AI security scanner for prompt injection, data leakage, and agent risk review.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "/tools/ai-security-auditor",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function AISecurityAuditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const appJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "AI Security Auditor",
    description:
      "Free browser-based AI security auditor for prompt injection, sensitive data leakage, unsafe tool use, and insecure output handling.",
    url: "https://www.securecodereviews.com/tools/ai-security-auditor",
    applicationCategory: "SecurityApplication",
    operatingSystem: "All",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Prompt injection and jailbreak detection",
      "Sensitive output and secret leakage checks",
      "Unsafe tool access and excessive agency review",
      "Workflow scoring with remediation guidance",
      "Browser-based analysis and PDF reporting",
    ],
    provider: {
      "@type": "Organization",
      name: "SecureCodeReviews",
      url: "https://www.securecodereviews.com",
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: aiAuditorFaqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {children}
    </>
  );
}
