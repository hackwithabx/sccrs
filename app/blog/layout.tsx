import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Application Security Blog | OWASP, AI Security, API Security & DevSecOps Guides",
  description:
    "Application security blog from SecureCodeReviews covering OWASP Top 10, AI security, API security, DevSecOps, cloud security, secure coding, and penetration testing insights for engineering teams.",
  keywords: [
    "SecureCodeReviews blog",
    "application security blog",
    "cybersecurity articles",
    "OWASP Top 10 guide",
    "AI security blog",
    "API security best practices",
    "DevSecOps pipeline",
    "cloud security AWS Azure GCP",
    "secure coding tutorials",
    "web application security",
    "penetration testing guide",
    "security code review",
  ],
  openGraph: {
    title: "Application Security Blog | SecureCodeReviews",
    description:
      "OWASP, AI security, API security, DevSecOps, cloud security, and secure coding guides from SecureCodeReviews.",
    url: "https://securecodereviews.com/blog",
    type: "website",
    siteName: "SecureCodeReviews",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "AppSec Blog | SecureCodeReviews",
    description:
      "Latest AppSec insights covering OWASP, AI security, API security, DevSecOps, and secure coding.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "/blog",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Application Security Blog",
    description: "Application security blog covering OWASP, AI security, API security, DevSecOps, cloud security, and secure coding guides from SecureCodeReviews.",
    url: "https://securecodereviews.com/blog",
    isPartOf: { "@type": "WebSite", name: "SecureCodeReviews", url: "https://securecodereviews.com" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  );
}
