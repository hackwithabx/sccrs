import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Security Tools — Header Analyzer, CSP Generator, JWT Decoder & More",
  description:
    "Free online application security tools: Security Header Analyzer, CSP Generator, JWT Decoder, Hash Generator, Encoder/Decoder, Password Strength Checker, SQL Injection Tester. No sign-up required.",
  keywords: [
    "security tools",
    "header analyzer",
    "CSP generator",
    "JWT decoder",
    "hash generator",
    "password checker",
    "SQL injection tester",
    "free security tools",
    "online security testing",
  ],
  openGraph: {
    title: "Free Security Tools | SecureCodeReviews",
    description:
      "Free online security tools: Header Analyzer, CSP Generator, JWT Decoder, Hash Generator, and more.",
    url: "https://securecodereviews.com/tools",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Security Tools | SecureCodeReviews",
    description:
      "Security Header Analyzer, CSP Generator, JWT Decoder, and more — free, no sign-up.",
  },
  alternates: {
    canonical: "/tools",
  },
};

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "SecureCodeReviews Free Security Tools",
    description: "Free online security tools: Security Header Analyzer, CSP Generator, JWT Decoder, Hash Generator, Encoder/Decoder, Password Strength Checker, SQL Injection Tester.",
    url: "https://securecodereviews.com/tools",
    applicationCategory: "SecurityApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    provider: { "@type": "Organization", name: "SecureCodeReviews", url: "https://securecodereviews.com" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  );
}
